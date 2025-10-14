const axios = require('axios');

async function verifyRecaptcha(req, res, next) {
  try {
    // In development, skip reCAPTCHA verification entirely for easier testing
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Skipping reCAPTCHA verification');
      return next();
    }

    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
      console.log('⚠️ RECAPTCHA_SECRET_KEY not set, skipping verification');
      return next();
    }

    const token = req.body?.recaptcha_token;
    console.log('🔍 reCAPTCHA token received:', token ? `${token.substring(0, 20)}...` : 'MISSING');
    
    if (!token) {
      console.log('❌ No reCAPTCHA token provided');
      return res.status(400).json({ error: 'Missing recaptcha_token' });
    }

    console.log('🔄 Verifying reCAPTCHA token with Google...');
    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret,
        response: token,
        remoteip: req.ip,
      },
      timeout: 4000, // Increased to 4 seconds
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
      return res.status(400).json({ 
        error: 'reCAPTCHA verification failed',
        details: response.data?.['error-codes'] || ['unknown-error']
      });
    }

    console.log('✅ reCAPTCHA verification successful');
    return next();
  } catch (err) {
    console.error('💥 reCAPTCHA verification error:', err.message);
    
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      return res.status(408).json({ error: 'reCAPTCHA verification timeout' });
    }
    
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'reCAPTCHA service unavailable' });
    }
    
    return res.status(500).json({ error: 'reCAPTCHA verification error' });
  }
}

module.exports = { verifyRecaptcha };


