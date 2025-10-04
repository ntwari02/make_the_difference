const { body, param, query } = require('express-validator');

// Custom URL validation function
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const validateDealer = {
  create: [
    body('business_name')
      .isLength({ min: 2, max: 255 })
      .withMessage('Business name must be between 2 and 255 characters'),
    
    body('business_type')
      .isIn(['dealership', 'private_seller', 'auction_house', 'rental_company'])
      .withMessage('Invalid business type'),
    
    body('license_number')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('License number must be less than 100 characters'),
    
    body('description')
      .optional()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
    
    body('address')
      .isLength({ min: 5, max: 500 })
      .withMessage('Address must be between 5 and 500 characters'),
    
    body('city')
      .isLength({ min: 2, max: 100 })
      .withMessage('City must be between 2 and 100 characters'),
    
    body('state')
      .isLength({ min: 2, max: 100 })
      .withMessage('State must be between 2 and 100 characters'),
    
    body('country')
      .isLength({ min: 2, max: 100 })
      .withMessage('Country must be between 2 and 100 characters'),
    
    body('postal_code')
      .optional()
      .isLength({ min: 3, max: 20 })
      .withMessage('Postal code must be between 3 and 20 characters'),
    
    body('phone')
      .isLength({ min: 10, max: 20 })
      .withMessage('Phone number must be between 10 and 20 characters'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    
    body('website')
      .optional()
      .isURL()
      .withMessage('Valid website URL is required'),
    
    body('logo')
      .optional()
      .isURL()
      .withMessage('Valid logo URL is required'),
    
    body('images')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined) return true;
        return Array.isArray(value);
      })
      .withMessage('Images must be an array'),
    
    body('business_hours')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined) return true;
        return typeof value === 'object' && !Array.isArray(value);
      })
      .withMessage('Business hours must be an object'),
    
    body('services')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined) return true;
        return Array.isArray(value);
      })
      .withMessage('Services must be an array')
  ],

  update: [
    param('dealerId')
      .isUUID()
      .withMessage('Valid dealer ID is required'),
    
    body('business_name')
      .optional()
      .isLength({ min: 2, max: 255 })
      .withMessage('Business name must be between 2 and 255 characters'),
    
    body('business_type')
      .optional()
      .isIn(['dealership', 'private_seller', 'auction_house', 'rental_company'])
      .withMessage('Invalid business type'),
    
    body('license_number')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('License number must be less than 100 characters'),
    
    body('description')
      .optional()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
    
    body('address')
      .optional()
      .isLength({ min: 5, max: 500 })
      .withMessage('Address must be between 5 and 500 characters'),
    
    body('city')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('City must be between 2 and 100 characters'),
    
    body('state')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('State must be between 2 and 100 characters'),
    
    body('country')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Country must be between 2 and 100 characters'),
    
    body('postal_code')
      .optional()
      .isLength({ min: 3, max: 20 })
      .withMessage('Postal code must be between 3 and 20 characters'),
    
    body('phone')
      .optional()
      .isLength({ min: 10, max: 20 })
      .withMessage('Phone number must be between 10 and 20 characters'),
    
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    
    body('website')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        return isValidUrl(value);
      })
      .withMessage('Valid website URL is required'),
    
    body('logo')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        return isValidUrl(value);
      })
      .withMessage('Valid logo URL is required'),
    
    body('images')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined) return true;
        return Array.isArray(value);
      })
      .withMessage('Images must be an array'),
    
    body('business_hours')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined) return true;
        return typeof value === 'object' && !Array.isArray(value);
      })
      .withMessage('Business hours must be an object'),
    
    body('services')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined) return true;
        return Array.isArray(value);
      })
      .withMessage('Services must be an array')
  ]
};

const validateVehicle = {
  create: [
    body('make')
      .isLength({ min: 1, max: 50 })
      .withMessage('Make must be between 1 and 50 characters'),
    
    body('model')
      .isLength({ min: 1, max: 50 })
      .withMessage('Model must be between 1 and 50 characters'),
    
    body('year')
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage('Valid year is required'),
    
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Valid price is required'),
    
    body('mileage')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Mileage must be a positive integer'),
    
    body('fuel_type')
      .optional()
      .isIn(['gasoline', 'diesel', 'electric', 'hybrid', 'lpg', 'cng'])
      .withMessage('Invalid fuel type'),
    
    body('transmission')
      .optional()
      .isIn(['manual', 'automatic', 'semi_automatic', 'cvt'])
      .withMessage('Invalid transmission type'),
    
    body('body_type')
      .optional()
      .isIn(['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'pickup', 'van'])
      .withMessage('Invalid body type'),
    
    body('color')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        return value.length >= 1 && value.length <= 50;
      })
      .withMessage('Color must be less than 50 characters'),
    
    body('condition')
      .optional()
      .isIn(['excellent', 'good', 'fair', 'poor'])
      .withMessage('Invalid condition'),
    
    body('description')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        return value.length >= 1 && value.length <= 2000;
      })
      .withMessage('Description must be less than 2000 characters'),
    
    body('images')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined) return true;
        return Array.isArray(value);
      })
      .withMessage('Images must be an array'),
    
    body('features')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined) return true;
        return Array.isArray(value);
      })
      .withMessage('Features must be an array'),
    
    body('specifications')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined) return true;
        return typeof value === 'object' && !Array.isArray(value);
      })
      .withMessage('Specifications must be an object'),
    
    body('vin')
      .optional()
      .isLength({ min: 17, max: 17 })
      .withMessage('VIN must be exactly 17 characters'),
    
    body('engine_size')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Engine size must be a positive number'),
    
    body('horsepower')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Horsepower must be a positive integer'),
    
    body('torque')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Torque must be a positive integer')
  ],

  update: [
    param('vehicleId')
      .isUUID()
      .withMessage('Valid vehicle ID is required'),
    
    body('make')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Make must be between 1 and 50 characters'),
    
    body('model')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Model must be between 1 and 50 characters'),
    
    body('year')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage('Valid year is required'),
    
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Valid price is required'),
    
    body('mileage')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Mileage must be a positive integer'),
    
    body('fuel_type')
      .optional()
      .isIn(['gasoline', 'diesel', 'electric', 'hybrid', 'lpg', 'cng'])
      .withMessage('Invalid fuel type'),
    
    body('transmission')
      .optional()
      .isIn(['manual', 'automatic', 'semi_automatic', 'cvt'])
      .withMessage('Invalid transmission type'),
    
    body('body_type')
      .optional()
      .isIn(['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'pickup', 'van'])
      .withMessage('Invalid body type'),
    
    body('color')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        return value.length >= 1 && value.length <= 50;
      })
      .withMessage('Color must be less than 50 characters'),
    
    body('condition')
      .optional()
      .isIn(['excellent', 'good', 'fair', 'poor'])
      .withMessage('Invalid condition'),
    
    body('description')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        return value.length >= 1 && value.length <= 2000;
      })
      .withMessage('Description must be less than 2000 characters'),
    
    body('images')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined) return true;
        return Array.isArray(value);
      })
      .withMessage('Images must be an array'),
    
    body('features')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined) return true;
        return Array.isArray(value);
      })
      .withMessage('Features must be an array'),
    
    body('specifications')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined) return true;
        return typeof value === 'object' && !Array.isArray(value);
      })
      .withMessage('Specifications must be an object'),
    
    body('vin')
      .optional()
      .isLength({ min: 17, max: 17 })
      .withMessage('VIN must be exactly 17 characters'),
    
    body('engine_size')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Engine size must be a positive number'),
    
    body('horsepower')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Horsepower must be a positive integer'),
    
    body('torque')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Torque must be a positive integer'),
    
    body('status')
      .optional()
      .isIn(['active', 'sold', 'pending', 'inactive'])
      .withMessage('Invalid status')
  ]
};

const validateDealerQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('business_type')
    .optional()
    .isIn(['dealership', 'private_seller', 'auction_house', 'rental_company'])
    .withMessage('Invalid business type'),
  
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended', 'pending_verification'])
    .withMessage('Invalid status'),
  
  query('is_verified')
    .optional()
    .isBoolean()
    .withMessage('is_verified must be a boolean'),
  
  query('city')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('City must be less than 100 characters'),
  
  query('state')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('State must be less than 100 characters'),
  
  query('search')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Search term must be less than 255 characters')
];

module.exports = {
  validateDealer,
  validateVehicle,
  validateDealerQuery
};
