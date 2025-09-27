const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const { ok, badRequest, notFound, unauthorized } = require('../utils/response');
const serviceFeeService = require('../services/service-fee.service');
const paymentService = require('../ecommerce/services/payment.service');
const scholarshipService = require('../services/scholarship.service');
const visaService = require('../services/visa.service');

// Calculate scholarship service fees
router.post('/scholarship/:id/calculate-fees', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const options = req.body;

    const fees = await scholarshipService.calculateServiceFees(id, userId, options);

    return ok(res, fees);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Apply to scholarship with service fees
router.post('/scholarship/:id/apply-with-fees', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { applicationData, options = {} } = req.body;

    if (!applicationData) {
      return badRequest(res, 'Application data is required');
    }

    const result = await scholarshipService.applyToScholarshipWithFees(id, userId, applicationData, options);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Calculate visa service fees
router.post('/visa/:id/calculate-fees', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const options = req.body;

    const fees = await visaService.calculateServiceFees(id, userId, options);

    return ok(res, fees);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Apply for visa with service fees
router.post('/visa/:id/apply-with-fees', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { applicationData, options = {} } = req.body;

    if (!applicationData) {
      return badRequest(res, 'Application data is required');
    }

    const result = await visaService.applyForVisaWithFees(id, userId, applicationData, options);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Process service fee payment
router.post('/payment/:transactionId/process', authenticateToken, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;
    const {
      amount,
      currency = 'USD',
      paymentMethod,
      paymentMethodId,
      metadata = {}
    } = req.body;

    if (!amount || !paymentMethod) {
      return badRequest(res, 'Amount and payment method are required');
    }

    const paymentData = {
      transactionId,
      userId,
      amount: parseFloat(amount),
      currency,
      paymentMethod,
      paymentMethodId,
      metadata
    };

    const result = await paymentService.processServiceFeePayment(paymentData);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Process scholarship application payment
router.post('/scholarship/payment/:transactionId/process', authenticateToken, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;
    const {
      amount,
      currency = 'USD',
      paymentMethod,
      paymentMethodId,
      metadata = {}
    } = req.body;

    if (!amount || !paymentMethod) {
      return badRequest(res, 'Amount and payment method are required');
    }

    const paymentData = {
      transactionId,
      userId,
      amount: parseFloat(amount),
      currency,
      paymentMethod,
      paymentMethodId,
      metadata
    };

    const result = await paymentService.processScholarshipApplicationPayment(transactionId, paymentData);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Process visa application payment
router.post('/visa/payment/:transactionId/process', authenticateToken, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;
    const {
      amount,
      currency = 'USD',
      paymentMethod,
      paymentMethodId,
      metadata = {}
    } = req.body;

    if (!amount || !paymentMethod) {
      return badRequest(res, 'Amount and payment method are required');
    }

    const paymentData = {
      transactionId,
      userId,
      amount: parseFloat(amount),
      currency,
      paymentMethod,
      paymentMethodId,
      metadata
    };

    const result = await paymentService.processVisaApplicationPayment(transactionId, paymentData);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get service fee transaction details
router.get('/transaction/:transactionId', authenticateToken, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    const transaction = await serviceFeeService.getServiceFeeTransaction(transactionId);

    if (transaction.user_id !== userId && req.user.role !== 'admin') {
      return unauthorized(res, 'Unauthorized access to transaction');
    }

    return ok(res, transaction);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get user's service fee transactions
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = req.query;

    const transactions = await serviceFeeService.getUserServiceFeeTransactions(userId, filters);

    return ok(res, transactions);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get user's scholarship applications with fees
router.get('/scholarship/applications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = req.query;

    const applications = await scholarshipService.getUserApplicationsWithFees(userId, filters);

    return ok(res, applications);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get user's visa applications with fees
router.get('/visa/applications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = req.query;

    const applications = await visaService.getUserApplicationsWithFees(userId, filters);

    return ok(res, applications);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get scholarship with service fee information
router.get('/scholarship/:id/with-fees', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const scholarship = await scholarshipService.getScholarshipWithFees(id, userId);

    return ok(res, scholarship);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get visa service with service fee information
router.get('/visa/:id/with-fees', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const visaService = await visaService.getVisaServiceWithFees(id, userId);

    return ok(res, visaService);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Refund service fee payment (Admin only)
router.post('/refund/:transactionId', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason, amount } = req.body;

    if (!reason) {
      return badRequest(res, 'Refund reason is required');
    }

    const refundData = {
      reason,
      amount: amount ? parseFloat(amount) : null
    };

    const result = await paymentService.refundServiceFeePayment(transactionId, refundData);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get service fee statistics (Admin only)
router.get('/statistics', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const filters = req.query;

    const statistics = await serviceFeeService.getServiceFeeStatistics(filters);

    return ok(res, statistics);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get service fee payment history
router.get('/payment-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = req.query;

    const history = await paymentService.getServiceFeePaymentHistory(userId, filters);

    return ok(res, history);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
