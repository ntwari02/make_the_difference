const moderatorService = require('../services/moderator.service');
const { authenticate, authorizeRoles } = require('../middlewares/auth');

class ModeratorController {
  // Get moderator dashboard
  async getDashboard(req, res) {
    try {
      const userId = req.user.id;
      const dashboard = await moderatorService.getDashboard(userId);

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get flagged content
  async getFlaggedContent(req, res) {
    try {
      const { page = 1, limit = 20, ...filters } = req.query;

      const result = await moderatorService.getFlaggedContent(
        parseInt(page),
        parseInt(limit),
        filters
      );

      res.json({
        success: true,
        data: result.content,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get content by ID for moderation
  async getContentForModeration(req, res) {
    try {
      const { contentId, contentType } = req.params;
      const content = await moderatorService.getContentForModeration(contentId, contentType);

      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Moderate content
  async moderateContent(req, res) {
    try {
      const { contentId, contentType } = req.params;
      const { action, reason, notes } = req.body;
      const moderatorId = req.user.id;

      const moderated = await moderatorService.moderateContent(
        contentId,
        contentType,
        moderatorId,
        action,
        reason,
        notes
      );

      if (!moderated) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      res.json({
        success: true,
        message: `Content ${action} successfully`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Approve content
  async approveContent(req, res) {
    try {
      const { contentId, contentType } = req.params;
      const { notes } = req.body;
      const moderatorId = req.user.id;

      const approved = await moderatorService.approveContent(
        contentId,
        contentType,
        moderatorId,
        notes
      );

      if (!approved) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      res.json({
        success: true,
        message: 'Content approved successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Reject content
  async rejectContent(req, res) {
    try {
      const { contentId, contentType } = req.params;
      const { reason, notes } = req.body;
      const moderatorId = req.user.id;

      const rejected = await moderatorService.rejectContent(
        contentId,
        contentType,
        moderatorId,
        reason,
        notes
      );

      if (!rejected) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      res.json({
        success: true,
        message: 'Content rejected successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Remove content
  async removeContent(req, res) {
    try {
      const { contentId, contentType } = req.params;
      const { reason, notify_user = true } = req.body;
      const moderatorId = req.user.id;

      const removed = await moderatorService.removeContent(
        contentId,
        contentType,
        moderatorId,
        reason,
        notify_user
      );

      if (!removed) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      res.json({
        success: true,
        message: 'Content removed successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Flag content
  async flagContent(req, res) {
    try {
      const { contentId, contentType } = req.params;
      const { reason, description } = req.body;
      const userId = req.user.id;

      const flagged = await moderatorService.flagContent(
        contentId,
        contentType,
        userId,
        reason,
        description
      );

      if (!flagged) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      res.json({
        success: true,
        message: 'Content flagged successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user reports
  async getUserReports(req, res) {
    try {
      const { page = 1, limit = 20, ...filters } = req.query;

      const result = await moderatorService.getUserReports(
        parseInt(page),
        parseInt(limit),
        filters
      );

      res.json({
        success: true,
        data: result.reports,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Moderate user
  async moderateUser(req, res) {
    try {
      const { userId } = req.params;
      const { action, reason, duration } = req.body;
      const moderatorId = req.user.id;

      const moderated = await moderatorService.moderateUser(
        userId,
        moderatorId,
        action,
        reason,
        duration
      );

      if (!moderated) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: `User ${action} successfully`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get moderation statistics
  async getModerationStats(req, res) {
    try {
      const { start_date, end_date, period = 'monthly' } = req.query;

      const stats = await moderatorService.getModerationStats(
        start_date,
        end_date,
        period
      );

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get moderation queue
  async getModerationQueue(req, res) {
    try {
      const { page = 1, limit = 20, priority = 'normal' } = req.query;

      const result = await moderatorService.getModerationQueue(
        parseInt(page),
        parseInt(limit),
        priority
      );

      res.json({
        success: true,
        data: result.queue,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Add moderation notes
  async addModerationNotes(req, res) {
    try {
      const { contentId, contentType } = req.params;
      const { notes, is_internal = false } = req.body;
      const moderatorId = req.user.id;

      const added = await moderatorService.addModerationNotes(
        contentId,
        contentType,
        moderatorId,
        notes,
        is_internal
      );

      if (!added) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      res.json({
        success: true,
        message: 'Notes added successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get moderation history
  async getModerationHistory(req, res) {
    try {
      const { contentId, contentType } = req.params;

      const history = await moderatorService.getModerationHistory(contentId, contentType);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Bulk moderate content
  async bulkModerateContent(req, res) {
    try {
      const { content_ids, content_type, action, reason } = req.body;
      const moderatorId = req.user.id;

      const moderated = await moderatorService.bulkModerateContent(
        content_ids,
        content_type,
        moderatorId,
        action,
        reason
      );

      res.json({
        success: true,
        message: `${moderated} items moderated successfully`,
        data: { moderated_count: moderated }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get moderator performance metrics
  async getPerformanceMetrics(req, res) {
    try {
      const { moderatorId } = req.params;
      const { start_date, end_date } = req.query;

      const metrics = await moderatorService.getPerformanceMetrics(
        moderatorId,
        start_date,
        end_date
      );

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ModeratorController();
