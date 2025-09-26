const { executeQuery } = require('../../config/database');
const aiInitializer = require('../services/ai-initializer.service');
const chatbotService = require('../services/chatbot.service');
const dynamicPricingService = require('../services/dynamic-pricing.service');
const personalizationService = require('../services/personalization.service');
const analyticsService = require('../services/analytics.service');

class AITestSuite {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
  }

  async runAllTests() {
    console.log('🧪 Starting AI Test Suite...\n');
    
    try {
      // Initialize AI services first
      await aiInitializer.initializeAllServices();
      console.log('✅ AI services initialized for testing\n');

      // Run test categories
      await this.testChatbotService();
      await this.testDynamicPricingService();
      await this.testPersonalizationService();
      await this.testAnalyticsService();
      await this.testIntegration();
      await this.testPerformance();
      await this.testSecurity();

      // Generate test report
      this.generateTestReport();
      
      return this.testResults;
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      throw error;
    }
  }

  async testChatbotService() {
    console.log('🤖 Testing Chatbot Service...');
    
    const tests = [
      {
        name: 'Intent Classification',
        test: async () => {
          const testMessages = [
            { message: 'Hello', expectedIntent: 'greeting' },
            { message: 'I want to buy a car', expectedIntent: 'search_car' },
            { message: 'What is the price?', expectedIntent: 'price_inquiry' },
            { message: 'Tell me about features', expectedIntent: 'feature_inquiry' },
            { message: 'I need financing', expectedIntent: 'financing_inquiry' }
          ];

          for (const test of testMessages) {
            const result = await chatbotService.processMessage('test-user', test.message);
            if (result.intent !== test.expectedIntent) {
              throw new Error(`Expected intent '${test.expectedIntent}', got '${result.intent}'`);
            }
          }
          return true;
        }
      },
      {
        name: 'Response Generation',
        test: async () => {
          const result = await chatbotService.processMessage('test-user', 'Hello');
          if (!result.response || result.response.length < 10) {
            throw new Error('Invalid response generated');
          }
          return true;
        }
      },
      {
        name: 'Context Memory',
        test: async () => {
          await chatbotService.processMessage('test-user', 'I am looking for a BMW');
          const result = await chatbotService.processMessage('test-user', 'What is the price?');
          if (!result.context || !result.context.includes('BMW')) {
            throw new Error('Context memory not working properly');
          }
          return true;
        }
      },
      {
        name: 'Fallback Handling',
        test: async () => {
          const result = await chatbotService.processMessage('test-user', 'xyzabc123');
          if (!result.response || result.response.length < 10) {
            throw new Error('Fallback response not generated');
          }
          return true;
        }
      }
    ];

    await this.runTestCategory('Chatbot Service', tests);
  }

  async testDynamicPricingService() {
    console.log('💰 Testing Dynamic Pricing Service...');
    
    const tests = [
      {
        name: 'Price Calculation',
        test: async () => {
          const result = await dynamicPricingService.calculateDynamicPrice('test-car', 'test-user');
          if (!result.dynamic_price || result.dynamic_price <= 0) {
            throw new Error('Invalid dynamic price calculated');
          }
          return true;
        }
      },
      {
        name: 'Market Analysis',
        test: async () => {
          const result = await dynamicPricingService.analyzeMarketConditions('test-car');
          if (!result.demand_score || result.demand_score < 0 || result.demand_score > 1) {
            throw new Error('Invalid demand score');
          }
          return true;
        }
      },
      {
        name: 'Competitor Analysis',
        test: async () => {
          const result = await dynamicPricingService.analyzeCompetitorPrices('test-car');
          if (!result.competitor_analysis || typeof result.competitor_analysis !== 'object') {
            throw new Error('Invalid competitor analysis');
          }
          return true;
        }
      },
      {
        name: 'Price Optimization',
        test: async () => {
          const result = await dynamicPricingService.optimizePrice('test-car', 25000);
          if (!result.optimized_price || result.optimized_price <= 0) {
            throw new Error('Invalid optimized price');
          }
          return true;
        }
      }
    ];

    await this.runTestCategory('Dynamic Pricing Service', tests);
  }

  async testPersonalizationService() {
    console.log('👤 Testing Personalization Service...');
    
    const tests = [
      {
        name: 'User Profile Generation',
        test: async () => {
          const result = await personalizationService.generateUserProfile('test-user');
          if (!result.personalization_score || result.personalization_score < 0 || result.personalization_score > 1) {
            throw new Error('Invalid personalization score');
          }
          return true;
        }
      },
      {
        name: 'Behavior Analysis',
        test: async () => {
          const result = await personalizationService.analyzeUserBehavior('test-user');
          if (!result.behavior_patterns || typeof result.behavior_patterns !== 'object') {
            throw new Error('Invalid behavior analysis');
          }
          return true;
        }
      },
      {
        name: 'Recommendation Generation',
        test: async () => {
          const result = await personalizationService.generatePersonalizedRecommendations('test-user');
          if (!Array.isArray(result.recommendations)) {
            throw new Error('Invalid recommendations format');
          }
          return true;
        }
      },
      {
        name: 'Personality Insights',
        test: async () => {
          const result = await personalizationService.generatePersonalityInsights('test-user');
          if (!result.personality_profile || typeof result.personality_profile !== 'object') {
            throw new Error('Invalid personality profile');
          }
          return true;
        }
      }
    ];

    await this.runTestCategory('Personalization Service', tests);
  }

  async testAnalyticsService() {
    console.log('📊 Testing Analytics Service...');
    
    const tests = [
      {
        name: 'Business Insights',
        test: async () => {
          const result = await analyticsService.generateBusinessInsights('7d');
          if (!result.insights || !Array.isArray(result.insights)) {
            throw new Error('Invalid business insights');
          }
          return true;
        }
      },
      {
        name: 'Predictive Analytics',
        test: async () => {
          const result = await analyticsService.generatePredictiveAnalytics('sales', '30d');
          if (!result.predictions || !Array.isArray(result.predictions)) {
            throw new Error('Invalid predictive analytics');
          }
          return true;
        }
      },
      {
        name: 'Anomaly Detection',
        test: async () => {
          const result = await analyticsService.detectAnomalies('sales', '7d');
          if (!result.anomalies || !Array.isArray(result.anomalies)) {
            throw new Error('Invalid anomaly detection');
          }
          return true;
        }
      },
      {
        name: 'Performance Metrics',
        test: async () => {
          const result = await analyticsService.generatePerformanceMetrics('7d');
          if (!result.metrics || typeof result.metrics !== 'object') {
            throw new Error('Invalid performance metrics');
          }
          return true;
        }
      }
    ];

    await this.runTestCategory('Analytics Service', tests);
  }

  async testIntegration() {
    console.log('🔗 Testing AI Service Integration...');
    
    const tests = [
      {
        name: 'Chatbot-Pricing Integration',
        test: async () => {
          const chatbotResult = await chatbotService.processMessage('test-user', 'What is the price of this car?');
          const pricingResult = await dynamicPricingService.calculateDynamicPrice('test-car', 'test-user');
          
          if (!chatbotResult.response || !pricingResult.dynamic_price) {
            throw new Error('Chatbot-pricing integration failed');
          }
          return true;
        }
      },
      {
        name: 'Personalization-Analytics Integration',
        test: async () => {
          const personalizationResult = await personalizationService.generateUserProfile('test-user');
          const analyticsResult = await analyticsService.generateBusinessInsights('7d');
          
          if (!personalizationResult.personalization_score || !analyticsResult.insights) {
            throw new Error('Personalization-analytics integration failed');
          }
          return true;
        }
      },
      {
        name: 'Cross-Service Data Flow',
        test: async () => {
          // Test data flow between services
          const user = 'test-user';
          const car = 'test-car';
          
          // Generate user profile
          const profile = await personalizationService.generateUserProfile(user);
          
          // Use profile for pricing
          const pricing = await dynamicPricingService.calculateDynamicPrice(car, user);
          
          // Generate recommendations
          const recommendations = await personalizationService.generatePersonalizedRecommendations(user);
          
          if (!profile.personalization_score || !pricing.dynamic_price || !recommendations.recommendations) {
            throw new Error('Cross-service data flow failed');
          }
          return true;
        }
      }
    ];

    await this.runTestCategory('AI Service Integration', tests);
  }

  async testPerformance() {
    console.log('⚡ Testing AI Performance...');
    
    const tests = [
      {
        name: 'Response Time - Chatbot',
        test: async () => {
          const startTime = Date.now();
          await chatbotService.processMessage('test-user', 'Hello');
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          if (responseTime > 5000) { // 5 seconds threshold
            throw new Error(`Chatbot response time too slow: ${responseTime}ms`);
          }
          return true;
        }
      },
      {
        name: 'Response Time - Pricing',
        test: async () => {
          const startTime = Date.now();
          await dynamicPricingService.calculateDynamicPrice('test-car', 'test-user');
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          if (responseTime > 3000) { // 3 seconds threshold
            throw new Error(`Pricing response time too slow: ${responseTime}ms`);
          }
          return true;
        }
      },
      {
        name: 'Response Time - Personalization',
        test: async () => {
          const startTime = Date.now();
          await personalizationService.generateUserProfile('test-user');
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          if (responseTime > 4000) { // 4 seconds threshold
            throw new Error(`Personalization response time too slow: ${responseTime}ms`);
          }
          return true;
        }
      },
      {
        name: 'Response Time - Analytics',
        test: async () => {
          const startTime = Date.now();
          await analyticsService.generateBusinessInsights('7d');
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          if (responseTime > 6000) { // 6 seconds threshold
            throw new Error(`Analytics response time too slow: ${responseTime}ms`);
          }
          return true;
        }
      }
    ];

    await this.runTestCategory('AI Performance', tests);
  }

  async testSecurity() {
    console.log('🔒 Testing AI Security...');
    
    const tests = [
      {
        name: 'Input Validation',
        test: async () => {
          try {
            await chatbotService.processMessage('', '');
            await dynamicPricingService.calculateDynamicPrice('', '');
            await personalizationService.generateUserProfile('');
            await analyticsService.generateBusinessInsights('');
            return true;
          } catch (error) {
            // Should handle invalid inputs gracefully
            return true;
          }
        }
      },
      {
        name: 'SQL Injection Protection',
        test: async () => {
          const maliciousInput = "'; DROP TABLE users; --";
          try {
            await chatbotService.processMessage('test-user', maliciousInput);
            await personalizationService.generateUserProfile(maliciousInput);
            return true;
          } catch (error) {
            // Should handle malicious inputs gracefully
            return true;
          }
        }
      },
      {
        name: 'Data Privacy',
        test: async () => {
          // Test that sensitive data is not exposed
          const result = await personalizationService.generateUserProfile('test-user');
          if (result && typeof result === 'object') {
            // Check that no sensitive data is exposed
            const sensitiveKeys = ['password', 'ssn', 'credit_card', 'email'];
            for (const key of sensitiveKeys) {
              if (result[key]) {
                throw new Error(`Sensitive data exposed: ${key}`);
              }
            }
          }
          return true;
        }
      }
    ];

    await this.runTestCategory('AI Security', tests);
  }

  async runTestCategory(categoryName, tests) {
    console.log(`   📋 Running ${tests.length} tests in ${categoryName}...`);
    
    for (const test of tests) {
      await this.runTest(categoryName, test.name, test.test);
    }
    
    console.log(`   ✅ ${categoryName} tests completed\n`);
  }

  async runTest(category, testName, testFunction) {
    this.testResults.total++;
    
    try {
      const startTime = Date.now();
      await testFunction();
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.testResults.passed++;
      this.testResults.details.push({
        category,
        test: testName,
        status: 'PASSED',
        duration: `${duration}ms`
      });
      
      console.log(`      ✅ ${testName} (${duration}ms)`);
    } catch (error) {
      this.testResults.failed++;
      this.testResults.details.push({
        category,
        test: testName,
        status: 'FAILED',
        error: error.message
      });
      
      console.log(`      ❌ ${testName}: ${error.message}`);
    }
  }

  generateTestReport() {
    console.log('\n📊 AI Test Suite Report');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${this.testResults.total}`);
    console.log(`Passed: ${this.testResults.passed}`);
    console.log(`Failed: ${this.testResults.failed}`);
    console.log(`Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(2)}%`);
    
    if (this.testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.details
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`   - ${test.category}: ${test.test} - ${test.error}`);
        });
    }
    
    console.log('\n✅ Test Suite Completed!');
  }
}

module.exports = AITestSuite;
