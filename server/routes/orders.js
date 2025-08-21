const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validation');

// User routes (authenticated users)
router.post('/', authenticateToken, validateOrder, orderController.createOrder);
router.get('/', authenticateToken, orderController.getUserOrders);
router.get('/:id', authenticateToken, orderController.getOrderById);
router.put('/:id/cancel', authenticateToken, orderController.cancelOrder);

// Admin routes
router.get('/admin/all', authenticateToken, requireAdmin, orderController.getAllOrders);
router.put('/admin/:id/status', authenticateToken, requireAdmin, orderController.updateOrderStatus);
router.put('/admin/:id/payment', authenticateToken, requireAdmin, orderController.updatePaymentStatus);
router.get('/admin/analytics', authenticateToken, requireAdmin, orderController.getOrderAnalytics);
router.get('/admin/sales-report', authenticateToken, requireAdmin, orderController.getSalesReport);

module.exports = router;
