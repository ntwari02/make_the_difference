const { executeQuery } = require('../../config/database');

class RecommendationEngine {
  constructor() {
    this.similarityThreshold = 0.7;
    this.maxRecommendations = 10;
  }

  // Collaborative Filtering: Find users with similar preferences
  async getCollaborativeRecommendations(userId, limit = 10) {
    try {
      const query = `
        WITH user_similarity AS (
          SELECT 
            f2.user_id as similar_user_id,
            COUNT(*) as common_favorites,
            COUNT(*) / SQRT(
              (SELECT COUNT(*) FROM car_favorites f1 WHERE f1.user_id = ?) * 
              (SELECT COUNT(*) FROM car_favorites f2 WHERE f2.user_id = f2.user_id)
            ) as similarity_score
          FROM car_favorites f1
          JOIN car_favorites f2 ON f1.car_id = f2.car_id
          WHERE f1.user_id = ? AND f2.user_id != ?
          GROUP BY f2.user_id
          HAVING similarity_score > ?
        ),
        recommended_cars AS (
          SELECT DISTINCT
            c.id,
            c.title,
            c.brand,
            c.model,
            c.year,
            c.price,
            c.images,
            c.location,
            SUM(us.similarity_score) as recommendation_score
          FROM user_similarity us
          JOIN car_favorites cf ON us.similar_user_id = cf.user_id
          JOIN cars c ON cf.car_id = c.id
          LEFT JOIN car_favorites user_favorites ON c.id = user_favorites.car_id AND user_favorites.user_id = ?
          WHERE user_favorites.car_id IS NULL
            AND c.status = 'active'
          GROUP BY c.id, c.title, c.brand, c.model, c.year, c.price, c.images, c.location
          ORDER BY recommendation_score DESC
          LIMIT ?
        )
        SELECT * FROM recommended_cars
      `;

      const results = await executeQuery(query, [
        userId, userId, userId, this.similarityThreshold, userId, limit
      ]);

      return results.map(car => ({
        ...car,
        recommendation_type: 'collaborative',
        score: car.recommendation_score
      }));
    } catch (error) {
      console.error('Error in collaborative recommendations:', error);
      return [];
    }
  }

  // Content-Based Filtering: Find cars with similar features
  async getContentBasedRecommendations(carId, limit = 10) {
    try {
      const query = `
        WITH target_car AS (
          SELECT * FROM cars WHERE id = ?
        ),
        similar_cars AS (
          SELECT 
            c.id,
            c.title,
            c.brand,
            c.model,
            c.year,
            c.price,
            c.images,
            c.location,
            c.fuel_type,
            c.transmission,
            c.body_type,
            c.car_condition,
            (
              CASE WHEN c.brand = tc.brand THEN 0.3 ELSE 0 END +
              CASE WHEN c.model = tc.model THEN 0.2 ELSE 0 END +
              CASE WHEN ABS(c.year - tc.year) <= 2 THEN 0.2 ELSE 0 END +
              CASE WHEN c.fuel_type = tc.fuel_type THEN 0.1 ELSE 0 END +
              CASE WHEN c.transmission = tc.transmission THEN 0.1 ELSE 0 END +
              CASE WHEN c.body_type = tc.body_type THEN 0.1 ELSE 0 END +
              CASE WHEN ABS(c.price - tc.price) / tc.price <= 0.2 THEN 0.1 ELSE 0 END
            ) as similarity_score
          FROM cars c
          CROSS JOIN target_car tc
          WHERE c.id != ? 
            AND c.status = 'active'
            AND (
              CASE WHEN c.brand = tc.brand THEN 0.3 ELSE 0 END +
              CASE WHEN c.model = tc.model THEN 0.2 ELSE 0 END +
              CASE WHEN ABS(c.year - tc.year) <= 2 THEN 0.2 ELSE 0 END +
              CASE WHEN c.fuel_type = tc.fuel_type THEN 0.1 ELSE 0 END +
              CASE WHEN c.transmission = tc.transmission THEN 0.1 ELSE 0 END +
              CASE WHEN c.body_type = tc.body_type THEN 0.1 ELSE 0 END +
              CASE WHEN ABS(c.price - tc.price) / tc.price <= 0.2 THEN 0.1 ELSE 0 END
            ) > ?
        )
        SELECT * FROM similar_cars
        ORDER BY similarity_score DESC
        LIMIT ?
      `;

      const results = await executeQuery(query, [
        carId, carId, this.similarityThreshold, limit
      ]);

      return results.map(car => ({
        ...car,
        recommendation_type: 'content_based',
        score: car.similarity_score
      }));
    } catch (error) {
      console.error('Error in content-based recommendations:', error);
      return [];
    }
  }

  // Hybrid Recommendations: Combine collaborative and content-based
  async getHybridRecommendations(userId, carId = null, limit = 10) {
    try {
      const [collaborative, contentBased] = await Promise.all([
        this.getCollaborativeRecommendations(userId, limit),
        carId ? this.getContentBasedRecommendations(carId, limit) : []
      ]);

      // Combine and deduplicate recommendations
      const combined = new Map();
      
      // Add collaborative recommendations with weight 0.6
      collaborative.forEach(car => {
        const key = car.id;
        if (combined.has(key)) {
          combined.get(key).score += car.score * 0.6;
        } else {
          combined.set(key, { ...car, score: car.score * 0.6 });
        }
      });

      // Add content-based recommendations with weight 0.4
      contentBased.forEach(car => {
        const key = car.id;
        if (combined.has(key)) {
          combined.get(key).score += car.score * 0.4;
        } else {
          combined.set(key, { ...car, score: car.score * 0.4 });
        }
      });

      // Sort by combined score and return top recommendations
      return Array.from(combined.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(car => ({
          ...car,
          recommendation_type: 'hybrid'
        }));
    } catch (error) {
      console.error('Error in hybrid recommendations:', error);
      return [];
    }
  }

  // Get recommendations for a specific car
  async getSimilarCars(carId, userId = null, limit = 10) {
    try {
      if (userId) {
        return await this.getHybridRecommendations(userId, carId, limit);
      } else {
        return await this.getContentBasedRecommendations(carId, limit);
      }
    } catch (error) {
      console.error('Error getting similar cars:', error);
      return [];
    }
  }

  // Get personalized recommendations for a user
  async getUserRecommendations(userId, limit = 20) {
    try {
      return await this.getHybridRecommendations(userId, null, limit);
    } catch (error) {
      console.error('Error getting user recommendations:', error);
      return [];
    }
  }

  // Get trending cars based on recent activity
  async getTrendingCars(limit = 10, days = 7) {
    try {
      const query = `
        SELECT 
          c.id,
          c.title,
          c.brand,
          c.model,
          c.year,
          c.price,
          c.images,
          c.location,
          COUNT(DISTINCT cf.user_id) as favorites_count,
          COUNT(DISTINCT cr.id) as reviews_count,
          COUNT(DISTINCT cv.id) as views_count,
          (
            COUNT(DISTINCT cf.user_id) * 2 +
            COUNT(DISTINCT cr.id) * 3 +
            COUNT(DISTINCT cv.id) * 1
          ) as trending_score
        FROM cars c
        LEFT JOIN car_favorites cf ON c.id = cf.car_id AND cf.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        LEFT JOIN car_reviews cr ON c.id = cr.car_id AND cr.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        LEFT JOIN car_views cv ON c.id = cv.car_id AND cv.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        WHERE c.status = 'active'
        GROUP BY c.id, c.title, c.brand, c.model, c.year, c.price, c.images, c.location
        HAVING trending_score > 0
        ORDER BY trending_score DESC
        LIMIT ?
      `;

      const results = await executeQuery(query, [days, days, days, limit]);

      return results.map(car => ({
        ...car,
        recommendation_type: 'trending',
        score: car.trending_score
      }));
    } catch (error) {
      console.error('Error getting trending cars:', error);
      return [];
    }
  }

  // Get price-based recommendations (cars in similar price range)
  async getPriceBasedRecommendations(carId, priceRange = 0.2, limit = 10) {
    try {
      const query = `
        WITH target_car AS (
          SELECT price FROM cars WHERE id = ?
        )
        SELECT 
          c.id,
          c.title,
          c.brand,
          c.model,
          c.year,
          c.price,
          c.images,
          c.location,
          ABS(c.price - tc.price) / tc.price as price_difference
        FROM cars c
        CROSS JOIN target_car tc
        WHERE c.id != ? 
          AND c.status = 'active'
          AND ABS(c.price - tc.price) / tc.price <= ?
        ORDER BY price_difference ASC
        LIMIT ?
      `;

      const results = await executeQuery(query, [carId, carId, priceRange, limit]);

      return results.map(car => ({
        ...car,
        recommendation_type: 'price_based',
        score: 1 - car.price_difference
      }));
    } catch (error) {
      console.error('Error getting price-based recommendations:', error);
      return [];
    }
  }

  // Track user behavior for better recommendations
  async trackUserBehavior(userId, carId, action, metadata = {}) {
    try {
      const query = `
        INSERT INTO user_behavior_tracking 
        (id, user_id, car_id, action, metadata, created_at)
        VALUES (UUID(), ?, ?, ?, ?, NOW())
      `;

      await executeQuery(query, [userId, carId, action, JSON.stringify(metadata)]);
    } catch (error) {
      console.error('Error tracking user behavior:', error);
    }
  }

  // Get recommendation analytics
  async getRecommendationAnalytics(period = '7d') {
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 7;
      
      const query = `
        SELECT 
          recommendation_type,
          COUNT(*) as total_recommendations,
          COUNT(DISTINCT user_id) as unique_users,
          AVG(score) as avg_score,
          COUNT(CASE WHEN clicked = 1 THEN 1 END) as clicks,
          COUNT(CASE WHEN clicked = 1 THEN 1 END) / COUNT(*) as click_rate
        FROM car_recommendations 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY recommendation_type
      `;

      return await executeQuery(query, [days]);
    } catch (error) {
      console.error('Error getting recommendation analytics:', error);
      return [];
    }
  }
}

module.exports = new RecommendationEngine();

