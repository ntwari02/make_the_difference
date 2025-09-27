const { executeQuery } = require('../../config/database');
const crypto = require('crypto');
const paymentService = require('./payment.service');

class EnhancedECommercePaymentService {
  constructor() {
    this.supportedPaymentMethods = [
      'stripe', 'paypal', 'apple_pay', 'google_pay', 
      'crypto', 'bnpl', 'financing', 'bank_transfer', 'mobile_money'
    ];
  }

  // Process car purchase with enhanced features
  async processCarPurchase(paymentData) {
    try {
      const {
        userId,
        carId,
        amount,
        currency = 'USD',
        paymentMethod,
        paymentMethodId,
        tradeInValue = 0,
        downPayment = 0,
        financingOption = null,
        insuranceOption = null,
        warrantyOption = null,
        metadata = {}
      } = paymentData;

      // Validate car exists and is available
      await this.validateCarPurchase(carId, userId);

      // Calculate final amount with options
      const finalAmount = await this.calculateFinalAmount({
        baseAmount: amount,
        tradeInValue,
        downPayment,
        financingOption,
        insuranceOption,
        warrantyOption
      });

      // Create enhanced transaction
      const transaction = await this.createTransaction({
        user_id: userId,
        type: 'car_purchase',
        amount: finalAmount.total,
        currency,
        payment_method_id: paymentMethodId,
        description: `Car purchase - ${carId}`,
        metadata: {
          car_id: carId,
          payment_method: paymentMethod,
          base_amount: amount,
          trade_in_value: tradeInValue,
          down_payment: downPayment,
          financing_option: financingOption,
          insurance_option: insuranceOption,
          warranty_option: warrantyOption,
          breakdown: finalAmount.breakdown,
          ...metadata
        }
      });

      // Process payment
      const paymentResult = await paymentService.processPayment({
        userId,
        carId,
        amount: finalAmount.total,
        currency,
        paymentMethod,
        paymentMethodId,
        metadata: {
          ...metadata,
          transaction_id: transaction.id,
          enhanced_purchase: true
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

      // Process additional services if payment successful
      if (paymentResult.status === 'completed') {
        await this.processAdditionalServices(transaction.id, {
          financingOption,
          insuranceOption,
          warrantyOption
        });
      }

      return {
        transaction_id: transaction.id,
        car_id: carId,
        status: paymentResult.status,
        payment_method: paymentMethod,
        amount: finalAmount.total,
        currency,
        external_id: paymentResult.external_id,
        message: paymentResult.message,
        breakdown: finalAmount.breakdown,
        additional_services: {
          financing: financingOption ? 'activated' : 'none',
          insurance: insuranceOption ? 'activated' : 'none',
          warranty: warrantyOption ? 'activated' : 'none'
        }
      };
    } catch (error) {
      console.error('Enhanced car purchase error:', error);
      throw new Error('Car purchase failed: ' + error.message);
    }
  }

  // Process car financing
  async processCarFinancing(financingData) {
    try {
      const {
        userId,
        carId,
        financingOptionId,
        downPayment,
        tradeInValue = 0,
        loanAmount,
        termMonths,
        metadata = {}
      } = financingData;

      // Get financing option details
      const financingOption = await this.getFinancingOption(financingOptionId);
      if (!financingOption) {
        throw new Error('Financing option not found');
      }

      // Calculate monthly payment
      const monthlyPayment = this.calculateMonthlyPayment(
        loanAmount,
        financingOption.interest_rate,
        termMonths
      );

      // Create financing transaction
      const transaction = await this.createTransaction({
        user_id: userId,
        type: 'car_financing',
        amount: loanAmount,
        currency: 'USD',
        description: `Car financing - ${carId}`,
        metadata: {
          car_id: carId,
          financing_option_id: financingOptionId,
          down_payment: downPayment,
          trade_in_value: tradeInValue,
          loan_amount: loanAmount,
          term_months: termMonths,
          interest_rate: financingOption.interest_rate,
          monthly_payment: monthlyPayment,
          provider: financingOption.provider,
          ...metadata
        }
      });

      // Process financing application
      const financingResult = await this.submitFinancingApplication({
        userId,
        carId,
        financingOption,
        loanAmount,
        termMonths,
        downPayment,
        tradeInValue
      });

      // Update transaction
      await this.updateTransaction(transaction.id, {
        status: financingResult.status,
        external_transaction_id: financingResult.application_id,
        metadata: {
          ...transaction.metadata,
          financing_result: financingResult
        }
      });

      return {
        transaction_id: transaction.id,
        car_id: carId,
        financing_option: financingOption,
        loan_amount: loanAmount,
        monthly_payment: monthlyPayment,
        term_months: termMonths,
        status: financingResult.status,
        application_id: financingResult.application_id,
        message: financingResult.message
      };
    } catch (error) {
      console.error('Car financing error:', error);
      throw new Error('Car financing failed: ' + error.message);
    }
  }

  // Process trade-in valuation and payment
  async processTradeIn(tradeInData) {
    try {
      const {
        userId,
        carId,
        tradeInCarData,
        tradeInValue,
        paymentMethod,
        paymentMethodId,
        metadata = {}
      } = tradeInData;

      // Validate trade-in car data
      const validatedTradeIn = await this.validateTradeInCar(tradeInCarData);

      // Calculate final trade-in value
      const finalTradeInValue = await this.calculateTradeInValue(validatedTradeIn);

      // Create trade-in transaction
      const transaction = await this.createTransaction({
        user_id: userId,
        type: 'trade_in',
        amount: finalTradeInValue,
        currency: 'USD',
        description: `Trade-in - ${validatedTradeIn.brand} ${validatedTradeIn.model}`,
        metadata: {
          car_id: carId,
          trade_in_car: validatedTradeIn,
          trade_in_value: finalTradeInValue,
          payment_method: paymentMethod,
          ...metadata
        }
      });

      // Process trade-in payment
      const paymentResult = await paymentService.processPayment({
        userId,
        carId: `trade_in_${transaction.id}`,
        amount: finalTradeInValue,
        currency: 'USD',
        paymentMethod,
        paymentMethodId,
        metadata: {
          ...metadata,
          trade_in_transaction_id: transaction.id,
          transaction_type: 'trade_in'
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

      return {
        transaction_id: transaction.id,
        car_id: carId,
        trade_in_car: validatedTradeIn,
        trade_in_value: finalTradeInValue,
        status: paymentResult.status,
        payment_method: paymentMethod,
        external_id: paymentResult.external_id,
        message: paymentResult.message
      };
    } catch (error) {
      console.error('Trade-in error:', error);
      throw new Error('Trade-in failed: ' + error.message);
    }
  }

  // Process car insurance purchase
  async processCarInsurance(insuranceData) {
    try {
      const {
        userId,
        carId,
        insuranceOption,
        coverageType,
        amount,
        currency = 'USD',
        paymentMethod,
        paymentMethodId,
        metadata = {}
      } = insuranceData;

      // Get insurance quote
      const insuranceQuote = await this.getInsuranceQuote({
        carId,
        userId,
        coverageType,
        ...insuranceOption
      });

      // Create insurance transaction
      const transaction = await this.createTransaction({
        user_id: userId,
        type: 'car_insurance',
        amount: insuranceQuote.premium,
        currency,
        description: `Car insurance - ${carId}`,
        metadata: {
          car_id: carId,
          insurance_option: insuranceOption,
          coverage_type: coverageType,
          premium: insuranceQuote.premium,
          coverage_details: insuranceQuote.coverage_details,
          payment_method: paymentMethod,
          ...metadata
        }
      });

      // Process insurance payment
      const paymentResult = await paymentService.processPayment({
        userId,
        carId: `insurance_${carId}`,
        amount: insuranceQuote.premium,
        currency,
        paymentMethod,
        paymentMethodId,
        metadata: {
          ...metadata,
          insurance_transaction_id: transaction.id,
          transaction_type: 'car_insurance'
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

      // Activate insurance if payment successful
      if (paymentResult.status === 'completed') {
        await this.activateCarInsurance(userId, carId, insuranceQuote);
      }

      return {
        transaction_id: transaction.id,
        car_id: carId,
        insurance_quote: insuranceQuote,
        status: paymentResult.status,
        payment_method: paymentMethod,
        external_id: paymentResult.external_id,
        message: paymentResult.message,
        insurance_status: paymentResult.status === 'completed' ? 'active' : 'pending'
      };
    } catch (error) {
      console.error('Car insurance error:', error);
      throw new Error('Car insurance failed: ' + error.message);
    }
  }

  // Get enhanced car pricing with all options
  async getEnhancedCarPricing(carId, userId, options = {}) {
    try {
      const {
        tradeInValue = 0,
        downPayment = 0,
        financingOption = null,
        insuranceOption = null,
        warrantyOption = null
      } = options;

      // Get car details
      const car = await this.getCarById(carId);
      if (!car) {
        throw new Error('Car not found');
      }

      // Calculate pricing breakdown
      const pricing = await this.calculateFinalAmount({
        baseAmount: car.price,
        tradeInValue,
        downPayment,
        financingOption,
        insuranceOption,
        warrantyOption
      });

      // Get available financing options
      const financingOptions = await this.getAvailableFinancingOptions(car.price, userId);

      // Get insurance quotes
      const insuranceQuotes = await this.getAvailableInsuranceOptions(carId, userId);

      // Get warranty options
      const warrantyOptions = await this.getAvailableWarrantyOptions(carId);

      return {
        car: {
          id: car.id,
          brand: car.brand,
          model: car.model,
          year: car.year,
          price: car.price,
          currency: car.currency || 'USD'
        },
        pricing_breakdown: pricing.breakdown,
        total_amount: pricing.total,
        financing_options: financingOptions,
        insurance_options: insuranceQuotes,
        warranty_options: warrantyOptions,
        trade_in_value: tradeInValue,
        down_payment: downPayment,
        payment_methods: this.supportedPaymentMethods
      };
    } catch (error) {
      console.error('Error getting enhanced car pricing:', error);
      throw error;
    }
  }

  // Helper methods
  async validateCarPurchase(carId, userId) {
    const query = 'SELECT * FROM cars WHERE id = ? AND status = "active"';
    const car = await executeQuery(query, [carId]);
    
    if (!car[0]) {
      throw new Error('Car not found or not available');
    }

    // Check if car is already sold
    const existingSale = await executeQuery(
      'SELECT * FROM transactions WHERE car_id = ? AND type = "car_purchase" AND status = "completed"',
      [carId]
    );

    if (existingSale.length > 0) {
      throw new Error('Car is no longer available');
    }
  }

  async calculateFinalAmount(options) {
    const {
      baseAmount,
      tradeInValue,
      downPayment,
      financingOption,
      insuranceOption,
      warrantyOption
    } = options;

    const breakdown = {
      base_price: baseAmount,
      trade_in_value: tradeInValue,
      down_payment: downPayment,
      subtotal: baseAmount - tradeInValue - downPayment
    };

    let total = breakdown.subtotal;

    // Add financing costs
    if (financingOption) {
      const financingCost = this.calculateFinancingCost(breakdown.subtotal, financingOption);
      breakdown.financing_cost = financingCost;
      total += financingCost;
    }

    // Add insurance costs
    if (insuranceOption) {
      const insuranceCost = this.calculateInsuranceCost(insuranceOption);
      breakdown.insurance_cost = insuranceCost;
      total += insuranceCost;
    }

    // Add warranty costs
    if (warrantyOption) {
      const warrantyCost = this.calculateWarrantyCost(warrantyOption);
      breakdown.warranty_cost = warrantyCost;
      total += warrantyCost;
    }

    breakdown.total = total;

    return { breakdown, total };
  }

  calculateFinancingCost(amount, financingOption) {
    const monthlyPayment = this.calculateMonthlyPayment(
      amount,
      financingOption.interest_rate,
      financingOption.term_months
    );
    return (monthlyPayment * financingOption.term_months) - amount;
  }

  calculateInsuranceCost(insuranceOption) {
    return insuranceOption.premium || 0;
  }

  calculateWarrantyCost(warrantyOption) {
    return warrantyOption.price || 0;
  }

  calculateMonthlyPayment(principal, annualRate, months) {
    const monthlyRate = annualRate / 100 / 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
           (Math.pow(1 + monthlyRate, months) - 1);
  }

  async getFinancingOption(financingOptionId) {
    const query = 'SELECT * FROM financing_options WHERE id = ?';
    const result = await executeQuery(query, [financingOptionId]);
    return result[0] || null;
  }

  async getAvailableFinancingOptions(carPrice, userId) {
    // Mock financing options - would be fetched from external APIs
    return [
      {
        id: crypto.randomUUID(),
        provider: 'Bank of America',
        interest_rate: 3.5,
        term_months: 60,
        monthly_payment: Math.round(carPrice * 0.018),
        down_payment_required: Math.round(carPrice * 0.1),
        approval_time: '24 hours'
      },
      {
        id: crypto.randomUUID(),
        provider: 'Wells Fargo',
        interest_rate: 4.2,
        term_months: 72,
        monthly_payment: Math.round(carPrice * 0.016),
        down_payment_required: Math.round(carPrice * 0.05),
        approval_time: '48 hours'
      }
    ];
  }

  async getAvailableInsuranceOptions(carId, userId) {
    // Mock insurance options - would be fetched from external APIs
    return [
      {
        id: crypto.randomUUID(),
        provider: 'State Farm',
        premium: 1200,
        coverage_type: 'full',
        deductible: 500
      },
      {
        id: crypto.randomUUID(),
        provider: 'Geico',
        premium: 1000,
        coverage_type: 'full',
        deductible: 1000
      }
    ];
  }

  async getAvailableWarrantyOptions(carId) {
    // Mock warranty options
    return [
      {
        id: crypto.randomUUID(),
        provider: 'Extended Warranty Co',
        price: 2500,
        term_months: 36,
        coverage: 'comprehensive'
      }
    ];
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

  async getCarById(carId) {
    const query = 'SELECT * FROM cars WHERE id = ?';
    const result = await executeQuery(query, [carId]);
    return result[0] || null;
  }

  // Additional helper methods would be implemented here...
  async processAdditionalServices(transactionId, services) {
    // Process financing, insurance, warranty activation
    console.log('Processing additional services for transaction:', transactionId, services);
  }

  async submitFinancingApplication(data) {
    // Submit financing application to external provider
    return {
      status: 'pending',
      application_id: crypto.randomUUID(),
      message: 'Financing application submitted successfully'
    };
  }

  async validateTradeInCar(carData) {
    // Validate trade-in car data
    return carData;
  }

  async calculateTradeInValue(carData) {
    // Calculate trade-in value
    return 15000; // Mock value
  }

  async getInsuranceQuote(data) {
    // Get insurance quote
    return {
      premium: 1200,
      coverage_details: {
        comprehensive: true,
        collision: true,
        liability: true
      }
    };
  }

  async activateCarInsurance(userId, carId, insuranceQuote) {
    // Activate car insurance
    console.log('Activating car insurance for user:', userId, 'car:', carId);
  }
}

module.exports = new EnhancedECommercePaymentService();

