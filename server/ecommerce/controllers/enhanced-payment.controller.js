const { ok, badRequest, notFound } = require('../../utils/response');
const enhancedPaymentService = require('../services/enhanced-payment.service');

// Process enhanced car purchase
const processEnhancedCarPurchase = async (req, res) => {
  try {
    const {
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
      tradeInValue: parseFloat(tradeInValue),
      downPayment: parseFloat(downPayment),
      financingOption,
      insuranceOption,
      warrantyOption,
      metadata
    };

    const result = await enhancedPaymentService.processCarPurchase(paymentData);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Process car financing
const processCarFinancing = async (req, res) => {
  try {
    const {
      carId,
      financingOptionId,
      downPayment,
      tradeInValue = 0,
      loanAmount,
      termMonths,
      metadata = {}
    } = req.body;

    const userId = req.user.id;

    if (!carId || !financingOptionId || !loanAmount || !termMonths) {
      return badRequest(res, 'Car ID, financing option ID, loan amount, and term months are required');
    }

    const financingData = {
      userId,
      carId,
      financingOptionId,
      downPayment: parseFloat(downPayment),
      tradeInValue: parseFloat(tradeInValue),
      loanAmount: parseFloat(loanAmount),
      termMonths: parseInt(termMonths),
      metadata
    };

    const result = await enhancedPaymentService.processCarFinancing(financingData);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Process trade-in
const processTradeIn = async (req, res) => {
  try {
    const {
      carId,
      tradeInCarData,
      tradeInValue,
      paymentMethod,
      paymentMethodId,
      metadata = {}
    } = req.body;

    const userId = req.user.id;

    if (!carId || !tradeInCarData || !paymentMethod) {
      return badRequest(res, 'Car ID, trade-in car data, and payment method are required');
    }

    const tradeInData = {
      userId,
      carId,
      tradeInCarData,
      tradeInValue: parseFloat(tradeInValue),
      paymentMethod,
      paymentMethodId,
      metadata
    };

    const result = await enhancedPaymentService.processTradeIn(tradeInData);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Process car insurance
const processCarInsurance = async (req, res) => {
  try {
    const {
      carId,
      insuranceOption,
      coverageType,
      amount,
      currency = 'USD',
      paymentMethod,
      paymentMethodId,
      metadata = {}
    } = req.body;

    const userId = req.user.id;

    if (!carId || !insuranceOption || !coverageType || !paymentMethod) {
      return badRequest(res, 'Car ID, insurance option, coverage type, and payment method are required');
    }

    const insuranceData = {
      userId,
      carId,
      insuranceOption,
      coverageType,
      amount: parseFloat(amount),
      currency,
      paymentMethod,
      paymentMethodId,
      metadata
    };

    const result = await enhancedPaymentService.processCarInsurance(insuranceData);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get enhanced car pricing
const getEnhancedCarPricing = async (req, res) => {
  try {
    const { carId } = req.params;
    const userId = req.user.id;
    const options = req.query;

    const result = await enhancedPaymentService.getEnhancedCarPricing(carId, userId, {
      tradeInValue: parseFloat(options.tradeInValue) || 0,
      downPayment: parseFloat(options.downPayment) || 0,
      financingOption: options.financingOption ? JSON.parse(options.financingOption) : null,
      insuranceOption: options.insuranceOption ? JSON.parse(options.insuranceOption) : null,
      warrantyOption: options.warrantyOption ? JSON.parse(options.warrantyOption) : null
    });

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get financing options for a car
const getCarFinancingOptions = async (req, res) => {
  try {
    const { carId } = req.params;
    const userId = req.user.id;

    const car = await enhancedPaymentService.getCarById(carId);
    if (!car) {
      return notFound(res, 'Car not found');
    }

    const financingOptions = await enhancedPaymentService.getAvailableFinancingOptions(car.price, userId);

    return ok(res, {
      car_id: carId,
      car_price: car.price,
      financing_options: financingOptions,
      count: financingOptions.length
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get insurance options for a car
const getCarInsuranceOptions = async (req, res) => {
  try {
    const { carId } = req.params;
    const userId = req.user.id;

    const insuranceOptions = await enhancedPaymentService.getAvailableInsuranceOptions(carId, userId);

    return ok(res, {
      car_id: carId,
      insurance_options: insuranceOptions,
      count: insuranceOptions.length
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get warranty options for a car
const getCarWarrantyOptions = async (req, res) => {
  try {
    const { carId } = req.params;

    const warrantyOptions = await enhancedPaymentService.getAvailableWarrantyOptions(carId);

    return ok(res, {
      car_id: carId,
      warranty_options: warrantyOptions,
      count: warrantyOptions.length
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Calculate trade-in value
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

    if (!brand || !model || !year || !mileage || !condition) {
      return badRequest(res, 'Brand, model, year, mileage, and condition are required');
    }

    const tradeInCarData = {
      brand,
      model,
      year: parseInt(year),
      mileage: parseInt(mileage),
      condition,
      features
    };

    const validatedTradeIn = await enhancedPaymentService.validateTradeInCar(tradeInCarData);
    const tradeInValue = await enhancedPaymentService.calculateTradeInValue(validatedTradeIn);

    return ok(res, {
      trade_in_car: validatedTradeIn,
      trade_in_value: tradeInValue,
      confidence_score: 0.85 // Mock confidence score
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get insurance quote
const getInsuranceQuote = async (req, res) => {
  try {
    const {
      carId,
      coverageType,
      userAge,
      userLocation,
      drivingHistory = 'clean'
    } = req.body;

    const userId = req.user.id;

    if (!carId || !coverageType) {
      return badRequest(res, 'Car ID and coverage type are required');
    }

    const insuranceData = {
      carId,
      userId,
      coverageType,
      userAge: parseInt(userAge),
      userLocation,
      drivingHistory
    };

    const quote = await enhancedPaymentService.getInsuranceQuote(insuranceData);

    return ok(res, {
      car_id: carId,
      coverage_type: coverageType,
      quote: quote,
      quote_valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get payment summary
const getPaymentSummary = async (req, res) => {
  try {
    const { carId } = req.params;
    const userId = req.user.id;
    const options = req.query;

    const pricing = await enhancedPaymentService.getEnhancedCarPricing(carId, userId, {
      tradeInValue: parseFloat(options.tradeInValue) || 0,
      downPayment: parseFloat(options.downPayment) || 0,
      financingOption: options.financingOption ? JSON.parse(options.financingOption) : null,
      insuranceOption: options.insuranceOption ? JSON.parse(options.insuranceOption) : null,
      warrantyOption: options.warrantyOption ? JSON.parse(options.warrantyOption) : null
    });

    return ok(res, {
      car: pricing.car,
      pricing_summary: {
        base_price: pricing.pricing_breakdown.base_price,
        trade_in_value: pricing.pricing_breakdown.trade_in_value,
        down_payment: pricing.pricing_breakdown.down_payment,
        subtotal: pricing.pricing_breakdown.subtotal,
        additional_costs: {
          financing: pricing.pricing_breakdown.financing_cost || 0,
          insurance: pricing.pricing_breakdown.insurance_cost || 0,
          warranty: pricing.pricing_breakdown.warranty_cost || 0
        },
        total: pricing.total
      },
      available_options: {
        financing: pricing.financing_options.length,
        insurance: pricing.insurance_options.length,
        warranty: pricing.warranty_options.length
      },
      payment_methods: pricing.payment_methods
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  processEnhancedCarPurchase,
  processCarFinancing,
  processTradeIn,
  processCarInsurance,
  getEnhancedCarPricing,
  getCarFinancingOptions,
  getCarInsuranceOptions,
  getCarWarrantyOptions,
  calculateTradeInValue,
  getInsuranceQuote,
  getPaymentSummary
};

