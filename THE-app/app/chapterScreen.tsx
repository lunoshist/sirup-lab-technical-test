import React, { useState, useEffect, useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import ChapterCard from '@/components/ChapterCard';
import { Chapter } from '@/types/Chapter';

import { gql, useQuery } from '@apollo/client';

const GET_CHAPTER = gql`
query chapters($bookId: Int) {
    viewer {
      chapters(bookIds: [$bookId]) {
        hits {
          id
          title
          url
          valid
        }
      }
    }
  }
`;

const MIN_ITEM_WIDTH = 150;

export default function ModalScreen() {
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

  const params = useLocalSearchParams();
  const bookId = parseInt(params.bookId);
    
  const { loading, error, data } = useQuery(GET_CHAPTER,
    {
      variables: { bookId },
    });

  const chapters: Chapter[] = useMemo(() => {
    return data?.viewer?.chapters?.hits || [];
  }, [data]);
  
  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error :( {error.message}</Text>;

  return (
    <FlatList
        style={styles.container}
        data={chapters}
        renderItem={({ item }) => <ChapterCard chapter={item} />}
        keyExtractor={item => item.id.toString()}
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
