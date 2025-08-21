const mongoose = require('mongoose');
require('dotenv').config();

const Book = require('../models/Book');

const sampleBooks = [
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '9780743273565',
    description: 'A story of the fabulous wealth and glamour of the Jazz Age, and a tale of the American Dream gone wrong.',
    price: 12.99,
    originalPrice: 15.99,
    discount: 19,
    category: 'Fiction',
    genre: ['Classic', 'Romance', 'Drama'],
    language: 'English',
    pages: 180,
    publisher: 'Scribner',
    publishDate: '1925-04-10',
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400'
    ],
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    rating: {
      average: 4.5,
      count: 120
    },
    featured: true,
    bestseller: true,
    isActive: true
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '9780446310789',
    description: 'A powerful story of racial injustice and loss of innocence in the American South.',
    price: 14.99,
    originalPrice: 17.99,
    discount: 17,
    category: 'Fiction',
    genre: ['Classic', 'Drama', 'Historical'],
    language: 'English',
    pages: 281,
    publisher: 'Grand Central Publishing',
    publishDate: '1960-07-11',
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400',
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'
    ],
    coverImage: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400',
    rating: {
      average: 4.8,
      count: 95
    },
    featured: true,
    bestseller: true,
    isActive: true
  },
  {
    title: '1984',
    author: 'George Orwell',
    isbn: '9780451524935',
    description: 'A dystopian novel about totalitarianism and surveillance society.',
    price: 13.99,
    originalPrice: 16.99,
    discount: 18,
    category: 'Science Fiction',
    genre: ['Dystopian', 'Political', 'Thriller'],
    language: 'English',
    pages: 328,
    publisher: 'Signet Classic',
    publishDate: '1949-06-08',
    stock: 60,
    images: [
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'
    ],
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
    rating: {
      average: 4.6,
      count: 88
    },
    featured: true,
    bestseller: false,
    isActive: true
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    isbn: '9780141439518',
    description: 'A classic romance novel about the relationship between Elizabeth Bennet and Mr. Darcy.',
    price: 11.99,
    originalPrice: 14.99,
    discount: 20,
    category: 'Romance',
    genre: ['Classic', 'Romance', 'Historical'],
    language: 'English',
    pages: 480,
    publisher: 'Penguin Classics',
    publishDate: '1813-01-28',
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400'
    ],
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    rating: {
      average: 4.7,
      count: 156
    },
    featured: false,
    bestseller: true,
    isActive: true
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    isbn: '9780547928241',
    description: 'A fantasy novel about Bilbo Baggins, a hobbit who embarks on an adventure.',
    price: 16.99,
    originalPrice: 19.99,
    discount: 15,
    category: 'Fantasy',
    genre: ['Fantasy', 'Adventure', 'Epic'],
    language: 'English',
    pages: 366,
    publisher: 'Houghton Mifflin Harcourt',
    publishDate: '1937-09-21',
    stock: 55,
    images: [
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'
    ],
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
    rating: {
      average: 4.9,
      count: 203
    },
    featured: true,
    bestseller: true,
    isActive: true
  }
];

async function addSampleBooks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');

    // Clear existing books
    await Book.deleteMany({});
    console.log('Cleared existing books');

    // Add sample books
    const books = await Book.insertMany(sampleBooks);
    console.log(`Added ${books.length} sample books`);

    // Show added books
    books.forEach((book, index) => {
      console.log(`\nBook ${index + 1}:`);
      console.log(`  Title: ${book.title}`);
      console.log(`  Author: ${book.author}`);
      console.log(`  Category: ${book.category}`);
      console.log(`  Price: $${book.price}`);
      console.log(`  Stock: ${book.stock}`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    console.log('\n✅ Sample books added successfully!');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

addSampleBooks();
