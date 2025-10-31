const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { authenticate, authorizeRoles } = require('../middlewares/auth');
const EventEmitter = require('events');
// Simple process-wide event bus (singleton)
if (!global.__SELLER_MSG_BUS__) {
  global.__SELLER_MSG_BUS__ = new EventEmitter();
}
const msgBus = global.__SELLER_MSG_BUS__;
const sellerService = require('../services/seller.service');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});


// GET /api/seller/profile - seller business profile
router.get('/profile', authenticate, authorizeRoles('seller','admin'), async (req, res) => {
  try {
    let profile;
    try {
      profile = await sellerService.getSellerProfile(req.user.id);
    } catch (getProfileErr) {
      // If getProfile fails with JSON error, it means seller exists but has bad data
      // The getSellerProfile function should have fixed it, but if it still fails,
      // try to fix the data directly and retry
      if (getProfileErr.code === 'ER_INVALID_JSON_TEXT' || getProfileErr.errno === 3140) {
        console.warn('Profile fetch failed with JSON error, attempting to fix data and retry...');
        // Fix the data
        try {
          await require('../config/database').executeQuery(`
            UPDATE sellers 
            SET images = NULL, business_hours = NULL, services = NULL 
            WHERE user_id = ?
          `, [req.user.id]);
          // Retry getting profile
          profile = await sellerService.getSellerProfile(req.user.id);
        } catch (fixErr) {
          console.error('Failed to fix and retry:', fixErr.message);
          // If still fails, return null so we create a new profile
          profile = null;
        }
      } else {
        // For other errors, re-throw
        throw getProfileErr;
      }
    }
    
    if (!profile) {
      // Create a default seller profile on first access
      profile = await sellerService.upsertSellerProfile(req.user.id, {});
    }
    return res.json({ success: true, data: profile });
  } catch (err) {
    console.error('Route /seller/profile error:', {
      code: err.code,
      errno: err.errno,
      message: err.message,
      stack: err.stack?.substring(0, 500)
    });
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

// PUT /api/seller/profile - upsert seller business profile
router.put('/profile', authenticate, authorizeRoles('seller','admin'), async (req, res) => {
  try {
    // Filter out fields not in the client form to avoid validation errors
    const allowedFields = [
      'business_name', 'business_type', 'description', 'address', 'city',
      'state', 'country', 'postal_code', 'phone', 'email', 'website',
      'logo', 'images', 'business_hours', 'services'
    ];
    
    const filteredData = {};
    Object.keys(req.body || {}).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = req.body[key];
      }
    });
    
    const updated = await sellerService.upsertSellerProfile(req.user.id, filteredData);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/seller/profile/images - Upload profile images
router.post('/profile/images', authenticate, authorizeRoles('seller', 'admin'), upload.array('images', 10), async (req, res) => {
  try {
    const userId = req.user.id;
    const files = req.files || [];
    
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    // Validate file types
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const invalidFiles = files.filter(file => !allowedMimeTypes.includes(file.mimetype));
    if (invalidFiles.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid file types. Only images are allowed. Invalid files: ${invalidFiles.map(f => f.originalname).join(', ')}` 
      });
    }

    // Get seller ID
    const profile = await sellerService.getSellerProfile(userId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Seller profile not found' });
    }

    const uploadsRoot = path.join(__dirname, '..', 'uploads');
    const sellerDir = path.join(uploadsRoot, 'sellers', userId);
    
    // Ensure directory exists
    await fs.mkdir(sellerDir, { recursive: true });

    const publicUrls = [];
    const errors = [];
    
    for (const file of files) {
      try {
        const timestamp = Date.now();
        const baseName = (file.originalname || 'image')
          .toLowerCase()
          .replace(/[^a-z0-9\.\-_]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$|\.+$/g, '');
        const filename = `${timestamp}-${baseName || 'image'}`.replace(/\.+$/, '') + '.webp';
        const outPath = path.join(sellerDir, filename);

        // Optimize and convert to webp
        await sharp(file.buffer)
          .rotate()
          .resize({ width: 1600, withoutEnlargement: true })
          .webp({ quality: 80, effort: 6 })
          .toFile(outPath);

        // Create thumbnail
        const thumbnailFilename = `thumb-${filename}`;
        const thumbnailPath = path.join(sellerDir, thumbnailFilename);
        await sharp(file.buffer)
          .rotate()
          .resize({ width: 300, withoutEnlargement: true })
          .webp({ quality: 70, effort: 6 })
          .toFile(thumbnailPath);

        const publicUrl = `/uploads/sellers/${userId}/${filename}`;
        publicUrls.push(publicUrl);
      } catch (fileError) {
        console.error(`Failed to process file ${file.originalname}:`, fileError);
        errors.push(`Failed to process ${file.originalname}: ${fileError.message}`);
      }
    }

    if (publicUrls.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files were successfully processed', 
        errors: errors 
      });
    }

    // Update seller profile with new images
    const existingImages = profile.images || [];
    const updatedImages = [...existingImages, ...publicUrls];

    await sellerService.upsertSellerProfile(userId, { images: updatedImages });

    return res.status(201).json({ 
      success: true, 
      message: `Successfully uploaded ${publicUrls.length} image(s)`, 
      data: { 
        images: publicUrls, 
        all_images: updatedImages,
        errors: errors.length > 0 ? errors : undefined
      } 
    });
  } catch (error) {
    console.error('Profile image upload failed:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to upload images' });
  }
});

// DELETE /api/seller/profile/images - Delete profile images
router.delete('/profile/images', authenticate, authorizeRoles('seller', 'admin'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { imageUrls } = req.body;
    
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({ success: false, message: 'No image URLs provided' });
    }

    // Get current profile
    const profile = await sellerService.getSellerProfile(userId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Seller profile not found' });
    }

    // Get current images
    const existingImages = profile.images || [];
    const imagesToRemove = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
    
    // Filter out the images to be removed
    const updatedImages = existingImages.filter(img => !imagesToRemove.includes(img));

    // Delete files from disk
    const uploadsRoot = path.join(__dirname, '..', 'uploads');
    for (const imageUrl of imagesToRemove) {
      try {
        // Extract relative path from URL
        const relativePath = imageUrl.replace('/uploads/', '');
        const filePath = path.join(uploadsRoot, relativePath);
        
        // Check if file exists and delete it
        try {
          await fs.access(filePath);
          await fs.unlink(filePath);
          console.log('Deleted file:', filePath);
        } catch {
          console.log('File not found:', filePath);
        }

        // Try to delete thumbnail too
        const thumbPath = path.join(path.dirname(filePath), 'thumb-' + path.basename(filePath));
        try {
          await fs.unlink(thumbPath);
          console.log('Deleted thumbnail:', thumbPath);
        } catch {
          // Thumbnail might not exist, ignore
        }
      } catch (deleteError) {
        console.error('Error deleting file:', imageUrl, deleteError);
      }
    }

    // Update profile with remaining images
    await sellerService.upsertSellerProfile(userId, { images: updatedImages });

    return res.json({ 
      success: true, 
      message: `Successfully deleted ${imagesToRemove.length} image(s)`, 
      data: { images: updatedImages } 
    });
  } catch (error) {
    console.error('Delete image failed:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to delete images' });
  }
});

// Proxy route for spare parts image uploads
// This routes requests from /api/seller/spare-parts/:id/images to /api/spare-parts/:id/images
router.post('/spare-parts/:id/images', authenticate, authorizeRoles('seller', 'admin'), upload.array('images', 10), async (req, res, next) => {
  try {
    console.log('Spare parts image upload via seller route - Part ID:', req.params.id);
    
    const sparePartId = req.params.id;
    const files = req.files || [];
    
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    // Validate file types
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const invalidFiles = files.filter(file => !allowedMimeTypes.includes(file.mimetype));
    if (invalidFiles.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid file types. Only images are allowed. Invalid files: ${invalidFiles.map(f => f.originalname).join(', ')}` 
      });
    }

    // Import spare parts service
    const sparePartsService = require('../ecommerce/services/spare-parts.service');
    
    // Check ownership
    if (req.user.role !== 'admin') {
      const part = await sparePartsService.getSparePartById(sparePartId);
      if (!part || part.seller_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not allowed to upload images for this spare part' });
      }
    }

    const uploadsRoot = path.join(__dirname, '..', 'uploads');
    const partDir = path.join(uploadsRoot, 'spare-parts', sparePartId);
    
    // Ensure directory exists
    await fs.mkdir(partDir, { recursive: true });

    const publicUrls = [];
    const errors = [];
    
    for (const file of files) {
      try {
        const timestamp = Date.now();
        const baseName = (file.originalname || 'image')
          .toLowerCase()
          .replace(/[^a-z0-9\.\-_]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$|\.+$/g, '');
        const filename = `${timestamp}-${baseName || 'image'}`.replace(/\.+$/, '') + '.webp';
        const outPath = path.join(partDir, filename);

        // Optimize and convert to webp
        await sharp(file.buffer)
          .rotate()
          .resize({ width: 1600, withoutEnlargement: true })
          .webp({ quality: 80, effort: 6 })
          .toFile(outPath);

        // Create thumbnail
        const thumbnailFilename = `thumb-${filename}`;
        const thumbnailPath = path.join(partDir, thumbnailFilename);
        await sharp(file.buffer)
          .rotate()
          .resize({ width: 300, withoutEnlargement: true })
          .webp({ quality: 70, effort: 6 })
          .toFile(thumbnailPath);

        const publicUrl = `/uploads/spare-parts/${sparePartId}/${filename}`;
        publicUrls.push(publicUrl);
      } catch (fileError) {
        console.error(`Failed to process file ${file.originalname}:`, fileError);
        errors.push(`Failed to process ${file.originalname}: ${fileError.message}`);
      }
    }

    if (publicUrls.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files were successfully processed', 
        errors: errors 
      });
    }

    // Update part with new images
    const part = await sparePartsService.getSparePartById(sparePartId);
    const existingImages = Array.isArray(part.images)
      ? part.images
      : (typeof part.images === 'string' ? (JSON.parse(part.images || '[]') || []) : []); 
    const updatedImages = [...existingImages, ...publicUrls];

    await sparePartsService.updateSparePart(sparePartId, { images: updatedImages });

    return res.status(201).json({ 
      success: true, 
      message: `Successfully uploaded ${publicUrls.length} image(s)`, 
      data: { 
        images: publicUrls, 
        all_images: updatedImages,
        errors: errors.length > 0 ? errors : undefined
      } 
    });
  } catch (error) {
    console.error('Spare parts image upload failed:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to upload images' });
  }
});

// GET /api/seller/settings - fetch seller settings (notifications, privacy, preferences)
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
    const { notifications, privacy, preferences } = req.body || {};
    const updated = await sellerService.upsertSellerSettings(req.user.id, { notifications, privacy, preferences });
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/seller/account - Delete seller account and all associated data
router.delete('/account', authenticate, authorizeRoles('seller','admin'), async (req, res) => {
  try {
    const userId = req.user.id;
    const success = await sellerService.deleteSellerAccount(userId);
    if (success) {
      return res.json({ success: true, message: 'Account deleted successfully' });
    } else {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }
  } catch (err) {
    console.error('Delete account error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to delete account' });
  }
});

// GET /api/seller/reviews - Get all reviews for seller's cars
router.get('/reviews', authenticate, authorizeRoles('seller','admin'), async (req, res) => {
  try {
    const filters = {
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      rating: req.query.rating || 'all',
      search: req.query.search || '',
      sortBy: req.query.sortBy || 'newest'
    };
    const result = await sellerService.getSellerReviews(req.user.id, filters);
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Get seller reviews error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to get reviews' });
  }
});

// POST /api/seller/reviews/:reviewId/reply - Reply to a review
router.post('/reviews/:reviewId/reply', authenticate, authorizeRoles('seller','admin'), async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reply } = req.body || {};
    
    if (!reply || !String(reply).trim()) {
      return res.status(400).json({ success: false, message: 'Reply text is required' });
    }

    const updated = await sellerService.replyToReview(req.user.id, reviewId, reply);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Review not found or unauthorized' });
    }
    
    return res.json({ success: true, data: updated, message: 'Reply posted successfully' });
  } catch (err) {
    console.error('Reply to review error:', err);
    return res.status(400).json({ success: false, message: err.message || 'Failed to post reply' });
  }
});

// ==================== SELLER MESSAGES ROUTES ====================

// POST /api/seller/messages - Start a new conversation and send first message
router.post('/messages', authenticate, authorizeRoles('seller','admin'), async (req, res) => {
  try {
    const { to, subject, content } = req.body || {};
    if (!to || !content) {
      return res.status(400).json({ success: false, message: 'Recipient and content are required' });
    }
    const result = await sellerService.startConversation(req.user.id, { to, subject, content });
    const msg = result.existed ? 'Conversation already exists' : 'Conversation started';
    return res.json({ success: true, data: result, message: msg });
  } catch (err) {
    console.error('Start conversation error:', err);
    return res.status(400).json({ success: false, message: err.message || 'Failed to start conversation' });
  }
});

// GET /api/seller/messages - Get conversations list (inbox, sent, archived)
router.get('/messages', authenticate, authorizeRoles('seller','admin'), async (req, res) => {
  try {
    const filters = {
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      folder: req.query.folder || 'inbox', // inbox, sent, archived
      search: req.query.search || '',
      category: req.query.category || 'all'
    };
    const result = await sellerService.getSellerConversations(req.user.id, filters);
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Get seller conversations error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to get conversations' });
  }
});

// Server-Sent Events stream for live seller message updates
router.get('/messages/stream', async (req, res, next) => {
  try {
    // Allow auth via header or token query param for EventSource
    if (!req.headers.authorization && req.query.token) {
      req.headers.authorization = `Bearer ${req.query.token}`;
    }
    // Reuse existing middleware stack
    authenticate(req, res, async (err) => {
      if (err) return;
      authorizeRoles('seller','admin')(req, res, () => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders && res.flushHeaders();

        const userId = req.user.id;
        const send = (event, data) => {
          res.write(`event: ${event}\n`);
          res.write(`data: ${JSON.stringify(data)}\n\n`);
        };

        const onEvent = (payload) => {
          // Only forward events targeted to this seller user
          if (!payload || (payload.userId && payload.userId !== userId)) return;
          send(payload.event || 'update', payload);
        };

        msgBus.on('seller.messages', onEvent);

        // Heartbeat to keep connection alive
        const hb = setInterval(() => send('ping', { t: Date.now() }), 25000);

        req.on('close', () => {
          clearInterval(hb);
          msgBus.off('seller.messages', onEvent);
          try { res.end(); } catch {}
        });
      });
    });
  } catch (e) {
    console.error('SSE stream error', e);
    res.status(500).end();
  }
});

// GET /api/seller/messages/:conversationId - Get messages in a conversation (thread)
router.get('/messages/:conversationId', authenticate, authorizeRoles('seller','admin'), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const result = await sellerService.getConversationMessages(req.user.id, conversationId);
    
    // Auto-mark messages as read when viewing conversation
    await sellerService.markMessagesAsRead(req.user.id, conversationId);
    
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Get conversation messages error:', err);
    return res.status(400).json({ success: false, message: err.message || 'Failed to get messages' });
  }
});

// POST /api/seller/messages/:conversationId - Send a message (reply)
router.post('/messages/:conversationId', authenticate, authorizeRoles('seller','admin'), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, messageType, fileUrl, category, priority } = req.body || {};
    
    if (!content || !String(content).trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const message = await sellerService.sendMessage(req.user.id, conversationId, content, {
      messageType,
      fileUrl,
      category,
      priority
    });
    
    return res.json({ success: true, data: message, message: 'Message sent successfully' });
  } catch (err) {
    console.error('Send message error:', err);
    return res.status(400).json({ success: false, message: err.message || 'Failed to send message' });
  }
});

// PATCH /api/seller/messages/:conversationId/read - Mark messages as read
router.patch('/messages/:conversationId/read', authenticate, authorizeRoles('seller','admin'), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { messageIds } = req.body || {}; // Optional: specific message IDs to mark as read
    
    await sellerService.markMessagesAsRead(req.user.id, conversationId, messageIds);
    return res.json({ success: true, message: 'Messages marked as read' });
  } catch (err) {
    console.error('Mark messages as read error:', err);
    return res.status(400).json({ success: false, message: err.message || 'Failed to mark messages as read' });
  }
});

// PATCH /api/seller/messages/:conversationId/archive - Archive/unarchive conversation
router.patch('/messages/:conversationId/archive', authenticate, authorizeRoles('seller','admin'), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { archived = true } = req.body || {};
    
    await sellerService.archiveConversation(req.user.id, conversationId, archived);
    return res.json({ success: true, message: archived ? 'Conversation archived' : 'Conversation unarchived' });
  } catch (err) {
    console.error('Archive conversation error:', err);
    return res.status(400).json({ success: false, message: err.message || 'Failed to archive conversation' });
  }
});

// DELETE (leave) a conversation for this seller; if no participants remain, fully delete
router.delete('/messages/:conversationId', authenticate, authorizeRoles('seller','admin'), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const result = await sellerService.deleteConversationForSeller(req.user.id, conversationId);
    return res.json({ success: true, data: result, message: 'Conversation removed' });
  } catch (err) {
    console.error('Delete conversation error:', err);
    return res.status(400).json({ success: false, message: err.message || 'Failed to delete conversation' });
  }
});

// DELETE /api/seller/messages/:conversationId - Delete messages
router.delete('/messages/:conversationId', authenticate, authorizeRoles('seller','admin'), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { messageIds } = req.body || {};
    
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Message IDs are required' });
    }
    
    await sellerService.deleteMessages(req.user.id, conversationId, messageIds);
    return res.json({ success: true, message: 'Messages deleted successfully' });
  } catch (err) {
    console.error('Delete messages error:', err);
    return res.status(400).json({ success: false, message: err.message || 'Failed to delete messages' });
  }
});

// DELETE /api/seller/messages/:conversationId/messages/:messageId - Delete a single message
router.delete('/messages/:conversationId/messages/:messageId', authenticate, authorizeRoles('seller','admin'), async (req, res) => {
  try {
    const { conversationId, messageId } = req.params;
    await sellerService.deleteMessages(req.user.id, conversationId, [messageId]);
    return res.json({ success: true, message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Delete single message error:', err);
    return res.status(400).json({ success: false, message: err.message || 'Failed to delete message' });
  }
});

// POST /api/seller/messages/:conversationId/messages/delete - Bulk delete messages
router.post('/messages/:conversationId/messages/delete', authenticate, authorizeRoles('seller','admin'), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { messageIds } = req.body || {};
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Message IDs are required' });
    }
    await sellerService.deleteMessages(req.user.id, conversationId, messageIds);
    return res.json({ success: true, message: 'Messages deleted successfully' });
  } catch (err) {
    console.error('Bulk delete messages error:', err);
    return res.status(400).json({ success: false, message: err.message || 'Failed to delete messages' });
  }
});

// POST /api/seller/messages/:conversationId/messages/bulk-delete - Alternate bulk delete path
router.post('/messages/:conversationId/messages/bulk-delete', authenticate, authorizeRoles('seller','admin'), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { messageIds } = req.body || {};
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Message IDs are required' });
    }
    await sellerService.deleteMessages(req.user.id, conversationId, messageIds);
    return res.json({ success: true, message: 'Messages deleted successfully' });
  } catch (err) {
    console.error('Bulk delete messages (alt) error:', err);
    return res.status(400).json({ success: false, message: err.message || 'Failed to delete messages' });
  }
});

// ==================== SELLER ANALYTICS ROUTES ====================

// GET /api/seller/analytics - Get seller analytics data
router.get('/analytics', authenticate, authorizeRoles('seller','admin'), async (req, res) => {
  try {
    const filters = {
      period: req.query.period || '12m', // 12m, 6m, 3m
      start_date: req.query.start_date || null,
      end_date: req.query.end_date || null
    };
    
    // Debug logging
    console.log('Analytics request filters:', filters);
    
    const analytics = await sellerService.getSellerAnalytics(req.user.id, filters);
    console.log('Analytics response includes conversion_rate:', 'conversion_rate' in analytics);
    console.log('Analytics response keys:', Object.keys(analytics));
    return res.json({ success: true, data: analytics });
  } catch (err) {
    console.error('Get seller analytics error:', err);
    console.error('Error stack:', err.stack);
    return res.status(500).json({ success: false, message: err.message || 'Failed to get analytics' });
  }
});

module.exports = router;


