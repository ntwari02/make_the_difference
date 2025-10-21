const express = require('express');
const { authenticate, authorizeRoles } = require('../middlewares/auth');
const sellerService = require('../services/seller.service');
const sellerController = require('../controllers/seller.controller');
const messagingController = require('../controllers/messaging.controller');

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

// GET /api/seller/settings - seller settings
router.get('/settings', authenticate, authorizeRoles('seller','admin'), async (req, res) => {
  try {
    const settings = await sellerService.getSellerSettings(req.user.id);
    return res.json({ success: true, data: settings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/seller/settings - upsert seller settings
router.put('/settings', authenticate, authorizeRoles('seller','admin'), async (req, res) => {
  try {
    const updated = await sellerService.upsertSellerSettings(req.user.id, req.body || {});
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/seller/account - delete seller account
router.delete('/account', authenticate, authorizeRoles('seller','admin'), async (req, res) => {
  try {
    console.log(`Delete account request for user: ${req.user.id}`);
    await sellerService.deleteSellerAccount(req.user.id);
    console.log('Delete account completed, sending response');
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account route error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// Seller Reviews Routes
// GET /api/seller/reviews/:sellerId - Get seller reviews (public)
router.get('/reviews/:sellerId', sellerController.getSellerReviews);

// POST /api/seller/reviews/:sellerId - Create seller review (authenticated)
router.post('/reviews/:sellerId', authenticate, sellerController.createSellerReview);

// POST /api/seller/reviews/:reviewId/reply - Reply to review (seller only)
router.post('/reviews/:reviewId/reply', authenticate, authorizeRoles('seller','admin'), sellerController.replyToSellerReview);

// POST /api/seller/reviews/:reviewId/helpful - Mark review as helpful (authenticated)
router.post('/reviews/:reviewId/helpful', authenticate, sellerController.markReviewHelpful);

// =====================================================
// SELLER MESSAGING ROUTES
// =====================================================

// GET /api/seller/messages/conversations/:sellerId - Get seller's conversations
router.get('/messages/conversations/:sellerId', authenticate, authorizeRoles('seller','admin'), messagingController.getSellerConversations);

// GET /api/seller/messages/conversations/:conversationId/messages - Get messages in conversation
router.get('/messages/conversations/:conversationId/messages', authenticate, authorizeRoles('seller','admin'), messagingController.getConversationMessages);

// POST /api/seller/messages/conversations/:conversationId/messages - Send message
router.post('/messages/conversations/:conversationId/messages', authenticate, authorizeRoles('seller','admin'), messagingController.sendMessage);

// POST /api/seller/messages/conversations - Create new conversation
router.post('/messages/conversations', authenticate, authorizeRoles('seller','admin'), messagingController.createConversation);

// PUT /api/seller/messages/conversations/:conversationId/read - Mark conversation as read
router.put('/messages/conversations/:conversationId/read', authenticate, authorizeRoles('seller','admin'), messagingController.markConversationAsRead);

// PUT /api/seller/messages/conversations/:conversationId/archive - Archive/unarchive conversation
router.put('/messages/conversations/:conversationId/archive', authenticate, authorizeRoles('seller','admin'), messagingController.archiveConversation);

// DELETE /api/seller/messages/conversations/:conversationId - Delete conversation
router.delete('/messages/conversations/:conversationId', authenticate, authorizeRoles('seller','admin'), messagingController.deleteConversation);

// GET /api/seller/messages/stats/:sellerId - Get seller message statistics
router.get('/messages/stats/:sellerId', authenticate, authorizeRoles('seller','admin'), messagingController.getSellerMessageStats);

// POST /api/seller/messages/bulk-action - Bulk operations on conversations
router.post('/messages/bulk-action', authenticate, authorizeRoles('seller','admin'), messagingController.bulkConversationAction);

// (Removed testing/debug routes for production)

// Test endpoint to verify backend is working
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Seller routes are working' });
});

module.exports = router;


