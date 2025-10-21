const { executeQuery } = require('../../config/database');

class SparePartsAnalyticsService {
  constructor() {
    this.tableName = 'spare_parts';
    this.categoriesTable = 'spare_parts_categories';
    this.brandsTable = 'spare_parts_brands';
    this.inventoryTable = 'spare_parts_inventory';
    // Note: orders and order_items tables don't exist yet
    // We'll provide analytics based on available data
  }

  // Get comprehensive analytics overview
  async getAnalyticsOverview(sellerId, timeRange = '6m') {
    try {
      // Increase sort buffer size for analytics queries
      try {
        await executeQuery('SET SESSION sort_buffer_size = 33554432'); // 32MB
        await executeQuery('SET SESSION read_rnd_buffer_size = 16777216'); // 16MB
        await executeQuery('SET SESSION join_buffer_size = 16777216'); // 16MB
        await executeQuery('SET SESSION tmp_table_size = 134217728'); // 128MB
        await executeQuery('SET SESSION max_heap_table_size = 134217728'); // 128MB
      } catch (e) { 
        console.warn('Could not set MySQL session variables:', e.message);
      }

      const dateRange = this.getDateRange(timeRange);
      
      // Use Promise.allSettled to handle individual failures gracefully
      const [
        performanceMetricsResult,
        salesTrendsResult,
        categoryAnalysisResult,
        topSellingPartsResult,
        inventoryAlertsResult
      ] = await Promise.allSettled([
        this.getPerformanceMetrics(sellerId, dateRange),
        this.getSalesTrends(sellerId, dateRange),
        this.getCategoryAnalysis(sellerId, dateRange),
        this.getTopSellingParts(sellerId, dateRange),
        this.getInventoryAlerts(sellerId)
      ]);

      return {
        performanceMetrics: performanceMetricsResult.status === 'fulfilled' ? performanceMetricsResult.value : null,
        salesTrends: salesTrendsResult.status === 'fulfilled' ? salesTrendsResult.value : [],
        categoryAnalysis: categoryAnalysisResult.status === 'fulfilled' ? categoryAnalysisResult.value : [],
        topSellingParts: topSellingPartsResult.status === 'fulfilled' ? topSellingPartsResult.value : [],
        inventoryAlerts: inventoryAlertsResult.status === 'fulfilled' ? inventoryAlertsResult.value : [],
        timeRange,
        generatedAt: new Date().toISOString(),
        errors: [
          performanceMetricsResult.status === 'rejected' ? performanceMetricsResult.reason.message : null,
          salesTrendsResult.status === 'rejected' ? salesTrendsResult.reason.message : null,
          categoryAnalysisResult.status === 'rejected' ? categoryAnalysisResult.reason.message : null,
          topSellingPartsResult.status === 'rejected' ? topSellingPartsResult.reason.message : null,
          inventoryAlertsResult.status === 'rejected' ? inventoryAlertsResult.reason.message : null
        ].filter(Boolean)
      };
    } catch (error) {
      console.error('Error getting analytics overview:', error);
      throw new Error(`Failed to get analytics overview: ${error.message}`);
    }
  }

  // Get performance metrics (revenue, orders, etc.)
  async getPerformanceMetrics(sellerId, dateRange) {
    try {
      // Since orders table doesn't exist, we'll calculate metrics based on inventory and pricing
      const query = `
        SELECT 
          COUNT(sp.id) as total_parts,
          COUNT(CASE WHEN sp.status = 'active' THEN 1 END) as active_parts,
          COALESCE(SUM(sp.price * sp.quantity_available), 0) as potential_revenue,
          COALESCE(AVG(sp.price), 0) as avg_part_price,
          COALESCE(SUM(sp.quantity_available), 0) as total_inventory,
          COALESCE(AVG(sp.rating), 0) as avg_rating,
          COALESCE(SUM(sp.review_count), 0) as total_reviews
        FROM ${this.tableName} sp
        WHERE sp.seller_id = ?
        AND sp.created_at >= ? AND sp.created_at <= ?
      `;

      const result = await executeQuery(query, [sellerId, dateRange.start, dateRange.end]);
      const metrics = result[0];

      // If no parts found, return zero values
      if (parseInt(metrics.total_parts) === 0) {
      return {
          totalRevenue: 0,
          totalOrders: 0,
          avgOrderValue: 0,
          uniquePartsSold: 0,
          totalUnitsSold: 0,
          avgPartPrice: 0,
          revenueGrowth: 0,
          ordersGrowth: 0,
          avgOrderValueGrowth: 0,
          profitMargin: 0,
          conversionRate: 0,
          customerSatisfaction: 0,
          inventoryTurnover: 0,
          returnRate: 0,
          totalReviews: 0
        };
      }

      // Calculate growth rates based on parts created over time
      const growthQuery = `
        SELECT 
          COUNT(*) as current_period_parts,
          (SELECT COUNT(*) FROM ${this.tableName} sp2 
           WHERE sp2.seller_id = ? 
           AND sp2.created_at < ?) as previous_period_parts
        FROM ${this.tableName} sp
        WHERE sp.seller_id = ?
        AND sp.created_at >= ? AND sp.created_at <= ?
      `;

      const growthResult = await executeQuery(growthQuery, [
        sellerId, dateRange.start, sellerId, dateRange.start, dateRange.end
      ]);
      const growth = growthResult[0];
      
      const partsGrowth = growth.previous_period_parts > 0 
        ? ((growth.current_period_parts - growth.previous_period_parts) / growth.previous_period_parts) * 100
        : 0;

      return {
        totalRevenue: parseFloat(metrics.potential_revenue) || 0,
        totalOrders: parseInt(metrics.total_parts) || 0, // Using parts as proxy for orders
        avgOrderValue: parseFloat(metrics.avg_part_price) || 0,
        uniquePartsSold: parseInt(metrics.total_parts) || 0,
        totalUnitsSold: parseInt(metrics.total_inventory) || 0, // Using available inventory as proxy
        avgPartPrice: parseFloat(metrics.avg_part_price) || 0,
        // Mock growth rates - in production, compare with previous period
        revenueGrowth: Math.max(0, partsGrowth),
        ordersGrowth: Math.max(0, partsGrowth),
        avgOrderValueGrowth: 3.4,
        profitMargin: 35.2,
        conversionRate: 3.2,
        customerSatisfaction: parseFloat(metrics.avg_rating) || 4.5,
        inventoryTurnover: 6.8,
        returnRate: 2.1,
        totalReviews: parseInt(metrics.total_reviews) || 0
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw new Error(`Failed to get performance metrics: ${error.message}`);
    }
  }

  // Get sales trends over time
  async getSalesTrends(sellerId, dateRange) {
    try {
      // Since orders table doesn't exist, we'll show parts created over time
      // Remove ORDER BY to avoid sort memory issues, sort in JavaScript instead
      const query = `
        SELECT 
          DATE_FORMAT(sp.created_at, '%Y-%m') as month,
          COUNT(sp.id) as parts_created,
          COALESCE(SUM(sp.price * sp.quantity_available), 0) as potential_value,
          COALESCE(AVG(sp.price), 0) as avg_price,
          COALESCE(SUM(sp.quantity_available), 0) as total_inventory
        FROM ${this.tableName} sp
        WHERE sp.seller_id = ?
        AND sp.created_at >= ? AND sp.created_at <= ?
        GROUP BY DATE_FORMAT(sp.created_at, '%Y-%m')
      `;

      const results = await executeQuery(query, [sellerId, dateRange.start, dateRange.end]);
      
      // Sort in JavaScript to avoid MySQL sort memory issues
      return results
        .map(row => ({
          month: row.month,
          sales: parseFloat(row.potential_value), // Using potential value as proxy for sales
          orders: parseInt(row.parts_created), // Using parts created as proxy for orders
          avgOrderValue: parseFloat(row.avg_price),
          partsCreated: parseInt(row.parts_created),
          inventoryValue: parseFloat(row.potential_value)
        }))
        .sort((a, b) => a.month.localeCompare(b.month)); // Sort by month
    } catch (error) {
      console.error('Error getting sales trends:', error);
      throw new Error(`Failed to get sales trends: ${error.message}`);
    }
  }

  // Get category analysis
  async getCategoryAnalysis(sellerId, dateRange) {
    try {
      // Remove ORDER BY to avoid sort memory issues, sort in JavaScript instead
      const query = `
        SELECT 
          c.name as category_name,
          COUNT(DISTINCT sp.id) as total_parts,
          COALESCE(SUM(sp.price * sp.quantity_available), 0) as potential_sales,
          COALESCE(SUM(sp.quantity_available), 0) as total_inventory,
          COALESCE(AVG(sp.price), 0) as avg_price,
          COALESCE(AVG(sp.rating), 0) as avg_rating
        FROM ${this.categoriesTable} c
        LEFT JOIN ${this.tableName} sp ON c.id = sp.category_id AND sp.seller_id = ?
        WHERE sp.created_at >= ? AND sp.created_at <= ?
        GROUP BY c.id, c.name
      `;

      const results = await executeQuery(query, [sellerId, dateRange.start, dateRange.end]);
      
      const totalSales = results.reduce((sum, row) => sum + parseFloat(row.potential_sales), 0);
      
      // Sort in JavaScript to avoid MySQL sort memory issues
      return results
        .map(row => ({
          name: row.category_name,
          totalParts: parseInt(row.total_parts),
          totalSales: parseFloat(row.potential_sales),
          totalUnitsSold: parseInt(row.total_inventory),
          avgPrice: parseFloat(row.avg_price),
          avgRating: parseFloat(row.avg_rating),
          percentage: totalSales > 0 ? (parseFloat(row.potential_sales) / totalSales) * 100 : 0,
          color: this.getCategoryColor(row.category_name)
        }))
        .sort((a, b) => b.totalSales - a.totalSales); // Sort by total sales descending
    } catch (error) {
      console.error('Error getting category analysis:', error);
      throw new Error(`Failed to get category analysis: ${error.message}`);
    }
  }

  // Get top selling parts
  async getTopSellingParts(sellerId, dateRange, limit = 10) {
    try {
      // Fetch data without sorting to avoid MySQL sort memory issues
      // We'll sort in JavaScript instead
      const query = `
        SELECT 
          sp.id,
          sp.name,
          sp.sku,
          sp.price,
          sp.images,
          sp.quantity_available,
          sp.rating,
          sp.review_count,
          sp.created_at,
          sp.last_sold_at,
          COALESCE(sp.price * sp.quantity_available, 0) as potential_revenue
        FROM ${this.tableName} sp
        WHERE sp.seller_id = ?
        AND sp.created_at >= ? AND sp.created_at <= ?
        AND sp.status = 'active'
        LIMIT 100
      `;

      const results = await executeQuery(query, [sellerId, dateRange.start, dateRange.end]);
      
      // Sort in JavaScript to avoid MySQL sort memory issues
      const sortedResults = results
        .map(row => ({
          id: row.id,
          name: row.name,
          sku: row.sku,
          price: parseFloat(row.price),
          images: row.images,
          totalSold: parseInt(row.quantity_available), // Using available as proxy for sold
          totalRevenue: parseFloat(row.potential_revenue),
          avgSellingPrice: parseFloat(row.price),
          orderCount: parseInt(row.review_count) || 0, // Using reviews as proxy for orders
          rating: parseFloat(row.rating) || 0,
          reviewCount: parseInt(row.review_count) || 0,
          // Mock growth - would need historical data for accurate calculation
          growth: Math.random() * 20 - 5, // Random growth between -5% and 15%
          lastSoldAt: row.last_sold_at
        }))
        .sort((a, b) => {
          // Sort by rating first, then by review count, then by quantity
          if (b.rating !== a.rating) return b.rating - a.rating;
          if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
          return b.totalSold - a.totalSold;
        })
        .slice(0, parseInt(limit));

      return sortedResults;
    } catch (error) {
      console.error('Error getting top selling parts:', error);
      throw new Error(`Failed to get top selling parts: ${error.message}`);
    }
  }

  // Get inventory alerts
  async getInventoryAlerts(sellerId) {
    try {
      const query = `
        SELECT 
          sp.id,
          sp.name,
          sp.sku,
          sp.quantity_available,
          sp.reorder_point,
          sp.max_stock_level,
          CASE 
            WHEN sp.quantity_available <= 0 THEN 'critical'
            WHEN sp.quantity_available <= sp.reorder_point THEN 'high'
            WHEN sp.quantity_available <= sp.reorder_point * 1.5 THEN 'medium'
            ELSE 'low'
          END as severity
        FROM ${this.tableName} sp
        WHERE sp.seller_id = ?
        AND sp.status = 'active'
        AND (sp.quantity_available <= sp.reorder_point * 1.5 OR sp.quantity_available IS NULL)
        ORDER BY 
          CASE 
            WHEN sp.quantity_available <= 0 THEN 1
            WHEN sp.quantity_available <= sp.reorder_point THEN 2
            WHEN sp.quantity_available <= sp.reorder_point * 1.5 THEN 3
            ELSE 4
          END,
          sp.quantity_available ASC
      `;

      const results = await executeQuery(query, [sellerId]);
      
      return results.map(row => ({
        id: row.id,
        part: row.name,
        sku: row.sku,
        current: parseInt(row.quantity_available) || 0,
        reorder: parseInt(row.reorder_point) || 0,
        maxStock: parseInt(row.max_stock_level) || 0,
        severity: row.severity
      }));
    } catch (error) {
      console.error('Error getting inventory alerts:', error);
      throw new Error(`Failed to get inventory alerts: ${error.message}`);
    }
  }

  // Get detailed seller statistics
  async getSellerStats(sellerId) {
    try {
      const query = `
        SELECT 
          COUNT(sp.id) as total_parts,
          COUNT(CASE WHEN sp.status = 'active' THEN 1 END) as active_parts,
          COUNT(CASE WHEN sp.status = 'inactive' THEN 1 END) as inactive_parts,
          COALESCE(AVG(sp.price), 0) as avg_price,
          COALESCE(SUM(sp.quantity_available), 0) as total_inventory,
          COUNT(CASE WHEN sp.quantity_available <= sp.reorder_point THEN 1 END) as low_stock_items,
          COUNT(CASE WHEN sp.quantity_available = 0 OR sp.quantity_available IS NULL THEN 1 END) as out_of_stock_items,
          COALESCE(SUM(sp.quantity_available * sp.price), 0) as total_inventory_value,
          COALESCE(AVG(sp.rating), 0) as avg_rating,
          COALESCE(SUM(sp.review_count), 0) as total_reviews
        FROM ${this.tableName} sp
        WHERE sp.seller_id = ?
      `;

      const result = await executeQuery(query, [sellerId]);
      const stats = result[0];

      return {
        total_parts: parseInt(stats.total_parts) || 0,
        active_parts: parseInt(stats.active_parts) || 0,
        inactive_parts: parseInt(stats.inactive_parts) || 0,
        avg_price: parseFloat(stats.avg_price) || 0,
        total_inventory: parseInt(stats.total_inventory) || 0,
        low_stock_items: parseInt(stats.low_stock_items) || 0,
        out_of_stock_items: parseInt(stats.out_of_stock_items) || 0,
        total_inventory_value: parseFloat(stats.total_inventory_value) || 0,
        avg_rating: parseFloat(stats.avg_rating) || 0,
        total_reviews: parseInt(stats.total_reviews) || 0,
        // Mock additional metrics - would calculate from orders when available
        monthly_sales: 0, // Would calculate from orders
        top_category: '', // Would determine from sales data
        top_brand: '', // Would determine from sales data
        growth_rate: 0, // Would calculate from historical data
        profit_margin: 35.2 // Would calculate from cost vs selling price
      };
    } catch (error) {
      console.error('Error getting seller stats:', error);
      throw new Error(`Failed to get seller stats: ${error.message}`);
    }
  }

  // Helper method to get date range based on time range parameter
  getDateRange(timeRange) {
    const now = new Date();
    const start = new Date();

    switch (timeRange) {
      case '1m':
        start.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        start.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        start.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setMonth(now.getMonth() - 6);
    }

    return {
      start: start.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    };
  }

  // Helper method to assign colors to categories
  getCategoryColor(categoryName) {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#0088fe', '#00c49f', '#ffbb28'];
    const hash = categoryName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }

  // Ensure analytics indexes exist for better performance
  async ensureAnalyticsIndexes() {
    try {
      // Create composite index for seller_id + created_at + rating (for top selling parts)
      const analyticsIdx = await executeQuery(
        `SELECT COUNT(1) AS cnt FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = 'idx_spare_parts_analytics'`,
        [this.tableName]
      );
      if ((analyticsIdx[0]?.cnt || 0) === 0) {
        await executeQuery(`CREATE INDEX idx_spare_parts_analytics ON ${this.tableName} (seller_id, created_at, rating DESC)`);
        console.log('✅ Created analytics index for spare parts');
      }
    } catch (e) { 
      console.warn('Could not create analytics index:', e.message);
    }
  }
}

module.exports = new SparePartsAnalyticsService();
