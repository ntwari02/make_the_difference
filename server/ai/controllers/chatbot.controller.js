const { ok, badRequest, notFound } = require('../../utils/response');
const chatbotService = require('../services/chatbot.service');

// Process chat message
const processMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return badRequest(res, 'Message is required');
    }

    if (message.length > 1000) {
      return badRequest(res, 'Message is too long (max 1000 characters)');
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

// Get conversation history
const getConversationHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 20 } = req.query;
    const userId = req.user.id;

    const history = await chatbotService.getConversationHistory(
      userId, 
      sessionId, 
      parseInt(limit)
    );

    return ok(res, {
      sessionId,
      conversation_history: history.reverse(), // Reverse to show chronological order
      count: history.length
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get chatbot analytics (Admin only)
const getChatbotAnalytics = async (req, res) => {
  try {
    const { period = '7d' } = req.query;

    const analytics = await chatbotService.getChatbotAnalytics(period);

    // Calculate summary statistics
    const totalMessages = analytics.reduce((sum, day) => sum + day.total_messages, 0);
    const totalUsers = analytics.reduce((sum, day) => sum + day.unique_users, 0);
    const totalSessions = analytics.reduce((sum, day) => sum + day.unique_sessions, 0);
    const avgMessagesPerUser = totalUsers > 0 ? (totalMessages / totalUsers).toFixed(2) : 0;

    return ok(res, {
      period,
      analytics,
      summary: {
        total_messages: totalMessages,
        total_users: totalUsers,
        total_sessions: totalSessions,
        avg_messages_per_user: parseFloat(avgMessagesPerUser),
        avg_messages_per_session: totalSessions > 0 ? (totalMessages / totalSessions).toFixed(2) : 0
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get chatbot suggestions
const getChatbotSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const userContext = await chatbotService.getUserContext(userId);

    // Generate contextual suggestions based on user profile and preferences
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

    // Add personalized suggestions based on user context
    if (userContext.role === 'buyer') {
      suggestions.push({
        type: 'personalized',
        title: 'My Favorites',
        description: 'View your saved cars',
        action: 'view_favorites',
        icon: '❤️'
      });
    }

    if (userContext.role === 'seller') {
      suggestions.push({
        type: 'personalized',
        title: 'My Listings',
        description: 'Manage your car listings',
        action: 'my_listings',
        icon: '📋'
      });
    }

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

// Start new chat session
const startNewSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { v4: uuidv4 } = require('uuid');
    const sessionId = uuidv4();

    // Send welcome message
    const welcomeResult = await chatbotService.processMessage(userId, 'hello', sessionId);

    return ok(res, {
      sessionId,
      welcome_message: welcomeResult.response,
      suggestions: welcomeResult.suggestions,
      actions: welcomeResult.actions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get chatbot status and capabilities
const getChatbotStatus = async (req, res) => {
  try {
    const capabilities = [
      {
        name: 'Car Search',
        description: 'Find cars based on brand, model, price, and features',
        status: 'active'
      },
      {
        name: 'Price Information',
        description: 'Get pricing details and comparisons',
        status: 'active'
      },
      {
        name: 'Feature Inquiries',
        description: 'Learn about car features and specifications',
        status: 'active'
      },
      {
        name: 'Financing Help',
        description: 'Get information about financing options',
        status: 'active'
      },
      {
        name: 'General Support',
        description: 'Answer general questions and provide help',
        status: 'active'
      }
    ];

    return ok(res, {
      status: 'online',
      capabilities,
      version: '1.0.0',
      last_updated: new Date().toISOString(),
      supported_languages: ['en'],
      features: {
        voice_support: false, // Will be implemented in future
        image_analysis: false, // Will be implemented in future
        sentiment_analysis: true,
        context_memory: true,
        personalization: true
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Train chatbot with new data (Admin only)
const trainChatbot = async (req, res) => {
  try {
    const { trainingData } = req.body;

    if (!trainingData || !Array.isArray(trainingData)) {
      return badRequest(res, 'Training data must be an array');
    }

    // Validate training data format
    for (const item of trainingData) {
      if (!item.text || !item.intent) {
        return badRequest(res, 'Each training item must have text and intent');
      }
    }

    // Retrain the classifier with new data
    chatbotService.trainIntentClassifier(trainingData);

    return ok(res, {
      message: 'Chatbot training completed successfully',
      trained_samples: trainingData.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get chatbot performance metrics (Admin only)
const getChatbotMetrics = async (req, res) => {
  try {
    const { period = '7d' } = req.query;

    // Get conversation analytics
    const analytics = await chatbotService.getChatbotAnalytics(period);

    // Calculate performance metrics
    const totalMessages = analytics.reduce((sum, day) => sum + day.total_messages, 0);
    const totalUsers = analytics.reduce((sum, day) => sum + day.unique_users, 0);
    const totalSessions = analytics.reduce((sum, day) => sum + day.unique_sessions, 0);

    // Calculate response time (simulated)
    const avgResponseTime = 1.2; // seconds

    // Calculate satisfaction score (simulated)
    const satisfactionScore = 4.2; // out of 5

    // Calculate intent recognition accuracy (simulated)
    const intentAccuracy = 0.87; // 87%

    return ok(res, {
      period,
      performance_metrics: {
        total_messages,
        total_users,
        total_sessions,
        avg_response_time: avgResponseTime,
        satisfaction_score: satisfactionScore,
        intent_recognition_accuracy: intentAccuracy,
        avg_messages_per_session: totalSessions > 0 ? (totalMessages / totalSessions).toFixed(2) : 0,
        user_retention_rate: 0.78 // 78%
      },
      analytics,
      recommendations: [
        'Consider adding voice support for better accessibility',
        'Implement image analysis for visual car searches',
        'Add multilingual support for international users',
        'Enhance personalization based on user behavior'
      ]
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  processMessage,
  getConversationHistory,
  getChatbotAnalytics,
  getChatbotSuggestions,
  startNewSession,
  getChatbotStatus,
  trainChatbot,
  getChatbotMetrics
};
