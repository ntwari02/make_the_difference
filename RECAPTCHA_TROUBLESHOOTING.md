# reCAPTCHA Troubleshooting Guide

## 🚨 "Missing recaptcha_token" Error Solutions

This guide provides comprehensive solutions for reCAPTCHA token issues in production.

## 🔍 Quick Diagnosis

### Step 1: Check Browser Console
Open browser developer tools (F12) and look for:
- `🔧 reCAPTCHA component initialized`
- `📜 reCAPTCHA script loaded successfully`
- `✅ reCAPTCHA token generated successfully`
- Any error messages with ❌

### Step 2: Manual Testing
Run this in browser console:
```javascript
// Check if reCAPTCHA is loaded
console.log('grecaptcha available:', !!window.grecaptcha);

// Check site key
console.log('Site key:', 'YOUR_SITE_KEY_HERE');

// Test token generation
if (window.grecaptcha) {
  window.grecaptcha.execute('YOUR_SITE_KEY', { action: 'test' })
    .then(token => console.log('Token:', token))
    .catch(err => console.error('Error:', err));
}
```

## 🛠️ Common Solutions

### Solution 1: Environment Variables Not Set
**Problem**: `VITE_RECAPTCHA_SITE_KEY` or `RECAPTCHA_SECRET_KEY` missing

**Fix**:
1. Go to Render dashboard → Your service → Environment
2. Add these variables:
   ```
   VITE_RECAPTCHA_SITE_KEY=your-site-key-here
   RECAPTCHA_SECRET_KEY=your-secret-key-here
   ```
3. Redeploy the service

### Solution 2: Domain Not Authorized
**Problem**: Domain not added to Google reCAPTCHA console

**Fix**:
1. Go to [Google reCAPTCHA Console](https://www.google.com/recaptcha/admin)
2. Select your site
3. Add domains:
   - `www.reaglex.com`
   - `reaglex.com`
   - `reagle-x.onrender.com` (if using Render subdomain)
4. Save changes

### Solution 3: CORS Issues
**Problem**: Frontend can't communicate with backend

**Fix**:
1. Update Render environment variables:
   ```
   CORS_ORIGINS=https://www.reaglex.com,https://reaglex.com,https://reagle-x.onrender.com,*.onrender.com
   FRONTEND_URL=https://www.reaglex.com
   ```
2. Redeploy the service

### Solution 4: Network/Ad Blocker Issues
**Problem**: Ad blockers or network restrictions blocking reCAPTCHA

**Fix**:
1. Disable ad blockers temporarily
2. Check if corporate firewall blocks Google services
3. Test from different network/device

### Solution 5: Script Loading Failures
**Problem**: reCAPTCHA script fails to load

**Fix**:
1. Check network connectivity to `https://www.google.com/recaptcha/api.js`
2. Verify HTTPS is working
3. Check for CSP (Content Security Policy) restrictions

## 🔧 Advanced Debugging

### Enable Detailed Logging
The enhanced reCAPTCHA component now provides detailed logging:

```javascript
// Check reCAPTCHA status
console.log('reCAPTCHA status:', {
  siteKey: !!ENV.RECAPTCHA_SITE_KEY,
  grecaptcha: !!window.grecaptcha,
  environment: ENV.IS_PRODUCTION ? 'production' : 'development'
});
```

### Manual Retry
If automatic retries fail:
```javascript
// Manual retry
if (window.retryRecaptcha) {
  window.retryRecaptcha();
}
```

### Test Backend Connectivity
```javascript
// Test if backend is reachable
fetch('/api/auth/profile', { method: 'GET' })
  .then(response => console.log('Backend reachable:', response.status))
  .catch(error => console.error('Backend error:', error));
```

## 📋 Complete Environment Variables Checklist

### Required for Production:
```bash
# Server Configuration
NODE_ENV=production
PORT=3001

# CORS Configuration
CORS_ORIGINS=https://www.reaglex.com,https://reaglex.com,https://reagle-x.onrender.com,*.onrender.com
FRONTEND_URL=https://www.reaglex.com
RENDER_EXTERNAL_URL=https://reagle-x.onrender.com

# reCAPTCHA Configuration
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key

# Database Configuration
DB_HOST=your-database-host
DB_PORT=3306
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

## 🚀 Deployment Steps

### 1. Get reCAPTCHA Keys
1. Go to [Google reCAPTCHA Console](https://www.google.com/recaptcha/admin)
2. Create new site or use existing
3. Choose reCAPTCHA v3
4. Add domains: `www.reaglex.com`, `reaglex.com`
5. Copy Site Key and Secret Key

### 2. Set Environment Variables
In Render dashboard:
1. Go to your backend service
2. Navigate to Environment tab
3. Add all required variables (see checklist above)
4. Save changes

### 3. Redeploy
1. Trigger a new deployment
2. Wait for deployment to complete
3. Test the signup/login functionality

### 4. Verify
1. Open browser console
2. Look for reCAPTCHA success messages
3. Test signup/login
4. Check backend logs for reCAPTCHA verification

## 🆘 Emergency Fallback

If reCAPTCHA continues to fail, you can temporarily disable it:

### Option 1: Development Mode
Set `NODE_ENV=development` in Render environment variables. This will skip reCAPTCHA verification entirely.

### Option 2: Remove reCAPTCHA Middleware
Temporarily comment out the reCAPTCHA middleware in `server/routes/auth.routes.js`:
```javascript
// router.post('/register', verifyRecaptcha, AuthController.register);
router.post('/register', AuthController.register);
```

**⚠️ Warning**: Only use these fallbacks temporarily. Always implement proper reCAPTCHA for production security.

## 📞 Support

If issues persist:
1. Check Render service logs
2. Check browser console errors
3. Verify all environment variables are set
4. Test with the diagnostic tool
5. Contact support with detailed error logs

## 🔄 Testing Checklist

- [ ] Environment variables set correctly
- [ ] Domain added to Google reCAPTCHA console
- [ ] CORS allows frontend domain
- [ ] reCAPTCHA script loads successfully
- [ ] Token generation works
- [ ] Backend verification succeeds
- [ ] Signup/login works end-to-end
