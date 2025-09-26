const { body, query, param } = require('express-validator');

// Validation for chat message
const validateChatMessage = [
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

// Validation for recommendations
const validateRecommendations = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

// Validation for content type
const validateContentType = [
  query('contentType')
    .optional()
    .isIn(['homepage', 'search_results', 'product_page', 'email'])
    .withMessage('Content type must be one of: homepage, search_results, product_page, email')
];

// Validation for behavior prediction
const validateBehaviorPrediction = [
  body('behaviorType')
    .notEmpty()
    .withMessage('Behavior type is required')
    .isIn(['purchase', 'browse', 'contact', 'favorite', 'review'])
    .withMessage('Invalid behavior type')
];

// Validation for analytics period
const validateAnalyticsPeriod = [
  query('period')
    .optional()
    .isIn(['7d', '30d', '90d'])
    .withMessage('Period must be one of: 7d, 30d, 90d')
];

// Validation for trends forecast
const validateTrendsForecast = [
  query('period')
    .optional()
    .isIn(['7d', '30d', '90d'])
    .withMessage('Period must be one of: 7d, 30d, 90d'),
  
  query('forecastDays')
    .optional()
    .isInt({ min: 7, max: 365 })
    .withMessage('Forecast days must be between 7 and 365')
];

// Validation for behavior analysis
const validateBehaviorAnalysis = [
  query('period')
    .optional()
    .isIn(['7d', '30d', '90d'])
    .withMessage('Period must be one of: 7d, 30d, 90d')
];

// Validation for anomaly detection
const validateAnomalyDetection = [
  query('period')
    .optional()
    .isIn(['7d', '30d'])
    .withMessage('Period must be one of: 7d, 30d')
];

module.exports = {
  validateChatMessage,
  validateRecommendations,
  validateContentType,
  validateBehaviorPrediction,
  validateAnalyticsPeriod,
  validateTrendsForecast,
  validateBehaviorAnalysis,
  validateAnomalyDetection
};
