const { executeQuery } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');

// Simple NLP implementation without external dependencies
class SimpleNLP {
  constructor() {
    this.stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
  }

  tokenize(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0 && !this.stopWords.has(word));
  }

  classifyIntent(tokens) {
    const intentKeywords = {
      greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
      search_car: ['car', 'vehicle', 'buy', 'purchase', 'looking for', 'find', 'search', 'bmw', 'mercedes', 'toyota', 'honda', 'ford', 'chevrolet'],
      price_inquiry: ['price', 'cost', 'expensive', 'cheap', 'budget', 'afford', 'dollar', 'money'],
      feature_inquiry: ['feature', 'specification', 'spec', 'engine', 'transmission', 'fuel', 'mileage', 'color', 'year', 'model'],
      financing_inquiry: ['finance', 'loan', 'credit', 'payment', 'monthly', 'down payment', 'interest', 'rate'],
      support_request: ['help', 'support', 'problem', 'issue', 'question', 'assistance', 'trouble']
    };

    let bestIntent = 'default';
    let bestScore = 0;

    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + tokens.filter(token => token.includes(keyword) || keyword.includes(token)).length;
      }, 0);

      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    }

    return {
      intent: bestIntent,
      confidence: Math.min(bestScore / tokens.length, 1.0)
    };
  }
}

class AIChatbotService {
  constructor() {
    this.conversationMemory = new Map();
    this.userPreferences = new Map();
    this.carKnowledgeBase = new Map();
    this.isInitialized = false;
    this.initializeNLP();
    // Don't load car knowledge base in constructor - do it lazily
  }

  initializeNLP() {
    // Initialize natural language processing
    this.nlp = new SimpleNLP();
    this.classifier = null; // Using simple keyword-based classification
    
    // Train the classifier with car-related intents
    this.trainIntentClassifier();
  }

  trainIntentClassifier() {
    // Training is handled by the SimpleNLP class
    // This method is kept for compatibility
    const quietMode = process.env.QUIET_STARTUP === 'true';
    if (!quietMode) console.log('✅ Intent classifier training completed (using keyword-based classification)');
  }

  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.loadCarKnowledgeBase();
      this.isInitialized = true;
    }
  }

  async loadCarKnowledgeBase() {
    try {
      // Load car brands, models, and features
      const brandsQuery = 'SELECT DISTINCT brand FROM cars WHERE status = "active"';
      const modelsQuery = 'SELECT DISTINCT brand, model FROM cars WHERE status = "active"';
      const featuresQuery = 'SELECT DISTINCT fuel_type, transmission, body_type FROM cars WHERE status = "active"';
      
      const [brands, models, features] = await Promise.all([
        executeQuery(brandsQuery),
        executeQuery(modelsQuery),
        executeQuery(featuresQuery)
      ]);

      this.carKnowledgeBase.set('brands', brands.map(b => b.brand.toLowerCase()));
      this.carKnowledgeBase.set('models', models);
      this.carKnowledgeBase.set('features', features);
      
      console.log('✅ Car knowledge base loaded successfully');
    } catch (error) {
      console.error('Error loading car knowledge base:', error);
      // Set empty defaults to prevent further errors
      this.carKnowledgeBase.set('brands', []);
      this.carKnowledgeBase.set('models', []);
      this.carKnowledgeBase.set('features', []);
    }
  }

  async processMessage(userId, message, sessionId = null) {
    try {
      // Ensure service is initialized
      await this.ensureInitialized();
      
      // Get or create session
      const session = sessionId || uuidv4();
      
      // Store conversation history
      await this.storeConversationHistory(userId, session, message, 'user');
      
      // Analyze user intent
      const intent = this.classifyIntent(message);
      
      // Extract entities from message
      const entities = this.extractEntities(message);
      
      // Get user context
      const userContext = await this.getUserContext(userId);
      
      // Generate response based on intent
      const response = await this.generateResponse(intent, entities, userContext, userId, session);
      
      // Store bot response
      await this.storeConversationHistory(userId, session, response.message, 'bot');
      
      // Update user preferences based on interaction
      await this.updateUserPreferences(userId, intent, entities);
      
      return {
        sessionId: session,
        response: response.message,
        intent: intent,
        entities: entities,
        suggestions: response.suggestions || [],
        actions: response.actions || [],
        confidence: response.confidence || 0.8
      };
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        sessionId: sessionId || uuidv4(),
        response: "I apologize, but I'm having trouble understanding. Could you please rephrase your question?",
        intent: 'error',
        entities: {},
        suggestions: ['Search for cars', 'Get help', 'Contact support'],
        actions: [],
        confidence: 0.1
      };
    }
  }

  classifyIntent(message) {
    const tokens = this.nlp.tokenize(message);
    const result = this.nlp.classifyIntent(tokens);
    return result.intent;
  }

  extractEntities(message) {
    const entities = {
      brands: [],
      models: [],
      price_range: null,
      features: [],
      locations: []
    };

    const lowerMessage = message.toLowerCase();
    
    // Extract brands
    const brands = this.carKnowledgeBase.get('brands') || [];
    brands.forEach(brand => {
      if (lowerMessage.includes(brand)) {
        entities.brands.push(brand);
      }
    });

    // Extract price range
    const pricePatterns = [
      /under\s+\$?(\d+)/i,
      /below\s+\$?(\d+)/i,
      /less\s+than\s+\$?(\d+)/i,
      /around\s+\$?(\d+)/i,
      /between\s+\$?(\d+)\s+and\s+\$?(\d+)/i
    ];

    pricePatterns.forEach(pattern => {
      const match = message.match(pattern);
      if (match) {
        if (match[2]) {
          entities.price_range = { min: parseInt(match[1]), max: parseInt(match[2]) };
        } else {
          entities.price_range = { max: parseInt(match[1]) };
        }
      }
    });

    // Extract features
    const featureKeywords = {
      'automatic': 'transmission',
      'manual': 'transmission',
      'sedan': 'body_type',
      'suv': 'body_type',
      'hatchback': 'body_type',
      'coupe': 'body_type',
      'convertible': 'body_type',
      'petrol': 'fuel_type',
      'diesel': 'fuel_type',
      'electric': 'fuel_type',
      'hybrid': 'fuel_type'
    };

    Object.keys(featureKeywords).forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        entities.features.push({ type: featureKeywords[keyword], value: keyword });
      }
    });

    return entities;
  }

  async generateResponse(intent, entities, userContext, userId, sessionId) {
    switch (intent) {
      case 'search_car':
        return await this.handleCarSearch(entities, userContext, userId);
      
      case 'price_inquiry':
        return await this.handlePriceInquiry(entities, userContext);
      
      case 'feature_inquiry':
        return await this.handleFeatureInquiry(entities, userContext);
      
      case 'financing_inquiry':
        return await this.handleFinancingInquiry(userContext, userId);
      
      case 'support_request':
        return await this.handleSupportRequest(userContext);
      
      case 'greeting':
        return await this.handleGreeting(userContext, userId);
      
      default:
        return await this.handleGeneralInquiry(message, userContext);
    }
  }

  async handleCarSearch(entities, userContext, userId) {
    try {
      // Build search query based on entities
      let searchQuery = 'SELECT * FROM cars WHERE status = "active"';
      const params = [];

      if (entities.brands.length > 0) {
        searchQuery += ' AND brand IN (' + entities.brands.map(() => '?').join(',') + ')';
        params.push(...entities.brands.map(b => b.charAt(0).toUpperCase() + b.slice(1)));
      }

      if (entities.price_range) {
        if (entities.price_range.max) {
          searchQuery += ' AND price <= ?';
          params.push(entities.price_range.max);
        }
        if (entities.price_range.min) {
          searchQuery += ' AND price >= ?';
          params.push(entities.price_range.min);
        }
      }

      if (entities.features.length > 0) {
        entities.features.forEach(feature => {
          if (feature.type === 'transmission') {
            searchQuery += ' AND transmission = ?';
            params.push(feature.value);
          } else if (feature.type === 'body_type') {
            searchQuery += ' AND body_type = ?';
            params.push(feature.value);
          } else if (feature.type === 'fuel_type') {
            searchQuery += ' AND fuel_type = ?';
            params.push(feature.value);
          }
        });
      }

      searchQuery += ' ORDER BY created_at DESC LIMIT 10';

      const cars = await executeQuery(searchQuery, params);

      if (cars.length === 0) {
        return {
          message: "I couldn't find any cars matching your criteria. Would you like to try different search parameters?",
          suggestions: ['Search by brand', 'Search by price range', 'Search by features'],
          actions: [{ type: 'search', params: {} }],
          confidence: 0.9
        };
      }

      const carList = cars.map(car => 
        `${car.brand} ${car.model} ${car.year} - $${car.price.toLocaleString()}`
      ).join('\n');

      return {
        message: `I found ${cars.length} cars that match your criteria:\n\n${carList}\n\nWould you like to see more details about any of these cars?`,
        suggestions: ['Show me details', 'Filter by price', 'Filter by features'],
        actions: [
          { type: 'show_cars', params: { cars: cars.slice(0, 5) } },
          { type: 'search', params: entities }
        ],
        confidence: 0.95
      };
    } catch (error) {
      console.error('Error handling car search:', error);
      return {
        message: "I'm having trouble searching for cars right now. Please try again later.",
        suggestions: ['Try again', 'Contact support'],
        actions: [],
        confidence: 0.3
      };
    }
  }

  async handlePriceInquiry(entities, userContext) {
    if (entities.brands.length === 0) {
      return {
        message: "I'd be happy to help you with pricing information! Could you tell me which car brand or model you're interested in?",
        suggestions: ['Toyota', 'Honda', 'BMW', 'Mercedes'],
        actions: [],
        confidence: 0.8
      };
    }

    try {
      const brand = entities.brands[0].charAt(0).toUpperCase() + entities.brands[0].slice(1);
      const query = `
        SELECT 
          brand,
          MIN(price) as min_price,
          MAX(price) as max_price,
          AVG(price) as avg_price,
          COUNT(*) as total_cars
        FROM cars 
        WHERE brand = ? AND status = 'active'
        GROUP BY brand
      `;

      const result = await executeQuery(query, [brand]);

      if (result.length === 0) {
        return {
          message: `I don't have any ${brand} cars available right now. Would you like to see other brands?`,
          suggestions: ['Show other brands', 'Search by price range'],
          actions: [],
          confidence: 0.9
        };
      }

      const priceInfo = result[0];
      return {
        message: `${brand} cars range from $${priceInfo.min_price.toLocaleString()} to $${priceInfo.max_price.toLocaleString()}, with an average price of $${Math.round(priceInfo.avg_price).toLocaleString()}. We have ${priceInfo.total_cars} ${brand} cars available.`,
        suggestions: ['Show me cars', 'Filter by price', 'Get financing info'],
        actions: [
          { type: 'search', params: { brands: [brand] } },
          { type: 'show_financing', params: { brand } }
        ],
        confidence: 0.95
      };
    } catch (error) {
      console.error('Error handling price inquiry:', error);
      return {
        message: "I'm having trouble getting pricing information right now. Please try again later.",
        suggestions: ['Try again', 'Contact support'],
        actions: [],
        confidence: 0.3
      };
    }
  }

  async handleFeatureInquiry(entities, userContext) {
    return {
      message: "I can help you learn about car features! Our cars come with various features including different transmission types (automatic, manual), body types (sedan, SUV, hatchback), fuel types (petrol, diesel, electric, hybrid), and many more. What specific features are you interested in?",
      suggestions: ['Transmission types', 'Fuel types', 'Body types', 'Safety features'],
      actions: [
        { type: 'show_features', params: {} },
        { type: 'search', params: entities }
      ],
      confidence: 0.9
    };
  }

  async handleFinancingInquiry(userContext, userId) {
    return {
      message: "Great! I can help you with financing options. We offer various financing solutions including bank loans, dealer financing, and buy-now-pay-later options. Would you like to get pre-approved or see our financing options?",
      suggestions: ['Get pre-approved', 'See financing options', 'Calculate payments'],
      actions: [
        { type: 'show_financing', params: {} },
        { type: 'pre_approval', params: { userId } }
      ],
      confidence: 0.9
    };
  }

  async handleSupportRequest(userContext) {
    return {
      message: "I'm here to help! I can assist you with finding cars, pricing information, financing options, and general questions about our platform. What specific help do you need?",
      suggestions: ['Find a car', 'Pricing info', 'Financing help', 'Contact human support'],
      actions: [
        { type: 'show_help', params: {} },
        { type: 'contact_support', params: {} }
      ],
      confidence: 0.9
    };
  }

  async handleGreeting(userContext, userId) {
    const userName = userContext.first_name || 'there';
    return {
      message: `Hello ${userName}! 👋 I'm your AI car shopping assistant. I can help you find the perfect car, answer questions about pricing and features, and assist with financing options. What can I help you with today?`,
      suggestions: ['Find a car', 'Browse cars', 'Get pricing info', 'Financing options'],
      actions: [
        { type: 'show_categories', params: {} },
        { type: 'show_featured_cars', params: {} }
      ],
      confidence: 0.95
    };
  }

  async getUserContext(userId) {
    try {
      const query = 'SELECT * FROM users WHERE id = ?';
      const result = await executeQuery(query, [userId]);
      return result[0] || {};
    } catch (error) {
      console.error('Error getting user context:', error);
      return {};
    }
  }

  async storeConversationHistory(userId, sessionId, message, sender, options = {}) {
    try {
      const columns = ['id', 'user_id', 'session_id', 'message', 'sender', 'created_at'];
      const placeholders = ['UUID()', '?', '?', '?', '?', 'NOW()'];
      const params = [userId, sessionId, message, sender];

      if (options.intent !== undefined) {
        columns.splice(4, 0, 'intent');
        placeholders.splice(4, 0, '?');
        params.splice(3, 0, options.intent);
      }

      if (options.confidence !== undefined) {
        columns.splice(5, 0, 'confidence');
        placeholders.splice(5, 0, '?');
        params.splice(4, 0, options.confidence);
      }

      if (options.responseTimeMs !== undefined) {
        columns.splice(columns.length - 1, 0, 'response_time_ms');
        placeholders.splice(placeholders.length - 1, 0, '?');
        params.push(options.responseTimeMs);
      }

      if (options.userSatisfactionRating !== undefined) {
        columns.splice(columns.length - 1, 0, 'user_satisfaction_rating');
        placeholders.splice(placeholders.length - 1, 0, '?');
        params.push(options.userSatisfactionRating);
      }

      const query = `
        INSERT INTO ai_conversations 
        (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
      `;
      await executeQuery(query, params);
    } catch (error) {
      console.error('Error storing conversation history:', error);
    }
  }

  async updateUserPreferences(userId, intent, entities) {
    try {
      // Update user preferences based on interaction
      const preferences = this.userPreferences.get(userId) || {};
      
      if (intent === 'search_car') {
        if (entities.brands.length > 0) {
          preferences.preferred_brands = [...(preferences.preferred_brands || []), ...entities.brands];
        }
        if (entities.price_range) {
          preferences.price_range = entities.price_range;
        }
        if (entities.features.length > 0) {
          preferences.preferred_features = [...(preferences.preferred_features || []), ...entities.features];
        }
      }

      this.userPreferences.set(userId, preferences);
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }

  async getConversationHistory(userId, sessionId, limit = 10) {
    try {
      const query = `
        SELECT * FROM ai_conversations 
        WHERE user_id = ? AND session_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `;
      return await executeQuery(query, [userId, sessionId, limit]);
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  async getChatbotAnalytics(period = '7d') {
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 7;
      
      const query = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as total_messages,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(DISTINCT session_id) as unique_sessions,
          SUM(CASE WHEN sender = 'user' THEN 1 ELSE 0 END) as user_messages,
          SUM(CASE WHEN sender = 'bot' THEN 1 ELSE 0 END) as bot_messages
        FROM ai_conversations 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;

      return await executeQuery(query, [days]);
    } catch (error) {
      console.error('Error getting chatbot analytics:', error);
      return [];
    }
  }

  // Public method to initialize the service (can be called on server startup)
  async initialize() {
    try {
      await this.ensureInitialized();
      console.log('✅ AIChatbotService initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize AIChatbotService:', error.message);
      return false;
    }
  }
}

module.exports = new AIChatbotService();
