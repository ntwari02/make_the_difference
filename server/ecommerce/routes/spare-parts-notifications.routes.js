const express = require('express');
const router = express.Router();
const sparePartsNotificationService = require('../services/spare-parts-notification.service');
const { authenticateToken, authorizeRoles } = require('../../middleware/auth.middleware');

// ==================== NOTIFICATION MANAGEMENT ====================

// Get user notifications
router.get('/user/notifications', authenticateToken, async (req, res) => {
  try {
    const {
      limit = 20,
      offset = 0,
      type,
      is_read,
      notification_type
    } = req.query;

    const notifications = await sparePartsNotificationService.getUserNotifications(
      req.user.id,
      {
        limit: parseInt(limit),
        offset: parseInt(offset),
        type,
        is_read: is_read === 'true' ? true : is_read === 'false' ? false : undefined,
        notification_type
      }
    );

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get notification stats
router.get('/user/notifications/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await sparePartsNotificationService.getNotificationStats(req.user.id);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const result = await sparePartsNotificationService.markNotificationAsRead(
      req.params.id,
      req.user.id
    );

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Mark all notifications as read
router.put('/user/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    const result = await sparePartsNotificationService.markAllNotificationsAsRead(req.user.id);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete notification
router.delete('/notifications/:id', authenticateToken, async (req, res) => {
  try {
    const result = await sparePartsNotificationService.deleteNotification(
      req.params.id,
      req.user.id
    );

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== INVENTORY NOTIFICATIONS ====================

// Send low stock notification
router.post('/seller/:sellerId/low-stock', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const sellerId = req.user.role === 'admin' ? req.params.sellerId : req.user.id;
    const { spare_part_id } = req.body;

    if (!spare_part_id) {
      return res.status(400).json({
        success: false,
        message: 'spare_part_id is required'
      });
    }

    const result = await sparePartsNotificationService.sendLowStockNotification(sellerId, spare_part_id);

    res.json({
      success: true,
      message: 'Low stock notification sent successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Send out of stock notification
router.post('/seller/:sellerId/out-of-stock', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const sellerId = req.user.role === 'admin' ? req.params.sellerId : req.user.id;
    const { spare_part_id } = req.body;

    if (!spare_part_id) {
      return res.status(400).json({
        success: false,
        message: 'spare_part_id is required'
      });
    }

    const result = await sparePartsNotificationService.sendOutOfStockNotification(sellerId, spare_part_id);

    res.json({
      success: true,
      message: 'Out of stock notification sent successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Send restock notification
router.post('/seller/:sellerId/restocked', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const sellerId = req.user.role === 'admin' ? req.params.sellerId : req.user.id;
    const { spare_part_id, quantity_added } = req.body;

    if (!spare_part_id || !quantity_added) {
      return res.status(400).json({
        success: false,
        message: 'spare_part_id and quantity_added are required'
      });
    }

    const result = await sparePartsNotificationService.sendRestockNotification(
      sellerId, 
      spare_part_id, 
      quantity_added
    );

    res.json({
      success: true,
      message: 'Restock notification sent successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== PRICE NOTIFICATIONS ====================

// Send price drop notification
router.post('/price-drop', authenticateToken, async (req, res) => {
  try {
    const { spare_part_id, old_price, new_price } = req.body;

    if (!spare_part_id || !old_price || !new_price) {
      return res.status(400).json({
        success: false,
        message: 'spare_part_id, old_price, and new_price are required'
      });
    }

    const result = await sparePartsNotificationService.sendPriceDropNotification(
      req.user.id,
      spare_part_id,
      old_price,
      new_price
    );

    res.json({
      success: true,
      message: 'Price drop notification sent successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Send price increase notification
router.post('/price-increase', authenticateToken, async (req, res) => {
  try {
    const { spare_part_id, old_price, new_price } = req.body;

    if (!spare_part_id || !old_price || !new_price) {
      return res.status(400).json({
        success: false,
        message: 'spare_part_id, old_price, and new_price are required'
      });
    }

    const result = await sparePartsNotificationService.sendPriceIncreaseNotification(
      req.user.id,
      spare_part_id,
      old_price,
      new_price
    );

    res.json({
      success: true,
      message: 'Price increase notification sent successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== AVAILABILITY NOTIFICATIONS ====================

// Send back in stock notification
router.post('/back-in-stock', authenticateToken, async (req, res) => {
  try {
    const { spare_part_id } = req.body;

    if (!spare_part_id) {
      return res.status(400).json({
        success: false,
        message: 'spare_part_id is required'
      });
    }

    const result = await sparePartsNotificationService.sendBackInStockNotification(
      req.user.id,
      spare_part_id
    );

    res.json({
      success: true,
      message: 'Back in stock notification sent successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Send new part notification
router.post('/new-part', authenticateToken, async (req, res) => {
  try {
    const { spare_part_id } = req.body;

    if (!spare_part_id) {
      return res.status(400).json({
        success: false,
        message: 'spare_part_id is required'
      });
    }

    const result = await sparePartsNotificationService.sendNewPartNotification(
      req.user.id,
      spare_part_id
    );

    res.json({
      success: true,
      message: 'New part notification sent successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== BUNDLE NOTIFICATIONS ====================

// Send bundle created notification
router.post('/bundle-created', authenticateToken, async (req, res) => {
  try {
    const { bundle_id } = req.body;

    if (!bundle_id) {
      return res.status(400).json({
        success: false,
        message: 'bundle_id is required'
      });
    }

    const result = await sparePartsNotificationService.sendBundleCreatedNotification(
      req.user.id,
      bundle_id
    );

    res.json({
      success: true,
      message: 'Bundle created notification sent successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== ORDER NOTIFICATIONS ====================

// Send order confirmation notification
router.post('/order-confirmation', authenticateToken, async (req, res) => {
  try {
    const { order_id, order_items } = req.body;

    if (!order_id || !order_items) {
      return res.status(400).json({
        success: false,
        message: 'order_id and order_items are required'
      });
    }

    const result = await sparePartsNotificationService.sendOrderConfirmationNotification(
      req.user.id,
      order_id,
      order_items
    );

    res.json({
      success: true,
      message: 'Order confirmation notification sent successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Send order shipped notification
router.post('/order-shipped', authenticateToken, async (req, res) => {
  try {
    const { order_id, tracking_number } = req.body;

    if (!order_id || !tracking_number) {
      return res.status(400).json({
        success: false,
        message: 'order_id and tracking_number are required'
      });
    }

    const result = await sparePartsNotificationService.sendOrderShippedNotification(
      req.user.id,
      order_id,
      tracking_number
    );

    res.json({
      success: true,
      message: 'Order shipped notification sent successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== SYSTEM NOTIFICATIONS ====================

// Send system maintenance notification
router.post('/system-maintenance', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { user_id, maintenance_message } = req.body;

    if (!user_id || !maintenance_message) {
      return res.status(400).json({
        success: false,
        message: 'user_id and maintenance_message are required'
      });
    }

    const result = await sparePartsNotificationService.sendSystemMaintenanceNotification(
      user_id,
      maintenance_message
    );

    res.json({
      success: true,
      message: 'System maintenance notification sent successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Send feature update notification
router.post('/feature-update', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { user_id, feature_name, update_message } = req.body;

    if (!user_id || !feature_name || !update_message) {
      return res.status(400).json({
        success: false,
        message: 'user_id, feature_name, and update_message are required'
      });
    }

    const result = await sparePartsNotificationService.sendFeatureUpdateNotification(
      user_id,
      feature_name,
      update_message
    );

    res.json({
      success: true,
      message: 'Feature update notification sent successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== BULK NOTIFICATIONS ====================

// Send bulk notification
router.post('/bulk', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { user_ids, notification_data } = req.body;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'user_ids array is required'
      });
    }

    if (!notification_data || !notification_data.title || !notification_data.message) {
      return res.status(400).json({
        success: false,
        message: 'notification_data with title and message is required'
      });
    }

    const result = await sparePartsNotificationService.sendBulkNotification(
      user_ids,
      notification_data
    );

    res.json({
      success: true,
      message: `Bulk notification sent to ${result.count} users`,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== NOTIFICATION PREFERENCES ====================

// Update notification preferences
router.put('/user/preferences', authenticateToken, async (req, res) => {
  try {
    const {
      inventory_alerts,
      price_alerts,
      availability_alerts,
      order_updates,
      system_notifications,
      email_notifications,
      sms_notifications
    } = req.body;

    // This would typically update user notification preferences in the database
    // For now, we'll return a placeholder response
    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences: {
        inventory_alerts,
        price_alerts,
        availability_alerts,
        order_updates,
        system_notifications,
        email_notifications,
        sms_notifications
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get notification preferences
router.get('/user/preferences', authenticateToken, async (req, res) => {
  try {
    // This would typically fetch user notification preferences from the database
    // For now, we'll return a placeholder response
    res.json({
      success: true,
      data: {
        message: 'Notification preferences would be fetched from database',
        user_id: req.user.id
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
