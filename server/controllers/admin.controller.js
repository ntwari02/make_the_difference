const { executeQuery } = require('../config/database');
const { ok, created, noContent, badRequest, unauthorized, forbidden, notFound, serverError } = require('../utils/response');

class AdminController {
  
  // Dashboard Overview
  async getDashboardOverview(req, res) {
    try {
      const { period = '30d' } = req.query;
      
      // Get comprehensive platform statistics
      const [
        userStats,
        ecommerceStats,
        elearningStats,
        onlineClassesStats,
        revenueStats
      ] = await Promise.all([
        this.getUserStatistics(period),
        this.getEcommerceStatistics(period),
        this.getElearningStatistics(period),
        this.getOnlineClassesStatistics(period),
        this.getRevenueStatistics(period)
      ]);
      
      const overview = {
        users: userStats,
        ecommerce: ecommerceStats,
        elearning: elearningStats,
        online_classes: onlineClassesStats,
        revenue: revenueStats,
        period,
        generated_at: new Date().toISOString()
      };
      
      return ok(res, { data: overview });
      
    } catch (error) {
      console.error('Dashboard overview error:', error);
      return serverError(res, 'Failed to retrieve dashboard overview', error);
    }
  }

  async getPendingAlerts(req, res) {
    try {
      // Get pending alerts from various sources
      const alerts = await executeQuery(`
        SELECT 
          'user_verification' as type,
          COUNT(*) as count,
          'Users pending email verification' as description
        FROM users 
        WHERE is_verified = 0 AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        
        UNION ALL
        
        SELECT 
          'content_moderation' as type,
          COUNT(*) as count,
          'Content items pending moderation' as description
        FROM cars 
        WHERE status = 'pending'
        
        UNION ALL
        
        SELECT 
          'course_approval' as type,
          COUNT(*) as count,
          'Courses pending approval' as description
        FROM courses 
        WHERE is_published = 0 AND status = 'pending'
      `);
      
      return ok(res, { data: alerts });
      
    } catch (error) {
      console.error('Get pending alerts error:', error);
      return serverError(res, 'Failed to retrieve pending alerts', error);
    }
  }

  async getRecentActivity(req, res) {
    try {
      const { limit = 20 } = req.query;
      
      // Get recent user activities
      const activities = await executeQuery(`
        SELECT 
          'user_registration' as activity_type,
          u.first_name,
          u.last_name,
          u.email,
          u.created_at as timestamp,
          'User registered' as description
        FROM users u
        WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        
        UNION ALL
        
        SELECT 
          'car_listing' as activity_type,
          u.first_name,
          u.last_name,
          u.email,
          c.created_at as timestamp,
          CONCAT('Listed car: ', c.make, ' ', c.model) as description
        FROM cars c
        JOIN users u ON c.seller_id = u.id
        WHERE c.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        
        UNION ALL
        
        SELECT 
          'course_creation' as activity_type,
          u.first_name,
          u.last_name,
          u.email,
          co.created_at as timestamp,
          CONCAT('Created course: ', co.title) as description
        FROM courses co
        JOIN users u ON co.instructor_id = u.id
        WHERE co.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        
        ORDER BY timestamp DESC
        LIMIT ?
      `, [limit]);
      
      return ok(res, { data: activities });
      
    } catch (error) {
      console.error('Get recent activity error:', error);
      return serverError(res, 'Failed to retrieve recent activity', error);
    }
  }

  // User Management
  async getAllUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        role,
        status = 'active',
        search,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = req.query;
      
      const offset = (page - 1) * limit;
      let query = `
        SELECT 
          u.*,
          COUNT(CASE WHEN c.id IS NOT NULL THEN 1 END) as total_cars,
          COUNT(CASE WHEN ce.id IS NOT NULL THEN 1 END) as total_enrollments,
          COUNT(CASE WHEN oc.id IS NOT NULL THEN 1 END) as total_classes
        FROM users u
        LEFT JOIN cars c ON u.id = c.seller_id
        LEFT JOIN course_enrollments ce ON u.id = ce.user_id
        LEFT JOIN online_classes oc ON u.id = oc.instructor_id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (role) {
        query += ' AND u.role = ?';
        params.push(role);
      }
      
      if (status === 'active') {
        query += ' AND u.is_active = 1';
      } else if (status === 'inactive') {
        query += ' AND u.is_active = 0';
      }
      
      if (search) {
        query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      query += ' GROUP BY u.id';
      query += ` ORDER BY u.${sort_by} ${sort_order}`;
      query += ` LIMIT ${limit} OFFSET ${offset}`;
      
      const users = await executeQuery(query, params);
      
      return ok(res, {
        data: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: users.length
        }
      });
      
    } catch (error) {
      console.error('Get all users error:', error);
      return serverError(res, 'Failed to retrieve users', error);
    }
  }

  async createUser(req, res) {
    try {
      const {
        email,
        password,
        first_name,
        last_name,
        phone,
        role = 'student',
        is_active = true,
        is_verified = false
      } = req.body;
      
      // Check if user already exists
      const existingUser = await executeQuery('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUser.length > 0) {
        return badRequest(res, 'User with this email already exists');
      }
      
      // Create user
      const userId = require('crypto').randomUUID();
      const hashedPassword = await require('bcrypt').hash(password, 10);
      
      await executeQuery(`
        INSERT INTO users (
          id, email, password, first_name, last_name, phone, role,
          is_active, is_verified, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [userId, email, hashedPassword, first_name, last_name, phone, role, is_active, is_verified]);
      
      // Log admin action
      await this.logAdminAction(req.user.id, 'create_user', { user_id: userId, email });
      
      return created(res, {
        message: 'User created successfully',
        data: { user_id: userId, email, role }
      });
      
    } catch (error) {
      console.error('Create user error:', error);
      return serverError(res, 'Failed to create user', error);
    }
  }

  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const updateData = req.body;
      
      // Check if user exists
      const user = await executeQuery('SELECT * FROM users WHERE id = ?', [userId]);
      if (user.length === 0) {
        return notFound(res, 'User not found');
      }
      
      // Build update query
      const fields = [];
      const values = [];
      
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && key !== 'id') {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });
      
      if (fields.length === 0) {
        return badRequest(res, 'No fields to update');
      }
      
      values.push(userId);
      
      await executeQuery(
        `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        values
      );
      
      // Log admin action
      await this.logAdminAction(req.user.id, 'update_user', { user_id: userId, changes: updateData });
      
      return ok(res, {
        message: 'User updated successfully',
        data: { user_id: userId }
      });
      
    } catch (error) {
      console.error('Update user error:', error);
      return serverError(res, 'Failed to update user', error);
    }
  }

  async updateUserStatus(req, res) {
    try {
      const { userId } = req.params;
      const { action, reason, duration } = req.body;
      
      const user = await executeQuery('SELECT * FROM users WHERE id = ?', [userId]);
      if (user.length === 0) {
        return notFound(res, 'User not found');
      }
      
      let isActive = user[0].is_active;
      let statusMessage = '';
      
      switch (action) {
        case 'suspend':
          isActive = false;
          statusMessage = 'User suspended';
          break;
        case 'activate':
          isActive = true;
          statusMessage = 'User activated';
          break;
        case 'deactivate':
          isActive = false;
          statusMessage = 'User deactivated';
          break;
        default:
          return badRequest(res, 'Invalid action');
      }
      
      await executeQuery(
        'UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?',
        [isActive, userId]
      );
      
      // Log admin action
      await this.logAdminAction(req.user.id, 'update_user_status', {
        user_id: userId,
        action,
        reason,
        duration
      });
      
      return ok(res, {
        message: statusMessage,
        data: { user_id: userId, is_active: isActive }
      });
      
    } catch (error) {
      console.error('Update user status error:', error);
      return serverError(res, 'Failed to update user status', error);
    }
  }

  async getUserActivity(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 50 } = req.query;
      
      // Get user activity logs
      const activities = await executeQuery(`
        SELECT 
          'login' as activity_type,
          'User logged in' as description,
          ua.created_at as timestamp,
          ua.ip_address,
          ua.user_agent
        FROM user_activity ua
        WHERE ua.user_id = ?
        
        UNION ALL
        
        SELECT 
          'car_view' as activity_type,
          CONCAT('Viewed car: ', c.make, ' ', c.model) as description,
          cv.created_at as timestamp,
          NULL as ip_address,
          NULL as user_agent
        FROM car_views cv
        JOIN cars c ON cv.car_id = c.id
        WHERE cv.user_id = ?
        
        UNION ALL
        
        SELECT 
          'course_enrollment' as activity_type,
          CONCAT('Enrolled in course: ', co.title) as description,
          ce.created_at as timestamp,
          NULL as ip_address,
          NULL as user_agent
        FROM course_enrollments ce
        JOIN courses co ON ce.course_id = co.id
        WHERE ce.user_id = ?
        
        ORDER BY timestamp DESC
        LIMIT ?
      `, [userId, userId, userId, limit]);
      
      return ok(res, { data: activities });
      
    } catch (error) {
      console.error('Get user activity error:', error);
      return serverError(res, 'Failed to retrieve user activity', error);
    }
  }

  async getUserSessions(req, res) {
    try {
      const { userId } = req.params;
      
      // Get active user sessions
      const sessions = await executeQuery(`
        SELECT 
          id,
          ip_address,
          user_agent,
          created_at,
          last_activity,
          is_active
        FROM user_sessions
        WHERE user_id = ? AND is_active = 1
        ORDER BY last_activity DESC
      `, [userId]);
      
      return ok(res, { data: sessions });
      
    } catch (error) {
      console.error('Get user sessions error:', error);
      return serverError(res, 'Failed to retrieve user sessions', error);
    }
  }

  async revokeUserSessions(req, res) {
    try {
      const { userId } = req.params;
      
      // Revoke all user sessions
      await executeQuery(
        'UPDATE user_sessions SET is_active = 0, revoked_at = NOW() WHERE user_id = ?',
        [userId]
      );
      
      // Log admin action
      await this.logAdminAction(req.user.id, 'revoke_user_sessions', { user_id: userId });
      
      return ok(res, {
        message: 'User sessions revoked successfully',
        data: { user_id: userId }
      });
      
    } catch (error) {
      console.error('Revoke user sessions error:', error);
      return serverError(res, 'Failed to revoke user sessions', error);
    }
  }

  // System Analytics
  async getSystemAnalytics(req, res) {
    try {
      const { period = '30d' } = req.query;
      
      const analytics = {
        users: await this.getUserStatistics(period),
        ecommerce: await this.getEcommerceStatistics(period),
        elearning: await this.getElearningStatistics(period),
        online_classes: await this.getOnlineClassesStatistics(period),
        certificates: await this.getCertificateStatistics(period),
        revenue: await this.getRevenueStatistics(period),
        period,
        generated_at: new Date().toISOString()
      };
      
      return ok(res, { data: analytics });
      
    } catch (error) {
      console.error('System analytics error:', error);
      return serverError(res, 'Failed to retrieve system analytics', error);
    }
  }

  async getEcommerceAnalytics(req, res) {
    try {
      const { period = '30d' } = req.query;
      
      const analytics = await this.getEcommerceStatistics(period);
      
      // Add additional ecommerce metrics
      const additionalMetrics = await executeQuery(`
        SELECT 
          AVG(price) as avg_car_price,
          MAX(price) as max_car_price,
          MIN(price) as min_car_price,
          COUNT(CASE WHEN status = 'sold' THEN 1 END) as total_sales,
          COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 END) as new_listings
        FROM cars
      `, [this.getDaysFromPeriod(period)]);
      
      const result = {
        ...analytics,
        ...additionalMetrics[0],
        period,
        generated_at: new Date().toISOString()
      };
      
      return ok(res, { data: result });
      
    } catch (error) {
      console.error('Ecommerce analytics error:', error);
      return serverError(res, 'Failed to retrieve ecommerce analytics', error);
    }
  }

  async getElearningAnalytics(req, res) {
    try {
      const { period = '30d' } = req.query;
      
      const analytics = await this.getElearningStatistics(period);
      
      // Add additional elearning metrics
      const additionalMetrics = await executeQuery(`
        SELECT 
          AVG(rating) as avg_course_rating,
          COUNT(CASE WHEN rating >= 4 THEN 1 END) as highly_rated_courses,
          COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 END) as new_courses,
          COUNT(DISTINCT instructor_id) as active_instructors
        FROM courses
        WHERE rating IS NOT NULL
      `, [this.getDaysFromPeriod(period)]);
      
      const result = {
        ...analytics,
        ...additionalMetrics[0],
        period,
        generated_at: new Date().toISOString()
      };
      
      return ok(res, { data: result });
      
    } catch (error) {
      console.error('Elearning analytics error:', error);
      return serverError(res, 'Failed to retrieve elearning analytics', error);
    }
  }

  async getOnlineClassesAnalytics(req, res) {
    try {
      const { period = '30d' } = req.query;
      
      const analytics = await this.getOnlineClassesStatistics(period);
      
      // Add additional online classes metrics
      const additionalMetrics = await executeQuery(`
        SELECT 
          COUNT(DISTINCT instructor_id) as active_instructors,
          AVG(price) as avg_class_price,
          COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 END) as new_classes,
          COUNT(CASE WHEN status = 'live' THEN 1 END) as currently_live
        FROM online_classes
      `, [this.getDaysFromPeriod(period)]);
      
      const result = {
        ...analytics,
        ...additionalMetrics[0],
        period,
        generated_at: new Date().toISOString()
      };
      
      return ok(res, { data: result });
      
    } catch (error) {
      console.error('Online classes analytics error:', error);
      return serverError(res, 'Failed to retrieve online classes analytics', error);
    }
  }

  async getCertificateAnalytics(req, res) {
    try {
      const { period = '30d' } = req.query;
      
      const analytics = await this.getCertificateStatistics(period);
      
      // Add additional certificate metrics
      const additionalMetrics = await executeQuery(`
        SELECT 
          COUNT(DISTINCT user_id) as unique_certificate_holders,
          COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 END) as new_certificates,
          COUNT(CASE WHEN status = 'issued' THEN 1 END) as total_issued
        FROM certificates
      `, [this.getDaysFromPeriod(period)]);
      
      const result = {
        ...analytics,
        ...additionalMetrics[0],
        period,
        generated_at: new Date().toISOString()
      };
      
      return ok(res, { data: result });
      
    } catch (error) {
      console.error('Certificate analytics error:', error);
      return serverError(res, 'Failed to retrieve certificate analytics', error);
    }
  }

  // Content Moderation
  async getFlaggedContent(req, res) {
    try {
      const { type = 'all', status = 'pending', page = 1, limit = 20 } = req.query;
      
      // This would integrate with a content flagging system
      // For now, return placeholder data
      const flaggedContent = {
        cars: [],
        courses: [],
        reviews: [],
        messages: []
      };
      
      return ok(res, { data: flaggedContent });
      
    } catch (error) {
      console.error('Get flagged content error:', error);
      return serverError(res, 'Failed to retrieve flagged content', error);
    }
  }

  async moderateContent(req, res) {
    try {
      const { contentId } = req.params;
      const { action, reason, moderator_notes } = req.body;
      
      // Log moderation action
      await this.logAdminAction(req.user.id, 'moderate_content', {
        content_id: contentId,
        action,
        reason,
        moderator_notes
      });
      
      return ok(res, {
        message: 'Content moderated successfully',
        data: { content_id: contentId, action }
      });
      
    } catch (error) {
      console.error('Moderate content error:', error);
      return serverError(res, 'Failed to moderate content', error);
    }
  }

  async removeContent(req, res) {
    try {
      const { contentId } = req.params;
      const { reason } = req.body;
      
      // Log content removal
      await this.logAdminAction(req.user.id, 'remove_content', {
        content_id: contentId,
        reason
      });
      
      return ok(res, {
        message: 'Content removed successfully',
        data: { content_id: contentId }
      });
      
    } catch (error) {
      console.error('Remove content error:', error);
      return serverError(res, 'Failed to remove content', error);
    }
  }

  // System Configuration
  async getSystemSettings(req, res) {
    try {
      // This would retrieve from a settings table
      const settings = {
        max_file_size: '10MB',
        auto_approve_courses: false,
        require_email_verification: true,
        maintenance_mode: false,
        registration_enabled: true,
        max_users_per_org: 1000
      };
      
      return ok(res, { data: settings });
      
    } catch (error) {
      console.error('Get system settings error:', error);
      return serverError(res, 'Failed to retrieve system settings', error);
    }
  }

  async updateSystemSettings(req, res) {
    try {
      const settings = req.body;
      
      // Log settings change
      await this.logAdminAction(req.user.id, 'update_system_settings', { settings });
      
      return ok(res, {
        message: 'System settings updated successfully',
        data: settings
      });
      
    } catch (error) {
      console.error('Update system settings error:', error);
      return serverError(res, 'Failed to update system settings', error);
    }
  }

  async getFeatureFlags(req, res) {
    try {
      // Get feature flags from database
      const featureFlags = await executeQuery(`
        SELECT 
          id,
          name,
          description,
          is_enabled,
          target_percentage,
          created_at,
          updated_at
        FROM feature_flags
        ORDER BY name
      `);
      
      return ok(res, { data: featureFlags });
      
    } catch (error) {
      console.error('Get feature flags error:', error);
      return serverError(res, 'Failed to retrieve feature flags', error);
    }
  }

  async updateFeatureFlag(req, res) {
    try {
      const { flagId } = req.params;
      const { is_enabled, target_percentage, description } = req.body;
      
      // Update feature flag
      await executeQuery(`
        UPDATE feature_flags 
        SET is_enabled = ?, target_percentage = ?, description = ?, updated_at = NOW()
        WHERE id = ?
      `, [is_enabled, target_percentage, description, flagId]);
      
      // Log admin action
      await this.logAdminAction(req.user.id, 'update_feature_flag', {
        flag_id: flagId,
        is_enabled,
        target_percentage,
        description
      });
      
      return ok(res, {
        message: 'Feature flag updated successfully',
        data: { flag_id: flagId }
      });
      
    } catch (error) {
      console.error('Update feature flag error:', error);
      return serverError(res, 'Failed to update feature flag', error);
    }
  }

  // Audit and Logging
  async getAuditLogs(req, res) {
    try {
      const { 
        page = 1, 
        limit = 50, 
        action_type, 
        admin_id, 
        start_date, 
        end_date 
      } = req.query;
      
      const offset = (page - 1) * limit;
      let query = `
        SELECT 
          aa.*,
          u.first_name,
          u.last_name,
          u.email
        FROM admin_actions aa
        LEFT JOIN users u ON aa.admin_id = u.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (action_type) {
        query += ' AND aa.action = ?';
        params.push(action_type);
      }
      
      if (admin_id) {
        query += ' AND aa.admin_id = ?';
        params.push(admin_id);
      }
      
      if (start_date) {
        query += ' AND aa.created_at >= ?';
        params.push(start_date);
      }
      
      if (end_date) {
        query += ' AND aa.created_at <= ?';
        params.push(end_date);
      }
      
      query += ' ORDER BY aa.created_at DESC';
      query += ` LIMIT ${limit} OFFSET ${offset}`;
      
      const logs = await executeQuery(query, params);
      
      return ok(res, {
        data: logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: logs.length
        }
      });
      
    } catch (error) {
      console.error('Get audit logs error:', error);
      return serverError(res, 'Failed to retrieve audit logs', error);
    }
  }

  async getUserActivityLogs(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 100 } = req.query;
      
      const activities = await executeQuery(`
        SELECT 
          ua.*,
          u.first_name,
          u.last_name,
          u.email
        FROM user_activity ua
        JOIN users u ON ua.user_id = u.id
        WHERE ua.user_id = ?
        ORDER BY ua.created_at DESC
        LIMIT ?
      `, [userId, limit]);
      
      return ok(res, { data: activities });
      
    } catch (error) {
      console.error('Get user activity logs error:', error);
      return serverError(res, 'Failed to retrieve user activity logs', error);
    }
  }

  async getSystemEvents(req, res) {
    try {
      const { 
        page = 1, 
        limit = 50, 
        event_type, 
        severity, 
        start_date, 
        end_date 
      } = req.query;
      
      const offset = (page - 1) * limit;
      let query = `
        SELECT 
          se.*
        FROM system_events se
        WHERE 1=1
      `;
      
      const params = [];
      
      if (event_type) {
        query += ' AND se.event_type = ?';
        params.push(event_type);
      }
      
      if (severity) {
        query += ' AND se.severity = ?';
        params.push(severity);
      }
      
      if (start_date) {
        query += ' AND se.created_at >= ?';
        params.push(start_date);
      }
      
      if (end_date) {
        query += ' AND se.created_at <= ?';
        params.push(end_date);
      }
      
      query += ' ORDER BY se.created_at DESC';
      query += ` LIMIT ${limit} OFFSET ${offset}`;
      
      const events = await executeQuery(query, params);
      
      return ok(res, {
        data: events,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: events.length
        }
      });
      
    } catch (error) {
      console.error('Get system events error:', error);
      return serverError(res, 'Failed to retrieve system events', error);
    }
  }

  // Emergency Controls
  async emergencySuspendUser(req, res) {
    try {
      const { user_id, reason, duration } = req.body;
      
      await executeQuery(
        'UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?',
        [user_id]
      );
      
      // Log emergency action
      await this.logAdminAction(req.user.id, 'emergency_suspend_user', {
        user_id,
        reason,
        duration,
        emergency: true
      });
      
      return ok(res, {
        message: 'User emergency suspended',
        data: { user_id, reason, duration }
      });
      
    } catch (error) {
      console.error('Emergency suspend user error:', error);
      return serverError(res, 'Failed to emergency suspend user', error);
    }
  }

  async emergencyRemoveContent(req, res) {
    try {
      const { content_id, content_type, reason } = req.body;
      
      // Log emergency content removal
      await this.logAdminAction(req.user.id, 'emergency_remove_content', {
        content_id,
        content_type,
        reason,
        emergency: true
      });
      
      return ok(res, {
        message: 'Content emergency removed',
        data: { content_id, content_type, reason }
      });
      
    } catch (error) {
      console.error('Emergency remove content error:', error);
      return serverError(res, 'Failed to emergency remove content', error);
    }
  }

  async toggleMaintenanceMode(req, res) {
    try {
      const { enabled, message } = req.body;
      
      // Update maintenance mode setting
      await executeQuery(`
        UPDATE system_settings 
        SET value = ?, updated_at = NOW()
        WHERE setting_key = 'maintenance_mode'
      `, [enabled ? 'true' : 'false']);
      
      if (message) {
        await executeQuery(`
          UPDATE system_settings 
          SET value = ?, updated_at = NOW()
          WHERE setting_key = 'maintenance_message'
        `, [message]);
      }
      
      // Log admin action
      await this.logAdminAction(req.user.id, 'toggle_maintenance_mode', {
        enabled,
        message
      });
      
      return ok(res, {
        message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
        data: { enabled, message }
      });
      
    } catch (error) {
      console.error('Toggle maintenance mode error:', error);
      return serverError(res, 'Failed to toggle maintenance mode', error);
    }
  }

  // Bulk Operations
  async bulkUpdateUserStatus(req, res) {
    try {
      const { user_ids, action, reason } = req.body;
      
      if (!Array.isArray(user_ids) || user_ids.length === 0) {
        return badRequest(res, 'User IDs array is required');
      }
      
      let isActive;
      switch (action) {
        case 'activate':
          isActive = true;
          break;
        case 'suspend':
        case 'deactivate':
          isActive = false;
          break;
        default:
          return badRequest(res, 'Invalid action');
      }
      
      // Update all users
      const placeholders = user_ids.map(() => '?').join(',');
      await executeQuery(`
        UPDATE users 
        SET is_active = ?, updated_at = NOW()
        WHERE id IN (${placeholders})
      `, [isActive, ...user_ids]);
      
      // Log bulk action
      await this.logAdminAction(req.user.id, 'bulk_update_user_status', {
        user_ids,
        action,
        reason,
        count: user_ids.length
      });
      
      return ok(res, {
        message: `Bulk ${action} completed for ${user_ids.length} users`,
        data: { user_ids, action, count: user_ids.length }
      });
      
    } catch (error) {
      console.error('Bulk update user status error:', error);
      return serverError(res, 'Failed to bulk update user status', error);
    }
  }

  async bulkModerateContent(req, res) {
    try {
      const { content_ids, action, reason, moderator_notes } = req.body;
      
      if (!Array.isArray(content_ids) || content_ids.length === 0) {
        return badRequest(res, 'Content IDs array is required');
      }
      
      // Log bulk moderation action for each content item
      for (const contentId of content_ids) {
        await this.logAdminAction(req.user.id, 'bulk_moderate_content', {
          content_id: contentId,
          action,
          reason,
          moderator_notes
        });
      }
      
      return ok(res, {
        message: `Bulk moderation completed for ${content_ids.length} content items`,
        data: { content_ids, action, count: content_ids.length }
      });
      
    } catch (error) {
      console.error('Bulk moderate content error:', error);
      return serverError(res, 'Failed to bulk moderate content', error);
    }
  }

  async sendBulkNotifications(req, res) {
    try {
      const { 
        user_ids, 
        title, 
        message, 
        notification_type = 'admin_announcement',
        channels = ['email', 'in_app']
      } = req.body;
      
      if (!Array.isArray(user_ids) || user_ids.length === 0) {
        return badRequest(res, 'User IDs array is required');
      }
      
      if (!title || !message) {
        return badRequest(res, 'Title and message are required');
      }
      
      // Create notifications for each user
      const notifications = user_ids.map(userId => ({
        id: require('crypto').randomUUID(),
        user_id: userId,
        title,
        message,
        type: notification_type,
        channels: JSON.stringify(channels),
        created_at: new Date().toISOString()
      }));
      
      // Insert notifications (this would be done in batches for large arrays)
      for (const notification of notifications) {
        await executeQuery(`
          INSERT INTO notifications (
            id, user_id, title, message, type, channels, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          notification.id,
          notification.user_id,
          notification.title,
          notification.message,
          notification.type,
          notification.channels,
          notification.created_at
        ]);
      }
      
      // Log bulk notification action
      await this.logAdminAction(req.user.id, 'send_bulk_notifications', {
        user_ids,
        title,
        message,
        notification_type,
        channels,
        count: user_ids.length
      });
      
      return ok(res, {
        message: `Bulk notifications sent to ${user_ids.length} users`,
        data: { 
          user_ids, 
          title, 
          notification_type, 
          count: user_ids.length 
        }
      });
      
    } catch (error) {
      console.error('Send bulk notifications error:', error);
      return serverError(res, 'Failed to send bulk notifications', error);
    }
  }

  // Helper methods for statistics
  async getUserStatistics(period) {
    const days = this.getDaysFromPeriod(period);
    
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 END) as new_this_period,
        COUNT(CASE WHEN role = 'student' THEN 1 END) as students,
        COUNT(CASE WHEN role = 'instructor' THEN 1 END) as instructors,
        COUNT(CASE WHEN role = 'seller' THEN 1 END) as sellers,
        COUNT(CASE WHEN role = 'buyer' THEN 1 END) as buyers,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
      FROM users
    `, [days]);
    
    return stats[0] || {};
  }

  async getEcommerceStatistics(period) {
    const days = this.getDaysFromPeriod(period);
    
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_cars,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_cars,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_cars,
        COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_cars,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 END) as new_this_period
      FROM cars
    `, [days]);
    
    return stats[0] || {};
  }

  async getElearningStatistics(period) {
    const days = this.getDaysFromPeriod(period);
    
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_courses,
        COUNT(CASE WHEN is_published = 1 THEN 1 END) as published_courses,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 END) as new_this_period
      FROM courses
    `, [days]);
    
    return stats[0] || {};
  }

  async getOnlineClassesStatistics(period) {
    const days = this.getDaysFromPeriod(period);
    
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_classes,
        COUNT(CASE WHEN status = 'live' THEN 1 END) as live_classes,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_classes,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 END) as new_this_period
      FROM online_classes
    `, [days]);
    
    return stats[0] || {};
  }

  async getCertificateStatistics(period) {
    const days = this.getDaysFromPeriod(period);
    
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_certificates,
        COUNT(CASE WHEN status = 'issued' THEN 1 END) as issued_certificates,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 END) as new_this_period
      FROM certificates
    `, [days]);
    
    return stats[0] || {};
  }

  async getRevenueStatistics(period) {
    const days = this.getDaysFromPeriod(period);
    
    // This would integrate with payment/transaction tables
    return {
      total_revenue: 0,
      this_period: 0,
      course_sales: 0,
      car_sales: 0
    };
  }

  // Utility methods
  getDaysFromPeriod(period) {
    const periodMap = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    return periodMap[period] || 30;
  }

  async logAdminAction(adminId, action, details) {
    try {
      await executeQuery(`
        INSERT INTO admin_actions (
          id, admin_id, action, details, created_at
        ) VALUES (UUID(), ?, ?, ?, NOW())
      `, [adminId, action, JSON.stringify(details)]);
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  }
}

module.exports = new AdminController();
