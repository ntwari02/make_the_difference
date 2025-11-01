const { executeQuery } = require('../config/database');

const safeParse = (value, fallback) => {
  try {
    if (value === null || value === undefined) return fallback;
    
    // MySQL JSON columns return parsed objects/arrays
    if (typeof value === 'object') {
      // If already an array, return it
      if (Array.isArray(value)) return value;
      // If it's an object but fallback is array, return fallback
      return fallback;
    }
    
    // Handle string values
    const s = String(value).trim();
    if (s === '' || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') return fallback;
    
    try {
      const parsed = JSON.parse(s);
      // Ensure we return an array for images
      if (Array.isArray(parsed)) return parsed;
      // If it's a single path, wrap in array
      if (typeof parsed === 'string' && (/^(?:\/uploads\b|https?:\/\/)/i.test(parsed))) {
        return [parsed];
      }
      return fallback;
    } catch {
      // If it's a single path or URL, wrap as array
      if (/^(?:\/uploads\b|https?:\/\/)/i.test(s)) {
        return [s];
      }
      return fallback;
    }
  } catch (_) {
    return fallback;
  }
};

const safeJsonStringify = (value) => {
  // Return null for empty values instead of empty JSON strings
  if (value === null || value === undefined) return null;
  if (value === '') return null;
  
  // Filter out base64 data URLs - only keep file paths
  if (Array.isArray(value)) {
    const filtered = value.filter(item => {
      // Keep only file paths, not base64 data URLs
      return typeof item === 'string' && !item.startsWith('data:');
    });
    // Return empty array JSON string (valid JSON) - but if array is empty, return null instead to avoid issues
    if (filtered.length === 0) return null; // Changed: return null for empty arrays to avoid "empty document" errors
    try {
      const result = JSON.stringify(filtered);
      // Safety check: ensure we never return empty string
      return result && result.trim() ? result : null;
    } catch (_) {
      return null;
    }
  }
  
  // For objects, if empty, return null instead of {} to be safe
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return null; // Changed: return null for empty objects to avoid "empty document" errors
  }
  
  try {
    const str = JSON.stringify(value);
    // Return null for any empty or problematic string representation
    if (!str || str === '""' || str.trim() === '') return null;
    return str;
  } catch (_) {
    return null;
  }
};

const getSellerProfile = async (userId) => {
  // Check if seller exists first (avoid JSON columns)
  const sellerExists = await executeQuery(`SELECT id FROM sellers WHERE user_id = ? LIMIT 1`, [userId]);
  
  // If no seller exists, return null (don't try to select JSON columns)
  if (sellerExists.length === 0) {
    return null;
  }
  
  // Seller exists - try to get profile, handling invalid JSON gracefully
  let rows;
  try {
    rows = await executeQuery(`
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
      s.created_at,
      s.updated_at,
      u.first_name,
      u.last_name
    FROM sellers s
    JOIN users u ON s.user_id = u.id
    WHERE s.user_id = ?
    LIMIT 1
  `, [userId]);
  } catch (err) {
    // Debug: log the complete error structure
    console.log('getSellerProfile catch - Full error:', JSON.stringify({
      code: err.code,
      errno: err.errno,
      message: err.message,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage
    }, null, 2));
    
    // Check for JSON error in multiple ways
    const isJsonError = err.code === 'ER_INVALID_JSON_TEXT' || 
                        err.errno === 3140 ||
                        (err.message && err.message.includes('Invalid JSON text')) ||
                        (err.sqlMessage && err.sqlMessage.includes('Invalid JSON text'));
    
    if (isJsonError) {
      console.warn('✅ Invalid JSON detected, selecting without JSON columns and fixing data...');
      
      // Fix the data first
      try {
        await executeQuery(`
          UPDATE sellers 
          SET images = NULL, business_hours = NULL, services = NULL 
          WHERE user_id = ?
        `, [userId]);
      } catch (fixErr) {
        console.error('Failed to fix JSON data:', fixErr.message);
      }
      
      // Now select without JSON columns (this will succeed)
      rows = await executeQuery(`
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
          NULL as images,
          NULL as business_hours,
          NULL as services,
          s.status,
          s.is_verified,
          s.created_at,
          s.updated_at,
          u.first_name,
          u.last_name
        FROM sellers s
        JOIN users u ON s.user_id = u.id
        WHERE s.user_id = ?
        LIMIT 1
      `, [userId]);
    } else {
      // Re-throw non-JSON errors
      console.error('getSellerProfile - unexpected error:', err);
      throw err;
    }
  }
  
  if (!rows || rows.length === 0) {
    console.warn('getSellerProfile - No rows returned after error recovery');
    return null;
  }
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
    created_at: s.created_at,
    updated_at: s.updated_at,
    contact_name: [s.first_name, s.last_name].filter(Boolean).join(' ')
  };
};

const normalizeBusinessType = (value) => {
  const v = String(value || '').trim();
  if (!v) return 'Independent Seller'; // Default to 'Independent Seller' (matching DB enum)
  
  // Database enum values (exact case)
  const dbEnum = new Set([
    'Independent Seller', 'Dealership', 'Auto Broker', 'Car Rental', 
    'Fleet Management', 'Parts Dealer', 'Service Center'
  ]);
  
  // If exact match with database enum, return it
  if (dbEnum.has(v)) return v;
  
  // Map common aliases and lowercase variants to database enum values
  const lower = v.toLowerCase();
  if (lower === 'dealership' || lower === 'dealer') return 'Dealership';
  if (lower === 'independent' || lower === 'individual' || lower === 'private_seller') return 'Independent Seller';
  if (lower === 'auction_house' || lower === 'auto broker') return 'Auto Broker';
  if (lower === 'car rental' || lower === 'rental_company' || lower === 'rental') return 'Car Rental';
  if (lower === 'fleet management' || lower === 'fleet') return 'Fleet Management';
  if (lower === 'parts dealer' || lower === 'parts') return 'Parts Dealer';
  if (lower === 'service center' || lower === 'service' || lower === 'agency') return 'Service Center';
  
  return 'Independent Seller'; // Default fallback to match database default
};

const upsertSellerProfile = async (userId, data = {}) => {
  // Safe check: only select id (not JSON columns) to avoid JSON validation errors
  let existing;
  try {
    existing = await executeQuery(`SELECT id FROM sellers WHERE user_id = ? LIMIT 1`, [userId]);
  } catch (err) {
    // If SELECT fails (shouldn't happen, but be safe), assume no existing record
    console.warn('Error checking existing seller, assuming new:', err.message);
    existing = [];
  }
  const json = (v) => (v === undefined ? null : JSON.stringify(v));
  if (existing.length === 0) {
    const id = require('crypto').randomUUID();
    await executeQuery(`
      INSERT INTO sellers (
        id, user_id, business_name, business_type, license_number, description, address, city, state, country, postal_code,
        phone, email, website, logo, images, business_hours, services, status, is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, userId,
      data.business_name || 'Seller',
      normalizeBusinessType(data.business_type),
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
      safeJsonStringify(data.images) || null, // Ensure null if empty string returned
      safeJsonStringify(data.business_hours) || null, // Ensure null if empty string returned
      safeJsonStringify(data.services) || null, // Ensure null if empty string returned
      data.status || 'active',
      data.is_verified ? 1 : 0
    ]);
  } else {
    const fields = [];
    const params = [];
    const assign = (col, val, isJson = false) => {
      // Skip if value is undefined
      if (val === undefined) return;
      
      if (isJson) {
        // For JSON fields, process through safeJsonStringify
        const jsonValue = safeJsonStringify(val);
        // For UPDATE, if the result is an empty array "[]", skip the update
        if (jsonValue === null || jsonValue === '[]') return;
        fields.push(`${col} = ?`);
        params.push(jsonValue);
      } else {
        fields.push(`${col} = ?`);
        params.push(val);
      }
    };
    
    // Only process fields that are explicitly provided in the data object
    // This prevents database errors from fields we don't want to update
    if (data.business_name !== undefined) assign('business_name', data.business_name);
    if (data.business_type !== undefined) assign('business_type', normalizeBusinessType(data.business_type));
    if (data.license_number !== undefined) assign('license_number', data.license_number);
    if (data.description !== undefined) assign('description', data.description);
    if (data.address !== undefined) assign('address', data.address);
    if (data.city !== undefined) assign('city', data.city);
    if (data.state !== undefined) assign('state', data.state);
    if (data.country !== undefined) assign('country', data.country);
    if (data.postal_code !== undefined) assign('postal_code', data.postal_code);
    if (data.phone !== undefined) assign('phone', data.phone);
    if (data.email !== undefined) assign('email', data.email);
    if (data.website !== undefined) assign('website', data.website);
    if (data.logo !== undefined) assign('logo', data.logo);
    if (data.images !== undefined) assign('images', data.images, true);
    if (data.business_hours !== undefined) assign('business_hours', data.business_hours, true);
    if (data.services !== undefined) assign('services', data.services, true);
    if (data.status !== undefined) assign('status', data.status);
    if (data.is_verified !== undefined) assign('is_verified', data.is_verified ? 1 : 0);
    // Skip verification_documents entirely in user updates - admin-only field
    
    if (fields.length > 0) {
      params.push(userId);
      await executeQuery(`UPDATE sellers SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`, params);
    }
  }
  return getSellerProfile(userId);
};

// Seller Settings Management Functions
const getSellerSettings = async (userId) => {
    const rows = await executeQuery(
      `SELECT user_id, notifications, privacy, preferences, created_at, updated_at FROM seller_settings WHERE user_id = ? LIMIT 1`,
      [userId]
    );
    if (rows.length === 0) {
      // Return defaults if not set yet
      return {
        user_id: userId,
        notifications: {
          email: true,
          push: true,
          sms: false,
          newInquiries: true,
          newOffers: true,
          paymentUpdates: true,
          reviewReplies: true,
        },
        privacy: {
          showProfile: true,
          showContact: false,
          showListings: true,
          allowMessages: true,
        },
        preferences: {
          language: 'en',
          timezone: 'America/New_York',
          currency: 'USD',
          autoRefresh: true,
          theme: 'light',
        },
        created_at: null,
        updated_at: null,
      };
    }
    const s = rows[0];
    const parseJson = (v, fb) => {
      if (v == null) return fb;
      if (typeof v === 'object') return v;
      try { return JSON.parse(String(v)); } catch { return fb; }
    };
    return {
      user_id: s.user_id,
      notifications: parseJson(s.notifications, {
        email: true,
        push: true,
        sms: false,
        newInquiries: true,
        newOffers: true,
        paymentUpdates: true,
        reviewReplies: true,
      }),
      privacy: parseJson(s.privacy, {
        showProfile: true,
        showContact: false,
        showListings: true,
        allowMessages: true,
      }),
      preferences: parseJson(s.preferences, {
        language: 'en',
        timezone: 'America/New_York',
        currency: 'USD',
        autoRefresh: true,
        theme: 'light',
      }),
      created_at: s.created_at,
      updated_at: s.updated_at,
    };
};

const upsertSellerSettings = async (userId, data = {}) => {
    const existing = await executeQuery(`SELECT user_id, notifications, privacy, preferences FROM seller_settings WHERE user_id = ?`, [userId]);
    const json = (v, fb) => {
      if (v === undefined) return fb === undefined ? null : JSON.stringify(fb);
      if (v === null) return null;
      try { return JSON.stringify(v); } catch { return fb === undefined ? null : JSON.stringify(fb); }
    };
    const parseJson = (v, fb) => {
      if (v == null) return fb;
      if (typeof v === 'object') return v;
      try { return JSON.parse(String(v)); } catch { return fb; }
    };

    const defaults = {
      notifications: {
        email: true,
        push: true,
        sms: false,
        newInquiries: true,
        newOffers: true,
        paymentUpdates: true,
        reviewReplies: true,
      },
      privacy: {
        showProfile: true,
        showContact: false,
        showListings: true,
        allowMessages: true,
      },
      preferences: {
        language: 'en',
        timezone: 'America/New_York',
        currency: 'USD',
        autoRefresh: true,
        theme: 'light',
      },
    };

    if (existing.length === 0) {
      await executeQuery(
        `INSERT INTO seller_settings (user_id, notifications, privacy, preferences) VALUES (?, ?, ?, ?)`,
        [
          userId,
          json(data.notifications ? { ...defaults.notifications, ...data.notifications } : defaults.notifications),
          json(data.privacy ? { ...defaults.privacy, ...data.privacy } : defaults.privacy),
          json(data.preferences ? { ...defaults.preferences, ...data.preferences } : defaults.preferences),
        ]
      );
    } else {
      const existingSettings = existing[0];
      const existingNotifications = parseJson(existingSettings.notifications, defaults.notifications);
      const existingPrivacy = parseJson(existingSettings.privacy, defaults.privacy);
      const existingPreferences = parseJson(existingSettings.preferences, defaults.preferences);

      const mergedNotifications = data.notifications !== undefined
        ? { ...existingNotifications, ...data.notifications }
        : existingNotifications;
      const mergedPrivacy = data.privacy !== undefined
        ? { ...existingPrivacy, ...data.privacy }
        : existingPrivacy;
      const mergedPreferences = data.preferences !== undefined
        ? { ...existingPreferences, ...data.preferences }
        : existingPreferences;

      const fields = [];
      const params = [];
      if (data.notifications !== undefined) {
        fields.push('notifications = ?');
        params.push(json(mergedNotifications));
      }
      if (data.privacy !== undefined) {
        fields.push('privacy = ?');
        params.push(json(mergedPrivacy));
      }
      if (data.preferences !== undefined) {
        fields.push('preferences = ?');
        params.push(json(mergedPreferences));
      }
      if (fields.length > 0) {
        params.push(userId);
        await executeQuery(`UPDATE seller_settings SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`, params);
      }
    }
    return getSellerSettings(userId);
};

const deleteSellerAccount = async (userId) => {
    try {
      const sellerRows = await executeQuery(`SELECT id FROM sellers WHERE user_id = ? LIMIT 1`, [userId]);
      const sellerId = sellerRows.length > 0 ? sellerRows[0].id : null;

      if (sellerId) {
        await executeQuery(`DELETE FROM seller_review_helpful WHERE review_id IN (SELECT id FROM seller_reviews WHERE seller_id = ?)`, [sellerId]);
        await executeQuery(`DELETE FROM seller_reviews WHERE seller_id = ?`, [sellerId]);
        await executeQuery(`DELETE FROM message_templates WHERE seller_id = ?`, [sellerId]);
        await executeQuery(`DELETE FROM spare_parts_bundle_items WHERE bundle_id IN (SELECT id FROM spare_parts_bundles WHERE seller_id = ?)`, [sellerId]);
        await executeQuery(`DELETE FROM spare_parts_bundles WHERE seller_id = ?`, [sellerId]);
        await executeQuery(`DELETE FROM spare_parts_vehicle_compatibility WHERE spare_part_id IN (SELECT id FROM spare_parts WHERE seller_id = ?)`, [sellerId]);
        await executeQuery(`DELETE FROM spare_parts_price_comparison WHERE spare_part_id IN (SELECT id FROM spare_parts WHERE seller_id = ?)`, [sellerId]);
        await executeQuery(`DELETE FROM spare_parts_installation_services WHERE spare_part_id IN (SELECT id FROM spare_parts WHERE seller_id = ?)`, [sellerId]);
        await executeQuery(`DELETE FROM spare_parts_inventory WHERE spare_part_id IN (SELECT id FROM spare_parts WHERE seller_id = ?)`, [sellerId]);
        await executeQuery(`DELETE FROM spare_parts_bundle_items WHERE spare_part_id IN (SELECT id FROM spare_parts WHERE seller_id = ?)`, [sellerId]);
        await executeQuery(`DELETE FROM spare_parts WHERE seller_id = ?`, [sellerId]);
        await executeQuery(`DELETE FROM car_favorites WHERE car_id IN (SELECT id FROM cars WHERE seller_id = ?)`, [sellerId]);
        await executeQuery(`DELETE FROM car_reviews WHERE car_id IN (SELECT id FROM cars WHERE seller_id = ?)`, [sellerId]);
        await executeQuery(`DELETE FROM cars WHERE seller_id = ?`, [sellerId]);
        await executeQuery(`UPDATE orders SET status = 'cancelled', seller_notes = CASE WHEN seller_notes IS NULL OR seller_notes = '' THEN '[Account Deleted]' ELSE CONCAT(seller_notes, ' [Account Deleted]') END WHERE seller_id = ?`, [sellerId]);
        await executeQuery(`DELETE FROM sellers WHERE user_id = ?`, [userId]);
      }
      await executeQuery(`DELETE FROM seller_settings WHERE user_id = ?`, [userId]);
      await executeQuery(`DELETE FROM user_sessions WHERE user_id = ?`, [userId]);
      const result = await executeQuery(`DELETE FROM users WHERE id = ?`, [userId]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error('Error deleting seller account:', err);
      throw err;
    }
};

// Get seller reviews (reviews for all cars belonging to the seller)
const getSellerReviews = async (userId, filters = {}) => {
  try {
    // Get seller_id from user_id
    const sellerRows = await executeQuery(`SELECT id FROM sellers WHERE user_id = ? LIMIT 1`, [userId]);
    if (sellerRows.length === 0) {
      return {
        reviews: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        averageRating: 0,
        distribution: [0, 0, 0, 0, 0]
      };
    }
    const sellerId = sellerRows[0].id;

    // Build query with filters
    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(filters.limit) || 20));
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        sr.id,
        sr.car_id,
        sr.user_id as buyer_id,
        sr.rating,
        sr.comment,
        sr.status,
        sr.reply_text as seller_response,
        sr.created_at as timestamp,
        COALESCE(c.brand, '') as car_make,
        COALESCE(c.model, '') as car_model,
        COALESCE(c.year, NULL) as car_year,
        u.first_name,
        u.last_name,
        u.profile_image as buyer_avatar,
        COALESCE(sr.helpful_count, (SELECT COUNT(*) FROM seller_review_helpful WHERE review_id = sr.id), 0) as helpful_count,
        COALESCE(sr.is_verified, 0) as verified
      FROM seller_reviews sr
      LEFT JOIN cars c ON sr.car_id = c.id
      INNER JOIN users u ON sr.user_id = u.id
      WHERE sr.seller_id = ? AND sr.status = 'active'
    `;

    const params = [sellerId];

    // Filter by rating
    if (filters.rating && filters.rating !== 'all') {
      const rating = parseInt(filters.rating);
      if (rating >= 1 && rating <= 5) {
        query += ` AND sr.rating = ?`;
        params.push(rating);
      }
    }

    // Search filter
    if (filters.search && filters.search.trim()) {
      query += ` AND (
        sr.comment LIKE ? 
        OR CONCAT(u.first_name, ' ', u.last_name) LIKE ?
      )`;
      const searchTerm = `%${filters.search.trim()}%`;
      params.push(searchTerm, searchTerm);
    }

    // Sorting
    const sortBy = filters.sortBy || 'newest';
    switch (sortBy) {
      case 'newest':
        query += ` ORDER BY sr.created_at DESC`;
        break;
      case 'oldest':
        query += ` ORDER BY sr.created_at ASC`;
        break;
      case 'helpful':
        query += ` ORDER BY helpful_count DESC, sr.created_at DESC`;
        break;
      case 'rating':
        query += ` ORDER BY sr.rating DESC, sr.created_at DESC`;
        break;
      default:
        query += ` ORDER BY sr.created_at DESC`;
    }

    // Pagination - use direct integers for LIMIT/OFFSET (MySQL requirement)
    query += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    const reviews = await executeQuery(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM seller_reviews sr
      LEFT JOIN cars c ON sr.car_id = c.id
      INNER JOIN users u ON sr.user_id = u.id
      WHERE sr.seller_id = ? AND sr.status = 'active'
    `;
    const countParams = [sellerId];

    if (filters.rating && filters.rating !== 'all') {
      const rating = parseInt(filters.rating);
      if (rating >= 1 && rating <= 5) {
        countQuery += ` AND sr.rating = ?`;
        countParams.push(rating);
      }
    }

    if (filters.search && filters.search.trim()) {
      countQuery += ` AND (
        sr.comment LIKE ? 
        OR CONCAT(u.first_name, ' ', u.last_name) LIKE ?
      )`;
      const searchTerm = `%${filters.search.trim()}%`;
      countParams.push(searchTerm, searchTerm);
    }

    const countResult = await executeQuery(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    // Get statistics
    const statsQuery = `
      SELECT 
        AVG(sr.rating) as average_rating,
        COUNT(CASE WHEN sr.rating = 5 THEN 1 END) as rating_5,
        COUNT(CASE WHEN sr.rating = 4 THEN 1 END) as rating_4,
        COUNT(CASE WHEN sr.rating = 3 THEN 1 END) as rating_3,
        COUNT(CASE WHEN sr.rating = 2 THEN 1 END) as rating_2,
        COUNT(CASE WHEN sr.rating = 1 THEN 1 END) as rating_1
      FROM seller_reviews sr
      WHERE sr.seller_id = ? AND sr.status = 'active'
    `;
    const statsResult = await executeQuery(statsQuery, [sellerId]);
    const stats = statsResult[0] || {};
    const averageRating = parseFloat(stats.average_rating) || 0;

    // Format reviews for frontend
    const formattedReviews = reviews.map(r => ({
      id: r.id,
      buyer: {
        name: `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Anonymous',
        avatar: r.buyer_avatar || ''
      },
      car: {
        make: r.car_make || '',
        model: r.car_model || '',
        year: r.car_year || null
      },
      rating: r.rating || 0,
      comment: r.comment || '',
      timestamp: r.timestamp,
      helpful: parseInt(r.helpful_count) || 0,
      verified: !!r.verified,
      sellerResponse: r.seller_response || null
    }));

    return {
      reviews: formattedReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      averageRating,
      distribution: [
        parseInt(stats.rating_5) || 0,
        parseInt(stats.rating_4) || 0,
        parseInt(stats.rating_3) || 0,
        parseInt(stats.rating_2) || 0,
        parseInt(stats.rating_1) || 0
      ]
    };
  } catch (err) {
    console.error('Error getting seller reviews:', err);
    throw err;
  }
};

// Reply to a review
const replyToReview = async (userId, reviewId, responseText) => {
  try {
    // Get seller_id from user_id
    const sellerRows = await executeQuery(`SELECT id FROM sellers WHERE user_id = ? LIMIT 1`, [userId]);
    if (sellerRows.length === 0) {
      throw new Error('Seller profile not found');
    }
    const sellerId = sellerRows[0].id;

    // Verify the review belongs to this seller
    const reviewCheck = await executeQuery(`
      SELECT sr.id, sr.seller_id
      FROM seller_reviews sr
      WHERE sr.id = ? AND sr.status = 'active'
    `, [reviewId]);

    if (reviewCheck.length === 0) {
      throw new Error('Review not found');
    }

    if (reviewCheck[0].seller_id !== sellerId) {
      throw new Error('Unauthorized to reply to this review');
    }

    // Update seller response
    await executeQuery(`
      UPDATE seller_reviews 
      SET reply_text = ?, reply_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [responseText.trim(), reviewId]);

    // Return updated review details
    const updatedReview = await executeQuery(`
      SELECT 
        sr.id,
        sr.reply_text as seller_response,
        sr.updated_at
      FROM seller_reviews sr
      WHERE sr.id = ?
    `, [reviewId]);

    return updatedReview[0] || null;
  } catch (err) {
    console.error('Error replying to review:', err);
    throw err;
  }
};

// Helper function to check if a notification type should be sent based on user preferences
const checkNotificationPreference = async (userId, notificationType) => {
    try {
      const settings = await getSellerSettings(userId);
      const notifications = settings.notifications || {};
      
      // Map notification types to settings keys
      const typeMap = {
        'new_inquiry': 'newInquiries',
        'new_offer': 'newOffers',
        'payment_update': 'paymentUpdates',
        'review_reply': 'reviewReplies',
        'email': 'email',
        'push': 'push',
        'sms': 'sms',
      };
      
      const settingKey = typeMap[notificationType] || notificationType;
      return notifications[settingKey] !== false; // Default to true if not set
    } catch (error) {
      console.error('Error checking notification preference:', error);
      return true; // Default to allowing notifications on error
    }
};

// ==================== SELLER MESSAGES FUNCTIONS ====================

// Create or get a conversation with a buyer by email, and optionally send first message
const startConversation = async (sellerUserId, { to, subject, content }) => {
  try {
    if (!to || !String(to).trim()) {
      throw new Error('Recipient email is required');
    }

    // Resolve seller id from user id
    const sellerRows = await executeQuery(`SELECT id FROM sellers WHERE user_id = ? LIMIT 1`, [sellerUserId]);
    if (sellerRows.length === 0) {
      throw new Error('Seller profile not found');
    }
    const sellerId = sellerRows[0].id;

    // Resolve buyer by email
    const buyerRows = await executeQuery(`SELECT id, first_name, last_name FROM users WHERE email = ? LIMIT 1`, [to]);
    if (buyerRows.length === 0) {
      throw new Error('Buyer not found');
    }
    const buyerId = buyerRows[0].id;

    // Check if a conversation already exists between these two participants (ignore subject)
    const existing = await executeQuery(`
      SELECT c.id
      FROM conversations c
      INNER JOIN conversation_participants cps 
        ON cps.conversation_id = c.id AND cps.user_id = ? 
        AND cps.role IN ('seller','member','admin') AND cps.left_at IS NULL
      INNER JOIN conversation_participants cpb 
        ON cpb.conversation_id = c.id AND cpb.user_id = ? 
        AND cpb.role IN ('buyer','member','support') AND cpb.left_at IS NULL
      WHERE c.status = 'active'
      ORDER BY COALESCE(c.last_message_at, c.updated_at, c.created_at) DESC
      LIMIT 1
    `, [sellerUserId, buyerId]);

    const conversationId = existing.length ? existing[0].id : require('crypto').randomUUID();

    if (!existing.length) {
      // Create conversation row (use minimal known columns)
      await executeQuery(`
        INSERT INTO conversations (id, subject, created_at, updated_at, status)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'active')
      `, [conversationId, subject || null]);

      // Add participants
      await executeQuery(`
        INSERT INTO conversation_participants (conversation_id, user_id, role)
        VALUES (?, ?, 'seller'), (?, ?, 'buyer')
      `, [conversationId, sellerUserId, conversationId, buyerId]);
    }

    // If content is provided, create first message from seller
    if (content && String(content).trim()) {
      const messageId = require('crypto').randomUUID();
      await executeQuery(`
        INSERT INTO messages (
          id, conversation_id, sender_id, content, message_type, file_url, category, priority, is_read, created_at
        ) VALUES (?, ?, ?, ?, 'text', NULL, 'support', 'normal', 0, CURRENT_TIMESTAMP)
      `, [messageId, conversationId, sellerUserId, String(content).trim()]);

      await executeQuery(`
        UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `, [conversationId]);

      // Emit live update for seller stream
      try {
        const bus = global.__SELLER_MSG_BUS__;
        bus && bus.emit('seller.messages', { event: 'message.new', userId: sellerUserId, conversationId, messageId });
      } catch (_) {}
    }

    return { id: conversationId, buyer_id: buyerId, subject: subject || null, existed: existing.length > 0 };
  } catch (err) {
    console.error('startConversation error:', err);
    throw err;
  }
};

// Get seller conversations (inbox, sent, archived)
const getSellerConversations = async (userId, filters = {}) => {
  try {
    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(filters.limit) || 20));
    const offset = (page - 1) * limit;

    // Build base WHERE conditions - similar to buyer query
    const where = [
      `cp.user_id = ?`,
      `cp.role IN ('seller','member','admin')`,
      `cp.left_at IS NULL`,
      `c.status = 'active'`
    ];
    const params = [userId];

    if (filters.search && filters.search.trim()) {
      where.push(`(c.subject LIKE ? OR c.title LIKE ?)`);
      params.push(`%${filters.search.trim()}%`, `%${filters.search.trim()}%`);
    }

    // Get seller_id from sellers table (for car subqueries)
    const sellerRows = await executeQuery(`SELECT id FROM sellers WHERE user_id = ? LIMIT 1`, [userId]);
    const sellerId = sellerRows.length > 0 ? sellerRows[0].id : null;

    // Build query - start from conversation_participants (like buyer query)
    let query = `
      SELECT 
        c.id,
        COALESCE(c.subject, c.title, 'Conversation') AS subject,
        c.last_message_at,
        COALESCE(c.updated_at, c.created_at) as updated_at,
        c.created_at,
        c.type,
        c.status,
        -- Get buyer info from conversation_participants
        buyer_participant.user_id as buyer_id,
        buyer_user.first_name,
        buyer_user.last_name,
        buyer_user.profile_image as buyer_avatar,
        -- Car info from most recent order between this seller and buyer (only if seller_id exists)
        ${sellerId ? `(
          SELECT CONCAT(coalesce(car.brand,''),' ',coalesce(car.model,''))
          FROM orders o
          INNER JOIN order_items oi ON o.id = oi.order_id
          INNER JOIN cars car ON oi.item_type = 'car' AND oi.item_id = car.id
          WHERE o.seller_id = ? AND o.buyer_id = buyer_participant.user_id
          ORDER BY o.created_at DESC
          LIMIT 1
        ) as car_title,
        (
          SELECT JSON_UNQUOTE(JSON_EXTRACT(car.images, '$[0]'))
          FROM orders o
          INNER JOIN order_items oi ON o.id = oi.order_id
          INNER JOIN cars car ON oi.item_type = 'car' AND oi.item_id = car.id
          WHERE o.seller_id = ? AND o.buyer_id = buyer_participant.user_id
          ORDER BY o.created_at DESC
          LIMIT 1
        ) as car_image,` : 'NULL as car_title, NULL as car_image,'}
        -- Get last message
        last_msg.id as last_message_id,
        last_msg.content as last_message_content,
        last_msg.sender_id as last_message_sender_id,
        last_msg.created_at as last_message_timestamp,
        last_msg.is_read as last_message_read,
        last_msg.category,
        last_msg.priority,
        -- Get seller archive status from settings JSON
        JSON_EXTRACT(cp.settings, '$.archived') as seller_archived,
        -- Count unread messages (messages not from seller)
        COALESCE((
          SELECT COUNT(*) 
          FROM messages m 
          WHERE m.conversation_id = c.id 
            AND m.is_read = 0 
            AND m.sender_id != ?
        ), 0) AS unread_count,
        -- Check if seller has sent any messages in this conversation
        COALESCE((
          SELECT COUNT(*) > 0
          FROM messages m 
          WHERE m.conversation_id = c.id 
            AND m.sender_id = ?
        ), 0) AS has_seller_messages
      FROM conversation_participants cp
      INNER JOIN conversations c ON cp.conversation_id = c.id
      LEFT JOIN conversation_participants buyer_participant 
        ON c.id = buyer_participant.conversation_id 
        AND buyer_participant.user_id != ?
        AND buyer_participant.role IN ('buyer', 'member', 'support')
        AND buyer_participant.left_at IS NULL
      LEFT JOIN users buyer_user ON buyer_participant.user_id = buyer_user.id
      LEFT JOIN messages last_msg ON c.id = last_msg.conversation_id 
        AND last_msg.created_at = (
          SELECT MAX(created_at) 
          FROM messages 
          WHERE conversation_id = c.id
        )
      WHERE ${where.join(' AND ')}
    `;

    // Build query parameters: sellerId (2x for car queries if exists), userId for unread subquery, userId for has_seller_messages, userId for buyer join, then WHERE params
    const queryParams = sellerId 
      ? [sellerId, sellerId, userId, userId, userId, ...params]
      : [userId, userId, userId, ...params];

    // Filter by folder (inbox, sent, archived, all)
    if (filters.folder === 'archived') {
      query += ` AND JSON_EXTRACT(cp.settings, '$.archived') = 1`;
    } else if (filters.folder === 'sent') {
      query += ` AND (JSON_EXTRACT(cp.settings, '$.archived') IS NULL OR JSON_EXTRACT(cp.settings, '$.archived') = 0)
        AND EXISTS (
          SELECT 1 FROM messages m2 
          WHERE m2.conversation_id = c.id 
          AND m2.sender_id = ?
        )`;
      queryParams.push(userId);
    } else if (filters.folder === 'all') {
      // show everything (archived and non-archived)
      // no additional filter
    } else {
      // inbox (default)
      query += ` AND (JSON_EXTRACT(cp.settings, '$.archived') IS NULL 
        OR JSON_EXTRACT(cp.settings, '$.archived') = 0)`;
    }

    // Search filter
    if (filters.search && filters.search.trim()) {
      query += ` AND (
        c.subject LIKE ? 
        OR c.title LIKE ?
        OR CONCAT(buyer_user.first_name, ' ', buyer_user.last_name) LIKE ?
        OR last_msg.content LIKE ?
      )`;
      const searchTerm = `%${filters.search.trim()}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      query += ` AND last_msg.category = ?`;
      queryParams.push(filters.category);
    }

    // Sort by last message date (most recent first)
    query += ` ORDER BY COALESCE(c.last_message_at, c.updated_at, c.created_at) DESC`;

    // Pagination - embed directly in query
    query += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    const conversations = await executeQuery(query, queryParams);

    // Count total (similar query without pagination)
    let countQuery = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM conversation_participants cp
      INNER JOIN conversations c ON cp.conversation_id = c.id
      LEFT JOIN conversation_participants buyer_participant 
        ON c.id = buyer_participant.conversation_id 
        AND buyer_participant.user_id != ?
        AND buyer_participant.role IN ('buyer', 'member', 'support')
        AND buyer_participant.left_at IS NULL
      LEFT JOIN users buyer_user ON buyer_participant.user_id = buyer_user.id
      LEFT JOIN messages last_msg ON c.id = last_msg.conversation_id 
        AND last_msg.created_at = (
          SELECT MAX(created_at) 
          FROM messages 
          WHERE conversation_id = c.id
        )
      WHERE ${where.join(' AND ')}
    `;
    
    const countParams = [userId];

    // Apply same filters as main query
    if (filters.folder === 'archived') {
      countQuery += ` AND JSON_EXTRACT(cp.settings, '$.archived') = 1`;
    } else if (filters.folder === 'sent') {
      countQuery += ` AND (JSON_EXTRACT(cp.settings, '$.archived') IS NULL OR JSON_EXTRACT(cp.settings, '$.archived') = 0)
        AND EXISTS (
          SELECT 1 FROM messages m2 
          WHERE m2.conversation_id = c.id 
          AND m2.sender_id = ?
        )`;
      countParams.push(userId);
    } else if (filters.folder === 'all') {
      // show everything (archived and non-archived)
      // no additional filter
    } else {
      // inbox (default)
      countQuery += ` AND (JSON_EXTRACT(cp.settings, '$.archived') IS NULL 
        OR JSON_EXTRACT(cp.settings, '$.archived') = 0)`;
    }

    if (filters.search && filters.search.trim()) {
      countQuery += ` AND (
        c.subject LIKE ? 
        OR c.title LIKE ?
        OR CONCAT(buyer_user.first_name, ' ', buyer_user.last_name) LIKE ?
        OR last_msg.content LIKE ?
      )`;
      const searchTerm = `%${filters.search.trim()}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (filters.category && filters.category !== 'all') {
      countQuery += ` AND last_msg.category = ?`;
      countParams.push(filters.category);
    }

    // Add base WHERE params (userId for cp.user_id = ?)
    countParams.push(...params);

    const countResult = await executeQuery(countQuery, countParams);
    const total = parseInt(countResult[0]?.total) || 0;

    const formattedConversations = conversations.map(c => ({
      id: c.id,
      subject: c.subject || c.title || 'No Subject',
      carTitle: c.car_title || null,
      carImage: c.car_image || null,
      buyer: c.buyer_id ? {
        id: c.buyer_id,
        name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Anonymous',
        avatar: c.buyer_avatar || ''
      } : null,
      lastMessage: c.last_message_content ? {
        id: c.last_message_id,
        content: c.last_message_content,
        senderId: c.last_message_sender_id,
        isFromSeller: c.last_message_sender_id === userId,
        timestamp: c.last_message_timestamp || c.last_message_at,
        read: !!c.last_message_read
      } : null,
      unreadCount: parseInt(c.unread_count || 0),
      category: c.category || 'inquiry',
      priority: c.priority || 'normal',
      archived: !!c.seller_archived || false,
      createdAt: c.created_at,
      lastMessageAt: c.last_message_at,
      hasSellerMessages: !!c.has_seller_messages
    }));

    return {
      conversations: formattedConversations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (err) {
    console.error('Error getting seller conversations:', err);
    throw err;
  }
};

// Get messages for a conversation (thread)
const getConversationMessages = async (userId, conversationId) => {
  try {
    // Verify seller is a participant in the conversation
    const participantCheck = await executeQuery(`
      SELECT cp.conversation_id, c.subject, c.title
      FROM conversation_participants cp
      INNER JOIN conversations c ON cp.conversation_id = c.id
      WHERE cp.conversation_id = ? 
        AND cp.user_id = ?
        AND cp.role IN ('seller', 'member', 'admin')
        AND cp.left_at IS NULL
        AND c.status = 'active'
    `, [conversationId, userId]);

    if (participantCheck.length === 0) {
      throw new Error('Conversation not found or unauthorized');
    }

    const conversation = participantCheck[0];

    // Get buyer participant info
    const buyerParticipant = await executeQuery(`
      SELECT cp.user_id, u.first_name, u.last_name, u.profile_image
      FROM conversation_participants cp
      INNER JOIN users u ON cp.user_id = u.id
      WHERE cp.conversation_id = ?
        AND cp.user_id != ?
        AND cp.role IN ('buyer', 'member', 'support')
        AND cp.left_at IS NULL
      LIMIT 1
    `, [conversationId, userId]);

    // Get all messages in the conversation with parent message info for replies
    // Note: parent_message_id column might not exist yet, so we handle it gracefully
    let messages;
    try {
      messages = await executeQuery(`
        SELECT 
          m.id,
          m.sender_id,
          m.content,
          m.message_type,
          m.file_url,
          m.is_read,
          m.category,
          m.priority,
          m.created_at,
          m.parent_message_id,
          u.first_name,
          u.last_name,
          u.profile_image as sender_avatar,
          pm.content AS parent_message_content,
          pmu.first_name AS parent_sender_first_name,
          pmu.last_name AS parent_sender_last_name,
          pmu.profile_image AS parent_sender_avatar,
          pm.sender_id AS parent_sender_id
        FROM messages m
        LEFT JOIN users u ON m.sender_id = u.id
        LEFT JOIN messages pm ON m.parent_message_id = pm.id
        LEFT JOIN users pmu ON pm.sender_id = pmu.id
        WHERE m.conversation_id = ?
        ORDER BY m.created_at ASC
      `, [conversationId]);
    } catch (err) {
      // If parent_message_id column doesn't exist, fall back to query without it
      console.error('Query error (trying fallback):', err.message);
      if (err.message && (err.message.includes('parent_message_id') || err.message.includes('Unknown column') || err.code === 'ER_BAD_FIELD_ERROR')) {
        messages = await executeQuery(`
          SELECT 
            m.id,
            m.sender_id,
            m.content,
            m.message_type,
            m.file_url,
            m.is_read,
            m.category,
            m.priority,
            m.created_at,
            NULL as parent_message_id,
            u.first_name,
            u.last_name,
            u.profile_image as sender_avatar,
            NULL AS parent_message_content,
            NULL AS parent_sender_first_name,
            NULL AS parent_sender_last_name,
            NULL AS parent_sender_avatar,
            NULL AS parent_sender_id
          FROM messages m
          LEFT JOIN users u ON m.sender_id = u.id
          WHERE m.conversation_id = ?
          ORDER BY m.created_at ASC
        `, [conversationId]);
      } else {
        throw err;
      }
    }

    const formattedMessages = messages.map(m => ({
      id: m.id,
      sender: {
        id: m.sender_id,
        name: m.sender_id === userId 
          ? 'You' 
          : `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'Anonymous',
        avatar: m.sender_avatar || '',
        type: m.sender_id === userId ? 'seller' : 'buyer'
      },
      content: m.content || '',
      messageType: m.message_type || 'text',
      fileUrl: m.file_url || null,
      read: !!m.is_read,
      category: m.category || 'inquiry',
      priority: m.priority || 'normal',
      timestamp: m.created_at,
      replyTo: m.parent_message_id ? {
        id: m.parent_message_id,
        content: m.parent_message_content,
        sender: {
          id: m.parent_sender_id,
          name: `${m.parent_sender_first_name || ''} ${m.parent_sender_last_name || ''}`.trim() || 'Unknown',
          avatar: m.parent_sender_avatar || '',
          type: m.parent_sender_id === userId ? 'seller' : 'buyer'
        }
      } : undefined
    }));

    return {
      conversation: {
        id: conversation.conversation_id,
        subject: conversation.subject || conversation.title || 'No Subject',
        buyer: buyerParticipant.length > 0 ? {
          id: buyerParticipant[0].user_id
        } : null
      },
      messages: formattedMessages
    };
  } catch (err) {
    console.error('Error getting conversation messages:', err);
    throw err;
  }
};

// Check if user is a participant in conversation
const checkParticipant = async (userId, conversationId) => {
  const participantCheck = await executeQuery(`
    SELECT conversation_id
    FROM conversation_participants
    WHERE conversation_id = ? 
      AND user_id = ?
      AND role IN ('seller', 'member', 'admin')
      AND left_at IS NULL
  `, [conversationId, userId]);
  
  if (participantCheck.length > 0) {
    return true;
  }
  
  // Backward compatibility: check if seller owns the conversation
  const ownerCheck = await executeQuery(`
    SELECT id FROM conversations WHERE id = ? AND seller_id = ? LIMIT 1
  `, [conversationId, userId]);
  
  return ownerCheck.length > 0;
};

// Send a message (reply to conversation)
const sendMessage = async (userId, conversationId, content, options = {}) => {
  try {
    // Verify seller is a participant OR the owner of the conversation (backward compatibility)
    const participantCheck = await executeQuery(`
      SELECT conversation_id
      FROM conversation_participants
      WHERE conversation_id = ? 
        AND user_id = ?
        AND role IN ('seller', 'member', 'admin')
        AND left_at IS NULL
    `, [conversationId, userId]);

    if (participantCheck.length === 0) {
      const ownerCheck = await executeQuery(`
        SELECT id FROM conversations WHERE id = ? AND seller_id = ? LIMIT 1
      `, [conversationId, userId]);
      if (ownerCheck.length === 0) {
        throw new Error('Conversation not found or unauthorized');
      }
    }

    const messageId = require('crypto').randomUUID();

    // Insert message with parent_message_id for replies (if column exists)
    // Try with parent_message_id first, fall back if column doesn't exist
    try {
      await executeQuery(`
        INSERT INTO messages (
          id, conversation_id, sender_id, content, 
          message_type, file_url, category, priority, is_read, created_at, parent_message_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, ?)
      `, [
        messageId,
        conversationId,
        userId,
        content ? content.trim() : '',
        options.messageType || 'text',
        options.fileUrl || null,
        options.category || 'support',
        options.priority || 'normal',
        options.parentMessageId || null
      ]);
    } catch (err) {
      // If parent_message_id column doesn't exist, insert without it
      console.error('Insert error (trying fallback):', err.message);
      if (err.message && (err.message.includes('parent_message_id') || err.message.includes('Unknown column') || err.code === 'ER_BAD_FIELD_ERROR')) {
        await executeQuery(`
          INSERT INTO messages (
            id, conversation_id, sender_id, content, 
            message_type, file_url, category, priority, is_read, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
        `, [
          messageId,
          conversationId,
          userId,
          content ? content.trim() : '',
          options.messageType || 'text',
          options.fileUrl || null,
          options.category || 'support',
          options.priority || 'normal'
        ]);
      } else {
        throw err;
      }
    }

    // Update conversation last_message_at
    await executeQuery(`
      UPDATE conversations
      SET last_message_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [conversationId]);

    // Get the created message with parent message info if it's a reply
    let createdMsg;
    try {
      createdMsg = await executeQuery(`
        SELECT 
          m.id,
          m.sender_id,
          m.content,
          m.message_type,
          m.file_url,
          m.category,
          m.priority,
          m.created_at,
          m.parent_message_id,
          u.first_name,
          u.last_name,
          u.profile_image as sender_avatar,
          pm.content AS parent_message_content,
          pmu.first_name AS parent_sender_first_name,
          pmu.last_name AS parent_sender_last_name,
          pmu.profile_image AS parent_sender_avatar,
          pm.sender_id AS parent_sender_id
        FROM messages m
        LEFT JOIN users u ON m.sender_id = u.id
        LEFT JOIN messages pm ON m.parent_message_id = pm.id
        LEFT JOIN users pmu ON pm.sender_id = pmu.id
        WHERE m.id = ?
      `, [messageId]);
    } catch (err) {
      // If parent_message_id column doesn't exist, fall back to query without it
      console.error('Select error (trying fallback):', err.message);
      if (err.message && (err.message.includes('parent_message_id') || err.message.includes('Unknown column') || err.code === 'ER_BAD_FIELD_ERROR')) {
        createdMsg = await executeQuery(`
          SELECT 
            m.id,
            m.sender_id,
            m.content,
            m.message_type,
            m.file_url,
            m.category,
            m.priority,
            m.created_at,
            NULL as parent_message_id,
            u.first_name,
            u.last_name,
            u.profile_image as sender_avatar,
            NULL AS parent_message_content,
            NULL AS parent_sender_first_name,
            NULL AS parent_sender_last_name,
            NULL AS parent_sender_avatar,
            NULL AS parent_sender_id
          FROM messages m
          LEFT JOIN users u ON m.sender_id = u.id
          WHERE m.id = ?
        `, [messageId]);
      } else {
        throw err;
      }
    }

    if (createdMsg.length === 0) {
      throw new Error('Failed to retrieve created message');
    }

    const m = createdMsg[0];
    // Emit live updates to both sides
    try {
      const bus = global.__SELLER_MSG_BUS__;
      if (bus) {
        bus.emit('seller.messages', { event: 'message.new', userId, conversationId, messageId });
        const others = await executeQuery(`
          SELECT user_id FROM conversation_participants WHERE conversation_id = ? AND user_id <> ? AND left_at IS NULL LIMIT 5
        `, [conversationId, userId]);
        (others || []).forEach(row => bus.emit('seller.messages', { event: 'message.new', userId: row.user_id, conversationId, messageId }));
      }
    } catch (_) {}

    return {
      id: m.id,
      sender: {
        id: m.sender_id,
        name: 'You',
        avatar: m.sender_avatar || '',
        type: 'seller'
      },
      content: m.content,
      messageType: m.message_type || 'text',
      fileUrl: m.file_url || null,
      category: m.category || 'support',
      priority: m.priority || 'normal',
      timestamp: m.created_at,
      replyTo: m.parent_message_id ? {
        id: m.parent_message_id,
        content: m.parent_message_content,
        sender: {
          id: m.parent_sender_id,
          name: `${m.parent_sender_first_name || ''} ${m.parent_sender_last_name || ''}`.trim() || 'Unknown',
          avatar: m.parent_sender_avatar || '',
          type: m.parent_sender_id === userId ? 'seller' : 'buyer'
        }
      } : undefined
    };
  } catch (err) {
    console.error('Error sending message:', err);
    throw err;
  }
};

// Mark messages as read
const markMessagesAsRead = async (userId, conversationId, messageIds = null) => {
  try {
    // Verify seller is a participant
    const participantCheck = await executeQuery(`
      SELECT conversation_id
      FROM conversation_participants
      WHERE conversation_id = ? 
        AND user_id = ?
        AND role IN ('seller', 'member', 'admin')
        AND left_at IS NULL
    `, [conversationId, userId]);

    if (participantCheck.length === 0) {
      throw new Error('Conversation not found or unauthorized');
    }

    if (messageIds && Array.isArray(messageIds) && messageIds.length > 0) {
      // Mark specific messages as read
      const placeholders = messageIds.map(() => '?').join(',');
      await executeQuery(`
        UPDATE messages 
        SET is_read = 1 
        WHERE conversation_id = ? AND id IN (${placeholders}) AND sender_id != ?
      `, [conversationId, ...messageIds, userId]);
    } else {
      // Mark all unread messages in conversation as read (except seller's own messages)
      await executeQuery(`
        UPDATE messages 
        SET is_read = 1 
        WHERE conversation_id = ? AND is_read = 0 AND sender_id != ?
      `, [conversationId, userId]);
    }

    // Emit a read event to sender and participants
    try {
      const bus = global.__SELLER_MSG_BUS__;
      if (bus) {
        bus.emit('seller.messages', { event: 'message.read', userId, conversationId, messageIds: messageIds || 'all' });
        const others = await executeQuery(`
          SELECT user_id FROM conversation_participants WHERE conversation_id = ? AND user_id <> ? AND left_at IS NULL LIMIT 5
        `, [conversationId, userId]);
        (others || []).forEach(row => bus.emit('seller.messages', { event: 'message.read', userId: row.user_id, conversationId, messageIds: messageIds || 'all' }));
      }
    } catch (_) {}

    return { success: true };
  } catch (err) {
    console.error('Error marking messages as read:', err);
    throw err;
  }
};

// Archive/unarchive conversation
const archiveConversation = async (userId, conversationId, archived = true) => {
  try {
    // Get current settings
    const participant = await executeQuery(`
      SELECT settings
      FROM conversation_participants
      WHERE conversation_id = ? 
        AND user_id = ?
        AND role IN ('seller', 'member', 'admin')
        AND left_at IS NULL
    `, [conversationId, userId]);

    if (participant.length === 0) {
      throw new Error('Conversation not found or unauthorized');
    }

    // Update settings JSON to include archived status (handle string or object)
    let currentSettings = {};
    try {
      const raw = participant[0].settings;
      if (!raw) currentSettings = {};
      else if (typeof raw === 'string') currentSettings = JSON.parse(raw);
      else if (typeof raw === 'object') currentSettings = raw;
      else currentSettings = {};
    } catch {
      currentSettings = {};
    }
    currentSettings.archived = archived ? 1 : 0;

    await executeQuery(`
      UPDATE conversation_participants
      SET settings = ?
      WHERE conversation_id = ? AND user_id = ?
    `, [JSON.stringify(currentSettings), conversationId, userId]);

    return { success: true };
  } catch (err) {
    console.error('Error archiving conversation:', err);
    throw err;
  }
};

// Delete messages
const deleteMessages = async (userId, conversationId, messageIds) => {
  try {
    // Verify seller is a participant
    const participantCheck = await executeQuery(`
      SELECT conversation_id
      FROM conversation_participants
      WHERE conversation_id = ? 
        AND user_id = ?
        AND role IN ('seller', 'member', 'admin')
        AND left_at IS NULL
    `, [conversationId, userId]);

    if (participantCheck.length === 0) {
      throw new Error('Conversation not found or unauthorized');
    }

    // Only allow seller to delete their own messages
    const placeholders = messageIds.map(() => '?').join(',');
    await executeQuery(`
      DELETE FROM messages 
      WHERE conversation_id = ? AND id IN (${placeholders}) AND sender_id = ?
    `, [conversationId, ...messageIds, userId]);

    return { success: true };
  } catch (err) {
    console.error('Error deleting messages:', err);
    throw err;
  }
};

// Permanently delete conversation for this seller (leave the conversation; delete if no participants remain)
const deleteConversationForSeller = async (userId, conversationId) => {
  try {
    // Mark seller as left
    await executeQuery(`
      UPDATE conversation_participants
      SET left_at = CURRENT_TIMESTAMP
      WHERE conversation_id = ? AND user_id = ? AND role IN ('seller','member','admin') AND left_at IS NULL
    `, [conversationId, userId]);

    // If no active participants remain, delete messages and conversation
    const remaining = await executeQuery(`
      SELECT COUNT(*) as cnt
      FROM conversation_participants
      WHERE conversation_id = ? AND left_at IS NULL
    `, [conversationId]);

    const count = parseInt(remaining[0]?.cnt) || 0;
    if (count === 0) {
      await executeQuery(`DELETE FROM messages WHERE conversation_id = ?`, [conversationId]);
      await executeQuery(`DELETE FROM conversation_participants WHERE conversation_id = ?`, [conversationId]);
      await executeQuery(`DELETE FROM conversations WHERE id = ?`, [conversationId]);
    }

    return { success: true, removed: count === 0 };
  } catch (err) {
    console.error('Error deleting conversation for seller:', err);
    throw err;
  }
};

// ==================== SELLER ANALYTICS FUNCTIONS ====================

// Get comprehensive seller analytics
const getSellerAnalytics = async (userId, filters = {}) => {
  try {
    // Get seller_id from user_id
    const sellerRows = await executeQuery(`SELECT id FROM sellers WHERE user_id = ? LIMIT 1`, [userId]);
    if (sellerRows.length === 0) {
      throw new Error('Seller profile not found');
    }
    const sellerId = sellerRows[0].id;

    // Calculate date range
    let dateFilter = '';
    const params = [sellerId];
    
    // Normalize period value (handle string/number/undefined)
    const period = String(filters.period || '12m').toLowerCase();
    
    if (filters.start_date && filters.end_date) {
      dateFilter = ' AND c.updated_at >= ? AND c.updated_at <= ?';
      params.push(filters.start_date, filters.end_date);
    } else {
      // Default period handling: 12m, 6m, 3m
      const months = period === '3m' ? 3 : period === '6m' ? 6 : 12;
      dateFilter = ' AND c.updated_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)';
      params.push(months);
      console.log(`Analytics period filter: ${period} -> ${months} months`);
    }

    // 1. Sales by period (monthly aggregation)
    const salesByPeriod = await executeQuery(`
      SELECT 
        DATE_FORMAT(c.updated_at, '%Y-%m') as period_key,
        DATE_FORMAT(c.updated_at, '%b') as period,
        COUNT(*) as sales_count,
        COALESCE(ROUND(SUM(c.price), 2), 0) as total_revenue
      FROM cars c
      WHERE c.seller_id = ? AND c.status = 'sold'${dateFilter}
      GROUP BY DATE_FORMAT(c.updated_at, '%Y-%m'), DATE_FORMAT(c.updated_at, '%b')
      ORDER BY period_key ASC
    `, params);

    // 2. Top selling models
    const topSellingModels = await executeQuery(`
      SELECT 
        CONCAT(c.brand, ' ', c.model) as model,
        COUNT(*) as units,
        COALESCE(ROUND(SUM(c.price), 2), 0) as revenue
      FROM cars c
      WHERE c.seller_id = ? AND c.status = 'sold'${dateFilter}
      GROUP BY c.brand, c.model
      ORDER BY units DESC
      LIMIT 10
    `, params);

    // 3. Sales by channel (using orders table if available, otherwise default to marketplace)
    let salesByChannel = [];
    try {
      let channelDateFilter = '';
      const channelParams = [sellerId];
      if (filters.start_date && filters.end_date) {
        channelDateFilter = ' AND o.created_at >= ? AND o.created_at <= ?';
        channelParams.push(filters.start_date, filters.end_date);
      } else {
        const months = period === '3m' ? 3 : period === '6m' ? 6 : 12;
        channelDateFilter = ' AND o.created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)';
        channelParams.push(months);
      }
      
      salesByChannel = await executeQuery(`
        SELECT 
          COALESCE(o.delivery_method, 'Marketplace') as channel,
          COUNT(DISTINCT o.id) as sales
        FROM orders o
        WHERE o.seller_id = ? AND o.status IN ('delivered', 'completed')${channelDateFilter}
        GROUP BY channel
      `, channelParams);
      
      // If no orders, default to marketplace based on cars
      if (salesByChannel.length === 0) {
        const carSales = await executeQuery(`
          SELECT COUNT(*) as sales
          FROM cars c
          WHERE c.seller_id = ? AND c.status = 'sold'${dateFilter}
        `, params);
        salesByChannel = [{ channel: 'Marketplace', sales: parseInt(carSales[0]?.sales) || 0 }];
      }
    } catch (ordersErr) {
      // Fallback: use cars table only
      const carSales = await executeQuery(`
        SELECT COUNT(*) as sales
        FROM cars c
        WHERE c.seller_id = ? AND c.status = 'sold'${dateFilter}
      `, params);
      salesByChannel = [{ channel: 'Marketplace', sales: parseInt(carSales[0]?.sales) || 0 }];
    }

    // 4. Sales by location (using car location or buyer location from orders)
    let salesByLocation = [];
    try {
      // Try to get from orders with buyer location
      let locationDateFilter = '';
      const locationParams = [sellerId];
      if (filters.start_date && filters.end_date) {
        locationDateFilter = ' AND o.created_at >= ? AND o.created_at <= ?';
        locationParams.push(filters.start_date, filters.end_date);
      } else {
        const months = period === '3m' ? 3 : period === '6m' ? 6 : 12;
        locationDateFilter = ' AND o.created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)';
        locationParams.push(months);
      }
      
      salesByLocation = await executeQuery(`
        SELECT 
          COALESCE(JSON_UNQUOTE(JSON_EXTRACT(o.delivery_address, '$.country')), 
                   JSON_UNQUOTE(JSON_EXTRACT(o.delivery_address, '$.region')),
                   'Unknown') as region,
          COALESCE(ROUND(SUM(o.total_amount), 2), 0) as revenue
        FROM orders o
        INNER JOIN order_items oi ON o.id = oi.order_id
        WHERE o.seller_id = ? AND o.status IN ('delivered', 'completed')
          AND oi.item_type = 'car'${locationDateFilter}
        GROUP BY region
        ORDER BY revenue DESC
        LIMIT 10
      `, locationParams);
    } catch (locationErr) {
      // Fallback: use car country/state
      salesByLocation = await executeQuery(`
        SELECT 
          COALESCE(c.country, c.state, 'Unknown') as region,
          COALESCE(ROUND(SUM(c.price), 2), 0) as revenue
        FROM cars c
        WHERE c.seller_id = ? AND c.status = 'sold'${dateFilter}
        GROUP BY COALESCE(c.country, c.state, 'Unknown')
        ORDER BY revenue DESC
        LIMIT 10
      `, params);
    }

    // Format sales by period with month names
    const formattedSalesByPeriod = salesByPeriod.map(item => ({
      period: item.period || item.period_key?.substring(5) || 'Unknown',
      sales_count: parseInt(item.sales_count) || 0,
      total_revenue: parseFloat(item.total_revenue) || 0
    }));

    // Format top selling models
    const formattedTopModels = topSellingModels.map(item => ({
      model: item.model || 'Unknown',
      units: parseInt(item.units) || 0,
      revenue: parseFloat(item.revenue) || 0
    }));

    // Format sales by channel
    const formattedChannels = salesByChannel.map(item => ({
      channel: item.channel || 'Marketplace',
      sales: parseInt(item.sales) || 0
    }));

    // Format sales by location
    const formattedLocations = salesByLocation.map(item => ({
      region: item.region || 'Unknown',
      revenue: parseFloat(item.revenue) || 0
    }));

    // Calculate conversion rate (sold vehicles / total vehicles)
    let conversionRate = 0;
    try {
      // Build conversion rate query - use same date filter logic
      let convDateFilter = '';
      const convParams = [sellerId];
      
      if (filters.start_date && filters.end_date) {
        convDateFilter = ' AND c.created_at >= ? AND c.created_at <= ?';
        convParams.push(filters.start_date, filters.end_date);
      } else {
        const months = period === '3m' ? 3 : period === '6m' ? 6 : 12;
        convDateFilter = ' AND c.created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)';
        convParams.push(months);
      }
      
      const convQuery = `
        SELECT 
          COUNT(*) as total_vehicles,
          COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_vehicles
        FROM cars c
        WHERE c.seller_id = ?${convDateFilter}
      `;
      const convResult = await executeQuery(convQuery, convParams);
      const totalVehicles = parseInt(convResult[0]?.total_vehicles) || 0;
      const soldVehicles = parseInt(convResult[0]?.sold_vehicles) || 0;
      conversionRate = totalVehicles > 0 ? Math.round((soldVehicles / totalVehicles) * 100) : 0;
      console.log(`Conversion rate calculation: ${soldVehicles}/${totalVehicles} = ${conversionRate}%`);
    } catch (convErr) {
      console.error('Error calculating conversion rate:', convErr);
      conversionRate = 0;
    }

    return {
      sales_by_period: formattedSalesByPeriod,
      top_selling_models: formattedTopModels,
      sales_by_channel: formattedChannels,
      sales_by_location: formattedLocations,
      conversion_rate: conversionRate
    };
  } catch (err) {
    console.error('Error getting seller analytics:', err);
    throw err;
  }
};

module.exports = {
  getSellerProfile,
  upsertSellerProfile,
  getSellerSettings,
  upsertSellerSettings,
  deleteSellerAccount,
  checkNotificationPreference,
  getSellerReviews,
  replyToReview,
  startConversation,
  getSellerConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  archiveConversation,
  deleteMessages,
  deleteConversationForSeller,
  getSellerAnalytics,
  checkParticipant,
};


