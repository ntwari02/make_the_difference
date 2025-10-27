const express = require('express');
const router = express.Router();
const ordersService = require('../services/orders.service');
const { authenticateToken, authorizeRoles } = require('../../middleware/auth.middleware');

// Apply rate limiting (add this if you have a rate limiter)
// const { ordersRateLimit } = require('../../middleware/rate-limit.middleware');
// router.use(ordersRateLimit);

// ==================== ORDERS CRUD ROUTES ====================

// Get orders for seller (with filters and pagination)
router.get('/seller/:sellerId', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const sellerId = req.user.role === 'admin' ? req.params.sellerId : req.user.id;
    const filters = {
      status: req.query.status,
      payment_status: req.query.payment_status,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit
    };

    const result = await ordersService.getOrdersBySeller(sellerId, filters);
    
    res.json({
      success: true,
      data: result.orders,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get single order by ID
router.get('/:orderId', authenticateToken, authorizeRoles(['seller', 'buyer', 'admin']), async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await ordersService.getOrderById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify the user has access (either buyer or seller)
    if (order.buyer_id !== req.user.id && order.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Create new order
router.post('/', authenticateToken, authorizeRoles(['buyer', 'admin']), async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      buyer_id: req.user.role === 'admin' ? req.body.buyer_id : req.user.id
    };

    const order = await ordersService.createOrder(orderData);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update order status
router.patch('/:orderId/status', authenticateToken, authorizeRoles(['seller', 'buyer', 'admin']), async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { status, notes } = req.body;

    // Get the order to verify access
    const order = await ordersService.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Determine who is making the change
    let changedByType = 'system';
    if (order.seller_id === req.user.id) {
      changedByType = 'seller';
    } else if (order.buyer_id === req.user.id) {
      changedByType = 'buyer';
    } else if (req.user.role === 'admin') {
      changedByType = 'admin';
    }

    const updatedOrder = await ordersService.updateOrderStatus(orderId, status, req.user.id, changedByType, notes);
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update payment status
router.patch('/:orderId/payment', authenticateToken, authorizeRoles(['seller', 'buyer', 'admin']), async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { payment_status, transaction_id, payment_date } = req.body;

    // Get the order to verify access
    const order = await ordersService.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const updatedOrder = await ordersService.updatePaymentStatus(orderId, payment_status, transaction_id, payment_date);
    
    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Add seller notes
router.patch('/:orderId/notes', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { notes } = req.body;

    // Get the order to verify access
    const order = await ordersService.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify seller owns this order
    if (order.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedOrder = await ordersService.addSellerNotes(orderId, notes);
    
    res.json({
      success: true,
      message: 'Seller notes updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating seller notes:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get order statistics for seller
router.get('/seller/:sellerId/stats', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const sellerId = req.user.role === 'admin' ? req.params.sellerId : req.user.id;
    const stats = await ordersService.getOrderStats(sellerId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting order stats:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

