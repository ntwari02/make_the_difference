const sellerService = require('../services/seller.service');

class SellerController {
  // Get seller profile
  async getSellerProfile(req, res) {
    try {
      const { userId } = req.user;
      const profile = await sellerService.getSellerProfile(userId);
      
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Seller profile not found'
        });
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update seller profile
  async updateSellerProfile(req, res) {
    try {
      const { userId } = req.user;
      const profileData = req.body;
      
      const updatedProfile = await sellerService.upsertSellerProfile(userId, profileData);
      
      res.json({
        success: true,
        data: updatedProfile,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get seller settings
  async getSellerSettings(req, res) {
    try {
      const { userId } = req.user;
      const settings = await sellerService.getSellerSettings(userId);
      
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update seller settings
  async updateSellerSettings(req, res) {
    try {
      const { userId } = req.user;
      const settingsData = req.body;
      
      const updatedSettings = await sellerService.upsertSellerSettings(userId, settingsData);
      
      res.json({
        success: true,
        data: updatedSettings,
        message: 'Settings updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get seller reviews
  async getSellerReviews(req, res) {
    try {
      const { sellerId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const result = await sellerService.getSellerReviews(
        sellerId,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: {
          reviews: result.reviews,
          pagination: result.pagination,
          statistics: result.statistics
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create seller review
  async createSellerReview(req, res) {
    try {
      const { sellerId } = req.params;
      const { userId } = req.user;
      const reviewData = req.body;

      const result = await sellerService.createSellerReview(sellerId, userId, reviewData);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Review created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Reply to seller review
  async replyToSellerReview(req, res) {
    try {
      const { reviewId } = req.params;
      const { userId } = req.user;
      const { replyText } = req.body;

      // Get seller ID from user
      const sellerProfile = await sellerService.getSellerProfile(userId);
      if (!sellerProfile) {
        return res.status(404).json({
          success: false,
          message: 'Seller profile not found'
        });
      }

      const result = await sellerService.replyToSellerReview(reviewId, sellerProfile.id, replyText);

      res.json({
        success: true,
        data: result,
        message: 'Reply added successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Mark review as helpful
  async markReviewHelpful(req, res) {
    try {
      const { reviewId } = req.params;
      const { userId } = req.user;

      const result = await sellerService.markReviewHelpful(reviewId, userId);

      res.json({
        success: true,
        data: result,
        message: 'Review marked as helpful'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete seller account
  async deleteSellerAccount(req, res) {
    try {
      const { userId } = req.user;
      
      await sellerService.deleteSellerAccount(userId);
      
      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new SellerController();
