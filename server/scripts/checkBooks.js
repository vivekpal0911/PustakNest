const mongoose = require('mongoose');
require('dotenv').config();

const Book = require('../models/Book');

async function checkBooks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');

    // Get all books without any filter
    const allBooks = await Book.find({});
    console.log(`Total books in database: ${allBooks.length}`);

    // Check each book's isActive status
    allBooks.forEach((book, index) => {
      console.log(`\nBook ${index + 1}:`);
      console.log(`  Title: ${book.title}`);
      console.log(`  Author: ${book.author}`);
      console.log(`  isActive: ${book.isActive}`);
      console.log(`  Category: ${book.category}`);
      console.log(`  Price: ${book.price}`);
      console.log(`  Stock: ${book.stock}`);
    });

    // Check books with isActive: true
    const activeBooks = await Book.find({ isActive: true });
    console.log(`\nActive books: ${activeBooks.length}`);

    // Check books with isActive: false
    const inactiveBooks = await Book.find({ isActive: false });
    console.log(`Inactive books: ${inactiveBooks.length}`);

    // Check if any books are missing required fields
    const booksWithMissingFields = allBooks.filter(book => {
      return !book.title || !book.author || !book.isbn || !book.description || 
             !book.price || !book.category || !book.stock || !book.images || !book.coverImage;
    });

    if (booksWithMissingFields.length > 0) {
      console.log(`\nBooks with missing required fields: ${booksWithMissingFields.length}`);
      booksWithMissingFields.forEach(book => {
        console.log(`  ${book.title}: Missing fields:`, {
          title: !book.title,
          author: !book.author,
          isbn: !book.isbn,
          description: !book.description,
          price: !book.price,
          category: !book.category,
          stock: !book.stock,
          images: !book.images,
          coverImage: !book.coverImage
        });
      });
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

checkBooks();
