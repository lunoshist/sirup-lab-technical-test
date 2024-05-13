import React from 'react';
import { Pressable, Image, View, StyleSheet, Dimensions } from 'react-native';
import { Text } from './Themed';
import { Book } from '@/types/Book';
import { BlurView } from 'expo-blur';
import { Link } from 'expo-router';

interface BookCardProps {
  book: Book;
}

const windowWidth = Dimensions.get('window').width;

const BookCard: React.FC<BookCardProps> = ({ book }) => {

  return (
    <Link href={`/chapterScreen?bookId=${book.id}`} asChild>
      <Pressable style={styles.card}>
        {book.url ? (
          <Image source={{ uri: book.url }} style={styles.image}/>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text>No Image</Text>
          </View>
        )}
        <BlurView style={styles.overlay} tint="dark" intensity={25} experimentalBlurMethod='dimezisBlurView'>
          <Text style={styles.title}>{book.displayTitle}</Text>
        </BlurView>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  cardInvalid: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fond semi-transparent
    flex: 1,
    minWidth: 150,
    maxWidth: (windowWidth - 30) / 2,
    marginHorizontal: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  card: {
    flex: 1,
    minWidth: 150,
    maxWidth: (windowWidth - 30) / 2,
    marginHorizontal: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    aspectRatio: 5/7,
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 5/7,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 1)', // Fond semi-transparent
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignItems: 'center',
  },
  title: {
    padding: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default BookCard;