const { body, param, query } = require('express-validator');

// Car creation validation - only validate fields used by client
const validateCreateCar = [
	body('title').isString().isLength({ min: 5, max: 255 }).withMessage('Title must be 5-255 characters'),
	body('description').optional().isString().isLength({ max: 2000 }).withMessage('Description must be less than 2000 characters'),
	body('brand').isString().isLength({ min: 2, max: 100 }).withMessage('Brand is required and must be 2-100 characters'),
	body('model').isString().isLength({ min: 1, max: 100 }).withMessage('Model is required and must be 1-100 characters'),
	body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Year must be between 1900 and next year'),
	body('mileage').isInt({ min: 0 }).withMessage('Mileage must be a positive number'),
	body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
	body('car_condition').isIn(['new', 'used', 'certified', 'excellent', 'good', 'fair']).withMessage('Car condition must be new, used, certified, excellent, good, or fair'),
	body('fuel_type').isIn(['petrol', 'diesel', 'electric', 'hybrid', 'lpg', 'cng']).withMessage('Invalid fuel type'),
	body('transmission').isIn(['manual', 'automatic', 'semi-automatic']).withMessage('Invalid transmission type'),
	body('body_type').isIn(['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'pickup', 'van']).withMessage('Invalid body type'),
	body('color').isString().isLength({ min: 2, max: 50 }).withMessage('Color is required and must be 2-50 characters'),
	body('location').isString().isLength({ min: 5, max: 255 }).withMessage('Location is required and must be 5-255 characters'),
	body('images').optional().isArray().withMessage('Images must be an array'),
	body('status').optional().isString().withMessage('Status must be a string')
];

// Car update validation
const validateUpdateCar = [
	param('id').isString().isLength({ min: 10 }).withMessage('Invalid car ID'),
	body('title').optional().isString().isLength({ min: 5, max: 255 }).withMessage('Title must be 5-255 characters'),
	body('description').optional().isString().isLength({ max: 2000 }).withMessage('Description must be less than 2000 characters'),
	body('brand').optional().isString().isLength({ min: 2, max: 100 }).withMessage('Brand must be 2-100 characters'),
	body('model').optional().isString().isLength({ min: 1, max: 100 }).withMessage('Model must be 1-100 characters'),
	body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Year must be between 1900 and next year'),
	body('mileage').optional().isInt({ min: 0 }).withMessage('Mileage must be a positive number'),
	body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
	body('currency').optional().isString().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
	body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
	body('unitPrice').optional().isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
	body('totalPrice').optional().isFloat({ min: 0 }).withMessage('Total price must be a positive number'),
	body('number_of_seats').optional().isInt({ min: 1, max: 50 }).withMessage('Number of seats must be between 1 and 50'),
	body('car_condition').optional().isIn(['new', 'used', 'certified']).withMessage('Car condition must be new, used, or certified'),
	body('fuel_type').optional().isIn(['petrol', 'diesel', 'electric', 'hybrid', 'lpg', 'cng']).withMessage('Invalid fuel type'),
	body('transmission').optional().isIn(['manual', 'automatic', 'semi-automatic']).withMessage('Invalid transmission type'),
	body('body_type').optional().isIn(['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'pickup', 'van']).withMessage('Invalid body type'),
	body('color').optional().isString().isLength({ min: 2, max: 50 }).withMessage('Color must be 2-50 characters'),
	body('location').optional().isString().isLength({ min: 5, max: 255 }).withMessage('Location must be 5-255 characters'),
	body('engine_size').optional().isString().isLength({ max: 20 }).withMessage('Engine size must be less than 20 characters'),
	body('horsepower').optional().isInt({ min: 0 }).withMessage('Horsepower must be a positive number'),
	body('vin').optional().isString().isLength({ min: 17, max: 17 }).withMessage('VIN must be exactly 17 characters'),
	body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
	body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
	body('images').optional().isArray().withMessage('Images must be an array'),
	body('features').optional().isArray().withMessage('Features must be an array'),
	body('is_featured').optional().isBoolean().withMessage('is_featured must be a boolean')
];

// Car status update validation (Admin only)
const validateUpdateStatus = [
	param('id').isString().isLength({ min: 10 }).withMessage('Invalid car ID'),
	body('status').isIn(['active', 'pending', 'sold', 'draft', 'rejected']).withMessage('Invalid status'),
	body('reason').optional().isString().isLength({ max: 500 }).withMessage('Reason must be less than 500 characters')
];

// Review creation validation
const validateCreateReview = [
	param('id').isString().isLength({ min: 10 }).withMessage('Invalid car ID'),
	body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
	body('comment').optional().isString().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters')
];

// Query parameter validation
const validateListCars = [
	query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
	query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
	query('brand').optional().isString().isLength({ min: 2, max: 100 }).withMessage('Invalid brand'),
	query('model').optional().isString().isLength({ min: 1, max: 100 }).withMessage('Invalid model'),
	query('year_min').optional().isInt({ min: 1900 }).withMessage('Invalid minimum year'),
	query('year_max').optional().isInt({ min: 1900 }).withMessage('Invalid maximum year'),
	query('price_min').optional().isFloat({ min: 0 }).withMessage('Invalid minimum price'),
	query('price_max').optional().isFloat({ min: 0 }).withMessage('Invalid maximum price'),
	query('fuel_type').optional().isIn(['petrol', 'diesel', 'electric', 'hybrid', 'lpg', 'cng']).withMessage('Invalid fuel type'),
	query('transmission').optional().isIn(['manual', 'automatic', 'semi-automatic']).withMessage('Invalid transmission'),
	query('body_type').optional().isIn(['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'pickup', 'van']).withMessage('Invalid body type'),
	query('car_condition').optional().isIn(['new', 'used', 'certified']).withMessage('Invalid car condition'),
	query('location').optional().isString().isLength({ min: 2, max: 255 }).withMessage('Invalid location'),
	query('sort_by').optional().isIn(['price', 'year', 'mileage', 'created_at', 'rating']).withMessage('Invalid sort field'),
	query('sort_order').optional().isIn(['ASC', 'DESC']).withMessage('Invalid sort order')
];

module.exports = {
	validateCreateCar,
	validateUpdateCar,
	validateUpdateStatus,
	validateCreateReview,
	validateListCars
};
