# Render Deployment Guide

## Environment Variables Required

Set these environment variables in your Render service dashboard:

### Server Configuration
```
NODE_ENV=production
PORT=3001
```

### CORS Configuration
```
CORS_ORIGINS=https://reagle-x.onrender.com,*.onrender.com
FRONTEND_URL=https://reagle-x.onrender.com
RENDER_EXTERNAL_URL=https://reagle-x.onrender.com
```

### Database Configuration
```
DB_HOST=your-database-host
DB_PORT=3306
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
```

### JWT Configuration
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

### Email Configuration (for notifications)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Payment Configuration
```
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
```

### File Upload Configuration
```
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Security Configuration
```
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### reCAPTCHA Configuration
```
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
```

### AI Services Configuration (optional)
```
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### Monitoring and Logging
```
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
```

## Build Configuration

### Build Command
```bash
cd server && npm install
```

### Start Command
```bash
cd server && npm start
```

## Frontend Environment Variables

The frontend will automatically use `/api` as the base URL in production. If you need to override this, set:

```
VITE_API_BASE_URL=https://your-backend-url.com/api
```

## Troubleshooting

1. **CORS Errors**: Ensure `CORS_ORIGINS`, `FRONTEND_URL`, and `RENDER_EXTERNAL_URL` are set correctly
2. **Network Errors**: Check that the frontend is using the correct API base URL
3. **Database Connection**: Verify database credentials and connection string
4. **File Uploads**: Ensure upload directory exists and has proper permissions
5. **reCAPTCHA Errors**: 
   - Ensure both `RECAPTCHA_SECRET_KEY` and `VITE_RECAPTCHA_SITE_KEY` are set
   - Verify the site key matches your domain in Google reCAPTCHA console
   - Check browser console for reCAPTCHA loading errors
   - In development, reCAPTCHA is automatically disabled
