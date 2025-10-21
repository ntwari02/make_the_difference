const { executeQuery, pool } = require('../config/database');

const safeParse = (value, fallback) => {
  try {
    if (value === null || value === undefined) return fallback;
    const s = String(value).trim();
    if (s === '' || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') return fallback;
    return JSON.parse(s);
  } catch (_) {
    return fallback;
  }
};

const getSellerProfile = async (userId) => {
  // Join sellers table with users for fallback fields
  const rows = await executeQuery(`
    SELECT 
      s.id as seller_id,
      s.user_id,
      s.business_name,
      s.business_type,
      s.license_number,
      s.description,
      s.address,
      s.city,
      s.state,
      s.country,
      s.postal_code,
      s.phone,
      s.email,
      s.website,
      s.logo,
      s.images,
      s.business_hours,
      s.services,
      s.status,
      s.is_verified,
      s.verification_documents,
      s.created_at,
      s.updated_at,
      u.first_name,
      u.last_name
    FROM sellers s
    JOIN users u ON s.user_id = u.id
    WHERE s.user_id = ?
    LIMIT 1
  `, [userId]);
  if (rows.length === 0) return null;
  const s = rows[0];
  return {
    id: s.seller_id,
    user_id: s.user_id,
    business_name: s.business_name,
    business_type: s.business_type,
    license_number: s.license_number,
    description: s.description,
    address: s.address,
    city: s.city,
    state: s.state,
    country: s.country,
    postal_code: s.postal_code,
    phone: s.phone,
    email: s.email,
    website: s.website,
    logo: s.logo,
    images: safeParse(s.images, []),
    business_hours: safeParse(s.business_hours, {}),
    services: safeParse(s.services, []),
    status: s.status,
    is_verified: !!s.is_verified,
    verification_documents: safeParse(s.verification_documents, []),
    created_at: s.created_at,
    updated_at: s.updated_at,
    contact_name: [s.first_name, s.last_name].filter(Boolean).join(' ')
  };
};

const upsertSellerProfile = async (userId, data = {}) => {
  const existing = await executeQuery(`SELECT id FROM sellers WHERE user_id = ?`, [userId]);
  const json = (v) => (v === undefined ? null : JSON.stringify(v));
  if (existing.length === 0) {
    const id = require('crypto').randomUUID();
    await executeQuery(`
      INSERT INTO sellers (
        id, user_id, business_name, business_type, license_number, description, address, city, state, country, postal_code,
        phone, email, website, logo, images, business_hours, services, status, is_verified, verification_documents
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, userId,
      data.business_name || 'Seller',
      data.business_type || 'individual',
      data.license_number || null,
      data.description || null,
      data.address || null,
      data.city || null,
      data.state || null,
      data.country || null,
      data.postal_code || null,
      data.phone || null,
      data.email || null,
      data.website || null,
      data.logo || null,
      json(data.images),
      json(data.business_hours),
      json(data.services),
      data.status || 'active',
      data.is_verified ? 1 : 0,
      json(data.verification_documents)
    ]);
  } else {
    const fields = [];
    const params = [];
    const assign = (col, val, isJson = false) => {
      if (val !== undefined) {
        fields.push(`${col} = ?`);
        params.push(isJson ? json(val) : val);
      }
    };
    assign('business_name', data.business_name);
    assign('business_type', data.business_type);
    assign('license_number', data.license_number);
    assign('description', data.description);
    assign('address', data.address);
    assign('city', data.city);
    assign('state', data.state);
    assign('country', data.country);
    assign('postal_code', data.postal_code);
    assign('phone', data.phone);
    assign('email', data.email);
    assign('website', data.website);
    assign('logo', data.logo);
    assign('images', data.images, true);
    assign('business_hours', data.business_hours, true);
    assign('services', data.services, true);
    assign('status', data.status);
    if (data.is_verified !== undefined) assign('is_verified', data.is_verified ? 1 : 0);
    assign('verification_documents', data.verification_documents, true);
    if (fields.length > 0) {
      params.push(userId);
      await executeQuery(`UPDATE sellers SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`, params);
    }
  }
  return getSellerProfile(userId);
};

// Seller Settings
const getSellerSettings = async (userId) => {
  const rows = await executeQuery(
    `SELECT notifications, privacy, preferences, created_at, updated_at FROM seller_settings WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  if (rows.length === 0) {
    return {
      notifications: { email: true, push: true, sms: false, newInquiries: true, newOffers: true, paymentUpdates: true, reviewReplies: true },
      privacy: { showProfile: true, showContact: false, showListings: true, allowMessages: true },
      preferences: { language: 'en', timezone: 'UTC', currency: 'USD', autoRefresh: true },
      created_at: null,
      updated_at: null,
    };
  }
  const r = rows[0];
  return {
    notifications: safeParse(r.notifications, {}),
    privacy: safeParse(r.privacy, {}),
    preferences: safeParse(r.preferences, {}),
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
};

const upsertSellerSettings = async (userId, data = {}) => {
  const existing = await executeQuery(`SELECT user_id FROM seller_settings WHERE user_id = ?`, [userId]);
  const json = (v) => (v === undefined ? null : JSON.stringify(v));
  const notifications = data.notifications;
  const privacy = data.privacy;
  const preferences = data.preferences;
  if (existing.length === 0) {
    await executeQuery(
      `INSERT INTO seller_settings (user_id, notifications, privacy, preferences, created_at, updated_at) VALUES (?,?,?,?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [userId, json(notifications), json(privacy), json(preferences)]
    );
  } else {
    const fields = [];
    const params = [];
    if (notifications !== undefined) { fields.push('notifications = ?'); params.push(json(notifications)); }
    if (privacy !== undefined) { fields.push('privacy = ?'); params.push(json(privacy)); }
    if (preferences !== undefined) { fields.push('preferences = ?'); params.push(json(preferences)); }
    if (fields.length > 0) {
      params.push(userId);
      await executeQuery(`UPDATE seller_settings SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`, params);
    }
  }
  return getSellerSettings(userId);
};

// Seller Reviews Functions
const getSellerReviews = async (sellerId, page = 1, limit = 20) => {
  try {
    const offset = (page - 1) * limit;

    // First, check if sellerId is actually a user_id and get the corresponding seller_id
    let actualSellerId = sellerId;
    
    // Check if this is a user_id by looking in the sellers table
    const sellerCheck = await executeQuery(
      'SELECT id FROM sellers WHERE user_id = ?',
      [sellerId]
    );
    
    if (sellerCheck && sellerCheck.length > 0) {
      // sellerId is actually a user_id, use the seller's id
      actualSellerId = sellerCheck[0].id;
      console.log(`🔍 Converted user_id ${sellerId} to seller_id ${actualSellerId}`);
    } else {
      // Check if it's already a seller_id
      const sellerIdCheck = await executeQuery(
        'SELECT id FROM sellers WHERE id = ?',
        [sellerId]
      );
      
      if (!sellerIdCheck || sellerIdCheck.length === 0) {
        throw new Error('Seller not found');
      }
    }

    // Get reviews with a simpler approach - no LIMIT/OFFSET in prepared statement
    const allReviews = await executeQuery(
      `SELECT sr.*, u.first_name, u.last_name, u.profile_image
       FROM seller_reviews sr
       JOIN users u ON sr.user_id = u.id
       WHERE sr.seller_id = ? AND sr.status = 'active'
       ORDER BY sr.created_at DESC`,
      [actualSellerId]
    );

    // Apply pagination manually
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReviews = allReviews.slice(startIndex, endIndex);

    // Then get car information for reviews that have car_id
    const reviewsWithCars = [];
    for (const review of paginatedReviews) {
      if (review.car_id) {
        const carInfo = await executeQuery(
          'SELECT title, brand, model, year FROM cars WHERE id = ?',
          [review.car_id]
        );
        if (carInfo && carInfo.length > 0) {
          review.car_title = carInfo[0].title;
          review.brand = carInfo[0].brand;
          review.model = carInfo[0].model;
          review.year = carInfo[0].year;
        }
      }
      reviewsWithCars.push(review);
    }

    // Get total count
    const countResult = await executeQuery(
      'SELECT COUNT(*) as total FROM seller_reviews WHERE seller_id = ? AND status = "active"',
      [actualSellerId]
    );

    // Get rating statistics
    const ratingStats = await executeQuery(
      `SELECT 
         AVG(rating) as average_rating,
         COUNT(*) as total_reviews,
         SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
         SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
         SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
         SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
         SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
       FROM seller_reviews 
       WHERE seller_id = ? AND status = "active"`,
      [actualSellerId]
    );

    console.log('🔍 Rating stats query result:', ratingStats);
    console.log('🔍 Using seller ID:', actualSellerId);

    return {
      reviews: reviewsWithCars || [],
      pagination: {
        page,
        limit,
        total: allReviews ? allReviews.length : 0,
        totalPages: Math.ceil((allReviews ? allReviews.length : 0) / limit)
      },
      statistics: {
        averageRating: ratingStats[0]?.average_rating ? parseFloat(Number(ratingStats[0].average_rating).toFixed(2)) : 0,
        totalReviews: ratingStats[0]?.total_reviews || 0,
        ratingDistribution: {
          5: ratingStats[0]?.five_star || 0,
          4: ratingStats[0]?.four_star || 0,
          3: ratingStats[0]?.three_star || 0,
          2: ratingStats[0]?.two_star || 0,
          1: ratingStats[0]?.one_star || 0
        }
      }
    };
  } catch (error) {
    throw new Error(`Failed to get seller reviews: ${error.message}`);
  }
};

const createSellerReview = async (sellerId, userId, reviewData) => {
  try {
    const { rating, title, comment, purchase_type, car_id } = reviewData;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // First, check if sellerId is actually a user_id and get the corresponding seller_id
    let actualSellerId = sellerId;
    
    // Check if this is a user_id by looking in the sellers table
    const sellerCheck = await executeQuery(
      'SELECT id FROM sellers WHERE user_id = ?',
      [sellerId]
    );
    
    if (sellerCheck && sellerCheck.length > 0) {
      // sellerId is actually a user_id, use the seller's id
      actualSellerId = sellerCheck[0].id;
      console.log(`🔍 createSellerReview: Converted user_id ${sellerId} to seller_id ${actualSellerId}`);
    }

    // Check if user already reviewed this seller
    const existingReview = await executeQuery(
      'SELECT id FROM seller_reviews WHERE seller_id = ? AND user_id = ?',
      [actualSellerId, userId]
    );

    if (existingReview && existingReview.length > 0) {
      throw new Error('You have already reviewed this seller');
    }

    // Verify seller exists
    const sellerExists = await executeQuery(
      'SELECT id FROM sellers WHERE id = ?',
      [actualSellerId]
    );

    if (!sellerExists || sellerExists.length === 0) {
      throw new Error('Seller not found');
    }

    // Verify car exists if provided
    if (car_id) {
      const carCheck = await executeQuery(
        'SELECT id FROM cars WHERE id = ? AND seller_id = ?',
        [car_id, actualSellerId]
      );

      if (!carCheck || carCheck.length === 0) {
        throw new Error('Car not found or does not belong to this seller');
      }
    }

    const reviewId = require('crypto').randomUUID();
    
    await executeQuery(
      `INSERT INTO seller_reviews (
        id, seller_id, user_id, rating, title, comment, purchase_type, car_id, 
        is_verified, helpful_count, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        reviewId, actualSellerId, userId, rating, title || null, comment || null,
        purchase_type || null, car_id || null, false, 0, 'active'
      ]
    );

    // Update seller's rating and review count
    await updateSellerRatingStats(actualSellerId);

    return { id: reviewId, message: 'Review created successfully' };
  } catch (error) {
    throw new Error(`Failed to create seller review: ${error.message}`);
  }
};

const replyToSellerReview = async (reviewId, sellerId, replyText) => {
  try {
    // First, check if sellerId is actually a user_id and get the corresponding seller_id
    let actualSellerId = sellerId;
    
    // Check if this is a user_id by looking in the sellers table
    const sellerCheck = await executeQuery(
      'SELECT id FROM sellers WHERE user_id = ?',
      [sellerId]
    );
    
    if (sellerCheck && sellerCheck.length > 0) {
      // sellerId is actually a user_id, use the seller's id
      actualSellerId = sellerCheck[0].id;
      console.log(`🔍 replyToSellerReview: Converted user_id ${sellerId} to seller_id ${actualSellerId}`);
    }

    // Verify the review belongs to this seller
    const reviewCheck = await executeQuery(
      'SELECT id FROM seller_reviews WHERE id = ? AND seller_id = ?',
      [reviewId, actualSellerId]
    );

    if (!reviewCheck || reviewCheck.length === 0) {
      throw new Error('Review not found or does not belong to this seller');
    }

    await executeQuery(
      'UPDATE seller_reviews SET reply_text = ?, reply_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [replyText, reviewId]
    );

    return { message: 'Reply added successfully' };
  } catch (error) {
    throw new Error(`Failed to reply to review: ${error.message}`);
  }
};

const updateSellerRatingStats = async (sellerId) => {
  try {
    // First, check if sellerId is actually a user_id and get the corresponding seller_id
    let actualSellerId = sellerId;
    
    // Check if this is a user_id by looking in the sellers table
    const sellerCheck = await executeQuery(
      'SELECT id FROM sellers WHERE user_id = ?',
      [sellerId]
    );
    
    if (sellerCheck && sellerCheck.length > 0) {
      // sellerId is actually a user_id, use the seller's id
      actualSellerId = sellerCheck[0].id;
      console.log(`🔍 updateSellerRatingStats: Converted user_id ${sellerId} to seller_id ${actualSellerId}`);
    }

    const stats = await executeQuery(
      `SELECT 
         AVG(rating) as avg_rating,
         COUNT(*) as review_count
       FROM seller_reviews 
       WHERE seller_id = ? AND status = "active"`,
      [actualSellerId]
    );

    const avgRating = stats[0].avg_rating ? parseFloat(stats[0].avg_rating.toFixed(2)) : 0;
    const reviewCount = stats[0].review_count;

    await executeQuery(
      'UPDATE sellers SET rating = ?, review_count = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [avgRating, reviewCount, actualSellerId]
    );
  } catch (error) {
    console.error('Failed to update seller rating stats:', error.message);
  }
};

const markReviewHelpful = async (reviewId, userId) => {
  try {
    // Check if user already marked this review as helpful
    const existing = await executeQuery(
      'SELECT id FROM seller_review_helpful WHERE review_id = ? AND user_id = ?',
      [reviewId, userId]
    );

    if (existing && existing.length > 0) {
      throw new Error('You have already marked this review as helpful');
    }

    // Add helpful vote
    const helpfulId = require('crypto').randomUUID();
    await executeQuery(
      'INSERT INTO seller_review_helpful (id, review_id, user_id, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
      [helpfulId, reviewId, userId]
    );

    // Update helpful count
    await executeQuery(
      'UPDATE seller_reviews SET helpful_count = helpful_count + 1 WHERE id = ?',
      [reviewId]
    );

    return { message: 'Review marked as helpful' };
  } catch (error) {
    throw new Error(`Failed to mark review as helpful: ${error.message}`);
  }
};

// Account deletion with cascade cleanup
const deleteSellerAccount = async (userId) => {
  try {
    console.log(`Starting account deletion for user: ${userId}`);
    
    // Delete seller-specific data first (foreign key constraints)
    await executeQuery('DELETE FROM seller_settings WHERE user_id = ?', [userId]);
    console.log('Deleted seller_settings');
    
    await executeQuery('DELETE FROM sellers WHERE user_id = ?', [userId]);
    console.log('Deleted sellers');
    
    // Delete user's cars and related data (check if tables exist first)
    try {
      const cars = await executeQuery('SELECT id FROM cars WHERE seller_id = ?', [userId]);
      console.log(`Found ${cars.length} cars to delete`);
      
      for (const car of cars) {
        // Only delete from tables that exist
        try {
          await executeQuery('DELETE FROM car_favorites WHERE car_id = ?', [car.id]);
        } catch (e) { console.log('car_favorites table not found or error:', e.message); }
        
        try {
          await executeQuery('DELETE FROM car_reviews WHERE car_id = ?', [car.id]);
        } catch (e) { console.log('car_reviews table not found or error:', e.message); }
        
        try {
          await executeQuery('DELETE FROM car_images WHERE car_id = ?', [car.id]);
        } catch (e) { console.log('car_images table not found or error:', e.message); }
      }
      
      await executeQuery('DELETE FROM cars WHERE seller_id = ?', [userId]);
      console.log('Deleted cars');
    } catch (e) {
      console.log('No cars to delete or cars table issue:', e.message);
    }
    
    // Delete user account (this will cascade to other user-related tables)
    await executeQuery('DELETE FROM users WHERE id = ?', [userId]);
    console.log('Deleted user account');
    
    console.log('Account deletion completed successfully');
  } catch (error) {
    console.error('Delete account error:', error);
    throw error;
  }
};

module.exports = {
  getSellerProfile,
  upsertSellerProfile,
  getSellerSettings,
  upsertSellerSettings,
  deleteSellerAccount,
  // Seller Reviews
  getSellerReviews,
  createSellerReview,
  replyToSellerReview,
  updateSellerRatingStats,
  markReviewHelpful,
};


