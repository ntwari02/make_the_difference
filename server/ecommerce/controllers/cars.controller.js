const { ok, created, notFound, badRequest } = require('../../utils/response');
const service = require('../services/cars.service');

// Public routes
const listCars = async (req, res) => {
	try {
		const cars = await service.listCars(req.query);
		return ok(res, cars);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

const searchCars = async (req, res) => {
	try {
		const cars = await service.searchCars(req.query);
		return ok(res, cars);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

const getCar = async (req, res) => {
	try {
		const car = await service.getCarById(req.params.id);
		if (!car) return notFound(res, 'Car not found');
		return ok(res, car);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

const getCarReviews = async (req, res) => {
	try {
		const reviews = await service.getCarReviews(req.params.id, req.query);
		return ok(res, reviews);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

// Seller routes
const createCar = async (req, res) => {
	try {
		const uploadedFiles = req.files || [];
		const car = await service.createCar(req.user.id, req.body, uploadedFiles);
		return created(res, car);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

const updateCar = async (req, res) => {
	try {
		const car = await service.updateCar(req.params.id, req.user.id, req.body);
		if (!car) return notFound(res, 'Car not found or unauthorized');
		return ok(res, car);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

const deleteCar = async (req, res) => {
	try {
		const result = await service.deleteCar(req.params.id, req.user.id);
		if (!result) return notFound(res, 'Car not found or unauthorized');
		return ok(res, { message: 'Car deleted successfully' });
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

const getMyCars = async (req, res) => {
	try {
		const cars = await service.getCarsBySeller(req.user.id, req.query);
		
		// Convert image URLs to absolute URLs
		const convertImageUrls = (images) => {
			if (!Array.isArray(images)) return images || [];
			
			let baseUrl = process.env.API_URL || process.env.BASE_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:3001';
			
			// Prefer production URL in production environment
			if (process.env.NODE_ENV === 'production' || process.env.ENVIRONMENT === 'production') {
				baseUrl = 'https://www.reaglex.com';
			} else if (req && req.protocol && req.get('host')) {
				baseUrl = `${req.protocol}://${req.get('host')}`;
			}
			
			return images.map(img => {
				if (img && (img.startsWith('http://') || img.startsWith('https://'))) {
					return img;
				}
				if (img && img.startsWith('/uploads/')) {
					return `${baseUrl}${img}`;
				}
				return img;
			}).filter(Boolean);
		};
		
		// Process each car's images
		const carsWithAbsoluteUrls = Array.isArray(cars) ? cars.map(car => {
			if (car.images) {
				try {
					car.images = typeof car.images === 'string' ? JSON.parse(car.images) : car.images;
					car.images = convertImageUrls(car.images);
				} catch (e) {
					console.warn('Failed to parse images JSON:', e);
					car.images = [];
				}
			} else {
				car.images = [];
			}
			return car;
		}) : cars;
		
		return ok(res, carsWithAbsoluteUrls);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

// Buyer routes
const addToFavorites = async (req, res) => {
	try {
		const favorite = await service.addToFavorites(req.user.id, req.params.id);
		return created(res, favorite);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

const removeFromFavorites = async (req, res) => {
	try {
		const result = await service.removeFromFavorites(req.user.id, req.params.id);
		if (!result) return notFound(res, 'Favorite not found');
		return ok(res, { message: 'Removed from favorites' });
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

const getFavorites = async (req, res) => {
	try {
		const favorites = await service.getUserFavorites(req.user.id, req.query);
		return ok(res, favorites);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

const createReview = async (req, res) => {
	try {
		const review = await service.createReview(req.user.id, req.params.id, req.body);
		return created(res, review);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

// Seller reply to a review
const respondToReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { response } = req.body || {};
        if (!response || String(response).trim() === '') {
            return badRequest(res, 'Response text is required');
        }
        const okResp = await service.respondToReview(reviewId, req.user.id, response);
        if (!okResp) return notFound(res, 'Review not found');
        return ok(res, { message: 'Response added' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

// Seller analytics (cars)
const getSellerAnalyticsStats = async (req, res) => {
    try {
        const data = await service.getSellerAnalyticsStats(req.user.id, req.query);
        return ok(res, data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getSellerAnalyticsSeries = async (req, res) => {
    try {
        const data = await service.getSellerAnalyticsSeries(req.user.id, req.query);
        return ok(res, data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Admin routes
const updateCarStatus = async (req, res) => {
	try {
		const car = await service.updateCarStatus(req.params.id, req.body.status, req.body.reason);
		if (!car) return notFound(res, 'Car not found');
		return ok(res, car);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

// Seller-specific status update
const updateSellerCarStatus = async (req, res) => {
	try {
		const car = await service.updateSellerCarStatus(req.params.id, req.user.id, req.body.status);
		if (!car) return notFound(res, 'Car not found or unauthorized');
		return ok(res, car);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

const getPendingCars = async (req, res) => {
	try {
		const cars = await service.getPendingCars(req.query);
		return ok(res, cars);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

// Admin-only routes - Full e-commerce management
const getAllCars = async (req, res) => {
	try {
		const cars = await service.getAllCars(req.query);
		return ok(res, cars);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

const getAllSellers = async (req, res) => {
	try {
		const sellers = await service.getAllSellers(req.query);
		return ok(res, sellers);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

const getAllBuyers = async (req, res) => {
	try {
		const buyers = await service.getAllBuyers(req.query);
		return ok(res, buyers);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

const getEcommerceAnalytics = async (req, res) => {
	try {
		const analytics = await service.getEcommerceAnalytics(req.query);
		return ok(res, analytics);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

const forceUpdateCar = async (req, res) => {
	try {
		const car = await service.forceUpdateCar(req.params.id, req.body);
		if (!car) return notFound(res, 'Car not found');
		return ok(res, car);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

const forceDeleteCar = async (req, res) => {
	try {
		const result = await service.forceDeleteCar(req.params.id);
		if (!result) return notFound(res, 'Car not found');
		return ok(res, { message: 'Car force deleted successfully' });
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

const getAllReviews = async (req, res) => {
	try {
		const reviews = await service.getAllReviews(req.query);
		return ok(res, reviews);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

const updateReviewStatus = async (req, res) => {
	try {
		const review = await service.updateReviewStatus(req.params.reviewId, req.body.status, req.body.reason);
		if (!review) return notFound(res, 'Review not found');
		return ok(res, review);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

module.exports = {
	listCars,
	searchCars,
	getCar,
	getCarReviews,
	createCar,
	updateCar,
	deleteCar,
	getMyCars,
	addToFavorites,
	removeFromFavorites,
	getFavorites,
	createReview,
	updateCarStatus,
	updateSellerCarStatus,
	getPendingCars,
	// Admin methods
	getAllCars,
	getAllSellers,
	getAllBuyers,
	getEcommerceAnalytics,
	forceUpdateCar,
	forceDeleteCar,
	getAllReviews,
    updateReviewStatus,
    getSellerAnalyticsStats,
    getSellerAnalyticsSeries,
    respondToReview
};
