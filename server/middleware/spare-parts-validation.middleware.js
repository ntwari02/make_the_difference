const { body, validationResult } = require('express-validator');

// Validation middleware for spare parts
const validateSparePart = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Name must be between 2 and 200 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
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
  
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code'),
  
  body('sku')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('SKU must be between 3 and 100 characters'),
  
  body('vehicle_compatibility')
    .optional()
    .isArray()
    .withMessage('Vehicle compatibility must be an array'),
  
  body('vehicle_compatibility.*.vehicle_make')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Vehicle make must be between 1 and 50 characters'),
  
  body('vehicle_compatibility.*.vehicle_model')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Vehicle model must be between 1 and 100 characters'),
  
  body('vehicle_compatibility.*.vehicle_year_from')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Vehicle year from must be a valid year'),
  
  body('vehicle_compatibility.*.vehicle_year_to')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Vehicle year to must be a valid year'),
  
  body('vehicle_compatibility.*.engine_type')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Engine type must be between 1 and 100 characters'),
  
  body('vehicle_compatibility.*.fuel_type')
    .optional()
    .isIn(['gasoline', 'diesel', 'hybrid', 'electric', 'lpg', 'cng'])
    .withMessage('Invalid fuel type'),
  
  body('vehicle_compatibility.*.transmission_type')
    .optional()
    .isIn(['manual', 'automatic', 'cvt', 'semi_automatic'])
    .withMessage('Invalid transmission type'),
  
  body('vehicle_compatibility.*.compatibility_confidence')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Compatibility confidence must be between 0 and 1'),
  
  body('inventory_data')
    .optional()
    .isObject()
    .withMessage('Inventory data must be an object'),
  
  body('inventory_data.warehouse_id')
    .optional()
    .isUUID()
    .withMessage('Warehouse ID must be a valid UUID'),
  
  body('inventory_data.quantity_available')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity available must be a non-negative integer'),
  
  body('inventory_data.reorder_point')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reorder point must be a non-negative integer'),
  
  body('installation_services')
    .optional()
    .isArray()
    .withMessage('Installation services must be an array'),
  
  body('installation_services.*.service_provider_id')
    .optional()
    .isUUID()
    .withMessage('Service provider ID must be a valid UUID'),
  
  body('installation_services.*.service_name')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Service name must be between 1 and 200 characters'),
  
  body('installation_services.*.base_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  
  body('installation_services.*.estimated_duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Estimated duration must be a positive integer (minutes)'),
  
  body('installation_services.*.difficulty_level')
    .optional()
    .isIn(['easy', 'medium', 'hard', 'professional'])
    .withMessage('Invalid difficulty level'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation middleware for inventory updates
const validateInventory = [
  body('warehouse_id')
    .notEmpty()
    .withMessage('Warehouse ID is required')
    .isUUID()
    .withMessage('Warehouse ID must be a valid UUID'),
  
  body('quantity_available')
    .notEmpty()
    .withMessage('Quantity available is required')
    .isInt({ min: 0 })
    .withMessage('Quantity available must be a non-negative integer'),
  
  body('quantity_reserved')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity reserved must be a non-negative integer'),
  
  body('quantity_on_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity on order must be a non-negative integer'),
  
  body('reorder_point')
    .notEmpty()
    .withMessage('Reorder point is required')
    .isInt({ min: 0 })
    .withMessage('Reorder point must be a non-negative integer'),
  
  body('reorder_quantity')
    .notEmpty()
    .withMessage('Reorder quantity is required')
    .isInt({ min: 1 })
    .withMessage('Reorder quantity must be a positive integer'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation middleware for vehicle compatibility
const validateVehicleCompatibility = [
  body()
    .isArray()
    .withMessage('Request body must be an array of compatibility objects'),
  
  body('*.vehicle_make')
    .notEmpty()
    .withMessage('Vehicle make is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Vehicle make must be between 1 and 50 characters'),
  
  body('*.vehicle_model')
    .notEmpty()
    .withMessage('Vehicle model is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Vehicle model must be between 1 and 100 characters'),
  
  body('*.vehicle_year_from')
    .notEmpty()
    .withMessage('Vehicle year from is required')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Vehicle year from must be a valid year'),
  
  body('*.vehicle_year_to')
    .notEmpty()
    .withMessage('Vehicle year to is required')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Vehicle year to must be a valid year'),
  
  body('*.engine_type')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Engine type must be between 1 and 100 characters'),
  
  body('*.engine_size')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Engine size must be between 1 and 50 characters'),
  
  body('*.fuel_type')
    .optional()
    .isIn(['gasoline', 'diesel', 'hybrid', 'electric', 'lpg', 'cng'])
    .withMessage('Invalid fuel type'),
  
  body('*.transmission_type')
    .optional()
    .isIn(['manual', 'automatic', 'cvt', 'semi_automatic'])
    .withMessage('Invalid transmission type'),
  
  body('*.body_type')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Body type must be between 1 and 50 characters'),
  
  body('*.trim_level')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Trim level must be between 1 and 100 characters'),
  
  body('*.notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  
  body('*.compatibility_confidence')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Compatibility confidence must be between 0 and 1'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation middleware for price comparison
const validatePriceComparison = [
  body('competitor_name')
    .notEmpty()
    .withMessage('Competitor name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Competitor name must be between 1 and 100 characters'),
  
  body('competitor_url')
    .optional()
    .isURL()
    .withMessage('Competitor URL must be a valid URL'),
  
  body('competitor_price')
    .notEmpty()
    .withMessage('Competitor price is required')
    .isFloat({ min: 0 })
    .withMessage('Competitor price must be a positive number'),
  
  body('competitor_currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Competitor currency must be a 3-character code'),
  
  body('shipping_cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Shipping cost must be a non-negative number'),
  
  body('availability_status')
    .optional()
    .isIn(['in_stock', 'out_of_stock', 'limited', 'unknown'])
    .withMessage('Invalid availability status'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation middleware for bundle creation
const validateBundle = [
  body('name')
    .notEmpty()
    .withMessage('Bundle name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Bundle name must be between 2 and 200 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('bundle_type')
    .optional()
    .isIn(['maintenance_kit', 'upgrade_package', 'repair_kit', 'custom'])
    .withMessage('Invalid bundle type'),
  
  body('total_price')
    .notEmpty()
    .withMessage('Total price is required')
    .isFloat({ min: 0 })
    .withMessage('Total price must be a positive number'),
  
  body('bundle_discount')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Bundle discount must be between 0 and 100'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code'),
  
  body('target_vehicle_make')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Target vehicle make must be between 1 and 50 characters'),
  
  body('target_vehicle_model')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Target vehicle model must be between 1 and 100 characters'),
  
  body('target_vehicle_year_from')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Target vehicle year from must be a valid year'),
  
  body('target_vehicle_year_to')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Target vehicle year to must be a valid year'),
  
  body('installation_included')
    .optional()
    .isBoolean()
    .withMessage('Installation included must be a boolean'),
  
  body('installation_cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Installation cost must be a non-negative number'),
  
  body('warranty_period')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Warranty period must be a non-negative integer'),
  
  body('items')
    .optional()
    .isArray()
    .withMessage('Items must be an array'),
  
  body('items.*.spare_part_id')
    .optional()
    .isUUID()
    .withMessage('Spare part ID must be a valid UUID'),
  
  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  body('items.*.unit_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateSparePart,
  validateInventory,
  validateVehicleCompatibility,
  validatePriceComparison,
  validateBundle
};
