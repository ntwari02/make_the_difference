const { body, query, param } = require('express-validator');

// Validation for process payment
const validateProcessPayment = [
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
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

// Validation for financing options
const validateFinancingOptions = [
  query('carPrice')
    .notEmpty()
    .withMessage('Car price is required')
    .isFloat({ min: 0.01 })
    .withMessage('Car price must be a positive number')
];

// Validation for pre-approval
const validatePreApproval = [
  body('carPrice')
    .notEmpty()
    .withMessage('Car price is required')
    .isFloat({ min: 0.01 })
    .withMessage('Car price must be a positive number'),
  
  body('financingOptionId')
    .notEmpty()
    .withMessage('Financing option ID is required')
    .isUUID()
    .withMessage('Financing option ID must be a valid UUID')
];

// Validation for escrow payment
const validateEscrowPayment = [
  body('sellerId')
    .notEmpty()
    .withMessage('Seller ID is required')
    .isUUID()
    .withMessage('Seller ID must be a valid UUID'),
  
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
    .withMessage('Invalid payment method')
];

// Validation for release escrow
const validateReleaseEscrow = [
  param('escrowId')
    .isUUID()
    .withMessage('Escrow ID must be a valid UUID'),
  
  body('confirmationData')
    .optional()
    .isObject()
    .withMessage('Confirmation data must be an object')
];

// Validation for trade-in value
const validateTradeInValue = [
  body('brand')
    .notEmpty()
    .withMessage('Brand is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Brand must be between 1 and 100 characters'),
  
  body('model')
    .notEmpty()
    .withMessage('Model is required')
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
    .isIn(['new', 'used', 'certified'])
    .withMessage('Condition must be new, used, or certified'),
  
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array')
];

// Validation for insurance quote
const validateInsuranceQuote = [
  body('brand')
    .notEmpty()
    .withMessage('Brand is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Brand must be between 1 and 100 characters'),
  
  body('model')
    .notEmpty()
    .withMessage('Model is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Model must be between 1 and 100 characters'),
  
  body('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 1900, max: 2030 })
    .withMessage('Year must be between 1900 and 2030'),
  
  body('value')
    .notEmpty()
    .withMessage('Value is required')
    .isFloat({ min: 0.01 })
    .withMessage('Value must be a positive number'),
  
  body('userAge')
    .optional()
    .isInt({ min: 16, max: 100 })
    .withMessage('User age must be between 16 and 100'),
  
  body('userLocation')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('User location must be between 1 and 255 characters'),
  
  body('drivingHistory')
    .optional()
    .isIn(['clean', 'minor_violations', 'major_violations', 'accidents'])
    .withMessage('Invalid driving history')
];

// Validation for add payment method
const validateAddPaymentMethod = [
  body('type')
    .notEmpty()
    .withMessage('Payment method type is required')
    .isIn(['stripe', 'paypal', 'apple_pay', 'google_pay', 'crypto', 'bnpl', 'financing', 'bank_transfer', 'mobile_money'])
    .withMessage('Invalid payment method type'),
  
  body('provider')
    .notEmpty()
    .withMessage('Provider is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Provider must be between 1 and 100 characters'),
  
  body('accountDetails')
    .notEmpty()
    .withMessage('Account details are required')
    .isObject()
    .withMessage('Account details must be an object'),
  
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean')
];

// Validation for transaction history
const validateTransactionHistory = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('type')
    .optional()
    .isIn(['course_purchase', 'car_purchase', 'scholarship_application', 'visa_application', 'ad_spend', 'refund', 'withdrawal'])
    .withMessage('Invalid transaction type'),
  
  query('status')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'cancelled', 'refunded'])
    .withMessage('Invalid transaction status')
];

module.exports = {
  validateProcessPayment,
  validateFinancingOptions,
  validatePreApproval,
  validateEscrowPayment,
  validateReleaseEscrow,
  validateTradeInValue,
  validateInsuranceQuote,
  validateAddPaymentMethod,
  validateTransactionHistory
};
