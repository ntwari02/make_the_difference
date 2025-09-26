const advertiserService = require('../services/advertiser.service');
const adCampaignService = require('../services/ad-campaign.service');
const adCreativeService = require('../services/ad-creative.service');
const adServingService = require('../services/ad-serving.service');
const aiAdTargetingService = require('../services/ai-ad-targeting.service');

class AdvertisingController {
  // Advertiser Management
  async createAdvertiser(req, res) {
    try {
      const userId = req.user.id;
      const advertiserData = req.body;

      const advertiser = await advertiserService.createAdvertiser(userId, advertiserData);

      res.status(201).json({
        success: true,
        data: advertiser,
        message: 'Advertiser account created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAdvertiser(req, res) {
    try {
      const { advertiserId } = req.params;
      const advertiser = await advertiserService.getAdvertiserById(advertiserId);

      if (!advertiser) {
        return res.status(404).json({
          success: false,
          message: 'Advertiser not found'
        });
      }

      res.json({
        success: true,
        data: advertiser
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateAdvertiser(req, res) {
    try {
      const { advertiserId } = req.params;
      const updateData = req.body;

      const updated = await advertiserService.updateAdvertiser(advertiserId, updateData);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Advertiser not found'
        });
      }

      res.json({
        success: true,
        message: 'Advertiser updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAdvertiserStats(req, res) {
    try {
      const { advertiserId } = req.params;
      const stats = await advertiserService.getAdvertiserStats(advertiserId);

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

  // Campaign Management
  async createCampaign(req, res) {
    try {
      const { advertiserId } = req.params;
      const campaignData = req.body;

      const campaign = await adCampaignService.createCampaign(advertiserId, campaignData);

      res.status(201).json({
        success: true,
        data: campaign,
        message: 'Campaign created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getCampaign(req, res) {
    try {
      const { campaignId } = req.params;
      const campaign = await adCampaignService.getCampaignById(campaignId);

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      res.json({
        success: true,
        data: campaign
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getCampaigns(req, res) {
    try {
      const { advertiserId } = req.params;
      const { page = 1, limit = 20, ...filters } = req.query;

      const result = await adCampaignService.getCampaignsByAdvertiser(
        advertiserId,
        parseInt(page),
        parseInt(limit),
        filters
      );

      res.json({
        success: true,
        data: result.campaigns,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateCampaign(req, res) {
    try {
      const { campaignId } = req.params;
      const updateData = req.body;

      const updated = await adCampaignService.updateCampaign(campaignId, updateData);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      res.json({
        success: true,
        message: 'Campaign updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async submitCampaignForApproval(req, res) {
    try {
      const { campaignId } = req.params;

      const submitted = await adCampaignService.submitCampaignForApproval(campaignId);

      if (!submitted) {
        return res.status(400).json({
          success: false,
          message: 'Failed to submit campaign for approval'
        });
      }

      res.json({
        success: true,
        message: 'Campaign submitted for approval successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async toggleCampaignStatus(req, res) {
    try {
      const { campaignId } = req.params;
      const { status } = req.body;

      const updated = await adCampaignService.toggleCampaignStatus(campaignId, status);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      res.json({
        success: true,
        message: `Campaign ${status} successfully`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getCampaignPerformance(req, res) {
    try {
      const { campaignId } = req.params;
      const { start_date, end_date } = req.query;

      const performance = await adCampaignService.getCampaignPerformance(
        campaignId,
        start_date,
        end_date
      );

      res.json({
        success: true,
        data: performance
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Creative Management
  async createCreative(req, res) {
    try {
      const { campaignId } = req.params;
      const creativeData = req.body;

      const creative = await adCreativeService.createCreative(campaignId, creativeData);

      res.status(201).json({
        success: true,
        data: creative,
        message: 'Creative created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getCreative(req, res) {
    try {
      const { creativeId } = req.params;
      const creative = await adCreativeService.getCreativeById(creativeId);

      if (!creative) {
        return res.status(404).json({
          success: false,
          message: 'Creative not found'
        });
      }

      res.json({
        success: true,
        data: creative
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getCreativesByCampaign(req, res) {
    try {
      const { campaignId } = req.params;
      const creatives = await adCreativeService.getCreativesByCampaign(campaignId);

      res.json({
        success: true,
        data: creatives
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateCreative(req, res) {
    try {
      const { creativeId } = req.params;
      const updateData = req.body;

      const updated = await adCreativeService.updateCreative(creativeId, updateData);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Creative not found'
        });
      }

      res.json({
        success: true,
        message: 'Creative updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getCreativePerformance(req, res) {
    try {
      const { creativeId } = req.params;
      const { start_date, end_date } = req.query;

      const performance = await adCreativeService.getCreativePerformance(
        creativeId,
        start_date,
        end_date
      );

      res.json({
        success: true,
        data: performance
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Ad Serving
  async serveAd(req, res) {
    try {
      const { placementId } = req.params;
      const userContext = req.body;

      const ad = await adServingService.serveAd(placementId, userContext);

      if (!ad) {
        return res.json({
          success: true,
          data: null,
          message: 'No ads available for this placement'
        });
      }

      res.json({
        success: true,
        data: ad
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async recordClick(req, res) {
    try {
      const { impressionId } = req.params;
      const clickData = req.body;

      const recorded = await adServingService.recordClick(impressionId, clickData);

      if (!recorded) {
        return res.status(404).json({
          success: false,
          message: 'Impression not found'
        });
      }

      res.json({
        success: true,
        message: 'Click recorded successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async recordConversion(req, res) {
    try {
      const { impressionId } = req.params;
      const conversionData = req.body;

      const recorded = await adServingService.recordConversion(impressionId, conversionData);

      if (!recorded) {
        return res.status(404).json({
          success: false,
          message: 'Impression not found'
        });
      }

      res.json({
        success: true,
        message: 'Conversion recorded successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // AI Targeting
  async getAudienceSuggestions(req, res) {
    try {
      const { campaignId } = req.params;
      const { business_type, objective } = req.query;

      const suggestions = await aiAdTargetingService.getAudienceSuggestions(
        campaignId,
        business_type,
        objective
      );

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async optimizeTargeting(req, res) {
    try {
      const { campaignId } = req.params;
      const optimization = await aiAdTargetingService.optimizeTargeting(campaignId);

      res.json({
        success: true,
        data: optimization
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async predictAdPerformance(req, res) {
    try {
      const { campaignId } = req.params;
      const targetingOptions = req.body;

      const prediction = await aiAdTargetingService.predictAdPerformance(
        campaignId,
        targetingOptions
      );

      res.json({
        success: true,
        data: prediction
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Analytics
  async getAdPerformance(req, res) {
    try {
      const filters = req.query;
      const performance = await adServingService.getAdPerformance(filters);

      res.json({
        success: true,
        data: performance
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getPlacementPerformance(req, res) {
    try {
      const { placementId } = req.params;
      const { start_date, end_date } = req.query;

      const performance = await adServingService.getPlacementPerformance(
        placementId,
        start_date,
        end_date
      );

      res.json({
        success: true,
        data: performance
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin Functions
  async getAllAdvertisers(req, res) {
    try {
      const { page = 1, limit = 20, ...filters } = req.query;

      const result = await advertiserService.getAdvertisers(
        parseInt(page),
        parseInt(limit),
        filters
      );

      res.json({
        success: true,
        data: result.advertisers,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async verifyAdvertiser(req, res) {
    try {
      const { advertiserId } = req.params;
      const { status, verification_documents } = req.body;

      const verified = await advertiserService.verifyAdvertiser(
        advertiserId,
        status,
        verification_documents
      );

      if (!verified) {
        return res.status(404).json({
          success: false,
          message: 'Advertiser not found'
        });
      }

      res.json({
        success: true,
        message: `Advertiser ${status} successfully`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllCampaigns(req, res) {
    try {
      const { page = 1, limit = 20, ...filters } = req.query;

      const result = await adCampaignService.getAllCampaigns(
        parseInt(page),
        parseInt(limit),
        filters
      );

      res.json({
        success: true,
        data: result.campaigns,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateCampaignStatus(req, res) {
    try {
      const { campaignId } = req.params;
      const { status, reason } = req.body;

      const updated = await adCampaignService.updateCampaignStatus(campaignId, status, reason);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      res.json({
        success: true,
        message: `Campaign ${status} successfully`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getCreativesForApproval(req, res) {
    try {
      const { page = 1, limit = 20, ...filters } = req.query;

      const result = await adCreativeService.getCreativesForApproval(
        parseInt(page),
        parseInt(limit),
        filters
      );

      res.json({
        success: true,
        data: result.creatives,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateCreativeStatus(req, res) {
    try {
      const { creativeId } = req.params;
      const { status, rejection_reason } = req.body;

      const updated = await adCreativeService.updateCreativeStatus(
        creativeId,
        status,
        rejection_reason
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Creative not found'
        });
      }

      res.json({
        success: true,
        message: `Creative ${status} successfully`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AdvertisingController();
