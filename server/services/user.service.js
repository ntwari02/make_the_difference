const { executeQuery } = require('../config/database');

const safeParseJson = (value) => {
  if (value === null || value === undefined) return null;
  // If already an object/array, return as-is
  if (typeof value === 'object') return value;
  // Coerce to string for parsing
  const str = String(value).trim();
  if (!str) return null;
  // Common bad values from legacy code / incorrect inserts
  if (str === 'null' || str === 'undefined' || str === '[object Object]') return null;
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};

const getProfileByUserId = async (userId) => {
  const rows = await executeQuery(`
    SELECT 
      id,
      email,
      first_name,
      last_name,
      phone,
      role,
      is_verified,
      is_active,
      profile_image,
      address,
      social_links,
      preferences,
      bio,
      created_at,
      updated_at
    FROM users
    WHERE id = ?
    LIMIT 1
  `, [userId]);
  const user = rows[0] || null;
  if (!user) return null;
  // Normalize JSON columns
  return {
    ...user,
    address: safeParseJson(user.address),
    social_links: safeParseJson(user.social_links),
    preferences: safeParseJson(user.preferences),
  };
};

const updateProfileByUserId = async (userId, updates = {}) => {
  // Normalize/sanitize inputs (preserve email case as provided)
  const sanitized = { ...updates };
  if (sanitized.email !== undefined && sanitized.email !== null) {
    sanitized.email = String(sanitized.email).trim();
  }

  // Validate email uniqueness if changing email
  if (sanitized.email) {
    const exists = await executeQuery(
      'SELECT id FROM users WHERE BINARY email = ? AND id <> ? LIMIT 1',
      [sanitized.email, userId]
    );
    if (exists && exists[0]) {
      throw new Error('Email is already in use');
    }
  }
  const allowed = {
    email: 'email',
    first_name: 'first_name',
    last_name: 'last_name',
    phone: 'phone',
    profile_image: 'profile_image',
    bio: 'bio',
    address: 'address', // JSON
    social_links: 'social_links', // JSON
    preferences: 'preferences', // JSON
  };

  const fields = [];
  const params = [];

  Object.entries(sanitized).forEach(([key, val]) => {
    if (allowed[key] !== undefined) {
      if (key === 'address' || key === 'social_links' || key === 'preferences') {
        fields.push(`${allowed[key]} = ?`);
        params.push(JSON.stringify(val ?? null));
      } else {
        fields.push(`${allowed[key]} = ?`);
        params.push(val);
      }
    }
  });

  if (fields.length === 0) {
    return getProfileByUserId(userId);
  }

  params.push(userId);
  await executeQuery(`
    UPDATE users
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, params);

  return getProfileByUserId(userId);
};

module.exports = {
  getProfileByUserId,
  updateProfileByUserId,
};


