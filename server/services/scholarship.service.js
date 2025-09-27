const { executeQuery } = require('../config/database');
const serviceFeeService = require('./service-fee.service');

class ScholarshipService {
  constructor() {
    this.tableName = 'scholarships';
    this.applicationTableName = 'scholarship_applications';
  }

  // Helper method to safely parse JSON fields
  parseJSONField(field, defaultValue) {
    if (!field) return defaultValue;
    try {
      return JSON.parse(field);
    } catch (error) {
      console.warn('Failed to parse JSON field:', field, error.message);
      return defaultValue;
    }
  }

  // Get all scholarships with filters
  async getScholarships(filters = {}) {
    try {
      let query = `
        SELECT 
          s.*,
          u.first_name as provider_first_name,
          u.last_name as provider_last_name,
          u.email as provider_email,
          COUNT(sa.id) as application_count
        FROM ${this.tableName} s
        LEFT JOIN users u ON s.provider_id = u.id
        LEFT JOIN ${this.applicationTableName} sa ON s.id = sa.scholarship_id
        WHERE s.status = 'active'
      `;
      
      const params = [];
      const conditions = [];

      // Apply filters
      if (filters.country) {
        conditions.push('s.country = ?');
        params.push(filters.country);
      }

      if (filters.degree_level) {
        conditions.push('s.degree_level = ?');
        params.push(filters.degree_level);
      }

      if (filters.field_of_study) {
        conditions.push('JSON_CONTAINS(s.field_of_study, ?)');
        params.push(JSON.stringify(filters.field_of_study));
      }

      if (filters.min_amount) {
        conditions.push('s.amount >= ?');
        params.push(filters.min_amount);
      }

      if (filters.max_amount) {
        conditions.push('s.amount <= ?');
        params.push(filters.max_amount);
      }

      if (filters.provider_type) {
        conditions.push('s.provider_type = ?');
        params.push(filters.provider_type);
      }

      if (filters.is_featured !== undefined) {
        conditions.push('s.is_featured = ?');
        params.push(filters.is_featured);
      }

      if (filters.deadline_before) {
        conditions.push('s.application_deadline <= ?');
        params.push(filters.deadline_before);
      }

      if (filters.provider_id) {
        conditions.push('s.provider_id = ?');
        params.push(filters.provider_id);
      }

      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }

      query += ' GROUP BY s.id';

      // Add sorting
      if (filters.sort_by) {
        switch (filters.sort_by) {
          case 'deadline':
            query += ' ORDER BY s.application_deadline ASC';
            break;
          case 'amount':
            query += ' ORDER BY s.amount DESC';
            break;
          case 'featured':
            query += ' ORDER BY s.is_featured DESC, s.created_at DESC';
            break;
          case 'popular':
            query += ' ORDER BY application_count DESC';
            break;
          default:
            query += ' ORDER BY s.created_at DESC';
        }
      } else {
        query += ' ORDER BY s.is_featured DESC, s.created_at DESC';
      }

      // Add pagination
      const limit = filters.limit && !isNaN(filters.limit) ? parseInt(filters.limit) : 20;
      query += ` LIMIT ${limit}`;
      
      if (filters.offset && !isNaN(filters.offset)) {
        query += ` OFFSET ${parseInt(filters.offset)}`;
      }

      const scholarships = await executeQuery(query, params);
      
      // Process scholarships data
      return scholarships.map(scholarship => ({
        ...scholarship,
        field_of_study: this.parseJSONField(scholarship.field_of_study, []),
        eligibility_criteria: this.parseJSONField(scholarship.eligibility_criteria, {}),
        required_documents: this.parseJSONField(scholarship.required_documents, []),
        language_requirements: this.parseJSONField(scholarship.language_requirements, {}),
        nationality_restrictions: this.parseJSONField(scholarship.nationality_restrictions, []),
        tags: this.parseJSONField(scholarship.tags, [])
      }));
    } catch (error) {
      console.error('Error fetching scholarships:', error);
      throw new Error('Failed to fetch scholarships');
    }
  }

  // Get scholarship by ID
  async getScholarshipById(id) {
    try {
      const query = `
        SELECT 
          s.*,
          u.first_name as provider_first_name,
          u.last_name as provider_last_name,
          u.email as provider_email,
          u.phone as provider_phone,
          COUNT(sa.id) as application_count
        FROM ${this.tableName} s
        LEFT JOIN users u ON s.provider_id = u.id
        LEFT JOIN ${this.applicationTableName} sa ON s.id = sa.scholarship_id
        WHERE s.id = ?
        GROUP BY s.id
      `;

      const results = await executeQuery(query, [id]);
      
      if (results.length === 0) {
        return null;
      }

      const scholarship = results[0];
      
      return {
        ...scholarship,
        field_of_study: this.parseJSONField(scholarship.field_of_study, []),
        eligibility_criteria: this.parseJSONField(scholarship.eligibility_criteria, {}),
        required_documents: this.parseJSONField(scholarship.required_documents, []),
        language_requirements: this.parseJSONField(scholarship.language_requirements, {}),
        nationality_restrictions: this.parseJSONField(scholarship.nationality_restrictions, []),
        tags: this.parseJSONField(scholarship.tags, [])
      };
    } catch (error) {
      console.error('Error fetching scholarship:', error);
      throw new Error('Failed to fetch scholarship');
    }
  }

  // Create new scholarship
  async createScholarship(scholarshipData, providerId) {
    try {
      const {
        title,
        description,
        provider_name,
        provider_type,
        amount,
        currency = 'USD',
        amount_type,
        country,
        university,
        degree_level,
        field_of_study,
        application_deadline,
        start_date,
        duration_months,
        eligibility_criteria,
        required_documents,
        application_process,
        website_url,
        contact_email,
        tags,
        is_merit_based = false,
        is_need_based = false,
        is_athletic = false,
        is_artistic = false,
        gpa_requirement,
        language_requirements,
        nationality_restrictions,
        age_limit_min,
        age_limit_max,
        application_fee = 0.00,
        is_featured = false,
        max_applications
      } = scholarshipData;

      const query = `
        INSERT INTO ${this.tableName} (
          title, description, provider_name, provider_type, amount, currency,
          amount_type, country, university, degree_level, field_of_study,
          application_deadline, start_date, duration_months, eligibility_criteria,
          required_documents, application_process, website_url, contact_email,
          tags, is_merit_based, is_need_based, is_athletic, is_artistic,
          gpa_requirement, language_requirements, nationality_restrictions,
          age_limit_min, age_limit_max, application_fee, is_featured,
          max_applications, provider_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        title, description, provider_name, provider_type, amount, currency,
        amount_type, country, university, degree_level, JSON.stringify(field_of_study || []),
        application_deadline, start_date, duration_months, JSON.stringify(eligibility_criteria || {}),
        JSON.stringify(required_documents || []), application_process, website_url, contact_email,
        JSON.stringify(tags || []), is_merit_based, is_need_based, is_athletic, is_artistic,
        gpa_requirement, JSON.stringify(language_requirements || {}), JSON.stringify(nationality_restrictions || []),
        age_limit_min, age_limit_max, application_fee, is_featured,
        max_applications, providerId
      ];

      const result = await executeQuery(query, params);
      return result.insertId;
    } catch (error) {
      console.error('Error creating scholarship:', error);
      throw new Error('Failed to create scholarship');
    }
  }

  // Update scholarship
  async updateScholarship(id, updateData, providerId) {
    try {
      const allowedFields = [
        'title', 'description', 'amount', 'currency', 'amount_type',
        'country', 'university', 'degree_level', 'field_of_study',
        'application_deadline', 'start_date', 'duration_months',
        'eligibility_criteria', 'required_documents', 'application_process',
        'website_url', 'contact_email', 'tags', 'is_merit_based',
        'is_need_based', 'is_athletic', 'is_artistic', 'gpa_requirement',
        'language_requirements', 'nationality_restrictions', 'age_limit_min',
        'age_limit_max', 'application_fee', 'is_featured', 'max_applications',
        'status'
      ];

      const updateFields = [];
      const params = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key)) {
          if (['field_of_study', 'eligibility_criteria', 'required_documents', 
               'language_requirements', 'nationality_restrictions', 'tags'].includes(key)) {
            updateFields.push(`${key} = ?`);
            params.push(JSON.stringify(value));
          } else {
            updateFields.push(`${key} = ?`);
            params.push(value);
          }
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      params.push(id, providerId);

      const query = `
        UPDATE ${this.tableName} 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND provider_id = ?
      `;

      const result = await executeQuery(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating scholarship:', error);
      throw new Error('Failed to update scholarship');
    }
  }

  // Delete scholarship
  async deleteScholarship(id, providerId) {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE id = ? AND provider_id = ?`;
      const result = await executeQuery(query, [id, providerId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting scholarship:', error);
      throw new Error('Failed to delete scholarship');
    }
  }

  // Get featured scholarships
  async getFeaturedScholarships(limit = 10) {
    try {
      return await this.getScholarships({
        is_featured: true,
        limit: limit,
        sort_by: 'featured'
      });
    } catch (error) {
      console.error('Error fetching featured scholarships:', error);
      throw new Error('Failed to fetch featured scholarships');
    }
  }

  // Get trending scholarships (most applications)
  async getTrendingScholarships(limit = 10) {
    try {
      return await this.getScholarships({
        limit: limit,
        sort_by: 'popular'
      });
    } catch (error) {
      console.error('Error fetching trending scholarships:', error);
      throw new Error('Failed to fetch trending scholarships');
    }
  }

  // Get scholarships by provider
  async getScholarshipsByProvider(providerId, filters = {}) {
    try {
      return await this.getScholarships({
        ...filters,
        provider_id: providerId
      });
    } catch (error) {
      console.error('Error fetching provider scholarships:', error);
      throw new Error('Failed to fetch provider scholarships');
    }
  }

  // Search scholarships
  async searchScholarships(searchTerm, filters = {}) {
    try {
      let query = `
        SELECT 
          s.*,
          u.first_name as provider_first_name,
          u.last_name as provider_last_name,
          u.email as provider_email,
          COUNT(sa.id) as application_count
        FROM ${this.tableName} s
        LEFT JOIN users u ON s.provider_id = u.id
        LEFT JOIN ${this.applicationTableName} sa ON s.id = sa.scholarship_id
        WHERE s.status = 'active' AND (
          s.title LIKE ? OR 
          s.description LIKE ? OR 
          s.provider_name LIKE ? OR 
          s.university LIKE ? OR
          s.country LIKE ?
        )
      `;
      
      const params = [
        `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, 
        `%${searchTerm}%`, `%${searchTerm}%`
      ];

      // Apply additional filters
      const conditions = [];
      if (filters.country) {
        conditions.push('s.country = ?');
        params.push(filters.country);
      }

      if (filters.degree_level) {
        conditions.push('s.degree_level = ?');
        params.push(filters.degree_level);
      }

      if (filters.provider_id) {
        conditions.push('s.provider_id = ?');
        params.push(filters.provider_id);
      }

      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }

      query += ' GROUP BY s.id ORDER BY s.is_featured DESC, s.created_at DESC';

      const limit = filters.limit && !isNaN(filters.limit) ? parseInt(filters.limit) : 20;
      query += ` LIMIT ${limit}`;

      const scholarships = await executeQuery(query, params);
      
      return scholarships.map(scholarship => ({
        ...scholarship,
        field_of_study: this.parseJSONField(scholarship.field_of_study, []),
        eligibility_criteria: this.parseJSONField(scholarship.eligibility_criteria, {}),
        required_documents: this.parseJSONField(scholarship.required_documents, []),
        language_requirements: this.parseJSONField(scholarship.language_requirements, {}),
        nationality_restrictions: this.parseJSONField(scholarship.nationality_restrictions, []),
        tags: this.parseJSONField(scholarship.tags, [])
      }));
    } catch (error) {
      console.error('Error searching scholarships:', error);
      throw new Error('Failed to search scholarships');
    }
  }

  // Get scholarship statistics
  async getScholarshipStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_scholarships,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_scholarships,
          COUNT(CASE WHEN is_featured = 1 THEN 1 END) as featured_scholarships,
          AVG(amount) as average_amount,
          COUNT(DISTINCT country) as countries_count,
          COUNT(DISTINCT provider_type) as provider_types_count
        FROM ${this.tableName}
      `;

      const stats = await executeQuery(query);
      return stats[0];
    } catch (error) {
      console.error('Error fetching scholarship stats:', error);
      throw new Error('Failed to fetch scholarship statistics');
    }
  }

  // Calculate service fees for scholarship application
  async calculateServiceFees(scholarshipId, userId, options = {}) {
    try {
      return await serviceFeeService.calculateScholarshipServiceFees(scholarshipId, userId, options);
    } catch (error) {
      console.error('Error calculating scholarship service fees:', error);
      throw error;
    }
  }

  // Apply to scholarship with service fee processing
  async applyToScholarshipWithFees(scholarshipId, userId, applicationData, options = {}) {
    try {
      // Calculate service fees
      const feeData = await this.calculateServiceFees(scholarshipId, userId, options);
      
      // Create service fee transaction
      const feeTransaction = await serviceFeeService.createServiceFeeTransaction(
        feeData,
        userId,
        'scholarship',
        scholarshipId
      );

      // Create scholarship application
      const applicationId = await this.createApplication({
        scholarship_id: scholarshipId,
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
      console.error('Error applying to scholarship with fees:', error);
      throw error;
    }
  }

  // Process scholarship application payment
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
      
      // Update scholarship application status if payment successful
      if (paymentData.status === 'completed') {
        await executeQuery(
          `UPDATE ${this.applicationTableName} 
           SET status = 'submitted', submitted_at = NOW() 
           WHERE scholarship_id = ? AND user_id = ?`,
          [transaction.service_id, transaction.user_id]
        );
      }

      return {
        success: true,
        transaction_id: transactionId,
        application_status: paymentData.status === 'completed' ? 'submitted' : 'pending_payment'
      };
    } catch (error) {
      console.error('Error processing application payment:', error);
      throw error;
    }
  }

  // Get scholarship with service fee information
  async getScholarshipWithFees(scholarshipId, userId) {
    try {
      const scholarship = await this.getScholarshipById(scholarshipId);
      
      if (!scholarship) {
        throw new Error('Scholarship not found');
      }

      // Calculate estimated service fees
      const estimatedFees = await this.calculateServiceFees(scholarshipId, userId, {
        includeConsultation: false,
        expeditedProcessing: false,
        includeDocumentReview: false
      });

      return {
        ...scholarship,
        service_fees: {
          estimated: estimatedFees,
          note: 'Final fees may vary based on selected services'
        }
      };
    } catch (error) {
      console.error('Error getting scholarship with fees:', error);
      throw error;
    }
  }

  // Get user's scholarship applications with fee information
  async getUserApplicationsWithFees(userId, filters = {}) {
    try {
      let query = `
        SELECT 
          sa.*,
          s.title as scholarship_title,
          s.provider_name,
          s.amount as scholarship_amount,
          s.currency,
          sft.id as fee_transaction_id,
          sft.total_amount as service_fee,
          sft.status as payment_status,
          sft.created_at as fee_created_at
        FROM ${this.applicationTableName} sa
        LEFT JOIN ${this.tableName} s ON sa.scholarship_id = s.id
        LEFT JOIN service_fee_transactions sft ON sft.service_id = sa.scholarship_id 
          AND sft.user_id = sa.user_id 
          AND sft.service_type = 'scholarship'
        WHERE sa.user_id = ?
      `;
      
      const params = [userId];

      if (filters.status) {
        query += ' AND sa.status = ?';
        params.push(filters.status);
      }

      query += ' ORDER BY sa.created_at DESC';

      const limit = filters.limit && !isNaN(filters.limit) ? filters.limit : 20;
      query += ' LIMIT ?';
      params.push(limit);

      const applications = await executeQuery(query, params);
      
      return applications.map(app => ({
        ...app,
        application_data: JSON.parse(app.application_data || '{}'),
        documents: JSON.parse(app.documents || '{}'),
        scholarship_amount: parseFloat(app.scholarship_amount || 0),
        service_fee: parseFloat(app.service_fee || 0)
      }));
    } catch (error) {
      console.error('Error getting user applications with fees:', error);
      throw error;
    }
  }
}

module.exports = new ScholarshipService();
