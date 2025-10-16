const { executeQuery } = require('../config/database');

class ActivityService {
  // Get user activities with pagination and filters
  async getUserActivities(userId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        entity_type,
        action_type,
        start_date,
        end_date
      } = filters;

      let query = `
        SELECT 
          id, entity_type, entity_id, action_type, action_data,
          session_id, ip_address, device_type, created_at
        FROM user_behavior_tracking
        WHERE user_id = ?
      `;
      
      const params = [userId];
      const conditions = [];

      if (entity_type) {
        conditions.push('entity_type = ?');
        params.push(entity_type);
      }

      if (action_type) {
        conditions.push('action_type = ?');
        params.push(action_type);
      }

      if (start_date) {
        conditions.push('created_at >= ?');
        params.push(start_date);
      }

      if (end_date) {
        conditions.push('created_at <= ?');
        params.push(end_date);
      }

      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }

      query += ' ORDER BY created_at DESC';

      // Add pagination
      const offset = (page - 1) * limit;
      query += ` LIMIT ${limit} OFFSET ${offset}`;

      const activities = await executeQuery(query, params);
      
      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total
        FROM user_behavior_tracking
        WHERE user_id = ?
      `;
      const countParams = [userId];
      
      if (conditions.length > 0) {
        countQuery += ' AND ' + conditions.join(' AND ');
      }

      const countResult = await executeQuery(countQuery, countParams);
      const total = countResult[0]?.total || 0;

      return {
        activities: activities.map(activity => ({
          ...activity,
          action_data: JSON.parse(activity.action_data || '{}')
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user activities:', error);
      throw new Error('Failed to get activities');
    }
  }

  // Log user activity
  async logActivity(activityData) {
    try {
      const {
        user_id,
        entity_type,
        entity_id,
        action_type,
        action_data = {},
        session_id,
        ip_address,
        user_agent,
        referrer_url,
        page_url,
        device_type = 'desktop'
      } = activityData;

      const query = `
        INSERT INTO user_behavior_tracking (
          user_id, entity_type, entity_id, action_type, action_data,
          session_id, ip_address, user_agent, referrer_url, page_url, device_type, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      const result = await executeQuery(query, [
        user_id,
        entity_type,
        entity_id,
        action_type,
        JSON.stringify(action_data),
        session_id,
        ip_address,
        user_agent,
        referrer_url,
        page_url,
        device_type
      ]);

      return {
        id: result.insertId,
        user_id,
        entity_type,
        entity_id,
        action_type,
        action_data,
        created_at: new Date()
      };
    } catch (error) {
      console.error('Error logging activity:', error);
      throw new Error('Failed to log activity');
    }
  }

  // Get seller-specific activities (car-related activities)
  async getSellerActivities(sellerId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        action_type,
        start_date,
        end_date
      } = filters;

      // Get activities related to seller's cars
      let query = `
        SELECT 
          ubt.id, ubt.entity_type, ubt.entity_id, ubt.action_type, ubt.action_data,
          ubt.session_id, ubt.ip_address, ubt.device_type, ubt.created_at,
          c.title as car_title, c.brand, c.model, c.year,
          u.first_name as user_name, u.last_name as user_last_name
        FROM user_behavior_tracking ubt
        LEFT JOIN cars c ON ubt.entity_id = c.id AND ubt.entity_type = 'car'
        LEFT JOIN users u ON ubt.user_id = u.id
        WHERE c.seller_id = ?
      `;
      
      const params = [sellerId];
      const conditions = [];

      if (action_type) {
        conditions.push('ubt.action_type = ?');
        params.push(action_type);
      }

      if (start_date) {
        conditions.push('ubt.created_at >= ?');
        params.push(start_date);
      }

      if (end_date) {
        conditions.push('ubt.created_at <= ?');
        params.push(end_date);
      }

      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }

      query += ' ORDER BY ubt.created_at DESC';

      // Add pagination
      const offset = (page - 1) * limit;
      query += ` LIMIT ${limit} OFFSET ${offset}`;

      const activities = await executeQuery(query, params);
      
      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total
        FROM user_behavior_tracking ubt
        LEFT JOIN cars c ON ubt.entity_id = c.id AND ubt.entity_type = 'car'
        WHERE c.seller_id = ?
      `;
      const countParams = [sellerId];
      
      if (conditions.length > 0) {
        countQuery += ' AND ' + conditions.join(' AND ');
      }

      const countResult = await executeQuery(countQuery, countParams);
      const total = countResult[0]?.total || 0;

      return {
        activities: activities.map(activity => ({
          ...activity,
          action_data: JSON.parse(activity.action_data || '{}')
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting seller activities:', error);
      throw new Error('Failed to get seller activities');
    }
  }

  // Get activity summary for dashboard
  async getActivitySummary(userId, period = '7d') {
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      
      const summary = await executeQuery(`
        SELECT 
          action_type,
          COUNT(*) as count,
          COUNT(DISTINCT entity_id) as unique_entities,
          COUNT(DISTINCT DATE(created_at)) as active_days
        FROM user_behavior_tracking
        WHERE user_id = ?
        AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY action_type
        ORDER BY count DESC
      `, [userId, days]);

      const totalActivities = await executeQuery(`
        SELECT COUNT(*) as total
        FROM user_behavior_tracking
        WHERE user_id = ?
        AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      `, [userId, days]);

      return {
        period,
        total_activities: totalActivities[0]?.total || 0,
        activity_breakdown: summary,
        active_days: Math.max(...summary.map(s => s.active_days), 0)
      };
    } catch (error) {
      console.error('Error getting activity summary:', error);
      throw new Error('Failed to get activity summary');
    }
  }
}

module.exports = new ActivityService();
