const { executeQuery } = require('../../config/database');

class DynamicPricingService {
  constructor() {
    this.pricingFactors = {
      demand: 0.3,
      competition: 0.25,
      seasonality: 0.2,
      userBehavior: 0.15,
      inventory: 0.1
    };
    this.priceHistory = new Map();
    this.competitorPrices = new Map();
    this.demandPatterns = new Map();
  }

  // Calculate dynamic price for a car
  async calculateDynamicPrice(carId, userId = null) {
    try {
      // Get car details
      const car = await this.getCarDetails(carId);
      if (!car) {
        throw new Error('Car not found');
      }

      const basePrice = parseFloat(car.price);
      
      // Get pricing factors
      const factors = await this.getPricingFactors(carId, userId);
      
      // Calculate dynamic price
      const startTime = Date.now();
      const dynamicPrice = this.calculatePrice(basePrice, factors);
      const calculationTimeMs = Date.now() - startTime;
      
      // Store price calculation
      const adjustmentPercentage = ((dynamicPrice - basePrice) / basePrice) * 100;
      await this.storePriceCalculation(carId, userId, basePrice, dynamicPrice, factors, calculationTimeMs, adjustmentPercentage);
      
      return {
        car_id: carId,
        base_price: basePrice,
        dynamic_price: dynamicPrice,
        price_adjustment: dynamicPrice - basePrice,
        adjustment_percentage: ((dynamicPrice - basePrice) / basePrice * 100).toFixed(2),
        factors: factors,
        confidence_score: this.calculateConfidenceScore(factors),
        valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };
    } catch (error) {
      console.error('Error calculating dynamic price:', error);
      throw new Error('Dynamic pricing calculation failed: ' + error.message);
    }
  }

  // Get pricing factors for a car
  async getPricingFactors(carId, userId) {
    const factors = {};

    // Demand factor
    factors.demand = await this.calculateDemandFactor(carId);
    
    // Competition factor
    factors.competition = await this.calculateCompetitionFactor(carId);
    
    // Seasonality factor
    factors.seasonality = await this.calculateSeasonalityFactor(carId);
    
    // User behavior factor
    factors.userBehavior = await this.calculateUserBehaviorFactor(carId, userId);
    
    // Inventory factor
    factors.inventory = await this.calculateInventoryFactor(carId);

    return factors;
  }

  // Calculate demand factor based on views, favorites, and inquiries
  async calculateDemandFactor(carId) {
    try {
      const query = `
        SELECT 
          COUNT(DISTINCT cv.id) as views_7d,
          COUNT(DISTINCT cf.id) as favorites_7d,
          COUNT(DISTINCT cr.id) as inquiries_7d
        FROM cars c
        LEFT JOIN car_views cv ON c.id = cv.car_id AND cv.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        LEFT JOIN car_favorites cf ON c.id = cf.car_id AND cf.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        LEFT JOIN car_reviews cr ON c.id = cr.car_id AND cr.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        WHERE c.id = ?
      `;

      const result = await executeQuery(query, [carId]);
      const data = result[0];

      // Calculate demand score (0-1)
      const viewsScore = Math.min(data.views_7d / 100, 1); // Normalize to 100 views max
      const favoritesScore = Math.min(data.favorites_7d / 20, 1); // Normalize to 20 favorites max
      const inquiriesScore = Math.min(data.inquiries_7d / 10, 1); // Normalize to 10 inquiries max

      const demandScore = (viewsScore * 0.4 + favoritesScore * 0.4 + inquiriesScore * 0.2);
      
      // Convert to price adjustment factor (-0.1 to +0.2)
      return (demandScore - 0.5) * 0.6;
    } catch (error) {
      console.error('Error calculating demand factor:', error);
      return 0;
    }
  }

  // Calculate competition factor based on similar cars
  async calculateCompetitionFactor(carId) {
    try {
      const car = await this.getCarDetails(carId);
      
      const query = `
        SELECT 
          AVG(price) as avg_price,
          MIN(price) as min_price,
          MAX(price) as max_price,
          COUNT(*) as competitor_count
        FROM cars 
        WHERE brand = ? 
          AND model = ? 
          AND year BETWEEN ? AND ?
          AND status = 'active'
          AND id != ?
      `;

      const result = await executeQuery(query, [
        car.brand,
        car.model,
        car.year - 2,
        car.year + 2,
        carId
      ]);

      if (result[0].competitor_count === 0) {
        return 0; // No competition data
      }

      const competitorData = result[0];
      const carPrice = parseFloat(car.price);
      
      // Calculate price position relative to competitors
      const pricePosition = (carPrice - competitorData.min_price) / 
                           (competitorData.max_price - competitorData.min_price);
      
      // Adjust based on market position
      if (pricePosition < 0.3) {
        return 0.05; // Below market, can increase price
      } else if (pricePosition > 0.7) {
        return -0.05; // Above market, should decrease price
      } else {
        return 0; // Competitive pricing
      }
    } catch (error) {
      console.error('Error calculating competition factor:', error);
      return 0;
    }
  }

  // Calculate seasonality factor based on time of year
  async calculateSeasonalityFactor(carId) {
    const month = new Date().getMonth() + 1; // 1-12
    const car = await this.getCarDetails(carId);
    
    // Seasonal patterns for different car types
    const seasonalPatterns = {
      'suv': {
        12: 0.1, 1: 0.1, 2: 0.05, // Winter - SUVs more popular
        6: -0.05, 7: -0.05, 8: -0.05, // Summer - SUVs less popular
        3: 0, 4: 0, 5: 0, 9: 0, 10: 0, 11: 0
      },
      'convertible': {
        6: 0.1, 7: 0.1, 8: 0.1, // Summer - convertibles more popular
        12: -0.1, 1: -0.1, 2: -0.1, // Winter - convertibles less popular
        3: 0, 4: 0, 5: 0, 9: 0, 10: 0, 11: 0
      },
      'sedan': {
        1: 0.05, 2: 0.05, 3: 0.05, // Spring - sedans popular
        9: 0.05, 10: 0.05, 11: 0.05, // Fall - sedans popular
        4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 12: 0
      }
    };

    const pattern = seasonalPatterns[car.body_type] || {};
    return pattern[month] || 0;
  }

  // Calculate user behavior factor based on user's interaction patterns
  async calculateUserBehaviorFactor(carId, userId) {
    if (!userId) return 0;

    try {
      const query = `
        SELECT 
          COUNT(DISTINCT cf.id) as favorites_count,
          COUNT(DISTINCT cv.id) as views_count,
          COUNT(DISTINCT cr.id) as reviews_count,
          AVG(cr.rating) as avg_rating
        FROM users u
        LEFT JOIN car_favorites cf ON u.id = cf.user_id
        LEFT JOIN car_views cv ON u.id = cv.user_id
        LEFT JOIN car_reviews cr ON u.id = cr.user_id
        WHERE u.id = ?
      `;

      const result = await executeQuery(query, [userId]);
      const userData = result[0];

      // Calculate user engagement score
      const engagementScore = Math.min(
        (userData.favorites_count * 0.3 + 
         userData.views_count * 0.2 + 
         userData.reviews_count * 0.5) / 10, 1
      );

      // Calculate user value score based on rating behavior
      const valueScore = userData.avg_rating ? (userData.avg_rating - 3) / 2 : 0;

      // Combine scores for user behavior factor
      return (engagementScore * 0.6 + valueScore * 0.4) * 0.1;
    } catch (error) {
      console.error('Error calculating user behavior factor:', error);
      return 0;
    }
  }

  // Calculate inventory factor based on car availability
  async calculateInventoryFactor(carId) {
    try {
      const car = await this.getCarDetails(carId);
      
      const query = `
        SELECT COUNT(*) as similar_cars
        FROM cars 
        WHERE brand = ? 
          AND model = ? 
          AND year BETWEEN ? AND ?
          AND status = 'active'
          AND id != ?
      `;

      const result = await executeQuery(query, [
        car.brand,
        car.model,
        car.year - 1,
        car.year + 1,
        carId
      ]);

      const similarCars = result[0].similar_cars;
      
      // Adjust price based on scarcity
      if (similarCars === 0) {
        return 0.1; // Rare car, can increase price
      } else if (similarCars > 10) {
        return -0.05; // Many similar cars, should decrease price
      } else {
        return 0; // Normal availability
      }
    } catch (error) {
      console.error('Error calculating inventory factor:', error);
      return 0;
    }
  }

  // Calculate final price based on factors
  calculatePrice(basePrice, factors) {
    let adjustment = 0;

    // Apply weighted factors
    adjustment += factors.demand * this.pricingFactors.demand;
    adjustment += factors.competition * this.pricingFactors.competition;
    adjustment += factors.seasonality * this.pricingFactors.seasonality;
    adjustment += factors.userBehavior * this.pricingFactors.userBehavior;
    adjustment += factors.inventory * this.pricingFactors.inventory;

    // Apply adjustment with limits
    const maxAdjustment = 0.2; // Max 20% increase
    const minAdjustment = -0.15; // Max 15% decrease
    
    adjustment = Math.max(minAdjustment, Math.min(maxAdjustment, adjustment));
    
    return Math.round(basePrice * (1 + adjustment));
  }

  // Calculate confidence score for pricing
  calculateConfidenceScore(factors) {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on data availability
    if (factors.demand !== 0) confidence += 0.1;
    if (factors.competition !== 0) confidence += 0.1;
    if (factors.seasonality !== 0) confidence += 0.1;
    if (factors.userBehavior !== 0) confidence += 0.1;
    if (factors.inventory !== 0) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  // Get car details
  async getCarDetails(carId) {
    const query = 'SELECT * FROM cars WHERE id = ?';
    const result = await executeQuery(query, [carId]);
    return result[0] || null;
  }

  // Store price calculation for analytics
  async storePriceCalculation(carId, userId, basePrice, dynamicPrice, factors, calculationTimeMs, adjustmentPercentage) {
    try {
      const query = `
        INSERT INTO ai_pricing_calculations 
        (id, car_id, user_id, base_price, dynamic_price, factors, calculation_time_ms, price_adjustment_percentage, created_at)
        VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      await executeQuery(query, [
        carId,
        userId,
        basePrice,
        dynamicPrice,
        JSON.stringify(factors),
        calculationTimeMs,
        adjustmentPercentage
      ]);
    } catch (error) {
      console.error('Error storing price calculation:', error);
    }
  }

  // Get pricing analytics
  async getPricingAnalytics(period = '7d') {
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 7;
      
      const query = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as total_calculations,
          AVG(dynamic_price - base_price) as avg_adjustment,
          AVG((dynamic_price - base_price) / base_price * 100) as avg_adjustment_percentage,
          COUNT(DISTINCT car_id) as unique_cars,
          COUNT(DISTINCT user_id) as unique_users
        FROM ai_pricing_calculations 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;

      return await executeQuery(query, [days]);
    } catch (error) {
      console.error('Error getting pricing analytics:', error);
      return [];
    }
  }

  // Get price optimization recommendations
  async getPriceOptimizationRecommendations(carId) {
    try {
      const factors = await this.getPricingFactors(carId);
      const recommendations = [];

      if (factors.demand > 0.1) {
        recommendations.push({
          type: 'increase',
          reason: 'High demand detected',
          suggestion: 'Consider increasing price by 5-10%',
          confidence: 0.8
        });
      }

      if (factors.competition < -0.05) {
        recommendations.push({
          type: 'decrease',
          reason: 'Competitive pressure',
          suggestion: 'Consider decreasing price to stay competitive',
          confidence: 0.7
        });
      }

      if (factors.seasonality > 0.05) {
        recommendations.push({
          type: 'increase',
          reason: 'Seasonal demand',
          suggestion: 'Seasonal demand detected, consider price increase',
          confidence: 0.6
        });
      }

      if (factors.inventory > 0.05) {
        recommendations.push({
          type: 'increase',
          reason: 'Limited availability',
          suggestion: 'Rare car, can command premium price',
          confidence: 0.9
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting optimization recommendations:', error);
      return [];
    }
  }

  // A/B test pricing strategies
  async runPricingABTest(carId, testConfig) {
    try {
      const { strategy_a, strategy_b, traffic_split = 0.5 } = testConfig;
      
      // Calculate prices for both strategies
      const priceA = await this.calculateDynamicPrice(carId);
      const priceB = await this.calculateDynamicPrice(carId);
      
      // Store A/B test configuration
      const query = `
        INSERT INTO ai_pricing_ab_tests 
        (id, car_id, strategy_a, strategy_b, traffic_split, status, created_at)
        VALUES (UUID(), ?, ?, ?, ?, 'active', NOW())
      `;

      await executeQuery(query, [
        carId,
        JSON.stringify(strategy_a),
        JSON.stringify(strategy_b),
        traffic_split
      ]);

      return {
        test_id: 'test_' + Date.now(),
        strategy_a: { price: priceA.dynamic_price, config: strategy_a },
        strategy_b: { price: priceB.dynamic_price, config: strategy_b },
        traffic_split,
        status: 'active'
      };
    } catch (error) {
      console.error('Error running pricing A/B test:', error);
      throw new Error('A/B test setup failed: ' + error.message);
    }
  }
}

module.exports = new DynamicPricingService();
