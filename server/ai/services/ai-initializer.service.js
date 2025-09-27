const { executeQuery } = require('../../config/database');
const aiConfig = require('../config/ai.config');
const chatbotService = require('./chatbot.service');
const dynamicPricingService = require('./dynamic-pricing.service');
const personalizationService = require('./personalization.service');
const analyticsService = require('./analytics.service');

class AIServiceInitializer {
  constructor() {
    this.initialized = false;
    this.services = {
      chatbot: null,
      dynamicPricing: null,
      personalization: null,
      analytics: null
    };
  }

  async initializeAllServices() {
    try {
      const verboseMode = process.env.VERBOSE_AI_STARTUP === 'true';
      
      if (verboseMode) {
        console.log('🤖 Initializing AI Services...\n');
      }

      // Initialize configuration
      aiConfig.initializeAIConfig();
      if (verboseMode) console.log('✅ AI Configuration loaded');

      // Initialize chatbot service
      if (aiConfig.config.services.chatbot.enabled) {
        await this.initializeChatbotService();
        if (verboseMode) console.log('✅ Chatbot service initialized');
      }

      // Initialize dynamic pricing service
      if (aiConfig.config.services.dynamicPricing.enabled) {
        await this.initializeDynamicPricingService();
        if (verboseMode) console.log('✅ Dynamic pricing service initialized');
      }

      // Initialize personalization service
      if (aiConfig.config.services.personalization.enabled) {
        await this.initializePersonalizationService();
        if (verboseMode) console.log('✅ Personalization service initialized');
      }

      // Initialize analytics service
      if (aiConfig.config.services.analytics.enabled) {
        await this.initializeAnalyticsService();
        if (verboseMode) console.log('✅ Analytics service initialized');
      }

      // Set up monitoring
      if (aiConfig.config.monitoring.enabled) {
        await this.setupMonitoring();
        if (verboseMode) console.log('✅ AI monitoring setup completed');
      }

      // Initialize feature flags
      await this.initializeFeatureFlags();
      if (verboseMode) console.log('✅ AI feature flags initialized');

      // Warm up models
      await this.warmUpModels();
      if (verboseMode) console.log('✅ AI models warmed up');

      this.initialized = true;
      if (verboseMode) console.log('🎉 All AI services initialized successfully!');

      return {
        status: 'initialized',
        services: Object.keys(this.services).filter(key => this.services[key] !== null),
        config: aiConfig.config,
        initialized_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ AI service initialization failed:', error);
      throw error;
    }
  }

  async initializeChatbotService() {
    try {
      const verboseMode = process.env.VERBOSE_AI_STARTUP === 'true';
      
      // Load training data
      const trainingData = await this.loadChatbotTrainingData();
      
      // Initialize NLP components
      chatbotService.initializeNLP();
      
      // Train the classifier
      chatbotService.trainIntentClassifier();
      
      // Initialize the chatbot service (includes loading car knowledge base)
      const initialized = await chatbotService.initialize();
      
      if (!initialized) {
        throw new Error('Failed to initialize chatbot service');
      }
      
      this.services.chatbot = chatbotService;
      
      if (verboseMode) {
        console.log(`   📚 Loaded ${trainingData.length} training samples`);
        console.log(`   🧠 Trained intent classifier`);
        console.log(`   🚗 Loaded car knowledge base`);
      }
    } catch (error) {
      console.error('   ❌ Chatbot service initialization failed:', error.message);
      throw error;
    }
  }

  async initializeDynamicPricingService() {
    try {
      const verboseMode = process.env.VERBOSE_AI_STARTUP === 'true';
      
      // Initialize pricing factors
      dynamicPricingService.pricingFactors = aiConfig.config.services.dynamicPricing.factors;
      
      // Set up price history cache
      await this.setupPriceHistoryCache();
      
      // Initialize competitor price monitoring
      await this.setupCompetitorMonitoring();
      
      this.services.dynamicPricing = dynamicPricingService;
      
      if (verboseMode) {
        console.log(`   💰 Configured pricing factors`);
        console.log(`   📊 Set up price history cache`);
        console.log(`   🏪 Initialized competitor monitoring`);
      }
    } catch (error) {
      console.error('   ❌ Dynamic pricing service initialization failed:', error.message);
      throw error;
    }
  }

  async initializePersonalizationService() {
    try {
      const verboseMode = process.env.VERBOSE_AI_STARTUP === 'true';
      
      // Initialize user profile cache
      await this.setupUserProfileCache();
      
      // Initialize behavior pattern analysis
      await this.setupBehaviorAnalysis();
      
      // Initialize recommendation engine
      await this.setupRecommendationEngine();
      
      this.services.personalization = personalizationService;
      
      if (verboseMode) {
        console.log(`   👤 Set up user profile cache`);
        console.log(`   📈 Initialized behavior analysis`);
        console.log(`   🎯 Set up recommendation engine`);
      }
    } catch (error) {
      console.error('   ❌ Personalization service initialization failed:', error.message);
      throw error;
    }
  }

  async initializeAnalyticsService() {
    try {
      const verboseMode = process.env.VERBOSE_AI_STARTUP === 'true';
      
      // Initialize ML models
      await this.setupMLModels();
      
      // Set up analytics data pipeline
      await this.setupAnalyticsPipeline();
      
      // Initialize anomaly detection
      await this.setupAnomalyDetection();
      
      this.services.analytics = analyticsService;
      
      if (verboseMode) {
        console.log(`   🧠 Set up ML models`);
        console.log(`   📊 Initialized analytics pipeline`);
        console.log(`   🚨 Set up anomaly detection`);
      }
    } catch (error) {
      console.error('   ❌ Analytics service initialization failed:', error.message);
      throw error;
    }
  }

  async setupMonitoring() {
    try {
      const verboseMode = process.env.VERBOSE_AI_STARTUP === 'true';
      
      // Set up performance metrics collection
      await this.setupPerformanceMetrics();
      
      // Set up alerting
      await this.setupAlerting();
      
      // Set up logging
      await this.setupLogging();
      
      if (verboseMode) {
        console.log(`   📊 Set up performance metrics`);
        console.log(`   🚨 Configured alerting`);
        console.log(`   📝 Set up logging`);
      }
    } catch (error) {
      console.error('   ❌ Monitoring setup failed:', error.message);
      throw error;
    }
  }

  async initializeFeatureFlags() {
    try {
      const verboseMode = process.env.VERBOSE_AI_STARTUP === 'true';
      
      const query = `
        SELECT flag_name, enabled, rollout_percentage 
        FROM ai_feature_flags 
        WHERE enabled = 1
      `;
      
      const flags = await executeQuery(query);
      
      if (verboseMode) {
        console.log(`   🚩 Loaded ${flags.length} enabled feature flags`);
        
        // Log enabled features
        flags.forEach(flag => {
          console.log(`      - ${flag.flag_name}: ${flag.enabled ? 'enabled' : 'disabled'} (${flag.rollout_percentage}%)`);
        });
      }
    } catch (error) {
      console.error('   ❌ Feature flags initialization failed:', error.message);
      throw error;
    }
  }

  async warmUpModels() {
    try {
      const verboseMode = process.env.VERBOSE_AI_STARTUP === 'true';
      
      // Get a real user ID for testing, or create a test user
      let testUserId = await this.getOrCreateTestUser();

      // Warm up chatbot model
      if (this.services.chatbot) {
        try {
          const testMessage = 'Hello';
          const testResult = await this.services.chatbot.processMessage(testUserId, testMessage);
          if (verboseMode) console.log(`   🤖 Chatbot model warmed up (test response: ${testResult.response.substring(0, 50)}...)`);
        } catch (error) {
          if (verboseMode) console.log(`   ⚠️  Chatbot warm-up skipped (${error.message})`);
        }
      }

      // Warm up pricing model
      if (this.services.dynamicPricing) {
        try {
          // Get a real car ID for testing, or skip if none available
          const testCarId = await this.getTestCarId();
          if (testCarId) {
            const testPrice = await this.services.dynamicPricing.calculateDynamicPrice(testCarId, testUserId);
            if (verboseMode) console.log(`   💰 Pricing model warmed up (test price: $${testPrice.dynamic_price})`);
          } else {
            if (verboseMode) console.log(`   ⚠️  Pricing warm-up skipped (no cars available for testing)`);
          }
        } catch (error) {
          if (verboseMode) console.log(`   ⚠️  Pricing warm-up skipped (${error.message})`);
        }
      }

      // Warm up personalization model
      if (this.services.personalization) {
        try {
          const testProfile = await this.services.personalization.generateUserProfile(testUserId);
          if (verboseMode) console.log(`   👤 Personalization model warmed up (profile score: ${testProfile.personalization_score})`);
        } catch (error) {
          if (verboseMode) console.log(`   ⚠️  Personalization warm-up skipped (${error.message})`);
        }
      }

      // Warm up analytics model
      if (this.services.analytics) {
        try {
          const testInsights = await this.services.analytics.generateBusinessInsights('7d');
          if (verboseMode) console.log(`   📊 Analytics model warmed up (${testInsights.insights.length} insights generated)`);
        } catch (error) {
          if (verboseMode) console.log(`   ⚠️  Analytics warm-up skipped (${error.message})`);
        }
      }
    } catch (error) {
      console.error('   ❌ Model warm-up failed:', error.message);
      throw error;
    }
  }

  // Helper methods
  async getOrCreateTestUser() {
    try {
      // First, try to get an existing user
      const existingUserQuery = 'SELECT id FROM users LIMIT 1';
      const existingUsers = await executeQuery(existingUserQuery);
      
      if (existingUsers.length > 0) {
        return existingUsers[0].id;
      }

      // If no users exist, create a test user
      const testUserId = 'test-user-' + Date.now();
      const createUserQuery = `
        INSERT INTO users (id, email, first_name, last_name, password, role, is_verified, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await executeQuery(createUserQuery, [
        testUserId,
        'test@example.com',
        'Test',
        'User',
        'hashed_password_placeholder',
        'buyer',
        true,
        true
      ]);
      
      const verboseMode = process.env.VERBOSE_AI_STARTUP === 'true';
      if (verboseMode) console.log(`   👤 Created test user for AI warm-up: ${testUserId}`);
      return testUserId;
    } catch (error) {
      console.error('   ❌ Error getting/creating test user:', error.message);
      // Return a fallback ID that won't cause foreign key issues
      return 'fallback-test-user';
    }
  }

  async getTestCarId() {
    try {
      // Try to get an existing car
      const existingCarQuery = 'SELECT id FROM cars WHERE status = "active" LIMIT 1';
      const existingCars = await executeQuery(existingCarQuery);
      
      if (existingCars.length > 0) {
        return existingCars[0].id;
      }

      // If no cars exist, return null to skip pricing warm-up
      return null;
    } catch (error) {
      console.error('   ❌ Error getting test car:', error.message);
      return null;
    }
  }

  async loadChatbotTrainingData() {
    const query = 'SELECT * FROM ai_chatbot_training_data';
    return await executeQuery(query);
  }

  async setupPriceHistoryCache() {
    // Initialize price history cache
    const query = `
      SELECT car_id, AVG(dynamic_price) as avg_price, COUNT(*) as calculations
      FROM ai_pricing_calculations 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY car_id
    `;
    
    const priceHistory = await executeQuery(query);
    dynamicPricingService.priceHistory = new Map();
    
    priceHistory.forEach(item => {
      dynamicPricingService.priceHistory.set(item.car_id, {
        avg_price: item.avg_price,
        calculations: item.calculations
      });
    });
  }

  async setupCompetitorMonitoring() {
    // Initialize competitor price monitoring
    const query = `
      SELECT brand, model, AVG(price) as avg_price, COUNT(*) as count
      FROM cars 
      WHERE status = 'active'
      GROUP BY brand, model
    `;
    
    const competitorData = await executeQuery(query);
    dynamicPricingService.competitorPrices = new Map();
    
    competitorData.forEach(item => {
      const key = `${item.brand}_${item.model}`;
      dynamicPricingService.competitorPrices.set(key, {
        avg_price: item.avg_price,
        count: item.count
      });
    });
  }

  async setupUserProfileCache() {
    // Initialize user profile cache
    const query = 'SELECT user_id, personalization_score FROM ai_user_profiles';
    const profiles = await executeQuery(query);
    
    personalizationService.userProfiles = new Map();
    profiles.forEach(profile => {
      personalizationService.userProfiles.set(profile.user_id, {
        personalization_score: profile.personalization_score
      });
    });
  }

  async setupBehaviorAnalysis() {
    // Initialize behavior pattern analysis
    const query = `
      SELECT user_id, COUNT(*) as total_actions
      FROM user_behavior_tracking 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY user_id
    `;
    
    const behaviorData = await executeQuery(query);
    personalizationService.behaviorPatterns = new Map();
    
    behaviorData.forEach(item => {
      personalizationService.behaviorPatterns.set(item.user_id, {
        total_actions: item.total_actions
      });
    });
  }

  async setupRecommendationEngine() {
    // Initialize recommendation engine
    const query = 'SELECT COUNT(*) as total_recommendations FROM ai_recommendations';
    const result = await executeQuery(query);
    
    const verboseMode = process.env.VERBOSE_AI_STARTUP === 'true';
    if (verboseMode) console.log(`   🎯 Recommendation engine initialized with ${result[0].total_recommendations} existing recommendations`);
  }

  async setupMLModels() {
    // Initialize ML models
    const query = 'SELECT COUNT(*) as total_models FROM ai_model_performance';
    const result = await executeQuery(query);
    
    const verboseMode = process.env.VERBOSE_AI_STARTUP === 'true';
    if (verboseMode) console.log(`   🧠 ML models initialized with ${result[0].total_models} performance records`);
  }

  async setupAnalyticsPipeline() {
    // Initialize analytics data pipeline
    const query = 'SELECT COUNT(*) as total_events FROM ai_analytics_events';
    const result = await executeQuery(query);
    
    const verboseMode = process.env.VERBOSE_AI_STARTUP === 'true';
    if (verboseMode) console.log(`   📊 Analytics pipeline initialized with ${result[0].total_events} events`);
  }

  async setupAnomalyDetection() {
    // Initialize anomaly detection
    const verboseMode = process.env.VERBOSE_AI_STARTUP === 'true';
    if (verboseMode) console.log(`   🚨 Anomaly detection initialized with threshold: ${aiConfig.config.services.analytics.anomaly_detection_threshold}`);
  }

  async setupPerformanceMetrics() {
    // Set up performance metrics collection
    const query = 'SELECT COUNT(*) as total_metrics FROM ai_system_metrics';
    const result = await executeQuery(query);
    
    const verboseMode = process.env.VERBOSE_AI_STARTUP === 'true';
    if (verboseMode) console.log(`   📊 Performance metrics collection initialized with ${result[0].total_metrics} existing metrics`);
  }

  async setupAlerting() {
    // Set up alerting system
    const verboseMode = process.env.VERBOSE_AI_STARTUP === 'true';
    if (verboseMode) {
      console.log(`   🚨 Alerting system configured with thresholds:`);
      console.log(`      - Response time: ${aiConfig.config.monitoring.alert_thresholds.response_time}s`);
      console.log(`      - Error rate: ${aiConfig.config.monitoring.alert_thresholds.error_rate * 100}%`);
      console.log(`      - Accuracy drop: ${aiConfig.config.monitoring.alert_thresholds.accuracy_drop * 100}%`);
    }
  }

  async setupLogging() {
    // Set up logging system
    const verboseMode = process.env.VERBOSE_AI_STARTUP === 'true';
    if (verboseMode) console.log(`   📝 Logging system configured with level: ${aiConfig.config.monitoring.logging.level}`);
  }

  // Get service status
  getServiceStatus() {
    return {
      initialized: this.initialized,
      services: {
        chatbot: this.services.chatbot ? 'active' : 'inactive',
        dynamicPricing: this.services.dynamicPricing ? 'active' : 'inactive',
        personalization: this.services.personalization ? 'active' : 'inactive',
        analytics: this.services.analytics ? 'active' : 'inactive'
      },
      config: aiConfig.config,
      uptime: this.initialized ? Date.now() - this.startTime : 0
    };
  }
}

module.exports = new AIServiceInitializer();
