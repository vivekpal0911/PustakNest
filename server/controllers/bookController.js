const Book = require('../models/Book');

// Get all books with filtering and pagination
const getAllBooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      author,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured,
      bestseller
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (category) filter.category = category;
    if (author) filter.author = { $regex: author, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (featured === 'true') filter.featured = true;
    if (bestseller === 'true') filter.bestseller = true;
    
    // Text search using regex instead of text index to avoid index issues
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const books = await Book.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-reviews');

    const total = await Book.countDocuments(filter);

    res.json({
      books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all books error:', error);
    res.status(500).json({
      message: 'Error fetching books',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get book by ID
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const book = await Book.findById(id)
      .populate('reviews.user', 'name avatar')
      .populate('reviews', '-user.password');

    if (!book || !book.isActive) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    res.json({
      book
    });
  } catch (error) {
    console.error('Get book by ID error:', error);
    res.status(500).json({
      message: 'Error fetching book',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Create new book (Admin only)
const createBook = async (req, res) => {
  try {
    const bookData = req.body;
    
    // Check if ISBN already exists
    const existingBook = await Book.findOne({ isbn: bookData.isbn });
    if (existingBook) {
      return res.status(400).json({
        message: 'Book with this ISBN already exists'
      });
    }

    const book = new Book(bookData);
    await book.save();

    res.status(201).json({
      message: 'Book created successfully',
      book
    });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({
      message: 'Error creating book',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Update book (Admin only)
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if ISBN is being updated and if it already exists
    if (updateData.isbn) {
      const existingBook = await Book.findOne({ 
        isbn: updateData.isbn, 
        _id: { $ne: id } 
      });
      if (existingBook) {
        return res.status(400).json({
          message: 'Book with this ISBN already exists'
        });
      }
    }

    const book = await Book.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    res.json({
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({
      message: 'Error updating book',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Delete book (Admin only)
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    res.json({
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      message: 'Error deleting book',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Add review to book
const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    const book = await Book.findById(id);
    if (!book || !book.isActive) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    // Check if user already reviewed this book
    const existingReview = book.reviews.find(
      review => review.user.toString() === userId.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        message: 'You have already reviewed this book'
      });
    }

    // Add review
    book.reviews.push({
      user: userId,
      rating,
      comment
    });

    // Update rating
    await book.updateRating();

    res.json({
      message: 'Review added successfully',
      book
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      message: 'Error adding review',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Update review
const updateReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    const book = await Book.findById(id);
    if (!book || !book.isActive) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    // Find review
    const review = book.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      });
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'You can only update your own reviews'
      });
    }

    // Update review
    review.rating = rating;
    review.comment = comment;
    review.date = new Date();

    await book.save();
    await book.updateRating();

    res.json({
      message: 'Review updated successfully',
      book
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      message: 'Error updating review',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Delete review
const deleteReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    const userId = req.user._id;

    const book = await Book.findById(id);
    if (!book || !book.isActive) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    // Find review
    const review = book.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      });
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'You can only delete your own reviews'
      });
    }

    // Remove review
    review.remove();
    await book.save();
    await book.updateRating();

    res.json({
      message: 'Review deleted successfully',
      book
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      message: 'Error deleting review',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get book categories
const getCategories = async (req, res) => {
  try {
    const categories = await Book.distinct('category');
    res.json({
      categories: categories.sort()
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      message: 'Error fetching categories',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get featured books
const getFeaturedBooks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    const books = await Book.find({ 
      featured: true, 
      isActive: true 
    })
    .limit(limit)
    .select('-reviews');

    res.json({
      books
    });
  } catch (error) {
    console.error('Get featured books error:', error);
    res.status(500).json({
      message: 'Error fetching featured books',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get bestseller books
const getBestsellerBooks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    const books = await Book.find({ 
      bestseller: true, 
      isActive: true 
    })
    .sort({ 'rating.average': -1 })
    .limit(limit)
    .select('-reviews');

    res.json({
      books
    });
  } catch (error) {
    console.error('Get bestseller books error:', error);
    res.status(500).json({
      message: 'Error fetching bestseller books',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Admin: Get book analytics
const getBookAnalytics = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments({ isActive: true });
    const totalReviews = await Book.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalReviews: { $sum: { $size: '$reviews' } } } }
    ]);

    const categoryStats = await Book.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const avgRating = await Book.aggregate([
      { $match: { isActive: true, 'rating.count': { $gt: 0 } } },
      { $group: { _id: null, avgRating: { $avg: '$rating.average' } } }
    ]);

    res.json({
      totalBooks,
      totalReviews: totalReviews[0]?.totalReviews || 0,
      avgRating: avgRating[0]?.avgRating || 0,
      categoryStats
    });
  } catch (error) {
    console.error('Get book analytics error:', error);
    res.status(500).json({
      message: 'Error fetching book analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  addReview,
  updateReview,
  deleteReview,
  getCategories,
  getFeaturedBooks,
  getBestsellerBooks,
  getBookAnalytics
};
