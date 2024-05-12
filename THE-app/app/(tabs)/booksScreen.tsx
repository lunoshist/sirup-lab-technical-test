import React, { useState, useEffect, useMemo } from 'react';
import { FlatList, StyleSheet, Dimensions, TextInput, SafeAreaView } from 'react-native';
import { Select } from "native-base";
import { Text, View } from '@/components/Themed';
import BookCard from '@/components/BookCard';
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
    return data?.viewer?.books?.hits?.filter((book: Book) => book.valid) || [];
  }, [data]);

  const [filterText, setFilterText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  let subjectOptions: JSX.Element[] = [];
  let levelOptions: JSX.Element[] = [];

  if (!loading && !error && data) {
    // Extract subjects and levels from the data
    const subjectsSet = new Set<string>();
    const levelsSet = new Set<string>();

    data.viewer.books.hits.forEach((book: Book) => {
      book.subjects.forEach((subject) => subjectsSet.add(subject.name));
      book.levels.forEach((level) => levelsSet.add(level.name));
    });

    // Convert sets to arrays and sort them
    const subjectsArray = Array.from(subjectsSet).sort();
    const levelsArray = Array.from(levelsSet).sort();

    // Create options for subjects
    subjectOptions = subjectsArray.map((subject) => (
      <Select.Item key={subject} label={subject} value={subject} />
    ));

    // Create options for levels
    levelOptions = levelsArray.map((level) => (
      <Select.Item key={level} label={level} value={level} />
    ));
  }

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error :( {error.message}</Text>;

  // FILTER
  let filteredBooks = books;
  if (filterText) {
    const searchText = filterText.toLowerCase();
    filteredBooks = filteredBooks.filter((book: Book) =>
      Object.values(book).some((value: any) =>
        typeof value === 'string' && value.toLowerCase().includes(searchText)
      )
    );
  }
  if (selectedSubject) {
    filteredBooks = filteredBooks.filter((book: Book) =>
      book.subjects.some((subject) => subject.name === selectedSubject)
    );
  }
  if (selectedLevel) {
    filteredBooks = filteredBooks.filter((book: Book) =>
      book.levels.some((level) => level.name === selectedLevel)
    );
  }

  // SORT
  filteredBooks.sort((a: Book, b: Book) => {
    const levelComparison = a.levels[0].name.localeCompare(b.levels[0].name);
    if (levelComparison !== 0) return levelComparison;
    return a.subjects[0].name.localeCompare(b.subjects[0].name);
  });


  return (
    <SafeAreaView>
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
      <View />
      <FlatList
        style={styles.container}
        data={books}
        renderItem={({ item }) => <BookCard book={item} />}
        keyExtractor={item => item.id}
        numColumns={numColumns}
        key={numColumns} // Force FlatList à se re-render quand le nombre de colonnes change
      />
    </SafeAreaView>
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
