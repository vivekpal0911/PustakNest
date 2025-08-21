const mongoose = require('mongoose');
require('dotenv').config();

const Book = require('../models/Book');

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected successfully');
    
    // Check if there are any books
    const bookCount = await Book.countDocuments();
    console.log(`Total books in database: ${bookCount}`);
    
    if (bookCount === 0) {
      console.log('No books found in database. You may need to run the seed script.');
    } else {
      // Get a sample book
      const sampleBook = await Book.findOne();
      console.log('Sample book:', {
        title: sampleBook.title,
        author: sampleBook.author,
        category: sampleBook.category
      });
    }
    
    // Check if the text index exists
    const indexes = await Book.collection.getIndexes();
    console.log('Available indexes:', Object.keys(indexes));
    
  } catch (error) {
    console.error('Database check error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkDatabase();
