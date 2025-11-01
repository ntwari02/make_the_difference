const { executeQuery } = require('../../config/database');

class InvoiceService {
  constructor() {
    this.ordersTable = 'orders';
    this.orderItemsTable = 'order_items';
    this.usersTable = 'users';
    this.sellersTable = 'sellers';
  }

  async generateInvoice(orderId, userId, userRole = 'buyer') {
    try {
      console.log(`🔍 Generating invoice for order ${orderId}, user ${userId}, role ${userRole}`);
      
      // Get order details - simplified query to avoid column issues
      const orderQuery = `
        SELECT o.*, 
               buyer.first_name as buyer_first_name,
               buyer.last_name as buyer_last_name,
               buyer.email as buyer_email,
               buyer.phone as buyer_phone,
               buyer.address as buyer_address,
               seller.user_id as seller_user_id,
               seller.business_name as seller_business_name,
               seller.email as seller_email,
               seller.phone as seller_phone,
               seller.address as seller_address,
               seller.city as seller_city,
               seller.state as seller_state,
               seller.country as seller_country,
               seller.postal_code as seller_postal_code,
               seller.license_number as seller_license_number
        FROM ${this.ordersTable} o
        LEFT JOIN ${this.usersTable} buyer ON o.buyer_id = buyer.id
        LEFT JOIN ${this.sellersTable} seller ON o.seller_id = seller.user_id
        WHERE o.id = ?
      `;

      console.log('🔍 Executing order query for invoice');
      const orderRows = await executeQuery(orderQuery, [orderId]);
      console.log(`✅ Found ${orderRows?.length || 0} order row(s)`);
      
      if (!orderRows || orderRows.length === 0) {
        throw new Error('Order not found');
      }

      const order = orderRows[0];

      // Verify access: buyer can see their own orders, seller can see their own orders
      if (userRole === 'buyer' && String(order.buyer_id) !== String(userId)) {
        throw new Error('Unauthorized: This order does not belong to you');
      }
      if (userRole === 'seller' && String(order.seller_id) !== String(userId)) {
        throw new Error('Unauthorized: This order does not belong to your business');
      }

      // Get order items
      const itemsQuery = `
        SELECT 
          oi.*,
          CASE 
            WHEN oi.item_type = 'car' THEN
              (SELECT CONCAT(c.year, ' ', c.brand, ' ', c.model) 
               FROM cars c WHERE c.id = oi.item_id LIMIT 1)
            WHEN oi.item_type = 'spare_part' THEN
              (SELECT sp.name FROM spare_parts sp WHERE sp.id = oi.item_id LIMIT 1)
            ELSE oi.item_name
          END as product_name,
          CASE 
            WHEN oi.item_type = 'car' THEN
              (SELECT JSON_UNQUOTE(JSON_EXTRACT(c.images, '$[0]'))
               FROM cars c WHERE c.id = oi.item_id LIMIT 1)
            WHEN oi.item_type = 'spare_part' THEN
              (SELECT JSON_UNQUOTE(JSON_EXTRACT(sp.images, '$[0]'))
               FROM spare_parts sp WHERE sp.id = oi.item_id LIMIT 1)
            ELSE oi.item_image
          END as product_image,
          CASE 
            WHEN oi.item_type = 'car' THEN
              COALESCE(
                oi.item_sku, 
                -- Generate SKU from car data: CAR-{YEAR}-{BRAND}-{first 6 chars of ID}
                (SELECT CONCAT('CAR-', c.year, '-', UPPER(SUBSTRING(REPLACE(c.brand, ' ', ''), 1, 3)), '-', UPPER(SUBSTRING(oi.item_id, 1, 6)))
                 FROM cars c WHERE c.id = oi.item_id LIMIT 1),
                -- Fallback: use item_id if car not found
                CONCAT('CAR-', UPPER(SUBSTRING(oi.item_id, 1, 8)))
              )
            WHEN oi.item_type = 'spare_part' THEN
              COALESCE((SELECT sp.sku FROM spare_parts sp WHERE sp.id = oi.item_id LIMIT 1), oi.item_sku)
            ELSE 
              COALESCE(oi.item_sku, CONCAT('ITEM-', UPPER(SUBSTRING(oi.item_id, 1, 8))))
          END as product_sku,
          oi.item_type
        FROM ${this.orderItemsTable} oi
        WHERE oi.order_id = ?
        ORDER BY oi.item_type, oi.item_name
      `;

      console.log('🔍 Executing items query for invoice');
      const items = await executeQuery(itemsQuery, [orderId]);
      console.log(`✅ Found ${items?.length || 0} order item(s)`);

      // Calculate totals
      const subtotal = parseFloat(order.total_amount) || 0;
      const taxRate = 0.10; // 10% tax (can be made configurable)
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount;

      // Generate invoice number
      const invoiceNumber = `INV-${order.order_number}`;
      const invoiceDate = order.payment_status === 'completed' && order.updated_at 
        ? new Date(order.updated_at) 
        : new Date();

      // Build invoice data
      const invoice = {
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate.toISOString(),
        order_number: order.order_number,
        order_id: order.id,
        
        // Buyer Information
        buyer: {
          name: `${order.buyer_first_name || ''} ${order.buyer_last_name || ''}`.trim(),
          email: order.buyer_email || '',
          phone: order.buyer_phone || '',
          address: order.buyer_address ? (typeof order.buyer_address === 'string' ? JSON.parse(order.buyer_address) : order.buyer_address) : null,
        },

        // Seller Information
        seller: {
          business_name: order.seller_business_name || 'Seller',
          email: order.seller_email || '',
          phone: order.seller_phone || '',
          address: (() => {
            // Build address from seller columns if available
            if (order.seller_address || order.seller_city || order.seller_state || order.seller_country) {
              const parts = [];
              if (order.seller_address) parts.push(order.seller_address);
              if (order.seller_city) parts.push(order.seller_city);
              if (order.seller_state) parts.push(order.seller_state);
              if (order.seller_postal_code) parts.push(order.seller_postal_code);
              if (order.seller_country) parts.push(order.seller_country);
              return parts.length > 0 ? parts.join(', ') : null;
            }
            // Try parsing if it's a JSON string
            if (order.seller_address && typeof order.seller_address === 'string') {
              try {
                return JSON.parse(order.seller_address);
              } catch {
                return order.seller_address;
              }
            }
            return order.seller_address || null;
          })(),
          tax_id: order.seller_license_number || '', // Using license_number as tax_id
          registration_number: order.seller_license_number || '', // Using license_number as registration_number
        },

        // Order Information
        order_date: order.created_at,
        payment_date: order.payment_status === 'completed' ? order.updated_at : null,
        payment_method: order.payment_method || 'Cash',
        payment_status: order.payment_status,
        delivery_method: order.delivery_method || 'Pickup',
        delivery_address: order.delivery_address ? (typeof order.delivery_address === 'string' ? JSON.parse(order.delivery_address) : order.delivery_address) : null,

        // Items
        items: items.map(item => ({
          id: item.id,
          item_id: item.item_id,
          item_type: item.item_type,
          name: item.product_name || item.item_name || 'Product',
          sku: item.product_sku || item.item_sku || 'N/A',
          quantity: item.quantity || 1,
          unit_price: parseFloat(item.unit_price) || 0,
          total_price: parseFloat(item.total_price) || 0,
          image: item.product_image || item.item_image || null,
        })),

        // Totals
        subtotal: subtotal,
        tax_rate: taxRate * 100, // As percentage
        tax_amount: taxAmount,
        total: total,
        currency: order.currency || 'USD',

        // Additional Information
        buyer_notes: order.buyer_notes || null,
        seller_notes: order.seller_notes || null,
        status: order.status,
      };

      console.log(`✅ Invoice generated successfully for order ${orderId}`);
      return invoice;
    } catch (error) {
      console.error('❌ Error generating invoice:', {
        orderId,
        userId,
        userRole,
        error: error.message,
        stack: error.stack,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      });
      throw new Error(`Failed to generate invoice: ${error.message}`);
    }
  }
}

module.exports = new InvoiceService();
