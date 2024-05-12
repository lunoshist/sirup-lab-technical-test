import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import BookCard from '@/components/BookCard';
import { Book } from '@/types/Bookook';

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

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error :( {error.message}</Text>;

  const books: Book[] = data.viewer.books.hits.filter((book: Book) => book.valid);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {books.map((book: Book) => (
        <BookCard key={book.id} book={book} />
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
});

export default BooksScreen;
