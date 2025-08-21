const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');

// Get user's wishlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      wishlist: user.wishlist || []
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Error fetching wishlist' });
  }
});

// Toggle book in wishlist (add/remove)
router.post('/:bookId', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const bookIndex = user.wishlist.indexOf(bookId);
    let isInWishlist = false;

    if (bookIndex === -1) {
      // Add book to wishlist
      user.wishlist.push(bookId);
      isInWishlist = true;
    } else {
      // Remove book from wishlist
      user.wishlist.splice(bookIndex, 1);
      isInWishlist = false;
    }

    await user.save();

    res.json({
      message: isInWishlist ? 'Book added to wishlist' : 'Book removed from wishlist',
      isInWishlist,
      wishlistCount: user.wishlist.length
    });
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({ message: 'Error updating wishlist' });
  }
});

// Check if book is in wishlist
router.get('/:bookId/check', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isInWishlist = user.wishlist.includes(bookId);

    res.json({
      isInWishlist,
      wishlistCount: user.wishlist.length
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ message: 'Error checking wishlist' });
  }
});

// Remove book from wishlist
router.delete('/:bookId', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const bookIndex = user.wishlist.indexOf(bookId);
    
    if (bookIndex === -1) {
      return res.status(404).json({ message: 'Book not found in wishlist' });
    }

    user.wishlist.splice(bookIndex, 1);
    await user.save();

    res.json({
      message: 'Book removed from wishlist',
      wishlistCount: user.wishlist.length
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Error removing from wishlist' });
  }
});

// Clear entire wishlist
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.wishlist = [];
    await user.save();

    res.json({
      message: 'Wishlist cleared',
      wishlistCount: 0
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ message: 'Error clearing wishlist' });
  }
});

module.exports = router;


