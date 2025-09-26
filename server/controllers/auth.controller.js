const AuthService = require('../services/auth.service');
const { validateEmail, validatePasswordStrength, sanitizeName } = require('../utils/validators');

module.exports = {
  async register(req, res) {
    try {
      const { email, password, first_name, last_name, phone, role = 'learner' } = req.body || {};

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
      const validRoles = ['learner', 'instructor', 'buyer', 'seller', 'dealer', 'university', 'visa_officer', 'admin', 'advertiser'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Valid roles: ' + validRoles.join(', ') });
      }

      const user = await AuthService.registerUser({
        email: String(email).toLowerCase().trim(),
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

  async login(req, res) {
    try {
      const { identifier, password } = req.body || {};
      if (!identifier || !password) {
        return res.status(400).json({ error: 'Identifier and password are required' });
      }

      const result = await AuthService.authenticateUser(String(identifier).trim(), String(password));

      if (!result.success) {
        return res.status(result.status || 401).json({ error: result.error || 'Invalid credentials' });
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      const { first_name, last_name, phone, bio } = req.body || {};

      const updateData = {};
      if (first_name) updateData.firstName = sanitizeName(first_name);
      if (last_name) updateData.lastName = sanitizeName(last_name);
      if (phone) updateData.phone = String(phone).trim();
      if (bio) updateData.bio = String(bio).trim();

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

  // Admin-only: Create user with specific role
  async createUser(req, res) {
    try {
      const { email, password, first_name, last_name, phone, role = 'learner' } = req.body || {};

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
      const validRoles = ['learner', 'instructor', 'buyer', 'seller', 'dealer', 'university', 'visa_officer', 'admin', 'advertiser'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Valid roles: ' + validRoles.join(', ') });
      }

      const user = await AuthService.registerUser({
        email: String(email).toLowerCase().trim(),
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

      const validRoles = ['learner', 'instructor', 'buyer', 'seller', 'dealer', 'university', 'visa_officer', 'admin', 'advertiser'];
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


