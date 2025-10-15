const { executeQuery } = require('../../config/database');

// Public repository methods
const listCars = async (filters) => {
	let query = `
		SELECT 
			c.*,
			u.first_name as seller_name,
			u.phone as seller_phone,
			d.business_name as dealer_name,
			d.logo as dealer_logo
		FROM cars c
		LEFT JOIN users u ON c.seller_id = u.id
		LEFT JOIN dealers d ON c.dealer_id = d.id
		WHERE c.status = 'active'
	`;
	
	const params = [];
	let paramCount = 0;

	// Apply filters
	if (filters.brand) {
		query += ` AND c.brand = ?`;
		params.push(filters.brand);
	}
	if (filters.model) {
		query += ` AND c.model = ?`;
		params.push(filters.model);
	}
	if (filters.year_min) {
		query += ` AND c.year >= ?`;
		params.push(filters.year_min);
	}
	if (filters.year_max) {
		query += ` AND c.year <= ?`;
		params.push(filters.year_max);
	}
	if (filters.price_min) {
		query += ` AND c.price >= ?`;
		params.push(filters.price_min);
	}
	if (filters.price_max) {
		query += ` AND c.price <= ?`;
		params.push(filters.price_max);
	}
	if (filters.fuel_type) {
		query += ` AND c.fuel_type = ?`;
		params.push(filters.fuel_type);
	}
	if (filters.transmission) {
		query += ` AND c.transmission = ?`;
		params.push(filters.transmission);
	}
	if (filters.body_type) {
		query += ` AND c.body_type = ?`;
		params.push(filters.body_type);
	}
	if (filters.car_condition) {
		query += ` AND c.car_condition = ?`;
		params.push(filters.car_condition);
	}
	if (filters.location) {
		query += ` AND c.location LIKE ?`;
		params.push(`%${filters.location}%`);
	}

	// Add sorting
	const validSortFields = ['price', 'year', 'mileage', 'created_at', 'rating'];
	const sortField = validSortFields.includes(filters.sort_by) ? filters.sort_by : 'created_at';
	const sortOrder = filters.sort_order === 'ASC' ? 'ASC' : 'DESC';
	query += ` ORDER BY c.${sortField} ${sortOrder}`;

	// Add pagination
	const offset = (filters.page - 1) * filters.limit;
	query += ` LIMIT ${filters.limit} OFFSET ${offset}`;

	const cars = await executeQuery(query, params);
	return cars;
};

const searchCars = async (searchTerm, filters) => {
	let query = `
		SELECT 
			c.*,
			u.first_name as seller_name,
			u.phone as seller_phone,
			d.business_name as dealer_name,
			d.logo as dealer_logo
		FROM cars c
		LEFT JOIN users u ON c.seller_id = u.id
		LEFT JOIN dealers d ON c.dealer_id = d.id
		WHERE c.status = 'active'
	`;
	
	const params = [];

	if (searchTerm) {
		query += ` AND (
			c.title LIKE ? OR 
			c.brand LIKE ? OR 
			c.model LIKE ? OR 
			c.description LIKE ?
		)`;
		const searchPattern = `%${searchTerm}%`;
		params.push(searchPattern, searchPattern, searchPattern, searchPattern);
	}

	// Apply other filters (same as listCars)
	if (filters.brand) {
		query += ` AND c.brand = ?`;
		params.push(filters.brand);
	}
	if (filters.price_min) {
		query += ` AND c.price >= ?`;
		params.push(filters.price_min);
	}
	if (filters.price_max) {
		query += ` AND c.price <= ?`;
		params.push(filters.price_max);
	}

	query += ` ORDER BY c.created_at DESC LIMIT 50`;

	const cars = await executeQuery(query, params);
	return cars;
};

const getCarById = async (carId) => {
	const query = `
		SELECT 
			c.*,
			u.first_name as seller_name,
			u.last_name as seller_last_name,
			u.phone as seller_phone,
			u.email as seller_email,
			d.business_name as dealer_name,
			d.logo as dealer_logo,
			d.phone as dealer_phone,
			d.email as dealer_email
		FROM cars c
		LEFT JOIN users u ON c.seller_id = u.id
		LEFT JOIN dealers d ON c.dealer_id = d.id
		WHERE c.id = ?
	`;
	
	const cars = await executeQuery(query, [carId]);
	return cars[0] || null;
};

const getCarReviews = async (carId, filters) => {
	const offset = (filters.page - 1) * filters.limit;
	const query = `
		SELECT 
			cr.*,
			u.first_name,
			u.last_name,
			u.profile_image
		FROM car_reviews cr
		JOIN users u ON cr.user_id = u.id
		WHERE cr.car_id = ?
		ORDER BY cr.created_at DESC
		LIMIT ${filters.limit} OFFSET ${offset}
	`;
	
	const reviews = await executeQuery(query, [carId]);
	return reviews;
};

// Seller repository methods
const createCar = async (carData) => {
    const carId = require('crypto').randomUUID();
	const query = `
		INSERT INTO cars (
			id, title, description, brand, model, year, mileage, price, currency,
			car_condition, fuel_type, transmission, body_type, color, engine_size,
			horsepower, vin, location, latitude, longitude, images, features,
			status, is_featured, seller_id, dealer_id
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`;
	
	const params = [
		carId,
		carData.title,
		carData.description || null,
		carData.brand,
		carData.model,
		carData.year,
		carData.mileage,
		carData.price,
		carData.currency || 'USD',
		carData.car_condition,
		carData.fuel_type,
		carData.transmission,
		carData.body_type,
		carData.color,
		carData.engine_size || null,
		carData.horsepower || null,
		carData.vin || null,
		carData.location,
		carData.latitude || null,
		carData.longitude || null,
		JSON.stringify(carData.images || []),
		JSON.stringify(carData.features || []),
		carData.status || 'pending',
		carData.is_featured || false,
		carData.seller_id,
		carData.dealer_id || null
	];

    await executeQuery(query, params);
    return { id: carId, ...carData };
};

const updateCar = async (carId, updateData) => {
	const allowedFields = [
		'title', 'description', 'brand', 'model', 'year', 'mileage', 'price',
		'currency', 'car_condition', 'fuel_type', 'transmission', 'body_type',
		'color', 'engine_size', 'horsepower', 'vin', 'location', 'latitude',
		'longitude', 'images', 'features', 'is_featured'
	];

	const updateFields = [];
	const params = [];

	for (const [key, value] of Object.entries(updateData)) {
		if (allowedFields.includes(key)) {
			if (key === 'images' || key === 'features') {
				updateFields.push(`${key} = ?`);
				params.push(JSON.stringify(value));
			} else {
				updateFields.push(`${key} = ?`);
				params.push(value);
			}
		}
	}

	if (updateFields.length === 0) {
		throw new Error('No valid fields to update');
	}

	updateFields.push('updated_at = CURRENT_TIMESTAMP');
	params.push(carId);

	const query = `UPDATE cars SET ${updateFields.join(', ')} WHERE id = ?`;
	await executeQuery(query, params);

	return getCarById(carId);
};

const deleteCar = async (carId) => {
	const query = 'DELETE FROM cars WHERE id = ?';
	const result = await executeQuery(query, [carId]);
	return result.affectedRows > 0;
};

const getCarsBySeller = async (sellerId, filters) => {
	let query = `
		SELECT c.*, d.business_name as dealer_name
		FROM cars c
		LEFT JOIN dealers d ON c.dealer_id = d.id
		WHERE c.seller_id = ?
	`;
	
	const params = [sellerId];

	if (filters.status) {
		query += ` AND c.status = ?`;
		params.push(filters.status);
	}

	query += ` ORDER BY c.created_at DESC`;

	// Add pagination
	const offset = (filters.page - 1) * filters.limit;
	query += ` LIMIT ${filters.limit} OFFSET ${offset}`;

	const cars = await executeQuery(query, params);
	return cars;
};

// Buyer repository methods
const addToFavorites = async (userId, carId) => {
	const favoriteId = require('crypto').randomUUID();
	const query = `
		INSERT INTO car_favorites (id, user_id, car_id)
		VALUES (?, ?, ?)
		ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP
	`;
	
	const result = await executeQuery(query, [favoriteId, userId, carId]);
	return { user_id: userId, car_id: carId };
};

const removeFromFavorites = async (userId, carId) => {
	const query = 'DELETE FROM car_favorites WHERE user_id = ? AND car_id = ?';
	const result = await executeQuery(query, [userId, carId]);
	return result.affectedRows > 0;
};

const getUserFavorites = async (userId, filters) => {
	const offset = (filters.page - 1) * filters.limit;
	const query = `
		SELECT 
			c.*,
			cf.created_at as favorited_at,
			u.first_name as seller_name,
			d.business_name as dealer_name
		FROM car_favorites cf
		JOIN cars c ON cf.car_id = c.id
		LEFT JOIN users u ON c.seller_id = u.id
		LEFT JOIN dealers d ON c.dealer_id = d.id
		WHERE cf.user_id = ?
		ORDER BY cf.created_at DESC
		LIMIT ${filters.limit} OFFSET ${offset}
	`;
	
	const favorites = await executeQuery(query, [userId]);
	return favorites;
};

const createReview = async (reviewData) => {
    const reviewId = require('crypto').randomUUID();
	const query = `
		INSERT INTO car_reviews (id, car_id, user_id, rating, comment)
		VALUES (?, ?, ?, ?, ?)
	`;
	
	const params = [
		reviewId,
		reviewData.car_id,
		reviewData.user_id,
		reviewData.rating,
		reviewData.comment || null
	];

    await executeQuery(query, params);
    return { id: reviewId, ...reviewData };
};

const getUserReview = async (userId, carId) => {
	const query = 'SELECT * FROM car_reviews WHERE user_id = ? AND car_id = ?';
	const reviews = await executeQuery(query, [userId, carId]);
	return reviews[0] || null;
};

// Admin repository methods
const updateCarStatus = async (carId, status, reason) => {
	const query = 'UPDATE cars SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
	await executeQuery(query, [status, carId]);
	return getCarById(carId);
};

const getPendingCars = async (filters) => {
	const offset = (filters.page - 1) * filters.limit;
	const query = `
		SELECT 
			c.*,
			u.first_name as seller_name,
			u.last_name as seller_last_name,
			d.business_name as dealer_name
		FROM cars c
		LEFT JOIN users u ON c.seller_id = u.id
		LEFT JOIN dealers d ON c.dealer_id = d.id
		WHERE c.status = 'pending'
		ORDER BY c.created_at ASC
		LIMIT ${filters.limit} OFFSET ${offset}
	`;
	
	const cars = await executeQuery(query, []);
	return cars;
};

const getSellerById = async (sellerId) => {
	const query = 'SELECT * FROM users WHERE id = ? AND role IN ("seller", "admin")';
	const users = await executeQuery(query, [sellerId]);
	return users[0] || null;
};

// Admin-only repository methods - Full e-commerce management
const getAllCars = async (filters) => {
	const offset = (filters.page - 1) * filters.limit;
	let query = `
		SELECT 
			c.*,
			u.first_name as seller_name,
			u.last_name as seller_last_name,
			u.email as seller_email,
			u.phone as seller_phone,
			d.business_name as dealer_name,
			d.logo as dealer_logo
		FROM cars c
		LEFT JOIN users u ON c.seller_id = u.id
		LEFT JOIN dealers d ON c.dealer_id = d.id
		WHERE 1=1
	`;
	
	const params = [];
	
	// Apply filters
	if (filters.status) {
		query += ` AND c.status = ?`;
		params.push(filters.status);
	}
	if (filters.seller_id) {
		query += ` AND c.seller_id = ?`;
		params.push(filters.seller_id);
	}
	if (filters.created_from) {
		query += ` AND c.created_at >= ?`;
		params.push(filters.created_from);
	}
	if (filters.created_to) {
		query += ` AND c.created_at <= ?`;
		params.push(filters.created_to);
	}
	
	query += ` ORDER BY c.${filters.sort_by} ${filters.sort_order}`;
	query += ` LIMIT ${filters.limit} OFFSET ${offset}`;
	
	return await executeQuery(query, params);
};

const getAllSellers = async (filters) => {
	const offset = (filters.page - 1) * filters.limit;
	let query = `
		SELECT 
			u.*,
			COUNT(c.id) as total_cars,
			COUNT(CASE WHEN c.status = 'active' THEN 1 END) as active_cars,
			COUNT(CASE WHEN c.status = 'pending' THEN 1 END) as pending_cars,
			COUNT(CASE WHEN c.status = 'sold' THEN 1 END) as sold_cars
		FROM users u
		LEFT JOIN cars c ON u.id = c.seller_id
		WHERE u.role = 'seller'
	`;
	
	const params = [];
	
	if (filters.search) {
		query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)`;
		const searchTerm = `%${filters.search}%`;
		params.push(searchTerm, searchTerm, searchTerm);
	}
	if (filters.status) {
		query += ` AND u.is_active = ?`;
		params.push(filters.status === 'active' ? 1 : 0);
	}
	
	query += ` GROUP BY u.id`;
	query += ` ORDER BY u.${filters.sort_by} ${filters.sort_order}`;
	query += ` LIMIT ${filters.limit} OFFSET ${offset}`;
	
	return await executeQuery(query, params);
};

const getAllBuyers = async (filters) => {
	const offset = (filters.page - 1) * filters.limit;
	let query = `
		SELECT 
			u.*,
			COUNT(f.id) as total_favorites,
			COUNT(r.id) as total_reviews,
			AVG(r.rating) as avg_rating
		FROM users u
		LEFT JOIN car_favorites f ON u.id = f.user_id
		LEFT JOIN car_reviews r ON u.id = r.user_id
		WHERE u.role = 'buyer'
	`;
	
	const params = [];
	
	if (filters.search) {
		query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)`;
		const searchTerm = `%${filters.search}%`;
		params.push(searchTerm, searchTerm, searchTerm);
	}
	if (filters.status) {
		query += ` AND u.is_active = ?`;
		params.push(filters.status === 'active' ? 1 : 0);
	}
	
	query += ` GROUP BY u.id`;
	query += ` ORDER BY u.${filters.sort_by} ${filters.sort_order}`;
	query += ` LIMIT ${filters.limit} OFFSET ${offset}`;
	
	return await executeQuery(query, params);
};

const getEcommerceAnalytics = async (filters) => {
	const { period, start_date, end_date } = filters;
	
	// Calculate date range
	let dateCondition = '';
	const params = [];
	
	if (start_date && end_date) {
		dateCondition = 'WHERE created_at BETWEEN ? AND ?';
		params.push(start_date, end_date);
	} else {
		const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
		dateCondition = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)';
		params.push(days);
	}
	
	// Get comprehensive analytics with separate queries
	const carStats = await executeQuery(`
		SELECT 
			COUNT(*) as total_cars,
			COUNT(CASE WHEN status = 'active' THEN 1 END) as active_cars,
			COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_cars,
			COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_cars
		FROM cars ${dateCondition}
	`, params);
	
	const userStats = await executeQuery(`
		SELECT 
			COUNT(CASE WHEN role = 'seller' THEN 1 END) as total_sellers,
			COUNT(CASE WHEN role = 'buyer' THEN 1 END) as total_buyers
		FROM users ${dateCondition}
	`, params);
	
	const reviewStats = await executeQuery(`
		SELECT 
			COUNT(*) as total_reviews,
			AVG(rating) as avg_rating
		FROM car_reviews ${dateCondition}
	`, params);
	
	const favoriteStats = await executeQuery(`
		SELECT COUNT(*) as total_favorites
		FROM car_favorites ${dateCondition}
	`, params);
	
	// Combine all statistics
	return {
		...carStats[0],
		...userStats[0],
		...reviewStats[0],
		...favoriteStats[0]
	};
};

const forceUpdateCar = async (carId, updateData) => {
	const fields = [];
	const values = [];
	
	Object.keys(updateData).forEach(key => {
		if (updateData[key] !== undefined) {
			fields.push(`${key} = ?`);
			values.push(updateData[key]);
		}
	});
	
	if (fields.length === 0) {
		throw new Error('No fields to update');
	}
	
	values.push(carId);
	
	const query = `UPDATE cars SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
	await executeQuery(query, values);
	
	return getCarById(carId);
};

const forceDeleteCar = async (carId) => {
	// Delete related data first
	await executeQuery('DELETE FROM car_favorites WHERE car_id = ?', [carId]);
	await executeQuery('DELETE FROM car_reviews WHERE car_id = ?', [carId]);
	
	// Delete the car
	const result = await executeQuery('DELETE FROM cars WHERE id = ?', [carId]);
	return result.affectedRows > 0;
};

const getAllReviews = async (filters) => {
	const offset = (filters.page - 1) * filters.limit;
	let query = `
		SELECT 
			r.*,
			c.brand,
			c.model,
			c.year,
			u.first_name as reviewer_name,
			u.last_name as reviewer_last_name,
			u.email as reviewer_email
		FROM car_reviews r
		JOIN cars c ON r.car_id = c.id
		JOIN users u ON r.user_id = u.id
		WHERE 1=1
	`;
	
	const params = [];
	
	if (filters.status) {
		query += ` AND r.status = ?`;
		params.push(filters.status);
	}
	if (filters.rating_min) {
		query += ` AND r.rating >= ?`;
		params.push(filters.rating_min);
	}
	if (filters.rating_max) {
		query += ` AND r.rating <= ?`;
		params.push(filters.rating_max);
	}
	if (filters.car_id) {
		query += ` AND r.car_id = ?`;
		params.push(filters.car_id);
	}
	if (filters.user_id) {
		query += ` AND r.user_id = ?`;
		params.push(filters.user_id);
	}
	
	query += ` ORDER BY r.${filters.sort_by} ${filters.sort_order}`;
	query += ` LIMIT ${filters.limit} OFFSET ${offset}`;
	
	return await executeQuery(query, params);
};

const updateReviewStatus = async (reviewId, status, reason = null) => {
	const query = `
		UPDATE car_reviews 
		SET status = ?, admin_reason = ?, updated_at = CURRENT_TIMESTAMP 
		WHERE id = ?
	`;
	
	await executeQuery(query, [status, reason, reviewId]);
	
	// Return updated review
	const reviews = await executeQuery(`
		SELECT r.*, c.brand, c.model, c.year, u.first_name, u.last_name
		FROM car_reviews r
		JOIN cars c ON r.car_id = c.id
		JOIN users u ON r.user_id = u.id
		WHERE r.id = ?
	`, [reviewId]);
	
	return reviews[0] || null;
};

// Seller analytics (cars)
const getSellerAnalyticsStats = async (sellerId, { start_date, end_date } = {}) => {
    const params = [sellerId];
    let dateFilter = '';
    if (start_date && end_date) {
        dateFilter = ' AND c.created_at BETWEEN ? AND ?';
        params.push(start_date, end_date);
    }

    const [inventory] = await executeQuery(`
        SELECT 
            COUNT(*) AS total_vehicles,
            COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_listings,
            COUNT(CASE WHEN status = 'sold' THEN 1 END) AS sold_vehicles,
            COALESCE(ROUND(AVG(CASE WHEN status = 'active' THEN price END), 2), 0) AS average_price
        FROM cars c
        WHERE c.seller_id = ?${dateFilter}
    `, params);

    const salesAgg = await executeQuery(`
        SELECT 
            COUNT(*) AS total_sales,
            COALESCE(ROUND(SUM(price), 2), 0) AS total_revenue,
            COALESCE(ROUND(AVG(price), 2), 0) AS average_sale_price
        FROM cars c
        WHERE c.seller_id = ? AND c.status = 'sold'${dateFilter}
    `, params);

    const recentSales = await executeQuery(`
        SELECT id, brand, model, year, price, updated_at AS sold_at
        FROM cars
        WHERE seller_id = ? AND status = 'sold'${dateFilter}
        ORDER BY updated_at DESC
        LIMIT 10
    `, params);

    const monthlySales = await executeQuery(`
        SELECT DATE_FORMAT(updated_at, '%Y-%m') AS month,
               COUNT(*) AS sales_count,
               ROUND(SUM(price), 2) AS monthly_revenue
        FROM cars
        WHERE seller_id = ? AND status = 'sold'${dateFilter}
        GROUP BY DATE_FORMAT(updated_at, '%Y-%m')
        ORDER BY month ASC
    `, params);

    return {
        inventory: inventory || { total_vehicles: 0, active_listings: 0, sold_vehicles: 0, average_price: 0 },
        sales: salesAgg[0] || { total_sales: 0, total_revenue: 0, average_sale_price: 0 },
        recent_sales: recentSales,
        monthly_sales: monthlySales
    };
};

const getSellerAnalyticsSeries = async (sellerId, { start_date, end_date } = {}) => {
    const params = [sellerId];
    let dateFilter = '';
    if (start_date && end_date) {
        dateFilter = ' AND c.updated_at BETWEEN ? AND ?';
        params.push(start_date, end_date);
    }

    const salesByPeriod = await executeQuery(`
        SELECT DATE_FORMAT(updated_at, '%Y-%m') AS period,
               COUNT(*) AS sales_count,
               ROUND(SUM(price), 2) AS total_revenue,
               ROUND(AVG(price), 2) AS average_price
        FROM cars c
        WHERE c.seller_id = ? AND c.status = 'sold'${dateFilter}
        GROUP BY DATE_FORMAT(updated_at, '%Y-%m')
        ORDER BY period ASC
    `, params);

    const topSelling = await executeQuery(`
        SELECT brand AS make, model, COUNT(*) AS sales_count,
               ROUND(SUM(price), 2) AS total_revenue,
               ROUND(AVG(price), 2) AS average_price
        FROM cars c
        WHERE c.seller_id = ? AND c.status = 'sold'${dateFilter}
        GROUP BY brand, model
        ORDER BY sales_count DESC
        LIMIT 10
    `, params);

    return {
        sales_by_period: salesByPeriod,
        top_selling_models: topSelling
    };
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
	getUserReview,
	updateCarStatus,
	getPendingCars,
	getSellerById,
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
	getSellerAnalyticsSeries
};
