const { ok, badRequest, notFound } = require('../../utils/response');
const paymentService = require('../services/payment.service');

// Process payment endpoint
const processPayment = async (req, res) => {
  try {
    const {
      carId,
      amount,
      currency = 'USD',
      paymentMethod,
      paymentMethodId,
      metadata = {}
    } = req.body;

    const userId = req.user.id;

    if (!carId || !amount || !paymentMethod) {
      return badRequest(res, 'Car ID, amount, and payment method are required');
    }

    const paymentData = {
      userId,
      carId,
      amount: parseFloat(amount),
      currency,
      paymentMethod,
      paymentMethodId,
      metadata
    };

    const result = await paymentService.processPayment(paymentData);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get financing options endpoint
const getFinancingOptions = async (req, res) => {
  try {
    const { carPrice } = req.query;
    const userId = req.user.id;

    if (!carPrice) {
      return badRequest(res, 'Car price is required');
    }

    // Get user profile for financing options
    const userProfile = await getUserProfile(userId);
    
    const options = await paymentService.getFinancingOptions(
      parseFloat(carPrice),
      userProfile
    );

    return ok(res, options);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get pre-approval endpoint
const getPreApproval = async (req, res) => {
  try {
    const { carPrice, financingOptionId } = req.body;
    const userId = req.user.id;

    if (!carPrice || !financingOptionId) {
      return badRequest(res, 'Car price and financing option ID are required');
    }

    const preApproval = await paymentService.getPreApproval(
      userId,
      parseFloat(carPrice),
      financingOptionId
    );

    return ok(res, preApproval);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Create escrow payment endpoint
const createEscrowPayment = async (req, res) => {
  try {
    const {
      sellerId,
      carId,
      amount,
      currency = 'USD',
      paymentMethod
    } = req.body;

    const buyerId = req.user.id;

    if (!sellerId || !carId || !amount || !paymentMethod) {
      return badRequest(res, 'Seller ID, car ID, amount, and payment method are required');
    }

    const paymentData = {
      buyerId,
      sellerId,
      carId,
      amount: parseFloat(amount),
      currency,
      paymentMethod
    };

    const result = await paymentService.createEscrowPayment(paymentData);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Release escrow payment endpoint
const releaseEscrowPayment = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { confirmationData } = req.body;
    const userId = req.user.id;

    const result = await paymentService.releaseEscrowPayment(
      escrowId,
      userId,
      confirmationData
    );

    return ok(res, result);
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('Unauthorized')) {
      return notFound(res, error.message);
    }
    return res.status(500).json({ error: error.message });
  }
};

// Calculate trade-in value endpoint
const calculateTradeInValue = async (req, res) => {
  try {
    const {
      brand,
      model,
      year,
      mileage,
      condition,
      features = []
    } = req.body;

    const userId = req.user.id;

    if (!brand || !model || !year || !mileage || !condition) {
      return badRequest(res, 'Brand, model, year, mileage, and condition are required');
    }

    // Get user location
    const userProfile = await getUserProfile(userId);
    const userLocation = userProfile.location || 'Unknown';

    const carData = {
      brand,
      model,
      year: parseInt(year),
      mileage: parseInt(mileage),
      condition,
      features
    };

    const result = await paymentService.calculateTradeInValue(carData, userLocation);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get insurance quote endpoint
const getInsuranceQuote = async (req, res) => {
  try {
    const {
      brand,
      model,
      year,
      value,
      userAge,
      userLocation,
      drivingHistory = 'clean'
    } = req.body;

    const userId = req.user.id;

    if (!brand || !model || !year || !value) {
      return badRequest(res, 'Brand, model, year, and value are required');
    }

    // Get user profile if not provided
    let userProfile = { userAge, userLocation, drivingHistory };
    if (!userAge || !userLocation) {
      const profile = await getUserProfile(userId);
      userProfile = {
        userAge: userAge || profile.age || 30,
        userLocation: userLocation || profile.location || 'Unknown',
        drivingHistory: drivingHistory || profile.driving_history || 'clean'
      };
    }

    const carData = {
      brand,
      model,
      year: parseInt(year),
      value: parseFloat(value)
    };

    const result = await paymentService.getInsuranceQuote(carData, userProfile);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get payment methods endpoint
const getPaymentMethods = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        pm.*,
        CASE WHEN pm.is_default = 1 THEN 'default' ELSE 'secondary' END as status
      FROM payment_methods pm
      WHERE pm.user_id = ? AND pm.is_active = 1
      ORDER BY pm.is_default DESC, pm.created_at DESC
    `;

    const { executeQuery } = require('../../config/database');
    const paymentMethods = await executeQuery(query, [userId]);

    return ok(res, {
      payment_methods: paymentMethods,
      count: paymentMethods.length,
      supported_methods: [
        'stripe',
        'paypal',
        'apple_pay',
        'google_pay',
        'crypto',
        'bnpl',
        'financing',
        'bank_transfer',
        'mobile_money'
      ]
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Add payment method endpoint
const addPaymentMethod = async (req, res) => {
  try {
    const {
      type,
      provider,
      accountDetails,
      isDefault = false
    } = req.body;

    const userId = req.user.id;

    if (!type || !provider || !accountDetails) {
      return badRequest(res, 'Type, provider, and account details are required');
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await executeQuery(
        'UPDATE payment_methods SET is_default = 0 WHERE user_id = ?',
        [userId]
      );
    }

    const query = `
      INSERT INTO payment_methods 
      (id, user_id, type, provider, account_details, is_default, is_active, created_at)
      VALUES (UUID(), ?, ?, ?, ?, ?, 1, NOW())
    `;

    const { executeQuery } = require('../../config/database');
    const result = await executeQuery(query, [
      userId,
      type,
      provider,
      JSON.stringify(accountDetails),
      isDefault ? 1 : 0
    ]);

    return ok(res, {
      message: 'Payment method added successfully',
      payment_method_id: result.insertId
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get transaction history endpoint
const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type, status } = req.query;

    let query = `
      SELECT 
        t.*,
        pm.type as payment_method_type,
        pm.provider as payment_provider
      FROM transactions t
      LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
      WHERE t.user_id = ?
    `;

    const params = [userId];

    if (type) {
      query += ' AND t.type = ?';
      params.push(type);
    }

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const { executeQuery } = require('../../config/database');
    const transactions = await executeQuery(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?';
    const countParams = [userId];

    if (type) {
      countQuery += ' AND type = ?';
      countParams.push(type);
    }

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    const countResult = await executeQuery(countQuery, countParams);
    const total = countResult[0].total;

    return ok(res, {
      transactions,
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

// Helper function to get user profile
async function getUserProfile(userId) {
  const { executeQuery } = require('../../config/database');
  const query = 'SELECT * FROM users WHERE id = ?';
  const result = await executeQuery(query, [userId]);
  return result[0] || {};
}

module.exports = {
  processPayment,
  getFinancingOptions,
  getPreApproval,
  createEscrowPayment,
  releaseEscrowPayment,
  calculateTradeInValue,
  getInsuranceQuote,
  getPaymentMethods,
  addPaymentMethod,
  getTransactionHistory
};
