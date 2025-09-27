const express = require('express');
const { validationResult } = require('express-validator');
const { authenticate, authorizeRoles } = require('../../middlewares/auth');
const ctrl = require('../controllers/cars.controller');
const v = require('../validators/cars.validators');

const router = express.Router();

const handleValidation = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	return next();
};

// Public routes (no authentication required)
router.get('/', ctrl.listCars);
router.get('/search', ctrl.searchCars);
router.get('/:id', ctrl.getCar);
router.get('/:id/reviews', ctrl.getCarReviews);

// Seller routes (authentication required)
router.post('/', authenticate, authorizeRoles('seller', 'admin'), v.validateCreateCar, handleValidation, ctrl.createCar);
router.patch('/:id', authenticate, authorizeRoles('seller', 'admin'), v.validateUpdateCar, handleValidation, ctrl.updateCar);
router.delete('/:id', authenticate, authorizeRoles('seller', 'admin'), ctrl.deleteCar);
router.get('/seller/my-cars', authenticate, authorizeRoles('seller', 'admin'), ctrl.getMyCars);

// Buyer routes (authentication required)
router.post('/:id/favorite', authenticate, authorizeRoles('buyer', 'admin'), ctrl.addToFavorites);
router.delete('/:id/favorite', authenticate, authorizeRoles('buyer', 'admin'), ctrl.removeFromFavorites);
router.get('/buyer/favorites', authenticate, authorizeRoles('buyer', 'admin'), ctrl.getFavorites);
router.post('/:id/review', authenticate, authorizeRoles('buyer', 'admin'), v.validateCreateReview, handleValidation, ctrl.createReview);

// Admin routes - Full e-commerce management access
router.patch('/:id/status', authenticate, authorizeRoles('admin'), v.validateUpdateStatus, handleValidation, ctrl.updateCarStatus);
router.get('/admin/pending', authenticate, authorizeRoles('admin'), ctrl.getPendingCars);
router.get('/admin/all-cars', authenticate, authorizeRoles('admin'), ctrl.getAllCars);
router.get('/admin/sellers', authenticate, authorizeRoles('admin'), ctrl.getAllSellers);
router.get('/admin/buyers', authenticate, authorizeRoles('admin'), ctrl.getAllBuyers);
router.get('/admin/analytics', authenticate, authorizeRoles('admin'), ctrl.getEcommerceAnalytics);
router.patch('/admin/:id/force-update', authenticate, authorizeRoles('admin'), v.validateUpdateCar, handleValidation, ctrl.forceUpdateCar);
router.delete('/admin/:id/force-delete', authenticate, authorizeRoles('admin'), ctrl.forceDeleteCar);
router.get('/admin/reviews/all', authenticate, authorizeRoles('admin'), ctrl.getAllReviews);
router.patch('/admin/reviews/:reviewId/status', authenticate, authorizeRoles('admin'), ctrl.updateReviewStatus);

module.exports = router;
