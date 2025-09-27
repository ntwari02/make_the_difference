const { body, query, param } = require('express-validator');

// Validation for visual search
const validateVisualSearch = [
  body('filters')
    .optional()
    .isString()
    .withMessage('Filters must be a JSON string')
    .custom((value) => {
      try {
        JSON.parse(value);
        return true;
      } catch (error) {
        throw new Error('Invalid JSON format for filters');
      }
    })
];

// Validation for voice search
const validateVoiceSearch = [
  body('filters')
    .optional()
    .isString()
    .withMessage('Filters must be a JSON string')
    .custom((value) => {
      try {
        JSON.parse(value);
        return true;
      } catch (error) {
        throw new Error('Invalid JSON format for filters');
      }
    })
];

// Validation for semantic search
const validateSemanticSearch = [
  body('query')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2, max: 500 })
    .withMessage('Search query must be between 2 and 500 characters')
    .trim()
];

// Validation for advanced filters
const validateAdvancedFilters = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('brand')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Brand must be between 1 and 100 characters'),
  
  query('model')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Model must be between 1 and 100 characters'),
  
  query('year_min')
    .optional()
    .isInt({ min: 1900, max: 2030 })
    .withMessage('Year min must be between 1900 and 2030'),
  
  query('year_max')
    .optional()
    .isInt({ min: 1900, max: 2030 })
    .withMessage('Year max must be between 1900 and 2030'),
  
  query('price_min')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price min must be a positive number'),
  
  query('price_max')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price max must be a positive number'),
  
  query('mileage_min')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Mileage min must be a positive integer'),
  
  query('mileage_max')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Mileage max must be a positive integer'),
  
  query('fuel_type')
    .optional()
    .isIn(['petrol', 'diesel', 'electric', 'hybrid', 'lpg', 'cng'])
    .withMessage('Invalid fuel type'),
  
  query('transmission')
    .optional()
    .isIn(['manual', 'automatic', 'semi-automatic'])
    .withMessage('Invalid transmission type'),
  
  query('body_type')
    .optional()
    .isIn(['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'pickup', 'van'])
    .withMessage('Invalid body type'),
  
  query('car_condition')
    .optional()
    .isIn(['new', 'used', 'certified'])
    .withMessage('Invalid car condition'),
  
  query('color')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Color must be between 1 and 50 characters'),
  
  query('location')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Location must be between 1 and 255 characters'),
  
  query('features')
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) {
        return true;
      }
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
          return true;
        } catch (error) {
          throw new Error('Features must be a valid JSON array');
        }
      }
      throw new Error('Features must be an array or JSON string');
    }),
  
  query('sort_by')
    .optional()
    .isIn(['created_at', 'price', 'year', 'mileage', 'avg_rating', 'favorites_count'])
    .withMessage('Invalid sort field'),
  
  query('sort_order')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc'])
    .withMessage('Sort order must be ASC or DESC')
];

// Validation for save search
const validateSaveSearch = [
  body('searchCriteria')
    .notEmpty()
    .withMessage('Search criteria is required')
    .isObject()
    .withMessage('Search criteria must be an object'),
  
  body('searchName')
    .notEmpty()
    .withMessage('Search name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Search name must be between 1 and 100 characters')
    .trim()
];

// Validation for saved search ID
const validateSavedSearchId = [
  param('savedSearchId')
    .isUUID()
    .withMessage('Saved search ID must be a valid UUID')
];

// Validation for search suggestions
const validateSearchSuggestions = [
  query('q')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Query must be between 1 and 100 characters')
    .trim()
];

// Validation for search analytics
const validateSearchAnalytics = [
  query('period')
    .optional()
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Period must be one of: 7d, 30d, 90d, 1y'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000')
];

module.exports = {
  validateVisualSearch,
  validateVoiceSearch,
  validateSemanticSearch,
  validateAdvancedFilters,
  validateSaveSearch,
  validateSavedSearchId,
  validateSearchSuggestions,
  validateSearchAnalytics
};
