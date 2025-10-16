const { executeQuery } = require('../config/database');

class NotificationService {
  // Get user notifications with pagination and filters
  async getUserNotifications(userId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        priority,
        read,
        unread_only = false
      } = filters;

      let query = `
        SELECT 
          id, type, title, message, data, 
          is_read, sent_at, created_at
        FROM notifications
        WHERE user_id = ?
      `;
      
      const params = [userId];
      const conditions = [];

      if (type) {
        conditions.push('type = ?');
        params.push(type);
      }

      if (read !== undefined) {
        conditions.push('is_read = ?');
        params.push(read ? 1 : 0);
      }

      if (unread_only) {
        conditions.push('is_read = 0');
      }

      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }

      query += ' ORDER BY created_at DESC';

      // Add pagination
      const offset = (page - 1) * limit;
      query += ` LIMIT ${limit} OFFSET ${offset}`;

      const notifications = await executeQuery(query, params);
      
      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total
        FROM notifications
        WHERE user_id = ?
      `;
      const countParams = [userId];
      
      if (conditions.length > 0) {
        countQuery += ' AND ' + conditions.join(' AND ');
      }

      const countResult = await executeQuery(countQuery, countParams);
      const total = countResult[0]?.total || 0;

      return {
        notifications: notifications.map(notif => ({
          ...notif,
          data: JSON.parse(notif.data || '{}')
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw new Error('Failed to get notifications');
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId, userId) {
    try {
      const query = `
        UPDATE notifications 
        SET is_read = 1, sent_at = NOW()
        WHERE id = ? AND user_id = ?
      `;

      const result = await executeQuery(query, [notificationId, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  // Mark all notifications as read for a user
  async markAllNotificationsAsRead(userId) {
    try {
      const query = `
        UPDATE notifications 
        SET is_read = 1, sent_at = NOW()
        WHERE user_id = ? AND is_read = 0
      `;

      const result = await executeQuery(query, [userId]);
      return result.affectedRows;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  // Get unread notification count
  async getUnreadCount(userId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM notifications
        WHERE user_id = ? 
        AND is_read = 0
      `;

      const result = await executeQuery(query, [userId]);
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Create notification
  async createNotification(notificationData) {
    try {
      const {
        user_id,
        type,
        title,
        message,
        data = {}
      } = notificationData;

      const query = `
        INSERT INTO notifications (
          user_id, type, title, message, data, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())
      `;

      const result = await executeQuery(query, [
        user_id,
        type,
        title,
        message,
        JSON.stringify(data)
      ]);

      return {
        id: result.insertId,
        user_id,
        type,
        title,
        message,
        data,
        is_read: false,
        created_at: new Date()
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  // Delete notification
  async deleteNotification(notificationId, userId) {
    try {
      const query = 'DELETE FROM notifications WHERE id = ? AND user_id = ?';
      const result = await executeQuery(query, [notificationId, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }
}

module.exports = new NotificationService();
