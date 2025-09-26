const { body, query, param } = require('express-validator');

// Validation for spare parts search
const validateSearchSpareParts = [
  query('query')
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Search query must be between 1 and 200 characters'),
  
  query('category_id')
    .optional()
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  
  query('brand_id')
    .optional()
    .isUUID()
    .withMessage('Brand ID must be a valid UUID'),
  
  query('vehicle_make')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Vehicle make must be between 1 and 50 characters'),
  
  query('vehicle_model')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Vehicle model must be between 1 and 100 characters'),
  
  query('vehicle_year')
    .optional()
    .isInt({ min: 1900, max: 2030 })
    .withMessage('Vehicle year must be between 1900 and 2030'),
  
  query('price_min')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a non-negative number'),
  
  query('price_max')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a non-negative number'),
  
  query('condition')
    .optional()
    .isIn(['new', 'refurbished', 'used', 'remanufactured'])
    .withMessage('Invalid condition'),
  
  query('sort_by')
    .optional()
    .isIn(['relevance', 'price_low', 'price_high', 'rating', 'newest', 'popularity', 'compatibility'])
    .withMessage('Invalid sort option'),
  
  query('sort_order')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Sort order must be ASC or DESC'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Validation for vehicle compatibility check
const validateVehicleCompatibility = [
  param('partId')
    .isUUID()
    .withMessage('Part ID must be a valid UUID'),
  
  body('make')
    .notEmpty()
    .withMessage('Vehicle make is required')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Vehicle make must be between 1 and 50 characters'),
  
  body('model')
    .notEmpty()
    .withMessage('Vehicle model is required')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Vehicle model must be between 1 and 100 characters'),
  
  body('year')
    .notEmpty()
    .withMessage('Vehicle year is required')
    .isInt({ min: 1900, max: 2030 })
    .withMessage('Vehicle year must be between 1900 and 2030'),
  
  body('engine_type')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Engine type must be between 1 and 100 characters'),
  
  body('engine_size')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Engine size must be between 1 and 50 characters'),
  
  body('fuel_type')
    .optional()
    .isIn(['gasoline', 'diesel', 'hybrid', 'electric', 'lpg', 'cng'])
    .withMessage('Invalid fuel type'),
  
  body('transmission_type')
    .optional()
    .isIn(['manual', 'automatic', 'cvt', 'semi_automatic'])
    .withMessage('Invalid transmission type'),
  
  body('body_type')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Body type must be between 1 and 50 characters'),
  
  body('trim_level')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Trim level must be between 1 and 100 characters')
];

// Validation for creating spare part
const validateCreateSparePart = [
  body('name')
    .notEmpty()
    .withMessage('Part name is required')
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Part name must be between 1 and 200 characters'),
  
  body('description')
    .optional()
    .isString()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description must be between 1 and 2000 characters'),
  
  body('short_description')
    .optional()
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Short description must be between 1 and 500 characters'),
  
  body('category_id')
    .notEmpty()
    .withMessage('Category ID is required')
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  
  body('brand_id')
    .notEmpty()
    .withMessage('Brand ID is required')
    .isUUID()
    .withMessage('Brand ID must be a valid UUID'),
  
  body('part_number')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Part number must be between 1 and 100 characters'),
  
  body('oem_number')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('OEM number must be between 1 and 100 characters'),
  
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code'),
  
  body('cost_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a non-negative number'),
  
  body('msrp')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('MSRP must be a non-negative number'),
  
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a non-negative number'),
  
  body('dimensions')
    .optional()
    .isObject()
    .withMessage('Dimensions must be an object'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('specifications')
    .optional()
    .isObject()
    .withMessage('Specifications must be an object'),
  
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  
  body('warranty_period')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('Warranty period must be between 0 and 120 months'),
  
  body('warranty_type')
    .optional()
    .isIn(['manufacturer', 'seller', 'extended'])
    .withMessage('Invalid warranty type'),
  
  body('condition')
    .optional()
    .isIn(['new', 'refurbished', 'used', 'remanufactured'])
    .withMessage('Invalid condition'),
  
  body('stock_quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  
  body('installation_difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard', 'professional'])
    .withMessage('Invalid installation difficulty'),
  
  body('estimated_installation_time')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Estimated installation time must be a non-negative integer'),
  
  body('installation_cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Installation cost must be a non-negative number'),
  
  body('vehicle_compatibility')
    .optional()
    .isArray()
    .withMessage('Vehicle compatibility must be an array')
];

// Validation for spare parts purchase
const validateSparePartsPurchase = [
  body('parts')
    .notEmpty()
    .withMessage('Parts array is required')
    .isArray({ min: 1 })
    .withMessage('At least one part is required'),
  
  body('parts.*.part_id')
    .notEmpty()
    .withMessage('Part ID is required')
    .isUUID()
    .withMessage('Part ID must be a valid UUID'),
  
  body('parts.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  body('shippingAddress')
    .notEmpty()
    .withMessage('Shipping address is required')
    .isObject()
    .withMessage('Shipping address must be an object'),
  
  body('shippingAddress.street')
    .notEmpty()
    .withMessage('Street address is required')
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Street address must be between 1 and 200 characters'),
  
  body('shippingAddress.city')
    .notEmpty()
    .withMessage('City is required')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('City must be between 1 and 100 characters'),
  
  body('shippingAddress.state')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('State must be between 1 and 100 characters'),
  
  body('shippingAddress.postalCode')
    .notEmpty()
    .withMessage('Postal code is required')
    .isString()
    .isLength({ min: 1, max: 20 })
    .withMessage('Postal code must be between 1 and 20 characters'),
  
  body('shippingAddress.country')
    .notEmpty()
    .withMessage('Country is required')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Country must be between 1 and 100 characters'),
  
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['stripe', 'paypal', 'apple_pay', 'google_pay', 'crypto', 'bnpl', 'financing', 'bank_transfer', 'mobile_money'])
    .withMessage('Invalid payment method'),
  
  body('paymentMethodId')
    .optional()
    .isUUID()
    .withMessage('Payment method ID must be a valid UUID'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

// Validation for bundle purchase
const validateBundlePurchase = [
  body('bundleId')
    .notEmpty()
    .withMessage('Bundle ID is required')
    .isUUID()
    .withMessage('Bundle ID must be a valid UUID'),
  
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  body('shippingAddress')
    .notEmpty()
    .withMessage('Shipping address is required')
    .isObject()
    .withMessage('Shipping address must be an object'),
  
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['stripe', 'paypal', 'apple_pay', 'google_pay', 'crypto', 'bnpl', 'financing', 'bank_transfer', 'mobile_money'])
    .withMessage('Invalid payment method'),
  
  body('paymentMethodId')
    .optional()
    .isUUID()
    .withMessage('Payment method ID must be a valid UUID'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

// Validation for installation service payment
const validateInstallationServicePayment = [
  body('serviceId')
    .notEmpty()
    .withMessage('Service ID is required')
    .isUUID()
    .withMessage('Service ID must be a valid UUID'),
  
  body('partId')
    .notEmpty()
    .withMessage('Part ID is required')
    .isUUID()
    .withMessage('Part ID must be a valid UUID'),
  
  body('installationAddress')
    .notEmpty()
    .withMessage('Installation address is required')
    .isObject()
    .withMessage('Installation address must be an object'),
  
  body('scheduledDate')
    .notEmpty()
    .withMessage('Scheduled date is required')
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO 8601 date'),
  
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['stripe', 'paypal', 'apple_pay', 'google_pay', 'crypto', 'bnpl', 'financing', 'bank_transfer', 'mobile_money'])
    .withMessage('Invalid payment method'),
  
  body('paymentMethodId')
    .optional()
    .isUUID()
    .withMessage('Payment method ID must be a valid UUID'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

// Validation for maintenance plan subscription
const validateMaintenancePlanSubscription = [
  body('planId')
    .notEmpty()
    .withMessage('Plan ID is required')
    .isUUID()
    .withMessage('Plan ID must be a valid UUID'),
  
  body('vehicleId')
    .notEmpty()
    .withMessage('Vehicle ID is required')
    .isUUID()
    .withMessage('Vehicle ID must be a valid UUID'),
  
  body('billingCycle')
    .optional()
    .isIn(['monthly', 'yearly'])
    .withMessage('Billing cycle must be monthly or yearly'),
  
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['stripe', 'paypal', 'apple_pay', 'google_pay', 'crypto', 'bnpl', 'financing', 'bank_transfer', 'mobile_money'])
    .withMessage('Invalid payment method'),
  
  body('paymentMethodId')
    .optional()
    .isUUID()
    .withMessage('Payment method ID must be a valid UUID'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

// Validation for getting bundles
const validateGetBundles = [
  query('vehicleMake')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Vehicle make must be between 1 and 50 characters'),
  
  query('vehicleModel')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Vehicle model must be between 1 and 100 characters'),
  
  query('vehicleYear')
    .optional()
    .isInt({ min: 1900, max: 2030 })
    .withMessage('Vehicle year must be between 1900 and 2030'),
  
  query('bundleType')
    .optional()
    .isIn(['maintenance_kit', 'upgrade_package', 'repair_kit', 'custom'])
    .withMessage('Invalid bundle type')
];

// Validation for getting wishlist
const validateGetWishlist = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Validation for creating price alert
const validateCreatePriceAlert = [
  param('partId')
    .isUUID()
    .withMessage('Part ID must be a valid UUID'),
  
  body('targetPrice')
    .notEmpty()
    .withMessage('Target price is required')
    .isFloat({ min: 0.01 })
    .withMessage('Target price must be a positive number'),
  
  body('alertType')
    .optional()
    .isIn(['price_drop', 'stock_available', 'both'])
    .withMessage('Invalid alert type')
];

module.exports = {
  validateSearchSpareParts,
  validateVehicleCompatibility,
  validateCreateSparePart,
  validateSparePartsPurchase,
  validateBundlePurchase,
  validateInstallationServicePayment,
  validateMaintenancePlanSubscription,
  validateGetBundles,
  validateGetWishlist,
  validateCreatePriceAlert
};
