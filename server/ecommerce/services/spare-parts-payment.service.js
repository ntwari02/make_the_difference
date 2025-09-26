const { executeQuery } = require('../../config/database');
const crypto = require('crypto');
const paymentService = require('./payment.service');

class SparePartsPaymentService {
  constructor() {
    this.supportedPaymentMethods = [
      'stripe', 'paypal', 'apple_pay', 'google_pay', 
      'crypto', 'bnpl', 'financing', 'bank_transfer', 'mobile_money'
    ];
  }

  // Process spare parts purchase
  async processSparePartsPurchase(paymentData) {
    try {
      const {
        userId,
        parts, // Array of {part_id, quantity, price}
        shippingAddress,
        billingAddress,
        paymentMethod,
        paymentMethodId,
        currency = 'USD',
        metadata = {}
      } = paymentData;

      // Validate parts availability and calculate totals
      const orderDetails = await this.validateAndCalculateOrder(parts, userId);

      // Create order
      const order = await this.createOrder({
        user_id: userId,
        order_type: 'spare_parts',
        total_amount: orderDetails.total,
        currency,
        payment_method: paymentMethod,
        payment_method_id: paymentMethodId,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        metadata: {
          parts: orderDetails.parts,
          ...metadata
        }
      });

      // Process payment
      const paymentResult = await paymentService.processPayment({
        userId,
        carId: `spare_parts_order_${order.id}`, // Reuse car payment logic
        amount: orderDetails.total,
        currency,
        paymentMethod,
        paymentMethodId,
        metadata: {
          ...metadata,
          order_id: order.id,
          transaction_type: 'spare_parts_purchase',
          parts_count: parts.length
        }
      });

      // Update order with payment result
      await this.updateOrder(order.id, {
        status: paymentResult.status === 'completed' ? 'paid' : 'pending_payment',
        payment_status: paymentResult.status,
        external_transaction_id: paymentResult.external_id,
        payment_details: paymentResult
      });

      // Reserve inventory if payment successful
      if (paymentResult.status === 'completed') {
        await this.reserveInventory(order.id, orderDetails.parts);
        await this.sendOrderConfirmation(order.id);
      }

      return {
        order_id: order.id,
        status: paymentResult.status,
        payment_method: paymentMethod,
        total_amount: orderDetails.total,
        currency,
        external_id: paymentResult.external_id,
        message: paymentResult.message,
        order_details: orderDetails,
        estimated_delivery: this.calculateEstimatedDelivery(shippingAddress)
      };
    } catch (error) {
      console.error('Spare parts purchase error:', error);
      throw new Error('Spare parts purchase failed: ' + error.message);
    }
  }

  // Process spare parts bundle purchase
  async processBundlePurchase(paymentData) {
    try {
      const {
        userId,
        bundleId,
        quantity = 1,
        shippingAddress,
        billingAddress,
        paymentMethod,
        paymentMethodId,
        currency = 'USD',
        metadata = {}
      } = paymentData;

      // Get bundle details
      const bundle = await this.getBundleById(bundleId);
      if (!bundle) {
        throw new Error('Bundle not found');
      }

      // Get bundle items
      const bundleItems = await this.getBundleItems(bundleId);
      if (bundleItems.length === 0) {
        throw new Error('Bundle has no items');
      }

      // Calculate total with bundle discount
      const subtotal = bundle.total_price * quantity;
      const discountAmount = (subtotal * bundle.bundle_discount) / 100;
      const total = subtotal - discountAmount;

      // Create bundle order
      const order = await this.createOrder({
        user_id: userId,
        order_type: 'spare_parts_bundle',
        total_amount: total,
        currency,
        payment_method: paymentMethod,
        payment_method_id: paymentMethodId,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        metadata: {
          bundle_id: bundleId,
          bundle_name: bundle.name,
          quantity,
          subtotal,
          discount_amount: discountAmount,
          bundle_discount_percentage: bundle.bundle_discount,
          ...metadata
        }
      });

      // Process payment
      const paymentResult = await paymentService.processPayment({
        userId,
        carId: `bundle_order_${order.id}`,
        amount: total,
        currency,
        paymentMethod,
        paymentMethodId,
        metadata: {
          ...metadata,
          order_id: order.id,
          transaction_type: 'bundle_purchase',
          bundle_id: bundleId
        }
      });

      // Update order
      await this.updateOrder(order.id, {
        status: paymentResult.status === 'completed' ? 'paid' : 'pending_payment',
        payment_status: paymentResult.status,
        external_transaction_id: paymentResult.external_id,
        payment_details: paymentResult
      });

      // Reserve inventory for all bundle items
      if (paymentResult.status === 'completed') {
        const partsToReserve = bundleItems.map(item => ({
          part_id: item.spare_part_id,
          quantity: item.quantity * quantity,
          unit_price: item.unit_price
        }));
        await this.reserveInventory(order.id, partsToReserve);
      }

      return {
        order_id: order.id,
        bundle_id: bundleId,
        bundle_name: bundle.name,
        status: paymentResult.status,
        payment_method: paymentMethod,
        total_amount: total,
        currency,
        external_id: paymentResult.external_id,
        message: paymentResult.message,
        bundle_items: bundleItems,
        discount_applied: discountAmount
      };
    } catch (error) {
      console.error('Bundle purchase error:', error);
      throw new Error('Bundle purchase failed: ' + error.message);
    }
  }

  // Process installation service payment
  async processInstallationServicePayment(paymentData) {
    try {
      const {
        userId,
        serviceId,
        partId,
        installationAddress,
        scheduledDate,
        paymentMethod,
        paymentMethodId,
        currency = 'USD',
        metadata = {}
      } = paymentData;

      // Get installation service details
      const service = await this.getInstallationServiceById(serviceId);
      if (!service) {
        throw new Error('Installation service not found');
      }

      // Calculate total cost
      const totalCost = service.base_price + (service.additional_fees || 0);

      // Create service order
      const order = await this.createOrder({
        user_id: userId,
        order_type: 'installation_service',
        total_amount: totalCost,
        currency,
        payment_method: paymentMethod,
        payment_method_id: paymentMethodId,
        service_address: installationAddress,
        metadata: {
          service_id: serviceId,
          part_id: partId,
          scheduled_date: scheduledDate,
          service_name: service.service_name,
          estimated_duration: service.estimated_duration,
          ...metadata
        }
      });

      // Process payment
      const paymentResult = await paymentService.processPayment({
        userId,
        carId: `installation_service_${order.id}`,
        amount: totalCost,
        currency,
        paymentMethod,
        paymentMethodId,
        metadata: {
          ...metadata,
          order_id: order.id,
          transaction_type: 'installation_service',
          service_id: serviceId
        }
      });

      // Update order
      await this.updateOrder(order.id, {
        status: paymentResult.status === 'completed' ? 'paid' : 'pending_payment',
        payment_status: paymentResult.status,
        external_transaction_id: paymentResult.external_id,
        payment_details: paymentResult
      });

      // Schedule service if payment successful
      if (paymentResult.status === 'completed') {
        await this.scheduleInstallationService(order.id, service, scheduledDate);
      }

      return {
        order_id: order.id,
        service_id: serviceId,
        service_name: service.service_name,
        status: paymentResult.status,
        payment_method: paymentMethod,
        total_amount: totalCost,
        currency,
        external_id: paymentResult.external_id,
        message: paymentResult.message,
        scheduled_date: scheduledDate,
        estimated_duration: service.estimated_duration
      };
    } catch (error) {
      console.error('Installation service payment error:', error);
      throw new Error('Installation service payment failed: ' + error.message);
    }
  }

  // Process subscription for spare parts (maintenance plans)
  async processMaintenancePlanSubscription(paymentData) {
    try {
      const {
        userId,
        planId,
        vehicleId,
        billingCycle = 'monthly',
        paymentMethod,
        paymentMethodId,
        currency = 'USD',
        metadata = {}
      } = paymentData;

      // Get maintenance plan details
      const plan = await this.getMaintenancePlanById(planId);
      if (!plan) {
        throw new Error('Maintenance plan not found');
      }

      // Calculate subscription amount
      const subscriptionAmount = billingCycle === 'yearly' ? 
        plan.yearly_price : plan.monthly_price;

      // Create subscription order
      const order = await this.createOrder({
        user_id: userId,
        order_type: 'maintenance_plan_subscription',
        total_amount: subscriptionAmount,
        currency,
        payment_method: paymentMethod,
        payment_method_id: paymentMethodId,
        metadata: {
          plan_id: planId,
          vehicle_id: vehicleId,
          billing_cycle: billingCycle,
          plan_name: plan.name,
          ...metadata
        }
      });

      // Process payment
      const paymentResult = await paymentService.processPayment({
        userId,
        carId: `maintenance_plan_${order.id}`,
        amount: subscriptionAmount,
        currency,
        paymentMethod,
        paymentMethodId,
        metadata: {
          ...metadata,
          order_id: order.id,
          transaction_type: 'maintenance_plan_subscription',
          plan_id: planId
        }
      });

      // Update order
      await this.updateOrder(order.id, {
        status: paymentResult.status === 'completed' ? 'paid' : 'pending_payment',
        payment_status: paymentResult.status,
        external_transaction_id: paymentResult.external_id,
        payment_details: paymentResult
      });

      // Activate subscription if payment successful
      if (paymentResult.status === 'completed') {
        await this.activateMaintenancePlan(userId, planId, vehicleId, billingCycle);
      }

      return {
        order_id: order.id,
        plan_id: planId,
        plan_name: plan.name,
        status: paymentResult.status,
        payment_method: paymentMethod,
        total_amount: subscriptionAmount,
        currency,
        external_id: paymentResult.external_id,
        message: paymentResult.message,
        billing_cycle: billingCycle,
        next_billing_date: this.calculateNextBillingDate(billingCycle)
      };
    } catch (error) {
      console.error('Maintenance plan subscription error:', error);
      throw new Error('Maintenance plan subscription failed: ' + error.message);
    }
  }

  // Helper methods
  async validateAndCalculateOrder(parts, userId) {
    const validatedParts = [];
    let total = 0;

    for (const part of parts) {
      // Get part details
      const partDetails = await this.getSparePartById(part.part_id);
      if (!partDetails) {
        throw new Error(`Part ${part.part_id} not found`);
      }

      // Check availability
      if (partDetails.quantity_available < part.quantity) {
        throw new Error(`Insufficient stock for part ${partDetails.name}`);
      }

      // Calculate price with discount
      const finalPrice = partDetails.final_price || partDetails.price;
      const lineTotal = finalPrice * part.quantity;
      total += lineTotal;

      validatedParts.push({
        part_id: part.part_id,
        part_name: partDetails.name,
        part_number: partDetails.part_number,
        quantity: part.quantity,
        unit_price: finalPrice,
        line_total: lineTotal,
        discount_applied: partDetails.discount_amount || 0
      });
    }

    return {
      parts: validatedParts,
      total,
      parts_count: parts.length
    };
  }

  async createOrder(orderData) {
    const orderId = crypto.randomUUID();
    
    const sql = `
      INSERT INTO orders (
        id, user_id, order_type, total_amount, currency, status,
        payment_method, payment_method_id, shipping_address, billing_address,
        metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, NOW())
    `;

    const params = [
      orderId,
      orderData.user_id,
      orderData.order_type,
      orderData.total_amount,
      orderData.currency,
      orderData.payment_method,
      orderData.payment_method_id,
      JSON.stringify(orderData.shipping_address || {}),
      JSON.stringify(orderData.billing_address || {}),
      JSON.stringify(orderData.metadata || {})
    ];

    await executeQuery(sql, params);
    return { id: orderId, ...orderData };
  }

  async updateOrder(orderId, updateData) {
    const sql = `
      UPDATE orders 
      SET status = ?, payment_status = ?, external_transaction_id = ?, 
          metadata = JSON_MERGE_PATCH(metadata, ?), updated_at = NOW()
      WHERE id = ?
    `;

    await executeQuery(sql, [
      updateData.status,
      updateData.payment_status,
      updateData.external_transaction_id,
      JSON.stringify(updateData.metadata || {}),
      orderId
    ]);
  }

  async reserveInventory(orderId, parts) {
    for (const part of parts) {
      await executeQuery(
        `UPDATE spare_parts_inventory 
         SET quantity_available = quantity_available - ?, 
             quantity_reserved = quantity_reserved + ?
         WHERE spare_part_id = ?`,
        [part.quantity, part.quantity, part.part_id]
      );

      // Create order item record
      await executeQuery(
        `INSERT INTO order_items (id, order_id, item_type, item_id, quantity, unit_price, total_price, created_at)
         VALUES (UUID(), ?, 'spare_part', ?, ?, ?, ?, NOW())`,
        [orderId, part.part_id, part.quantity, part.unit_price, part.quantity * part.unit_price]
      );
    }
  }

  calculateEstimatedDelivery(shippingAddress) {
    // Mock delivery calculation - would integrate with shipping providers
    const baseDays = 3;
    const distanceFactor = 1; // Would calculate based on distance
    return new Date(Date.now() + (baseDays * distanceFactor) * 24 * 60 * 60 * 1000);
  }

  calculateNextBillingDate(billingCycle) {
    const now = new Date();
    if (billingCycle === 'yearly') {
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    } else {
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }
  }

  // Additional helper methods would be implemented here...
  async getSparePartById(partId) {
    const sql = 'SELECT * FROM spare_parts WHERE id = ? AND status = "active"';
    const result = await executeQuery(sql, [partId]);
    return result[0] || null;
  }

  async getBundleById(bundleId) {
    const sql = 'SELECT * FROM spare_parts_bundles WHERE id = ? AND status = "active"';
    const result = await executeQuery(sql, [bundleId]);
    return result[0] || null;
  }

  async getBundleItems(bundleId) {
    const sql = `
      SELECT spbi.*, sp.name as part_name, sp.part_number
      FROM spare_parts_bundle_items spbi
      LEFT JOIN spare_parts sp ON spbi.spare_part_id = sp.id
      WHERE spbi.bundle_id = ?
    `;
    return await executeQuery(sql, [bundleId]);
  }

  async getInstallationServiceById(serviceId) {
    const sql = 'SELECT * FROM spare_parts_installation_services WHERE id = ? AND is_active = true';
    const result = await executeQuery(sql, [serviceId]);
    return result[0] || null;
  }

  async getMaintenancePlanById(planId) {
    // Mock maintenance plan - would be stored in database
    return {
      id: planId,
      name: 'Premium Maintenance Plan',
      monthly_price: 49.99,
      yearly_price: 499.99,
      features: ['Oil changes', 'Filter replacements', 'Brake inspections']
    };
  }

  async sendOrderConfirmation(orderId) {
    // Send order confirmation email/SMS
    console.log(`Order confirmation sent for order: ${orderId}`);
  }

  async scheduleInstallationService(orderId, service, scheduledDate) {
    // Schedule installation service
    console.log(`Installation service scheduled for order: ${orderId}`);
  }

  async activateMaintenancePlan(userId, planId, vehicleId, billingCycle) {
    // Activate maintenance plan subscription
    console.log(`Maintenance plan activated for user: ${userId}`);
  }
}

module.exports = new SparePartsPaymentService();
