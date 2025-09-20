const AuthService = require('../services/auth.service');
const { validateEmail, validatePasswordStrength, sanitizeName } = require('../utils/validators');

module.exports = {
  async register(req, res) {
    try {
      const { email, password, first_name, last_name, phone } = req.body || {};

      if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email' });
      }
      if (!validatePasswordStrength(password)) {
        return res.status(400).json({ error: 'Weak password' });
      }
      if (!first_name || !last_name) {
        return res.status(400).json({ error: 'First and last name are required' });
      }

      const user = await AuthService.registerUser({
        email: String(email).toLowerCase().trim(),
        password,
        firstName: sanitizeName(first_name),
        lastName: sanitizeName(last_name),
        phone: phone ? String(phone).trim() : null
      });

      return res.status(201).json({ id: user.id, email: user.email, is_verified: user.is_verified });
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
      return res.status(204).send();
    } catch (error) {
      console.error('Logout error', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};


