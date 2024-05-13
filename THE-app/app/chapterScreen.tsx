import React from 'react';
import { useRoute } from '@react-navigation/native';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import ChapterCard from '@/components/ChapterCard';
import InvalidChapterCard from '@/components/InvalidChapterCard';
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

export default function ModalScreen() {
  const route = useRoute();
  let bookId  = route.params.bookId as { bookId: number };
  bookId = Number(bookId);
    
  const { loading, error, data } = useQuery(GET_CHAPTER,
    {
      variables: { bookId },
    });

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error :( {error.message}</Text>;

  const chapter: Chapter[] = data.viewer.chapters.hits;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {chapter.map((chapter: Chapter) => (
        chapter.valid ? (
          <ChapterCard key={chapter.id.toString()} chapter={chapter} />
        ) : (
          <InvalidChapterCard key={chapter.id.toString()} chapter={chapter} />
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
