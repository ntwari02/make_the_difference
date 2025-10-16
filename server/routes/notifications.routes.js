const express = require('express');
const { authenticate } = require('../middlewares/auth');
const ctrl = require('../controllers/notification.controller');

const router = express.Router();

// Notification routes (authentication required)
router.get('/', authenticate, ctrl.getNotifications);
router.get('/unread-count', authenticate, ctrl.getUnreadCount);
router.patch('/:notificationId/read', authenticate, ctrl.markNotificationAsRead);
router.patch('/mark-all-read', authenticate, ctrl.markAllNotificationsAsRead);
router.delete('/:notificationId', authenticate, ctrl.deleteNotification);

module.exports = router;
