const { executeQuery } = require('../../config/database');

// Helper function to convert relative image paths to absolute URLs
const convertImageUrls = (images, req = null) => {
	if (!Array.isArray(images)) {
		console.warn('convertImageUrls received non-array:', typeof images, images);
		return images || [];
	}
	
	if (images.length === 0) {
		console.warn('convertImageUrls received empty array');
		return [];
	}
	
	// Determine base URL from environment or request
	let baseUrl = process.env.API_URL || process.env.BASE_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:3001';
	
	// Prefer environment variable for production (https://www.reaglex.com)
	if (process.env.NODE_ENV === 'production' || process.env.ENVIRONMENT === 'production') {
		baseUrl = 'https://www.reaglex.com';
		console.log('Using production baseUrl:', baseUrl);
	} else if (req && req.protocol && req.get('host')) {
		// Use request protocol and host for dynamic detection
		baseUrl = `${req.protocol}://${req.get('host')}`;
		console.log('Using baseUrl from request:', baseUrl);
	} else {
		// Fallback
		console.log('Using default baseUrl:', baseUrl);
	}
	
	const converted = images.map(img => {
		// Skip null, undefined, or empty strings
		if (!img || typeof img !== 'string' || img.trim() === '') {
			console.warn('Skipping empty/invalid image:', img);
			return null;
		}
		
		// If already an absolute URL, return as is
		if (img.startsWith('http://') || img.startsWith('https://')) {
			console.log('Already absolute URL:', img);
			return img;
		}
		
		// Convert relative paths to absolute URLs
		if (img.startsWith('/uploads/')) {
			const fullUrl = `${baseUrl}${img}`;
			console.log('Converted relative path:', img, '->', fullUrl);
			return fullUrl;
		}
		
		// If path doesn't start with /, add /uploads/
		const fullUrl = `${baseUrl}/uploads/${img}`;
		console.log('Added /uploads/ prefix:', img, '->', fullUrl);
		return fullUrl;
	}).filter(Boolean); // Remove any null/undefined values
	
	console.log('Final converted URLs:', converted);
	return converted;
};

// Helper function to parse JSON fields from database
const parseCarFields = (car) => {
	if (!car) return car;
	
	// Parse images JSON string to array
	if (car.images) {
		try {
			// Parse JSON if it's a string
			if (typeof car.images === 'string') {
				console.log(`📝 Parsing JSON for car ${car.id}:`, car.images);
				try {
					car.images = JSON.parse(car.images);
				} catch (parseError) {
					console.error(`❌ Failed to parse images JSON for car ${car.id}:`, parseError);
					// Try to treat it as a single path string
					if (car.images.includes('/uploads/')) {
						car.images = [car.images];
					} else {
						car.images = [];
					}
				}
			}
			
			console.log(`📦 Parsed images for car ${car.id} (${car.title}):`, car.images);
			
			// Ensure it's an array
			if (!Array.isArray(car.images)) {
				console.warn(`⚠️ Car ${car.id} images is not an array:`, typeof car.images, car.images);
				car.images = Array.isArray(car.images) ? car.images : [];
			}
			
			// Convert relative paths to absolute URLs
			car.images = convertImageUrls(car.images);
			console.log(`✅ Converted images for car ${car.id} (${car.title}):`, car.images);
		} catch (e) {
			console.error(`❌ Failed to process images for car ${car.id}:`, e);
			car.images = [];
		}
	} else {
		console.log(`⚠️ Car ${car.id} (${car.title}) has no images field`);
		car.images = [];
	}
	
	// Parse features JSON string to array
	if (car.features) {
		try {
			car.features = typeof car.features === 'string' ? JSON.parse(car.features) : car.features;
		} catch (e) {
			console.warn('Failed to parse features JSON:', e);
			car.features = [];
		}
	}
	
	// Parse specifications JSON string to object
	if (car.specifications) {
		try {
			car.specifications = typeof car.specifications === 'string' ? JSON.parse(car.specifications) : car.specifications;
		} catch (e) {
			console.warn('Failed to parse specifications JSON:', e);
			car.specifications = {};
		}
	}
	
	return car;
};

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

	// Add sorting (whitelist fields and directions)
	const validSortFields = ['price', 'year', 'mileage', 'created_at', 'rating'];
	const sortField = validSortFields.includes(filters.sort_by) ? filters.sort_by : 'created_at';
	const sortOrder = (String(filters.sort_order || 'DESC').toUpperCase() === 'ASC') ? 'ASC' : 'DESC';
	query += ` ORDER BY c.${sortField} ${sortOrder}`;

	// Add pagination (sanitize numbers)
	const safeLimit = Number.isFinite(Number(filters.limit)) ? Math.max(1, parseInt(filters.limit, 10)) : 20;
	const safePage = Number.isFinite(Number(filters.page)) ? Math.max(1, parseInt(filters.page, 10)) : 1;
	const offset = (safePage - 1) * safeLimit;
	query += ` LIMIT ${safeLimit} OFFSET ${offset}`;

	const cars = await executeQuery(query, params);
	// Parse JSON fields for each car
	return cars.map(parseCarFields);
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
	// Parse JSON fields for each car
	return cars.map(parseCarFields);
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
	const car = cars[0] || null;
	return parseCarFields(car);
};

const getCarReviews = async (carId, filters) => {
	const safeLimitR = Number.isFinite(Number(filters.limit)) ? Math.max(1, parseInt(filters.limit, 10)) : 20;
	const safePageR = Number.isFinite(Number(filters.page)) ? Math.max(1, parseInt(filters.page, 10)) : 1;
	const offset = (safePageR - 1) * safeLimitR;
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
		LIMIT ${safeLimitR} OFFSET ${offset}
	`;
	
	const reviews = await executeQuery(query, [carId]);
	return reviews;
};

// Seller repository methods
const createCar = async (carData) => {
    const carId = carData.tempId || require('crypto').randomUUID();
    console.log('Creating car with ID:', carId);
    
	const query = `
		INSERT INTO cars (
			id, title, description, brand, model, year, mileage, price, quantity, total_price,
			car_condition, fuel_type, transmission, body_type, number_of_seats, color, location, images,
			status, seller_id
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
		carData.quantity || 1,
		carData.total_price || 0,
		carData.car_condition,
		carData.fuel_type,
		carData.transmission,
		carData.body_type,
		carData.number_of_seats || 5,
		carData.color,
		carData.location,
		carData.images ? JSON.stringify(carData.images) : null,
		carData.status || 'pending',
		carData.seller_id
	];

    await executeQuery(query, params);
    console.log('✅ Car created successfully with images:', carData.images);
    return { id: carId, ...carData };
};

const updateCar = async (carId, updateData) => {
	const allowedFields = [
		'title', 'description', 'brand', 'model', 'year', 'mileage', 'price',
		'currency', 'quantity', 'total_price', 'car_condition', 'fuel_type', 'transmission', 'body_type',
        'color', 'engine_size', 'horsepower', 'vin', 'location', 'latitude',
        'longitude', 'number_of_seats', 'images', 'features', 'is_featured', 'sold_at'
	];

	const updateFields = [];
	const params = [];

	// Check if price or quantity is being updated to auto-calculate total_price
	let shouldUpdateTotal = false;
	let quantity = updateData.quantity;
	let price = updateData.price;

	// If updating price or quantity, calculate total
	if (updateData.price !== undefined || updateData.quantity !== undefined) {
		shouldUpdateTotal = true;
		// Get existing values if not being updated
		if (quantity === undefined && price === undefined) {
			// Both fields exist in update, calculate from them
			quantity = updateData.quantity;
			price = updateData.price;
		}
	}

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

	// Auto-calculate total_price if price or quantity was updated
	if (shouldUpdateTotal && (price !== undefined || quantity !== undefined)) {
		const car = await getCarById(carId);
		const finalQuantity = quantity !== undefined ? quantity : (car.quantity || 1);
		const finalPrice = price !== undefined ? price : (car.price || 0);
		const calculatedTotal = finalQuantity * finalPrice;
		
		updateFields.push('total_price = ?');
		params.push(calculatedTotal);
		console.log(`Auto-calculated total_price: ${calculatedTotal} (qty: ${finalQuantity} × price: ${finalPrice})`);
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
	const safeLimit2 = Number.isFinite(Number(filters.limit)) ? Math.max(1, parseInt(filters.limit, 10)) : 20;
	const safePage2 = Number.isFinite(Number(filters.page)) ? Math.max(1, parseInt(filters.page, 10)) : 1;
	const offset = (safePage2 - 1) * safeLimit2;
	query += ` LIMIT ${safeLimit2} OFFSET ${offset}`;

	const cars = await executeQuery(query, params);
	// Parse JSON fields for each car
	return cars.map(parseCarFields);
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
	const safeLimitF = Number.isFinite(Number(filters.limit)) ? Math.max(1, parseInt(filters.limit, 10)) : 20;
	const safePageF = Number.isFinite(Number(filters.page)) ? Math.max(1, parseInt(filters.page, 10)) : 1;
	const offset = (safePageF - 1) * safeLimitF;
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
		LIMIT ${safeLimitF} OFFSET ${offset}
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
	const safeLimit = Number.isFinite(Number(filters.limit)) ? Math.max(1, parseInt(filters.limit, 10)) : 20;
	const safePage = Number.isFinite(Number(filters.page)) ? Math.max(1, parseInt(filters.page, 10)) : 1;
	const offset = (safePage - 1) * safeLimit;
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
		LIMIT ${safeLimit} OFFSET ${offset}
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
	const safeLimit = Number.isFinite(Number(filters.limit)) ? Math.max(1, parseInt(filters.limit, 10)) : 20;
	const safePage = Number.isFinite(Number(filters.page)) ? Math.max(1, parseInt(filters.page, 10)) : 1;
	const offset = (safePage - 1) * safeLimit;
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
	
	const validSortFieldsAll = ['price','year','mileage','created_at','updated_at','title','status','seller_id'];
	const sortBy = validSortFieldsAll.includes(filters.sort_by) ? filters.sort_by : 'created_at';
	const sortDir = (String(filters.sort_order || 'DESC').toUpperCase() === 'ASC') ? 'ASC' : 'DESC';
	query += ` ORDER BY c.${sortBy} ${sortDir}`;
	query += ` LIMIT ${safeLimit} OFFSET ${offset}`;
	
	return await executeQuery(query, params);
};

const getAllSellers = async (filters) => {
	const safeLimit = Number.isFinite(Number(filters.limit)) ? Math.max(1, parseInt(filters.limit, 10)) : 20;
	const safePage = Number.isFinite(Number(filters.page)) ? Math.max(1, parseInt(filters.page, 10)) : 1;
	const offset = (safePage - 1) * safeLimit;
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
	const validUserSortFields = ['created_at','first_name','last_name','email'];
	const sortByU = validUserSortFields.includes(filters.sort_by) ? filters.sort_by : 'created_at';
	const sortDirU = (String(filters.sort_order || 'DESC').toUpperCase() === 'ASC') ? 'ASC' : 'DESC';
	query += ` ORDER BY u.${sortByU} ${sortDirU}`;
	query += ` LIMIT ${safeLimit} OFFSET ${offset}`;
	
	return await executeQuery(query, params);
};

const getAllBuyers = async (filters) => {
	const safeLimit = Number.isFinite(Number(filters.limit)) ? Math.max(1, parseInt(filters.limit, 10)) : 20;
	const safePage = Number.isFinite(Number(filters.page)) ? Math.max(1, parseInt(filters.page, 10)) : 1;
	const offset = (safePage - 1) * safeLimit;
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
	const validBuyerSortFields = ['created_at','first_name','last_name','email'];
	const sortByB = validBuyerSortFields.includes(filters.sort_by) ? filters.sort_by : 'created_at';
	const sortDirB = (String(filters.sort_order || 'DESC').toUpperCase() === 'ASC') ? 'ASC' : 'DESC';
	query += ` ORDER BY u.${sortByB} ${sortDirB}`;
	query += ` LIMIT ${safeLimit} OFFSET ${offset}`;
	
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
            COALESCE(ROUND(AVG(CASE WHEN status = 'active' THEN price END), 2), 0) AS average_price,
            COALESCE(SUM(views_count), 0) AS total_views,
            COALESCE(ROUND((COUNT(CASE WHEN status = 'sold' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2), 0) AS conversion_rate
        FROM cars c
        WHERE c.seller_id = ?${dateFilter}
    `, params);
    
    // Get total favorites count
    const [favoritesCount] = await executeQuery(`
        SELECT COUNT(*) AS total_favorites
        FROM car_favorites cf
        INNER JOIN cars c ON cf.car_id = c.id
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
        inventory: {
            ...(inventory || { total_vehicles: 0, active_listings: 0, sold_vehicles: 0, average_price: 0 }),
            total_views: inventory?.total_views || 0,
            total_favorites: favoritesCount?.total_favorites || 0,
            conversion_rate: inventory?.conversion_rate || 0
        },
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
