const { executeQuery } = require('../config/database');

class VisaOfficerService {
  // Get visa officer dashboard
  async getDashboard(userId) {
    try {
      const pendingCount = await executeQuery(
        `SELECT COUNT(*) as count FROM visa_applications WHERE status = 'under_review'`
      );

      const todayCount = await executeQuery(
        `SELECT COUNT(*) as count FROM visa_applications 
         WHERE DATE(updated_at) = CURDATE() AND reviewed_by = ?`,
        [userId]
      );

      const weeklyStats = await executeQuery(
        `SELECT 
           COUNT(*) as total_reviewed,
           SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
           SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
         FROM visa_applications 
         WHERE reviewed_by = ? AND updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
        [userId]
      );

      const recentApplications = await executeQuery(
        `SELECT va.*, vs.title as service_title, vs.country, vs.visa_type,
                u.first_name, u.last_name, u.email
         FROM visa_applications va
         JOIN visa_services vs ON va.visa_service_id = vs.id
         JOIN users u ON va.user_id = u.id
         WHERE va.status = 'under_review'
         ORDER BY va.submitted_at ASC
         LIMIT 10`
      );

      return {
        pending_applications: pendingCount[0].count,
        today_reviewed: todayCount[0].count,
        weekly_stats: weeklyStats[0],
        recent_applications: recentApplications
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard: ${error.message}`);
    }
  }

  // Get all visa applications
  async getVisaApplications(page = 1, limit = 20, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE 1=1';
      const queryParams = [];

      if (filters.status) {
        whereClause += ' AND va.status = ?';
        queryParams.push(filters.status);
      }

      if (filters.country) {
        whereClause += ' AND vs.country = ?';
        queryParams.push(filters.country);
      }

      if (filters.visa_type) {
        whereClause += ' AND vs.visa_type = ?';
        queryParams.push(filters.visa_type);
      }

      if (filters.submitted_from) {
        whereClause += ' AND va.submitted_at >= ?';
        queryParams.push(filters.submitted_from);
      }

      if (filters.submitted_to) {
        whereClause += ' AND va.submitted_at <= ?';
        queryParams.push(filters.submitted_to);
      }

      if (filters.reviewed_by) {
        whereClause += ' AND va.reviewed_by = ?';
        queryParams.push(filters.reviewed_by);
      }

      const rows = await executeQuery(
        `SELECT va.*, vs.title as service_title, vs.country, vs.visa_type,
                u.first_name, u.last_name, u.email,
                reviewer.first_name as reviewer_first_name, reviewer.last_name as reviewer_last_name
         FROM visa_applications va
         JOIN visa_services vs ON va.visa_service_id = vs.id
         JOIN users u ON va.user_id = u.id
         LEFT JOIN users reviewer ON va.reviewed_by = reviewer.id
         ${whereClause}
         ORDER BY va.submitted_at DESC
         LIMIT ? OFFSET ?`,
        [...queryParams, limit, offset]
      );

      // Parse JSON fields
      rows.forEach(row => {
        row.application_data = JSON.parse(row.application_data || '{}');
        row.documents = JSON.parse(row.documents || '{}');
        row.review_comments = JSON.parse(row.review_comments || '[]');
      });

      // Get total count
      const countResult = await executeQuery(
        `SELECT COUNT(*) as total FROM visa_applications va
         JOIN visa_services vs ON va.visa_service_id = vs.id
         ${whereClause}`,
        queryParams
      );

      return {
        applications: rows,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get visa applications: ${error.message}`);
    }
  }

  // Get visa application by ID
  async getVisaApplicationById(applicationId) {
    try {
      const rows = await executeQuery(
        `SELECT va.*, vs.title as service_title, vs.country, vs.visa_type, vs.description,
                u.first_name, u.last_name, u.email, u.phone, u.date_of_birth, u.nationality,
                reviewer.first_name as reviewer_first_name, reviewer.last_name as reviewer_last_name
         FROM visa_applications va
         JOIN visa_services vs ON va.visa_service_id = vs.id
         JOIN users u ON va.user_id = u.id
         LEFT JOIN users reviewer ON va.reviewed_by = reviewer.id
         WHERE va.id = ?`,
        [applicationId]
      );

      if (rows[0]) {
        rows[0].application_data = JSON.parse(rows[0].application_data || '{}');
        rows[0].documents = JSON.parse(rows[0].documents || '{}');
        rows[0].review_comments = JSON.parse(rows[0].review_comments || '[]');
      }

      return rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to get visa application: ${error.message}`);
    }
  }

  // Review visa application
  async reviewVisaApplication(applicationId, officerId, status, comments, requiredActions) {
    try {
      const reviewComment = {
        officer_id: officerId,
        status: status,
        comments: comments,
        required_actions: requiredActions,
        timestamp: new Date().toISOString()
      };

      const result = await executeQuery(
        `UPDATE visa_applications 
         SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP,
             review_comments = JSON_ARRAY_APPEND(COALESCE(review_comments, JSON_ARRAY()), '$', ?)
         WHERE id = ?`,
        [status, officerId, JSON.stringify(reviewComment), applicationId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to review visa application: ${error.message}`);
    }
  }

  // Request additional documents
  async requestAdditionalDocuments(applicationId, officerId, requiredDocuments, deadline, message) {
    try {
      const documentRequest = {
        officer_id: officerId,
        required_documents: requiredDocuments,
        deadline: deadline,
        message: message,
        timestamp: new Date().toISOString()
      };

      const result = await executeQuery(
        `UPDATE visa_applications 
         SET status = 'under_review',
             review_comments = JSON_ARRAY_APPEND(COALESCE(review_comments, JSON_ARRAY()), '$', ?)
         WHERE id = ?`,
        [JSON.stringify(documentRequest), applicationId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to request additional documents: ${error.message}`);
    }
  }

  // Approve visa application
  async approveVisaApplication(applicationId, officerId, approvalDetails, validityPeriod, conditions) {
    try {
      const approvalData = {
        officer_id: officerId,
        approval_details: approvalDetails,
        validity_period: validityPeriod,
        conditions: conditions,
        timestamp: new Date().toISOString()
      };

      const result = await executeQuery(
        `UPDATE visa_applications 
         SET status = 'approved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP,
             review_comments = JSON_ARRAY_APPEND(COALESCE(review_comments, JSON_ARRAY()), '$', ?)
         WHERE id = ?`,
        [officerId, JSON.stringify(approvalData), applicationId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to approve visa application: ${error.message}`);
    }
  }

  // Reject visa application
  async rejectVisaApplication(applicationId, officerId, rejectionReason, rejectionCode, appealInstructions) {
    try {
      const rejectionData = {
        officer_id: officerId,
        rejection_reason: rejectionReason,
        rejection_code: rejectionCode,
        appeal_instructions: appealInstructions,
        timestamp: new Date().toISOString()
      };

      const result = await executeQuery(
        `UPDATE visa_applications 
         SET status = 'rejected', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP,
             review_comments = JSON_ARRAY_APPEND(COALESCE(review_comments, JSON_ARRAY()), '$', ?)
         WHERE id = ?`,
        [officerId, JSON.stringify(rejectionData), applicationId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to reject visa application: ${error.message}`);
    }
  }

  // Get visa application statistics
  async getVisaApplicationStats(startDate, endDate, period = 'monthly') {
    try {
      let dateFormat = '%Y-%m';
      if (period === 'daily') {
        dateFormat = '%Y-%m-%d';
      } else if (period === 'weekly') {
        dateFormat = '%Y-%u';
      } else if (period === 'yearly') {
        dateFormat = '%Y';
      }

      let whereClause = 'WHERE 1=1';
      const queryParams = [];

      if (startDate) {
        whereClause += ' AND submitted_at >= ?';
        queryParams.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND submitted_at <= ?';
        queryParams.push(endDate);
      }

      const statusStats = await executeQuery(
        `SELECT 
           status,
           COUNT(*) as count
         FROM visa_applications 
         ${whereClause}
         GROUP BY status`,
        queryParams
      );

      const periodStats = await executeQuery(
        `SELECT 
           DATE_FORMAT(submitted_at, '${dateFormat}') as period,
           COUNT(*) as total_applications,
           SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
           SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
           SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as pending
         FROM visa_applications 
         ${whereClause}
         GROUP BY DATE_FORMAT(submitted_at, '${dateFormat}')
         ORDER BY period DESC`,
        queryParams
      );

      const countryStats = await executeQuery(
        `SELECT 
           vs.country,
           COUNT(*) as applications,
           SUM(CASE WHEN va.status = 'approved' THEN 1 ELSE 0 END) as approved,
           SUM(CASE WHEN va.status = 'rejected' THEN 1 ELSE 0 END) as rejected
         FROM visa_applications va
         JOIN visa_services vs ON va.visa_service_id = vs.id
         ${whereClause}
         GROUP BY vs.country
         ORDER BY applications DESC`,
        queryParams
      );

      return {
        status_breakdown: statusStats,
        period_breakdown: periodStats,
        country_breakdown: countryStats
      };
    } catch (error) {
      throw new Error(`Failed to get visa application stats: ${error.message}`);
    }
  }

  // Get pending applications
  async getPendingApplications(page = 1, limit = 20, priority = 'normal') {
    try {
      const offset = (page - 1) * limit;
      let orderClause = 'ORDER BY va.submitted_at ASC';

      if (priority === 'urgent') {
        orderClause = 'ORDER BY vs.processing_time_days ASC, va.submitted_at ASC';
      } else if (priority === 'oldest') {
        orderClause = 'ORDER BY va.submitted_at ASC';
      }

      const rows = await executeQuery(
        `SELECT va.*, vs.title as service_title, vs.country, vs.visa_type, vs.processing_time_days,
                u.first_name, u.last_name, u.email,
                DATEDIFF(NOW(), va.submitted_at) as days_pending
         FROM visa_applications va
         JOIN visa_services vs ON va.visa_service_id = vs.id
         JOIN users u ON va.user_id = u.id
         WHERE va.status = 'under_review'
         ${orderClause}
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      // Parse JSON fields
      rows.forEach(row => {
        row.application_data = JSON.parse(row.application_data || '{}');
        row.documents = JSON.parse(row.documents || '{}');
      });

      // Get total count
      const countResult = await executeQuery(
        'SELECT COUNT(*) as total FROM visa_applications WHERE status = "under_review"'
      );

      return {
        applications: rows,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get pending applications: ${error.message}`);
    }
  }

  // Get applications by status
  async getApplicationsByStatus(status, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const rows = await executeQuery(
        `SELECT va.*, vs.title as service_title, vs.country, vs.visa_type,
                u.first_name, u.last_name, u.email,
                reviewer.first_name as reviewer_first_name, reviewer.last_name as reviewer_last_name
         FROM visa_applications va
         JOIN visa_services vs ON va.visa_service_id = vs.id
         JOIN users u ON va.user_id = u.id
         LEFT JOIN users reviewer ON va.reviewed_by = reviewer.id
         WHERE va.status = ?
         ORDER BY va.updated_at DESC
         LIMIT ? OFFSET ?`,
        [status, limit, offset]
      );

      // Parse JSON fields
      rows.forEach(row => {
        row.application_data = JSON.parse(row.application_data || '{}');
        row.documents = JSON.parse(row.documents || '{}');
        row.review_comments = JSON.parse(row.review_comments || '[]');
      });

      // Get total count
      const countResult = await executeQuery(
        'SELECT COUNT(*) as total FROM visa_applications WHERE status = ?',
        [status]
      );

      return {
        applications: rows,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get applications by status: ${error.message}`);
    }
  }

  // Add application notes
  async addApplicationNotes(applicationId, officerId, notes, isInternal = false) {
    try {
      const note = {
        officer_id: officerId,
        notes: notes,
        is_internal: isInternal,
        timestamp: new Date().toISOString()
      };

      const result = await executeQuery(
        `UPDATE visa_applications 
         SET review_comments = JSON_ARRAY_APPEND(COALESCE(review_comments, JSON_ARRAY()), '$', ?)
         WHERE id = ?`,
        [JSON.stringify(note), applicationId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to add application notes: ${error.message}`);
    }
  }

  // Get application history
  async getApplicationHistory(applicationId) {
    try {
      const rows = await executeQuery(
        `SELECT review_comments FROM visa_applications WHERE id = ?`,
        [applicationId]
      );

      if (rows[0] && rows[0].review_comments) {
        return JSON.parse(rows[0].review_comments);
      }

      return [];
    } catch (error) {
      throw new Error(`Failed to get application history: ${error.message}`);
    }
  }

  // Bulk update applications
  async bulkUpdateApplications(applicationIds, officerId, status, comments) {
    try {
      const placeholders = applicationIds.map(() => '?').join(',');
      
      const result = await executeQuery(
        `UPDATE visa_applications 
         SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP,
             review_comments = JSON_ARRAY_APPEND(COALESCE(review_comments, JSON_ARRAY()), '$', ?)
         WHERE id IN (${placeholders})`,
        [status, officerId, JSON.stringify({ officer_id: officerId, status, comments, timestamp: new Date().toISOString() }), ...applicationIds]
      );

      return result.affectedRows;
    } catch (error) {
      throw new Error(`Failed to bulk update applications: ${error.message}`);
    }
  }

  // Get visa officer performance metrics
  async getPerformanceMetrics(officerId, startDate, endDate) {
    try {
      let whereClause = 'WHERE reviewed_by = ?';
      const queryParams = [officerId];

      if (startDate) {
        whereClause += ' AND reviewed_at >= ?';
        queryParams.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND reviewed_at <= ?';
        queryParams.push(endDate);
      }

      const metrics = await executeQuery(
        `SELECT 
           COUNT(*) as total_reviewed,
           SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
           SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
           AVG(TIMESTAMPDIFF(HOUR, submitted_at, reviewed_at)) as avg_processing_hours
         FROM visa_applications 
         ${whereClause}`,
        queryParams
      );

      const dailyStats = await executeQuery(
        `SELECT 
           DATE(reviewed_at) as date,
           COUNT(*) as reviewed_count,
           SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count
         FROM visa_applications 
         ${whereClause}
         GROUP BY DATE(reviewed_at)
         ORDER BY date DESC
         LIMIT 30`,
        queryParams
      );

      return {
        overall_metrics: metrics[0],
        daily_stats: dailyStats
      };
    } catch (error) {
      throw new Error(`Failed to get performance metrics: ${error.message}`);
    }
  }

  // Export applications data
  async exportApplicationsData(format = 'csv', filters = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      const queryParams = [];

      if (filters.status) {
        whereClause += ' AND va.status = ?';
        queryParams.push(filters.status);
      }

      if (filters.country) {
        whereClause += ' AND vs.country = ?';
        queryParams.push(filters.country);
      }

      if (filters.start_date) {
        whereClause += ' AND va.submitted_at >= ?';
        queryParams.push(filters.start_date);
      }

      if (filters.end_date) {
        whereClause += ' AND va.submitted_at <= ?';
        queryParams.push(filters.end_date);
      }

      const rows = await executeQuery(
        `SELECT va.id, va.status, va.submitted_at, va.reviewed_at,
                vs.title as service_title, vs.country, vs.visa_type,
                u.first_name, u.last_name, u.email,
                reviewer.first_name as reviewer_first_name, reviewer.last_name as reviewer_last_name
         FROM visa_applications va
         JOIN visa_services vs ON va.visa_service_id = vs.id
         JOIN users u ON va.user_id = u.id
         LEFT JOIN users reviewer ON va.reviewed_by = reviewer.id
         ${whereClause}
         ORDER BY va.submitted_at DESC`,
        queryParams
      );

      if (format === 'csv') {
        const csvHeader = 'ID,Status,Submitted At,Reviewed At,Service Title,Country,Visa Type,Applicant Name,Applicant Email,Reviewer Name\n';
        const csvRows = rows.map(row => 
          `${row.id},${row.status},${row.submitted_at},${row.reviewed_at || ''},${row.service_title},${row.country},${row.visa_type},"${row.first_name} ${row.last_name}",${row.email},"${row.reviewer_first_name || ''} ${row.reviewer_last_name || ''}"`
        ).join('\n');
        
        return csvHeader + csvRows;
      } else {
        return JSON.stringify(rows, null, 2);
      }
    } catch (error) {
      throw new Error(`Failed to export applications data: ${error.message}`);
    }
  }
}

module.exports = new VisaOfficerService();
