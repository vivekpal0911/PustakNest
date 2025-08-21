const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validateBook, validateReview } = require('../middleware/validation');

// Public routes
router.get('/', optionalAuth, bookController.getAllBooks);
router.get('/categories', bookController.getCategories);
router.get('/featured', bookController.getFeaturedBooks);
router.get('/bestsellers', bookController.getBestsellerBooks);
router.get('/:id', optionalAuth, bookController.getBookById);

// Protected routes (authenticated users)
router.post('/:id/reviews', authenticateToken, validateReview, bookController.addReview);
router.put('/:id/reviews/:reviewId', authenticateToken, validateReview, bookController.updateReview);
router.delete('/:id/reviews/:reviewId', authenticateToken, bookController.deleteReview);

// Admin routes
router.post('/', authenticateToken, requireAdmin, validateBook, bookController.createBook);
router.put('/:id', authenticateToken, requireAdmin, validateBook, bookController.updateBook);
router.delete('/:id', authenticateToken, requireAdmin, bookController.deleteBook);
router.get('/admin/analytics', authenticateToken, requireAdmin, bookController.getBookAnalytics);

module.exports = router;
