const oneClickApplyService = require('../services/one-click-apply.service');
const smartNotificationsService = require('../services/smart-notifications.service');
const gamificationService = require('../services/gamification.service');
const socialFeaturesService = require('../services/social-features.service');
const analyticsDashboardService = require('../services/analytics-dashboard.service');

class CompetitiveFeaturesController {
  // ========== ONE-CLICK APPLY CONTROLLERS ==========

  // One-click apply to multiple scholarships
  async oneClickApply(req, res) {
    try {
      const userId = req.user.id;
      const { scholarshipIds, options = {} } = req.body;

      if (!scholarshipIds || !Array.isArray(scholarshipIds)) {
        return res.status(400).json({
          success: false,
          message: 'Scholarship IDs array is required'
        });
      }

      const result = await oneClickApplyService.oneClickApply(userId, scholarshipIds, options);

      res.json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      console.error('Error in oneClickApply:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to process one-click applications'
      });
    }
  }

  // Bulk apply to recommended scholarships
  async bulkApplyToRecommendations(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 5 } = req.query;

      const result = await oneClickApplyService.bulkApplyToRecommendations(userId, parseInt(limit));

      res.json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      console.error('Error in bulkApplyToRecommendations:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to process bulk applications'
      });
    }
  }

  // ========== SMART NOTIFICATIONS CONTROLLERS ==========

  // Get user notifications
  async getUserNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { type, priority, read, limit = 20 } = req.query;

      const notifications = await smartNotificationsService.getUserNotifications(userId, {
        type,
        priority,
        read: read !== undefined ? read === 'true' : undefined,
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      console.error('Error in getUserNotifications:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch notifications'
      });
    }
  }

  // Mark notification as read
  async markNotificationAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const updated = await smartNotificationsService.markAsRead(notificationId, userId);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Error in markNotificationAsRead:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to mark notification as read'
      });
    }
  }

  // Process all notifications (admin)
  async processAllNotifications(req, res) {
    try {
      const results = await smartNotificationsService.processAllNotifications();

      res.json({
        success: true,
        message: 'All notifications processed successfully',
        data: results
      });
    } catch (error) {
      console.error('Error in processAllNotifications:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to process notifications'
      });
    }
  }

  // ========== GAMIFICATION CONTROLLERS ==========

  // Get user dashboard
  async getUserDashboard(req, res) {
    try {
      const userId = req.user.id;
      const dashboard = await gamificationService.getUserDashboard(userId);

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      console.error('Error in getUserDashboard:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch user dashboard'
      });
    }
  }

  // Get leaderboard
  async getLeaderboard(req, res) {
    try {
      const { limit = 10, timeframe = 'all' } = req.query;
      const leaderboard = await gamificationService.getLeaderboard(parseInt(limit), timeframe);

      res.json({
        success: true,
        data: leaderboard
      });
    } catch (error) {
      console.error('Error in getLeaderboard:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch leaderboard'
      });
    }
  }

  // Check achievements
  async checkAchievements(req, res) {
    try {
      const userId = req.user.id;
      const newAchievements = await gamificationService.checkAchievements(userId);

      res.json({
        success: true,
        message: `Found ${newAchievements.length} new achievements`,
        data: newAchievements
      });
    } catch (error) {
      console.error('Error in checkAchievements:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to check achievements'
      });
    }
  }

  // Award points
  async awardPoints(req, res) {
    try {
      const userId = req.user.id;
      const { points, reason, metadata = {} } = req.body;

      if (!points || !reason) {
        return res.status(400).json({
          success: false,
          message: 'Points and reason are required'
        });
      }

      const result = await gamificationService.awardPoints(userId, points, reason, metadata);

      res.json({
        success: true,
        message: 'Points awarded successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in awardPoints:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to award points'
      });
    }
  }

  // ========== SOCIAL FEATURES CONTROLLERS ==========

  // Create community post
  async createPost(req, res) {
    try {
      const userId = req.user.id;
      const postId = await socialFeaturesService.createPost(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: { id: postId }
      });
    } catch (error) {
      console.error('Error in createPost:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create post'
      });
    }
  }

  // Get community posts
  async getPosts(req, res) {
    try {
      const {
        type,
        user_id,
        scholarship_id,
        tags,
        search,
        sort_by,
        limit = 20,
        offset = 0
      } = req.query;

      const posts = await socialFeaturesService.getPosts({
        type,
        user_id,
        scholarship_id,
        tags: tags ? tags.split(',') : undefined,
        search,
        sort_by,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: posts,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          count: posts.length
        }
      });
    } catch (error) {
      console.error('Error in getPosts:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch posts'
      });
    }
  }

  // Like a post
  async likePost(req, res) {
    try {
      const userId = req.user.id;
      const { postId } = req.params;

      const result = await socialFeaturesService.likePost(userId, postId);

      res.json({
        success: true,
        message: result.liked ? 'Post liked' : 'Post unliked',
        data: result
      });
    } catch (error) {
      console.error('Error in likePost:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to like post'
      });
    }
  }

  // Add comment
  async addComment(req, res) {
    try {
      const userId = req.user.id;
      const { postId } = req.params;
      const { content, parentId } = req.body;

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Comment content is required'
        });
      }

      const commentId = await socialFeaturesService.addComment(userId, postId, content, parentId);

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: { id: commentId }
      });
    } catch (error) {
      console.error('Error in addComment:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to add comment'
      });
    }
  }

  // Get user feed
  async getUserFeed(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 20 } = req.query;

      const feed = await socialFeaturesService.getUserFeed(userId, parseInt(limit));

      res.json({
        success: true,
        data: feed
      });
    } catch (error) {
      console.error('Error in getUserFeed:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch user feed'
      });
    }
  }

  // Follow user
  async followUser(req, res) {
    try {
      const followerId = req.user.id;
      const { userId } = req.params;

      const result = await socialFeaturesService.followUser(followerId, userId);

      res.json({
        success: true,
        message: result.following ? 'User followed' : 'User unfollowed',
        data: result
      });
    } catch (error) {
      console.error('Error in followUser:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to follow user'
      });
    }
  }

  // Get success stories
  async getSuccessStories(req, res) {
    try {
      const { limit = 10 } = req.query;
      const stories = await socialFeaturesService.getSuccessStories(parseInt(limit));

      res.json({
        success: true,
        data: stories
      });
    } catch (error) {
      console.error('Error in getSuccessStories:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch success stories'
      });
    }
  }

  // ========== ANALYTICS CONTROLLERS ==========

  // Get dashboard analytics
  async getDashboardAnalytics(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const { timeframe = '30d' } = req.query;

      const dashboard = await analyticsDashboardService.getDashboardData(userId, userRole, timeframe);

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      console.error('Error in getDashboardAnalytics:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch dashboard analytics'
      });
    }
  }

  // Get user analytics
  async getUserAnalytics(req, res) {
    try {
      const userId = req.user.id;
      const analytics = await analyticsDashboardService.getUserAnalytics(userId);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error in getUserAnalytics:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch user analytics'
      });
    }
  }

  // Get provider analytics
  async getProviderAnalytics(req, res) {
    try {
      const providerId = req.user.id;
      const analytics = await analyticsDashboardService.getProviderAnalytics(providerId);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error in getProviderAnalytics:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch provider analytics'
      });
    }
  }

  // Get performance insights
  async getPerformanceInsights(req, res) {
    try {
      const { timeframe = '30d' } = req.query;
      const insights = await analyticsDashboardService.getPerformanceInsights(timeframe);

      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      console.error('Error in getPerformanceInsights:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch performance insights'
      });
    }
  }

  // Export analytics data
  async exportAnalyticsData(req, res) {
    try {
      const { format = 'json', timeframe = '30d' } = req.query;
      const data = await analyticsDashboardService.exportAnalyticsData(format, timeframe);

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
        return res.send(data);
      }

      res.json({
        success: true,
        data: data
      });
    } catch (error) {
      console.error('Error in exportAnalyticsData:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to export analytics data'
      });
    }
  }
}

module.exports = new CompetitiveFeaturesController();
