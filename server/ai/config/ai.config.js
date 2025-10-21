const dotenv = require('dotenv');
dotenv.config({ debug: false });

const aiConfig = {
  // AI Service Configuration
  services: {
    chatbot: {
      enabled: process.env.AI_CHATBOT_ENABLED === 'true' || true,
      model: process.env.AI_CHATBOT_MODEL || 'bayes',
      confidence_threshold: parseFloat(process.env.AI_CHATBOT_CONFIDENCE || '0.7'),
      max_conversation_history: parseInt(process.env.AI_CHATBOT_MAX_HISTORY || '10'),
      response_timeout: parseInt(process.env.AI_CHATBOT_TIMEOUT || '5000'),
      supported_languages: ['en'],
      fallback_responses: {
        greeting: "Hello! I'm your AI car shopping assistant. How can I help you today?",
        search_car: "I can help you find the perfect car! What type of vehicle are you looking for?",
        price_inquiry: "I'd be happy to help with pricing information. Which car are you interested in?",
        feature_inquiry: "I can tell you about car features and specifications. What would you like to know?",
        financing_inquiry: "I can help you explore financing options. What's your budget range?",
        support_request: "I'm here to help! What specific assistance do you need?",
        default: "I'm not sure I understand. Could you please rephrase your question?"
      }
    },

    dynamicPricing: {
      enabled: process.env.AI_PRICING_ENABLED === 'true' || true,
      factors: {
        demand: parseFloat(process.env.AI_PRICING_DEMAND_WEIGHT || '0.3'),
        competition: parseFloat(process.env.AI_PRICING_COMPETITION_WEIGHT || '0.25'),
        seasonality: parseFloat(process.env.AI_PRICING_SEASONALITY_WEIGHT || '0.2'),
        userBehavior: parseFloat(process.env.AI_PRICING_USER_BEHAVIOR_WEIGHT || '0.15'),
        inventory: parseFloat(process.env.AI_PRICING_INVENTORY_WEIGHT || '0.1')
      },
      max_adjustment: parseFloat(process.env.AI_PRICING_MAX_ADJUSTMENT || '0.2'),
      min_adjustment: parseFloat(process.env.AI_PRICING_MIN_ADJUSTMENT || '-0.15'),
      price_validity_hours: parseInt(process.env.AI_PRICING_VALIDITY_HOURS || '24'),
      competitor_analysis_days: parseInt(process.env.AI_PRICING_COMPETITOR_DAYS || '7')
    },

    personalization: {
      enabled: process.env.AI_PERSONALIZATION_ENABLED === 'true' || true,
      min_interactions_for_profile: parseInt(process.env.AI_PERSONALIZATION_MIN_INTERACTIONS || '5'),
      profile_update_frequency: parseInt(process.env.AI_PERSONALIZATION_UPDATE_FREQUENCY || '24'),
      recommendation_limit: parseInt(process.env.AI_PERSONALIZATION_RECOMMENDATION_LIMIT || '10'),
      confidence_threshold: parseFloat(process.env.AI_PERSONALIZATION_CONFIDENCE || '0.6'),
      behavior_analysis_days: parseInt(process.env.AI_PERSONALIZATION_BEHAVIOR_DAYS || '30'),
      personality_insights: {
        shopping_styles: ['browser', 'collector', 'decisive', 'researcher'],
        price_sensitivity_levels: ['low', 'medium', 'high'],
        brand_loyalty_levels: ['low', 'medium', 'high']
      }
    },

    analytics: {
      enabled: process.env.AI_ANALYTICS_ENABLED === 'true' || true,
      prediction_horizon_days: parseInt(process.env.AI_ANALYTICS_PREDICTION_DAYS || '30'),
      anomaly_detection_threshold: parseFloat(process.env.AI_ANALYTICS_ANOMALY_THRESHOLD || '2.0'),
      trend_analysis_window: parseInt(process.env.AI_ANALYTICS_TREND_WINDOW || '7'),
      confidence_intervals: {
        high: 0.8,
        medium: 0.6,
        low: 0.4
      },
      performance_metrics: {
        response_time_threshold: parseFloat(process.env.AI_ANALYTICS_RESPONSE_THRESHOLD || '2.0'),
        accuracy_threshold: parseFloat(process.env.AI_ANALYTICS_ACCURACY_THRESHOLD || '0.8'),
        satisfaction_threshold: parseFloat(process.env.AI_ANALYTICS_SATISFACTION_THRESHOLD || '4.0')
      }
    }
  },

  // ML Model Configuration
  models: {
    intent_classifier: {
      type: 'bayes',
      training_data_size: 1000,
      accuracy_threshold: 0.8,
      retrain_frequency: 'weekly'
    },
    price_predictor: {
      type: 'regression',
      features: ['demand', 'competition', 'seasonality', 'user_behavior', 'inventory'],
      accuracy_threshold: 0.85,
      retrain_frequency: 'daily'
    },
    recommendation_engine: {
      type: 'hybrid',
      collaborative_weight: 0.4,
      content_based_weight: 0.3,
      behavioral_weight: 0.3,
      accuracy_threshold: 0.8,
      retrain_frequency: 'daily'
    },
    anomaly_detector: {
      type: 'isolation_forest',
      contamination: 0.1,
      sensitivity: 'medium',
      retrain_frequency: 'weekly'
    }
  },

  // Performance Monitoring
  monitoring: {
    enabled: process.env.AI_MONITORING_ENABLED === 'true' || true,
    metrics_collection_interval: parseInt(process.env.AI_MONITORING_INTERVAL || '900'), // 15 minutes (reduced frequency)
    alert_thresholds: {
      response_time: parseFloat(process.env.AI_MONITORING_RESPONSE_TIME || '5.0'),
      error_rate: parseFloat(process.env.AI_MONITORING_ERROR_RATE || '0.05'),
      accuracy_drop: parseFloat(process.env.AI_MONITORING_ACCURACY_DROP || '0.1')
    },
    alerting: {
      cooldown_minutes: parseInt(process.env.AI_ALERT_COOLDOWN_MINUTES || '10'),
      accuracy_min_samples: parseInt(process.env.AI_ACCURACY_MIN_SAMPLES || '20')
    },
    logging: {
      level: process.env.AI_LOGGING_LEVEL || 'info',
      include_predictions: process.env.AI_LOGGING_PREDICTIONS === 'true' || false,
      include_user_data: process.env.AI_LOGGING_USER_DATA === 'true' || false
    }
  },

  // Security & Privacy
  security: {
    data_encryption: process.env.AI_DATA_ENCRYPTION === 'true' || true,
    user_data_retention_days: parseInt(process.env.AI_DATA_RETENTION_DAYS || '365'),
    anonymize_user_data: process.env.AI_ANONYMIZE_DATA === 'true' || true,
    gdpr_compliance: process.env.AI_GDPR_COMPLIANCE === 'true' || true
  },

  // Feature Flags
  featureFlags: {
    voice_search: process.env.AI_VOICE_SEARCH_ENABLED === 'true' || false,
    image_recognition: process.env.AI_IMAGE_RECOGNITION_ENABLED === 'true' || false,
    sentiment_analysis: process.env.AI_SENTIMENT_ANALYSIS_ENABLED === 'true' || true,
    fraud_detection: process.env.AI_FRAUD_DETECTION_ENABLED === 'true' || true,
    real_time_learning: process.env.AI_REAL_TIME_LEARNING_ENABLED === 'true' || false
  },

  // API Configuration
  api: {
    rate_limiting: {
      enabled: process.env.AI_RATE_LIMITING_ENABLED === 'true' || true,
      requests_per_minute: parseInt(process.env.AI_RATE_LIMIT_RPM || '60'),
      burst_limit: parseInt(process.env.AI_RATE_LIMIT_BURST || '10')
    },
    caching: {
      enabled: process.env.AI_CACHING_ENABLED === 'true' || true,
      ttl_seconds: parseInt(process.env.AI_CACHE_TTL || '300'),
      max_cache_size: parseInt(process.env.AI_CACHE_MAX_SIZE || '1000')
    }
  }
};

// Validate configuration
function validateConfig() {
  const errors = [];

  // Validate service configurations
  Object.keys(aiConfig.services).forEach(service => {
    const serviceConfig = aiConfig.services[service];
    if (serviceConfig.enabled && typeof serviceConfig.enabled !== 'boolean') {
      errors.push(`Invalid enabled value for ${service} service`);
    }
  });

  // Validate pricing factors sum to 1
  const pricingFactors = aiConfig.services.dynamicPricing.factors;
  const factorSum = Object.values(pricingFactors).reduce((sum, factor) => sum + factor, 0);
  if (Math.abs(factorSum - 1.0) > 0.01) {
    errors.push('Dynamic pricing factors must sum to 1.0');
  }

  // Validate thresholds
  if (aiConfig.services.chatbot.confidence_threshold < 0 || aiConfig.services.chatbot.confidence_threshold > 1) {
    errors.push('Chatbot confidence threshold must be between 0 and 1');
  }

  if (errors.length > 0) {
    throw new Error(`AI Configuration validation failed: ${errors.join(', ')}`);
  }

  return true;
}

// Initialize AI configuration
function initializeAIConfig() {
  try {
    validateConfig();
    const quietMode = process.env.QUIET_STARTUP === 'true';
    if (!quietMode) {
      console.log('✅ AI configuration validated successfully');
    }
    return aiConfig;
  } catch (error) {
    console.error('❌ AI configuration validation failed:', error.message);
    throw error;
  }
}

module.exports = {
  config: aiConfig,
  validateConfig,
  initializeAIConfig
};
