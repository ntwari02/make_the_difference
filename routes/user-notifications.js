import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET user notifications (authenticated user)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'user_id = ?';
    let params = [userId];

    if (unreadOnly === 'true') {
      whereClause += ' AND is_read = 0';
    }

    // Get total count
    const [countResult] = await db.query(`
      SELECT COUNT(*) as total FROM user_notifications WHERE ${whereClause}
    `, params);

    // Get notifications with pagination
    const [notifications] = await db.query(`
      SELECT id, type, title, message, is_read, related_url, created_at
      FROM user_notifications 
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    res.json({
      success: true,
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }
});

// GET unread notification count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [result] = await db.query(`
      SELECT COUNT(*) as unread_count FROM user_notifications 
      WHERE user_id = ? AND is_read = 0
    `, [userId]);

    res.json({
      success: true,
      unreadCount: result[0].unread_count
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unread count'
    });
  }
});

// POST create notification (admin only - for bulk emails)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { userId, type, title, message, relatedUrl } = req.body;
    
    // Check if user exists
    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const [result] = await db.query(`
      INSERT INTO user_notifications (user_id, type, title, message, related_url)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, type, title, message, relatedUrl]);

    const [newNotification] = await db.query(`
      SELECT * FROM user_notifications WHERE id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification: newNotification[0]
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create notification'
    });
  }
});

// POST create bulk notifications (admin only - for bulk emails)
router.post('/bulk', authenticateToken, async (req, res) => {
  try {
    const { userIds, type, title, message, relatedUrl } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'User IDs array is required'
      });
    }

    // Check if users exist
    const [users] = await db.query('SELECT id FROM users WHERE id IN (?)', [userIds]);
    if (users.length !== userIds.length) {
      return res.status(400).json({
        success: false,
        error: 'Some users not found'
      });
    }

    // Create notifications for all users
    const notifications = [];
    for (const userId of userIds) {
      const [result] = await db.query(`
        INSERT INTO user_notifications (user_id, type, title, message, related_url)
        VALUES (?, ?, ?, ?, ?)
      `, [userId, type, title, message, relatedUrl]);
      
      notifications.push(result.insertId);
    }

    res.status(201).json({
      success: true,
      message: `Created ${notifications.length} notifications successfully`,
      notificationIds: notifications
    });
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create bulk notifications'
    });
  }
});

// PUT mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [existing] = await db.query(`
      SELECT * FROM user_notifications WHERE id = ? AND user_id = ?
    `, [id, userId]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    await db.query(`
      UPDATE user_notifications 
      SET is_read = 1, read_at = NOW()
      WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
});

// PUT mark all notifications as read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await db.query(`
      UPDATE user_notifications 
      SET is_read = 1, read_at = NOW()
      WHERE user_id = ? AND is_read = 0
    `, [userId]);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notifications as read'
    });
  }
});

// DELETE notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [existing] = await db.query(`
      SELECT * FROM user_notifications WHERE id = ? AND user_id = ?
    `, [id, userId]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    await db.query(`
      DELETE FROM user_notifications WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification'
    });
  }
});

// DELETE all notifications for user
router.delete('/clear-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await db.query(`
      DELETE FROM user_notifications WHERE user_id = ?
    `, [userId]);

    res.json({
      success: true,
      message: 'All notifications cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear notifications'
    });
  }
});

export default router;
