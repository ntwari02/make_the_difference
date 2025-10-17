const { executeQuery } = require('../../config/database');
const crypto = require('crypto');

class SparePartsService {
  constructor() {
    this.supportedPaymentMethods = [
      'stripe', 'paypal', 'apple_pay', 'google_pay', 
      'crypto', 'bnpl', 'financing', 'bank_transfer', 'mobile_money'
    ];
    this._sparePartsColumns = null;
  }

  // Advanced search with AI-powered compatibility
  async searchSpareParts(searchParams) {
    try {
      const {
        query,
        category_id,
        brand_id,
        vehicle_make,
        vehicle_model,
        vehicle_year,
        price_min,
        price_max,
        condition,
        in_stock_only = true,
        sort_by = 'relevance',
        sort_order = 'DESC',
        page = 1,
        limit = 20,
        features = [],
        compatibility_threshold = 0.8
      } = searchParams;

      let sql = `
        SELECT DISTINCT
          sp.*,
          spc.name as category_name,
          spb.name as brand_name,
          spb.logo_url as brand_logo,
          u.first_name as seller_name,
          u.rating as seller_rating,
          CASE 
            WHEN sp.discount_percentage > 0 AND (sp.discount_expires_at IS NULL OR sp.discount_expires_at > NOW()) 
            THEN sp.price * (1 - sp.discount_percentage / 100)
            ELSE sp.price
          END as final_price,
          CASE 
            WHEN sp.discount_percentage > 0 AND (sp.discount_expires_at IS NULL OR sp.discount_expires_at > NOW()) 
            THEN sp.price * (sp.discount_percentage / 100)
            ELSE 0
          END as discount_amount,
          spvc.compatibility_confidence,
          spi.quantity_available,
          (SELECT AVG(rating) FROM spare_parts_reviews WHERE spare_part_id = sp.id AND status = 'approved') as avg_rating,
          (SELECT COUNT(*) FROM spare_parts_reviews WHERE spare_part_id = sp.id AND status = 'approved') as review_count
        FROM spare_parts sp
        LEFT JOIN spare_parts_categories spc ON sp.category_id = spc.id
        LEFT JOIN spare_parts_brands spb ON sp.brand_id = spb.id
        LEFT JOIN users u ON sp.seller_id = u.id
        LEFT JOIN spare_parts_vehicle_compatibility spvc ON sp.id = spvc.spare_part_id
        LEFT JOIN spare_parts_inventory spi ON sp.id = spi.spare_part_id
        WHERE sp.status = 'active'
      `;

      const params = [];
      let paramCount = 0;

      // Text search
      if (query) {
        sql += ` AND (
          MATCH(sp.name, sp.description, sp.part_number, sp.oem_number) AGAINST(? IN NATURAL LANGUAGE MODE)
          OR sp.name LIKE ?
          OR sp.part_number LIKE ?
          OR sp.oem_number LIKE ?
        )`;
        const searchTerm = `%${query}%`;
        params.push(query, searchTerm, searchTerm, searchTerm);
      }

      // Category filter
      if (category_id) {
        sql += ` AND sp.category_id = ?`;
        params.push(category_id);
      }

      // Brand filter
      if (brand_id) {
        sql += ` AND sp.brand_id = ?`;
        params.push(brand_id);
      }

      // Vehicle compatibility
      if (vehicle_make && vehicle_model && vehicle_year) {
        sql += ` AND spvc.vehicle_make = ? AND spvc.vehicle_model = ? 
                 AND ? BETWEEN spvc.vehicle_year_from AND spvc.vehicle_year_to
                 AND spvc.compatibility_confidence >= ?`;
        params.push(vehicle_make, vehicle_model, vehicle_year, compatibility_threshold);
      }

      // Price range
      if (price_min) {
        sql += ` AND sp.price >= ?`;
        params.push(price_min);
      }
      if (price_max) {
        sql += ` AND sp.price <= ?`;
        params.push(price_max);
      }

      // Condition filter
      if (condition) {
        sql += ` AND sp.condition = ?`;
        params.push(condition);
      }

      // Stock availability
      if (in_stock_only) {
        sql += ` AND spi.quantity_available > 0`;
      }

      // Features filter
      if (features.length > 0) {
        features.forEach(feature => {
          sql += ` AND JSON_CONTAINS(sp.features, ?)`;
          params.push(`"${feature}"`);
        });
      }

      // Sorting
      switch (sort_by) {
        case 'price_low':
          sql += ` ORDER BY final_price ASC`;
          break;
        case 'price_high':
          sql += ` ORDER BY final_price DESC`;
          break;
        case 'rating':
          sql += ` ORDER BY avg_rating DESC, review_count DESC`;
          break;
        case 'newest':
          sql += ` ORDER BY sp.created_at DESC`;
          break;
        case 'popularity':
          sql += ` ORDER BY sp.sales_count DESC, sp.view_count DESC`;
          break;
        case 'compatibility':
          sql += ` ORDER BY spvc.compatibility_confidence DESC`;
          break;
        default: // relevance
          sql += ` ORDER BY 
            CASE WHEN ? IS NOT NULL THEN 
              MATCH(sp.name, sp.description, sp.part_number, sp.oem_number) AGAINST(? IN NATURAL LANGUAGE MODE) * 10
            ELSE 0 END +
            sp.rating * 2 +
            sp.sales_count * 0.5 +
            sp.view_count * 0.1 DESC`;
          params.push(query ?? null, (query ?? ''));
      }

      // Pagination
      const offset = (page - 1) * limit;
      sql += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const results = await executeQuery(sql, params);

      // Get total count for pagination
      let countSql = `
        SELECT COUNT(DISTINCT sp.id) as total
        FROM spare_parts sp
        LEFT JOIN spare_parts_vehicle_compatibility spvc ON sp.id = spvc.spare_part_id
        LEFT JOIN spare_parts_inventory spi ON sp.id = spi.spare_part_id
        WHERE sp.status = 'active'
      `;

      const countParams = params.slice(0, -2); // Remove limit and offset
      const countResult = await executeQuery(countSql, countParams);
      const total = countResult[0].total;

      return {
        parts: results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        filters_applied: searchParams
      };
    } catch (error) {
      console.error('Error searching spare parts:', error);
      throw new Error('Search failed: ' + error.message);
    }
  }

  // Get spare part details with enhanced information
  async getSparePartById(partId, userId = null) {
    try {
      const sql = `
        SELECT 
          sp.*,
          spc.name as category_name,
          spc.description as category_description,
          spb.name as brand_name,
          spb.logo_url as brand_logo,
          spb.website as brand_website,
          spb.country as brand_country,
          u.first_name as seller_name,
          u.last_name as seller_last_name,
          u.rating as seller_rating,
          u.phone as seller_phone,
          CASE 
            WHEN sp.discount_percentage > 0 AND (sp.discount_expires_at IS NULL OR sp.discount_expires_at > NOW()) 
            THEN sp.price * (1 - sp.discount_percentage / 100)
            ELSE sp.price
          END as final_price,
          CASE 
            WHEN sp.discount_percentage > 0 AND (sp.discount_expires_at IS NULL OR sp.discount_expires_at > NOW()) 
            THEN sp.price * (sp.discount_percentage / 100)
            ELSE 0
          END as discount_amount,
          spi.quantity_available,
          spi.quantity_reserved,
          spi.last_restocked_at,
          spi.last_sold_at,
          (SELECT AVG(rating) FROM spare_parts_reviews WHERE spare_part_id = sp.id AND status = 'approved') as avg_rating,
          (SELECT COUNT(*) FROM spare_parts_reviews WHERE spare_part_id = sp.id AND status = 'approved') as review_count,
          (SELECT COUNT(*) FROM spare_parts_wishlist WHERE spare_part_id = sp.id) as wishlist_count
        FROM spare_parts sp
        LEFT JOIN spare_parts_categories spc ON sp.category_id = spc.id
        LEFT JOIN spare_parts_brands spb ON sp.brand_id = spb.id
        LEFT JOIN users u ON sp.seller_id = u.id
        LEFT JOIN spare_parts_inventory spi ON sp.id = spi.spare_part_id
        WHERE sp.id = ? AND sp.status = 'active'
      `;

      const result = await executeQuery(sql, [partId]);
      if (!result[0]) {
        throw new Error('Spare part not found');
      }

      const part = result[0];

      // Get vehicle compatibility
      const compatibilitySql = `
        SELECT * FROM spare_parts_vehicle_compatibility 
        WHERE spare_part_id = ? 
        ORDER BY compatibility_confidence DESC
      `;
      const compatibility = await executeQuery(compatibilitySql, [partId]);

      // Get price comparison
      const priceComparisonSql = `
        SELECT * FROM spare_parts_price_comparison 
        WHERE spare_part_id = ? 
        ORDER BY total_cost ASC
      `;
      const priceComparison = await executeQuery(priceComparisonSql, [partId]);

      // Get related parts
      const relatedPartsSql = `
        SELECT 
          sp.id, sp.name, sp.price, sp.images, sp.rating,
          CASE 
            WHEN sp.discount_percentage > 0 AND (sp.discount_expires_at IS NULL OR sp.discount_expires_at > NOW()) 
            THEN sp.price * (1 - sp.discount_percentage / 100)
            ELSE sp.price
          END as final_price
        FROM spare_parts sp
        WHERE sp.category_id = ? AND sp.id != ? AND sp.status = 'active'
        ORDER BY sp.sales_count DESC, sp.rating DESC
        LIMIT 6
      `;
      const relatedParts = await executeQuery(relatedPartsSql, [part.category_id, partId]);

      // Get installation services
      const installationServicesSql = `
        SELECT 
          spis.*,
          u.first_name as provider_name,
          u.rating as provider_rating
        FROM spare_parts_installation_services spis
        LEFT JOIN users u ON spis.service_provider_id = u.id
        WHERE spis.spare_part_id = ? AND spis.is_active = true
        ORDER BY spis.base_price ASC
      `;
      const installationServices = await executeQuery(installationServicesSql, [partId]);

      // Check if user has this in wishlist
      let inWishlist = false;
      if (userId) {
        const wishlistSql = 'SELECT id FROM spare_parts_wishlist WHERE user_id = ? AND spare_part_id = ?';
        const wishlistResult = await executeQuery(wishlistSql, [userId, partId]);
        inWishlist = wishlistResult.length > 0;
      }

      // Track view
      if (userId) {
        await this.trackPartView(partId, userId, 'view');
      }

      return {
        ...part,
        compatibility,
        price_comparison: priceComparison,
        related_parts: relatedParts,
        installation_services: installationServices,
        in_wishlist: inWishlist,
        payment_methods: this.supportedPaymentMethods
      };
    } catch (error) {
      console.error('Error getting spare part details:', error);
      throw new Error('Failed to get spare part details: ' + error.message);
    }
  }

  // Advanced compatibility checker
  async checkVehicleCompatibility(partId, vehicleData) {
    try {
      const {
        make,
        model,
        year,
        engine_type,
        engine_size,
        fuel_type,
        transmission_type,
        body_type,
        trim_level
      } = vehicleData;

      const sql = `
        SELECT 
          spvc.*,
          sp.name as part_name,
          sp.part_number,
          sp.oem_number,
          CASE 
            WHEN spvc.vehicle_make = ? AND spvc.vehicle_model = ? 
                 AND ? BETWEEN spvc.vehicle_year_from AND spvc.vehicle_year_to
            THEN 1.0
            WHEN spvc.vehicle_make = ? AND spvc.vehicle_model = ?
            THEN 0.8
            WHEN spvc.vehicle_make = ?
            THEN 0.6
            ELSE spvc.compatibility_confidence
          END as compatibility_score
        FROM spare_parts_vehicle_compatibility spvc
        LEFT JOIN spare_parts sp ON spvc.spare_part_id = sp.id
        WHERE spvc.spare_part_id = ?
        ORDER BY compatibility_score DESC
      `;

      const params = [make, model, year, make, model, make, partId];
      const results = await executeQuery(sql, params);

      if (results.length === 0) {
        return {
          compatible: false,
          confidence: 0,
          message: 'No compatibility information available for this part'
        };
      }

      const bestMatch = results[0];
      const isCompatible = bestMatch.compatibility_score >= 0.8;

      return {
        compatible: isCompatible,
        confidence: bestMatch.compatibility_score,
        match_details: bestMatch,
        all_matches: results,
        recommendation: isCompatible ? 'This part is compatible with your vehicle' : 'This part may not be compatible with your vehicle'
      };
    } catch (error) {
      console.error('Error checking vehicle compatibility:', error);
      throw new Error('Compatibility check failed: ' + error.message);
    }
  }

  // Price comparison and competitive analysis
  async getPriceComparison(partId) {
    try {
      const sql = `
        SELECT 
          sppc.*,
          sp.name as part_name,
          sp.part_number,
          sp.oem_number,
          sp.price as our_price,
          CASE 
            WHEN sppc.total_cost < sp.price THEN 'lower'
            WHEN sppc.total_cost > sp.price THEN 'higher'
            ELSE 'same'
          END as price_position
        FROM spare_parts_price_comparison sppc
        LEFT JOIN spare_parts sp ON sppc.spare_part_id = sp.id
        WHERE sppc.spare_part_id = ?
        ORDER BY sppc.total_cost ASC
      `;

      const results = await executeQuery(sql, [partId]);
      
      if (results.length === 0) {
        return {
          message: 'No competitive pricing data available',
          competitors: [],
          price_position: 'unknown'
        };
      }

      const ourPrice = results[0].our_price;
      const lowestCompetitor = results[0];
      const highestCompetitor = results[results.length - 1];
      const averageCompetitorPrice = results.reduce((sum, r) => sum + r.total_cost, 0) / results.length;

      return {
        our_price: ourPrice,
        competitors: results,
        lowest_competitor: lowestCompetitor,
        highest_competitor: highestCompetitor,
        average_competitor_price: averageCompetitorPrice,
        price_position: ourPrice < averageCompetitorPrice ? 'competitive' : 'above_average',
        savings_vs_highest: highestCompetitor.total_cost - ourPrice,
        premium_vs_lowest: ourPrice - lowestCompetitor.total_cost
      };
    } catch (error) {
      console.error('Error getting price comparison:', error);
      throw new Error('Price comparison failed: ' + error.message);
    }
  }

  // Create spare part
  async createSparePart(partData, sellerId) {
    try {
      const partId = crypto.randomUUID();
      const toJsonOrNull = (value) => (value === undefined || value === null ? null : JSON.stringify(value));
      const toNullIfUndef = (value) => (value === undefined ? null : value);
      const toNullIfNaN = (value) => (value === undefined || value === null || Number.isNaN(value) ? null : value);
      const ensureSku = (sku, id) => (sku && String(sku).trim().length > 0 ? String(sku).trim() : `SKU-${id.slice(0, 8)}`);
      
      // Discover actual columns in DB (cache after first query)
      if (!this._sparePartsColumns) {
        const rows = await executeQuery('SHOW COLUMNS FROM spare_parts');
        this._sparePartsColumns = new Set(rows.map(r => r.Field));
      }

      // Prepare candidate column/value map
      const candidate = {
        id: partId,
        sku: ensureSku(partData.sku, partId),
        name: partData.name,
        description: toNullIfUndef(partData.description),
        short_description: toNullIfUndef(partData.short_description),
        category_id: partData.category_id,
        brand_id: partData.brand_id,
        part_number: toNullIfUndef(partData.part_number),
        oem_number: toNullIfUndef(partData.oem_number),
        price: partData.price,
        currency: (partData.currency || 'USD'),
        cost_price: toNullIfNaN(partData.cost_price),
        msrp: toNullIfNaN(partData.msrp),
        discount_percentage: toNullIfNaN(partData.discount_percentage),
        discount_expires_at: toNullIfUndef(partData.discount_expires_at),
        weight: toNullIfNaN(partData.weight),
        dimensions: toJsonOrNull(partData.dimensions),
        images: toJsonOrNull(Array.isArray(partData.images) ? partData.images : []),
        specifications: toJsonOrNull(partData.specifications),
        features: toJsonOrNull(Array.isArray(partData.features) ? partData.features : []),
        warranty_period: toNullIfNaN(partData.warranty_period),
        warranty_type: toNullIfUndef(partData.warranty_type || 'manufacturer'),
        condition: toNullIfUndef(partData.condition || 'new'),
        stock_quantity: toNullIfNaN(partData.stock_quantity ?? 0),
        min_stock_level: toNullIfNaN(partData.min_stock_level ?? 5),
        max_stock_level: toNullIfNaN(partData.max_stock_level ?? 1000),
        is_installable: partData.is_installable === false ? 0 : 1,
        installation_difficulty: toNullIfUndef(partData.installation_difficulty || 'medium'),
        estimated_installation_time: toNullIfNaN(partData.estimated_installation_time),
        installation_cost: toNullIfNaN(partData.installation_cost),
        shipping_weight: toNullIfNaN(partData.shipping_weight),
        shipping_dimensions: toJsonOrNull(partData.shipping_dimensions),
        seller_id: sellerId,
        status: 'pending'
      };

      // Keep only columns that exist in DB
      const columns = Object.keys(candidate).filter(k => this._sparePartsColumns.has(k));
      const placeholders = columns.map(() => '?').join(', ');
      const colList = columns.map(c => `\`${c}\``).join(', ');
      const values = columns.map(c => candidate[c]).map(v => (v === undefined ? null : v));

      const sql = `INSERT INTO spare_parts (${colList}) VALUES (${placeholders})`;
      await executeQuery(sql, values);

      // Add vehicle compatibility if provided
      if (partData.vehicle_compatibility && partData.vehicle_compatibility.length > 0) {
        for (const compatibility of partData.vehicle_compatibility) {
          await this.addVehicleCompatibility(partId, compatibility);
        }
      }

      // Initialize inventory
      await this.initializeInventory(partId, partData.stock_quantity || 0);

      return { id: partId, ...partData };
    } catch (error) {
      console.error('Error creating spare part:', error);
      throw new Error('Failed to create spare part: ' + error.message);
    }
  }

  // Add vehicle compatibility
  async addVehicleCompatibility(partId, compatibilityData) {
    try {
      const compatibilityId = crypto.randomUUID();
      
      // Validate and clean fuel_type - must be valid enum value or null
      const validFuelTypes = ['gasoline', 'diesel', 'hybrid', 'electric', 'lpg', 'cng'];
      let fuelType = compatibilityData.fuel_type;
      if (fuelType && fuelType.trim() && !validFuelTypes.includes(fuelType.trim())) {
        console.warn(`Invalid fuel_type: ${fuelType}, setting to null`);
        fuelType = null;
      } else if (!fuelType || fuelType.trim() === '') {
        fuelType = null;
      } else {
        fuelType = fuelType.trim();
      }

      // Validate and clean transmission_type - must be valid enum value or null
      const validTransmissionTypes = ['manual', 'automatic', 'cvt', 'semi_automatic'];
      let transmissionType = compatibilityData.transmission_type;
      if (transmissionType && transmissionType.trim() && !validTransmissionTypes.includes(transmissionType.trim())) {
        console.warn(`Invalid transmission_type: ${transmissionType}, setting to null`);
        transmissionType = null;
      } else if (!transmissionType || transmissionType.trim() === '') {
        transmissionType = null;
      } else {
        transmissionType = transmissionType.trim();
      }
      
      const sql = `
        INSERT INTO spare_parts_vehicle_compatibility (
          id, spare_part_id, vehicle_make, vehicle_model, vehicle_year_from,
          vehicle_year_to, engine_type, engine_size, fuel_type, transmission_type,
          body_type, trim_level, notes, compatibility_confidence
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        compatibilityId,
        partId,
        compatibilityData.vehicle_make,
        compatibilityData.vehicle_model,
        compatibilityData.vehicle_year_from,
        compatibilityData.vehicle_year_to,
        compatibilityData.engine_type || null,
        compatibilityData.engine_size || null,
        fuelType,
        transmissionType,
        compatibilityData.body_type || null,
        compatibilityData.trim_level || null,
        compatibilityData.notes || null,
        compatibilityData.compatibility_confidence || 1.0
      ];

      await executeQuery(sql, params);
      return { id: compatibilityId, ...compatibilityData };
    } catch (error) {
      console.error('Error adding vehicle compatibility:', error);
      throw new Error('Failed to add vehicle compatibility: ' + error.message);
    }
  }

  // Initialize inventory
  async initializeInventory(partId, initialQuantity) {
    try {
      const inventoryId = crypto.randomUUID();
      
      const sql = `
        INSERT INTO spare_parts_inventory (
          id, spare_part_id, warehouse_id, quantity_available,
          quantity_reserved, quantity_on_order, reorder_point, reorder_quantity
        ) VALUES (?, ?, ?, ?, 0, 0, 5, 10)
      `;

      // Use default warehouse (would be configured in system settings)
      const defaultWarehouseId = 'default-warehouse-id';
      
      await executeQuery(sql, [
        inventoryId,
        partId,
        defaultWarehouseId,
        initialQuantity
      ]);

      return { id: inventoryId, quantity_available: initialQuantity };
    } catch (error) {
      console.error('Error initializing inventory:', error);
      throw new Error('Failed to initialize inventory: ' + error.message);
    }
  }

  // Track part analytics
  async trackPartView(partId, userId, eventType, additionalData = {}) {
    try {
      const analyticsId = crypto.randomUUID();
      
      const sql = `
        INSERT INTO spare_parts_analytics (
          id, spare_part_id, event_type, user_id, session_id,
          referrer_url, user_agent, ip_address, country, city,
          device_type, browser, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      const params = [
        analyticsId,
        partId,
        eventType,
        userId,
        additionalData.session_id,
        additionalData.referrer_url,
        additionalData.user_agent,
        additionalData.ip_address,
        additionalData.country,
        additionalData.city,
        additionalData.device_type || 'desktop',
        additionalData.browser
      ];

      await executeQuery(sql, params);

      // Update view count
      if (eventType === 'view') {
        await executeQuery(
          'UPDATE spare_parts SET view_count = view_count + 1 WHERE id = ?',
          [partId]
        );
      }

      return { id: analyticsId };
    } catch (error) {
      console.error('Error tracking part analytics:', error);
      // Don't throw error for analytics failures
    }
  }

  // Get categories with hierarchy
  async getCategories(parentId = null, maxDepth = 3, currentDepth = 0) {
    try {
      // Prevent infinite recursion
      if (currentDepth >= maxDepth) {
        console.warn(`Categories recursion depth limit reached (${maxDepth})`);
        return [];
      }

      const sql = `
        SELECT 
          spc.*,
          (SELECT COUNT(*) FROM spare_parts WHERE category_id = spc.id AND status = 'active') as part_count,
          (SELECT COUNT(*) FROM spare_parts_categories WHERE parent_id = spc.id) as subcategory_count
        FROM spare_parts_categories spc
        WHERE spc.parent_id ${parentId ? '= ?' : 'IS NULL'} AND spc.is_active = true
        ORDER BY spc.sort_order, spc.name
        LIMIT 50
      `;

      const params = parentId ? [parentId] : [];
      
      // Add timeout protection
      const categories = await Promise.race([
        executeQuery(sql, params),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Categories query timeout')), 5000)
        )
      ]);

      // Get subcategories for each category (with depth limit)
      for (const category of categories) {
        try {
          category.subcategories = await this.getCategories(category.id, maxDepth, currentDepth + 1);
        } catch (error) {
          console.warn(`Failed to get subcategories for category ${category.id}:`, error.message);
          category.subcategories = []; // Fallback to empty array
        }
      }

      return categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      // Return empty array instead of throwing to prevent endpoint failure
      return [];
    }
  }

  // Get brands
  async getBrands() {
    try {
      const sql = `
        SELECT 
          spb.*,
          (SELECT COUNT(*) FROM spare_parts WHERE brand_id = spb.id AND status = 'active') as part_count
        FROM spare_parts_brands spb
        WHERE spb.is_active = true
        ORDER BY spb.name
        LIMIT 100
      `;

      // Add timeout protection
      const brands = await Promise.race([
        executeQuery(sql),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Brands query timeout')), 5000)
        )
      ]);
      
      return brands;
    } catch (error) {
      console.error('Error getting brands:', error);
      // Return empty array instead of throwing to prevent endpoint failure
      return [];
    }
  }

  // Create brand
  async createBrand(brandData) {
    const id = crypto.randomUUID();
    const name = (brandData?.name || '').trim();
    if (!name) {
      throw new Error('Brand name is required');
    }
    const sql = `
      INSERT INTO spare_parts_brands (id, name, description, logo_url, website, country, is_oem, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `;
    const params = [
      id,
      name,
      brandData?.description ?? null,
      brandData?.logo_url ?? null,
      brandData?.website ?? null,
      brandData?.country ?? null,
      brandData?.is_oem ? 1 : 0,
    ];
    await executeQuery(sql, params);
    return { id, name };
  }

  // Create category
  async createCategory(categoryData) {
    const id = crypto.randomUUID();
    const name = (categoryData?.name || '').trim();
    if (!name) {
      throw new Error('Category name is required');
    }
    const sql = `
      INSERT INTO spare_parts_categories (id, name, description, parent_id, icon, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `;
    const params = [
      id,
      name,
      categoryData?.description ?? null,
      categoryData?.parent_id ?? null,
      categoryData?.icon ?? null,
      categoryData?.sort_order ?? 0,
    ];
    await executeQuery(sql, params);
    return { id, name };
  }

  // Get seller's spare parts
  async getSellerSpareParts(sellerId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        search,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = options;

      let sql = `
        SELECT 
          sp.*,
          spc.name as category_name,
          spb.name as brand_name,
          spi.quantity_available,
          spi.quantity_reserved,
          (SELECT AVG(rating) FROM spare_parts_reviews WHERE spare_part_id = sp.id AND status = 'approved') as avg_rating,
          (SELECT COUNT(*) FROM spare_parts_reviews WHERE spare_part_id = sp.id AND status = 'approved') as review_count
        FROM spare_parts sp
        LEFT JOIN spare_parts_categories spc ON sp.category_id = spc.id
        LEFT JOIN spare_parts_brands spb ON sp.brand_id = spb.id
        LEFT JOIN spare_parts_inventory spi ON sp.id = spi.spare_part_id
        WHERE sp.seller_id = ?
      `;

      const params = [sellerId];

      // Add status filter
      if (status && status !== 'all') {
        sql += ` AND sp.status = ?`;
        params.push(status);
      }

      // Add search filter
      if (search) {
        sql += ` AND (
          sp.name LIKE ? OR 
          sp.description LIKE ? OR 
          sp.part_number LIKE ? OR 
          sp.oem_number LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      // Add sorting
      const validSortFields = ['created_at', 'updated_at', 'name', 'price', 'stock_quantity', 'status'];
      const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
      const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      
      sql += ` ORDER BY sp.${sortField} ${sortDirection}`;

      // Add pagination
      const offset = (page - 1) * limit;
      sql += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const results = await executeQuery(sql, params);

      // Get total count for pagination
      let countSql = `
        SELECT COUNT(*) as total
        FROM spare_parts sp
        WHERE sp.seller_id = ?
      `;
      const countParams = [sellerId];

      if (status && status !== 'all') {
        countSql += ` AND sp.status = ?`;
        countParams.push(status);
      }

      if (search) {
        countSql += ` AND (
          sp.name LIKE ? OR 
          sp.description LIKE ? OR 
          sp.part_number LIKE ? OR 
          sp.oem_number LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      const countResult = await executeQuery(countSql, countParams);
      const total = countResult[0].total;

      return {
        parts: results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting seller spare parts:', error);
      throw new Error('Failed to get seller spare parts: ' + error.message);
    }
  }

  // Update seller's spare part
  async updateSellerSparePart(partId, sellerId, partData) {
    try {
      // First verify the part belongs to the seller
      const verifySql = 'SELECT id FROM spare_parts WHERE id = ? AND seller_id = ?';
      const verifyResult = await executeQuery(verifySql, [partId, sellerId]);
      
      if (verifyResult.length === 0) {
        throw new Error('Spare part not found or unauthorized');
      }

      // Prepare update data
      const updateFields = [];
      const updateValues = [];

      const allowedFields = [
        'name', 'description', 'short_description', 'part_number', 'oem_number',
        'price', 'cost_price', 'msrp', 'discount_percentage', 'discount_expires_at',
        'weight', 'dimensions', 'images', 'specifications', 'features',
        'warranty_period', 'warranty_type', 'condition', 'stock_quantity',
        'min_stock_level', 'max_stock_level', 'is_installable', 'installation_difficulty',
        'estimated_installation_time', 'installation_cost', 'shipping_weight',
        'shipping_dimensions', 'is_featured'
      ];

      for (const field of allowedFields) {
        if (partData[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          
          if (field === 'dimensions' || field === 'images' || field === 'specifications' || field === 'features' || field === 'shipping_dimensions') {
            updateValues.push(JSON.stringify(partData[field]));
          } else {
            updateValues.push(partData[field]);
          }
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(partId);

      const sql = `UPDATE spare_parts SET ${updateFields.join(', ')} WHERE id = ?`;
      await executeQuery(sql, updateValues);

      // Update inventory if stock_quantity changed
      if (partData.stock_quantity !== undefined) {
        await executeQuery(
          'UPDATE spare_parts_inventory SET quantity_available = ? WHERE spare_part_id = ?',
          [partData.stock_quantity, partId]
        );
      }

      // Get updated part
      const updatedPart = await this.getSparePartById(partId);
      return updatedPart;
    } catch (error) {
      console.error('Error updating spare part:', error);
      throw new Error('Failed to update spare part: ' + error.message);
    }
  }

  // Delete seller's spare part
  async deleteSellerSparePart(partId, sellerId) {
    try {
      // First verify the part belongs to the seller
      const verifySql = 'SELECT id FROM spare_parts WHERE id = ? AND seller_id = ?';
      const verifyResult = await executeQuery(verifySql, [partId, sellerId]);
      
      if (verifyResult.length === 0) {
        throw new Error('Spare part not found or unauthorized');
      }

      // Soft delete by updating status to 'deleted'
      await executeQuery(
        'UPDATE spare_parts SET status = ?, updated_at = NOW() WHERE id = ?',
        ['deleted', partId]
      );

      return { id: partId, status: 'deleted' };
    } catch (error) {
      console.error('Error deleting spare part:', error);
      throw new Error('Failed to delete spare part: ' + error.message);
    }
  }

  // Get spare parts analytics
  async getSparePartsAnalytics(sellerId, dateRange = {}) {
    try {
      const { start_date, end_date } = dateRange;
      
      let sql = `
        SELECT 
          DATE(spa.created_at) as date,
          spa.event_type,
          COUNT(*) as event_count,
          COUNT(DISTINCT spa.user_id) as unique_users,
          COUNT(DISTINCT spa.spare_part_id) as unique_parts
        FROM spare_parts_analytics spa
        LEFT JOIN spare_parts sp ON spa.spare_part_id = sp.id
        WHERE sp.seller_id = ?
      `;

      const params = [sellerId];

      if (start_date) {
        sql += ` AND spa.created_at >= ?`;
        params.push(start_date);
      }

      if (end_date) {
        sql += ` AND spa.created_at <= ?`;
        params.push(end_date);
      }

      sql += ` GROUP BY DATE(spa.created_at), spa.event_type ORDER BY date DESC`;

      const analytics = await executeQuery(sql, params);

      // Get top performing parts
      const topPartsSql = `
        SELECT 
          sp.id, sp.name, sp.price, sp.view_count, sp.sales_count,
          COUNT(spa.id) as total_events,
          COUNT(CASE WHEN spa.event_type = 'view' THEN 1 END) as views,
          COUNT(CASE WHEN spa.event_type = 'add_to_cart' THEN 1 END) as add_to_cart,
          COUNT(CASE WHEN spa.event_type = 'purchase' THEN 1 END) as purchases
        FROM spare_parts sp
        LEFT JOIN spare_parts_analytics spa ON sp.id = spa.spare_part_id
        WHERE sp.seller_id = ?
        GROUP BY sp.id
        ORDER BY total_events DESC
        LIMIT 10
      `;

      const topParts = await executeQuery(topPartsSql, [sellerId]);

      return {
        analytics,
        top_parts: topParts,
        date_range: dateRange
      };
    } catch (error) {
      console.error('Error getting spare parts analytics:', error);
      throw new Error('Failed to get analytics: ' + error.message);
    }
  }
}

module.exports = new SparePartsService();
