const express = require('express');
const { authenticate } = require('../middlewares/auth');
const userService = require('../services/user.service');

const router = express.Router();

// GET /api/user/profile - returns current authenticated user's profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const profile = await userService.getProfileByUserId(req.user.id);
    if (!profile) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, data: profile });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/user/profile - update current user's profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const updated = await userService.updateProfileByUserId(req.user.id, req.body || {});
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;

// Delete my account
router.delete('/account', authenticate, async (req, res) => {
  try {
    const ok = await userService.deleteAccount(req.user.id);
    if (!ok) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});


