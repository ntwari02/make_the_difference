const express = require('express');
const { validationResult } = require('express-validator');
const { authenticate, authorizeRoles } = require('../../middlewares/auth');
const ctrl = require('../controllers/spare-parts.controller');
const v = require('../validators/spare-parts.validators');

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return next();
};

// Public routes (no authentication required)
router.get('/search', v.validateSearchSpareParts, handleValidation, ctrl.searchSpareParts);
router.get('/categories', ctrl.getCategories);
router.get('/brands', ctrl.getBrands);
router.get('/bundles', v.validateGetBundles, handleValidation, ctrl.getSparePartsBundles);
router.get('/:partId', ctrl.getSparePartById);
router.get('/:partId/price-comparison', ctrl.getPriceComparison);
router.post('/:partId/compatibility', v.validateVehicleCompatibility, handleValidation, ctrl.checkVehicleCompatibility);

// Authenticated routes
router.use(authenticate);

// Wishlist management
router.post('/:partId/wishlist', ctrl.addToWishlist);
router.delete('/:partId/wishlist', ctrl.removeFromWishlist);
router.get('/wishlist/my', v.validateGetWishlist, handleValidation, ctrl.getUserWishlist);

// Price alerts
router.post('/:partId/price-alert', v.validateCreatePriceAlert, handleValidation, ctrl.createPriceAlert);

// Seller routes (requires seller role)
router.post('/', authorizeRoles(['seller', 'admin']), v.validateCreateSparePart, handleValidation, ctrl.createSparePart);
router.get('/analytics/seller', authorizeRoles(['seller', 'admin']), ctrl.getSellerAnalytics);

// Payment routes
router.post('/purchase', v.validateSparePartsPurchase, handleValidation, ctrl.processSparePartsPurchase);
router.post('/bundle/purchase', v.validateBundlePurchase, handleValidation, ctrl.processBundlePurchase);
router.post('/installation/purchase', v.validateInstallationServicePayment, handleValidation, ctrl.processInstallationServicePayment);
router.post('/maintenance-plan/subscribe', v.validateMaintenancePlanSubscription, handleValidation, ctrl.processMaintenancePlanSubscription);

module.exports = router;
