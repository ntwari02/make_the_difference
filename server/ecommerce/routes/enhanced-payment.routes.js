const express = require('express');
const { validationResult } = require('express-validator');
const { authenticate, authorizeRoles } = require('../../middlewares/auth');
const ctrl = require('../controllers/enhanced-payment.controller');
const v = require('../validators/enhanced-payment.validators');

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return next();
};

// All enhanced e-commerce payment routes require authentication
router.use(authenticate);

// Enhanced car purchase
router.post('/car/purchase', v.validateEnhancedCarPurchase, handleValidation, ctrl.processEnhancedCarPurchase);
router.get('/car/:carId/pricing', ctrl.getEnhancedCarPricing);
router.get('/car/:carId/summary', ctrl.getPaymentSummary);

// Car financing
router.post('/car/financing', v.validateCarFinancing, handleValidation, ctrl.processCarFinancing);
router.get('/car/:carId/financing-options', ctrl.getCarFinancingOptions);

// Trade-in
router.post('/car/trade-in', v.validateTradeIn, handleValidation, ctrl.processTradeIn);
router.post('/car/trade-in/calculate', v.validateTradeInCalculation, handleValidation, ctrl.calculateTradeInValue);

// Car insurance
router.post('/car/insurance', v.validateCarInsurance, handleValidation, ctrl.processCarInsurance);
router.get('/car/:carId/insurance-options', ctrl.getCarInsuranceOptions);
router.post('/car/insurance/quote', v.validateInsuranceQuote, handleValidation, ctrl.getInsuranceQuote);

// Warranty
router.get('/car/:carId/warranty-options', ctrl.getCarWarrantyOptions);

module.exports = router;

