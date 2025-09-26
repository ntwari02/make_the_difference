const express = require('express');
const { validationResult } = require('express-validator');
const { authenticate, authorizeRoles } = require('../../middlewares/auth');
const ctrl = require('../controllers/payment.controller');
const v = require('../validators/payment.validators');

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return next();
};

// All payment routes require authentication
router.use(authenticate);

// Payment processing
router.post('/process', v.validateProcessPayment, handleValidation, ctrl.processPayment);

// Financing options
router.get('/financing-options', v.validateFinancingOptions, handleValidation, ctrl.getFinancingOptions);
router.post('/pre-approval', v.validatePreApproval, handleValidation, ctrl.getPreApproval);

// Escrow payments
router.post('/escrow', v.validateEscrowPayment, handleValidation, ctrl.createEscrowPayment);
router.patch('/escrow/:escrowId/release', v.validateReleaseEscrow, handleValidation, ctrl.releaseEscrowPayment);

// Trade-in and insurance
router.post('/trade-in-value', v.validateTradeInValue, handleValidation, ctrl.calculateTradeInValue);
router.post('/insurance-quote', v.validateInsuranceQuote, handleValidation, ctrl.getInsuranceQuote);

// Payment methods management
router.get('/methods', ctrl.getPaymentMethods);
router.post('/methods', v.validateAddPaymentMethod, handleValidation, ctrl.addPaymentMethod);

// Transaction history
router.get('/transactions', v.validateTransactionHistory, handleValidation, ctrl.getTransactionHistory);

module.exports = router;
