const { Issuer } = require('openid-client');
const axios = require('axios');
const AuthService = require('../services/auth.service');

// Environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/oauth/google/callback';

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3000/api/auth/oauth/facebook/callback';

async function buildGoogleClient() {
  const googleIssuer = await Issuer.discover('https://accounts.google.com');
  return new googleIssuer.Client({
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uris: [GOOGLE_REDIRECT_URI],
    response_types: ['code'],
  });
}

module.exports = {
  // GET /auth/oauth/google/url
  async googleAuthUrl(req, res) {
    try {
      const client = await buildGoogleClient();
      const url = client.authorizationUrl({
        scope: 'openid email profile',
        prompt: 'consent',
      });
      return res.json({ url });
    } catch (err) {
      console.error('Google auth url error', err);
      return res.status(500).json({ error: 'Failed to init Google OAuth' });
    }
  },

  // GET /auth/oauth/google/callback
  async googleCallback(req, res) {
    try {
      const client = await buildGoogleClient();
      const params = client.callbackParams(req);
      const tokenSet = await client.callback(GOOGLE_REDIRECT_URI, params, {});
      const userinfo = await client.userinfo(tokenSet);

      const email = String(userinfo.email || '').toLowerCase();
      const firstName = (userinfo.given_name || '').toString();
      const lastName = (userinfo.family_name || '').toString();

      const user = await AuthService.getOrCreateOAuthUser({ email, firstName, lastName, provider: 'google' });
      const tokens = await AuthService.issueTokensForUser(user);

      const payload = {
        access_token: tokens.accessToken,
        access_expires_in: tokens.accessExpiresIn,
        refresh_token: tokens.refreshToken,
        refresh_expires_in: tokens.refreshExpiresIn,
        user: { id: user.id, email: user.email, role: user.role },
      };
      const appUrl = process.env.APP_BASE_URL || 'http://localhost:5173';
      const origin = new URL(appUrl).origin;
      res.setHeader('Content-Type', 'text/html');
      return res.send(`<!doctype html><html><body><script>
        (function(){
          try{
            var data = ${JSON.stringify(payload)};
            if (window.opener) {
              window.opener.postMessage({ type: 'oauth_success', data: data }, '${origin}');
              window.close();
            } else {
              document.body.innerText = 'Login successful. You can close this window.';
            }
          }catch(e){ document.body.innerText = 'OAuth completed'; }
        })();
      </script></body></html>`);
    } catch (err) {
      console.error('Google OAuth callback error', err);
      return res.status(500).json({ error: 'Google OAuth failed' });
    }
  },

  // GET /auth/oauth/facebook/url
  async facebookAuthUrl(req, res) {
    try {
      const url = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${encodeURIComponent(FACEBOOK_APP_ID)}&redirect_uri=${encodeURIComponent(FACEBOOK_REDIRECT_URI)}&scope=email,public_profile&response_type=code`;
      return res.json({ url });
    } catch (err) {
      console.error('Facebook auth url error', err);
      return res.status(500).json({ error: 'Failed to init Facebook OAuth' });
    }
  },

  // GET /auth/oauth/facebook/callback
  async facebookCallback(req, res) {
    try {
      const { code } = req.query;
      if (!code) return res.status(400).json({ error: 'Missing code' });

      const tokenResp = await axios.get('https://graph.facebook.com/v12.0/oauth/access_token', {
        params: {
          client_id: FACEBOOK_APP_ID,
          client_secret: FACEBOOK_APP_SECRET,
          redirect_uri: FACEBOOK_REDIRECT_URI,
          code,
        },
      });

      const accessToken = tokenResp.data.access_token;
      const profileResp = await axios.get('https://graph.facebook.com/me', {
        params: { fields: 'id,name,email,first_name,last_name', access_token: accessToken },
      });
      const p = profileResp.data || {};
      const email = String(p.email || '').toLowerCase();
      const firstName = (p.first_name || (p.name ? String(p.name).split(' ')[0] : '')).toString();
      const lastName = (p.last_name || (p.name ? String(p.name).split(' ').slice(1).join(' ') : '')).toString();

      const user = await AuthService.getOrCreateOAuthUser({ email, firstName, lastName, provider: 'facebook' });
      const tokens = await AuthService.issueTokensForUser(user);

      const payload = {
        access_token: tokens.accessToken,
        access_expires_in: tokens.accessExpiresIn,
        refresh_token: tokens.refreshToken,
        refresh_expires_in: tokens.refreshExpiresIn,
        user: { id: user.id, email: user.email, role: user.role },
      };
      const appUrl = process.env.APP_BASE_URL || 'http://localhost:5173';
      const origin = new URL(appUrl).origin;
      res.setHeader('Content-Type', 'text/html');
      return res.send(`<!doctype html><html><body><script>
        (function(){
          try{
            var data = ${JSON.stringify(payload)};
            if (window.opener) {
              window.opener.postMessage({ type: 'oauth_success', data: data }, '${origin}');
              window.close();
            } else {
              document.body.innerText = 'Login successful. You can close this window.';
            }
          }catch(e){ document.body.innerText = 'OAuth completed'; }
        })();
      </script></body></html>`);
    } catch (err) {
      console.error('Facebook OAuth callback error', err);
      return res.status(500).json({ error: 'Facebook OAuth failed' });
    }
  },
};


