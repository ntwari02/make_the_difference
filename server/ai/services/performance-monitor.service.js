const { executeQuery } = require('../../config/database');
const aiConfig = require('../config/ai.config');

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.alerts = [];
    this.isMonitoring = false;
    this.monitoringInterval = null;
  }

  async startMonitoring() {
    if (this.isMonitoring) {
      console.log('⚠️  Performance monitoring is already running');
      return;
    }

    const quietMode = process.env.QUIET_STARTUP === 'true';
    if (!quietMode) console.log('📊 Starting AI Performance Monitoring...');
    
    this.isMonitoring = true;
    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
      await this.checkAlerts();
      await this.updateDashboard();
    }, aiConfig.config.monitoring.metrics_collection_interval * 1000);

    if (!quietMode) console.log('✅ Performance monitoring started');
  }

  async stopMonitoring() {
    if (!this.isMonitoring) {
      console.log('⚠️  Performance monitoring is not running');
      return;
    }

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.isMonitoring = false;
    console.log('⏹️  Performance monitoring stopped');
  }

  async collectMetrics() {
    try {
      const timestamp = new Date();
      
      // Check if database is healthy before collecting metrics
      const { getConnectionHealth } = require('../../config/database');
      const health = getConnectionHealth();
      
      if (!health.isHealthy) {
        console.log('⚠️  Skipping metrics collection - database circuit breaker is open');
        return;
      }
      
      // Collect chatbot metrics
      await this.collectChatbotMetrics(timestamp);
      
      // Collect pricing metrics
      await this.collectPricingMetrics(timestamp);
      
      // Collect personalization metrics
      await this.collectPersonalizationMetrics(timestamp);
      
      // Collect analytics metrics
      await this.collectAnalyticsMetrics(timestamp);
      
      // Collect system metrics
      await this.collectSystemMetrics(timestamp);
      
    } catch (error) {
      console.error('❌ Error collecting metrics:', error);
    }
  }

  async collectChatbotMetrics(timestamp) {
    try {
      // Response time metrics
      const responseTimeQuery = `
        SELECT 
          AVG(response_time_ms) as avg_response_time,
          MAX(response_time_ms) as max_response_time,
          MIN(response_time_ms) as min_response_time,
          COUNT(*) as total_requests
        FROM ai_conversations 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      `;
      
      const responseTimeResult = await executeQuery(responseTimeQuery);
      
      // Accuracy metrics
      const accuracyQuery = `
        SELECT 
          AVG(user_satisfaction_rating) as avg_satisfaction,
          COUNT(*) as total_ratings
        FROM ai_conversations 
        WHERE user_satisfaction_rating IS NOT NULL 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      `;
      
      const accuracyResult = await executeQuery(accuracyQuery);
      
      // Intent classification accuracy
      const intentQuery = `
        SELECT 
          COUNT(*) as total_intents,
          SUM(CASE WHEN confidence >= 0.8 THEN 1 ELSE 0 END) as high_confidence_intents
        FROM ai_conversations 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      `;
      
      const intentResult = await executeQuery(intentQuery);
      
      const chatbotMetrics = {
        timestamp,
        service: 'chatbot',
        response_time: {
          avg: responseTimeResult[0]?.avg_response_time || 0,
          max: responseTimeResult[0]?.max_response_time || 0,
          min: responseTimeResult[0]?.min_response_time || 0
        },
        accuracy: {
          satisfaction: accuracyResult[0]?.avg_satisfaction || 0,
          intent_confidence: intentResult[0]?.high_confidence_intents / intentResult[0]?.total_intents || 0
        },
        volume: {
          requests: responseTimeResult[0]?.total_requests || 0,
          ratings: accuracyResult[0]?.total_ratings || 0
        }
      };
      
      await this.storeMetrics(chatbotMetrics);
      
    } catch (error) {
      console.error('❌ Error collecting chatbot metrics:', error);
    }
  }

  async collectPricingMetrics(timestamp) {
    try {
      // Pricing calculation metrics
      const pricingQuery = `
        SELECT 
          AVG(calculation_time_ms) as avg_calculation_time,
          MAX(calculation_time_ms) as max_calculation_time,
          COUNT(*) as total_calculations,
          AVG(price_adjustment_percentage) as avg_adjustment
        FROM ai_pricing_calculations 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      `;
      
      const pricingResult = await executeQuery(pricingQuery);
      
      // A/B test metrics
      const abTestQuery = `
        SELECT 
          COUNT(*) as total_tests,
          AVG(conversion_rate) as avg_conversion_rate,
          AVG(revenue_impact) as avg_revenue_impact
        FROM ai_pricing_ab_tests 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      `;
      
      const abTestResult = await executeQuery(abTestQuery);
      
      const pricingMetrics = {
        timestamp,
        service: 'dynamic_pricing',
        performance: {
          avg_calculation_time: pricingResult[0]?.avg_calculation_time || 0,
          max_calculation_time: pricingResult[0]?.max_calculation_time || 0
        },
        accuracy: {
          avg_adjustment: pricingResult[0]?.avg_adjustment || 0,
          conversion_rate: abTestResult[0]?.avg_conversion_rate || 0
        },
        volume: {
          calculations: pricingResult[0]?.total_calculations || 0,
          ab_tests: abTestResult[0]?.total_tests || 0
        },
        business_impact: {
          revenue_impact: abTestResult[0]?.avg_revenue_impact || 0
        }
      };
      
      await this.storeMetrics(pricingMetrics);
      
    } catch (error) {
      console.error('❌ Error collecting pricing metrics:', error);
    }
  }

  async collectPersonalizationMetrics(timestamp) {
    try {
      // User profile metrics
      const profileQuery = `
        SELECT 
          AVG(personalization_score) as avg_personalization_score,
          COUNT(*) as total_profiles,
          AVG(confidence_level) as avg_profile_accuracy
        FROM ai_user_profiles 
        WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      `;
      
      const profileResult = await executeQuery(profileQuery);
      
      // Recommendation metrics
      const recommendationQuery = `
        SELECT 
          COUNT(*) as total_recommendations,
          AVG(click_through_rate) as avg_ctr,
          AVG(conversion_rate) as avg_conversion_rate
        FROM ai_recommendations 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      `;
      
      const recommendationResult = await executeQuery(recommendationQuery);
      
      const personalizationMetrics = {
        timestamp,
        service: 'personalization',
        performance: {
          avg_personalization_score: profileResult[0]?.avg_personalization_score || 0,
          avg_profile_accuracy: profileResult[0]?.avg_profile_accuracy || 0
        },
        accuracy: {
          avg_ctr: recommendationResult[0]?.avg_ctr || 0,
          avg_conversion_rate: recommendationResult[0]?.avg_conversion_rate || 0
        },
        volume: {
          profiles: profileResult[0]?.total_profiles || 0,
          recommendations: recommendationResult[0]?.total_recommendations || 0
        }
      };
      
      await this.storeMetrics(personalizationMetrics);
      
    } catch (error) {
      console.error('❌ Error collecting personalization metrics:', error);
    }
  }

  async collectAnalyticsMetrics(timestamp) {
    try {
      // Analytics event metrics
      const eventQuery = `
        SELECT 
          COUNT(*) as total_events,
          AVG(processing_time_ms) as avg_processing_time,
          MAX(processing_time_ms) as max_processing_time
        FROM ai_analytics_events 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      `;
      
      const eventResult = await executeQuery(eventQuery);
      
      // Model performance metrics
      const modelQuery = `
        SELECT 
          AVG(accuracy_score) as avg_accuracy,
          AVG(precision_score) as avg_precision,
          AVG(recall_score) as avg_recall,
          COUNT(*) as total_models
        FROM ai_model_performance 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      `;
      
      const modelResult = await executeQuery(modelQuery);
      
      const analyticsMetrics = {
        timestamp,
        service: 'analytics',
        performance: {
          avg_processing_time: eventResult[0]?.avg_processing_time || 0,
          max_processing_time: eventResult[0]?.max_processing_time || 0
        },
        accuracy: {
          avg_accuracy: modelResult[0]?.avg_accuracy || 0,
          avg_precision: modelResult[0]?.avg_precision || 0,
          avg_recall: modelResult[0]?.avg_recall || 0
        },
        volume: {
          events: eventResult[0]?.total_events || 0,
          models: modelResult[0]?.total_models || 0
        }
      };
      
      await this.storeMetrics(analyticsMetrics);
      
    } catch (error) {
      console.error('❌ Error collecting analytics metrics:', error);
    }
  }

  async collectSystemMetrics(timestamp) {
    try {
      // System resource metrics
      const systemMetrics = {
        timestamp,
        service: 'system',
        performance: {
          cpu_usage: process.cpuUsage(),
          memory_usage: process.memoryUsage(),
          uptime: process.uptime()
        },
        volume: {
          active_connections: await this.getActiveConnections(),
          database_size: await this.getDatabaseSize()
        }
      };
      
      await this.storeMetrics(systemMetrics);
      
    } catch (error) {
      console.error('❌ Error collecting system metrics:', error);
    }
  }

  async storeMetrics(metrics) {
    try {
      const query = `
        INSERT INTO ai_system_metrics (
          service_name,
          metric_type,
          metric_name,
          metric_value,
          timestamp,
          metadata
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const metricTypes = Object.keys(metrics).filter(key => key !== 'timestamp' && key !== 'service');
      
      for (const metricType of metricTypes) {
        const metricValue = JSON.stringify(metrics[metricType]);
        const metadata = JSON.stringify({
          service: metrics.service,
          timestamp: metrics.timestamp
        });
        
        await executeQuery(query, [
          metrics.service,
          metricType,
          `${metrics.service}_${metricType}`, // metric_name
          metricValue,
          metrics.timestamp,
          metadata
        ]);
      }
      
    } catch (error) {
      console.error('❌ Error storing metrics:', error);
    }
  }

  async checkAlerts() {
    try {
      const thresholds = aiConfig.config.monitoring.alert_thresholds;
      
      // Check response time alerts
      await this.checkResponseTimeAlerts(thresholds.response_time);
      
      // Check error rate alerts
      await this.checkErrorRateAlerts(thresholds.error_rate);
      
      // Check accuracy alerts
      await this.checkAccuracyAlerts(thresholds.accuracy_drop);
      
    } catch (error) {
      console.error('❌ Error checking alerts:', error);
    }
  }

  async checkResponseTimeAlerts(threshold) {
    try {
      const query = `
        SELECT 
          service_name,
          AVG(JSON_EXTRACT(metric_value, '$.avg')) as avg_response_time
        FROM ai_system_metrics 
        WHERE metric_type = 'response_time' 
        AND timestamp >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        GROUP BY service_name
      `;
      
      const results = await executeQuery(query);
      
      for (const result of results) {
        if (result.avg_response_time > threshold) {
          await this.createAlert({
            type: 'response_time',
            service: result.service_name,
            value: result.avg_response_time,
            threshold: threshold,
            message: `Response time exceeded threshold: ${result.avg_response_time}ms > ${threshold}ms`
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Error checking response time alerts:', error);
    }
  }

  async checkErrorRateAlerts(threshold) {
    try {
      const query = `
        SELECT 
          service_name,
          COUNT(*) as total_requests,
          SUM(CASE WHEN JSON_EXTRACT(metric_value, '$.error_rate') > 0 THEN 1 ELSE 0 END) as error_count
        FROM ai_system_metrics 
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        GROUP BY service_name
      `;
      
      const results = await executeQuery(query);
      
      for (const result of results) {
        const errorRate = result.error_count / result.total_requests;
        if (errorRate > threshold) {
          await this.createAlert({
            type: 'error_rate',
            service: result.service_name,
            value: errorRate,
            threshold: threshold,
            message: `Error rate exceeded threshold: ${(errorRate * 100).toFixed(2)}% > ${(threshold * 100).toFixed(2)}%`
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Error checking error rate alerts:', error);
    }
  }

  async checkAccuracyAlerts(threshold) {
    try {
      const query = `
        SELECT 
          service_name,
          AVG(JSON_EXTRACT(metric_value, '$.accuracy')) as avg_accuracy
        FROM ai_system_metrics 
        WHERE metric_type = 'accuracy' 
        AND timestamp >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        GROUP BY service_name
      `;
      
      const results = await executeQuery(query);
      
      for (const result of results) {
        if (result.avg_accuracy < threshold) {
          await this.createAlert({
            type: 'accuracy_drop',
            service: result.service_name,
            value: result.avg_accuracy,
            threshold: threshold,
            message: `Accuracy dropped below threshold: ${(result.avg_accuracy * 100).toFixed(2)}% < ${(threshold * 100).toFixed(2)}%`
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Error checking accuracy alerts:', error);
    }
  }

  async createAlert(alertData) {
    try {
      const query = `
        INSERT INTO ai_system_metrics (
          service_name,
          metric_type,
          metric_name,
          metric_value,
          timestamp,
          metadata
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      await executeQuery(query, [
        alertData.service,
        'alert',
        `${alertData.service}_alert_${alertData.type}`, // metric_name
        JSON.stringify(alertData),
        new Date(),
        JSON.stringify({ type: 'alert' })
      ]);
      
      console.log(`🚨 ALERT: ${alertData.message}`);
      
    } catch (error) {
      console.error('❌ Error creating alert:', error);
    }
  }

  async updateDashboard() {
    try {
      // Update dashboard with latest metrics
      const dashboardData = await this.generateDashboardData();
      
      // Store dashboard data
      const query = `
        INSERT INTO ai_system_metrics (
          service_name,
          metric_type,
          metric_name,
          metric_value,
          timestamp,
          metadata
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      await executeQuery(query, [
        'dashboard',
        'dashboard_data',
        'dashboard_latest_data', // metric_name
        JSON.stringify(dashboardData),
        new Date(),
        JSON.stringify({ type: 'dashboard' })
      ]);
      
    } catch (error) {
      console.error('❌ Error updating dashboard:', error);
    }
  }

  async generateDashboardData() {
    try {
      const query = `
        SELECT 
          service_name,
          metric_type,
          metric_value,
          timestamp
        FROM ai_system_metrics 
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
        ORDER BY timestamp DESC
      `;
      
      const results = await executeQuery(query);
      
      const dashboardData = {
        timestamp: new Date(),
        services: {},
        overall_health: 'healthy',
        alerts: []
      };
      
      // Process metrics by service
      results.forEach(result => {
        if (!dashboardData.services[result.service_name]) {
          dashboardData.services[result.service_name] = {
            metrics: {},
            health: 'healthy'
          };
        }
        
        dashboardData.services[result.service_name].metrics[result.metric_type] = 
          typeof result.metric_value === 'string' ? JSON.parse(result.metric_value) : result.metric_value;
      });
      
      return dashboardData;
      
    } catch (error) {
      console.error('❌ Error generating dashboard data:', error);
      return null;
    }
  }

  async getActiveConnections() {
    try {
      const query = 'SHOW STATUS LIKE "Threads_connected"';
      const result = await executeQuery(query);
      return result[0]?.Value || 0;
    } catch (error) {
      return 0;
    }
  }

  async getDatabaseSize() {
    try {
      const query = `
        SELECT 
          ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
      `;
      const result = await executeQuery(query);
      return result[0]?.size_mb || 0;
    } catch (error) {
      return 0;
    }
  }

  async getPerformanceReport(timeframe = '1h') {
    try {
      const query = `
        SELECT 
          service_name,
          metric_type,
          AVG(JSON_EXTRACT(metric_value, '$.avg')) as avg_value,
          MAX(JSON_EXTRACT(metric_value, '$.max')) as max_value,
          MIN(JSON_EXTRACT(metric_value, '$.min')) as min_value,
          COUNT(*) as data_points
        FROM ai_system_metrics 
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ${timeframe})
        GROUP BY service_name, metric_type
        ORDER BY service_name, metric_type
      `;
      
      const results = await executeQuery(query);
      
      const report = {
        timeframe,
        generated_at: new Date(),
        services: {}
      };
      
      results.forEach(result => {
        if (!report.services[result.service_name]) {
          report.services[result.service_name] = {};
        }
        
        report.services[result.service_name][result.metric_type] = {
          avg: result.avg_value,
          max: result.max_value,
          min: result.min_value,
          data_points: result.data_points
        };
      });
      
      return report;
      
    } catch (error) {
      console.error('❌ Error generating performance report:', error);
      return null;
    }
  }
}

module.exports = new PerformanceMonitor();
