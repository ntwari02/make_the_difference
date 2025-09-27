const { ok, badRequest, notFound, unauthorized } = require('../../utils/response');
const sparePartsService = require('../services/spare-parts.service');
const sparePartsPaymentService = require('../services/spare-parts-payment.service');

// Search spare parts with advanced filters
const searchSpareParts = async (req, res) => {
  try {
    const searchParams = req.query;
    const result = await sparePartsService.searchSpareParts(searchParams);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get spare part details
const getSparePartById = async (req, res) => {
  try {
    const { partId } = req.params;
    const userId = req.user ? req.user.id : null;

    const result = await sparePartsService.getSparePartById(partId, userId);

    return ok(res, result);
  } catch (error) {
    if (error.message === 'Spare part not found') {
      return notFound(res, error.message);
    }
    return res.status(500).json({ error: error.message });
  }
};

// Check vehicle compatibility
const checkVehicleCompatibility = async (req, res) => {
  try {
    const { partId } = req.params;
    const vehicleData = req.body;

    if (!vehicleData.make || !vehicleData.model || !vehicleData.year) {
      return badRequest(res, 'Vehicle make, model, and year are required');
    }

    const result = await sparePartsService.checkVehicleCompatibility(partId, vehicleData);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get price comparison
const getPriceComparison = async (req, res) => {
  try {
    const { partId } = req.params;
    const result = await sparePartsService.getPriceComparison(partId);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Create spare part (Seller only)
const createSparePart = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const partData = req.body;

    if (!partData.name || !partData.category_id || !partData.brand_id || !partData.price) {
      return badRequest(res, 'Name, category, brand, and price are required');
    }

    const result = await sparePartsService.createSparePart(partData, sellerId);

    return ok(res, {
      part_id: result.id,
      message: 'Spare part created successfully',
      status: 'pending_approval'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Process spare parts purchase
const processSparePartsPurchase = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      parts,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentMethodId,
      currency = 'USD',
      metadata = {}
    } = req.body;

    if (!parts || !Array.isArray(parts) || parts.length === 0) {
      return badRequest(res, 'Parts array is required');
    }

    if (!shippingAddress || !paymentMethod) {
      return badRequest(res, 'Shipping address and payment method are required');
    }

    const paymentData = {
      userId,
      parts,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentMethodId,
      currency,
      metadata
    };

    const result = await sparePartsPaymentService.processSparePartsPurchase(paymentData);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Process bundle purchase
const processBundlePurchase = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      bundleId,
      quantity = 1,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentMethodId,
      currency = 'USD',
      metadata = {}
    } = req.body;

    if (!bundleId || !shippingAddress || !paymentMethod) {
      return badRequest(res, 'Bundle ID, shipping address, and payment method are required');
    }

    const paymentData = {
      userId,
      bundleId,
      quantity,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentMethodId,
      currency,
      metadata
    };

    const result = await sparePartsPaymentService.processBundlePurchase(paymentData);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Process installation service payment
const processInstallationServicePayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      serviceId,
      partId,
      installationAddress,
      scheduledDate,
      paymentMethod,
      paymentMethodId,
      currency = 'USD',
      metadata = {}
    } = req.body;

    if (!serviceId || !partId || !installationAddress || !paymentMethod) {
      return badRequest(res, 'Service ID, part ID, installation address, and payment method are required');
    }

    const paymentData = {
      userId,
      serviceId,
      partId,
      installationAddress,
      scheduledDate,
      paymentMethod,
      paymentMethodId,
      currency,
      metadata
    };

    const result = await sparePartsPaymentService.processInstallationServicePayment(paymentData);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Process maintenance plan subscription
const processMaintenancePlanSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      planId,
      vehicleId,
      billingCycle = 'monthly',
      paymentMethod,
      paymentMethodId,
      currency = 'USD',
      metadata = {}
    } = req.body;

    if (!planId || !vehicleId || !paymentMethod) {
      return badRequest(res, 'Plan ID, vehicle ID, and payment method are required');
    }

    const paymentData = {
      userId,
      planId,
      vehicleId,
      billingCycle,
      paymentMethod,
      paymentMethodId,
      currency,
      metadata
    };

    const result = await sparePartsPaymentService.processMaintenancePlanSubscription(paymentData);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get categories
const getCategories = async (req, res) => {
  try {
    const { parentId } = req.query;
    const categories = await sparePartsService.getCategories(parentId);

    return ok(res, {
      categories,
      count: categories.length
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get brands
const getBrands = async (req, res) => {
  try {
    const brands = await sparePartsService.getBrands();

    return ok(res, {
      brands,
      count: brands.length
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Add to wishlist
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { partId } = req.params;

    const { executeQuery } = require('../../config/database');
    
    // Check if already in wishlist
    const existing = await executeQuery(
      'SELECT id FROM spare_parts_wishlist WHERE user_id = ? AND spare_part_id = ?',
      [userId, partId]
    );

    if (existing.length > 0) {
      return badRequest(res, 'Part already in wishlist');
    }

    // Add to wishlist
    await executeQuery(
      'INSERT INTO spare_parts_wishlist (id, user_id, spare_part_id) VALUES (UUID(), ?, ?)',
      [userId, partId]
    );

    return ok(res, {
      message: 'Part added to wishlist successfully',
      part_id: partId
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Remove from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { partId } = req.params;

    const { executeQuery } = require('../../config/database');
    
    const result = await executeQuery(
      'DELETE FROM spare_parts_wishlist WHERE user_id = ? AND spare_part_id = ?',
      [userId, partId]
    );

    if (result.affectedRows === 0) {
      return notFound(res, 'Part not found in wishlist');
    }

    return ok(res, {
      message: 'Part removed from wishlist successfully',
      part_id: partId
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get user wishlist
const getUserWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const { executeQuery } = require('../../config/database');
    
    const offset = (page - 1) * limit;
    
    const sql = `
      SELECT 
        sp.*,
        spc.name as category_name,
        spb.name as brand_name,
        spw.added_at,
        CASE 
          WHEN sp.discount_percentage > 0 AND (sp.discount_expires_at IS NULL OR sp.discount_expires_at > NOW()) 
          THEN sp.price * (1 - sp.discount_percentage / 100)
          ELSE sp.price
        END as final_price
      FROM spare_parts_wishlist spw
      LEFT JOIN spare_parts sp ON spw.spare_part_id = sp.id
      LEFT JOIN spare_parts_categories spc ON sp.category_id = spc.id
      LEFT JOIN spare_parts_brands spb ON sp.brand_id = spb.id
      WHERE spw.user_id = ? AND sp.status = 'active'
      ORDER BY spw.added_at DESC
      LIMIT ? OFFSET ?
    `;

    const wishlist = await executeQuery(sql, [userId, limit, offset]);

    // Get total count
    const countSql = `
      SELECT COUNT(*) as total
      FROM spare_parts_wishlist spw
      LEFT JOIN spare_parts sp ON spw.spare_part_id = sp.id
      WHERE spw.user_id = ? AND sp.status = 'active'
    `;
    const countResult = await executeQuery(countSql, [userId]);
    const total = countResult[0].total;

    return ok(res, {
      wishlist,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Create price alert
const createPriceAlert = async (req, res) => {
  try {
    const userId = req.user.id;
    const { partId, targetPrice, alertType = 'price_drop' } = req.body;

    if (!partId || !targetPrice) {
      return badRequest(res, 'Part ID and target price are required');
    }

    const { executeQuery } = require('../../config/database');
    
    // Check if alert already exists
    const existing = await executeQuery(
      'SELECT id FROM spare_parts_price_alerts WHERE user_id = ? AND spare_part_id = ?',
      [userId, partId]
    );

    if (existing.length > 0) {
      return badRequest(res, 'Price alert already exists for this part');
    }

    // Create price alert
    await executeQuery(
      'INSERT INTO spare_parts_price_alerts (id, user_id, spare_part_id, target_price, alert_type) VALUES (UUID(), ?, ?, ?, ?)',
      [userId, partId, targetPrice, alertType]
    );

    return ok(res, {
      message: 'Price alert created successfully',
      part_id: partId,
      target_price: targetPrice,
      alert_type: alertType
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get seller analytics
const getSellerAnalytics = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { start_date, end_date } = req.query;

    const analytics = await sparePartsService.getSparePartsAnalytics(sellerId, {
      start_date,
      end_date
    });

    return ok(res, analytics);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get spare parts bundles
const getSparePartsBundles = async (req, res) => {
  try {
    const { vehicleMake, vehicleModel, vehicleYear, bundleType } = req.query;

    const { executeQuery } = require('../../config/database');
    
    let sql = `
      SELECT 
        spb.*,
        u.first_name as seller_name,
        u.rating as seller_rating,
        COUNT(spbi.id) as item_count
      FROM spare_parts_bundles spb
      LEFT JOIN users u ON spb.seller_id = u.id
      LEFT JOIN spare_parts_bundle_items spbi ON spb.id = spbi.bundle_id
      WHERE spb.status = 'active'
    `;

    const params = [];

    if (vehicleMake) {
      sql += ` AND spb.target_vehicle_make = ?`;
      params.push(vehicleMake);
    }

    if (vehicleModel) {
      sql += ` AND spb.target_vehicle_model = ?`;
      params.push(vehicleModel);
    }

    if (vehicleYear) {
      sql += ` AND ? BETWEEN spb.target_vehicle_year_from AND spb.target_vehicle_year_to`;
      params.push(vehicleYear);
    }

    if (bundleType) {
      sql += ` AND spb.bundle_type = ?`;
      params.push(bundleType);
    }

    sql += ` GROUP BY spb.id ORDER BY spb.is_featured DESC, spb.created_at DESC`;

    const bundles = await executeQuery(sql, params);

    return ok(res, {
      bundles,
      count: bundles.length
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  searchSpareParts,
  getSparePartById,
  checkVehicleCompatibility,
  getPriceComparison,
  createSparePart,
  processSparePartsPurchase,
  processBundlePurchase,
  processInstallationServicePayment,
  processMaintenancePlanSubscription,
  getCategories,
  getBrands,
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
  createPriceAlert,
  getSellerAnalytics,
  getSparePartsBundles
};
