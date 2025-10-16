const express = require('express');
const { authenticate, authorizeRoles } = require('../middlewares/auth');
const ctrl = require('../controllers/activity.controller');

const router = express.Router();

// Activity routes (authentication required)
router.get('/', authenticate, ctrl.getActivities);
router.get('/summary', authenticate, ctrl.getActivitySummary);
router.get('/seller', authenticate, authorizeRoles('seller', 'admin'), ctrl.getSellerActivities);
router.post('/log', authenticate, ctrl.logActivity);

module.exports = router;
