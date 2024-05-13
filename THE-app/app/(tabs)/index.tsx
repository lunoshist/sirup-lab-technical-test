import React, { useState, useEffect, useMemo } from 'react';
import { FlatList, StyleSheet, Dimensions, TextInput } from 'react-native';
import { Select } from "native-base";
import { Text, View } from '@/components/Themed';
import BookCard from '@/components/BookCard';
import InvalidBookCard from '@/components/InvalidBookCard';
import { Book } from '@/types/Book';

import { gql, useQuery } from '@apollo/client';

const GET_BOOKS = gql`
  query {
    viewer {
      books {
        hits {
          id
          displayTitle
          url
          description
          subjects {
            name
          }
          levels {
            name
          }
          valid
        }
      }
    }
  }
`;

const MIN_ITEM_WIDTH = 150;

function BooksScreen() {
  // FlatList a une propriété pour créer une grille qui permet de remplacer flex-wrap
  // Il faut lui indiquer le nombre de colonne, calculé en fonction de la taille de l'écran
  const [numColumns, setNumColumns] = useState(1);

  const calculateNumColumns = () => {
    const screenWidth = Dimensions.get('window').width - 20;
    const newNumColumns = Math.floor(screenWidth / MIN_ITEM_WIDTH);
    setNumColumns(newNumColumns);
  };

  useEffect(() => {
    calculateNumColumns(); // Calcul initial

    // Responsive (ou changement d'orientation)
    const subscription = Dimensions.addEventListener('change', calculateNumColumns);
    return () => subscription?.remove();
  }, []);

  const { loading, error, data } = useQuery(GET_BOOKS);

  // Avant loading & error return car sinon c'est un hook conditionnel & sa viole les règles de React
  const books: Book[] = useMemo(() => {
    return data?.viewer?.books?.hits || [];
  }, [data]);

  const [filterText, setFilterText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const [subjectOptions, levelOptions] = useMemo(() => {
    const subjectsSet = new Set<string>();
    const levelsSet = new Set<string>();

    if (data?.viewer?.books?.hits) {
      data.viewer.books.hits.forEach((book: Book) => {
        if (book.subjects) {
          book.subjects.forEach((subject) => subjectsSet.add(subject.name));
        }
        if (book.levels) {
          book.levels.forEach((level) => levelsSet.add(level.name));
        }
      });
    }

    const subjectsArray = Array.from(subjectsSet).sort();
    const levelsArray = Array.from(levelsSet).sort();

    return [
      subjectsArray.map(subject => <Select.Item key={subject} label={subject} value={subject} />),
      levelsArray.map(level => <Select.Item key={level} label={level} value={level} />)
    ];
  }, [data]);

  const filteredBooks = useMemo(() => {
    const searchText = filterText.toLowerCase();

    return books
      .filter((book) => {
        const matchesText = !filterText || Object.values(book).some(value =>
          typeof value === 'string' && value.toLowerCase().includes(searchText)
        );
        const matchesSubject = !selectedSubject || book.subjects.some(subject => subject.name === selectedSubject);
        const matchesLevel = !selectedLevel || book.levels.some(level => level.name === selectedLevel);
        return matchesText && matchesSubject && matchesLevel;
      })
      .sort((a, b) => {
        const levelComparison = a.levels[0]?.name.localeCompare(b.levels[0]?.name);
        if (levelComparison !== 0) return levelComparison;
        return a.subjects[0]?.name.localeCompare(b.subjects[0]?.name);
      });
  }, [books, filterText, selectedSubject, selectedLevel]);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error :( {error.message}</Text>;


  return (
    <>
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.input}
          placeholder="Filter by title, description, or subject"
          onChangeText={(text) => setFilterText(text)}
          value={filterText}
        />
        <View style={styles.selectContainer}>
          <Select
            placeholder="Selection une matière"
            selectedValue={selectedSubject}
            flex={1}
            onValueChange={(itemValue: string) => setSelectedSubject(itemValue)}
          >
            <Select.Item label="Select Subject" value="" />
            {subjectOptions}
          </Select>
          <Select
            placeholder="Selectionner le niveau"
            selectedValue={selectedLevel}
            flex={1}
            onValueChange={(itemValue: string) => setSelectedLevel(itemValue)}
          >
            <Select.Item label="Select Level" value="" />
            {levelOptions}
          </Select>
        </View>
      </View>
      {/** Then display a card for each book */}
      <FlatList
        style={styles.container}
        data={filteredBooks}
        renderItem={({ item }) =>
          item.valid ? (
            <BookCard key={item.id.toString()} book={item} />
          ) : (
            <InvalidBookCard key={item.id.toString()} book={item} />
          )
        }
        keyExtractor={item => item.id}
        numColumns={numColumns}
        key={numColumns} // Force FlatList à se re-render quand le nombre de colonnes change
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  filterContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  selectContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  input: {
    flex: 1,
    marginBottom: 10,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
});

export default BooksScreen;
