const db = require('../db/connection');

class ModeratorService {
  // Get moderator dashboard
  async getDashboard(userId) {
    try {
      const [pendingCount] = await db.execute(
        `SELECT COUNT(*) as count FROM content_moderation WHERE status = 'pending'`
      );

      const [todayCount] = await db.execute(
        `SELECT COUNT(*) as count FROM content_moderation 
         WHERE DATE(updated_at) = CURDATE() AND moderator_id = ?`,
        [userId]
      );

      const [weeklyStats] = await db.execute(
        `SELECT 
           COUNT(*) as total_moderated,
           SUM(CASE WHEN action = 'approved' THEN 1 ELSE 0 END) as approved,
           SUM(CASE WHEN action = 'rejected' THEN 1 ELSE 0 END) as rejected,
           SUM(CASE WHEN action = 'removed' THEN 1 ELSE 0 END) as removed
         FROM content_moderation 
         WHERE moderator_id = ? AND updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
        [userId]
      );

      const [recentFlags] = await db.execute(
        `SELECT cm.*, cf.reason as flag_reason, cf.description as flag_description,
                cf.created_at as flagged_at
         FROM content_moderation cm
         JOIN content_flags cf ON cm.content_id = cf.content_id AND cm.content_type = cf.content_type
         WHERE cm.status = 'pending'
         ORDER BY cf.created_at ASC
         LIMIT 10`
      );

      return {
        pending_content: pendingCount[0].count,
        today_moderated: todayCount[0].count,
        weekly_stats: weeklyStats[0],
        recent_flags: recentFlags
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard: ${error.message}`);
    }
  }

  // Get flagged content
  async getFlaggedContent(page = 1, limit = 20, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE cf.status = "active"';
      const queryParams = [];

      if (filters.content_type) {
        whereClause += ' AND cf.content_type = ?';
        queryParams.push(filters.content_type);
      }

      if (filters.reason) {
        whereClause += ' AND cf.reason = ?';
        queryParams.push(filters.reason);
      }

      if (filters.priority) {
        whereClause += ' AND cf.priority = ?';
        queryParams.push(filters.priority);
      }

      if (filters.flagged_from) {
        whereClause += ' AND cf.created_at >= ?';
        queryParams.push(filters.flagged_from);
      }

      if (filters.flagged_to) {
        whereClause += ' AND cf.created_at <= ?';
        queryParams.push(filters.flagged_to);
      }

      const [rows] = await db.execute(
        `SELECT cf.*, cm.status as moderation_status, cm.action as moderation_action,
                cm.updated_at as moderated_at, cm.moderator_id,
                moderator.first_name as moderator_first_name, moderator.last_name as moderator_last_name
         FROM content_flags cf
         LEFT JOIN content_moderation cm ON cf.content_id = cm.content_id AND cf.content_type = cm.content_type
         LEFT JOIN users moderator ON cm.moderator_id = moderator.id
         ${whereClause}
         ORDER BY cf.priority DESC, cf.created_at ASC
         LIMIT ? OFFSET ?`,
        [...queryParams, limit, offset]
      );

      // Get total count
      const [countResult] = await db.execute(
        `SELECT COUNT(*) as total FROM content_flags cf ${whereClause}`,
        queryParams
      );

      return {
        content: rows,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get flagged content: ${error.message}`);
    }
  }

  // Get content for moderation
  async getContentForModeration(contentId, contentType) {
    try {
      let content = null;

      // Get content based on type
      switch (contentType) {
        case 'car':
          const [carRows] = await db.execute(
            `SELECT c.*, d.business_name as dealer_name, u.first_name, u.last_name
             FROM cars c
             LEFT JOIN dealers d ON c.dealer_id = d.id
             LEFT JOIN users u ON d.user_id = u.id
             WHERE c.id = ?`,
            [contentId]
          );
          content = carRows[0];
          if (content) {
            content.images = JSON.parse(content.images || '[]');
            content.features = JSON.parse(content.features || '[]');
            content.specifications = JSON.parse(content.specifications || '{}');
          }
          break;

        case 'course':
          const [courseRows] = await db.execute(
            `SELECT c.*, u.first_name, u.last_name
             FROM courses c
             LEFT JOIN users u ON c.instructor_id = u.id
             WHERE c.id = ?`,
            [contentId]
          );
          content = courseRows[0];
          if (content) {
            content.images = JSON.parse(content.images || '[]');
            content.requirements = JSON.parse(content.requirements || '[]');
            content.outcomes = JSON.parse(content.outcomes || '[]');
          }
          break;

        case 'scholarship':
          const [scholarshipRows] = await db.execute(
            `SELECT s.*, u.first_name, u.last_name
             FROM scholarships s
             LEFT JOIN users u ON s.provider_id = u.id
             WHERE s.id = ?`,
            [contentId]
          );
          content = scholarshipRows[0];
          if (content) {
            content.eligibility_criteria = JSON.parse(content.eligibility_criteria || '{}');
            content.required_documents = JSON.parse(content.required_documents || '[]');
            content.tags = JSON.parse(content.tags || '[]');
          }
          break;

        case 'visa_service':
          const [visaRows] = await db.execute(
            `SELECT vs.*, u.first_name, u.last_name
             FROM visa_services vs
             LEFT JOIN users u ON vs.provider_id = u.id
             WHERE vs.id = ?`,
            [contentId]
          );
          content = visaRows[0];
          if (content) {
            content.required_documents = JSON.parse(content.required_documents || '[]');
            content.fees_breakdown = JSON.parse(content.fees_breakdown || '{}');
            content.tags = JSON.parse(content.tags || '[]');
          }
          break;

        default:
          throw new Error('Unsupported content type');
      }

      // Get flags for this content
      const [flags] = await db.execute(
        `SELECT cf.*, u.first_name, u.last_name
         FROM content_flags cf
         LEFT JOIN users u ON cf.user_id = u.id
         WHERE cf.content_id = ? AND cf.content_type = ? AND cf.status = 'active'
         ORDER BY cf.created_at DESC`,
        [contentId, contentType]
      );

      // Get moderation history
      const [moderationHistory] = await db.execute(
        `SELECT cm.*, u.first_name, u.last_name
         FROM content_moderation cm
         LEFT JOIN users u ON cm.moderator_id = u.id
         WHERE cm.content_id = ? AND cm.content_type = ?
         ORDER BY cm.created_at DESC`,
        [contentId, contentType]
      );

      return {
        content,
        flags,
        moderation_history: moderationHistory
      };
    } catch (error) {
      throw new Error(`Failed to get content for moderation: ${error.message}`);
    }
  }

  // Moderate content
  async moderateContent(contentId, contentType, moderatorId, action, reason, notes) {
    try {
      const moderationData = {
        moderator_id: moderatorId,
        action: action,
        reason: reason,
        notes: notes,
        timestamp: new Date().toISOString()
      };

      // Update or create moderation record
      const [result] = await db.execute(
        `INSERT INTO content_moderation (content_id, content_type, moderator_id, action, reason, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, 'completed')
         ON DUPLICATE KEY UPDATE
         moderator_id = VALUES(moderator_id),
         action = VALUES(action),
         reason = VALUES(reason),
         notes = VALUES(notes),
         status = 'completed',
         updated_at = CURRENT_TIMESTAMP`,
        [contentId, contentType, moderatorId, action, reason, notes]
      );

      // Update content status based on action
      if (action === 'approved') {
        await this.updateContentStatus(contentId, contentType, 'active');
      } else if (action === 'rejected') {
        await this.updateContentStatus(contentId, contentType, 'rejected');
      } else if (action === 'removed') {
        await this.updateContentStatus(contentId, contentType, 'removed');
      }

      // Update flags status
      await db.execute(
        `UPDATE content_flags SET status = 'resolved' 
         WHERE content_id = ? AND content_type = ? AND status = 'active'`,
        [contentId, contentType]
      );

      return result.affectedRows > 0 || result.insertId;
    } catch (error) {
      throw new Error(`Failed to moderate content: ${error.message}`);
    }
  }

  // Approve content
  async approveContent(contentId, contentType, moderatorId, notes) {
    return this.moderateContent(contentId, contentType, moderatorId, 'approved', 'Content approved', notes);
  }

  // Reject content
  async rejectContent(contentId, contentType, moderatorId, reason, notes) {
    return this.moderateContent(contentId, contentType, moderatorId, 'rejected', reason, notes);
  }

  // Remove content
  async removeContent(contentId, contentType, moderatorId, reason, notifyUser = true) {
    try {
      const removed = await this.moderateContent(contentId, contentType, moderatorId, 'removed', reason, 'Content removed');

      if (removed && notifyUser) {
        // Get content owner to notify
        const ownerId = await this.getContentOwner(contentId, contentType);
        if (ownerId) {
          // Here you would typically send a notification
          // For now, we'll just log it
          console.log(`Notifying user ${ownerId} about content removal`);
        }
      }

      return removed;
    } catch (error) {
      throw new Error(`Failed to remove content: ${error.message}`);
    }
  }

  // Flag content
  async flagContent(contentId, contentType, userId, reason, description) {
    try {
      const [result] = await db.execute(
        `INSERT INTO content_flags (content_id, content_type, user_id, reason, description, priority, status)
         VALUES (?, ?, ?, ?, ?, 'normal', 'active')`,
        [contentId, contentType, userId, reason, description]
      );

      return result.insertId;
    } catch (error) {
      throw new Error(`Failed to flag content: ${error.message}`);
    }
  }

  // Get user reports
  async getUserReports(page = 1, limit = 20, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE 1=1';
      const queryParams = [];

      if (filters.status) {
        whereClause += ' AND ur.status = ?';
        queryParams.push(filters.status);
      }

      if (filters.reason) {
        whereClause += ' AND ur.reason = ?';
        queryParams.push(filters.reason);
      }

      if (filters.reported_from) {
        whereClause += ' AND ur.created_at >= ?';
        queryParams.push(filters.reported_from);
      }

      if (filters.reported_to) {
        whereClause += ' AND ur.created_at <= ?';
        queryParams.push(filters.reported_to);
      }

      const [rows] = await db.execute(
        `SELECT ur.*, 
                reporter.first_name as reporter_first_name, reporter.last_name as reporter_last_name,
                reported.first_name as reported_first_name, reported.last_name as reported_last_name,
                moderator.first_name as moderator_first_name, moderator.last_name as moderator_last_name
         FROM user_reports ur
         LEFT JOIN users reporter ON ur.reporter_id = reporter.id
         LEFT JOIN users reported ON ur.reported_user_id = reported.id
         LEFT JOIN users moderator ON ur.moderator_id = moderator.id
         ${whereClause}
         ORDER BY ur.created_at DESC
         LIMIT ? OFFSET ?`,
        [...queryParams, limit, offset]
      );

      // Get total count
      const [countResult] = await db.execute(
        `SELECT COUNT(*) as total FROM user_reports ur ${whereClause}`,
        queryParams
      );

      return {
        reports: rows,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get user reports: ${error.message}`);
    }
  }

  // Moderate user
  async moderateUser(userId, moderatorId, action, reason, duration) {
    try {
      const moderationData = {
        moderator_id: moderatorId,
        action: action,
        reason: reason,
        duration: duration,
        timestamp: new Date().toISOString()
      };

      // Update user status based on action
      let userStatus = 'active';
      let userActive = true;

      if (action === 'suspend') {
        userStatus = 'suspended';
        userActive = false;
      } else if (action === 'ban') {
        userStatus = 'banned';
        userActive = false;
      } else if (action === 'warn') {
        userStatus = 'warned';
      }

      const [result] = await db.execute(
        `UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [userActive, userId]
      );

      // Record moderation action
      await db.execute(
        `INSERT INTO user_moderation (user_id, moderator_id, action, reason, duration, created_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [userId, moderatorId, action, reason, duration]
      );

      // Update user reports status
      await db.execute(
        `UPDATE user_reports SET status = 'resolved', moderator_id = ?, resolved_at = CURRENT_TIMESTAMP
         WHERE reported_user_id = ? AND status = 'pending'`,
        [moderatorId, userId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to moderate user: ${error.message}`);
    }
  }

  // Get moderation statistics
  async getModerationStats(startDate, endDate, period = 'monthly') {
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
        whereClause += ' AND created_at >= ?';
        queryParams.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND created_at <= ?';
        queryParams.push(endDate);
      }

      const [actionStats] = await db.execute(
        `SELECT 
           action,
           COUNT(*) as count
         FROM content_moderation 
         ${whereClause}
         GROUP BY action`,
        queryParams
      );

      const [periodStats] = await db.execute(
        `SELECT 
           DATE_FORMAT(created_at, '${dateFormat}') as period,
           COUNT(*) as total_moderated,
           SUM(CASE WHEN action = 'approved' THEN 1 ELSE 0 END) as approved,
           SUM(CASE WHEN action = 'rejected' THEN 1 ELSE 0 END) as rejected,
           SUM(CASE WHEN action = 'removed' THEN 1 ELSE 0 END) as removed
         FROM content_moderation 
         ${whereClause}
         GROUP BY DATE_FORMAT(created_at, '${dateFormat}')
         ORDER BY period DESC`,
        queryParams
      );

      const [contentTypeStats] = await db.execute(
        `SELECT 
           content_type,
           COUNT(*) as moderated_count,
           SUM(CASE WHEN action = 'approved' THEN 1 ELSE 0 END) as approved,
           SUM(CASE WHEN action = 'rejected' THEN 1 ELSE 0 END) as rejected
         FROM content_moderation 
         ${whereClause}
         GROUP BY content_type
         ORDER BY moderated_count DESC`,
        queryParams
      );

      return {
        action_breakdown: actionStats,
        period_breakdown: periodStats,
        content_type_breakdown: contentTypeStats
      };
    } catch (error) {
      throw new Error(`Failed to get moderation stats: ${error.message}`);
    }
  }

  // Get moderation queue
  async getModerationQueue(page = 1, limit = 20, priority = 'normal') {
    try {
      const offset = (page - 1) * limit;
      let orderClause = 'ORDER BY cf.created_at ASC';

      if (priority === 'high') {
        orderClause = 'ORDER BY cf.priority DESC, cf.created_at ASC';
      } else if (priority === 'oldest') {
        orderClause = 'ORDER BY cf.created_at ASC';
      }

      const [rows] = await db.execute(
        `SELECT cf.*, 
                DATEDIFF(NOW(), cf.created_at) as days_flagged
         FROM content_flags cf
         WHERE cf.status = 'active'
         ${orderClause}
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      // Get total count
      const [countResult] = await db.execute(
        'SELECT COUNT(*) as total FROM content_flags WHERE status = "active"'
      );

      return {
        queue: rows,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get moderation queue: ${error.message}`);
    }
  }

  // Add moderation notes
  async addModerationNotes(contentId, contentType, moderatorId, notes, isInternal = false) {
    try {
      const note = {
        moderator_id: moderatorId,
        notes: notes,
        is_internal: isInternal,
        timestamp: new Date().toISOString()
      };

      const [result] = await db.execute(
        `UPDATE content_moderation 
         SET notes = CONCAT(COALESCE(notes, ''), '\n', ?)
         WHERE content_id = ? AND content_type = ?`,
        [JSON.stringify(note), contentId, contentType]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to add moderation notes: ${error.message}`);
    }
  }

  // Get moderation history
  async getModerationHistory(contentId, contentType) {
    try {
      const [rows] = await db.execute(
        `SELECT cm.*, u.first_name, u.last_name
         FROM content_moderation cm
         LEFT JOIN users u ON cm.moderator_id = u.id
         WHERE cm.content_id = ? AND cm.content_type = ?
         ORDER BY cm.created_at DESC`,
        [contentId, contentType]
      );

      return rows;
    } catch (error) {
      throw new Error(`Failed to get moderation history: ${error.message}`);
    }
  }

  // Bulk moderate content
  async bulkModerateContent(contentIds, contentType, moderatorId, action, reason) {
    try {
      const placeholders = contentIds.map(() => '?').join(',');
      
      const [result] = await db.execute(
        `INSERT INTO content_moderation (content_id, content_type, moderator_id, action, reason, status)
         VALUES ${contentIds.map(() => '(?, ?, ?, ?, ?, "completed")').join(', ')}
         ON DUPLICATE KEY UPDATE
         moderator_id = VALUES(moderator_id),
         action = VALUES(action),
         reason = VALUES(reason),
         status = 'completed',
         updated_at = CURRENT_TIMESTAMP`,
        contentIds.flatMap(id => [id, contentType, moderatorId, action, reason])
      );

      // Update content status based on action
      if (action === 'approved') {
        await this.bulkUpdateContentStatus(contentIds, contentType, 'active');
      } else if (action === 'rejected') {
        await this.bulkUpdateContentStatus(contentIds, contentType, 'rejected');
      } else if (action === 'removed') {
        await this.bulkUpdateContentStatus(contentIds, contentType, 'removed');
      }

      // Update flags status
      await db.execute(
        `UPDATE content_flags SET status = 'resolved' 
         WHERE content_id IN (${placeholders}) AND content_type = ? AND status = 'active'`,
        [...contentIds, contentType]
      );

      return result.affectedRows;
    } catch (error) {
      throw new Error(`Failed to bulk moderate content: ${error.message}`);
    }
  }

  // Get moderator performance metrics
  async getPerformanceMetrics(moderatorId, startDate, endDate) {
    try {
      let whereClause = 'WHERE moderator_id = ?';
      const queryParams = [moderatorId];

      if (startDate) {
        whereClause += ' AND created_at >= ?';
        queryParams.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND created_at <= ?';
        queryParams.push(endDate);
      }

      const [metrics] = await db.execute(
        `SELECT 
           COUNT(*) as total_moderated,
           SUM(CASE WHEN action = 'approved' THEN 1 ELSE 0 END) as approved,
           SUM(CASE WHEN action = 'rejected' THEN 1 ELSE 0 END) as rejected,
           SUM(CASE WHEN action = 'removed' THEN 1 ELSE 0 END) as removed
         FROM content_moderation 
         ${whereClause}`,
        queryParams
      );

      const [dailyStats] = await db.execute(
        `SELECT 
           DATE(created_at) as date,
           COUNT(*) as moderated_count,
           SUM(CASE WHEN action = 'approved' THEN 1 ELSE 0 END) as approved_count
         FROM content_moderation 
         ${whereClause}
         GROUP BY DATE(created_at)
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

  // Helper methods
  async updateContentStatus(contentId, contentType, status) {
    const statusField = contentType === 'car' ? 'status' : 'status';
    const tableName = this.getTableName(contentType);
    
    await db.execute(
      `UPDATE ${tableName} SET ${statusField} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, contentId]
    );
  }

  async bulkUpdateContentStatus(contentIds, contentType, status) {
    const statusField = contentType === 'car' ? 'status' : 'status';
    const tableName = this.getTableName(contentType);
    const placeholders = contentIds.map(() => '?').join(',');
    
    await db.execute(
      `UPDATE ${tableName} SET ${statusField} = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
      [status, ...contentIds]
    );
  }

  getTableName(contentType) {
    const tableMap = {
      'car': 'cars',
      'course': 'courses',
      'scholarship': 'scholarships',
      'visa_service': 'visa_services'
    };
    return tableMap[contentType] || contentType;
  }

  async getContentOwner(contentId, contentType) {
    const tableName = this.getTableName(contentType);
    let ownerField = 'user_id';
    
    if (contentType === 'car') {
      ownerField = 'dealer_id';
    } else if (contentType === 'course') {
      ownerField = 'instructor_id';
    } else if (contentType === 'scholarship' || contentType === 'visa_service') {
      ownerField = 'provider_id';
    }

    const [rows] = await db.execute(
      `SELECT ${ownerField} FROM ${tableName} WHERE id = ?`,
      [contentId]
    );

    return rows[0] ? rows[0][ownerField] : null;
  }
}

module.exports = new ModeratorService();
