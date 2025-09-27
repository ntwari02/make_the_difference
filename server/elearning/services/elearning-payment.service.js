const { executeQuery } = require('../../config/database');
const crypto = require('crypto');
const paymentService = require('../../ecommerce/services/payment.service');

class ELearningPaymentService {
  constructor() {
    this.supportedPaymentMethods = [
      'stripe', 'paypal', 'apple_pay', 'google_pay', 
      'crypto', 'bnpl', 'financing', 'bank_transfer', 'mobile_money'
    ];
  }

  // Process course purchase payment
  async processCoursePurchase(paymentData) {
    try {
      const {
        userId,
        courseId,
        amount,
        currency = 'USD',
        paymentMethod,
        paymentMethodId,
        metadata = {}
      } = paymentData;

      // Validate course exists and is purchasable
      await this.validateCoursePurchase(courseId, userId);

      // Create course purchase transaction
      const transaction = await this.createTransaction({
        user_id: userId,
        type: 'course_purchase',
        amount,
        currency,
        payment_method_id: paymentMethodId,
        description: `Course purchase - ${courseId}`,
        metadata: {
          course_id: courseId,
          payment_method: paymentMethod,
          ...metadata
        }
      });

      // Process payment using the main payment service
      const paymentResult = await paymentService.processPayment({
        userId,
        carId: courseId, // Reuse car payment logic
        amount,
        currency,
        paymentMethod,
        paymentMethodId,
        metadata: {
          ...metadata,
          course_id: courseId,
          transaction_type: 'course_purchase'
        }
      });

      // Update transaction with payment result
      await this.updateTransaction(transaction.id, {
        status: paymentResult.status,
        external_transaction_id: paymentResult.external_id,
        metadata: {
          ...transaction.metadata,
          payment_result: paymentResult
        }
      });

      // Enroll user in course if payment successful
      if (paymentResult.status === 'completed') {
        await this.enrollUserInCourse(courseId, userId);
      }

      return {
        transaction_id: transaction.id,
        course_id: courseId,
        status: paymentResult.status,
        payment_method: paymentMethod,
        amount,
        currency,
        external_id: paymentResult.external_id,
        message: paymentResult.message,
        enrollment_status: paymentResult.status === 'completed' ? 'enrolled' : 'pending_payment'
      };
    } catch (error) {
      console.error('Course purchase payment error:', error);
      throw new Error('Course purchase failed: ' + error.message);
    }
  }

  // Process subscription payment
  async processSubscriptionPayment(paymentData) {
    try {
      const {
        userId,
        subscriptionType,
        amount,
        currency = 'USD',
        paymentMethod,
        paymentMethodId,
        billingCycle = 'monthly',
        metadata = {}
      } = paymentData;

      // Create subscription transaction
      const transaction = await this.createTransaction({
        user_id: userId,
        type: 'subscription_purchase',
        amount,
        currency,
        payment_method_id: paymentMethodId,
        description: `Subscription purchase - ${subscriptionType}`,
        metadata: {
          subscription_type: subscriptionType,
          billing_cycle: billingCycle,
          payment_method: paymentMethod,
          ...metadata
        }
      });

      // Process payment
      const paymentResult = await paymentService.processPayment({
        userId,
        carId: `subscription_${subscriptionType}`, // Reuse car payment logic
        amount,
        currency,
        paymentMethod,
        paymentMethodId,
        metadata: {
          ...metadata,
          subscription_type: subscriptionType,
          billing_cycle: billingCycle,
          transaction_type: 'subscription_purchase'
        }
      });

      // Update transaction
      await this.updateTransaction(transaction.id, {
        status: paymentResult.status,
        external_transaction_id: paymentResult.external_id,
        metadata: {
          ...transaction.metadata,
          payment_result: paymentResult
        }
      });

      // Activate subscription if payment successful
      if (paymentResult.status === 'completed') {
        await this.activateSubscription(userId, subscriptionType, billingCycle);
      }

      return {
        transaction_id: transaction.id,
        subscription_type: subscriptionType,
        status: paymentResult.status,
        payment_method: paymentMethod,
        amount,
        currency,
        external_id: paymentResult.external_id,
        message: paymentResult.message,
        subscription_status: paymentResult.status === 'completed' ? 'active' : 'pending_payment'
      };
    } catch (error) {
      console.error('Subscription payment error:', error);
      throw new Error('Subscription payment failed: ' + error.message);
    }
  }

  // Process certificate payment
  async processCertificatePayment(paymentData) {
    try {
      const {
        userId,
        courseId,
        certificateType = 'completion',
        amount,
        currency = 'USD',
        paymentMethod,
        paymentMethodId,
        metadata = {}
      } = paymentData;

      // Validate user completed the course
      await this.validateCourseCompletion(courseId, userId);

      // Create certificate transaction
      const transaction = await this.createTransaction({
        user_id: userId,
        type: 'certificate_purchase',
        amount,
        currency,
        payment_method_id: paymentMethodId,
        description: `Certificate purchase - ${courseId}`,
        metadata: {
          course_id: courseId,
          certificate_type: certificateType,
          payment_method: paymentMethod,
          ...metadata
        }
      });

      // Process payment
      const paymentResult = await paymentService.processPayment({
        userId,
        carId: `certificate_${courseId}`,
        amount,
        currency,
        paymentMethod,
        paymentMethodId,
        metadata: {
          ...metadata,
          course_id: courseId,
          certificate_type: certificateType,
          transaction_type: 'certificate_purchase'
        }
      });

      // Update transaction
      await this.updateTransaction(transaction.id, {
        status: paymentResult.status,
        external_transaction_id: paymentResult.external_id,
        metadata: {
          ...transaction.metadata,
          payment_result: paymentResult
        }
      });

      // Generate certificate if payment successful
      if (paymentResult.status === 'completed') {
        await this.generateCertificate(userId, courseId, certificateType);
      }

      return {
        transaction_id: transaction.id,
        course_id: courseId,
        certificate_type: certificateType,
        status: paymentResult.status,
        payment_method: paymentMethod,
        amount,
        currency,
        external_id: paymentResult.external_id,
        message: paymentResult.message,
        certificate_status: paymentResult.status === 'completed' ? 'generated' : 'pending_payment'
      };
    } catch (error) {
      console.error('Certificate payment error:', error);
      throw new Error('Certificate payment failed: ' + error.message);
    }
  }

  // Process online class payment
  async processOnlineClassPayment(paymentData) {
    try {
      const {
        userId,
        classId,
        amount,
        currency = 'USD',
        paymentMethod,
        paymentMethodId,
        metadata = {}
      } = paymentData;

      // Validate class exists and is available
      await this.validateOnlineClass(classId, userId);

      // Create class payment transaction
      const transaction = await this.createTransaction({
        user_id: userId,
        type: 'class_purchase',
        amount,
        currency,
        payment_method_id: paymentMethodId,
        description: `Online class purchase - ${classId}`,
        metadata: {
          class_id: classId,
          payment_method: paymentMethod,
          ...metadata
        }
      });

      // Process payment
      const paymentResult = await paymentService.processPayment({
        userId,
        carId: `class_${classId}`,
        amount,
        currency,
        paymentMethod,
        paymentMethodId,
        metadata: {
          ...metadata,
          class_id: classId,
          transaction_type: 'class_purchase'
        }
      });

      // Update transaction
      await this.updateTransaction(transaction.id, {
        status: paymentResult.status,
        external_transaction_id: paymentResult.external_id,
        metadata: {
          ...transaction.metadata,
          payment_result: paymentResult
        }
      });

      // Enroll user in class if payment successful
      if (paymentResult.status === 'completed') {
        await this.enrollUserInClass(classId, userId);
      }

      return {
        transaction_id: transaction.id,
        class_id: classId,
        status: paymentResult.status,
        payment_method: paymentMethod,
        amount,
        currency,
        external_id: paymentResult.external_id,
        message: paymentResult.message,
        enrollment_status: paymentResult.status === 'completed' ? 'enrolled' : 'pending_payment'
      };
    } catch (error) {
      console.error('Online class payment error:', error);
      throw new Error('Online class payment failed: ' + error.message);
    }
  }

  // Get e-learning payment methods
  async getPaymentMethods(userId) {
    try {
      const query = `
        SELECT 
          pm.*,
          CASE WHEN pm.is_default = 1 THEN 'default' ELSE 'secondary' END as status
        FROM payment_methods pm
        WHERE pm.user_id = ? AND pm.is_active = 1
        ORDER BY pm.is_default DESC, pm.created_at DESC
      `;

      const paymentMethods = await executeQuery(query, [userId]);

      return {
        payment_methods: paymentMethods,
        count: paymentMethods.length,
        supported_methods: this.supportedPaymentMethods,
        e_learning_features: [
          'course_purchase',
          'subscription_purchase', 
          'certificate_purchase',
          'class_purchase',
          'bundle_purchase'
        ]
      };
    } catch (error) {
      console.error('Error getting e-learning payment methods:', error);
      throw error;
    }
  }

  // Get e-learning transaction history
  async getTransactionHistory(userId, filters = {}) {
    try {
      let query = `
        SELECT 
          t.*,
          c.title as course_title,
          c.price as course_price,
          oc.title as class_title,
          oc.price as class_price
        FROM transactions t
        LEFT JOIN courses c ON JSON_EXTRACT(t.metadata, '$.course_id') = c.id
        LEFT JOIN online_classes oc ON JSON_EXTRACT(t.metadata, '$.class_id') = oc.id
        WHERE t.user_id = ? AND t.type IN ('course_purchase', 'subscription_purchase', 'certificate_purchase', 'class_purchase')
      `;

      const params = [userId];

      // Apply filters
      if (filters.type) {
        query += ` AND t.type = ?`;
        params.push(filters.type);
      }

      if (filters.status) {
        query += ` AND t.status = ?`;
        params.push(filters.status);
      }

      if (filters.start_date) {
        query += ` AND t.created_at >= ?`;
        params.push(filters.start_date);
      }

      if (filters.end_date) {
        query += ` AND t.created_at <= ?`;
        params.push(filters.end_date);
      }

      query += ` ORDER BY t.created_at DESC`;

      if (filters.limit) {
        query += ` LIMIT ?`;
        params.push(parseInt(filters.limit));
      }

      const transactions = await executeQuery(query, params);

      return {
        transactions: transactions.map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          currency: t.currency,
          status: t.status,
          payment_method: JSON.parse(t.metadata || '{}').payment_method,
          description: t.description,
          course_title: t.course_title,
          class_title: t.class_title,
          created_at: t.created_at,
          updated_at: t.updated_at
        })),
        count: transactions.length,
        filters_applied: filters
      };
    } catch (error) {
      console.error('Error getting e-learning transaction history:', error);
      throw error;
    }
  }

  // Helper methods
  async validateCoursePurchase(courseId, userId) {
    const query = 'SELECT * FROM courses WHERE id = ? AND status = "active"';
    const course = await executeQuery(query, [courseId]);
    
    if (!course[0]) {
      throw new Error('Course not found or not available');
    }

    // Check if user already purchased this course
    const existingPurchase = await executeQuery(
      'SELECT * FROM transactions WHERE user_id = ? AND course_id = ? AND type = "course_purchase" AND status = "completed"',
      [userId, courseId]
    );

    if (existingPurchase.length > 0) {
      throw new Error('Course already purchased');
    }
  }

  async validateCourseCompletion(courseId, userId) {
    const query = `
      SELECT e.* FROM enrollments e 
      WHERE e.course_id = ? AND e.user_id = ? AND e.is_completed = 1
    `;
    const enrollment = await executeQuery(query, [courseId, userId]);
    
    if (!enrollment[0]) {
      throw new Error('Course not completed. Must complete course before purchasing certificate');
    }
  }

  async validateOnlineClass(classId, userId) {
    const query = 'SELECT * FROM online_classes WHERE id = ? AND status = "active"';
    const onlineClass = await executeQuery(query, [classId]);
    
    if (!onlineClass[0]) {
      throw new Error('Online class not found or not available');
    }
  }

  async enrollUserInCourse(courseId, userId) {
    const query = `
      INSERT INTO enrollments (id, course_id, user_id, enrollment_status, enrolled_at)
      VALUES (UUID(), ?, ?, 'enrolled', NOW())
      ON DUPLICATE KEY UPDATE enrollment_status = 'enrolled'
    `;
    await executeQuery(query, [courseId, userId]);
  }

  async enrollUserInClass(classId, userId) {
    const query = `
      INSERT INTO class_enrollments (id, class_id, user_id, enrollment_status, enrolled_at)
      VALUES (UUID(), ?, ?, 'enrolled', NOW())
      ON DUPLICATE KEY UPDATE enrollment_status = 'enrolled'
    `;
    await executeQuery(query, [classId, userId]);
  }

  async activateSubscription(userId, subscriptionType, billingCycle) {
    const query = `
      INSERT INTO subscriptions (id, user_id, subscription_type, billing_cycle, status, activated_at)
      VALUES (UUID(), ?, ?, ?, 'active', NOW())
      ON DUPLICATE KEY UPDATE status = 'active', activated_at = NOW()
    `;
    await executeQuery(query, [userId, subscriptionType, billingCycle]);
  }

  async generateCertificate(userId, courseId, certificateType) {
    const query = `
      UPDATE enrollments 
      SET certificate_issued = 1, certificate_url = ?, certificate_type = ?
      WHERE course_id = ? AND user_id = ?
    `;
    const certificateUrl = `certificates/${userId}_${courseId}_${Date.now()}.pdf`;
    await executeQuery(query, [certificateUrl, certificateType, courseId, userId]);
  }

  async createTransaction(transactionData) {
    const query = `
      INSERT INTO transactions 
      (id, user_id, type, amount, currency, status, payment_method_id, description, metadata, created_at)
      VALUES (UUID(), ?, ?, ?, ?, 'pending', ?, ?, ?, NOW())
    `;

    const result = await executeQuery(query, [
      transactionData.user_id,
      transactionData.type,
      transactionData.amount,
      transactionData.currency,
      transactionData.payment_method_id,
      transactionData.description,
      JSON.stringify(transactionData.metadata)
    ]);

    return { id: result.insertId, ...transactionData };
  }

  async updateTransaction(transactionId, updateData) {
    const query = `
      UPDATE transactions 
      SET status = ?, external_transaction_id = ?, metadata = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await executeQuery(query, [
      updateData.status,
      updateData.external_transaction_id,
      JSON.stringify(updateData.metadata),
      transactionId
    ]);
  }
}

module.exports = new ELearningPaymentService();

