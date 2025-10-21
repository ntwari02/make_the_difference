const carsRepo = require('../repositories/cars.repository');

// Public services
const listCars = async (filters = {}) => {
	const {
		page = 1,
		limit = 20,
		brand,
		model,
		year_min,
		year_max,
		price_min,
		price_max,
		fuel_type,
		transmission,
		body_type,
		car_condition,
		location,
		sort_by = 'created_at',
		sort_order = 'DESC'
	} = filters;

	return carsRepo.listCars({
		page: parseInt(page),
		limit: parseInt(limit),
		brand,
		model,
		year_min: year_min ? parseInt(year_min) : null,
		year_max: year_max ? parseInt(year_max) : null,
		price_min: price_min ? parseFloat(price_min) : null,
		price_max: price_max ? parseFloat(price_max) : null,
		fuel_type,
		transmission,
		body_type,
		car_condition,
		location,
		sort_by,
		sort_order
	});
};

const searchCars = async (searchParams = {}) => {
	const { q, ...filters } = searchParams;
	return carsRepo.searchCars(q, filters);
};

const getCarById = async (carId) => {
	return carsRepo.getCarById(carId);
};

const getCarReviews = async (carId, filters = {}) => {
	const { page = 1, limit = 10 } = filters;
	return carsRepo.getCarReviews(carId, {
		page: parseInt(page),
		limit: parseInt(limit)
	});
};

// Seller services
const createCar = async (sellerId, carData) => {
	// Validate required fields
	const requiredFields = ['title', 'brand', 'model', 'year', 'mileage', 'price', 'car_condition', 'fuel_type', 'transmission', 'body_type', 'color', 'location'];
	
	for (const field of requiredFields) {
		if (!carData[field]) {
			throw new Error(`${field} is required`);
		}
	}

	// Set default status based on seller verification
	const seller = await carsRepo.getSellerById(sellerId);
	const defaultStatus = seller?.is_verified ? 'active' : 'pending';

	return carsRepo.createCar({
		...carData,
		seller_id: sellerId,
		status: defaultStatus
	});
};

const updateCar = async (carId, sellerId, updateData) => {
	// Check if car exists and belongs to seller
	const existingCar = await carsRepo.getCarById(carId);
	if (!existingCar) {
		throw new Error('Car not found');
	}
	if (existingCar.seller_id !== sellerId) {
		throw new Error('Unauthorized to update this car');
	}

	// Don't allow updating status directly
	delete updateData.status;
	delete updateData.seller_id;

	return carsRepo.updateCar(carId, updateData);
};

const deleteCar = async (carId, sellerId) => {
	// Check if car exists and belongs to seller
	const existingCar = await carsRepo.getCarById(carId);
	if (!existingCar) {
		return false;
	}
	if (existingCar.seller_id !== sellerId) {
		throw new Error('Unauthorized to delete this car');
	}

	return carsRepo.deleteCar(carId);
};

const getCarsBySeller = async (sellerId, filters = {}) => {
	const { page = 1, limit = 20, status } = filters;
	return carsRepo.getCarsBySeller(sellerId, {
		page: parseInt(page),
		limit: parseInt(limit),
		status
	});
};

// Buyer services
const addToFavorites = async (userId, carId) => {
	// Check if car exists
	const car = await carsRepo.getCarById(carId);
	if (!car) {
		throw new Error('Car not found');
	}

	return carsRepo.addToFavorites(userId, carId);
};

const removeFromFavorites = async (userId, carId) => {
	return carsRepo.removeFromFavorites(userId, carId);
};

const getUserFavorites = async (userId, filters = {}) => {
	const { page = 1, limit = 20 } = filters;
	return carsRepo.getUserFavorites(userId, {
		page: parseInt(page),
		limit: parseInt(limit)
	});
};

const createReview = async (userId, carId, reviewData) => {
	// Check if car exists
	const car = await carsRepo.getCarById(carId);
	if (!car) {
		throw new Error('Car not found');
	}

	// Check if user has already reviewed this car
	const existingReview = await carsRepo.getUserReview(userId, carId);
	if (existingReview) {
		throw new Error('You have already reviewed this car');
	}

	return carsRepo.createReview({
		car_id: carId,
		user_id: userId,
		rating: reviewData.rating,
		comment: reviewData.comment
	});
};

// Admin services
const updateCarStatus = async (carId, status, reason = null) => {
	const validStatuses = ['active', 'pending', 'sold', 'draft', 'rejected'];
	if (!validStatuses.includes(status)) {
		throw new Error('Invalid status');
	}

	return carsRepo.updateCarStatus(carId, status, reason);
};

const getPendingCars = async (filters = {}) => {
	const { page = 1, limit = 20 } = filters;
	return carsRepo.getPendingCars({
		page: parseInt(page),
		limit: parseInt(limit)
	});
};

// Admin-only services - Full e-commerce management
const getAllCars = async (filters = {}) => {
	const {
		page = 1,
		limit = 50,
		status,
		seller_id,
		created_from,
		created_to,
		sort_by = 'created_at',
		sort_order = 'DESC'
	} = filters;

	return carsRepo.getAllCars({
		page: parseInt(page),
		limit: parseInt(limit),
		status,
		seller_id,
		created_from,
		created_to,
		sort_by,
		sort_order
	});
};

const getAllSellers = async (filters = {}) => {
	const {
		page = 1,
		limit = 20,
		search,
		status = 'active',
		sort_by = 'created_at',
		sort_order = 'DESC'
	} = filters;

	return carsRepo.getAllSellers({
		page: parseInt(page),
		limit: parseInt(limit),
		search,
		status,
		sort_by,
		sort_order
	});
};

const getAllBuyers = async (filters = {}) => {
	const {
		page = 1,
		limit = 20,
		search,
		status = 'active',
		sort_by = 'created_at',
		sort_order = 'DESC'
	} = filters;

	return carsRepo.getAllBuyers({
		page: parseInt(page),
		limit: parseInt(limit),
		search,
		status,
		sort_by,
		sort_order
	});
};

const getEcommerceAnalytics = async (filters = {}) => {
	const {
		period = '30d', // 7d, 30d, 90d, 1y
		start_date,
		end_date
	} = filters;

	return carsRepo.getEcommerceAnalytics({
		period,
		start_date,
		end_date
	});
};

const forceUpdateCar = async (carId, updateData) => {
	// Admin can update any car without ownership checks
	return carsRepo.forceUpdateCar(carId, updateData);
};

const forceDeleteCar = async (carId) => {
	// Admin can delete any car without ownership checks
	return carsRepo.forceDeleteCar(carId);
};

const getAllReviews = async (filters = {}) => {
	const {
		page = 1,
		limit = 20,
		status = 'approved',
		rating_min,
		rating_max,
		car_id,
		user_id,
		sort_by = 'created_at',
		sort_order = 'DESC'
	} = filters;

	return carsRepo.getAllReviews({
		page: parseInt(page),
		limit: parseInt(limit),
		status,
		rating_min: rating_min ? parseInt(rating_min) : null,
		rating_max: rating_max ? parseInt(rating_max) : null,
		car_id,
		user_id,
		sort_by,
		sort_order
	});
};

const updateReviewStatus = async (reviewId, status, reason = null) => {
	const validStatuses = ['pending', 'approved', 'rejected'];
	if (!validStatuses.includes(status)) {
		throw new Error('Invalid review status');
	}

	return carsRepo.updateReviewStatus(reviewId, status, reason);
};

// Seller inventory management services
const getSellerInventoryStats = async (sellerId) => {
  return carsRepo.getSellerInventoryStats(sellerId);
};

const getSellerInventoryAnalytics = async (sellerId, filters = {}) => {
  return carsRepo.getSellerInventoryAnalytics(sellerId, filters);
};

const bulkUpdateCarStatus = async (sellerId, carIds, status) => {
  const allowedStatusesForSeller = ['active', 'draft'];
  if (!allowedStatusesForSeller.includes(status)) {
    throw new Error('Invalid status for seller');
  }

  return carsRepo.bulkUpdateCarStatus(sellerId, carIds, status);
};

const getSellerCarViews = async (sellerId, filters = {}) => {
  return carsRepo.getSellerCarViews(sellerId, filters);
};

// Seller-only: update own car status (limited statuses)
const updateCarStatusBySeller = async (carId, sellerId, status) => {
  const allowedStatusesForSeller = ['active', 'draft'];
  if (!allowedStatusesForSeller.includes(status)) {
    throw new Error('Invalid status for seller');
  }

  const existingCar = await carsRepo.getCarById(carId);
  if (!existingCar) {
    throw new Error('Car not found');
  }
  if (existingCar.seller_id !== sellerId) {
    throw new Error('Unauthorized to update this car status');
  }

  return carsRepo.updateCarStatus(carId, status, null);
};

module.exports = {
	listCars,
	searchCars,
	getCarById,
	getCarReviews,
	createCar,
	updateCar,
	deleteCar,
	getCarsBySeller,
	addToFavorites,
	removeFromFavorites,
	getUserFavorites,
	createReview,
	updateCarStatus,
	getPendingCars,
	// Seller inventory services
	getSellerInventoryStats,
	getSellerInventoryAnalytics,
	bulkUpdateCarStatus,
	getSellerCarViews,
	updateCarStatusBySeller,
	// Admin methods
	getAllCars,
	getAllSellers,
	getAllBuyers,
	getEcommerceAnalytics,
	forceUpdateCar,
	forceDeleteCar,
	getAllReviews,
	updateReviewStatus
};
