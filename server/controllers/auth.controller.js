const AuthService = require('../services/auth.service');
const Magic = require('../services/magic-link.service');
const Email = require('../services/email.service');
const { validateEmail, validatePasswordStrength, sanitizeName } = require('../utils/validators');

// TOTP verification helper (RFC 6238, SHA1, 30s period)
function verifyTotp(base32Secret, token, window = 1) {
  const crypto = require('crypto');
  const base32Decode = (str) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const cleaned = String(str).replace(/=+$/,'').toUpperCase();
    let bits = 0, value = 0; const output = [];
    for (let i = 0; i < cleaned.length; i++) {
      const idx = alphabet.indexOf(cleaned[i]);
      if (idx === -1) continue;
      value = (value << 5) | idx; bits += 5;
      if (bits >= 8) { output.push((value >>> (bits - 8)) & 0xff); bits -= 8; }
    }
    return Buffer.from(output);
  };
  if (!base32Secret) return false;
  const secret = base32Decode(base32Secret);
  const timeStep = 30;
  const counterNow = Math.floor(Date.now() / 1000 / timeStep);
  const gen = (counter) => {
    const buf = Buffer.alloc(8);
    for (let i = 7; i >= 0; i--) { buf[i] = counter & 0xff; counter >>= 8; }
    const hmac = crypto.createHmac('sha1', secret).update(buf).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset+1] & 0xff) << 16) | ((hmac[offset+2] & 0xff) << 8) | (hmac[offset+3] & 0xff);
    const otp = (code % 1_000_000).toString().padStart(6, '0');
    return otp;
  };
  const input = String(token).replace(/\s+/g, '');
  for (let w = -window; w <= window; w++) {
    if (gen(counterNow + w) === input) return true;
  }
  return false;
}

module.exports = {
  async register(req, res) {
    try {
      const { email, password, first_name, last_name, phone, role = 'student' } = req.body || {};

      if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email' });
      }
      if (!validatePasswordStrength(password)) {
        return res.status(400).json({ error: 'Weak password' });
      }
      if (!first_name || !last_name) {
        return res.status(400).json({ error: 'First and last name are required' });
      }

      // Validate role
      const validRoles = ['student', 'instructor', 'buyer', 'seller', 'dealer', 'university', 'visa_officer', 'admin', 'advertiser'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Valid roles: ' + validRoles.join(', ') });
      }

      const user = await AuthService.registerUser({
        email: String(email).trim(),
        password,
        firstName: sanitizeName(first_name),
        lastName: sanitizeName(last_name),
        phone: phone ? String(phone).trim() : null,
        role: role
      });

      return res.status(201).json({ 
        id: user.id, 
        email: user.email, 
        role: user.role,
        is_verified: user.is_verified 
      });
    } catch (error) {
      if (error && error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Email already registered' });
      }
      console.error('Register error', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async requestMagicLink(req, res) {
    try {
      const { email } = req.body || {};
      if (!email) return res.status(400).json({ error: 'Email required' });
      const { token, expiresAt } = Magic.create(email);
      const appUrl = process.env.APP_BASE_URL || 'http://localhost:5173';
      const link = `${appUrl}/login?token=${token}`;
      await Email.sendMail({
        to: email,
        subject: 'Your magic sign-in link',
        html: `<p>Click to sign in: <a href="${link}">${link}</a></p><p>This link expires in 10 minutes.</p>`,
      });
      return res.json({ status: 'sent', expires_at: expiresAt });
    } catch (e) {
      return res.status(500).json({ error: 'Could not initiate magic link' });
    }
  },

  async consumeMagicLink(req, res) {
    try {
      const { token } = req.body || {};
      if (!token) return res.status(400).json({ error: 'Missing token' });
      const email = Magic.consume(token);
      if (!email) return res.status(400).json({ error: 'Invalid or expired token' });
      // Ensure user exists (create if not) and issue tokens
      const user = await AuthService.getOrCreateOAuthUser({ email, firstName: '', lastName: '', provider: 'magic' });
      const tokens = await AuthService.issueTokensForUser(user);
      return res.json({
        access_token: tokens.accessToken,
        access_expires_in: tokens.accessExpiresIn,
        refresh_token: tokens.refreshToken,
        refresh_expires_in: tokens.refreshExpiresIn,
        user: { id: user.id, email: user.email, role: user.role }
      });
    } catch (e) {
      return res.status(500).json({ error: 'Magic link login failed' });
    }
  },

  async login(req, res) {
    try {
      const { identifier, password, two_factor_code } = req.body || {};
      if (!identifier || !password) {
        return res.status(400).json({ error: 'Identifier and password are required' });
      }

      const result = await AuthService.authenticateUser(String(identifier).trim(), String(password), { remember: !!req.body.remember_me });

      if (!result.success) {
        return res.status(result.status || 401).json({ error: result.error || 'Invalid credentials' });
      }

      // If user has 2FA enabled, verify code before issuing tokens
      const userRecord = await require('../config/database').executeQuery('SELECT two_factor_enabled, two_factor_secret FROM users WHERE id = ? LIMIT 1', [result.user.id]);
      if (userRecord[0]?.two_factor_enabled) {
        if (!two_factor_code) {
          return res.status(401).json({ error: 'TWO_FACTOR_REQUIRED' });
        }
        const valid = verifyTotp(userRecord[0].two_factor_secret, String(two_factor_code));
        if (!valid) {
          return res.status(401).json({ error: 'INVALID_TWO_FACTOR_CODE' });
        }
      }

      return res.json({
        access_token: result.tokens.accessToken,
        access_expires_in: result.tokens.accessExpiresIn,
        refresh_token: result.tokens.refreshToken,
        refresh_expires_in: result.tokens.refreshExpiresIn,
        user: { id: result.user.id, email: result.user.email, role: result.user.role }
      });
    } catch (error) {
      console.error('Login error', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async refresh(req, res) {
    try {
      const { refresh_token } = req.body || {};
      if (!refresh_token) {
        return res.status(400).json({ error: 'Missing refresh_token' });
      }
      const tokens = await AuthService.refreshAccessToken(refresh_token);
      if (!tokens) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
      }
      return res.json(tokens);
    } catch (error) {
      console.error('Refresh error', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async logout(req, res) {
    try {
      const { refresh_token } = req.body || {};
      if (refresh_token) {
        await AuthService.revokeRefreshToken(refresh_token);
      }
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getProfile(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = await AuthService.getUserProfile(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          role: user.role,
          is_verified: user.is_verified,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      });
    } catch (error) {
      console.error('Get profile error', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updateProfile(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { first_name, last_name, phone, bio } = req.body || {};
      const updateData = {};

      if (first_name) updateData.firstName = sanitizeName(first_name);
      if (last_name) updateData.lastName = sanitizeName(last_name);
      if (phone !== undefined) updateData.phone = phone ? String(phone).trim() : null;
      if (bio !== undefined) updateData.bio = bio ? String(bio).trim() : null;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const user = await AuthService.updateUserProfile(userId, updateData);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          bio: user.bio,
          role: user.role,
          updated_at: user.updated_at
        }
      });
    } catch (error) {
      console.error('Update profile error', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // 2FA: Setup (generate secret and provisioning URL)
  async twoFASetup(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Authentication required' });

      const crypto = require('crypto');
      const base32Encode = (buffer) => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = 0, value = 0, output = '';
        for (let i = 0; i < buffer.length; i++) {
          value = (value << 8) | buffer[i];
          bits += 8;
          while (bits >= 5) {
            output += alphabet[(value >>> (bits - 5)) & 31];
            bits -= 5;
          }
        }
        if (bits > 0) {
          output += alphabet[(value << (5 - bits)) & 31];
        }
        while (output.length % 8 !== 0) output += '=';
        return output;
      };

      const secretBytes = crypto.randomBytes(20);
      const secret = base32Encode(secretBytes);
      // Persist secret temporarily until enable
      await require('../config/database').executeQuery('UPDATE users SET two_factor_secret = ? WHERE id = ?', [secret, userId]);
      const issuer = encodeURIComponent('Reaglex');
      const label = encodeURIComponent(req.user?.email || 'user');
      const otpauth_url = `otpauth://totp/${issuer}:${label}?secret=${secret}&issuer=${issuer}&digits=6&period=30&algorithm=SHA1`;
      return res.json({ data: { secret, otpauth_url } });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // 2FA: Enable (verify code and enable)
  async twoFAEnable(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Authentication required' });
      const { code } = req.body || {};
      if (!code) return res.status(400).json({ error: 'Code is required' });

      const { executeQuery } = require('../config/database');
      const rows = await executeQuery('SELECT two_factor_secret FROM users WHERE id = ? LIMIT 1', [userId]);
      const secret = rows[0]?.two_factor_secret;
      if (!secret) return res.status(400).json({ error: '2FA not initialized' });

      const isValid = verifyTotp(secret, String(code));
      if (!isValid) return res.status(400).json({ error: 'Invalid code' });

      await executeQuery('UPDATE users SET two_factor_enabled = 1 WHERE id = ?', [userId]);
      return res.json({ message: '2FA enabled' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // 2FA: Disable
  async twoFADisable(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Authentication required' });
      await require('../config/database').executeQuery('UPDATE users SET two_factor_enabled = 0, two_factor_secret = NULL WHERE id = ?', [userId]);
      return res.json({ message: '2FA disabled' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
  
  async changePassword(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Authentication required' });

      const { current_password, new_password } = req.body || {};
      if (!current_password || !new_password) {
        return res.status(400).json({ error: 'current_password and new_password are required' });
      }
      if (String(new_password).length < 6) {
        return res.status(400).json({ error: 'New password is too short' });
      }

      try {
        await AuthService.changeUserPassword(userId, current_password, new_password);
      } catch (e) {
        if (e && e.code === 'INVALID_CURRENT_PASSWORD') {
          return res.status(400).json({ error: 'Current password is incorrect' });
        }
        throw e;
      }

      return res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Change password error', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async listSessions(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Authentication required' });
      const rows = await require('../config/database').executeQuery(
        'SELECT id, user_id, expires_at, created_at FROM user_sessions WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      return res.json({ data: rows });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async revokeAllSessions(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Authentication required' });
      await require('../config/database').executeQuery('DELETE FROM user_sessions WHERE user_id = ?', [userId]);
      return res.json({ message: 'All sessions revoked' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Export user data (profile, preferences, favorites, sessions)
  async exportData(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Authentication required' });
      const { executeQuery } = require('../config/database');
      const [profileRows, favorites, sessions] = await Promise.all([
        executeQuery('SELECT id, email, first_name, last_name, phone, role, is_verified, is_active, profile_image, address, social_links, preferences, bio, created_at, updated_at FROM users WHERE id = ? LIMIT 1', [userId]),
        executeQuery('SELECT id, user_id, car_id, created_at FROM car_favorites WHERE user_id = ?', [userId]),
        executeQuery('SELECT id, user_id, created_at, expires_at FROM user_sessions WHERE user_id = ?', [userId])
      ]);
      const profile = profileRows[0] || {};
      const payload = {
        profile,
        favorites,
        sessions,
        exported_at: new Date().toISOString(),
      };
      res.setHeader('Content-Disposition', 'attachment; filename="account-export.json"');
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(JSON.stringify(payload, null, 2));
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async revokeSession(req, res) {
    try {
      const userId = req.user?.id;
      const { sessionId } = req.params;
      if (!userId) return res.status(401).json({ error: 'Authentication required' });
      await require('../config/database').executeQuery(
        'DELETE FROM user_sessions WHERE id = ? AND user_id = ? LIMIT 1',
        [sessionId, userId]
      );
      return res.json({ message: 'Session revoked' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async deleteAccount(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Authentication required' });
      // Soft delete to keep referential integrity
      await require('../config/database').executeQuery(
        'UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ? LIMIT 1',
        [userId]
      );
      await require('../config/database').executeQuery('DELETE FROM user_sessions WHERE user_id = ?', [userId]);
      return res.json({ message: 'Account deactivated' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Admin-only: Create user with specific role
  async createUser(req, res) {
    try {
      const { email, password, first_name, last_name, phone, role = 'student' } = req.body || {};

      if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email' });
      }
      if (!validatePasswordStrength(password)) {
        return res.status(400).json({ error: 'Weak password' });
      }
      if (!first_name || !last_name) {
        return res.status(400).json({ error: 'First and last name are required' });
      }

      // Validate role
      const validRoles = ['student', 'instructor', 'buyer', 'seller', 'dealer', 'university', 'visa_officer', 'admin', 'advertiser'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Valid roles: ' + validRoles.join(', ') });
      }

      const user = await AuthService.registerUser({
        email: String(email).trim(),
        password,
        firstName: sanitizeName(first_name),
        lastName: sanitizeName(last_name),
        phone: phone ? String(phone).trim() : null,
        role: role
      });

      return res.status(201).json({ 
        id: user.id, 
        email: user.email, 
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_verified: user.is_verified,
        created_by: req.user.id
      });
    } catch (error) {
      if (error && error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Email already registered' });
      }
      console.error('Create user error', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Admin-only: List all users
  async listUsers(req, res) {
    try {
      const { page = 1, limit = 10, role, search } = req.query;
      const users = await AuthService.listUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        role,
        search
      });

      return res.json(users);
    } catch (error) {
      console.error('List users error', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Admin-only: Update user role
  async updateUserRole(req, res) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      const validRoles = ['student', 'instructor', 'buyer', 'seller', 'dealer', 'university', 'visa_officer', 'admin', 'advertiser'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Valid roles: ' + validRoles.join(', ') });
      }

      const user = await AuthService.updateUserRole(userId, role);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({
        message: 'User role updated successfully',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          updated_at: user.updated_at
        }
      });
    } catch (error) {
      console.error('Update user role error', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Admin-only: Delete user
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      // Prevent admin from deleting themselves
      if (userId === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      const success = await AuthService.deleteUser(userId);
      
      if (!success) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};


