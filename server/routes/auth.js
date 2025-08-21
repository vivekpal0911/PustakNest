const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  validateRegistration,
  validateLogin,
  validateProfileUpdate
} = require('../middleware/validation');

// Public routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validateProfileUpdate, authController.updateProfile);
router.put('/change-password', authenticateToken, authController.changePassword);
router.get('/wishlist', authenticateToken, authController.getWishlist);
router.post('/wishlist/:bookId', authenticateToken, authController.toggleWishlist);

// Admin routes
router.get('/users', authenticateToken, requireAdmin, authController.getAllUsers);
router.put('/users/:userId/role', authenticateToken, requireAdmin, authController.updateUserRole);

module.exports = router;
