const axios = require('axios');

async function verifyRecaptcha(req, res, next) {
  try {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
      return next();
    }

    const token = req.body?.recaptcha_token;
    if (!token) {
      return res.status(400).json({ error: 'Missing recaptcha_token' });
    }

    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret,
        response: token,
        remoteip: req.ip,
      },
    });

    if (!response.data || !response.data.success) {
      return res.status(400).json({ error: 'reCAPTCHA verification failed' });
    }

    return next();
  } catch (err) {
    return res.status(500).json({ error: 'reCAPTCHA verification error' });
  }
}

module.exports = { verifyRecaptcha };


