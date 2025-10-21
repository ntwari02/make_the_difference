const { executeQuery } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');

class SparePartsNotificationService {
  constructor() {
    this.notificationsTable = 'notifications';
    this.sparePartsTable = 'spare_parts';
    this.inventoryTable = 'spare_parts_inventory';
    this.userPreferencesTable = 'user_preferences';
    this.sellersTable = 'sellers';
  }

  // ==================== INVENTORY NOTIFICATIONS ====================

  async sendLowStockNotification(sellerId, sparePartId) {
    try {
      const sparePartQuery = `
        SELECT 
          sp.name,
          sp.sku,
          si.quantity_available,
          si.reorder_point,
          s.business_name as seller_name
        FROM ${this.sparePartsTable} sp
        JOIN ${this.inventoryTable} si ON sp.id = si.spare_part_id
        JOIN ${this.sellersTable} s ON sp.seller_id = s.id
        WHERE sp.id = ? AND sp.seller_id = ?
      `;

      const sparePart = await executeQuery(sparePartQuery, [sparePartId, sellerId]);
      if (sparePart.length === 0) {
        throw new Error('Spare part not found');
      }

      const part = sparePart[0];
      const notificationData = {
        user_id: sellerId,
        type: 'in_app',
        title: 'Low Stock Alert',
        message: `${part.name} (SKU: ${part.sku}) is running low. Current stock: ${part.quantity_available}, Reorder point: ${part.reorder_point}`,
        data: {
          notification_type: 'low_stock',
          spare_part_id: sparePartId,
          current_stock: part.quantity_available,
          reorder_point: part.reorder_point,
          seller_name: part.seller_name
        }
      };

      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Error sending low stock notification:', error);
      throw new Error(`Failed to send low stock notification: ${error.message}`);
    }
  }

  async sendOutOfStockNotification(sellerId, sparePartId) {
    try {
      const sparePartQuery = `
        SELECT 
          sp.name,
          sp.sku,
          s.business_name as seller_name
        FROM ${this.sparePartsTable} sp
        JOIN ${this.sellersTable} s ON sp.seller_id = s.id
        WHERE sp.id = ? AND sp.seller_id = ?
      `;

      const sparePart = await executeQuery(sparePartQuery, [sparePartId, sellerId]);
      if (sparePart.length === 0) {
        throw new Error('Spare part not found');
      }

      const part = sparePart[0];
      const notificationData = {
        user_id: sellerId,
        type: 'in_app',
        title: 'Out of Stock Alert',
        message: `${part.name} (SKU: ${part.sku}) is now out of stock. Please restock immediately.`,
        data: {
          notification_type: 'out_of_stock',
          spare_part_id: sparePartId,
          seller_name: part.seller_name
        }
      };

      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Error sending out of stock notification:', error);
      throw new Error(`Failed to send out of stock notification: ${error.message}`);
    }
  }

  async sendRestockNotification(sellerId, sparePartId, quantityAdded) {
    try {
      const sparePartQuery = `
        SELECT 
          sp.name,
          sp.sku,
          si.quantity_available,
          s.business_name as seller_name
        FROM ${this.sparePartsTable} sp
        JOIN ${this.inventoryTable} si ON sp.id = si.spare_part_id
        JOIN ${this.sellersTable} s ON sp.seller_id = s.id
        WHERE sp.id = ? AND sp.seller_id = ?
      `;

      const sparePart = await executeQuery(sparePartQuery, [sparePartId, sellerId]);
      if (sparePart.length === 0) {
        throw new Error('Spare part not found');
      }

      const part = sparePart[0];
      const notificationData = {
        user_id: sellerId,
        type: 'in_app',
        title: 'Inventory Restocked',
        message: `${part.name} (SKU: ${part.sku}) has been restocked. Added: ${quantityAdded} units. Current stock: ${part.quantity_available}`,
        data: {
          notification_type: 'restocked',
          spare_part_id: sparePartId,
          quantity_added: quantityAdded,
          current_stock: part.quantity_available,
          seller_name: part.seller_name
        }
      };

      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Error sending restock notification:', error);
      throw new Error(`Failed to send restock notification: ${error.message}`);
    }
  }

  // ==================== PRICE NOTIFICATIONS ====================

  async sendPriceDropNotification(userId, sparePartId, oldPrice, newPrice) {
    try {
      const sparePartQuery = `
        SELECT 
          sp.name,
          sp.sku,
          s.business_name as seller_name
        FROM ${this.sparePartsTable} sp
        JOIN ${this.sellersTable} s ON sp.seller_id = s.id
        WHERE sp.id = ?
      `;

      const sparePart = await executeQuery(sparePartQuery, [sparePartId]);
      if (sparePart.length === 0) {
        throw new Error('Spare part not found');
      }

      const part = sparePart[0];
      const priceDropPercentage = ((oldPrice - newPrice) / oldPrice * 100).toFixed(1);
      
      const notificationData = {
        user_id: userId,
        type: 'in_app',
        title: 'Price Drop Alert',
        message: `${part.name} (SKU: ${part.sku}) price dropped by ${priceDropPercentage}%! New price: $${newPrice} (was $${oldPrice})`,
        data: {
          notification_type: 'price_drop',
          spare_part_id: sparePartId,
          old_price: oldPrice,
          new_price: newPrice,
          price_drop_percentage: priceDropPercentage,
          seller_name: part.seller_name
        }
      };

      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Error sending price drop notification:', error);
      throw new Error(`Failed to send price drop notification: ${error.message}`);
    }
  }

  async sendPriceIncreaseNotification(userId, sparePartId, oldPrice, newPrice) {
    try {
      const sparePartQuery = `
        SELECT 
          sp.name,
          sp.sku,
          s.business_name as seller_name
        FROM ${this.sparePartsTable} sp
        JOIN ${this.sellersTable} s ON sp.seller_id = s.id
        WHERE sp.id = ?
      `;

      const sparePart = await executeQuery(sparePartQuery, [sparePartId]);
      if (sparePart.length === 0) {
        throw new Error('Spare part not found');
      }

      const part = sparePart[0];
      const priceIncreasePercentage = ((newPrice - oldPrice) / oldPrice * 100).toFixed(1);
      
      const notificationData = {
        user_id: userId,
        type: 'in_app',
        title: 'Price Increase Alert',
        message: `${part.name} (SKU: ${part.sku}) price increased by ${priceIncreasePercentage}%. New price: $${newPrice} (was $${oldPrice})`,
        data: {
          notification_type: 'price_increase',
          spare_part_id: sparePartId,
          old_price: oldPrice,
          new_price: newPrice,
          price_increase_percentage: priceIncreasePercentage,
          seller_name: part.seller_name
        }
      };

      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Error sending price increase notification:', error);
      throw new Error(`Failed to send price increase notification: ${error.message}`);
    }
  }

  // ==================== AVAILABILITY NOTIFICATIONS ====================

  async sendBackInStockNotification(userId, sparePartId) {
    try {
      const sparePartQuery = `
        SELECT 
          sp.name,
          sp.sku,
          sp.price,
          s.business_name as seller_name
        FROM ${this.sparePartsTable} sp
        JOIN ${this.sellersTable} s ON sp.seller_id = s.id
        WHERE sp.id = ?
      `;

      const sparePart = await executeQuery(sparePartQuery, [sparePartId]);
      if (sparePart.length === 0) {
        throw new Error('Spare part not found');
      }

      const part = sparePart[0];
      const notificationData = {
        user_id: userId,
        type: 'in_app',
        title: 'Back in Stock!',
        message: `${part.name} (SKU: ${part.sku}) is now back in stock! Price: $${part.price}`,
        data: {
          notification_type: 'back_in_stock',
          spare_part_id: sparePartId,
          price: part.price,
          seller_name: part.seller_name
        }
      };

      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Error sending back in stock notification:', error);
      throw new Error(`Failed to send back in stock notification: ${error.message}`);
    }
  }

  async sendNewPartNotification(userId, sparePartId) {
    try {
      const sparePartQuery = `
        SELECT 
          sp.name,
          sp.sku,
          sp.price,
          sp.description,
          c.name as category_name,
          b.name as brand_name,
          s.business_name as seller_name
        FROM ${this.sparePartsTable} sp
        JOIN ${this.sellersTable} s ON sp.seller_id = s.id
        JOIN spare_parts_categories c ON sp.category_id = c.id
        JOIN spare_parts_brands b ON sp.brand_id = b.id
        WHERE sp.id = ?
      `;

      const sparePart = await executeQuery(sparePartQuery, [sparePartId]);
      if (sparePart.length === 0) {
        throw new Error('Spare part not found');
      }

      const part = sparePart[0];
      const notificationData = {
        user_id: userId,
        type: 'in_app',
        title: 'New Part Available',
        message: `New ${part.brand_name} ${part.name} available! Price: $${part.price}`,
        data: {
          notification_type: 'new_part',
          spare_part_id: sparePartId,
          category: part.category_name,
          brand: part.brand_name,
          price: part.price,
          seller_name: part.seller_name
        }
      };

      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Error sending new part notification:', error);
      throw new Error(`Failed to send new part notification: ${error.message}`);
    }
  }

  // ==================== BUNDLE NOTIFICATIONS ====================

  async sendBundleCreatedNotification(userId, bundleId) {
    try {
      const bundleQuery = `
        SELECT 
          b.name,
          b.bundle_type,
          b.total_price,
          b.bundle_discount,
          s.business_name as seller_name
        FROM spare_parts_bundles b
        JOIN ${this.sellersTable} s ON b.seller_id = s.id
        WHERE b.id = ?
      `;

      const bundle = await executeQuery(bundleQuery, [bundleId]);
      if (bundle.length === 0) {
        throw new Error('Bundle not found');
      }

      const bundleData = bundle[0];
      const notificationData = {
        user_id: userId,
        type: 'in_app',
        title: 'New Bundle Available',
        message: `New ${bundleData.bundle_type} bundle: ${bundleData.name}. Total price: $${bundleData.total_price}${bundleData.bundle_discount ? ` (${bundleData.bundle_discount}% off)` : ''}`,
        data: {
          notification_type: 'new_bundle',
          bundle_id: bundleId,
          bundle_type: bundleData.bundle_type,
          total_price: bundleData.total_price,
          bundle_discount: bundleData.bundle_discount,
          seller_name: bundleData.seller_name
        }
      };

      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Error sending bundle created notification:', error);
      throw new Error(`Failed to send bundle created notification: ${error.message}`);
    }
  }

  // ==================== ORDER NOTIFICATIONS ====================

  async sendOrderConfirmationNotification(userId, orderId, orderItems) {
    try {
      const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const notificationData = {
        user_id: userId,
        type: 'in_app',
        title: 'Order Confirmed',
        message: `Your order #${orderId} has been confirmed. ${totalItems} items totaling $${totalPrice.toFixed(2)}`,
        data: {
          notification_type: 'order_confirmation',
          order_id: orderId,
          total_items: totalItems,
          total_price: totalPrice,
          items: orderItems
        }
      };

      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Error sending order confirmation notification:', error);
      throw new Error(`Failed to send order confirmation notification: ${error.message}`);
    }
  }

  async sendOrderShippedNotification(userId, orderId, trackingNumber) {
    try {
      const notificationData = {
        user_id: userId,
        type: 'in_app',
        title: 'Order Shipped',
        message: `Your order #${orderId} has been shipped! Tracking number: ${trackingNumber}`,
        data: {
          notification_type: 'order_shipped',
          order_id: orderId,
          tracking_number: trackingNumber
        }
      };

      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Error sending order shipped notification:', error);
      throw new Error(`Failed to send order shipped notification: ${error.message}`);
    }
  }

  // ==================== SYSTEM NOTIFICATIONS ====================

  async sendSystemMaintenanceNotification(userId, maintenanceMessage) {
    try {
      const notificationData = {
        user_id: userId,
        type: 'in_app',
        title: 'System Maintenance',
        message: maintenanceMessage,
        data: {
          notification_type: 'system_maintenance',
          message: maintenanceMessage
        }
      };

      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Error sending system maintenance notification:', error);
      throw new Error(`Failed to send system maintenance notification: ${error.message}`);
    }
  }

  async sendFeatureUpdateNotification(userId, featureName, updateMessage) {
    try {
      const notificationData = {
        user_id: userId,
        type: 'in_app',
        title: 'New Feature Available',
        message: `${featureName}: ${updateMessage}`,
        data: {
          notification_type: 'feature_update',
          feature_name: featureName,
          update_message: updateMessage
        }
      };

      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Error sending feature update notification:', error);
      throw new Error(`Failed to send feature update notification: ${error.message}`);
    }
  }

  // ==================== BULK NOTIFICATIONS ====================

  async sendBulkNotification(userIds, notificationData) {
    try {
      const notifications = [];
      
      for (const userId of userIds) {
        const notification = {
          id: uuidv4(),
          user_id: userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          data: JSON.stringify(notificationData.data || {}),
          is_read: 0,
          created_at: new Date().toISOString()
        };
        notifications.push(notification);
      }

      if (notifications.length === 0) {
        return { success: true, count: 0 };
      }

      const insertQuery = `
        INSERT INTO ${this.notificationsTable} 
        (id, user_id, type, title, message, data, is_read, created_at)
        VALUES ${notifications.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ')}
      `;

      const values = notifications.flatMap(n => [
        n.id, n.user_id, n.type, n.title, n.message, n.data, n.is_read, n.created_at
      ]);

      await executeQuery(insertQuery, values);

      return { success: true, count: notifications.length };
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      throw new Error(`Failed to send bulk notification: ${error.message}`);
    }
  }

  // ==================== NOTIFICATION MANAGEMENT ====================

  async createNotification(notificationData) {
    try {
      const {
        user_id,
        type = 'in_app',
        title,
        message,
        data = {}
      } = notificationData;

      const insertQuery = `
        INSERT INTO ${this.notificationsTable} 
        (id, user_id, type, title, message, data, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, NOW())
      `;

      const result = await executeQuery(insertQuery, [
        uuidv4(),
        user_id,
        type,
        title,
        message,
        JSON.stringify(data)
      ]);

      return {
        success: true,
        notification_id: result.insertId,
        message: 'Notification created successfully'
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  async getUserNotifications(userId, options = {}) {
    try {
      const {
        limit = 20,
        offset = 0,
        type,
        is_read,
        notification_type
      } = options;

      let whereConditions = ['user_id = ?'];
      let queryParams = [userId];

      if (type) {
        whereConditions.push('type = ?');
        queryParams.push(type);
      }

      if (is_read !== undefined) {
        whereConditions.push('is_read = ?');
        queryParams.push(is_read ? 1 : 0);
      }

      if (notification_type) {
        whereConditions.push('JSON_EXTRACT(data, "$.notification_type") = ?');
        queryParams.push(notification_type);
      }

      const query = `
        SELECT 
          id,
          type,
          title,
          message,
          data,
          is_read,
          read_at,
          created_at
        FROM ${this.notificationsTable}
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      const notifications = await executeQuery(query, queryParams);

      // Parse JSON data
      notifications.forEach(notification => {
        try {
          notification.data = JSON.parse(notification.data);
        } catch (e) {
          notification.data = {};
        }
      });

      return notifications;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw new Error(`Failed to get user notifications: ${error.message}`);
    }
  }

  async markNotificationAsRead(notificationId, userId) {
    try {
      const updateQuery = `
        UPDATE ${this.notificationsTable} 
        SET is_read = 1, read_at = NOW()
        WHERE id = ? AND user_id = ?
      `;

      const result = await executeQuery(updateQuery, [notificationId, userId]);

      if (result.affectedRows === 0) {
        throw new Error('Notification not found or access denied');
      }

      return { success: true, message: 'Notification marked as read' };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  async markAllNotificationsAsRead(userId) {
    try {
      const updateQuery = `
        UPDATE ${this.notificationsTable} 
        SET is_read = 1, read_at = NOW()
        WHERE user_id = ? AND is_read = 0
      `;

      const result = await executeQuery(updateQuery, [userId]);

      return { 
        success: true, 
        message: `${result.affectedRows} notifications marked as read` 
      };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error(`Failed to mark all notifications as read: ${error.message}`);
    }
  }

  async deleteNotification(notificationId, userId) {
    try {
      const deleteQuery = `
        DELETE FROM ${this.notificationsTable} 
        WHERE id = ? AND user_id = ?
      `;

      const result = await executeQuery(deleteQuery, [notificationId, userId]);

      if (result.affectedRows === 0) {
        throw new Error('Notification not found or access denied');
      }

      return { success: true, message: 'Notification deleted successfully' };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  }

  async getNotificationStats(userId) {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_notifications,
          COUNT(CASE WHEN is_read = 0 THEN 1 END) as unread_notifications,
          COUNT(CASE WHEN type = 'in_app' THEN 1 END) as in_app_notifications,
          COUNT(CASE WHEN type = 'email' THEN 1 END) as email_notifications,
          COUNT(CASE WHEN type = 'sms' THEN 1 END) as sms_notifications,
          COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as recent_notifications
        FROM ${this.notificationsTable}
        WHERE user_id = ?
      `;

      const stats = await executeQuery(statsQuery, [userId]);
      return stats[0];
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw new Error(`Failed to get notification stats: ${error.message}`);
    }
  }
}

module.exports = new SparePartsNotificationService();
