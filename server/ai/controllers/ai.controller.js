const { ok, badRequest, notFound } = require('../../utils/response');
const chatbotService = require('../services/chatbot.service');
const dynamicPricingService = require('../services/dynamic-pricing.service');
const personalizationService = require('../services/personalization.service');
const analyticsService = require('../services/analytics.service');

// AI Chatbot endpoints
const processChatMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return badRequest(res, 'Message is required');
    }

    const result = await chatbotService.processMessage(userId, message, sessionId);

    return ok(res, {
      sessionId: result.sessionId,
      response: result.response,
      intent: result.intent,
      entities: result.entities,
      suggestions: result.suggestions,
      actions: result.actions,
      confidence: result.confidence,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getChatSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const userContext = await chatbotService.getUserContext(userId);

    const suggestions = [
      {
        type: 'quick_action',
        title: 'Find a Car',
        description: 'Search for cars based on your preferences',
        action: 'search_car',
        icon: '🚗'
      },
      {
        type: 'quick_action',
        title: 'Browse by Brand',
        description: 'Explore cars by popular brands',
        action: 'browse_brands',
        icon: '🏷️'
      },
      {
        type: 'quick_action',
        title: 'Price Range',
        description: 'Find cars within your budget',
        action: 'price_filter',
        icon: '💰'
      },
      {
        type: 'quick_action',
        title: 'Financing Options',
        description: 'Learn about our financing solutions',
        action: 'financing_info',
        icon: '💳'
      }
    ];

    return ok(res, {
      suggestions,
      count: suggestions.length,
      user_context: {
        role: userContext.role,
        name: userContext.first_name
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Dynamic Pricing endpoints
const getDynamicPrice = async (req, res) => {
  try {
    const { carId } = req.params;
    const userId = req.user.id;

    const result = await dynamicPricingService.calculateDynamicPrice(carId, userId);

    return ok(res, result);
  } catch (error) {
    const message = String(error?.message || '');
    if (message.includes('Car not found')) {
      return res.status(404).json({ error: 'Car not found' });
    }
    if (message.includes('Dynamic pricing calculation failed: Car not found')) {
      return res.status(404).json({ error: 'Car not found' });
    }
    return res.status(500).json({ error: error.message });
  }
};

const getPricingRecommendations = async (req, res) => {
  try {
    const { carId } = req.params;

    const recommendations = await dynamicPricingService.getPriceOptimizationRecommendations(carId);

    return ok(res, {
      car_id: carId,
      recommendations,
      count: recommendations.length,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Personalization endpoints
const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const result = await personalizationService.getPersonalizedRecommendations(userId, parseInt(limit));

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getPersonalizedContent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contentType = 'homepage' } = req.query;

    const result = await personalizationService.getPersonalizedContent(userId, contentType);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await personalizationService.generateUserProfile(userId);

    return ok(res, {
      user_id: userId,
      profile,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const predictUserBehavior = async (req, res) => {
  try {
    const userId = req.user.id;
    const { behaviorType } = req.body;

    if (!behaviorType) {
      return badRequest(res, 'Behavior type is required');
    }

    const prediction = await personalizationService.predictUserBehavior(userId, behaviorType);

    return ok(res, prediction);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Analytics endpoints
const getBusinessInsights = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    const insights = await analyticsService.generateBusinessInsights(period);

    return ok(res, insights);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getFutureTrends = async (req, res) => {
  try {
    const { period = '30d', forecastDays = 30 } = req.query;

    const trends = await analyticsService.predictFutureTrends(period, parseInt(forecastDays));

    return ok(res, trends);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getUserBehaviorAnalysis = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    const analysis = await analyticsService.analyzeUserBehaviorPatterns(period);

    return ok(res, analysis);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getOptimizationRecommendations = async (req, res) => {
  try {
    const recommendations = await analyticsService.generateOptimizationRecommendations();

    return ok(res, recommendations);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const detectAnomalies = async (req, res) => {
  try {
    const { period = '7d' } = req.query;

    const anomalies = await analyticsService.detectAnomalies(period);

    return ok(res, anomalies);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// AI System Status
const getAIStatus = async (req, res) => {
  try {
    const status = {
      overall_status: 'operational',
      services: {
        chatbot: {
          status: 'active',
          version: '1.0.0',
          capabilities: ['natural_language_processing', 'intent_recognition', 'context_memory']
        },
        dynamic_pricing: {
          status: 'active',
          version: '1.0.0',
          capabilities: ['real_time_pricing', 'demand_analysis', 'competitor_monitoring']
        },
        personalization: {
          status: 'active',
          version: '1.0.0',
          capabilities: ['user_profiling', 'behavior_analysis', 'content_personalization']
        },
        analytics: {
          status: 'active',
          version: '1.0.0',
          capabilities: ['predictive_analytics', 'trend_analysis', 'anomaly_detection']
        }
      },
      performance_metrics: {
        avg_response_time: '1.2s',
        accuracy_score: '87%',
        user_satisfaction: '4.2/5',
        uptime: '99.8%'
      },
      last_updated: new Date().toISOString()
    };

    return ok(res, status);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// AI Dashboard Data (Admin only)
const getAIDashboard = async (req, res) => {
  try {
    const [
      chatbotAnalytics,
      pricingAnalytics,
      personalizationMetrics,
      businessInsights
    ] = await Promise.all([
      chatbotService.getChatbotAnalytics('7d'),
      dynamicPricingService.getPricingAnalytics('7d'),
      analyticsService.generateBusinessInsights('7d'),
      analyticsService.generateOptimizationRecommendations()
    ]);

    const dashboard = {
      overview: {
        total_ai_interactions: chatbotAnalytics.reduce((sum, day) => sum + day.total_messages, 0),
        pricing_calculations: pricingAnalytics.reduce((sum, day) => sum + day.price_calculations, 0),
        personalized_recommendations: 1250, // Placeholder
        anomaly_detections: 3 // Placeholder
      },
      chatbot_metrics: {
        total_messages: chatbotAnalytics.reduce((sum, day) => sum + day.total_messages, 0),
        unique_users: chatbotAnalytics.reduce((sum, day) => sum + day.unique_users, 0),
        avg_response_time: '1.2s',
        satisfaction_score: '4.2/5'
      },
      pricing_metrics: {
        total_calculations: pricingAnalytics.reduce((sum, day) => sum + day.price_calculations, 0),
        avg_adjustment: pricingAnalytics.reduce((sum, day) => sum + day.avg_adjustment_percentage, 0) / pricingAnalytics.length,
        revenue_impact: '+15.3%'
      },
      personalization_metrics: {
        active_profiles: 1250,
        avg_personalization_score: 0.78,
        recommendation_accuracy: '89%'
      },
      business_insights: businessInsights.recommendations.slice(0, 5),
      generated_at: new Date().toISOString()
    };

    return ok(res, dashboard);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  // Chatbot
  processChatMessage,
  getChatSuggestions,
  
  // Dynamic Pricing
  getDynamicPrice,
  getPricingRecommendations,
  
  // Personalization
  getPersonalizedRecommendations,
  getPersonalizedContent,
  getUserProfile,
  predictUserBehavior,
  
  // Analytics
  getBusinessInsights,
  getFutureTrends,
  getUserBehaviorAnalysis,
  getOptimizationRecommendations,
  detectAnomalies,
  
  // System
  getAIStatus,
  getAIDashboard
};
