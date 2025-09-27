const { executeQuery } = require('../config/database');
const serviceFeeService = require('./service-fee.service');

class VisaService {
  constructor() {
    this.tableName = 'visa_services';
    this.applicationTableName = 'visa_applications';
  }

  // Get all visa services with filters
  async getVisaServices(filters = {}) {
    try {
      let query = `
        SELECT 
          vs.*,
          u.first_name as provider_first_name,
          u.last_name as provider_last_name,
          u.email as provider_email,
          COUNT(va.id) as application_count
        FROM ${this.tableName} vs
        LEFT JOIN users u ON vs.provider_id = u.id
        LEFT JOIN ${this.applicationTableName} va ON vs.id = va.visa_service_id
        WHERE vs.status = 'active'
      `;
      
      const params = [];
      const conditions = [];

      // Apply filters
      if (filters.country) {
        conditions.push('vs.country = ?');
        params.push(filters.country);
      }

      if (filters.visa_type) {
        conditions.push('vs.visa_type = ?');
        params.push(filters.visa_type);
      }

      if (filters.min_price) {
        conditions.push('vs.price >= ?');
        params.push(filters.min_price);
      }

      if (filters.max_price) {
        conditions.push('vs.price <= ?');
        params.push(filters.max_price);
      }

      if (filters.max_processing_time) {
        conditions.push('vs.processing_time_days <= ?');
        params.push(filters.max_processing_time);
      }

      if (filters.is_urgent) {
        conditions.push('vs.is_urgent_processing = ?');
        params.push(filters.is_urgent);
      }

      if (filters.is_featured) {
        conditions.push('vs.is_featured = ?');
        params.push(filters.is_featured);
      }

      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }

      query += ' GROUP BY vs.id ORDER BY vs.is_featured DESC, vs.created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
      }

      const visaServices = await executeQuery(query, params);
      
      return visaServices.map(service => ({
        ...service,
        requirements: JSON.parse(service.requirements || '{}'),
        required_documents: JSON.parse(service.required_documents || '[]'),
        fees_breakdown: JSON.parse(service.fees_breakdown || '{}'),
        tags: JSON.parse(service.tags || '[]')
      }));
    } catch (error) {
      console.error('Error fetching visa services:', error);
      throw new Error('Failed to fetch visa services');
    }
  }

  // Get visa service by ID
  async getVisaServiceById(id) {
    try {
      const query = `
        SELECT 
          vs.*,
          u.first_name as provider_first_name,
          u.last_name as provider_last_name,
          u.email as provider_email,
          u.phone as provider_phone,
          COUNT(va.id) as application_count
        FROM ${this.tableName} vs
        LEFT JOIN users u ON vs.provider_id = u.id
        LEFT JOIN ${this.applicationTableName} va ON vs.id = va.visa_service_id
        WHERE vs.id = ? AND vs.status = 'active'
        GROUP BY vs.id
      `;

      const result = await executeQuery(query, [id]);
      
      if (result.length === 0) {
        return null;
      }

      const service = result[0];
      return {
        ...service,
        requirements: JSON.parse(service.requirements || '{}'),
        required_documents: JSON.parse(service.required_documents || '[]'),
        fees_breakdown: JSON.parse(service.fees_breakdown || '{}'),
        tags: JSON.parse(service.tags || '[]')
      };
    } catch (error) {
      console.error('Error fetching visa service:', error);
      throw new Error('Failed to fetch visa service');
    }
  }

  // Create new visa service
  async createVisaService(visaData, providerId) {
    try {
      const {
        title,
        description,
        country,
        visa_type,
        duration_days,
        processing_time_days,
        price,
        currency = 'USD',
        requirements,
        required_documents,
        application_process,
        fees_breakdown,
        validity_period,
        entry_type,
        is_urgent_processing = false,
        urgent_processing_fee,
        is_refundable = false,
        refund_policy,
        tags,
        is_featured = false
      } = visaData;

      const query = `
        INSERT INTO ${this.tableName} (
          title, description, country, visa_type, duration_days, processing_time_days,
          price, currency, requirements, required_documents, application_process,
          fees_breakdown, validity_period, entry_type, is_urgent_processing,
          urgent_processing_fee, is_refundable, refund_policy, tags, is_featured,
          provider_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        title, description, country, visa_type, duration_days, processing_time_days,
        price, currency, JSON.stringify(requirements), JSON.stringify(required_documents),
        application_process, JSON.stringify(fees_breakdown), validity_period, entry_type,
        is_urgent_processing, urgent_processing_fee, is_refundable, refund_policy,
        JSON.stringify(tags), is_featured, providerId
      ];

      const result = await executeQuery(query, params);
      return result.insertId;
    } catch (error) {
      console.error('Error creating visa service:', error);
      throw new Error('Failed to create visa service');
    }
  }

  // Update visa service
  async updateVisaService(id, updateData, providerId) {
    try {
      const allowedFields = [
        'title', 'description', 'country', 'visa_type', 'duration_days',
        'processing_time_days', 'price', 'currency', 'requirements',
        'required_documents', 'application_process', 'fees_breakdown',
        'validity_period', 'entry_type', 'is_urgent_processing',
        'urgent_processing_fee', 'is_refundable', 'refund_policy',
        'tags', 'is_featured', 'status'
      ];

      const updateFields = [];
      const params = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          updateFields.push(`${key} = ?`);
          if (['requirements', 'required_documents', 'fees_breakdown', 'tags'].includes(key)) {
            params.push(JSON.stringify(updateData[key]));
          } else {
            params.push(updateData[key]);
          }
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      params.push(id, providerId);

      const query = `
        UPDATE ${this.tableName} 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = ? AND provider_id = ?
      `;

      await executeQuery(query, params);
      return { success: true };
    } catch (error) {
      console.error('Error updating visa service:', error);
      throw new Error('Failed to update visa service');
    }
  }

  // Delete visa service
  async deleteVisaService(id, providerId) {
    try {
      const query = `
        UPDATE ${this.tableName} 
        SET status = 'inactive', updated_at = NOW()
        WHERE id = ? AND provider_id = ?
      `;

      await executeQuery(query, [id, providerId]);
      return { success: true };
    } catch (error) {
      console.error('Error deleting visa service:', error);
      throw new Error('Failed to delete visa service');
    }
  }

  // Create visa application
  async createApplication(applicationData, userId) {
    try {
      const {
        visa_service_id,
        application_data,
        documents = {},
        status = 'draft'
      } = applicationData;

      // Check if user already applied for this visa service
      const existingApplication = await executeQuery(
        `SELECT id FROM ${this.applicationTableName} 
         WHERE visa_service_id = ? AND user_id = ?`,
        [visa_service_id, userId]
      );

      if (existingApplication.length > 0) {
        throw new Error('You have already applied for this visa service');
      }

      // Check if visa service exists and is active
      const visaService = await executeQuery(
        `SELECT * FROM ${this.tableName} WHERE id = ? AND status = 'active'`,
        [visa_service_id]
      );

      if (visaService.length === 0) {
        throw new Error('Visa service not found or not active');
      }

      const query = `
        INSERT INTO ${this.applicationTableName} (
          visa_service_id, user_id, application_data, documents, status
        ) VALUES (?, ?, ?, ?, ?)
      `;

      const params = [
        visa_service_id,
        userId,
        JSON.stringify(application_data),
        JSON.stringify(documents),
        status
      ];

      const result = await executeQuery(query, params);
      return result.insertId;
    } catch (error) {
      console.error('Error creating visa application:', error);
      throw error;
    }
  }

  // Update visa application
  async updateApplication(applicationId, updateData, userId) {
    try {
      const allowedFields = ['application_data', 'documents', 'status'];
      const updateFields = [];
      const params = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          updateFields.push(`${key} = ?`);
          if (['application_data', 'documents'].includes(key)) {
            params.push(JSON.stringify(updateData[key]));
          } else {
            params.push(updateData[key]);
          }
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      // Add status-specific updates
      if (updateData.status === 'submitted') {
        updateFields.push('submitted_at = NOW()');
      }

      params.push(applicationId, userId);

      const query = `
        UPDATE ${this.applicationTableName} 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = ? AND user_id = ?
      `;

      await executeQuery(query, params);
      return { success: true };
    } catch (error) {
      console.error('Error updating visa application:', error);
      throw error;
    }
  }

  // Get user's visa applications
  async getUserApplications(userId, filters = {}) {
    try {
      let query = `
        SELECT 
          va.*,
          vs.title as visa_service_title,
          vs.country,
          vs.visa_type,
          vs.price as visa_fee,
          vs.currency,
          vs.processing_time_days
        FROM ${this.applicationTableName} va
        LEFT JOIN ${this.tableName} vs ON va.visa_service_id = vs.id
        WHERE va.user_id = ?
      `;
      
      const params = [userId];

      if (filters.status) {
        query += ' AND va.status = ?';
        params.push(filters.status);
      }

      query += ' ORDER BY va.created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
      }

      const applications = await executeQuery(query, params);
      
      return applications.map(app => ({
        ...app,
        application_data: JSON.parse(app.application_data || '{}'),
        documents: JSON.parse(app.documents || '{}'),
        visa_fee: parseFloat(app.visa_fee || 0)
      }));
    } catch (error) {
      console.error('Error fetching user applications:', error);
      throw new Error('Failed to fetch visa applications');
    }
  }

  // Calculate service fees for visa application
  async calculateServiceFees(visaServiceId, userId, options = {}) {
    try {
      return await serviceFeeService.calculateVisaServiceFees(visaServiceId, userId, options);
    } catch (error) {
      console.error('Error calculating visa service fees:', error);
      throw error;
    }
  }

  // Apply for visa with service fee processing
  async applyForVisaWithFees(visaServiceId, userId, applicationData, options = {}) {
    try {
      // Calculate service fees
      const feeData = await this.calculateServiceFees(visaServiceId, userId, options);
      
      // Create service fee transaction
      const feeTransaction = await serviceFeeService.createServiceFeeTransaction(
        feeData,
        userId,
        'visa',
        visaServiceId
      );

      // Create visa application
      const applicationId = await this.createApplication({
        visa_service_id: visaServiceId,
        application_data: applicationData,
        documents: options.documents || {},
        status: options.submitImmediately ? 'submitted' : 'draft'
      }, userId);

      return {
        application_id: applicationId,
        fee_transaction_id: feeTransaction.transaction_id,
        total_fee: feeData.total_fee,
        currency: feeData.currency,
        fee_breakdown: feeData.breakdown,
        status: 'pending_payment'
      };
    } catch (error) {
      console.error('Error applying for visa with fees:', error);
      throw error;
    }
  }

  // Process visa application payment
  async processApplicationPayment(transactionId, paymentData) {
    try {
      // Update service fee transaction
      await serviceFeeService.updateServiceFeeTransaction(transactionId, {
        status: 'completed',
        payment_method: paymentData.payment_method,
        external_transaction_id: paymentData.external_transaction_id,
        payment_details: paymentData.payment_details
      });

      // Get transaction details
      const transaction = await serviceFeeService.getServiceFeeTransaction(transactionId);
      
      // Update visa application status if payment successful
      if (paymentData.status === 'completed') {
        await executeQuery(
          `UPDATE ${this.applicationTableName} 
           SET status = 'submitted', submitted_at = NOW() 
           WHERE visa_service_id = ? AND user_id = ?`,
          [transaction.service_id, transaction.user_id]
        );
      }

      return {
        success: true,
        transaction_id: transactionId,
        application_status: paymentData.status === 'completed' ? 'submitted' : 'pending_payment'
      };
    } catch (error) {
      console.error('Error processing visa application payment:', error);
      throw error;
    }
  }

  // Get visa service with service fee information
  async getVisaServiceWithFees(visaServiceId, userId) {
    try {
      const visaService = await this.getVisaServiceById(visaServiceId);
      
      if (!visaService) {
        throw new Error('Visa service not found');
      }

      // Calculate estimated service fees
      const estimatedFees = await this.calculateServiceFees(visaServiceId, userId, {
        includeConsultation: false,
        urgentProcessing: false,
        includeDocumentReview: false
      });

      return {
        ...visaService,
        service_fees: {
          estimated: estimatedFees,
          note: 'Final fees may vary based on selected services'
        }
      };
    } catch (error) {
      console.error('Error getting visa service with fees:', error);
      throw error;
    }
  }

  // Get user's visa applications with fee information
  async getUserApplicationsWithFees(userId, filters = {}) {
    try {
      let query = `
        SELECT 
          va.*,
          vs.title as visa_service_title,
          vs.country,
          vs.visa_type,
          vs.price as visa_fee,
          vs.currency,
          vs.processing_time_days,
          sft.id as fee_transaction_id,
          sft.total_amount as service_fee,
          sft.status as payment_status,
          sft.created_at as fee_created_at
        FROM ${this.applicationTableName} va
        LEFT JOIN ${this.tableName} vs ON va.visa_service_id = vs.id
        LEFT JOIN service_fee_transactions sft ON sft.service_id = va.visa_service_id 
          AND sft.user_id = va.user_id 
          AND sft.service_type = 'visa'
        WHERE va.user_id = ?
      `;
      
      const params = [userId];

      if (filters.status) {
        query += ' AND va.status = ?';
        params.push(filters.status);
      }

      query += ' ORDER BY va.created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
      }

      const applications = await executeQuery(query, params);
      
      return applications.map(app => ({
        ...app,
        application_data: JSON.parse(app.application_data || '{}'),
        documents: JSON.parse(app.documents || '{}'),
        visa_fee: parseFloat(app.visa_fee || 0),
        service_fee: parseFloat(app.service_fee || 0)
      }));
    } catch (error) {
      console.error('Error getting user visa applications with fees:', error);
      throw error;
    }
  }

  // Get visa service statistics
  async getVisaServiceStats(providerId = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_services,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_services,
          COUNT(CASE WHEN is_featured = 1 THEN 1 END) as featured_services,
          AVG(price) as average_price,
          AVG(processing_time_days) as average_processing_time,
          COUNT(CASE WHEN is_urgent_processing = 1 THEN 1 END) as urgent_services
        FROM ${this.tableName}
      `;
      
      const params = [];
      if (providerId) {
        query += ' WHERE provider_id = ?';
        params.push(providerId);
      }

      const stats = await executeQuery(query, params);
      return stats[0];
    } catch (error) {
      console.error('Error fetching visa service stats:', error);
      throw new Error('Failed to fetch visa service statistics');
    }
  }
}

module.exports = new VisaService();
