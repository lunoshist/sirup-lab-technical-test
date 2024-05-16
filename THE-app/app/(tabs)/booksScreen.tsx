import React, { useState, useEffect, useMemo } from 'react';
import { FlatList, StyleSheet, Dimensions } from 'react-native';
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

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error :( {error.message}</Text>;

  return (
    <FlatList
      style={styles.container}
      data={books}
      renderItem={({ item }) => <BookCard book={item} />}
      keyExtractor={item => item.id}
      numColumns={numColumns}
      key={numColumns} // Force FlatList à se re-render quand le nombre de colonnes change
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
});

export default BooksScreen;
