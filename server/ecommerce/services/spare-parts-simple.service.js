const { executeQuery } = require('../../config/database');

class SparePartsService {
  constructor() {
    this.tableName = 'spare_parts';
    this.categoriesTable = 'spare_parts_categories';
    this.brandsTable = 'spare_parts_brands';
    this.categoriesCache = new Map();
    this.brandsCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.lastCacheUpdate = 0;
  }

  // Load categories and brands into cache
  async loadCache() {
    const now = Date.now();
    if (now - this.lastCacheUpdate < this.cacheExpiry) {
      return; // Cache is still valid
    }

    try {
      // Load all categories
      const categoryQuery = `SELECT id, name FROM ${this.categoriesTable}`;
      const categoryResults = await executeQuery(categoryQuery, []);
      this.categoriesCache.clear();
      categoryResults.forEach(cat => this.categoriesCache.set(cat.id, cat.name));

      // Load all brands
      const brandQuery = `SELECT id, name FROM ${this.brandsTable}`;
      const brandResults = await executeQuery(brandQuery, []);
      this.brandsCache.clear();
      brandResults.forEach(brand => this.brandsCache.set(brand.id, brand.name));

      this.lastCacheUpdate = now;
    } catch (error) {
      console.warn('Error loading cache:', error.message);
    }
  }

  // Simple search method that avoids MySQL sort memory issues
  async searchSpareParts(searchParams) {
    try {
      const {
        seller_id,
        page = 1,
        limit = 50
      } = searchParams;

      const offset = (page - 1) * limit;
      
      // Use a simple query without ORDER BY to avoid sort memory issues
      const query = `
        SELECT 
          id,
          sku,
          name,
          description,
          category_id,
          brand_id,
          images,
          price,
          currency,
          seller_id,
          status,
          created_at,
          updated_at,
          quantity_available,
          quantity_reserved,
          reorder_point,
          max_stock_level,
          last_restocked_at,
          last_sold_at
        FROM ${this.tableName}
        WHERE seller_id = ?
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      const results = await executeQuery(query, [seller_id || '']);
      
      // Sort results in JavaScript by created_at DESC
      results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      // Get all unique category and brand IDs
      const categoryIds = [...new Set(results.map(part => part.category_id).filter(Boolean))];
      const brandIds = [...new Set(results.map(part => part.brand_id).filter(Boolean))];
      
      // Fetch all categories and brands in bulk
      let categories = {};
      let brands = {};
      
      if (categoryIds.length > 0) {
        const categoryQuery = `SELECT id, name FROM ${this.categoriesTable} WHERE id IN (${categoryIds.map(() => '?').join(',')})`;
        const categoryResults = await executeQuery(categoryQuery, categoryIds);
        categories = Object.fromEntries(categoryResults.map(cat => [cat.id, cat.name]));
      }
      
      if (brandIds.length > 0) {
        const brandQuery = `SELECT id, name FROM ${this.brandsTable} WHERE id IN (${brandIds.map(() => '?').join(',')})`;
        const brandResults = await executeQuery(brandQuery, brandIds);
        brands = Object.fromEntries(brandResults.map(brand => [brand.id, brand.name]));
      }
      
      // Enrich results with category and brand names
      const enrichedResults = results.map(part => ({
        ...part,
        category_name: categories[part.category_id] || null,
        brand_name: brands[part.brand_id] || null
      }));
      
      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM ${this.tableName} WHERE seller_id = ?`;
      const countResult = await executeQuery(countQuery, [seller_id || '']);
      const total = countResult[0].total;
      
      return {
        spare_parts: enrichedResults,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
          has_next: page * limit < total,
          has_prev: page > 1
        }
      };
      
    } catch (error) {
      console.error('Error in simple search:', error);
      throw error;
    }
  }

  // Get categories
  async getCategories() {
    try {
      const query = `SELECT * FROM ${this.categoriesTable} WHERE is_active = 1 ORDER BY sort_order, name`;
      return await executeQuery(query);
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  // Get brands
  async getBrands() {
    try {
      const query = `SELECT * FROM ${this.brandsTable} WHERE is_active = 1 ORDER BY name`;
      return await executeQuery(query);
    } catch (error) {
      console.error('Error getting brands:', error);
      return [];
    }
  }

  // Create a test spare part
  async createTestSparePart(sellerId) {
    try {
      const testPart = {
        id: 'test-part-' + Date.now(),
        sku: 'TEST-SKU-' + Date.now(),
        name: 'Test Spare Part',
        description: 'This is a test spare part',
        category_id: 'cat1',
        brand_id: 'brand1',
        price: 99.99,
        currency: 'USD',
        quantity_available: 10,
        quantity_reserved: 0,
        reorder_point: 5,
        max_stock_level: 50,
        seller_id: sellerId,
        status: 'active'
      };

      const query = `
        INSERT INTO ${this.tableName} (
          id, sku, name, description, category_id, brand_id, 
          price, currency, quantity_available, quantity_reserved,
          reorder_point, max_stock_level, seller_id, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        testPart.id, testPart.sku, testPart.name, testPart.description,
        testPart.category_id, testPart.brand_id, testPart.price, testPart.currency,
        testPart.quantity_available, testPart.quantity_reserved, testPart.reorder_point,
        testPart.max_stock_level, testPart.seller_id, testPart.status
      ];

      await executeQuery(query, params);
      console.log('✅ Test spare part created:', testPart.id);
      return testPart;
    } catch (error) {
      console.error('Error creating test spare part:', error);
      throw error;
    }
  }
}

module.exports = new SparePartsService();
