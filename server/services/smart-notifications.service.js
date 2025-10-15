const { executeQuery } = require('../config/database');
const scholarshipService = require('./scholarship.service');
const scholarshipMatchingService = require('./scholarship-matching.service');

class SmartNotificationsService {
  constructor() {
    this.notificationTypes = {
      DEADLINE_REMINDER: 'deadline_reminder',
      NEW_MATCH: 'new_match',
      STATUS_UPDATE: 'status_update',
      DOCUMENT_REQUEST: 'document_request',
      INTERVIEW_SCHEDULED: 'interview_scheduled',
      AWARD_ANNOUNCEMENT: 'award_announcement',
      PAYMENT_REMINDER: 'payment_reminder',
      OPPORTUNITY_ALERT: 'opportunity_alert'
    };
  }

  // Send deadline reminders
  async sendDeadlineReminders() {
    try {
      const query = `
        SELECT DISTINCT sa.user_id, s.title, s.application_deadline, s.id as scholarship_id
        FROM scholarship_applications sa
        JOIN scholarships s ON sa.scholarship_id = s.id
        WHERE sa.status IN ('draft', 'submitted')
        AND s.application_deadline BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        AND s.status = 'active'
      `;

      const reminders = await executeQuery(query);
      const notifications = [];

      for (const reminder of reminders) {
        const daysLeft = this.calculateDaysLeft(reminder.application_deadline);
        
        if (daysLeft <= 7 && daysLeft > 0) {
          const notification = await this.createNotification({
            user_id: reminder.user_id,
            type: this.notificationTypes.DEADLINE_REMINDER,
            title: `Deadline Reminder: ${reminder.title}`,
            message: `Only ${daysLeft} day${daysLeft > 1 ? 's' : ''} left to apply for ${reminder.title}`,
            data: {
              scholarship_id: reminder.scholarship_id,
              deadline: reminder.application_deadline,
              days_left: daysLeft
            },
            priority: daysLeft <= 3 ? 'high' : 'medium'
          });

          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error sending deadline reminders:', error);
      throw new Error('Failed to send deadline reminders');
    }
  }

  // Send new scholarship matches
  async sendNewMatches(userId) {
    try {
      // Get user's recent activity to avoid duplicate notifications
      const lastCheck = await this.getLastNotificationCheck(userId, this.notificationTypes.NEW_MATCH);
      
      // Get new scholarships that match user profile
      const recommendations = await scholarshipMatchingService.getPersonalizedRecommendations(userId, 10);
      
      // Filter out scholarships user already applied to
      const newMatches = recommendations.filter(rec => 
        rec.eligibility_status === 'eligible' && 
        rec.match_score > 0.7 &&
        !rec.applied_scholarships?.includes(rec.id)
      );

      const notifications = [];
      for (const match of newMatches.slice(0, 3)) { // Limit to top 3 matches
        const notification = await this.createNotification({
          user_id: userId,
          type: this.notificationTypes.NEW_MATCH,
          title: `New Scholarship Match: ${match.title}`,
          message: `We found a ${Math.round(match.match_score * 100)}% match for you! ${match.provider_name} - ${match.country}`,
          data: {
            scholarship_id: match.id,
            match_score: match.match_score,
            match_reasons: match.match_reasons
          },
          priority: 'medium'
        });

        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error('Error sending new matches:', error);
      throw new Error('Failed to send new matches');
    }
  }

  // Send application status updates
  async sendStatusUpdates() {
    try {
      const query = `
        SELECT sa.*, s.title, u.first_name, u.last_name
        FROM scholarship_applications sa
        JOIN scholarships s ON sa.scholarship_id = s.id
        JOIN users u ON sa.user_id = u.id
        WHERE sa.status IN ('under_review', 'shortlisted', 'accepted', 'rejected')
        AND sa.reviewed_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
      `;

      const updates = await executeQuery(query);
      const notifications = [];

      for (const update of updates) {
        let title, message, priority;

        switch (update.status) {
          case 'under_review':
            title = `Application Under Review: ${update.title}`;
            message = `Your application for ${update.title} is now being reviewed by the selection committee.`;
            priority = 'medium';
            break;
          case 'shortlisted':
            title = `Congratulations! You're Shortlisted: ${update.title}`;
            message = `Great news! You've been shortlisted for ${update.title}. Next steps will be communicated soon.`;
            priority = 'high';
            break;
          case 'accepted':
            title = `🎉 Scholarship Awarded: ${update.title}`;
            message = `Congratulations ${update.first_name}! You have been awarded the ${update.title} scholarship.`;
            priority = 'high';
            break;
          case 'rejected':
            title = `Application Update: ${update.title}`;
            message = `Thank you for applying to ${update.title}. Unfortunately, you were not selected this time.`;
            priority = 'medium';
            break;
        }

        const notification = await this.createNotification({
          user_id: update.user_id,
          type: this.notificationTypes.STATUS_UPDATE,
          title,
          message,
          data: {
            scholarship_id: update.scholarship_id,
            status: update.status,
            review_notes: update.review_notes
          },
          priority
        });

        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error('Error sending status updates:', error);
      throw new Error('Failed to send status updates');
    }
  }

  // Send opportunity alerts
  async sendOpportunityAlerts() {
    try {
      // Get users who haven't applied to any scholarships recently
      const query = `
        SELECT u.id, u.first_name, u.last_name, u.preferences
        FROM users u
        WHERE u.role = 'student'
        AND u.id NOT IN (
          SELECT DISTINCT user_id 
          FROM scholarship_applications 
          WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
        )
      `;

      const inactiveUsers = await executeQuery(query);
      const notifications = [];

      for (const user of inactiveUsers) {
        // Get trending scholarships
        const trending = await scholarshipService.getTrendingScholarships(3);
        
        if (trending.length > 0) {
          const notification = await this.createNotification({
            user_id: user.id,
            type: this.notificationTypes.OPPORTUNITY_ALERT,
            title: 'New Opportunities Available!',
            message: `Don't miss out! ${trending.length} trending scholarships are now available.`,
            data: {
              scholarship_ids: trending.map(s => s.id),
              trending_count: trending.length
            },
            priority: 'medium'
          });

          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error sending opportunity alerts:', error);
      throw new Error('Failed to send opportunity alerts');
    }
  }

  // Send document request notifications
  async sendDocumentRequests() {
    try {
      const query = `
        SELECT sa.*, s.title, s.required_documents, u.first_name
        FROM scholarship_applications sa
        JOIN scholarships s ON sa.scholarship_id = s.id
        JOIN users u ON sa.user_id = u.id
        WHERE sa.status = 'under_review'
        AND sa.submitted_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
      `;

      const applications = await executeQuery(query);
      const notifications = [];

      for (const app of applications) {
        const requiredDocs = JSON.parse(app.required_documents || '[]');
        const submittedDocs = Object.keys(JSON.parse(app.documents || '{}'));
        
        const missingDocs = requiredDocs.filter(doc => !submittedDocs.includes(doc));
        
        if (missingDocs.length > 0) {
          const notification = await this.createNotification({
            user_id: app.user_id,
            type: this.notificationTypes.DOCUMENT_REQUEST,
            title: `Document Request: ${app.title}`,
            message: `Please upload the following documents: ${missingDocs.join(', ')}`,
            data: {
              scholarship_id: app.scholarship_id,
              missing_documents: missingDocs
            },
            priority: 'high'
          });

          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error sending document requests:', error);
      throw new Error('Failed to send document requests');
    }
  }

  // Create notification
  async createNotification(notificationData) {
    try {
      const {
        user_id,
        type,
        title,
        message,
        data = {},
        priority = 'medium',
        expires_at = null
      } = notificationData;

      const query = `
        INSERT INTO notifications (
          user_id, type, title, message, data, priority, expires_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      const result = await executeQuery(query, [
        user_id,
        type,
        title,
        message,
        JSON.stringify(data),
        priority,
        expires_at
      ]);

      // Send real-time notification (WebSocket, push notification, etc.)
      await this.sendRealTimeNotification(user_id, {
        id: result.insertId,
        type,
        title,
        message,
        data,
        priority,
        created_at: new Date()
      });

      return {
        id: result.insertId,
        user_id,
        type,
        title,
        message,
        data,
        priority
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  // Send real-time notification
  async sendRealTimeNotification(userId, notification) {
    try {
      // This would integrate with WebSocket, push notification services, etc.
      // For now, we'll just log it
      console.log(`Real-time notification for user ${userId}:`, notification);
      
      // TODO: Integrate with:
      // - WebSocket for real-time updates
      // - Firebase Cloud Messaging for mobile push
      // - Email service for email notifications
      // - SMS service for urgent notifications
      
    } catch (error) {
      console.error('Error sending real-time notification:', error);
    }
  }

  // Get user notifications
  async getUserNotifications(userId, filters = {}) {
    try {
      let query = `
        SELECT * FROM notifications
        WHERE user_id = ?
      `;
      
      const params = [userId];
      const conditions = [];

      if (filters.type) {
        conditions.push('type = ?');
        params.push(filters.type);
      }

      if (filters.priority) {
        conditions.push('priority = ?');
        params.push(filters.priority);
      }

      if (filters.read !== undefined) {
        conditions.push('is_read = ?');
        params.push(filters.read);
      }

      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }

      query += ' ORDER BY created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
      }

      const notifications = await executeQuery(query, params);
      
      return notifications.map(notif => ({
        ...notif,
        data: JSON.parse(notif.data || '{}')
      }));
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const query = `
        UPDATE notifications 
        SET is_read = 1, read_at = NOW()
        WHERE id = ? AND user_id = ?
      `;

      const result = await executeQuery(query, [notificationId, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      const query = `
        UPDATE notifications
        SET is_read = 1, read_at = NOW()
        WHERE user_id = ? AND is_read = 0
      `;
      await executeQuery(query, [userId]);
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  // Get last notification check time
  async getLastNotificationCheck(userId, type) {
    try {
      const query = `
        SELECT MAX(created_at) as last_check
        FROM notifications
        WHERE user_id = ? AND type = ?
      `;

      const result = await executeQuery(query, [userId, type]);
      return result[0]?.last_check || new Date('2020-01-01');
    } catch (error) {
      console.error('Error getting last notification check:', error);
      return new Date('2020-01-01');
    }
  }

  // Calculate days left until deadline
  calculateDaysLeft(deadline) {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Process all notification types
  async processAllNotifications() {
    try {
      console.log('🔔 Processing smart notifications...');
      
      const results = {
        deadline_reminders: await this.sendDeadlineReminders(),
        status_updates: await this.sendStatusUpdates(),
        document_requests: await this.sendDocumentRequests(),
        opportunity_alerts: await this.sendOpportunityAlerts()
      };

      const totalSent = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
      
      console.log(`✅ Sent ${totalSent} notifications:`, {
        deadline_reminders: results.deadline_reminders.length,
        status_updates: results.status_updates.length,
        document_requests: results.document_requests.length,
        opportunity_alerts: results.opportunity_alerts.length
      });

      return results;
    } catch (error) {
      console.error('Error processing notifications:', error);
      throw new Error('Failed to process notifications');
    }
  }
}

module.exports = new SmartNotificationsService();
