import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput } from 'react-native';
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

function BooksScreen() {
  const { loading, error, data } = useQuery(GET_BOOKS);
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

  const books: Book[] = data.viewer.books.hits.filter((book: Book) => book.valid);

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
    <ScrollView contentContainerStyle={styles.container}>
      {/** Display filters inputs */}
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
      {filteredBooks.map((book: Book) => (
        book.valid ? (
          <BookCard key={book.id.toString()} book={book} />
        ) : (
          <InvalidBookCard key={book.id.toString()} book={book} />
        )
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
