const express = require('express');
const { authenticate, authorizeRoles } = require('../middlewares/auth');
const sellerService = require('../services/seller.service');

const router = express.Router();

// GET /api/seller/profile - seller business profile
router.get('/profile', authenticate, authorizeRoles('seller','admin'), async (req, res) => {
  try {
    let profile = await sellerService.getSellerProfile(req.user.id);
    if (!profile) {
      // Create a default seller profile on first access
      profile = await sellerService.upsertSellerProfile(req.user.id, {});
    }
    return res.json({ success: true, data: profile });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/seller/profile - upsert seller business profile
router.put('/profile', authenticate, authorizeRoles('seller','admin'), async (req, res) => {
  try {
    const updated = await sellerService.upsertSellerProfile(req.user.id, req.body || {});
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;


