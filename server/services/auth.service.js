const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { executeQuery } = require('../config/database');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret';
const DEFAULT_REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const LONG_REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const REFRESH_TTL_SECONDS = Number(process.env.JWT_REFRESH_TTL_SECONDS || DEFAULT_REFRESH_TTL_SECONDS);
const ACCESS_TTL_SECONDS = Number(process.env.JWT_ACCESS_TTL_SECONDS || 60 * 15);

function generateRandomToken(bytes = 64) {
  return crypto.randomBytes(bytes).toString('hex');
}

function sha256Hex(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function signAccessToken(user) {
  const payload = { sub: user.id, role: user.role };
  const token = jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_TTL_SECONDS
  });
  return { token, expiresIn: ACCESS_TTL_SECONDS };
}

async function createRefreshSession(userId, opts = {}) {
  const refreshToken = generateRandomToken(48);
  const tokenHash = sha256Hex(refreshToken);
  const ttl = opts.long ? LONG_REFRESH_TTL_SECONDS : REFRESH_TTL_SECONDS;
  await executeQuery(
    'INSERT INTO user_sessions (id, user_id, token_hash, expires_at, created_at) VALUES (UUID(), ?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND), NOW())',
    [userId, tokenHash, ttl]
  );
  return {
    refreshToken,
    refreshExpiresIn: ttl
  };
}

async function deleteRefreshSessionByToken(refreshToken) {
  const tokenHash = sha256Hex(String(refreshToken));
  await executeQuery('DELETE FROM user_sessions WHERE token_hash = ? LIMIT 1', [tokenHash]);
}

async function findUserByIdentifier(identifier) {
  const rows = await executeQuery(
    'SELECT id, email, password, first_name, last_name, phone, role, is_verified, is_active FROM users WHERE email = ? OR phone = ? LIMIT 1',
    [identifier, identifier]
  );
  return rows && rows[0] ? rows[0] : null;
}

async function logLoginAttempt({ userId = null, identifier, success, failureReason = null, ipAddress = null, userAgent = null }) {
  try {
    await executeQuery(
      'INSERT INTO auth_login_attempts (id, user_id, identifier, success, failure_reason, ip_address, user_agent, created_at) VALUES (UUID(), ?, ?, ?, ?, ?, ?, NOW())',
      [userId, identifier, !!success, failureReason, ipAddress, userAgent]
    );
  } catch (_) {
    // do not block auth flow on logging failure
  }
}

module.exports = {
  async getOrCreateOAuthUser({ email, firstName = '', lastName = '', provider }) {
    if (!email) throw new Error('Email is required from provider');
    const rows = await executeQuery('SELECT id, email, role FROM users WHERE email = ? LIMIT 1', [email]);
    if (rows[0]) return rows[0];
    await executeQuery(
      'INSERT INTO users (id, email, password, first_name, last_name, role, is_verified, is_active, created_at, updated_at) VALUES (UUID(), ?, NULL, ?, ?, ?, TRUE, TRUE, NOW(), NOW())',
      [email, firstName, lastName, 'student']
    );
    const users = await executeQuery('SELECT id, email, role FROM users WHERE email = ? LIMIT 1', [email]);
    return users[0];
  },

  async issueTokensForUser(user) {
    const { token: accessToken, expiresIn: accessExpiresIn } = signAccessToken(user);
    const { refreshToken, refreshExpiresIn } = await createRefreshSession(user.id);
    return { accessToken, accessExpiresIn, refreshToken, refreshExpiresIn };
  },
  async registerUser({ email, password, firstName, lastName, phone, role = 'student' }) {
    const passwordHash = await bcrypt.hash(password, 10);
    await executeQuery(
      'INSERT INTO users (id, email, password, first_name, last_name, phone, role, is_verified, is_active, created_at, updated_at) VALUES (UUID(), ?, ?, ?, ?, ?, ?, FALSE, TRUE, NOW(), NOW())',
      [email, passwordHash, firstName, lastName, phone, role]
    );
    const users = await executeQuery('SELECT id, email, role, is_verified FROM users WHERE email = ? LIMIT 1', [email]);
    return users[0];
  },

  async authenticateUser(identifier, password, { remember = false } = {}) {
    const user = await findUserByIdentifier(identifier);
    if (!user) {
      await logLoginAttempt({ identifier, success: false, failureReason: 'invalid_credentials' });
      return { success: false, error: 'Invalid credentials', status: 401 };
    }
    if (!user.is_active) {
      await logLoginAttempt({ userId: user.id, identifier, success: false, failureReason: 'blocked' });
      return { success: false, error: 'Account disabled', status: 403 };
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      await logLoginAttempt({ userId: user.id, identifier, success: false, failureReason: 'invalid_credentials' });
      return { success: false, error: 'Invalid credentials', status: 401 };
    }

    // Success
    await logLoginAttempt({ userId: user.id, identifier, success: true });
    await executeQuery('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const { token: accessToken, expiresIn: accessExpiresIn } = signAccessToken(user);
    const { refreshToken, refreshExpiresIn } = await createRefreshSession(user.id, { long: !!remember });

    return {
      success: true,
      user: { id: user.id, email: user.email, role: user.role },
      tokens: {
        accessToken,
        accessExpiresIn,
        refreshToken,
        refreshExpiresIn
      }
    };
  },

  async refreshAccessToken(refreshToken) {
    if (!refreshToken) return null;
    const tokenHash = sha256Hex(String(refreshToken));
    const sessions = await executeQuery(
      'SELECT user_id, expires_at FROM user_sessions WHERE token_hash = ? LIMIT 1',
      [tokenHash]
    );
    if (!sessions[0]) return null;

    const session = sessions[0];
    const expired = new Date(session.expires_at).getTime() < Date.now();
    if (expired) {
      await executeQuery('DELETE FROM user_sessions WHERE token_hash = ? LIMIT 1', [tokenHash]);
      return null;
    }

    const users = await executeQuery('SELECT id, email, role, is_active FROM users WHERE id = ? LIMIT 1', [session.user_id]);
    const user = users[0];
    if (!user || !user.is_active) {
      await executeQuery('DELETE FROM user_sessions WHERE token_hash = ? LIMIT 1', [tokenHash]);
      return null;
    }

    // Rotate refresh token: delete old and create new
    await executeQuery('DELETE FROM user_sessions WHERE token_hash = ? LIMIT 1', [tokenHash]);
    const { token: accessToken, expiresIn: accessExpiresIn } = signAccessToken(user);
    const { refreshToken: newRefreshToken, refreshExpiresIn } = await createRefreshSession(user.id);

    return {
      access_token: accessToken,
      access_expires_in: accessExpiresIn,
      refresh_token: newRefreshToken,
      refresh_expires_in: refreshExpiresIn
    };
  },

  async revokeRefreshToken(refreshToken) {
    if (!refreshToken) return;
    await deleteRefreshSessionByToken(refreshToken);
  },

  async getUserProfile(userId) {
    const users = await executeQuery(
      'SELECT id, email, first_name, last_name, phone, role, is_verified, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    return users[0] || null;
  },

  async updateUserProfile(userId, updateData) {
    const fields = [];
    const values = [];

    if (updateData.firstName) {
      fields.push('first_name = ?');
      values.push(updateData.firstName);
    }
    if (updateData.lastName) {
      fields.push('last_name = ?');
      values.push(updateData.lastName);
    }
    if (updateData.phone !== undefined) {
      fields.push('phone = ?');
      values.push(updateData.phone);
    }
    if (updateData.bio !== undefined) {
      fields.push('bio = ?');
      values.push(updateData.bio);
    }

    if (fields.length === 0) {
      return await this.getUserProfile(userId);
    }

    fields.push('updated_at = NOW()');
    values.push(userId);

    await executeQuery(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return await this.getUserProfile(userId);
  },

  // Admin-only: List users with pagination and filtering
  async listUsers({ page = 1, limit = 10, role, search }) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      whereClause += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countResult = await executeQuery(countQuery, params);
    const total = countResult[0].total;

    // Get users
    const usersQuery = `
      SELECT id, email, first_name, last_name, phone, role, is_verified, is_active, created_at, updated_at 
      FROM users ${whereClause} 
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;
    const users = await executeQuery(usersQuery, params);

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  // Admin-only: Update user role
  async updateUserRole(userId, role) {
    await executeQuery(
      'UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?',
      [role, userId]
    );
    return await this.getUserProfile(userId);
  },

  // Admin-only: Delete user
  async deleteUser(userId) {
    const result = await executeQuery('DELETE FROM users WHERE id = ?', [userId]);
    return result.affectedRows > 0;
  }
};


