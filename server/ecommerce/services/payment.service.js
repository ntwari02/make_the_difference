const { executeQuery } = require('../../config/database');
const crypto = require('crypto');
const serviceFeeService = require('../../services/service-fee.service');

class PaymentService {
  constructor() {
    this.supportedPaymentMethods = [
      'stripe',
      'paypal',
      'apple_pay',
      'google_pay',
      'crypto',
      'bnpl',
      'financing',
      'bank_transfer',
      'mobile_money'
    ];
  }

  // Process payment with multiple payment methods
  async processPayment(paymentData) {
    try {
      const {
        userId,
        carId,
        amount,
        currency = 'USD',
        paymentMethod,
        paymentMethodId,
        metadata = {}
      } = paymentData;

      // Validate payment data
      await this.validatePaymentData(paymentData);

      // Create transaction record
      const transaction = await this.createTransaction({
        user_id: userId,
        type: 'car_purchase',
        amount,
        currency,
        payment_method_id: paymentMethodId,
        description: `Car purchase - ${carId}`,
        metadata: {
          car_id: carId,
          payment_method,
          ...metadata
        }
      });

      // Process payment based on method
      let paymentResult;
      switch (paymentMethod) {
        case 'stripe':
          paymentResult = await this.processStripePayment(transaction, paymentData);
          break;
        case 'paypal':
          paymentResult = await this.processPayPalPayment(transaction, paymentData);
          break;
        case 'apple_pay':
          paymentResult = await this.processApplePayPayment(transaction, paymentData);
          break;
        case 'google_pay':
          paymentResult = await this.processGooglePayPayment(transaction, paymentData);
          break;
        case 'crypto':
          paymentResult = await this.processCryptoPayment(transaction, paymentData);
          break;
        case 'bnpl':
          paymentResult = await this.processBNPLPayment(transaction, paymentData);
          break;
        case 'financing':
          paymentResult = await this.processFinancingPayment(transaction, paymentData);
          break;
        case 'bank_transfer':
          paymentResult = await this.processBankTransferPayment(transaction, paymentData);
          break;
        case 'mobile_money':
          paymentResult = await this.processMobileMoneyPayment(transaction, paymentData);
          break;
        default:
          throw new Error('Unsupported payment method');
      }

      // Update transaction with payment result
      await this.updateTransaction(transaction.id, {
        status: paymentResult.status,
        external_transaction_id: paymentResult.externalId,
        metadata: {
          ...transaction.metadata,
          payment_result: paymentResult
        }
      });

      return {
        transaction_id: transaction.id,
        status: paymentResult.status,
        payment_method: paymentMethod,
        amount,
        currency,
        external_id: paymentResult.externalId,
        message: paymentResult.message
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      throw new Error('Payment processing failed: ' + error.message);
    }
  }

  // Get financing options for a car
  async getFinancingOptions(carPrice, userProfile) {
    try {
      const financingOptions = [];

      // Bank financing options
      const bankOptions = await this.getBankFinancingOptions(carPrice, userProfile);
      financingOptions.push(...bankOptions);

      // Dealer financing options
      const dealerOptions = await this.getDealerFinancingOptions(carPrice, userProfile);
      financingOptions.push(...dealerOptions);

      // BNPL options
      const bnplOptions = await this.getBNPLOptions(carPrice, userProfile);
      financingOptions.push(...bnplOptions);

      // Sort by interest rate
      financingOptions.sort((a, b) => a.interest_rate - b.interest_rate);

      return {
        car_price: carPrice,
        financing_options: financingOptions,
        count: financingOptions.length,
        recommended: financingOptions[0] || null
      };
    } catch (error) {
      console.error('Error getting financing options:', error);
      throw new Error('Failed to get financing options: ' + error.message);
    }
  }

  // Pre-approval for financing
  async getPreApproval(userId, carPrice, financingOptionId) {
    try {
      const user = await this.getUserProfile(userId);
      const financingOption = await this.getFinancingOptionById(financingOptionId);

      if (!financingOption) {
        throw new Error('Financing option not found');
      }

      // Calculate pre-approval based on user profile and financing option
      const preApproval = await this.calculatePreApproval(user, carPrice, financingOption);

      // Store pre-approval result
      await this.storePreApproval(userId, financingOptionId, preApproval);

      return preApproval;
    } catch (error) {
      console.error('Error getting pre-approval:', error);
      throw new Error('Pre-approval failed: ' + error.message);
    }
  }

  // Escrow system for secure payments
  async createEscrowPayment(paymentData) {
    try {
      const {
        buyerId,
        sellerId,
        carId,
        amount,
        currency = 'USD',
        paymentMethod
      } = paymentData;

      // Create escrow transaction
      const escrowTransaction = await this.createTransaction({
        user_id: buyerId,
        type: 'car_purchase',
        amount,
        currency,
        description: `Escrow payment for car ${carId}`,
        metadata: {
          car_id: carId,
          seller_id: sellerId,
          payment_method: paymentMethod,
          escrow: true
        }
      });

      // Process payment to escrow
      const paymentResult = await this.processPayment({
        ...paymentData,
        userId: buyerId,
        metadata: {
          ...paymentData.metadata,
          escrow_transaction_id: escrowTransaction.id
        }
      });

      // Create escrow record
      const escrowRecord = await this.createEscrowRecord({
        transaction_id: escrowTransaction.id,
        buyer_id: buyerId,
        seller_id: sellerId,
        car_id: carId,
        amount,
        currency,
        status: 'pending_delivery'
      });

      return {
        escrow_id: escrowRecord.id,
        transaction_id: escrowTransaction.id,
        status: 'pending_delivery',
        amount,
        currency,
        message: 'Payment held in escrow until delivery confirmation'
      };
    } catch (error) {
      console.error('Error creating escrow payment:', error);
      throw new Error('Escrow payment failed: ' + error.message);
    }
  }

  // Release escrow payment
  async releaseEscrowPayment(escrowId, userId, confirmationData) {
    try {
      const escrowRecord = await this.getEscrowRecord(escrowId);

      if (!escrowRecord) {
        throw new Error('Escrow record not found');
      }

      // Verify user authorization (buyer or admin)
      if (escrowRecord.buyer_id !== userId) {
        const user = await this.getUserById(userId);
        if (user.role !== 'admin') {
          throw new Error('Unauthorized to release escrow');
        }
      }

      // Update escrow status
      await this.updateEscrowRecord(escrowId, {
        status: 'released',
        released_at: new Date(),
        confirmation_data: confirmationData
      });

      // Create payment to seller
      const sellerPayment = await this.createTransaction({
        user_id: escrowRecord.seller_id,
        type: 'car_sale',
        amount: escrowRecord.amount,
        currency: escrowRecord.currency,
        description: `Payment for car sale - ${escrowRecord.car_id}`,
        metadata: {
          car_id: escrowRecord.car_id,
          buyer_id: escrowRecord.buyer_id,
          escrow_id: escrowId
        }
      });

      return {
        escrow_id: escrowId,
        seller_payment_id: sellerPayment.id,
        status: 'released',
        message: 'Escrow payment released to seller'
      };
    } catch (error) {
      console.error('Error releasing escrow payment:', error);
      throw new Error('Escrow release failed: ' + error.message);
    }
  }

  // Trade-in calculator
  async calculateTradeInValue(carData, userLocation) {
    try {
      const {
        brand,
        model,
        year,
        mileage,
        condition,
        features = []
      } = carData;

      // Get market value
      const marketValue = await this.getMarketValue(brand, model, year, mileage, condition);

      // Apply location adjustment
      const locationAdjustment = await this.getLocationAdjustment(userLocation);

      // Apply condition adjustment
      const conditionAdjustment = this.getConditionAdjustment(condition);

      // Apply feature adjustments
      const featureAdjustment = this.getFeatureAdjustment(features);

      // Calculate trade-in value
      const tradeInValue = marketValue * locationAdjustment * conditionAdjustment * featureAdjustment;

      return {
        car_data: carData,
        market_value: marketValue,
        trade_in_value: Math.round(tradeInValue),
        adjustments: {
          location: locationAdjustment,
          condition: conditionAdjustment,
          features: featureAdjustment
        },
        confidence_score: 0.85 // Simulated confidence score
      };
    } catch (error) {
      console.error('Error calculating trade-in value:', error);
      throw new Error('Trade-in calculation failed: ' + error.message);
    }
  }

  // Insurance integration
  async getInsuranceQuote(carData, userProfile) {
    try {
      const {
        brand,
        model,
        year,
        value,
        userAge,
        userLocation,
        drivingHistory = 'clean'
      } = { ...carData, ...userProfile };

      // Simulate insurance quote calculation
      const baseRate = value * 0.03; // 3% of car value
      const ageAdjustment = userAge < 25 ? 1.5 : userAge > 65 ? 1.2 : 1.0;
      const locationAdjustment = this.getLocationRiskAdjustment(userLocation);
      const historyAdjustment = this.getDrivingHistoryAdjustment(drivingHistory);

      const monthlyPremium = baseRate * ageAdjustment * locationAdjustment * historyAdjustment / 12;

      return {
        car_data: carData,
        user_profile: userProfile,
        monthly_premium: Math.round(monthlyPremium),
        annual_premium: Math.round(monthlyPremium * 12),
        coverage_details: {
          comprehensive: true,
          collision: true,
          liability: true,
          uninsured_motorist: true
        },
        deductible: 500,
        quote_valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      };
    } catch (error) {
      console.error('Error getting insurance quote:', error);
      throw new Error('Insurance quote failed: ' + error.message);
    }
  }

  // Helper methods
  async validatePaymentData(paymentData) {
    const { userId, carId, amount, paymentMethod } = paymentData;

    if (!userId || !carId || !amount || !paymentMethod) {
      throw new Error('Missing required payment data');
    }

    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    if (!this.supportedPaymentMethods.includes(paymentMethod)) {
      throw new Error('Unsupported payment method');
    }

    // Verify car exists and is available
    const car = await this.getCarById(carId);
    if (!car || car.status !== 'active') {
      throw new Error('Car not available for purchase');
    }
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

  // Simulated payment method implementations
  async processStripePayment(transaction, paymentData) {
    // Simulate Stripe payment processing
    return {
      status: 'completed',
      externalId: 'stripe_' + crypto.randomUUID(),
      message: 'Payment processed successfully via Stripe'
    };
  }

  async processPayPalPayment(transaction, paymentData) {
    // Simulate PayPal payment processing
    return {
      status: 'completed',
      externalId: 'paypal_' + crypto.randomUUID(),
      message: 'Payment processed successfully via PayPal'
    };
  }

  async processApplePayPayment(transaction, paymentData) {
    // Simulate Apple Pay payment processing
    return {
      status: 'completed',
      externalId: 'apple_' + crypto.randomUUID(),
      message: 'Payment processed successfully via Apple Pay'
    };
  }

  async processGooglePayPayment(transaction, paymentData) {
    // Simulate Google Pay payment processing
    return {
      status: 'completed',
      externalId: 'google_' + crypto.randomUUID(),
      message: 'Payment processed successfully via Google Pay'
    };
  }

  async processCryptoPayment(transaction, paymentData) {
    // Simulate cryptocurrency payment processing
    return {
      status: 'completed',
      externalId: 'crypto_' + crypto.randomUUID(),
      message: 'Payment processed successfully via cryptocurrency'
    };
  }

  async processBNPLPayment(transaction, paymentData) {
    // Simulate BNPL payment processing
    return {
      status: 'completed',
      externalId: 'bnpl_' + crypto.randomUUID(),
      message: 'Payment processed successfully via BNPL'
    };
  }

  async processFinancingPayment(transaction, paymentData) {
    // Simulate financing payment processing
    return {
      status: 'completed',
      externalId: 'financing_' + crypto.randomUUID(),
      message: 'Payment processed successfully via financing'
    };
  }

  async processBankTransferPayment(transaction, paymentData) {
    // Simulate bank transfer payment processing
    return {
      status: 'pending',
      externalId: 'bank_' + crypto.randomUUID(),
      message: 'Bank transfer initiated, payment will be processed within 1-3 business days'
    };
  }

  async processMobileMoneyPayment(transaction, paymentData) {
    // Simulate mobile money payment processing
    return {
      status: 'completed',
      externalId: 'mobile_' + crypto.randomUUID(),
      message: 'Payment processed successfully via mobile money'
    };
  }

  // Additional helper methods would be implemented here...
  async getCarById(carId) {
    const query = 'SELECT * FROM cars WHERE id = ?';
    const result = await executeQuery(query, [carId]);
    return result[0] || null;
  }

  async getUserById(userId) {
    const query = 'SELECT * FROM users WHERE id = ?';
    const result = await executeQuery(query, [userId]);
    return result[0] || null;
  }

  getLocationRiskAdjustment(location) {
    // Simulate location-based risk adjustment
    const highRiskLocations = ['NYC', 'LA', 'Chicago'];
    return highRiskLocations.includes(location) ? 1.3 : 1.0;
  }

  getDrivingHistoryAdjustment(history) {
    const adjustments = {
      clean: 1.0,
      minor_violations: 1.2,
      major_violations: 1.5,
      accidents: 1.8
    };
    return adjustments[history] || 1.0;
  }

  getConditionAdjustment(condition) {
    const adjustments = {
      new: 1.0,
      certified: 0.95,
      used: 0.85
    };
    return adjustments[condition] || 0.85;
  }

  getFeatureAdjustment(features) {
    // Simulate feature-based value adjustment
    return 1.0 + (features.length * 0.02);
  }

  // Process service fee payment
  async processServiceFeePayment(paymentData) {
    try {
      const {
        transactionId,
        userId,
        amount,
        currency = 'USD',
        paymentMethod,
        paymentMethodId,
        metadata = {}
      } = paymentData;

      // Validate payment data
      await this.validatePaymentData({
        userId,
        amount,
        currency,
        paymentMethod,
        paymentMethodId
      });

      // Get service fee transaction
      const serviceFeeTransaction = await serviceFeeService.getServiceFeeTransaction(transactionId);
      
      if (!serviceFeeTransaction) {
        throw new Error('Service fee transaction not found');
      }

      if (serviceFeeTransaction.user_id !== userId) {
        throw new Error('Unauthorized access to transaction');
      }

      if (serviceFeeTransaction.status !== 'pending') {
        throw new Error('Transaction is not in pending status');
      }

      // Verify amount matches
      if (parseFloat(amount) !== parseFloat(serviceFeeTransaction.total_amount)) {
        throw new Error('Payment amount does not match transaction amount');
      }

      // Create payment transaction record
      const paymentTransaction = await this.createTransaction({
        user_id: userId,
        type: 'service_fee',
        amount,
        currency,
        payment_method_id: paymentMethodId,
        description: `Service fee payment - ${serviceFeeTransaction.service_type}`,
        metadata: {
          service_fee_transaction_id: transactionId,
          service_type: serviceFeeTransaction.service_type,
          service_id: serviceFeeTransaction.service_id,
          payment_method,
          ...metadata
        }
      });

      // Process payment based on method
      let paymentResult;
      switch (paymentMethod) {
        case 'stripe':
          paymentResult = await this.processStripePayment(paymentTransaction, paymentData);
          break;
        case 'paypal':
          paymentResult = await this.processPayPalPayment(paymentTransaction, paymentData);
          break;
        case 'apple_pay':
          paymentResult = await this.processApplePayPayment(paymentTransaction, paymentData);
          break;
        case 'google_pay':
          paymentResult = await this.processGooglePayPayment(paymentTransaction, paymentData);
          break;
        case 'crypto':
          paymentResult = await this.processCryptoPayment(paymentTransaction, paymentData);
          break;
        case 'bnpl':
          paymentResult = await this.processBNPLPayment(paymentTransaction, paymentData);
          break;
        case 'financing':
          paymentResult = await this.processFinancingPayment(paymentTransaction, paymentData);
          break;
        case 'bank_transfer':
          paymentResult = await this.processBankTransferPayment(paymentTransaction, paymentData);
          break;
        case 'mobile_money':
          paymentResult = await this.processMobileMoneyPayment(paymentTransaction, paymentData);
          break;
        default:
          throw new Error('Unsupported payment method');
      }

      // Update payment transaction with result
      await this.updateTransaction(paymentTransaction.id, {
        status: paymentResult.status,
        external_transaction_id: paymentResult.externalId,
        metadata: {
          ...paymentTransaction.metadata,
          payment_result: paymentResult
        }
      });

      // Update service fee transaction
      await serviceFeeService.updateServiceFeeTransaction(transactionId, {
        status: paymentResult.status === 'completed' ? 'completed' : 'failed',
        payment_method: paymentMethod,
        external_transaction_id: paymentResult.externalId,
        payment_details: {
          payment_transaction_id: paymentTransaction.id,
          payment_result: paymentResult,
          processed_at: new Date().toISOString()
        }
      });

      return {
        payment_transaction_id: paymentTransaction.id,
        service_fee_transaction_id: transactionId,
        status: paymentResult.status,
        payment_method: paymentMethod,
        amount,
        currency,
        external_id: paymentResult.externalId,
        message: paymentResult.message
      };
    } catch (error) {
      console.error('Service fee payment processing error:', error);
      throw error;
    }
  }

  // Process scholarship application payment
  async processScholarshipApplicationPayment(transactionId, paymentData) {
    try {
      const scholarshipService = require('../../services/scholarship.service');
      
      // Process the service fee payment
      const paymentResult = await this.processServiceFeePayment({
        transactionId,
        userId: paymentData.userId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentMethod: paymentData.paymentMethod,
        paymentMethodId: paymentData.paymentMethodId,
        metadata: paymentData.metadata
      });

      // Update scholarship application status
      await scholarshipService.processApplicationPayment(transactionId, {
        status: paymentResult.status,
        payment_method: paymentData.paymentMethod,
        external_transaction_id: paymentResult.external_id,
        payment_details: paymentResult
      });

      return paymentResult;
    } catch (error) {
      console.error('Scholarship application payment error:', error);
      throw error;
    }
  }

  // Process visa application payment
  async processVisaApplicationPayment(transactionId, paymentData) {
    try {
      const visaService = require('../../services/visa.service');
      
      // Process the service fee payment
      const paymentResult = await this.processServiceFeePayment({
        transactionId,
        userId: paymentData.userId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentMethod: paymentData.paymentMethod,
        paymentMethodId: paymentData.paymentMethodId,
        metadata: paymentData.metadata
      });

      // Update visa application status
      await visaService.processApplicationPayment(transactionId, {
        status: paymentResult.status,
        payment_method: paymentData.paymentMethod,
        external_transaction_id: paymentResult.external_id,
        payment_details: paymentResult
      });

      return paymentResult;
    } catch (error) {
      console.error('Visa application payment error:', error);
      throw error;
    }
  }

  // Get service fee payment history
  async getServiceFeePaymentHistory(userId, filters = {}) {
    try {
      const transactions = await serviceFeeService.getUserServiceFeeTransactions(userId, filters);
      
      return transactions.map(transaction => ({
        transaction_id: transaction.id,
        service_type: transaction.service_type,
        service_id: transaction.service_id,
        total_amount: transaction.total_amount,
        currency: transaction.currency,
        payment_method: transaction.payment_method,
        status: transaction.status,
        fee_breakdown: transaction.fee_breakdown,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at
      }));
    } catch (error) {
      console.error('Error getting service fee payment history:', error);
      throw error;
    }
  }

  // Refund service fee payment
  async refundServiceFeePayment(transactionId, refundData) {
    try {
      const {
        reason,
        amount = null, // Partial refund if specified
        refundMethod = 'original'
      } = refundData;

      // Get service fee transaction
      const transaction = await serviceFeeService.getServiceFeeTransaction(transactionId);
      
      if (!transaction) {
        throw new Error('Service fee transaction not found');
      }

      if (transaction.status !== 'completed') {
        throw new Error('Can only refund completed transactions');
      }

      const refundAmount = amount || transaction.total_amount;

      // Process refund based on original payment method
      let refundResult;
      switch (transaction.payment_method) {
        case 'stripe':
          refundResult = await this.processStripeRefund(transaction, refundAmount, reason);
          break;
        case 'paypal':
          refundResult = await this.processPayPalRefund(transaction, refundAmount, reason);
          break;
        default:
          throw new Error(`Refunds not supported for ${transaction.payment_method}`);
      }

      // Update service fee transaction status
      await serviceFeeService.updateServiceFeeTransaction(transactionId, {
        status: refundResult.status === 'completed' ? 'refunded' : 'refund_failed',
        payment_details: {
          ...transaction.payment_details,
          refund: {
            refund_id: refundResult.refundId,
            amount: refundAmount,
            reason,
            processed_at: new Date().toISOString()
          }
        }
      });

      return {
        success: true,
        transaction_id: transactionId,
        refund_id: refundResult.refundId,
        refund_amount: refundAmount,
        status: refundResult.status
      };
    } catch (error) {
      console.error('Error processing service fee refund:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
