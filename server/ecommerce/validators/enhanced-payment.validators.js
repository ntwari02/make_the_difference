const { body, query, param } = require('express-validator');

// Validation for enhanced car purchase
const validateEnhancedCarPurchase = [
  body('carId')
    .notEmpty()
    .withMessage('Car ID is required')
    .isUUID()
    .withMessage('Car ID must be a valid UUID'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code'),
  
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['stripe', 'paypal', 'apple_pay', 'google_pay', 'crypto', 'bnpl', 'financing', 'bank_transfer', 'mobile_money'])
    .withMessage('Invalid payment method'),
  
  body('paymentMethodId')
    .optional()
    .isUUID()
    .withMessage('Payment method ID must be a valid UUID'),
  
  body('tradeInValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Trade-in value must be a non-negative number'),
  
  body('downPayment')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Down payment must be a non-negative number'),
  
  body('financingOption')
    .optional()
    .isObject()
    .withMessage('Financing option must be an object'),
  
  body('insuranceOption')
    .optional()
    .isObject()
    .withMessage('Insurance option must be an object'),
  
  body('warrantyOption')
    .optional()
    .isObject()
    .withMessage('Warranty option must be an object'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

// Validation for car financing
const validateCarFinancing = [
  body('carId')
    .notEmpty()
    .withMessage('Car ID is required')
    .isUUID()
    .withMessage('Car ID must be a valid UUID'),
  
  body('financingOptionId')
    .notEmpty()
    .withMessage('Financing option ID is required')
    .isUUID()
    .withMessage('Financing option ID must be a valid UUID'),
  
  body('downPayment')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Down payment must be a non-negative number'),
  
  body('tradeInValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Trade-in value must be a non-negative number'),
  
  body('loanAmount')
    .notEmpty()
    .withMessage('Loan amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Loan amount must be a positive number'),
  
  body('termMonths')
    .notEmpty()
    .withMessage('Term months is required')
    .isInt({ min: 12, max: 84 })
    .withMessage('Term months must be between 12 and 84'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

// Validation for trade-in
const validateTradeIn = [
  body('carId')
    .notEmpty()
    .withMessage('Car ID is required')
    .isUUID()
    .withMessage('Car ID must be a valid UUID'),
  
  body('tradeInCarData')
    .notEmpty()
    .withMessage('Trade-in car data is required')
    .isObject()
    .withMessage('Trade-in car data must be an object'),
  
  body('tradeInCarData.brand')
    .notEmpty()
    .withMessage('Trade-in car brand is required')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Brand must be between 1 and 100 characters'),
  
  body('tradeInCarData.model')
    .notEmpty()
    .withMessage('Trade-in car model is required')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Model must be between 1 and 100 characters'),
  
  body('tradeInCarData.year')
    .notEmpty()
    .withMessage('Trade-in car year is required')
    .isInt({ min: 1900, max: 2030 })
    .withMessage('Year must be between 1900 and 2030'),
  
  body('tradeInCarData.mileage')
    .notEmpty()
    .withMessage('Trade-in car mileage is required')
    .isInt({ min: 0 })
    .withMessage('Mileage must be a non-negative integer'),
  
  body('tradeInCarData.condition')
    .notEmpty()
    .withMessage('Trade-in car condition is required')
    .isIn(['excellent', 'good', 'fair', 'poor'])
    .withMessage('Condition must be excellent, good, fair, or poor'),
  
  body('tradeInValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Trade-in value must be a non-negative number'),
  
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['stripe', 'paypal', 'apple_pay', 'google_pay', 'crypto', 'bnpl', 'financing', 'bank_transfer', 'mobile_money'])
    .withMessage('Invalid payment method'),
  
  body('paymentMethodId')
    .optional()
    .isUUID()
    .withMessage('Payment method ID must be a valid UUID'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

// Validation for trade-in calculation
const validateTradeInCalculation = [
  body('brand')
    .notEmpty()
    .withMessage('Brand is required')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Brand must be between 1 and 100 characters'),
  
  body('model')
    .notEmpty()
    .withMessage('Model is required')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Model must be between 1 and 100 characters'),
  
  body('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 1900, max: 2030 })
    .withMessage('Year must be between 1900 and 2030'),
  
  body('mileage')
    .notEmpty()
    .withMessage('Mileage is required')
    .isInt({ min: 0 })
    .withMessage('Mileage must be a non-negative integer'),
  
  body('condition')
    .notEmpty()
    .withMessage('Condition is required')
    .isIn(['excellent', 'good', 'fair', 'poor'])
    .withMessage('Condition must be excellent, good, fair, or poor'),
  
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array')
];

// Validation for car insurance
const validateCarInsurance = [
  body('carId')
    .notEmpty()
    .withMessage('Car ID is required')
    .isUUID()
    .withMessage('Car ID must be a valid UUID'),
  
  body('insuranceOption')
    .notEmpty()
    .withMessage('Insurance option is required')
    .isObject()
    .withMessage('Insurance option must be an object'),
  
  body('coverageType')
    .notEmpty()
    .withMessage('Coverage type is required')
    .isIn(['liability', 'full', 'comprehensive'])
    .withMessage('Coverage type must be liability, full, or comprehensive'),
  
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code'),
  
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['stripe', 'paypal', 'apple_pay', 'google_pay', 'crypto', 'bnpl', 'financing', 'bank_transfer', 'mobile_money'])
    .withMessage('Invalid payment method'),
  
  body('paymentMethodId')
    .optional()
    .isUUID()
    .withMessage('Payment method ID must be a valid UUID'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

// Validation for insurance quote
const validateInsuranceQuote = [
  body('carId')
    .notEmpty()
    .withMessage('Car ID is required')
    .isUUID()
    .withMessage('Car ID must be a valid UUID'),
  
  body('coverageType')
    .notEmpty()
    .withMessage('Coverage type is required')
    .isIn(['liability', 'full', 'comprehensive'])
    .withMessage('Coverage type must be liability, full, or comprehensive'),
  
  body('userAge')
    .optional()
    .isInt({ min: 16, max: 100 })
    .withMessage('User age must be between 16 and 100'),
  
  body('userLocation')
    .optional()
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('User location must be between 1 and 255 characters'),
  
  body('drivingHistory')
    .optional()
    .isIn(['clean', 'minor_violations', 'major_violations', 'accidents'])
    .withMessage('Invalid driving history')
];

module.exports = {
  validateEnhancedCarPurchase,
  validateCarFinancing,
  validateTradeIn,
  validateTradeInCalculation,
  validateCarInsurance,
  validateInsuranceQuote
};

