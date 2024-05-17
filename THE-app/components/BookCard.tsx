import React from 'react';
import { Pressable, Image, View, StyleSheet } from 'react-native';
import { Text } from './Themed';
import { Book } from '@/types/Book';
import { BlurView } from 'expo-blur';
import { Link } from 'expo-router';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const combinedStyles = {
    ...styles.card,
    ...(!book.valid && styles.invalid),
  };

  const CardContent = (
    <View style={combinedStyles}>
      {book.url ? (
        <Image source={{ uri: book.url }} style={styles.image}/>
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text>No Image</Text>
        </View>
      )}
      <BlurView style={styles.overlay} tint="dark" intensity={25} experimentalBlurMethod='dimezisBlurView'>
        <Text style={styles.title}>{book.displayTitle}</Text>
      </BlurView>
    </View>
  )

  return book.valid ? (
    <Link href={{ pathname: "/chapterScreen", params: { bookId: book.id } }} asChild>
      {CardContent}
    </Link>
  ) : (
    <>{CardContent}</>
  );
};

const styles = StyleSheet.create({
  invalid: {
    opacity: 0.3,
  },
  card: {
    flex: 1,
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