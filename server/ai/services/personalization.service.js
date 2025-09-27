const { executeQuery } = require('../../config/database');

class AIPersonalizationService {
  constructor() {
    this.userProfiles = new Map();
    this.behaviorPatterns = new Map();
    this.preferenceModels = new Map();
    this.collaborativeFilters = new Map();
  }

  // Generate personalized user profile
  async generateUserProfile(userId) {
    try {
      // Get user data
      const userData = await this.getUserData(userId);
      
      // Get user behavior data
      const behaviorData = await this.getUserBehaviorData(userId);
      
      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      
      // Analyze behavior patterns
      const behaviorPatterns = this.analyzeBehaviorPatterns(behaviorData);
      
      // Generate personality insights
      const personalityInsights = this.generatePersonalityInsights(userData, behaviorData);
      
      // Create comprehensive profile
      const profile = {
        user_id: userId,
        basic_info: userData,
        behavior_patterns: behaviorPatterns,
        preferences: preferences,
        personality_insights: personalityInsights,
        personalization_score: this.calculatePersonalizationScore(behaviorData),
        last_updated: new Date().toISOString(),
        confidence_level: this.calculateConfidenceLevel(behaviorData)
      };

      // Store profile
      await this.storeUserProfile(userId, profile);
      
      return profile;
    } catch (error) {
      console.error('Error generating user profile:', error);
      throw new Error('User profile generation failed: ' + error.message);
    }
  }

  // Get personalized recommendations
  async getPersonalizedRecommendations(userId, limit = 10) {
    try {
      const userProfile = await this.getUserProfile(userId);
      
      // Get different types of recommendations
      const collaborativeRecs = await this.getCollaborativeRecommendations(userId, limit);
      const contentBasedRecs = await this.getContentBasedRecommendations(userId, limit);
      const behavioralRecs = await this.getBehavioralRecommendations(userId, limit);
      
      // Combine and rank recommendations
      const combinedRecs = this.combineRecommendations([
        { type: 'collaborative', recommendations: collaborativeRecs, weight: 0.4 },
        { type: 'content_based', recommendations: contentBasedRecs, weight: 0.3 },
        { type: 'behavioral', recommendations: behavioralRecs, weight: 0.3 }
      ]);

      // Personalize based on user profile
      const personalizedRecs = this.personalizeRecommendations(combinedRecs, userProfile);

      return {
        user_id: userId,
        recommendations: personalizedRecs.slice(0, limit),
        total_recommendations: personalizedRecs.length,
        personalization_factors: {
          behavior_score: userProfile.personalization_score,
          confidence_level: userProfile.confidence_level,
          preference_strength: this.calculatePreferenceStrength(userProfile.preferences)
        },
        recommendation_types: {
          collaborative: collaborativeRecs.length,
          content_based: contentBasedRecs.length,
          behavioral: behavioralRecs.length
        }
      };
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      throw new Error('Personalized recommendations failed: ' + error.message);
    }
  }

  // Get personalized content
  async getPersonalizedContent(userId, contentType = 'homepage') {
    try {
      console.log('DEBUG: getPersonalizedContent called with contentType:', contentType);
      const userProfile = await this.getUserProfile(userId);
      
      let content = {};
      
      switch (contentType) {
        case 'homepage':
          content = await this.getPersonalizedHomepage(userProfile);
          break;
        case 'search_results':
          content = await this.getPersonalizedSearchResults(userProfile);
          break;
        case 'product_page':
          content = await this.getPersonalizedProductPage(userProfile);
          break;
        case 'email':
          content = await this.getPersonalizedEmailContent(userProfile);
          break;
        case 'courses':
          content = await this.getPersonalizedCourses(userProfile);
          break;
        default:
          content = await this.getPersonalizedHomepage(userProfile);
      }

      return {
        user_id: userId,
        content_type: contentType,
        personalized_content: content,
        personalization_factors: this.getPersonalizationFactors(userProfile),
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting personalized content:', error);
      throw new Error('Personalized content generation failed: ' + error.message);
    }
  }

  // Predict user behavior
  async predictUserBehavior(userId, behaviorType) {
    try {
      const userProfile = await this.getUserProfile(userId);
      const historicalData = await this.getHistoricalBehaviorData(userId, behaviorType);
      
      // Use machine learning to predict behavior
      const prediction = this.mlPredictBehavior(userProfile, historicalData, behaviorType);
      
      return {
        user_id: userId,
        behavior_type: behaviorType,
        prediction: prediction.prediction,
        confidence: prediction.confidence,
        factors: prediction.factors,
        timeframe: prediction.timeframe,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error predicting user behavior:', error);
      throw new Error('Behavior prediction failed: ' + error.message);
    }
  }

  // Get personalized pricing
  async getPersonalizedPricing(userId, carId) {
    try {
      const userProfile = await this.getUserProfile(userId);
      
      // Calculate personalized price based on user profile
      const basePrice = await this.getCarBasePrice(carId);
      const personalizedPrice = this.calculatePersonalizedPrice(basePrice, userProfile);
      
      return {
        user_id: userId,
        car_id: carId,
        base_price: basePrice,
        personalized_price: personalizedPrice,
        discount_percentage: ((basePrice - personalizedPrice) / basePrice * 100).toFixed(2),
        personalization_factors: {
          loyalty_score: userProfile.personality_insights.loyalty_score,
          price_sensitivity: userProfile.personality_insights.price_sensitivity,
          purchase_frequency: userProfile.behavior_patterns.purchase_frequency
        },
        valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };
    } catch (error) {
      console.error('Error getting personalized pricing:', error);
      throw new Error('Personalized pricing failed: ' + error.message);
    }
  }

  // Helper methods
  async getUserData(userId) {
    const query = 'SELECT * FROM users WHERE id = ?';
    const result = await executeQuery(query, [userId]);
    return result[0] || {};
  }

  async getUserBehaviorData(userId) {
    const query = `
      SELECT 
        'view' as action_type,
        car_id,
        created_at,
        metadata
      FROM car_views 
      WHERE user_id = ?
      
      UNION ALL
      
      SELECT 
        'favorite' as action_type,
        car_id,
        created_at,
        NULL as metadata
      FROM car_favorites 
      WHERE user_id = ?
      
      UNION ALL
      
      SELECT 
        'review' as action_type,
        car_id,
        created_at,
        JSON_OBJECT('rating', rating, 'comment', comment) as metadata
      FROM car_reviews 
      WHERE user_id = ?
      
      ORDER BY created_at DESC
      LIMIT 1000
    `;

    return await executeQuery(query, [userId, userId, userId]);
  }

  async getUserPreferences(userId) {
    const query = 'SELECT * FROM user_preferences WHERE user_id = ?';
    const result = await executeQuery(query, [userId]);
    return result[0] || {};
  }

  analyzeBehaviorPatterns(behaviorData) {
    const patterns = {
      browsing_frequency: 0,
      purchase_frequency: 0,
      price_sensitivity: 0,
      brand_loyalty: 0,
      feature_preferences: [],
      time_patterns: {},
      device_patterns: {}
    };

    // Analyze browsing frequency
    const viewCount = behaviorData.filter(b => b.action_type === 'view').length;
    patterns.browsing_frequency = Math.min(viewCount / 30, 1); // Normalize to daily views

    // Analyze price sensitivity
    const reviews = behaviorData.filter(b => b.action_type === 'review');
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + (r.metadata?.rating || 0), 0) / reviews.length;
      patterns.price_sensitivity = avgRating > 4 ? 0.3 : avgRating > 3 ? 0.5 : 0.7;
    }

    // Analyze brand loyalty
    const brands = behaviorData.map(b => b.car_id).filter(Boolean);
    const uniqueBrands = new Set(brands);
    patterns.brand_loyalty = brands.length > 0 ? uniqueBrands.size / brands.length : 0.5;

    return patterns;
  }

  generatePersonalityInsights(userData, behaviorData) {
    return {
      shopping_style: this.determineShoppingStyle(behaviorData),
      price_sensitivity: this.calculatePriceSensitivity(behaviorData),
      brand_preference: this.calculateBrandPreference(behaviorData),
      loyalty_score: this.calculateLoyaltyScore(behaviorData),
      risk_tolerance: this.calculateRiskTolerance(behaviorData),
      social_influence: this.calculateSocialInfluence(behaviorData)
    };
  }

  determineShoppingStyle(behaviorData) {
    const viewCount = behaviorData.filter(b => b.action_type === 'view').length;
    const favoriteCount = behaviorData.filter(b => b.action_type === 'favorite').length;
    
    if (viewCount > 50 && favoriteCount < 5) {
      return 'browser'; // Browses a lot but doesn't commit
    } else if (favoriteCount > 10) {
      return 'collector'; // Collects many favorites
    } else if (viewCount < 10) {
      return 'decisive'; // Makes quick decisions
    } else {
      return 'researcher'; // Thorough researcher
    }
  }

  calculatePriceSensitivity(behaviorData) {
    // Analyze price-related behavior
    const reviews = behaviorData.filter(b => b.action_type === 'review');
    if (reviews.length === 0) return 0.5; // Default moderate sensitivity

    const avgRating = reviews.reduce((sum, r) => sum + (r.metadata?.rating || 0), 0) / reviews.length;
    return avgRating > 4 ? 0.3 : avgRating > 3 ? 0.5 : 0.7;
  }

  calculateBrandPreference(behaviorData) {
    // Analyze brand interactions
    const brands = behaviorData.map(b => b.car_id).filter(Boolean);
    const brandCounts = {};
    
    brands.forEach(brand => {
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    });

    const mostPopularBrand = Object.keys(brandCounts).reduce((a, b) => 
      brandCounts[a] > brandCounts[b] ? a : b, 'unknown'
    );

    return {
      preferred_brand: mostPopularBrand,
      brand_diversity: Object.keys(brandCounts).length,
      brand_loyalty: brandCounts[mostPopularBrand] / brands.length
    };
  }

  calculateLoyaltyScore(behaviorData) {
    const totalActions = behaviorData.length;
    const uniqueCars = new Set(behaviorData.map(b => b.car_id)).size;
    
    if (totalActions === 0) return 0.5;
    
    // Higher loyalty = more actions per unique car
    return Math.min(uniqueCars / totalActions, 1);
  }

  calculateRiskTolerance(behaviorData) {
    // Analyze risk-taking behavior
    const reviews = behaviorData.filter(b => b.action_type === 'review');
    if (reviews.length === 0) return 0.5;

    const avgRating = reviews.reduce((sum, r) => sum + (r.metadata?.rating || 0), 0) / reviews.length;
    return avgRating > 4 ? 0.8 : avgRating > 3 ? 0.5 : 0.2;
  }

  calculateSocialInfluence(behaviorData) {
    // Analyze social behavior patterns
    const reviewCount = behaviorData.filter(b => b.action_type === 'review').length;
    const totalActions = behaviorData.length;
    
    return totalActions > 0 ? reviewCount / totalActions : 0;
  }

  calculatePersonalizationScore(behaviorData) {
    const totalActions = behaviorData.length;
    const uniqueCars = new Set(behaviorData.map(b => b.car_id)).size;
    const reviewCount = behaviorData.filter(b => b.action_type === 'review').length;
    
    if (totalActions === 0) return 0;
    
    const engagementScore = Math.min(totalActions / 100, 1);
    const diversityScore = Math.min(uniqueCars / 20, 1);
    const feedbackScore = Math.min(reviewCount / 10, 1);
    
    return (engagementScore * 0.4 + diversityScore * 0.3 + feedbackScore * 0.3);
  }

  calculateConfidenceLevel(behaviorData) {
    const totalActions = behaviorData.length;
    
    if (totalActions < 5) return 0.3; // Low confidence
    if (totalActions < 20) return 0.6; // Medium confidence
    return 0.9; // High confidence
  }

  async storeUserProfile(userId, profile) {
    try {
      const query = `
        INSERT INTO ai_user_profiles 
        (id, user_id, profile_data, created_at, updated_at)
        VALUES (UUID(), ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
        profile_data = VALUES(profile_data),
        updated_at = NOW()
      `;

      await executeQuery(query, [userId, JSON.stringify(profile)]);
    } catch (error) {
      console.error('Error storing user profile:', error);
    }
  }

  async getUserProfile(userId) {
    try {
      const query = 'SELECT profile_data FROM ai_user_profiles WHERE user_id = ?';
      const result = await executeQuery(query, [userId]);
      
      if (result.length > 0) {
        return JSON.parse(result[0].profile_data);
      }
      
      // Generate new profile if not exists
      return await this.generateUserProfile(userId);
    } catch (error) {
      console.error('Error getting user profile:', error);
      return {};
    }
  }

  // Additional helper methods for recommendations and content personalization
  async getCollaborativeRecommendations(userId, limit) {
    // Implementation for collaborative filtering
    return [];
  }

  async getContentBasedRecommendations(userId, limit) {
    // Implementation for content-based filtering
    return [];
  }

  async getBehavioralRecommendations(userId, limit) {
    // Implementation for behavioral recommendations
    return [];
  }

  combineRecommendations(recommendationSets) {
    // Combine different recommendation types
    return [];
  }

  personalizeRecommendations(recommendations, userProfile) {
    // Personalize recommendations based on user profile
    return recommendations;
  }

  async getPersonalizedHomepage(userProfile) {
    // Generate personalized homepage content
    return {};
  }

  async getPersonalizedSearchResults(userProfile) {
    // Generate personalized search results
    return {};
  }

  async getPersonalizedProductPage(userProfile) {
    // Generate personalized product page content
    return {};
  }

  async getPersonalizedEmailContent(userProfile) {
    // Generate personalized email content
    return {};
  }

  async getPersonalizedCourses(userProfile) {
    // Generate personalized course recommendations
    try {
      const { executeQuery } = require('../../config/database');
      
      // Get courses based on user profile
      const query = `
        SELECT 
          c.*,
          AVG(cr.rating) as avg_rating,
          COUNT(cr.id) as review_count,
          COUNT(ce.id) as enrollment_count
        FROM courses c
        LEFT JOIN course_reviews cr ON c.id = cr.course_id
        LEFT JOIN course_enrollments ce ON c.id = ce.course_id
        WHERE c.is_published = 1
        GROUP BY c.id
        ORDER BY 
          CASE WHEN ? = 'browser' THEN c.student_count END DESC,
          CASE WHEN ? = 'researcher' THEN avg_rating END DESC,
          CASE WHEN ? = 'decisive' THEN c.created_at END DESC,
          CASE WHEN ? = 'collector' THEN c.rating END DESC,
          c.student_count DESC
        LIMIT 10
      `;
      
      const shoppingStyle = userProfile.personality_insights?.shopping_style || 'decisive';
      const courses = await executeQuery(query, [shoppingStyle, shoppingStyle, shoppingStyle, shoppingStyle]);
      
      return {
        recommended_courses: courses,
        personalization_reason: `Based on your ${shoppingStyle} learning style`,
        total_courses: courses.length,
        filters_applied: {
          shopping_style: shoppingStyle,
          price_sensitivity: userProfile.personality_insights?.price_sensitivity || 0.5
        }
      };
    } catch (error) {
      console.error('Error getting personalized courses:', error);
      return {
        recommended_courses: [],
        personalization_reason: 'Unable to personalize courses at this time',
        total_courses: 0,
        filters_applied: {}
      };
    }
  }

  getPersonalizationFactors(userProfile) {
    return {
      behavior_score: userProfile.personalization_score || 0,
      confidence_level: userProfile.confidence_level || 0,
      shopping_style: userProfile.personality_insights?.shopping_style || 'unknown'
    };
  }

  async getHistoricalBehaviorData(userId, behaviorType) {
    // Get historical behavior data for prediction
    return [];
  }

  mlPredictBehavior(userProfile, historicalData, behaviorType) {
    // Machine learning prediction logic
    return {
      prediction: 'likely_to_purchase',
      confidence: 0.75,
      factors: ['high_engagement', 'price_sensitive'],
      timeframe: '7_days'
    };
  }

  async getCarBasePrice(carId) {
    const query = 'SELECT price FROM cars WHERE id = ?';
    const result = await executeQuery(query, [carId]);
    return result[0]?.price || 0;
  }

  calculatePersonalizedPrice(basePrice, userProfile) {
    // Calculate personalized price based on user profile
    const loyaltyDiscount = userProfile.personality_insights.loyalty_score * 0.05;
    const priceSensitivityAdjustment = userProfile.personality_insights.price_sensitivity * 0.03;
    
    const adjustment = loyaltyDiscount - priceSensitivityAdjustment;
    return Math.round(basePrice * (1 - adjustment));
  }

  calculatePreferenceStrength(preferences) {
    // Calculate how strong user preferences are
    return 0.7; // Placeholder
  }
}

module.exports = new AIPersonalizationService();
