const { body, query, param } = require('express-validator');

// Validation for tracking user behavior
const validateTrackBehavior = [
  body('carId')
    .notEmpty()
    .withMessage('Car ID is required')
    .isUUID()
    .withMessage('Car ID must be a valid UUID'),
  
  body('action')
    .notEmpty()
    .withMessage('Action is required')
    .isIn(['view', 'favorite', 'unfavorite', 'share', 'contact', 'purchase'])
    .withMessage('Action must be one of: view, favorite, unfavorite, share, contact, purchase'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

// Validation for user preferences
const validateUserPreferences = [
  body('preferred_brands')
    .optional()
    .isArray()
    .withMessage('Preferred brands must be an array'),
  
  body('preferred_models')
    .optional()
    .isArray()
    .withMessage('Preferred models must be an array'),
  
  body('preferred_price_range')
    .optional()
    .isObject()
    .withMessage('Preferred price range must be an object')
    .custom((value) => {
      if (value && (typeof value.min !== 'number' || typeof value.max !== 'number')) {
        throw new Error('Price range must have min and max numbers');
      }
      if (value && value.min >= value.max) {
        throw new Error('Price range min must be less than max');
      }
      return true;
    }),
  
  body('preferred_years')
    .optional()
    .isObject()
    .withMessage('Preferred years must be an object')
    .custom((value) => {
      if (value && (typeof value.min !== 'number' || typeof value.max !== 'number')) {
        throw new Error('Years range must have min and max numbers');
      }
      if (value && value.min >= value.max) {
        throw new Error('Years range min must be less than max');
      }
      return true;
    }),
  
  body('preferred_fuel_types')
    .optional()
    .isArray()
    .withMessage('Preferred fuel types must be an array')
    .custom((value) => {
      if (value) {
        const validFuelTypes = ['petrol', 'diesel', 'electric', 'hybrid', 'lpg', 'cng'];
        const invalidTypes = value.filter(type => !validFuelTypes.includes(type));
        if (invalidTypes.length > 0) {
          throw new Error(`Invalid fuel types: ${invalidTypes.join(', ')}`);
        }
      }
      return true;
    }),
  
  body('preferred_transmissions')
    .optional()
    .isArray()
    .withMessage('Preferred transmissions must be an array')
    .custom((value) => {
      if (value) {
        const validTransmissions = ['manual', 'automatic', 'semi-automatic'];
        const invalidTypes = value.filter(type => !validTransmissions.includes(type));
        if (invalidTypes.length > 0) {
          throw new Error(`Invalid transmission types: ${invalidTypes.join(', ')}`);
        }
      }
      return true;
    }),
  
  body('preferred_body_types')
    .optional()
    .isArray()
    .withMessage('Preferred body types must be an array')
    .custom((value) => {
      if (value) {
        const validBodyTypes = ['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'pickup', 'van'];
        const invalidTypes = value.filter(type => !validBodyTypes.includes(type));
        if (invalidTypes.length > 0) {
          throw new Error(`Invalid body types: ${invalidTypes.join(', ')}`);
        }
      }
      return true;
    }),
  
  body('preferred_locations')
    .optional()
    .isArray()
    .withMessage('Preferred locations must be an array'),
  
  body('excluded_brands')
    .optional()
    .isArray()
    .withMessage('Excluded brands must be an array'),
  
  body('excluded_models')
    .optional()
    .isArray()
    .withMessage('Excluded models must be an array')
];

// Validation for query parameters
const validateRecommendationQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('algorithm')
    .optional()
    .isIn(['collaborative', 'content_based', 'hybrid', 'trending', 'price_based'])
    .withMessage('Algorithm must be one of: collaborative, content_based, hybrid, trending, price_based'),
  
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),
  
  query('price_range')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Price range must be between 0 and 1'),
  
  query('car_id')
    .optional()
    .isUUID()
    .withMessage('Car ID must be a valid UUID')
];

// Validation for URL parameters
const validateCarId = [
  param('id')
    .isUUID()
    .withMessage('Car ID must be a valid UUID')
];

const validateRecommendationId = [
  param('recommendationId')
    .isUUID()
    .withMessage('Recommendation ID must be a valid UUID')
];

const validateUserId = [
  param('id')
    .isUUID()
    .withMessage('User ID must be a valid UUID')
];

module.exports = {
  validateTrackBehavior,
  validateUserPreferences,
  validateRecommendationQuery,
  validateCarId,
  validateRecommendationId,
  validateUserId
};

