const axios = require('axios');

async function verifyRecaptcha(req, res, next) {
  try {
    console.log('🔍 reCAPTCHA middleware called:', {
      hasToken: !!req.body?.recaptcha_token,
      tokenLength: req.body?.recaptcha_token?.length || 0,
      userAgent: req.get('User-Agent')?.substring(0, 50) || 'unknown',
      origin: req.get('Origin') || 'unknown',
      environment: process.env.NODE_ENV
    });

    // In development, skip reCAPTCHA verification entirely for easier testing
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Skipping reCAPTCHA verification');
      return next();
    }

    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
      console.log('⚠️ RECAPTCHA_SECRET_KEY not set, skipping verification');
      return res.status(400).json({ 
        error: 'reCAPTCHA not configured. Please set RECAPTCHA_SECRET_KEY environment variable.',
        code: 'RECAPTCHA_NOT_CONFIGURED',
        debug: {
          environment: process.env.NODE_ENV,
          hasSecret: false,
          suggestion: 'Set RECAPTCHA_SECRET_KEY in your environment variables'
        }
      });
    }

    const token = req.body?.recaptcha_token;
    console.log('🔍 reCAPTCHA token received:', token ? `${token.substring(0, 20)}...` : 'MISSING');
    
    if (!token) {
      console.log('❌ No reCAPTCHA token provided');
      
      // Provide detailed debugging information
      const debugInfo = {
        environment: process.env.NODE_ENV,
        hasSecret: !!secret,
        frontendDomain: req.get('Origin'),
        userAgent: req.get('User-Agent')?.substring(0, 100),
        possibleCauses: [
          'VITE_RECAPTCHA_SITE_KEY not set in frontend',
          'reCAPTCHA script failed to load',
          'Domain not authorized in Google reCAPTCHA console',
          'CORS issues preventing frontend-backend communication',
          'Network connectivity issues'
        ],
        troubleshooting: [
          'Check browser console for reCAPTCHA errors',
          'Verify VITE_RECAPTCHA_SITE_KEY is set',
          'Check Google reCAPTCHA console domain settings',
          'Test reCAPTCHA manually: window.grecaptcha.execute(siteKey)',
          'Check CORS configuration'
        ]
      };

      return res.status(400).json({ 
        error: 'Missing recaptcha_token. Please ensure reCAPTCHA is properly configured on the frontend.',
        code: 'MISSING_RECAPTCHA_TOKEN',
        debug: debugInfo
      });
    }

    console.log('🔄 Verifying reCAPTCHA token with Google...');
    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret,
        response: token,
        remoteip: req.ip,
      },
      timeout: 5000, // Increased to 5 seconds
    });

    console.log('📊 reCAPTCHA verification response:', {
      success: response.data?.success,
      score: response.data?.score,
      hostname: response.data?.hostname,
      'error-codes': response.data?.['error-codes'],
      'challenge_ts': response.data?.['challenge_ts']
    });

    if (!response.data || !response.data.success) {
      console.error('❌ reCAPTCHA verification failed:', response.data);
      
      const errorDetails = {
        success: response.data?.success,
        errorCodes: response.data?.['error-codes'] || ['unknown-error'],
        hostname: response.data?.hostname,
        score: response.data?.score,
        commonSolutions: {
          'invalid-input-response': 'Token is invalid or expired',
          'invalid-input-secret': 'Secret key is incorrect',
          'timeout-or-duplicate': 'Token was used before or expired',
          'bad-request': 'Request format is invalid'
        }
      };

      return res.status(400).json({ 
        error: 'reCAPTCHA verification failed',
        code: 'RECAPTCHA_VERIFICATION_FAILED',
        details: errorDetails
      });
    }

    console.log('✅ reCAPTCHA verification successful');
    return next();
  } catch (err) {
    console.error('💥 reCAPTCHA verification error:', err.message);
    
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      return res.status(408).json({ 
        error: 'reCAPTCHA verification timeout',
        code: 'RECAPTCHA_TIMEOUT',
        suggestion: 'Please try again. The request took too long to process.'
      });
    }
    
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'reCAPTCHA service unavailable',
        code: 'RECAPTCHA_SERVICE_UNAVAILABLE',
        suggestion: 'Google reCAPTCHA service is currently unavailable. Please try again later.'
      });
    }
    
    return res.status(500).json({ 
      error: 'reCAPTCHA verification error',
      code: 'RECAPTCHA_INTERNAL_ERROR',
      details: err.message
    });
  }
}

module.exports = { verifyRecaptcha };


