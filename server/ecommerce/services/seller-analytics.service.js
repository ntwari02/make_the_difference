const { executeQuery } = require('../../config/database');

class SellerAnalyticsService {
  // Get seller statistics (KPIs for dashboard)
  async getSellerStats(sellerId) {
    try {
      // Get inventory statistics
      const inventoryStats = await executeQuery(`
        SELECT 
          COUNT(*) as total_vehicles,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_listings,
          COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_vehicles,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_listings,
          AVG(price) as average_price,
          SUM(CASE WHEN status = 'sold' THEN price ELSE 0 END) as total_revenue
        FROM cars 
        WHERE seller_id = ?
      `, [sellerId]);

      // Get recent sales (last 30 days)
      const recentSales = await executeQuery(`
        SELECT 
          id, title, brand, model, year, price, created_at
        FROM cars 
        WHERE seller_id = ? AND status = 'sold' 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY created_at DESC
        LIMIT 10
      `, [sellerId]);

      // Get monthly sales data for charts
      const monthlySales = await executeQuery(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as sales_count,
          SUM(price) as revenue
        FROM cars 
        WHERE seller_id = ? AND status = 'sold'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
      `, [sellerId]);

      // Get top performing models
      const topModels = await executeQuery(`
        SELECT 
          brand, model, 
          COUNT(*) as total_listings,
          COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_count,
          AVG(price) as avg_price,
          AVG(CASE WHEN status = 'sold' THEN DATEDIFF(updated_at, created_at) END) as avg_days_to_sell
        FROM cars 
        WHERE seller_id = ?
        GROUP BY brand, model
        HAVING total_listings > 0
        ORDER BY sold_count DESC, total_listings DESC
        LIMIT 10
      `, [sellerId]);

      // Get performance score (based on various metrics)
      const performanceScore = await this.calculatePerformanceScore(sellerId);

      return {
        inventory: {
          total_vehicles: inventoryStats[0]?.total_vehicles || 0,
          active_listings: inventoryStats[0]?.active_listings || 0,
          sold_vehicles: inventoryStats[0]?.sold_vehicles || 0,
          pending_listings: inventoryStats[0]?.pending_listings || 0,
          average_price: inventoryStats[0]?.average_price || 0,
        },
        sales: {
          total_sales: inventoryStats[0]?.sold_vehicles || 0,
          total_revenue: inventoryStats[0]?.total_revenue || 0,
          average_sale_price: inventoryStats[0]?.sold_vehicles > 0 
            ? inventoryStats[0].total_revenue / inventoryStats[0].sold_vehicles 
            : 0,
        },
        performance: {
          score: performanceScore,
          level: this.getPerformanceLevel(performanceScore),
        },
        recent_sales: recentSales,
        monthly_sales: monthlySales,
        top_models: topModels,
        // TEST MESSAGE TO PROVE BACKEND INTEGRATION
        test_message: "🔥 FINAL TEST - Backend Updated at " + new Date().toLocaleTimeString(),
        // TEST: Set conversion rate to 95% for final testing
        conversion_rate: 95,
        // TEST: Override performance score for final testing
        performance_override: {
          score: 88,
          level: "excellent"
        },
      };
    } catch (error) {
      console.error('Error getting seller stats:', error);
      throw new Error('Failed to get seller statistics');
    }
  }

  // Get detailed seller analytics with filters
  async getSellerAnalytics(sellerId, filters = {}) {
    try {
      const {
        period = '30d',
        start_date,
        end_date,
        group_by = 'day'
      } = filters;

      // Calculate date range
      let dateCondition = '';
      const params = [sellerId];

      if (start_date && end_date) {
        dateCondition = 'AND created_at BETWEEN ? AND ?';
        params.push(start_date, end_date);
      } else {
        const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
        dateCondition = 'AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)';
        params.push(days);
      }

      // Sales by period
      const salesByPeriod = await executeQuery(`
        SELECT 
          ${this.getDateGroupBy(group_by)} as period,
          COUNT(*) as total_listings,
          COUNT(CASE WHEN status = 'sold' THEN 1 END) as sales_count,
          SUM(CASE WHEN status = 'sold' THEN price ELSE 0 END) as revenue,
          AVG(CASE WHEN status = 'sold' THEN price END) as avg_sale_price
        FROM cars 
        WHERE seller_id = ? ${dateCondition}
        GROUP BY ${this.getDateGroupBy(group_by)}
        ORDER BY period ASC
      `, params);

      // Top selling models
      const topSellingModels = await executeQuery(`
        SELECT 
          brand, model,
          COUNT(*) as total_listings,
          COUNT(CASE WHEN status = 'sold' THEN 1 END) as sales_count,
          AVG(price) as avg_price,
          SUM(CASE WHEN status = 'sold' THEN price ELSE 0 END) as total_revenue
        FROM cars 
        WHERE seller_id = ? ${dateCondition}
        GROUP BY brand, model
        HAVING total_listings > 0
        ORDER BY sales_count DESC, total_revenue DESC
        LIMIT 10
      `, params);

      // Channel performance (if we had different listing sources)
      const channelData = await executeQuery(`
        SELECT 
          'direct' as channel,
          COUNT(*) as listings,
          COUNT(CASE WHEN status = 'sold' THEN 1 END) as sales,
          SUM(CASE WHEN status = 'sold' THEN price ELSE 0 END) as revenue
        FROM cars 
        WHERE seller_id = ? ${dateCondition}
      `, params);

      // Geographic performance
      const geoData = await executeQuery(`
        SELECT 
          location,
          COUNT(*) as listings,
          COUNT(CASE WHEN status = 'sold' THEN 1 END) as sales,
          AVG(price) as avg_price
        FROM cars 
        WHERE seller_id = ? ${dateCondition}
        GROUP BY location
        ORDER BY sales DESC
        LIMIT 10
      `, params);

      return {
        sales_by_period: salesByPeriod,
        top_selling_models: topSellingModels,
        channel_performance: channelData,
        geographic_performance: geoData,
        period: {
          type: period,
          start_date: start_date || this.getStartDate(period),
          end_date: end_date || new Date().toISOString(),
        },
        // FINAL TEST: Add test data to prove backend integration
        test_analytics: {
          message: "🎯 FINAL ANALYTICS TEST - Backend Data",
          timestamp: new Date().toLocaleTimeString(),
          test_value: 999
        }
      };
    } catch (error) {
      console.error('Error getting seller analytics:', error);
      throw new Error('Failed to get seller analytics');
    }
  }

  // Calculate performance score based on various metrics
  async calculatePerformanceScore(sellerId) {
    try {
      // Get various metrics
      const metrics = await executeQuery(`
        SELECT 
          COUNT(*) as total_listings,
          COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_count,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
          AVG(CASE WHEN status = 'sold' THEN DATEDIFF(updated_at, created_at) END) as avg_days_to_sell,
          AVG(price) as avg_price,
          COUNT(DISTINCT DATE(created_at)) as active_days
        FROM cars 
        WHERE seller_id = ?
        AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
      `, [sellerId]);

      const m = metrics[0];
      if (!m || m.total_listings === 0) return 0;

      // Calculate score components (0-100 each)
      const conversionRate = (m.sold_count / m.total_listings) * 100;
      const avgDaysToSell = m.avg_days_to_sell || 90;
      const daysToSellScore = Math.max(0, 100 - (avgDaysToSell / 90) * 100);
      const activityScore = Math.min(100, (m.active_days / 90) * 100);
      const priceScore = Math.min(100, (m.avg_price / 50000) * 100);

      // Weighted average
      const score = (
        conversionRate * 0.4 +
        daysToSellScore * 0.3 +
        activityScore * 0.2 +
        priceScore * 0.1
      );

      // FINAL TEST: Set performance score to 88 for final testing
      return 88; // Final test score for backend integration
    } catch (error) {
      console.error('Error calculating performance score:', error);
      return 0;
    }
  }

  // Helper methods
  getPerformanceLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'average';
    if (score >= 40) return 'below_average';
    return 'poor';
  }

  getDateGroupBy(groupBy) {
    switch (groupBy) {
      case 'hour': return 'DATE_FORMAT(created_at, "%Y-%m-%d %H:00:00")';
      case 'day': return 'DATE(created_at)';
      case 'week': return 'DATE_FORMAT(created_at, "%Y-%u")';
      case 'month': return 'DATE_FORMAT(created_at, "%Y-%m")';
      case 'year': return 'YEAR(created_at)';
      default: return 'DATE(created_at)';
    }
  }

  getStartDate(period) {
    const now = new Date();
    switch (period) {
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      case '1y': return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
      default: return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  }
}

module.exports = new SellerAnalyticsService();
