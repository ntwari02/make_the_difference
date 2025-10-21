const { executeQuery } = require('../../config/database');

class SparePartsRecommendationService {
  constructor() {
    this.sparePartsTable = 'spare_parts';
    this.inventoryTable = 'spare_parts_inventory';
    this.categoriesTable = 'spare_parts_categories';
    this.brandsTable = 'spare_parts_brands';
    this.compatibilityTable = 'spare_parts_vehicle_compatibility';
    this.bundlesTable = 'spare_parts_bundles';
    this.bundleItemsTable = 'spare_parts_bundle_items';
    this.userBehaviorTable = 'user_behavior_tracking';
    this.userPreferencesTable = 'user_preferences';
    this.transactionsTable = 'transactions';
    this.priceComparisonTable = 'spare_parts_price_comparison';
  }

  // ==================== USER-BASED RECOMMENDATIONS ====================

  async getUserRecommendations(userId, options = {}) {
    try {
      const {
        limit = 10,
        category_id,
        brand_id,
        vehicle_make,
        vehicle_model,
        exclude_purchased = true,
        algorithm = 'hybrid'
      } = options;

      let recommendations = [];

      switch (algorithm) {
        case 'collaborative':
          recommendations = await this.getCollaborativeRecommendations(userId, limit);
          break;
        case 'content_based':
          recommendations = await this.getContentBasedRecommendations(userId, limit);
          break;
        case 'hybrid':
          recommendations = await this.getHybridRecommendations(userId, limit);
          break;
        case 'trending':
          recommendations = await this.getTrendingRecommendations(userId, limit);
          break;
        case 'price_based':
          recommendations = await this.getPriceBasedRecommendations(userId, limit);
          break;
        default:
          recommendations = await this.getHybridRecommendations(userId, limit);
      }

      // Apply filters
      if (category_id || brand_id || vehicle_make || vehicle_model) {
        recommendations = await this.filterRecommendations(recommendations, {
          category_id,
          brand_id,
          vehicle_make,
          vehicle_model
        });
      }

      // Exclude purchased items
      if (exclude_purchased) {
        recommendations = await this.excludePurchasedItems(userId, recommendations);
      }

      return recommendations.slice(0, limit);
    } catch (error) {
      console.error('Error getting user recommendations:', error);
      throw new Error(`Failed to get user recommendations: ${error.message}`);
    }
  }

  async getCollaborativeRecommendations(userId, limit) {
    try {
      // Find users with similar behavior
      const similarUsersQuery = `
        SELECT 
          ubt2.user_id,
          COUNT(*) as common_interactions,
          AVG(ubt2.created_at) as last_interaction
        FROM ${this.userBehaviorTable} ubt1
        JOIN ${this.userBehaviorTable} ubt2 ON ubt1.entity_id = ubt2.entity_id 
          AND ubt1.action_type = ubt2.action_type
          AND ubt1.user_id != ubt2.user_id
        WHERE ubt1.user_id = ? 
          AND ubt1.entity_type = 'spare_part'
          AND ubt2.entity_type = 'spare_part'
        GROUP BY ubt2.user_id
        HAVING common_interactions >= 2
        ORDER BY common_interactions DESC, last_interaction DESC
        LIMIT 10
      `;

      const similarUsers = await executeQuery(similarUsersQuery, [userId]);
      
      if (similarUsers.length === 0) {
        return await this.getFallbackRecommendations(limit);
      }

      const similarUserIds = similarUsers.map(user => user.user_id);

      // Get parts liked by similar users
      const recommendationsQuery = `
        SELECT DISTINCT
          sp.*,
          c.name as category_name,
          b.name as brand_name,
          COUNT(ubt.id) as interaction_count,
          AVG(ubt.created_at) as last_interaction,
          si.quantity_available
        FROM ${this.sparePartsTable} sp
        JOIN ${this.userBehaviorTable} ubt ON sp.id = ubt.entity_id
        JOIN ${this.categoriesTable} c ON sp.category_id = c.id
        JOIN ${this.brandsTable} b ON sp.brand_id = b.id
        LEFT JOIN ${this.inventoryTable} si ON sp.id = si.spare_part_id
        WHERE ubt.user_id IN (${similarUserIds.map(() => '?').join(',')})
          AND ubt.entity_type = 'spare_part'
          AND ubt.action_type IN ('view', 'click', 'favorite')
          AND sp.status = 'active'
          AND sp.id NOT IN (
            SELECT entity_id 
            FROM ${this.userBehaviorTable} 
            WHERE user_id = ? AND entity_type = 'spare_part'
          )
        GROUP BY sp.id, sp.name, sp.price, c.name, b.name, si.quantity_available
        ORDER BY interaction_count DESC, last_interaction DESC
        LIMIT ?
      `;

      const recommendations = await executeQuery(recommendationsQuery, [...similarUserIds, userId, limit * 2]);
      return recommendations;
    } catch (error) {
      console.error('Error getting collaborative recommendations:', error);
      return await this.getFallbackRecommendations(limit);
    }
  }

  async getContentBasedRecommendations(userId, limit) {
    try {
      // Get user preferences
      const preferencesQuery = `
        SELECT * FROM ${this.userPreferencesTable} WHERE user_id = ?
      `;
      const preferences = await executeQuery(preferencesQuery, [userId]);

      if (preferences.length === 0) {
        return await this.getFallbackRecommendations(limit);
      }

      const userPrefs = preferences[0];
      const conditions = [];
      const queryParams = [];

      // Build conditions based on user preferences
      if (userPrefs.preferred_brands) {
        const brands = JSON.parse(userPrefs.preferred_brands);
        if (brands.length > 0) {
          conditions.push(`b.name IN (${brands.map(() => '?').join(',')})`);
          queryParams.push(...brands);
        }
      }

      if (userPrefs.preferred_price_range) {
        const priceRange = JSON.parse(userPrefs.preferred_price_range);
        if (priceRange.min !== undefined) {
          conditions.push('sp.price >= ?');
          queryParams.push(priceRange.min);
        }
        if (priceRange.max !== undefined) {
          conditions.push('sp.price <= ?');
          queryParams.push(priceRange.max);
        }
      }

      if (userPrefs.preferred_years) {
        const years = JSON.parse(userPrefs.preferred_years);
        if (years.length > 0) {
          conditions.push(`sp.id IN (
            SELECT DISTINCT spare_part_id 
            FROM ${this.compatibilityTable} 
            WHERE vehicle_year_from <= ? AND vehicle_year_to >= ?
          )`);
          queryParams.push(Math.max(...years), Math.min(...years));
        }
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const recommendationsQuery = `
        SELECT DISTINCT
          sp.*,
          c.name as category_name,
          b.name as brand_name,
          si.quantity_available,
          CASE 
            WHEN b.name IN (${userPrefs.preferred_brands ? JSON.parse(userPrefs.preferred_brands).map(() => '?').join(',') : "'"})
            THEN 1 ELSE 0 
          END as brand_match_score
        FROM ${this.sparePartsTable} sp
        JOIN ${this.categoriesTable} c ON sp.category_id = c.id
        JOIN ${this.brandsTable} b ON sp.brand_id = b.id
        LEFT JOIN ${this.inventoryTable} si ON sp.id = si.spare_part_id
        ${whereClause}
        AND sp.status = 'active'
        AND sp.id NOT IN (
          SELECT entity_id 
          FROM ${this.userBehaviorTable} 
          WHERE user_id = ? AND entity_type = 'spare_part' AND action_type = 'purchase'
        )
        ORDER BY brand_match_score DESC, sp.price ASC
        LIMIT ?
      `;

      const recommendations = await executeQuery(recommendationsQuery, [
        ...queryParams,
        ...(userPrefs.preferred_brands ? JSON.parse(userPrefs.preferred_brands) : []),
        userId,
        limit * 2
      ]);

      return recommendations;
    } catch (error) {
      console.error('Error getting content-based recommendations:', error);
      return await this.getFallbackRecommendations(limit);
    }
  }

  async getHybridRecommendations(userId, limit) {
    try {
      // Combine collaborative and content-based recommendations
      const collaborativeRecs = await this.getCollaborativeRecommendations(userId, Math.ceil(limit / 2));
      const contentBasedRecs = await this.getContentBasedRecommendations(userId, Math.ceil(limit / 2));

      // Merge and deduplicate
      const allRecs = [...collaborativeRecs, ...contentBasedRecs];
      const uniqueRecs = allRecs.filter((rec, index, self) => 
        index === self.findIndex(r => r.id === rec.id)
      );

      // Score and rank
      const scoredRecs = uniqueRecs.map(rec => ({
        ...rec,
        hybrid_score: this.calculateHybridScore(rec, userId)
      }));

      return scoredRecs
        .sort((a, b) => b.hybrid_score - a.hybrid_score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting hybrid recommendations:', error);
      return await this.getFallbackRecommendations(limit);
    }
  }

  async getTrendingRecommendations(userId, limit) {
    try {
      const trendingQuery = `
        SELECT 
          sp.*,
          c.name as category_name,
          b.name as brand_name,
          COUNT(ubt.id) as view_count,
          COUNT(DISTINCT ubt.user_id) as unique_viewers,
          AVG(ubt.created_at) as last_viewed,
          si.quantity_available
        FROM ${this.sparePartsTable} sp
        JOIN ${this.userBehaviorTable} ubt ON sp.id = ubt.entity_id
        JOIN ${this.categoriesTable} c ON sp.category_id = c.id
        JOIN ${this.brandsTable} b ON sp.brand_id = b.id
        LEFT JOIN ${this.inventoryTable} si ON sp.id = si.spare_part_id
        WHERE ubt.entity_type = 'spare_part'
          AND ubt.action_type = 'view'
          AND ubt.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          AND sp.status = 'active'
        GROUP BY sp.id, sp.name, sp.price, c.name, b.name, si.quantity_available
        HAVING view_count >= 5
        ORDER BY view_count DESC, unique_viewers DESC, last_viewed DESC
        LIMIT ?
      `;

      const trending = await executeQuery(trendingQuery, [limit * 2]);
      return trending;
    } catch (error) {
      console.error('Error getting trending recommendations:', error);
      return await this.getFallbackRecommendations(limit);
    }
  }

  async getPriceBasedRecommendations(userId, limit) {
    try {
      // Get user's price preferences from past purchases
      const pricePrefsQuery = `
        SELECT 
          AVG(sp.price) as avg_price,
          MIN(sp.price) as min_price,
          MAX(sp.price) as max_price,
          STDDEV(sp.price) as price_stddev
        FROM ${this.transactionsTable} t
        JOIN ${this.sparePartsTable} sp ON t.metadata->>'spare_part_id' = sp.id
        WHERE t.user_id = ? 
          AND t.type = 'spare_part_purchase'
          AND t.status = 'completed'
      `;

      const pricePrefs = await executeQuery(pricePrefsQuery, [userId]);

      if (pricePrefs.length === 0 || !pricePrefs[0].avg_price) {
        return await this.getFallbackRecommendations(limit);
      }

      const { avg_price, min_price, max_price, price_stddev } = pricePrefs[0];
      const priceRange = {
        min: Math.max(0, avg_price - price_stddev),
        max: avg_price + price_stddev
      };

      const recommendationsQuery = `
        SELECT 
          sp.*,
          c.name as category_name,
          b.name as brand_name,
          si.quantity_available,
          ABS(sp.price - ?) as price_distance
        FROM ${this.sparePartsTable} sp
        JOIN ${this.categoriesTable} c ON sp.category_id = c.id
        JOIN ${this.brandsTable} b ON sp.brand_id = b.id
        LEFT JOIN ${this.inventoryTable} si ON sp.id = si.spare_part_id
        WHERE sp.price BETWEEN ? AND ?
          AND sp.status = 'active'
          AND sp.id NOT IN (
            SELECT entity_id 
            FROM ${this.userBehaviorTable} 
            WHERE user_id = ? AND entity_type = 'spare_part' AND action_type = 'purchase'
          )
        ORDER BY price_distance ASC, sp.price ASC
        LIMIT ?
      `;

      const recommendations = await executeQuery(recommendationsQuery, [
        avg_price,
        priceRange.min,
        priceRange.max,
        userId,
        limit * 2
      ]);

      return recommendations;
    } catch (error) {
      console.error('Error getting price-based recommendations:', error);
      return await this.getFallbackRecommendations(limit);
    }
  }

  // ==================== ITEM-BASED RECOMMENDATIONS ====================

  async getSimilarParts(sparePartId, limit = 5) {
    try {
      // Get the target part details
      const partQuery = `
        SELECT 
          sp.*,
          c.name as category_name,
          b.name as brand_name
        FROM ${this.sparePartsTable} sp
        JOIN ${this.categoriesTable} c ON sp.category_id = c.id
        JOIN ${this.brandsTable} b ON sp.brand_id = b.id
        WHERE sp.id = ?
      `;

      const targetPart = await executeQuery(partQuery, [sparePartId]);
      if (targetPart.length === 0) {
        throw new Error('Spare part not found');
      }

      const part = targetPart[0];

      // Find similar parts based on category, brand, and price range
      const similarQuery = `
        SELECT 
          sp.*,
          c.name as category_name,
          b.name as brand_name,
          si.quantity_available,
          (
            CASE WHEN sp.category_id = ? THEN 3 ELSE 0 END +
            CASE WHEN sp.brand_id = ? THEN 2 ELSE 0 END +
            CASE WHEN ABS(sp.price - ?) <= ? * 0.2 THEN 1 ELSE 0 END
          ) as similarity_score
        FROM ${this.sparePartsTable} sp
        JOIN ${this.categoriesTable} c ON sp.category_id = c.id
        JOIN ${this.brandsTable} b ON sp.brand_id = b.id
        LEFT JOIN ${this.inventoryTable} si ON sp.id = si.spare_part_id
        WHERE sp.id != ?
          AND sp.status = 'active'
        HAVING similarity_score > 0
        ORDER BY similarity_score DESC, sp.price ASC
        LIMIT ?
      `;

      const similarParts = await executeQuery(similarQuery, [
        part.category_id,
        part.brand_id,
        part.price,
        part.price,
        sparePartId,
        limit
      ]);

      return similarParts;
    } catch (error) {
      console.error('Error getting similar parts:', error);
      throw new Error(`Failed to get similar parts: ${error.message}`);
    }
  }

  async getComplementaryParts(sparePartId, limit = 5) {
    try {
      // Get parts that are often purchased together
      const complementaryQuery = `
        SELECT 
          sp.*,
          c.name as category_name,
          b.name as brand_name,
          si.quantity_available,
          COUNT(*) as co_purchase_count
        FROM ${this.sparePartsTable} sp
        JOIN ${this.categoriesTable} c ON sp.category_id = c.id
        JOIN ${this.brandsTable} b ON sp.brand_id = b.id
        LEFT JOIN ${this.inventoryTable} si ON sp.id = si.spare_part_id
        WHERE sp.id != ?
          AND sp.status = 'active'
          AND sp.id IN (
            SELECT DISTINCT entity_id 
            FROM ${this.userBehaviorTable} 
            WHERE user_id IN (
              SELECT DISTINCT user_id 
              FROM ${this.userBehaviorTable} 
              WHERE entity_id = ? AND action_type = 'purchase'
            )
            AND entity_type = 'spare_part'
            AND action_type = 'purchase'
          )
        GROUP BY sp.id, sp.name, sp.price, c.name, b.name, si.quantity_available
        ORDER BY co_purchase_count DESC, sp.price ASC
        LIMIT ?
      `;

      const complementaryParts = await executeQuery(complementaryQuery, [
        sparePartId,
        sparePartId,
        limit
      ]);

      return complementaryParts;
    } catch (error) {
      console.error('Error getting complementary parts:', error);
      return [];
    }
  }

  // ==================== VEHICLE-BASED RECOMMENDATIONS ====================

  async getVehicleRecommendations(vehicleData, limit = 10) {
    try {
      const {
        vehicle_make,
        vehicle_model,
        vehicle_year,
        engine_type,
        fuel_type,
        transmission_type
      } = vehicleData;

      const conditions = [];
      const queryParams = [];

      conditions.push('vc.vehicle_make = ?');
      queryParams.push(vehicle_make);

      if (vehicle_model) {
        conditions.push('vc.vehicle_model = ?');
        queryParams.push(vehicle_model);
      }

      if (vehicle_year) {
        conditions.push('vc.vehicle_year_from <= ? AND vc.vehicle_year_to >= ?');
        queryParams.push(vehicle_year, vehicle_year);
      }

      if (engine_type) {
        conditions.push('vc.engine_type = ?');
        queryParams.push(engine_type);
      }

      if (fuel_type) {
        conditions.push('vc.fuel_type = ?');
        queryParams.push(fuel_type);
      }

      if (transmission_type) {
        conditions.push('vc.transmission_type = ?');
        queryParams.push(transmission_type);
      }

      const recommendationsQuery = `
        SELECT DISTINCT
          sp.*,
          c.name as category_name,
          b.name as brand_name,
          vc.compatibility_confidence,
          si.quantity_available,
          COUNT(ubt.id) as popularity_score
        FROM ${this.sparePartsTable} sp
        JOIN ${this.compatibilityTable} vc ON sp.id = vc.spare_part_id
        JOIN ${this.categoriesTable} c ON sp.category_id = c.id
        JOIN ${this.brandsTable} b ON sp.brand_id = b.id
        LEFT JOIN ${this.inventoryTable} si ON sp.id = si.spare_part_id
        LEFT JOIN ${this.userBehaviorTable} ubt ON sp.id = ubt.entity_id
        WHERE ${conditions.join(' AND ')}
          AND sp.status = 'active'
        GROUP BY sp.id, sp.name, sp.price, c.name, b.name, vc.compatibility_confidence, si.quantity_available
        ORDER BY vc.compatibility_confidence DESC, popularity_score DESC, sp.price ASC
        LIMIT ?
      `;

      const recommendations = await executeQuery(recommendationsQuery, [
        ...queryParams,
        limit
      ]);

      return recommendations;
    } catch (error) {
      console.error('Error getting vehicle recommendations:', error);
      throw new Error(`Failed to get vehicle recommendations: ${error.message}`);
    }
  }

  // ==================== BUNDLE RECOMMENDATIONS ====================

  async getBundleRecommendations(userId, vehicleData = null, limit = 5) {
    try {
      let whereConditions = ['b.status = "active"'];
      let queryParams = [];

      if (vehicleData) {
        const { vehicle_make, vehicle_model, vehicle_year } = vehicleData;
        
        if (vehicle_make) {
          whereConditions.push('(b.target_vehicle_make = ? OR b.target_vehicle_make IS NULL)');
          queryParams.push(vehicle_make);
        }

        if (vehicle_model) {
          whereConditions.push('(b.target_vehicle_model = ? OR b.target_vehicle_model IS NULL)');
          queryParams.push(vehicle_model);
        }

        if (vehicle_year) {
          whereConditions.push('(b.target_vehicle_year_from <= ? AND b.target_vehicle_year_to >= ? OR b.target_vehicle_year_from IS NULL)');
          queryParams.push(vehicle_year, vehicle_year);
        }
      }

      const bundlesQuery = `
        SELECT 
          b.*,
          s.business_name as seller_name,
          s.rating as seller_rating,
          COUNT(bi.id) as items_count,
          AVG(bi.unit_price) as avg_item_price
        FROM ${this.bundlesTable} b
        JOIN sellers s ON b.seller_id = s.id
        LEFT JOIN ${this.bundleItemsTable} bi ON b.id = bi.bundle_id
        WHERE ${whereConditions.join(' AND ')}
        GROUP BY b.id, b.name, b.total_price, b.bundle_discount, s.business_name, s.rating
        ORDER BY b.bundle_discount DESC, b.total_price ASC
        LIMIT ?
      `;

      const bundles = await executeQuery(bundlesQuery, [...queryParams, limit]);
      return bundles;
    } catch (error) {
      console.error('Error getting bundle recommendations:', error);
      throw new Error(`Failed to get bundle recommendations: ${error.message}`);
    }
  }

  // ==================== UTILITY METHODS ====================

  async getFallbackRecommendations(limit) {
    try {
      const fallbackQuery = `
        SELECT 
          sp.*,
          c.name as category_name,
          b.name as brand_name,
          si.quantity_available,
          COUNT(ubt.id) as popularity_score
        FROM ${this.sparePartsTable} sp
        JOIN ${this.categoriesTable} c ON sp.category_id = c.id
        JOIN ${this.brandsTable} b ON sp.brand_id = b.id
        LEFT JOIN ${this.inventoryTable} si ON sp.id = si.spare_part_id
        LEFT JOIN ${this.userBehaviorTable} ubt ON sp.id = ubt.entity_id
        WHERE sp.status = 'active'
        GROUP BY sp.id, sp.name, sp.price, c.name, b.name, si.quantity_available
        ORDER BY popularity_score DESC, sp.created_at DESC
        LIMIT ?
      `;

      return await executeQuery(fallbackQuery, [limit]);
    } catch (error) {
      console.error('Error getting fallback recommendations:', error);
      return [];
    }
  }

  async filterRecommendations(recommendations, filters) {
    try {
      const { category_id, brand_id, vehicle_make, vehicle_model } = filters;

      return recommendations.filter(rec => {
        if (category_id && rec.category_id !== category_id) return false;
        if (brand_id && rec.brand_id !== brand_id) return false;
        // Additional vehicle-based filtering would be implemented here
        return true;
      });
    } catch (error) {
      console.error('Error filtering recommendations:', error);
      return recommendations;
    }
  }

  async excludePurchasedItems(userId, recommendations) {
    try {
      const purchasedQuery = `
        SELECT DISTINCT entity_id 
        FROM ${this.userBehaviorTable} 
        WHERE user_id = ? AND entity_type = 'spare_part' AND action_type = 'purchase'
      `;

      const purchasedItems = await executeQuery(purchasedQuery, [userId]);
      const purchasedIds = purchasedItems.map(item => item.entity_id);

      return recommendations.filter(rec => !purchasedIds.includes(rec.id));
    } catch (error) {
      console.error('Error excluding purchased items:', error);
      return recommendations;
    }
  }

  calculateHybridScore(recommendation, userId) {
    // Simple scoring algorithm - would be more sophisticated in production
    let score = 0;

    // Base score from interaction count
    if (recommendation.interaction_count) {
      score += Math.log(recommendation.interaction_count + 1) * 10;
    }

    // Brand match bonus
    if (recommendation.brand_match_score) {
      score += recommendation.brand_match_score * 5;
    }

    // Price competitiveness bonus
    if (recommendation.price_distance !== undefined) {
      score += Math.max(0, 10 - recommendation.price_distance / 10);
    }

    // Availability bonus
    if (recommendation.quantity_available > 0) {
      score += 5;
    }

    return score;
  }

  async trackRecommendationClick(userId, sparePartId, recommendationType) {
    try {
      const insertQuery = `
        INSERT INTO ${this.userBehaviorTable} 
        (id, user_id, entity_type, entity_id, action_type, action_data, created_at)
        VALUES (?, ?, 'spare_part', ?, 'recommendation_click', ?, NOW())
      `;

      const actionData = JSON.stringify({
        recommendation_type: recommendationType,
        timestamp: new Date().toISOString()
      });

      await executeQuery(insertQuery, [
        require('uuid').v4(),
        userId,
        sparePartId,
        actionData
      ]);

      return { success: true };
    } catch (error) {
      console.error('Error tracking recommendation click:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SparePartsRecommendationService();
