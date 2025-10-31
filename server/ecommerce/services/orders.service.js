const { executeQuery } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');

class OrdersService {
  constructor() {
    this.tableName = 'orders';
    this.orderItemsTable = 'order_items';
    this.orderStatusHistoryTable = 'order_status_history';
  }

  // Generate unique order number
  generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `ORD-${timestamp}-${random}`;
  }

  // ==================== CORE CRUD OPERATIONS ====================

  async createOrder(orderData) {
    const {
      buyer_id,
      seller_id,
      item_type = 'car',
      total_amount,
      currency = 'USD',
      payment_method = 'cash',
      delivery_method = 'pickup',
      delivery_address = null,
      buyer_notes = null,
      seller_notes = null,
      items = [] // Array of order items
    } = orderData;

    try {
      const orderId = uuidv4();
      const orderNumber = this.generateOrderNumber();

      // Create order
      const insertOrderQuery = `
        INSERT INTO ${this.tableName} 
        (id, order_number, buyer_id, seller_id, item_type, total_amount, currency,
         payment_method, delivery_method, delivery_address, buyer_notes, seller_notes,
         status, payment_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')
      `;

      await executeQuery(insertOrderQuery, [
        orderId, orderNumber, buyer_id, seller_id, item_type, total_amount, currency,
        payment_method, delivery_method, delivery_address ? JSON.stringify(delivery_address) : null,
        buyer_notes, seller_notes
      ]);

      // Create order items
      if (items && items.length > 0) {
        for (const item of items) {
          const itemId = uuidv4();
          const insertItemQuery = `
            INSERT INTO ${this.orderItemsTable}
            (id, order_id, item_id, item_type, quantity, unit_price, total_price, item_name, item_image, item_sku)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          await executeQuery(insertItemQuery, [
            itemId, orderId, item.item_id, item.item_type, item.quantity,
            item.unit_price, item.total_price, item.item_name || null, item.item_image || null, item.item_sku || null
          ]);
        }
      }

      // Add initial status to history
      await this.addStatusHistory(orderId, 'pending', 'system', 'Order created');

      // Return the created order
      return await this.getOrderById(orderId);
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error(`Error creating order: ${error.message}`);
    }
  }

  async getOrderById(orderId) {
    try {
      const query = `
        SELECT * FROM ${this.tableName} WHERE id = ?
      `;
      const order = await executeQuery(query, [orderId]);
      
      if (order && order.length > 0) {
        const orderData = order[0];
        
        // Get order items
        const itemsQuery = `
          SELECT * FROM ${this.orderItemsTable} WHERE order_id = ?
        `;
        orderData.items = await executeQuery(itemsQuery, [orderId]);

        // Get status history
        const historyQuery = `
          SELECT * FROM ${this.orderStatusHistoryTable} WHERE order_id = ? ORDER BY created_at DESC
        `;
        orderData.status_history = await executeQuery(historyQuery, [orderId]);

        return orderData;
      }
      return null;
    } catch (error) {
      console.error('Error getting order:', error);
      throw new Error(`Error getting order: ${error.message}`);
    }
  }

  async getOrdersBySeller(sellerId, filters = {}) {
    try {
      const { status, payment_status, start_date, end_date, search } = filters;
      const rawPage = filters.page ?? 1;
      const rawLimit = filters.limit ?? 20;
      const safeLimit = Number.isFinite(Number(rawLimit)) ? Math.max(1, parseInt(rawLimit, 10)) : 20;
      const safePage = Number.isFinite(Number(rawPage)) ? Math.max(1, parseInt(rawPage, 10)) : 1;
      
      let query = `
        SELECT o.*, 
               u.first_name, u.last_name, u.email, u.phone,
               COUNT(DISTINCT oi.id) as item_count
        FROM ${this.tableName} o
        LEFT JOIN users u ON o.buyer_id = u.id
        LEFT JOIN ${this.orderItemsTable} oi ON o.id = oi.order_id
        WHERE o.seller_id = ?
      `;
      
      const params = [sellerId];

      if (status) {
        query += ' AND o.status = ?';
        params.push(status);
      }

      if (payment_status) {
        query += ' AND o.payment_status = ?';
        params.push(payment_status);
      }

      if (start_date) {
        query += ' AND o.created_at >= ?';
        params.push(start_date);
      }

      if (end_date) {
        query += ' AND o.created_at <= ?';
        params.push(end_date);
      }

      if (search) {
        query += ' AND (o.order_number LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }

      query += ' GROUP BY o.id ORDER BY o.created_at DESC';

      // Add pagination (avoid binding LIMIT/OFFSET for some MySQL drivers that dislike it)
      const offset = (safePage - 1) * safeLimit;
      query += ` LIMIT ${safeLimit} OFFSET ${offset}`;

      const orders = await executeQuery(query, params);

      // Get items for each order
      for (const order of orders) {
        const itemsQuery = `
          SELECT * FROM ${this.orderItemsTable} WHERE order_id = ?
        `;
        order.items = await executeQuery(itemsQuery, [order.id]);

        // Enrich item name/image from cars for car items
        for (const item of order.items) {
          try {
            const type = (item.item_type || item.type || '').toLowerCase();
            const itemId = item.item_id || item.product_id || item.car_id;
            if (type === 'car' && itemId) {
              const carRows = await executeQuery(`
                SELECT id, title, brand, model, images
                FROM cars
                WHERE id = ?
                LIMIT 1
              `, [itemId]);
              if (carRows.length > 0) {
                const car = carRows[0];
                const images = (() => {
                  try {
                    if (!car.images) return [];
                    if (typeof car.images === 'string') return JSON.parse(car.images);
                    if (Array.isArray(car.images)) return car.images;
                    return [];
                  } catch { return []; }
                })();
                item.item_name = car.title || `${car.brand || ''} ${car.model || ''}`.trim();
                item.item_image = images?.[0] || item.item_image || null;
              }
            }
          } catch (_) { /* ignore enrichment errors */ }
        }
      }

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(DISTINCT o.id) as total
        FROM ${this.tableName} o
        LEFT JOIN users u ON o.buyer_id = u.id
        WHERE o.seller_id = ?
      `;
      const countParams = [sellerId];

      if (status) {
        countQuery += ' AND o.status = ?';
        countParams.push(status);
      }

      if (payment_status) {
        countQuery += ' AND o.payment_status = ?';
        countParams.push(payment_status);
      }

      if (start_date) {
        countQuery += ' AND o.created_at >= ?';
        countParams.push(start_date);
      }

      if (end_date) {
        countQuery += ' AND o.created_at <= ?';
        countParams.push(end_date);
      }

      if (search) {
        countQuery += ' AND (o.order_number LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)';
        const searchPattern = `%${search}%`;
        countParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }

      const countResult = await executeQuery(countQuery, countParams);
      const total = countResult[0].total;

      return {
        orders,
        pagination: {
          total,
          page: safePage,
          limit: safeLimit,
          total_pages: Math.ceil(total / safeLimit)
        }
      };
    } catch (error) {
      console.error('Error getting orders by seller:', error);
      throw new Error(`Error getting orders by seller: ${error.message}`);
    }
  }

  async updateOrderStatus(orderId, status, changedBy, changedByType = 'seller', notes = null) {
    try {
      // Read current status to prevent double inventory adjustments
      const currentRows = await executeQuery(`SELECT status FROM ${this.tableName} WHERE id = ?`, [orderId]);
      const previousStatus = currentRows?.[0]?.status || null;

      const updateQuery = `
        UPDATE ${this.tableName}
        SET status = ?, updated_at = NOW()
        ${status === 'shipped' ? ', shipped_at = NOW()' : ''}
        ${status === 'delivered' ? ', delivered_at = NOW()' : ''}
        ${status === 'cancelled' ? ', cancelled_at = NOW()' : ''}
        WHERE id = ?
      `;

      await executeQuery(updateQuery, [status, orderId]);

      // Add to status history
      await this.addStatusHistory(orderId, status, changedBy, notes);

      // If the order transitioned to a terminal fulfilled state, decrement inventory for ordered cars
      const isNowCompleted = ['delivered', 'completed'].includes(String(status || '').toLowerCase());
      const wasCompleted = ['delivered', 'completed'].includes(String(previousStatus || '').toLowerCase());
      if (isNowCompleted && !wasCompleted) {
        try {
          const items = await executeQuery(`SELECT item_id, item_type, quantity FROM ${this.orderItemsTable} WHERE order_id = ?`, [orderId]);
          for (const it of (items || [])) {
            const type = (it.item_type || '').toLowerCase();
            const qty = Math.max(1, parseInt(it.quantity || 1, 10));
            const itemId = it.item_id;
            if (type === 'car' && itemId) {
              // Decrement quantity, clamp to 0
              await executeQuery(`
                UPDATE cars
                SET quantity = GREATEST(0, COALESCE(quantity, 0) - ?), updated_at = NOW()
                WHERE id = ?
              `, [qty, itemId]);
            }
          }
        } catch (invErr) {
          console.error('Inventory adjustment failed for order', orderId, invErr);
          // Non-fatal
        }
      }

      return await this.getOrderById(orderId);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error(`Error updating order status: ${error.message}`);
    }
  }

  async updatePaymentStatus(orderId, paymentStatus, transactionId = null, paymentDate = null) {
    try {
      const updateQuery = `
        UPDATE ${this.tableName}
        SET payment_status = ?, payment_transaction_id = ?, payment_date = ?, updated_at = NOW()
        WHERE id = ?
      `;

      await executeQuery(updateQuery, [paymentStatus, transactionId, paymentDate, orderId]);

      // Add to status history
      await this.addStatusHistory(orderId, `payment_${paymentStatus}`, null, `Payment status updated to ${paymentStatus}`);

      return await this.getOrderById(orderId);
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw new Error(`Error updating payment status: ${error.message}`);
    }
  }

  async addSellerNotes(orderId, notes) {
    try {
      const updateQuery = `
        UPDATE ${this.tableName}
        SET seller_notes = ?, updated_at = NOW()
        WHERE id = ?
      `;

      await executeQuery(updateQuery, [notes, orderId]);

      return await this.getOrderById(orderId);
    } catch (error) {
      console.error('Error adding seller notes:', error);
      throw new Error(`Error adding seller notes: ${error.message}`);
    }
  }

  async addStatusHistory(orderId, status, changedBy, notes) {
    try {
      const historyId = uuidv4();
      const insertQuery = `
        INSERT INTO ${this.orderStatusHistoryTable}
        (id, order_id, status, changed_by, changed_by_type, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      await executeQuery(insertQuery, [historyId, orderId, status, changedBy, changedByType, notes]);
    } catch (error) {
      console.error('Error adding status history:', error);
      // Don't throw - this is non-critical
    }
  }

  async getOrderStats(sellerId) {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_orders,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
          COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
          COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
          COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
          COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
          COUNT(CASE WHEN (status = 'completed' OR status = 'delivered' OR payment_status = 'completed') THEN 1 END) as completed_orders,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
          COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_payments,
          COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_payments,
          COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN total_amount ELSE 0 END), 0) as total_revenue,
          (SELECT COUNT(DISTINCT buyer_id) FROM ${this.tableName} WHERE seller_id = ?) as total_customers,
          (SELECT COUNT(*) FROM cars WHERE seller_id = ?) as total_products
        FROM ${this.tableName}
        WHERE seller_id = ?
      `;

      const stats = await executeQuery(statsQuery, [sellerId, sellerId, sellerId]);
      return stats[0] || {};
    } catch (error) {
      console.error('Error getting order stats:', error);
      throw new Error(`Error getting order stats: ${error.message}`);
    }
  }
}

module.exports = new OrdersService();

