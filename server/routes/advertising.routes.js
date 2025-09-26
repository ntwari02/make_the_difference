const express = require('express');
const { validationResult } = require('express-validator');
const router = express.Router();
const advertisingController = require('../controllers/advertising.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth');
const { validateAdvertiser, validateCampaign, validateCreative } = require('../validators/advertising.validators');

// Validation middleware
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  return next();
};

// Advertiser Routes
router.post('/advertisers',
  authenticate,
  validateAdvertiser.create,
  handleValidation,
  advertisingController.createAdvertiser
);

router.get('/advertisers/:advertiserId',
  authenticate,
  advertisingController.getAdvertiser
);

router.put('/advertisers/:advertiserId',
  authenticate,
  validateAdvertiser.update,
  handleValidation,
  advertisingController.updateAdvertiser
);

router.get('/advertisers/:advertiserId/stats',
  authenticate,
  advertisingController.getAdvertiserStats
);

// Campaign Routes
router.post('/advertisers/:advertiserId/campaigns',
  authenticate,
  validateCampaign.create,
  handleValidation,
  advertisingController.createCampaign
);

router.get('/campaigns/:campaignId',
  authenticate,
  advertisingController.getCampaign
);

router.get('/advertisers/:advertiserId/campaigns',
  authenticate,
  advertisingController.getCampaigns
);

router.put('/campaigns/:campaignId',
  authenticate,
  validateCampaign.update,
  handleValidation,
  advertisingController.updateCampaign
);

router.post('/campaigns/:campaignId/submit',
  authenticate,
  advertisingController.submitCampaignForApproval
);

router.put('/campaigns/:campaignId/status',
  authenticate,
  advertisingController.toggleCampaignStatus
);

router.get('/campaigns/:campaignId/performance',
  authenticate,
  advertisingController.getCampaignPerformance
);

// Creative Routes
router.post('/campaigns/:campaignId/creatives',
  authenticate,
  validateCreative.create,
  handleValidation,
  advertisingController.createCreative
);

router.get('/creatives/:creativeId',
  authenticate,
  advertisingController.getCreative
);

router.get('/campaigns/:campaignId/creatives',
  authenticate,
  advertisingController.getCreativesByCampaign
);

router.put('/creatives/:creativeId',
  authenticate,
  validateCreative.update,
  handleValidation,
  advertisingController.updateCreative
);

router.get('/creatives/:creativeId/performance',
  authenticate,
  advertisingController.getCreativePerformance
);

// Ad Serving Routes
router.post('/placements/:placementId/serve',
  advertisingController.serveAd
);

router.post('/impressions/:impressionId/click',
  advertisingController.recordClick
);

router.post('/impressions/:impressionId/conversion',
  advertisingController.recordConversion
);

// AI Targeting Routes
router.get('/campaigns/:campaignId/audience-suggestions',
  authenticate,
  advertisingController.getAudienceSuggestions
);

router.get('/campaigns/:campaignId/optimize-targeting',
  authenticate,
  advertisingController.optimizeTargeting
);

router.post('/campaigns/:campaignId/predict-performance',
  authenticate,
  advertisingController.predictAdPerformance
);

// Analytics Routes
router.get('/analytics/performance',
  authenticate,
  advertisingController.getAdPerformance
);

router.get('/placements/:placementId/performance',
  authenticate,
  advertisingController.getPlacementPerformance
);

// Admin Routes
router.get('/admin/advertisers',
  authenticate,
  authorizeRoles('admin'),
  advertisingController.getAllAdvertisers
);

router.put('/admin/advertisers/:advertiserId/verify',
  authenticate,
  authorizeRoles('admin'),
  advertisingController.verifyAdvertiser
);

router.get('/admin/campaigns',
  authenticate,
  authorizeRoles('admin'),
  advertisingController.getAllCampaigns
);

router.put('/admin/campaigns/:campaignId/status',
  authenticate,
  authorizeRoles('admin'),
  advertisingController.updateCampaignStatus
);

router.get('/admin/creatives/approval',
  authenticate,
  authorizeRoles('admin'),
  advertisingController.getCreativesForApproval
);

router.put('/admin/creatives/:creativeId/status',
  authenticate,
  authorizeRoles('admin'),
  advertisingController.updateCreativeStatus
);

module.exports = router;
