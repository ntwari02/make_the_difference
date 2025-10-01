const express = require('express');
const { validationResult } = require('express-validator');
const router = express.Router();
const dealerController = require('../controllers/dealer.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth');
const { validateDealer, validateVehicle } = require('../validators/dealer.validators');

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

// Dealer Profile Routes
router.post('/profile',
  authenticate,
  authorizeRoles(['dealer']),
  validateDealer.create,
  handleValidation,
  dealerController.createDealerProfile
);

router.get('/profile/my',
  authenticate,
  authorizeRoles(['dealer']),
  dealerController.getMyDealerProfile
);

router.get('/profile/:dealerId',
  dealerController.getDealerProfile
);

router.put('/profile/:dealerId',
  authenticate,
  authorizeRoles(['dealer', 'admin']),
  validateDealer.update,
  handleValidation,
  dealerController.updateDealerProfile
);

router.get('/profile/:dealerId/stats',
  authenticate,
  dealerController.getDealerStats
);

// Dealer Inventory Routes
router.get('/profile/:dealerId/inventory',
  dealerController.getDealerInventory
);

router.post('/profile/:dealerId/inventory',
  authenticate,
  authorizeRoles(['dealer']),
  validateVehicle.create,
  handleValidation,
  dealerController.addVehicleToInventory
);

router.put('/profile/:dealerId/inventory/:vehicleId',
  authenticate,
  authorizeRoles(['dealer']),
  validateVehicle.update,
  handleValidation,
  dealerController.updateVehicleInInventory
);

router.delete('/profile/:dealerId/inventory/:vehicleId',
  authenticate,
  authorizeRoles(['dealer']),
  dealerController.removeVehicleFromInventory
);

// Dealer Reviews Routes
router.get('/profile/:dealerId/reviews',
  dealerController.getDealerReviews
);

// Dealer Analytics Routes
router.get('/profile/:dealerId/analytics',
  authenticate,
  authorizeRoles(['dealer', 'admin']),
  dealerController.getDealerSalesAnalytics
);

// Search and Discovery Routes
router.get('/search',
  dealerController.searchDealers
);

// Admin Routes
router.get('/admin/all',
  authenticate,
  authorizeRoles(['admin']),
  dealerController.getAllDealers
);

router.put('/admin/:dealerId/verify',
  authenticate,
  authorizeRoles(['admin']),
  dealerController.verifyDealer
);

router.put('/admin/:dealerId/status',
  authenticate,
  authorizeRoles(['admin']),
  dealerController.updateDealerStatus
);

module.exports = router;
