const express = require('express');
const { authenticate, authorizeRoles } = require('../middlewares/auth');
const buyerService = require('../services/buyer.service');

const router = express.Router();

// GET /api/buyer/messages - list conversations
router.get('/messages', authenticate, authorizeRoles('buyer','admin'), async (req, res) => {
  try {
    const data = await buyerService.getBuyerConversations(req.user.id, {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
    });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to get conversations' });
  }
});

// GET /api/buyer/messages/:conversationId - thread
router.get('/messages/:conversationId', authenticate, authorizeRoles('buyer','admin'), async (req, res) => {
  try {
    const thread = await buyerService.getConversationMessages(req.user.id, req.params.conversationId);
    return res.json({ success: true, data: thread });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message || 'Failed to get messages' });
  }
});

// POST /api/buyer/messages/:conversationId - send
router.post('/messages/:conversationId', authenticate, authorizeRoles('buyer','admin'), async (req, res) => {
  try {
    const { content, messageType, fileUrl, category, priority } = req.body || {};
    if (!content || !String(content).trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }
    const msg = await buyerService.sendMessage(req.user.id, req.params.conversationId, content, {
      messageType, fileUrl, category, priority
    });
    return res.json({ success: true, data: msg });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message || 'Failed to send message' });
  }
});

module.exports = router;


