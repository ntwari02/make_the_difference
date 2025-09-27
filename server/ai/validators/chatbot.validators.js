const { body, query, param } = require('express-validator');

// Validation for chat message
const validateMessage = [
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
    .trim(),
  
  body('sessionId')
    .optional()
    .isUUID()
    .withMessage('Session ID must be a valid UUID')
];

// Validation for session history
const validateSessionHistory = [
  param('sessionId')
    .isUUID()
    .withMessage('Session ID must be a valid UUID'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Validation for training data
const validateTrainingData = [
  body('trainingData')
    .notEmpty()
    .withMessage('Training data is required')
    .isArray({ min: 1 })
    .withMessage('Training data must be a non-empty array'),
  
  body('trainingData.*.text')
    .notEmpty()
    .withMessage('Each training item must have text')
    .isLength({ min: 1, max: 500 })
    .withMessage('Training text must be between 1 and 500 characters'),
  
  body('trainingData.*.intent')
    .notEmpty()
    .withMessage('Each training item must have an intent')
    .isIn(['search_car', 'price_inquiry', 'feature_inquiry', 'financing_inquiry', 'support_request', 'greeting', 'general_inquiry'])
    .withMessage('Invalid intent type'),
  
  body('trainingData.*.entities')
    .optional()
    .isObject()
    .withMessage('Entities must be an object')
];

module.exports = {
  validateMessage,
  validateSessionHistory,
  validateTrainingData
};
