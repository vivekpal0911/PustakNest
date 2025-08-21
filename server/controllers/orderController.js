const Order = require('../models/Order');
const Book = require('../models/Book');

// Create new order
const createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, shippingAddress, billingAddress, notes } = req.body;
    const userId = req.user._id;

    // Validate items and check stock
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const book = await Book.findById(item.book);
      if (!book || !book.isActive) {
        return res.status(400).json({
          message: `Book ${item.book} not found or unavailable`
        });
      }

      if (book.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${book.title}. Available: ${book.stock}`
        });
      }

      const itemPrice = book.discount > 0 
        ? book.price - (book.price * book.discount / 100)
        : book.price;

      orderItems.push({
        book: book._id,
        quantity: item.quantity,
        price: book.price,
        discount: book.discount
      });

      subtotal += itemPrice * item.quantity;
    }

    // Calculate totals
    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      subtotal,
      tax,
      shipping,
      total,
      paymentMethod,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      notes
    });

    await order.save();

    // Update book stock
    for (const item of items) {
      await Book.findByIdAndUpdate(item.book, {
        $inc: { stock: -item.quantity }
      });
    }

    // Populate book details for response
    await order.populate('items.book', 'title author coverImage');

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      message: 'Error creating order',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: userId })
      .populate('items.book', 'title author coverImage price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ user: userId });

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      message: 'Error fetching orders',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(id)
      .populate('items.book', 'title author coverImage price discount')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. You can only view your own orders.'
      });
    }

    res.json({
      order
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      message: 'Error fetching order',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    if (order.user.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. You can only cancel your own orders.'
      });
    }

    // Check if order can be cancelled
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        message: 'Order cannot be cancelled in its current status'
      });
    }

    // Update order status
    await order.updateStatus('cancelled', { reason });

    // Restore book stock
    for (const item of order.items) {
      await Book.findByIdAndUpdate(item.book, {
        $inc: { stock: item.quantity }
      });
    }

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      message: 'Error cancelling order',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Admin: Get all orders
const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status, paymentStatus, startDate, endDate } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('items.book', 'title author coverImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      message: 'Error fetching orders',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Admin: Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, estimatedDelivery } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    // Update status
    await order.updateStatus(status, { estimatedDelivery });

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      message: 'Error updating order status',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Admin: Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentId } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { paymentStatus, paymentId },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    res.json({
      message: 'Payment status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      message: 'Error updating payment status',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get order analytics
const getOrderAnalytics = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Total orders
    const totalOrders = await Order.countDocuments({});
    
    // Orders this month
    const monthlyOrders = await Order.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Orders this year
    const yearlyOrders = await Order.countDocuments({
      createdAt: { $gte: startOfYear }
    });

    // Total revenue
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Monthly revenue
    const monthlyRevenue = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: 'paid',
          createdAt: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Status distribution
    const statusDistribution = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Payment method distribution
    const paymentMethodDistribution = await Order.aggregate([
      { $group: { _id: '$paymentMethod', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent orders
    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalOrders,
      monthlyOrders,
      yearlyOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      statusDistribution,
      paymentMethodDistribution,
      recentOrders
    });
  } catch (error) {
    console.error('Get order analytics error:', error);
    res.status(500).json({
      message: 'Error fetching order analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get sales report
const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    let groupFormat;
    switch (groupBy) {
      case 'day':
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case 'month':
        groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        break;
      case 'year':
        groupFormat = { $dateToString: { format: "%Y", date: "$createdAt" } };
        break;
      default:
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }

    const salesData = await Order.aggregate([
      { $match: { ...dateFilter, paymentStatus: 'paid' } },
      {
        $group: {
          _id: groupFormat,
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
          items: { $sum: { $reduce: { input: '$items', initialValue: 0, in: { $add: ['$$value', '$$this.quantity'] } } } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      salesData,
      groupBy
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({
      message: 'Error fetching sales report',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderAnalytics,
  getSalesReport
};
