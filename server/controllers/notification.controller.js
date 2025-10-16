const { ok, badRequest } = require('../utils/response');
const notificationService = require('../services/notification.service');

// Get user notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = req.query;
    const result = await notificationService.getUserNotifications(userId, filters);
    return ok(res, result);
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    const success = await notificationService.markNotificationAsRead(notificationId, userId);
    
    if (!success) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    return ok(res, { message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await notificationService.markAllNotificationsAsRead(userId);
    return ok(res, { 
      message: `Marked ${count} notifications as read`,
      count 
    });
  } catch (error) {
    console.error('Error in markAllNotificationsAsRead:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await notificationService.getUnreadCount(userId);
    return ok(res, { count });
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    const success = await notificationService.deleteNotification(notificationId, userId);
    
    if (!success) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    return ok(res, { message: 'Notification deleted' });
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  deleteNotification,
};
