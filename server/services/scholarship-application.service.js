const { executeQuery } = require('../config/database');

class ScholarshipApplicationService {
  constructor() {
    this.tableName = 'scholarship_applications';
    this.scholarshipTableName = 'scholarships';
  }

  // Create new application
  async createApplication(applicationData, userId) {
    try {
      const {
        scholarship_id,
        application_data,
        documents = {},
        status = 'draft'
      } = applicationData;

      // Check if user already applied for this scholarship
      const existingApplication = await this.getUserApplication(scholarship_id, userId);
      if (existingApplication) {
        throw new Error('You have already applied for this scholarship');
      }

      // Check if scholarship exists and is active
      const scholarship = await executeQuery(
        `SELECT * FROM ${this.scholarshipTableName} WHERE id = ? AND status = 'active'`,
        [scholarship_id]
      );

      if (scholarship.length === 0) {
        throw new Error('Scholarship not found or not active');
      }

      // Check if scholarship has reached max applications
      if (scholarship[0].max_applications) {
        const currentApplications = await executeQuery(
          `SELECT COUNT(*) as count FROM ${this.tableName} WHERE scholarship_id = ? AND status != 'withdrawn'`,
          [scholarship_id]
        );

        if (currentApplications[0].count >= scholarship[0].max_applications) {
          throw new Error('This scholarship has reached maximum applications');
        }
      }

      const query = `
        INSERT INTO ${this.tableName} (
          scholarship_id, user_id, application_data, documents, status
        ) VALUES (?, ?, ?, ?, ?)
      `;

      const params = [
        scholarship_id,
        userId,
        JSON.stringify(application_data),
        JSON.stringify(documents),
        status
      ];

      const result = await executeQuery(query, params);
      return result.insertId;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }

  // Update application
  async updateApplication(applicationId, updateData, userId) {
    try {
      const allowedFields = ['application_data', 'documents', 'status'];
      const updateFields = [];
      const params = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key)) {
          if (key === 'application_data' || key === 'documents') {
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

      // Add timestamp for status changes
      if (updateData.status === 'submitted') {
        updateFields.push('submitted_at = CURRENT_TIMESTAMP');
      }

      params.push(applicationId, userId);

      const query = `
        UPDATE ${this.tableName} 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `;

      const result = await executeQuery(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating application:', error);
      throw new Error('Failed to update application');
    }
  }

  // Get user's application for a specific scholarship
  async getUserApplication(scholarshipId, userId) {
    try {
      const query = `
        SELECT 
          sa.*,
          s.title as scholarship_title,
          s.provider_name,
          s.country,
          s.university,
          s.application_deadline
        FROM ${this.tableName} sa
        JOIN ${this.scholarshipTableName} s ON sa.scholarship_id = s.id
        WHERE sa.scholarship_id = ? AND sa.user_id = ?
      `;

      const results = await executeQuery(query, [scholarshipId, userId]);
      
      if (results.length === 0) {
        return null;
      }

      const application = results[0];
      return {
        ...application,
        application_data: JSON.parse(application.application_data || '{}'),
        documents: JSON.parse(application.documents || '{}')
      };
    } catch (error) {
      console.error('Error fetching user application:', error);
      throw new Error('Failed to fetch application');
    }
  }

  // Get all applications by user
  async getUserApplications(userId, filters = {}) {
    try {
      let query = `
        SELECT 
          sa.*,
          s.title as scholarship_title,
          s.provider_name,
          s.country,
          s.university,
          s.application_deadline,
          s.amount,
          s.currency
        FROM ${this.tableName} sa
        JOIN ${this.scholarshipTableName} s ON sa.scholarship_id = s.id
        WHERE sa.user_id = ?
      `;

      const params = [userId];
      const conditions = [];

      if (filters.status) {
        conditions.push('sa.status = ?');
        params.push(filters.status);
      }

      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }

      query += ' ORDER BY sa.created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
        
        if (filters.offset) {
          query += ' OFFSET ?';
          params.push(filters.offset);
        }
      }

      const applications = await executeQuery(query, params);
      
      return applications.map(application => ({
        ...application,
        application_data: JSON.parse(application.application_data || '{}'),
        documents: JSON.parse(application.documents || '{}')
      }));
    } catch (error) {
      console.error('Error fetching user applications:', error);
      throw new Error('Failed to fetch user applications');
    }
  }

  // Get applications for a scholarship (provider view)
  async getScholarshipApplications(scholarshipId, providerId, filters = {}) {
    try {
      // Verify provider owns the scholarship
      const scholarship = await executeQuery(
        `SELECT id FROM ${this.scholarshipTableName} WHERE id = ? AND provider_id = ?`,
        [scholarshipId, providerId]
      );

      if (scholarship.length === 0) {
        throw new Error('Scholarship not found or access denied');
      }

      let query = `
        SELECT 
          sa.*,
          u.first_name,
          u.last_name,
          u.email,
          u.phone,
          u.nationality,
          u.date_of_birth,
          u.education,
          u.work_experience
        FROM ${this.tableName} sa
        JOIN users u ON sa.user_id = u.id
        WHERE sa.scholarship_id = ?
      `;

      const params = [scholarshipId];
      const conditions = [];

      if (filters.status) {
        conditions.push('sa.status = ?');
        params.push(filters.status);
      }

      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }

      query += ' ORDER BY sa.submitted_at DESC, sa.created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
        
        if (filters.offset) {
          query += ' OFFSET ?';
          params.push(filters.offset);
        }
      }

      const applications = await executeQuery(query, params);
      
      return applications.map(application => ({
        ...application,
        application_data: JSON.parse(application.application_data || '{}'),
        documents: JSON.parse(application.documents || '{}'),
        education: JSON.parse(application.education || '{}'),
        work_experience: JSON.parse(application.work_experience || '{}')
      }));
    } catch (error) {
      console.error('Error fetching scholarship applications:', error);
      throw error;
    }
  }

  // Update application status (provider action)
  async updateApplicationStatus(applicationId, status, reviewNotes, reviewerId, providerId) {
    try {
      // Verify provider has access to this application
      const application = await executeQuery(`
        SELECT sa.id 
        FROM ${this.tableName} sa
        JOIN ${this.scholarshipTableName} s ON sa.scholarship_id = s.id
        WHERE sa.id = ? AND s.provider_id = ?
      `, [applicationId, providerId]);

      if (application.length === 0) {
        throw new Error('Application not found or access denied');
      }

      const query = `
        UPDATE ${this.tableName} 
        SET status = ?, review_notes = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const result = await executeQuery(query, [status, reviewNotes, reviewerId, applicationId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw new Error('Failed to update application status');
    }
  }

  // Withdraw application
  async withdrawApplication(applicationId, userId) {
    try {
      const query = `
        UPDATE ${this.tableName} 
        SET status = 'withdrawn', updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `;

      const result = await executeQuery(query, [applicationId, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error withdrawing application:', error);
      throw new Error('Failed to withdraw application');
    }
  }

  // Get application statistics
  async getApplicationStats(userId = null, providerId = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_applications,
          COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted_applications,
          COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review_applications,
          COUNT(CASE WHEN status = 'shortlisted' THEN 1 END) as shortlisted_applications,
          COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_applications,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_applications,
          COUNT(CASE WHEN status = 'withdrawn' THEN 1 END) as withdrawn_applications
        FROM ${this.tableName} sa
      `;

      const params = [];
      const conditions = [];

      if (userId) {
        conditions.push('sa.user_id = ?');
        params.push(userId);
      }

      if (providerId) {
        conditions.push('s.provider_id = ?');
        params.push(providerId);
        query += ' JOIN scholarships s ON sa.scholarship_id = s.id';
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      const stats = await executeQuery(query, params);
      return stats[0];
    } catch (error) {
      console.error('Error fetching application stats:', error);
      throw new Error('Failed to fetch application statistics');
    }
  }

  // Get application by ID
  async getApplicationById(applicationId, userId = null, providerId = null) {
    try {
      let query = `
        SELECT 
          sa.*,
          s.title as scholarship_title,
          s.provider_name,
          s.country,
          s.university,
          u.first_name,
          u.last_name,
          u.email,
          u.phone,
          u.nationality,
          u.date_of_birth,
          u.education,
          u.work_experience
        FROM ${this.tableName} sa
        JOIN ${this.scholarshipTableName} s ON sa.scholarship_id = s.id
        JOIN users u ON sa.user_id = u.id
        WHERE sa.id = ?
      `;

      const params = [applicationId];
      const conditions = [];

      if (userId) {
        conditions.push('sa.user_id = ?');
        params.push(userId);
      }

      if (providerId) {
        conditions.push('s.provider_id = ?');
        params.push(providerId);
      }

      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }

      const results = await executeQuery(query, params);
      
      if (results.length === 0) {
        return null;
      }

      const application = results[0];
      return {
        ...application,
        application_data: JSON.parse(application.application_data || '{}'),
        documents: JSON.parse(application.documents || '{}'),
        education: JSON.parse(application.education || '{}'),
        work_experience: JSON.parse(application.work_experience || '{}')
      };
    } catch (error) {
      console.error('Error fetching application:', error);
      throw new Error('Failed to fetch application');
    }
  }
}

module.exports = new ScholarshipApplicationService();
