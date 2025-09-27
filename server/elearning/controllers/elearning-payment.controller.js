const { ok, badRequest, notFound } = require('../../utils/response');
const elearningPaymentService = require('../services/elearning-payment.service');

// Process course purchase payment
const processCoursePurchase = async (req, res) => {
  try {
    const {
      courseId,
      amount,
      currency = 'USD',
      paymentMethod,
      paymentMethodId,
      metadata = {}
    } = req.body;

    const userId = req.user.id;

    if (!courseId || !amount || !paymentMethod) {
      return badRequest(res, 'Course ID, amount, and payment method are required');
    }

    const paymentData = {
      userId,
      courseId,
      amount: parseFloat(amount),
      currency,
      paymentMethod,
      paymentMethodId,
      metadata
    };

    const result = await elearningPaymentService.processCoursePurchase(paymentData);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Process subscription payment
const processSubscriptionPayment = async (req, res) => {
  try {
    const {
      subscriptionType,
      amount,
      currency = 'USD',
      paymentMethod,
      paymentMethodId,
      billingCycle = 'monthly',
      metadata = {}
    } = req.body;

    const userId = req.user.id;

    if (!subscriptionType || !amount || !paymentMethod) {
      return badRequest(res, 'Subscription type, amount, and payment method are required');
    }

    const paymentData = {
      userId,
      subscriptionType,
      amount: parseFloat(amount),
      currency,
      paymentMethod,
      paymentMethodId,
      billingCycle,
      metadata
    };

    const result = await elearningPaymentService.processSubscriptionPayment(paymentData);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Process certificate payment
const processCertificatePayment = async (req, res) => {
  try {
    const {
      courseId,
      certificateType = 'completion',
      amount,
      currency = 'USD',
      paymentMethod,
      paymentMethodId,
      metadata = {}
    } = req.body;

    const userId = req.user.id;

    if (!courseId || !amount || !paymentMethod) {
      return badRequest(res, 'Course ID, amount, and payment method are required');
    }

    const paymentData = {
      userId,
      courseId,
      certificateType,
      amount: parseFloat(amount),
      currency,
      paymentMethod,
      paymentMethodId,
      metadata
    };

    const result = await elearningPaymentService.processCertificatePayment(paymentData);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Process online class payment
const processOnlineClassPayment = async (req, res) => {
  try {
    const {
      classId,
      amount,
      currency = 'USD',
      paymentMethod,
      paymentMethodId,
      metadata = {}
    } = req.body;

    const userId = req.user.id;

    if (!classId || !amount || !paymentMethod) {
      return badRequest(res, 'Class ID, amount, and payment method are required');
    }

    const paymentData = {
      userId,
      classId,
      amount: parseFloat(amount),
      currency,
      paymentMethod,
      paymentMethodId,
      metadata
    };

    const result = await elearningPaymentService.processOnlineClassPayment(paymentData);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get e-learning payment methods
const getPaymentMethods = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await elearningPaymentService.getPaymentMethods(userId);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get e-learning transaction history
const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = req.query;

    const result = await elearningPaymentService.getTransactionHistory(userId, filters);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get course pricing information
const getCoursePricing = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const query = `
      SELECT 
        c.id,
        c.title,
        c.price,
        c.currency,
        c.discount_percentage,
        c.discount_expires_at,
        CASE 
          WHEN c.discount_percentage > 0 AND (c.discount_expires_at IS NULL OR c.discount_expires_at > NOW()) 
          THEN c.price * (1 - c.discount_percentage / 100)
          ELSE c.price
        END as final_price,
        CASE 
          WHEN c.discount_percentage > 0 AND (c.discount_expires_at IS NULL OR c.discount_expires_at > NOW()) 
          THEN c.price * (c.discount_percentage / 100)
          ELSE 0
        END as discount_amount
      FROM courses c
      WHERE c.id = ? AND c.status = 'active'
    `;

    const { executeQuery } = require('../../config/database');
    const course = await executeQuery(query, [courseId]);

    if (!course[0]) {
      return notFound(res, 'Course not found');
    }

    // Check if user already purchased
    const existingPurchase = await executeQuery(
      'SELECT * FROM transactions WHERE user_id = ? AND course_id = ? AND type = "course_purchase" AND status = "completed"',
      [userId, courseId]
    );

    return ok(res, {
      course: course[0],
      already_purchased: existingPurchase.length > 0,
      payment_methods: [
        'stripe', 'paypal', 'apple_pay', 'google_pay', 
        'crypto', 'bnpl', 'financing', 'bank_transfer', 'mobile_money'
      ]
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get subscription plans
const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = [
      {
        id: 'basic',
        name: 'Basic Plan',
        price: 9.99,
        currency: 'USD',
        billing_cycle: 'monthly',
        features: [
          'Access to basic courses',
          'Certificate generation',
          'Community support'
        ],
        course_limit: 5
      },
      {
        id: 'premium',
        name: 'Premium Plan',
        price: 19.99,
        currency: 'USD',
        billing_cycle: 'monthly',
        features: [
          'Access to all courses',
          'Priority support',
          'Advanced certificates',
          'Live classes access',
          'Downloadable content'
        ],
        course_limit: -1 // Unlimited
      },
      {
        id: 'enterprise',
        name: 'Enterprise Plan',
        price: 49.99,
        currency: 'USD',
        billing_cycle: 'monthly',
        features: [
          'Everything in Premium',
          'Custom courses',
          'Team management',
          'Analytics dashboard',
          'API access'
        ],
        course_limit: -1 // Unlimited
      }
    ];

    return ok(res, {
      plans,
      count: plans.length,
      current_user_plan: null // Would be fetched from user's active subscription
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Refund course purchase
const refundCoursePurchase = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    // Get transaction details
    const { executeQuery } = require('../../config/database');
    const transaction = await executeQuery(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ? AND type = "course_purchase"',
      [transactionId, userId]
    );

    if (!transaction[0]) {
      return notFound(res, 'Transaction not found');
    }

    if (transaction[0].status !== 'completed') {
      return badRequest(res, 'Can only refund completed transactions');
    }

    // Process refund (simplified - would integrate with payment provider)
    const refundResult = {
      refund_id: require('crypto').randomUUID(),
      amount: transaction[0].amount,
      status: 'completed',
      reason: reason || 'User requested refund'
    };

    // Update transaction status
    await executeQuery(
      'UPDATE transactions SET status = "refunded", metadata = JSON_SET(metadata, "$.refund", ?) WHERE id = ?',
      [JSON.stringify(refundResult), transactionId]
    );

    // Remove course enrollment
    await executeQuery(
      'DELETE FROM enrollments WHERE course_id = ? AND user_id = ?',
      [JSON.parse(transaction[0].metadata).course_id, userId]
    );

    return ok(res, {
      transaction_id: transactionId,
      refund_result: refundResult,
      message: 'Refund processed successfully'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  processCoursePurchase,
  processSubscriptionPayment,
  processCertificatePayment,
  processOnlineClassPayment,
  getPaymentMethods,
  getTransactionHistory,
  getCoursePricing,
  getSubscriptionPlans,
  refundCoursePurchase
};

