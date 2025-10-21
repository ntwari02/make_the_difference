const { executeQuery, executeTransaction } = require('../config/database');

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
  // Delete current user's account and related seller data
  deleteAccount: async (userId) => {
    const queries = [
      { query: 'DELETE FROM user_sessions WHERE user_id = ?', params: [userId] },
      { query: 'DELETE FROM notifications WHERE user_id = ?', params: [userId] },
      { query: 'DELETE FROM auth_devices WHERE user_id = ?', params: [userId] },
      { query: 'DELETE FROM auth_login_attempts WHERE user_id = ?', params: [userId] },
      { query: 'DELETE FROM auth_password_history WHERE user_id = ?', params: [userId] },
      { query: 'DELETE FROM auth_social_accounts WHERE user_id = ?', params: [userId] },
      { query: 'DELETE FROM auth_totp_backup_codes WHERE user_id = ?', params: [userId] },
      { query: 'DELETE FROM auth_totp WHERE user_id = ?', params: [userId] },
      { query: 'DELETE FROM privacy_consents WHERE user_id = ?', params: [userId] },
      { query: 'DELETE FROM rbac_user_roles WHERE user_id = ?', params: [userId] },
      { query: 'DELETE FROM ai_conversations WHERE user_id = ?', params: [userId] },
      { query: 'DELETE FROM ai_user_profiles WHERE user_id = ?', params: [userId] },
      { query: 'DELETE FROM car_favorites WHERE user_id = ?', params: [userId] },
      { query: 'DELETE FROM car_reviews WHERE user_id = ?', params: [userId] },
      // Remove favorites and reviews on cars owned by this seller
      { query: 'DELETE cf FROM car_favorites cf JOIN cars c ON cf.car_id = c.id WHERE c.seller_id = ?', params: [userId] },
      { query: 'DELETE cr FROM car_reviews cr JOIN cars c ON cr.car_id = c.id WHERE c.seller_id = ?', params: [userId] },
      { query: 'DELETE FROM cars WHERE seller_id = ?', params: [userId] },
      { query: 'DELETE FROM seller_settings WHERE user_id = ?', params: [userId] },
      { query: 'DELETE FROM sellers WHERE user_id = ?', params: [userId] },
      { query: 'DELETE FROM users WHERE id = ?', params: [userId] },
    ];
    await executeTransaction(queries);
    return true;
  },
};


