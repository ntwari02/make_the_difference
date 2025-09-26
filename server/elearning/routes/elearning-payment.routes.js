const express = require('express');
const { validationResult } = require('express-validator');
const { authenticate, authorizeRoles } = require('../../middlewares/auth');
const ctrl = require('../controllers/elearning-payment.controller');
const v = require('../validators/elearning-payment.validators');

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return next();
};

// All e-learning payment routes require authentication
router.use(authenticate);

// Course purchase payments
router.post('/course/purchase', v.validateCoursePurchase, handleValidation, ctrl.processCoursePurchase);
router.get('/course/:courseId/pricing', ctrl.getCoursePricing);
router.post('/course/:transactionId/refund', v.validateRefund, handleValidation, ctrl.refundCoursePurchase);

// Subscription payments
router.post('/subscription/purchase', v.validateSubscriptionPurchase, handleValidation, ctrl.processSubscriptionPayment);
router.get('/subscription/plans', ctrl.getSubscriptionPlans);

// Certificate payments
router.post('/certificate/purchase', v.validateCertificatePurchase, handleValidation, ctrl.processCertificatePayment);

// Online class payments
router.post('/class/purchase', v.validateOnlineClassPurchase, handleValidation, ctrl.processOnlineClassPayment);

// Payment methods and history
router.get('/methods', ctrl.getPaymentMethods);
router.get('/transactions', v.validateTransactionHistory, handleValidation, ctrl.getTransactionHistory);

module.exports = router;

