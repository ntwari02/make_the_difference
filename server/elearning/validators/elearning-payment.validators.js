const { body, query, param } = require('express-validator');

// Validation for course purchase
const validateCoursePurchase = [
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .isUUID()
    .withMessage('Course ID must be a valid UUID'),
  
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

// Validation for subscription purchase
const validateSubscriptionPurchase = [
  body('subscriptionType')
    .notEmpty()
    .withMessage('Subscription type is required')
    .isIn(['basic', 'premium', 'enterprise'])
    .withMessage('Invalid subscription type'),
  
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
  
  body('billingCycle')
    .optional()
    .isIn(['monthly', 'yearly'])
    .withMessage('Billing cycle must be monthly or yearly'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

// Validation for certificate purchase
const validateCertificatePurchase = [
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .isUUID()
    .withMessage('Course ID must be a valid UUID'),
  
  body('certificateType')
    .optional()
    .isIn(['completion', 'achievement', 'professional', 'custom'])
    .withMessage('Invalid certificate type'),
  
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

// Validation for online class purchase
const validateOnlineClassPurchase = [
  body('classId')
    .notEmpty()
    .withMessage('Class ID is required')
    .isUUID()
    .withMessage('Class ID must be a valid UUID'),
  
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

// Validation for refund
const validateRefund = [
  param('transactionId')
    .isUUID()
    .withMessage('Transaction ID must be a valid UUID'),
  
  body('reason')
    .optional()
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Reason must be between 1 and 500 characters')
];

// Validation for transaction history
const validateTransactionHistory = [
  query('type')
    .optional()
    .isIn(['course_purchase', 'subscription_purchase', 'certificate_purchase', 'class_purchase'])
    .withMessage('Invalid transaction type'),
  
  query('status')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'cancelled', 'refunded'])
    .withMessage('Invalid transaction status'),
  
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

module.exports = {
  validateCoursePurchase,
  validateSubscriptionPurchase,
  validateCertificatePurchase,
  validateOnlineClassPurchase,
  validateRefund,
  validateTransactionHistory
};

