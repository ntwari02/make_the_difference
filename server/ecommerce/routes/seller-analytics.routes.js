const express = require('express');
const { authenticate, authorizeRoles } = require('../../middlewares/auth');
const ctrl = require('../controllers/seller-analytics.controller');

const router = express.Router();

// Seller analytics routes (authentication required)
router.get('/stats', authenticate, authorizeRoles('seller', 'admin'), ctrl.getSellerStats);
router.get('/', authenticate, authorizeRoles('seller', 'admin'), ctrl.getSellerAnalytics);

module.exports = router;
