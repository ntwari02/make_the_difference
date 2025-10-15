const { executeQuery } = require('../config/database');

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
    address: user.address ? JSON.parse(user.address) : null,
    social_links: user.social_links ? JSON.parse(user.social_links) : null,
  };
};

const updateProfileByUserId = async (userId, updates = {}) => {
  const allowed = {
    first_name: 'first_name',
    last_name: 'last_name',
    phone: 'phone',
    profile_image: 'profile_image',
    bio: 'bio',
    address: 'address', // JSON
    social_links: 'social_links', // JSON
  };

  const fields = [];
  const params = [];

  Object.entries(updates).forEach(([key, val]) => {
    if (allowed[key] !== undefined) {
      if (key === 'address' || key === 'social_links') {
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


