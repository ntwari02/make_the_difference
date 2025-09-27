const { executeQuery } = require('../config/database');

class AnalyticsDashboardService {
  constructor() {
    this.metrics = {
      SCHOLARSHIP_METRICS: 'scholarship_metrics',
      USER_METRICS: 'user_metrics',
      APPLICATION_METRICS: 'application_metrics',
      ENGAGEMENT_METRICS: 'engagement_metrics',
      REVENUE_METRICS: 'revenue_metrics'
    };
  }

  // Get comprehensive dashboard data
  async getDashboardData(userId = null, userRole = null, timeframe = '30d') {
    try {
      const dateFilter = this.getDateFilter(timeframe);
      
      const [
        overview,
        scholarshipStats,
        applicationStats,
        userStats,
        engagementStats,
        revenueStats,
        topScholarships,
        topCountries,
        conversionFunnel,
        trends
      ] = await Promise.all([
        this.getOverviewMetrics(dateFilter),
        this.getScholarshipStatistics(dateFilter),
        this.getApplicationStatistics(dateFilter),
        this.getUserStatistics(dateFilter),
        this.getEngagementStatistics(dateFilter),
        this.getRevenueStatistics(dateFilter),
        this.getTopScholarships(dateFilter),
        this.getTopCountries(dateFilter),
        this.getConversionFunnel(dateFilter),
        this.getTrendsData(dateFilter)
      ]);

      return {
        overview,
        scholarshipStats,
        applicationStats,
        userStats,
        engagementStats,
        revenueStats,
        topScholarships,
        topCountries,
        conversionFunnel,
        trends,
        timeframe,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw new Error('Failed to get dashboard data');
    }
  }

  // Get overview metrics
  async getOverviewMetrics(dateFilter) {
    try {
      const query = `
        SELECT 
          COUNT(DISTINCT s.id) as total_scholarships,
          COUNT(DISTINCT sa.id) as total_applications,
          COUNT(DISTINCT sa.user_id) as unique_applicants,
          COUNT(DISTINCT CASE WHEN sa.status = 'accepted' THEN sa.id END) as successful_applications,
          COUNT(DISTINCT CASE WHEN sa.status = 'accepted' THEN sa.user_id END) as successful_applicants,
          ROUND(COUNT(DISTINCT CASE WHEN sa.status = 'accepted' THEN sa.id END) * 100.0 / COUNT(DISTINCT sa.id), 2) as success_rate,
          ROUND(AVG(s.amount), 2) as average_scholarship_amount,
          SUM(CASE WHEN sa.status = 'accepted' THEN s.amount ELSE 0 END) as total_awarded_amount
        FROM scholarships s
        LEFT JOIN scholarship_applications sa ON s.id = sa.scholarship_id
        WHERE s.created_at >= ? AND s.status = 'active'
      `;

      const result = await executeQuery(query, [dateFilter]);
      return result[0];
    } catch (error) {
      console.error('Error getting overview metrics:', error);
      throw new Error('Failed to get overview metrics');
    }
  }

  // Get scholarship statistics
  async getScholarshipStatistics(dateFilter) {
    try {
      const query = `
        SELECT 
          s.provider_type,
          COUNT(*) as count,
          AVG(s.amount) as avg_amount,
          SUM(s.amount) as total_amount,
          COUNT(DISTINCT sa.id) as total_applications,
          COUNT(DISTINCT CASE WHEN sa.status = 'accepted' THEN sa.id END) as successful_applications
        FROM scholarships s
        LEFT JOIN scholarship_applications sa ON s.id = sa.scholarship_id
        WHERE s.created_at >= ?
        GROUP BY s.provider_type
        ORDER BY count DESC
      `;

      const stats = await executeQuery(query, [dateFilter]);
      return stats;
    } catch (error) {
      console.error('Error getting scholarship statistics:', error);
      throw new Error('Failed to get scholarship statistics');
    }
  }

  // Get application statistics
  async getApplicationStatistics(dateFilter) {
    try {
      const query = `
        SELECT 
          sa.status,
          COUNT(*) as count,
          COUNT(DISTINCT sa.user_id) as unique_users,
          ROUND(AVG(TIMESTAMPDIFF(DAY, sa.created_at, sa.submitted_at)), 1) as avg_days_to_submit
        FROM scholarship_applications sa
        WHERE sa.created_at >= ?
        GROUP BY sa.status
        ORDER BY count DESC
      `;

      const stats = await executeQuery(query, [dateFilter]);
      return stats;
    } catch (error) {
      console.error('Error getting application statistics:', error);
      throw new Error('Failed to get application statistics');
    }
  }

  // Get user statistics
  async getUserStatistics(dateFilter) {
    try {
      const query = `
        SELECT 
          u.nationality,
          COUNT(DISTINCT u.id) as user_count,
          COUNT(DISTINCT sa.id) as application_count,
          COUNT(DISTINCT CASE WHEN sa.status = 'accepted' THEN sa.id END) as successful_applications,
          ROUND(COUNT(DISTINCT CASE WHEN sa.status = 'accepted' THEN sa.id END) * 100.0 / COUNT(DISTINCT sa.id), 2) as success_rate
        FROM users u
        LEFT JOIN scholarship_applications sa ON u.id = sa.user_id AND sa.created_at >= ?
        WHERE u.role = 'student' AND u.created_at >= ?
        GROUP BY u.nationality
        HAVING user_count > 5
        ORDER BY user_count DESC
        LIMIT 20
      `;

      const stats = await executeQuery(query, [dateFilter, dateFilter]);
      return stats;
    } catch (error) {
      console.error('Error getting user statistics:', error);
      throw new Error('Failed to get user statistics');
    }
  }

  // Get engagement statistics
  async getEngagementStatistics(dateFilter) {
    try {
      const query = `
        SELECT 
          'posts' as metric,
          COUNT(*) as count,
          COUNT(DISTINCT user_id) as unique_users
        FROM community_posts
        WHERE created_at >= ?
        
        UNION ALL
        
        SELECT 
          'likes' as metric,
          COUNT(*) as count,
          COUNT(DISTINCT user_id) as unique_users
        FROM community_likes
        WHERE created_at >= ?
        
        UNION ALL
        
        SELECT 
          'comments' as metric,
          COUNT(*) as count,
          COUNT(DISTINCT user_id) as unique_users
        FROM community_comments
        WHERE created_at >= ?
        
        UNION ALL
        
        SELECT 
          'follows' as metric,
          COUNT(*) as count,
          COUNT(DISTINCT follower_id) as unique_users
        FROM user_follows
        WHERE created_at >= ?
      `;

      const stats = await executeQuery(query, [dateFilter, dateFilter, dateFilter, dateFilter]);
      return stats;
    } catch (error) {
      console.error('Error getting engagement statistics:', error);
      throw new Error('Failed to get engagement statistics');
    }
  }

  // Get revenue statistics
  async getRevenueStatistics(dateFilter) {
    try {
      const query = `
        SELECT 
          SUM(s.application_fee) as total_application_fees,
          COUNT(DISTINCT CASE WHEN s.application_fee > 0 THEN s.id END) as paid_scholarships,
          COUNT(DISTINCT sa.id) as paid_applications,
          AVG(s.application_fee) as avg_application_fee
        FROM scholarships s
        LEFT JOIN scholarship_applications sa ON s.id = sa.scholarship_id
        WHERE s.created_at >= ? AND s.application_fee > 0
      `;

      const stats = await executeQuery(query, [dateFilter]);
      return stats[0];
    } catch (error) {
      console.error('Error getting revenue statistics:', error);
      throw new Error('Failed to get revenue statistics');
    }
  }

  // Get top scholarships
  async getTopScholarships(dateFilter) {
    try {
      const query = `
        SELECT 
          s.id,
          s.title,
          s.provider_name,
          s.country,
          s.amount,
          s.currency,
          COUNT(sa.id) as application_count,
          COUNT(CASE WHEN sa.status = 'accepted' THEN 1 END) as successful_applications,
          ROUND(COUNT(CASE WHEN sa.status = 'accepted' THEN 1 END) * 100.0 / COUNT(sa.id), 2) as success_rate
        FROM scholarships s
        LEFT JOIN scholarship_applications sa ON s.id = sa.scholarship_id
        WHERE s.created_at >= ? AND s.status = 'active'
        GROUP BY s.id
        HAVING application_count > 0
        ORDER BY application_count DESC
        LIMIT 10
      `;

      const topScholarships = await executeQuery(query, [dateFilter]);
      return topScholarships;
    } catch (error) {
      console.error('Error getting top scholarships:', error);
      throw new Error('Failed to get top scholarships');
    }
  }

  // Get top countries
  async getTopCountries(dateFilter) {
    try {
      const query = `
        SELECT 
          s.country,
          COUNT(DISTINCT s.id) as scholarship_count,
          COUNT(DISTINCT sa.id) as application_count,
          COUNT(DISTINCT sa.user_id) as unique_applicants,
          SUM(s.amount) as total_amount,
          AVG(s.amount) as avg_amount
        FROM scholarships s
        LEFT JOIN scholarship_applications sa ON s.id = sa.scholarship_id
        WHERE s.created_at >= ? AND s.status = 'active'
        GROUP BY s.country
        ORDER BY application_count DESC
        LIMIT 15
      `;

      const topCountries = await executeQuery(query, [dateFilter]);
      return topCountries;
    } catch (error) {
      console.error('Error getting top countries:', error);
      throw new Error('Failed to get top countries');
    }
  }

  // Get conversion funnel
  async getConversionFunnel(dateFilter) {
    try {
      const query = `
        SELECT 
          'scholarship_views' as stage,
          COUNT(*) as count
        FROM scholarship_views
        WHERE created_at >= ?
        
        UNION ALL
        
        SELECT 
          'applications_started' as stage,
          COUNT(*) as count
        FROM scholarship_applications
        WHERE created_at >= ?
        
        UNION ALL
        
        SELECT 
          'applications_submitted' as stage,
          COUNT(*) as count
        FROM scholarship_applications
        WHERE created_at >= ? AND status IN ('submitted', 'under_review', 'shortlisted', 'accepted', 'rejected')
        
        UNION ALL
        
        SELECT 
          'applications_accepted' as stage,
          COUNT(*) as count
        FROM scholarship_applications
        WHERE created_at >= ? AND status = 'accepted'
      `;

      const funnel = await executeQuery(query, [dateFilter, dateFilter, dateFilter, dateFilter]);
      return funnel;
    } catch (error) {
      console.error('Error getting conversion funnel:', error);
      throw new Error('Failed to get conversion funnel');
    }
  }

  // Get trends data
  async getTrendsData(dateFilter) {
    try {
      const query = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as applications,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(CASE WHEN status = 'accepted' THEN 1 END) as successful_applications
        FROM scholarship_applications
        WHERE created_at >= ?
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;

      const trends = await executeQuery(query, [dateFilter]);
      return trends;
    } catch (error) {
      console.error('Error getting trends data:', error);
      throw new Error('Failed to get trends data');
    }
  }

  // Get user-specific analytics
  async getUserAnalytics(userId) {
    try {
      const query = `
        SELECT 
          COUNT(sa.id) as total_applications,
          COUNT(CASE WHEN sa.status = 'accepted' THEN 1 END) as successful_applications,
          COUNT(CASE WHEN sa.status = 'rejected' THEN 1 END) as rejected_applications,
          COUNT(CASE WHEN sa.status = 'under_review' THEN 1 END) as pending_applications,
          ROUND(COUNT(CASE WHEN sa.status = 'accepted' THEN 1 END) * 100.0 / COUNT(sa.id), 2) as success_rate,
          AVG(TIMESTAMPDIFF(DAY, sa.created_at, sa.submitted_at)) as avg_days_to_submit,
          SUM(s.amount) as total_awarded_amount,
          COUNT(DISTINCT s.country) as countries_applied_to,
          COUNT(DISTINCT s.provider_type) as provider_types_applied_to
        FROM scholarship_applications sa
        LEFT JOIN scholarships s ON sa.scholarship_id = s.id
        WHERE sa.user_id = ?
      `;

      const analytics = await executeQuery(query, [userId]);
      return analytics[0];
    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw new Error('Failed to get user analytics');
    }
  }

  // Get provider analytics
  async getProviderAnalytics(providerId) {
    try {
      const query = `
        SELECT 
          COUNT(s.id) as total_scholarships,
          COUNT(sa.id) as total_applications,
          COUNT(DISTINCT sa.user_id) as unique_applicants,
          COUNT(CASE WHEN sa.status = 'accepted' THEN 1 END) as successful_applications,
          ROUND(COUNT(CASE WHEN sa.status = 'accepted' THEN 1 END) * 100.0 / COUNT(sa.id), 2) as success_rate,
          SUM(s.amount) as total_awarded_amount,
          AVG(s.amount) as avg_scholarship_amount,
          COUNT(DISTINCT s.country) as countries_offered,
          COUNT(DISTINCT s.degree_level) as degree_levels_offered
        FROM scholarships s
        LEFT JOIN scholarship_applications sa ON s.id = sa.scholarship_id
        WHERE s.provider_id = ?
      `;

      const analytics = await executeQuery(query, [providerId]);
      return analytics[0];
    } catch (error) {
      console.error('Error getting provider analytics:', error);
      throw new Error('Failed to get provider analytics');
    }
  }

  // Get performance insights
  async getPerformanceInsights(timeframe = '30d') {
    try {
      const dateFilter = this.getDateFilter(timeframe);
      
      const insights = [];

      // Application success rate insight
      const successRateQuery = `
        SELECT 
          ROUND(COUNT(CASE WHEN status = 'accepted' THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate
        FROM scholarship_applications
        WHERE created_at >= ?
      `;
      
      const successRate = await executeQuery(successRateQuery, [dateFilter]);
      if (successRate[0].success_rate < 15) {
        insights.push({
          type: 'warning',
          title: 'Low Success Rate',
          message: `Application success rate is ${successRate[0].success_rate}%. Consider improving application quality.`,
          recommendation: 'Focus on better matching and application guidance'
        });
      }

      // Application volume insight
      const volumeQuery = `
        SELECT COUNT(*) as daily_avg
        FROM scholarship_applications
        WHERE created_at >= ?
      `;
      
      const volume = await executeQuery(volumeQuery, [dateFilter]);
      const dailyAvg = volume[0].daily_avg / this.getDaysInTimeframe(timeframe);
      
      if (dailyAvg < 10) {
        insights.push({
          type: 'info',
          title: 'Low Application Volume',
          message: `Average ${dailyAvg.toFixed(1)} applications per day. Consider promoting more scholarships.`,
          recommendation: 'Increase marketing efforts and scholarship visibility'
        });
      }

      // Top performing countries insight
      const topCountriesQuery = `
        SELECT s.country, COUNT(sa.id) as applications
        FROM scholarships s
        LEFT JOIN scholarship_applications sa ON s.id = sa.scholarship_id
        WHERE s.created_at >= ?
        GROUP BY s.country
        ORDER BY applications DESC
        LIMIT 3
      `;
      
      const topCountries = await executeQuery(topCountriesQuery, [dateFilter]);
      if (topCountries.length > 0) {
        insights.push({
          type: 'success',
          title: 'Top Performing Countries',
          message: `Most applications come from: ${topCountries.map(c => c.country).join(', ')}`,
          recommendation: 'Focus on expanding scholarship offerings in these regions'
        });
      }

      return insights;
    } catch (error) {
      console.error('Error getting performance insights:', error);
      throw new Error('Failed to get performance insights');
    }
  }

  // Get date filter for timeframe
  getDateFilter(timeframe) {
    const now = new Date();
    switch (timeframe) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  // Get days in timeframe
  getDaysInTimeframe(timeframe) {
    switch (timeframe) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  }

  // Export analytics data
  async exportAnalyticsData(format = 'json', timeframe = '30d') {
    try {
      const data = await this.getDashboardData(null, null, timeframe);
      
      if (format === 'csv') {
        return this.convertToCSV(data);
      }
      
      return data;
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw new Error('Failed to export analytics data');
    }
  }

  // Convert data to CSV format
  convertToCSV(data) {
    // This would convert the analytics data to CSV format
    // Implementation depends on specific requirements
    return JSON.stringify(data, null, 2);
  }
}

module.exports = new AnalyticsDashboardService();
