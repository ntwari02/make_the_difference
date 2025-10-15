const { executeQuery } = require('../config/database');

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

module.exports = {
  getSellerProfile,
  upsertSellerProfile,
};


