const carsRepo = require('../repositories/cars.repository');

// Validate image paths - ensure they are file paths, not base64 data
const validateImagePaths = (images) => {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.filter(imagePath => {
    if (typeof imagePath !== 'string') {
      console.warn('Invalid image path type:', typeof imagePath);
      return false;
    }

    // Reject base64 data URLs
    if (imagePath.startsWith('data:image/')) {
      console.warn('Base64 image data detected and rejected. Use file upload endpoints instead.');
      return false;
    }

    // Accept file paths (local or external URLs)
    if (imagePath.startsWith('/uploads/') || imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return true;
    }

    console.warn('Invalid image path format:', imagePath);
    return false;
  });
};

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
const createCar = async (sellerId, carData, uploadedFiles = []) => {
	console.log('Creating car with data:', carData);
	console.log('Uploaded files:', uploadedFiles);
	
	// Validate only the truly required fields based on database schema
	const requiredFields = ['title', 'brand', 'model', 'year', 'mileage', 'price', 'car_condition', 'fuel_type', 'transmission', 'body_type', 'color', 'location'];
	
	for (const field of requiredFields) {
		if (!carData[field]) {
			throw new Error(`${field} is required`);
		}
	}

	// Process uploaded files to get image paths
	const imagePaths = uploadedFiles.map(file => {
		// Handle both old format (filename) and new format (path)
		if (file.path) {
			return file.path;
		} else if (file.filename) {
			return `/uploads/cars/${file.filename}`;
		}
		return null;
	}).filter(Boolean);
	
	// Validate image paths to prevent base64 storage
	const validatedImagePaths = validateImagePaths(imagePaths);
	console.log('Image paths:', validatedImagePaths);

	// Set default values for optional fields - only use fields sent by client
	const quantity = parseInt(carData.quantity) || 1;
	const price = parseFloat(carData.price);
	const total_price = quantity * price; // Calculate total
	
	const carRecord = {
		title: carData.title,
		brand: carData.brand,
		model: carData.model,
		year: parseInt(carData.year),
		mileage: parseInt(carData.mileage),
		price: price,
		quantity: quantity,
		total_price: total_price,
		number_of_seats: parseInt(carData.number_of_seats) || 5,
		car_condition: carData.car_condition,
		fuel_type: carData.fuel_type,
		transmission: carData.transmission,
		body_type: carData.body_type,
		color: carData.color,
		location: carData.location,
		description: carData.description || null,
		images: validatedImagePaths.length > 0 ? validatedImagePaths : carData.images || [],
		status: carData.status || 'pending', // Default to pending for admin review
		seller_id: sellerId,
		tempId: carData.tempCarId // Pass the temp ID
	};

	return carsRepo.createCar(carRecord);
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

	// Validate images if provided
	if (updateData.images !== undefined) {
		updateData.images = validateImagePaths(updateData.images || []);
	}

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
    const updated = await carsRepo.updateCarStatus(carId, status, reason);
    // If sold, set sold_at timestamp if not already set
    if (updated && status === 'sold' && !updated.sold_at) {
        await carsRepo.updateCar(carId, { sold_at: new Date() });
        return carsRepo.getCarById(carId);
    }
    return updated;
};

// Seller-specific status update
const updateSellerCarStatus = async (carId, sellerId, status) => {
	// Check if car exists and belongs to seller
	const existingCar = await carsRepo.getCarById(carId);
	if (!existingCar) {
		throw new Error('Car not found');
	}
	if (existingCar.seller_id !== sellerId) {
		throw new Error('Unauthorized to update this car');
	}

	// Validate status
	const validStatuses = ['active', 'pending', 'sold', 'inactive'];
	if (!validStatuses.includes(status)) {
		throw new Error('Invalid status');
	}

	// Update status
	const updated = await carsRepo.updateCarStatus(carId, status);
	
	// If sold, set sold_at timestamp
	if (updated && status === 'sold' && !updated.sold_at) {
		await carsRepo.updateCar(carId, { sold_at: new Date() });
		return carsRepo.getCarById(carId);
	}
	
	return updated;
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

// Seller respond to a review
const respondToReview = async (reviewId, sellerId, responseText) => {
    // Ensure review exists and belongs to a car owned by seller
    const review = await executeGetReviewWithCar(reviewId);
    if (!review) return null;
    if (review.seller_id !== sellerId) throw new Error('Unauthorized to respond to this review');

    // Insert or update seller response
    return carsRepo.addOrUpdateReviewResponse(reviewId, sellerId, responseText);
};

const executeGetReviewWithCar = async (reviewId) => {
    const { executeQuery } = require('../../config/database');
    const rows = await executeQuery(`
        SELECT r.id as review_id, c.seller_id
        FROM car_reviews r
        JOIN cars c ON r.car_id = c.id
        WHERE r.id = ?
    `, [reviewId]);
    return rows[0] || null;
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
    respondToReview
};

// Seller analytics (cars)
const getSellerAnalyticsStats = async (sellerId, filters = {}) => {
    const { start_date, end_date } = filters;
    return carsRepo.getSellerAnalyticsStats(sellerId, { start_date, end_date });
};

const getSellerAnalyticsSeries = async (sellerId, filters = {}) => {
    const { start_date, end_date } = filters;
    return carsRepo.getSellerAnalyticsSeries(sellerId, { start_date, end_date });
};

module.exports.getSellerAnalyticsStats = getSellerAnalyticsStats;
module.exports.getSellerAnalyticsSeries = getSellerAnalyticsSeries;