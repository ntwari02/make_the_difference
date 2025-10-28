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
    // Return empty array instead of null to avoid MySQL errors
    if (filtered.length === 0) return JSON.stringify([]);
    try {
      return JSON.stringify(filtered);
    } catch (_) {
      return JSON.stringify([]);
    }
  }
  
  // For objects, return empty object string instead of null
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return '{}';
  }
  
  try {
    const str = JSON.stringify(value);
    // Only return null for empty strings, not for empty objects or arrays
    if (str === '""') return null;
    return str;
  } catch (_) {
    return null;
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
  const existing = await executeQuery(`SELECT id FROM sellers WHERE user_id = ?`, [userId]);
  const json = (v) => (v === undefined ? null : JSON.stringify(v));
  if (existing.length === 0) {
    const id = require('crypto').randomUUID();
    await executeQuery(`
      INSERT INTO sellers (
        id, user_id, business_name, business_type, license_number, description, address, city, state, country, postal_code,
        phone, email, website, logo, images, business_hours, services, status, is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      safeJsonStringify(data.images),
      safeJsonStringify(data.business_hours),
      safeJsonStringify(data.services),
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

module.exports = {
  getSellerProfile,
  upsertSellerProfile,
};


