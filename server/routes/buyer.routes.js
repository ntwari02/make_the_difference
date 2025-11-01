const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { authenticate, authorizeRoles } = require('../middlewares/auth');
const buyerService = require('../services/buyer.service');
const userService = require('../services/user.service');

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

// Upload handler for message attachments (supports multiple files)
const uploadMessageAttachments = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB per file
    files: 10, // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    // Allow images and common document types
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`), false);
    }
  },
});

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
    console.error('Buyer messages error:', err);
    console.error('Error stack:', err.stack);
    return res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to get conversations',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
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
    // Allow messages with only attachments (fileUrl) or content
    if ((!content || !String(content).trim()) && !fileUrl) {
      return res.status(400).json({ success: false, message: 'Message content or file attachment is required' });
    }
    const msg = await buyerService.sendMessage(req.user.id, req.params.conversationId, content, {
      messageType, fileUrl, category, priority
    });
    return res.json({ success: true, data: msg });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message || 'Failed to send message' });
  }
});

// DELETE /api/buyer/messages/:conversationId - Delete (leave) a conversation for this buyer
router.delete('/messages/:conversationId', authenticate, authorizeRoles('buyer','admin'), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const result = await buyerService.deleteConversationForBuyer(req.user.id, conversationId);
    return res.json({ success: true, data: result, message: 'Conversation removed' });
  } catch (err) {
    console.error('Delete conversation error:', err);
    return res.status(400).json({ success: false, message: err.message || 'Failed to delete conversation' });
  }
});

// DELETE /api/buyer/profile/images - Delete profile avatar image
router.delete('/profile/images', authenticate, authorizeRoles('buyer','admin'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { imageUrls } = req.body;
    
    // For buyer, we only have one profile image (avatar), so we accept imageUrls array or single imageUrl
    if (!imageUrls && !req.body.imageUrl) {
      return res.status(400).json({ success: false, message: 'No image URL provided' });
    }

    // Get current profile to find the image path
    const profile = await userService.getProfileByUserId(userId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const imagesToRemove = Array.isArray(imageUrls) ? imageUrls : (imageUrls ? [imageUrls] : [req.body.imageUrl]);

    // Delete files from disk
    const uploadsRoot = path.join(__dirname, '..', 'uploads');
    for (const imageUrl of imagesToRemove) {
      try {
        // Extract relative path from URL (handle both /uploads/buyers/... and buyers/...)
        let relativePath = imageUrl;
        if (relativePath.startsWith('/uploads/')) {
          relativePath = relativePath.replace('/uploads/', '');
        } else if (relativePath.startsWith('uploads/')) {
          relativePath = relativePath.replace('uploads/', '');
        }
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

    // Clear profile_image in user table (buyers only have one image)
    await userService.updateProfileByUserId(userId, { profile_image: null });

    return res.json({ 
      success: true, 
      message: 'Profile image deleted successfully',
      data: { profile_image: null }
    });
  } catch (error) {
    console.error('Profile image delete failed:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to delete image' });
  }
});

// POST /api/buyer/messages/:conversationId/attachments - Upload message attachments
router.post('/messages/:conversationId/attachments', authenticate, authorizeRoles('buyer','admin'), uploadMessageAttachments.array('files', 10), async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const files = req.files || [];
    
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    // Verify user has access to this conversation
    const participantCheck = await buyerService.checkParticipant(userId, conversationId);
    if (!participantCheck) {
      return res.status(403).json({ success: false, message: 'Access denied to this conversation' });
    }

    const uploadsRoot = path.join(__dirname, '..', 'uploads');
    const messagesDir = path.join(uploadsRoot, 'messages', conversationId);
    
    // Ensure directory exists
    await fs.mkdir(messagesDir, { recursive: true });

    const uploadedFiles = [];
    
    for (const file of files) {
      try {
        const timestamp = Date.now();
        const baseName = (file.originalname || 'attachment')
          .toLowerCase()
          .replace(/[^a-z0-9\.\-_]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$|\.+$/g, '');
        
        let filename;
        let outPath;
        
        // Process images with sharp, store other files as-is
        if (file.mimetype.startsWith('image/')) {
          filename = `${timestamp}-${baseName || 'image'}`.replace(/\.+$/, '') + '.webp';
          outPath = path.join(messagesDir, filename);
          
          // Optimize and convert images to webp
          await sharp(file.buffer)
            .rotate()
            .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 85, effort: 6 })
            .toFile(outPath);
        } else {
          // For non-image files, keep original extension
          const ext = path.extname(file.originalname) || '.bin';
          filename = `${timestamp}-${baseName || 'file'}${ext}`;
          outPath = path.join(messagesDir, filename);
          
          // Write file as-is
          await fs.writeFile(outPath, file.buffer);
        }
        
        const publicUrl = `/uploads/messages/${conversationId}/${filename}`;
        uploadedFiles.push({
          url: publicUrl,
          originalName: file.originalname,
          size: file.size,
          type: file.mimetype
        });
      } catch (fileError) {
        console.error(`Failed to process ${file.originalname}:`, fileError);
        // Continue with other files
      }
    }

    if (uploadedFiles.length === 0) {
      return res.status(400).json({ success: false, message: 'Failed to process uploaded files' });
    }

    return res.status(201).json({ 
      success: true, 
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`, 
      data: { 
        files: uploadedFiles,
        urls: uploadedFiles.map(f => f.url)
      } 
    });
  } catch (error) {
    console.error('Message attachment upload failed:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to upload attachments' });
  }
});

// POST /api/buyer/profile/images - Upload profile avatar image
router.post('/profile/images', authenticate, authorizeRoles('buyer','admin'), upload.array('images', 1), async (req, res) => {
  try {
    const userId = req.user.id;
    const files = req.files || [];
    
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // For avatar, we only use the first file
    const file = files[0];

    // Validate file types
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid file type. Only images are allowed (JPEG, PNG, WebP, GIF).` 
      });
    }

    const uploadsRoot = path.join(__dirname, '..', 'uploads');
    const buyerDir = path.join(uploadsRoot, 'buyers', userId);
    
    // Ensure directory exists
    await fs.mkdir(buyerDir, { recursive: true });

    // Generate filename
    const timestamp = Date.now();
    const baseName = (file.originalname || 'avatar')
      .toLowerCase()
      .replace(/[^a-z0-9\.\-_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$|\.+$/g, '');
    const filename = `${timestamp}-${baseName || 'avatar'}`.replace(/\.+$/, '') + '.webp';
    const outPath = path.join(buyerDir, filename);

    // Optimize and convert to webp (avatar size: 400x400 max, square)
    await sharp(file.buffer)
      .rotate()
      .resize({ width: 400, height: 400, fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 85, effort: 6 })
      .toFile(outPath);

    // Create thumbnail (150x150)
    const thumbnailFilename = `thumb-${filename}`;
    const thumbnailPath = path.join(buyerDir, thumbnailFilename);
    await sharp(file.buffer)
      .rotate()
      .resize({ width: 150, height: 150, fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 75, effort: 6 })
      .toFile(thumbnailPath);

    const publicUrl = `/uploads/buyers/${userId}/${filename}`;

    // Update user profile_image
    await userService.updateProfileByUserId(userId, { profile_image: publicUrl });

    return res.status(201).json({ 
      success: true, 
      message: 'Profile image uploaded successfully', 
      data: { 
        images: [publicUrl],
        all_images: [publicUrl],
        image: publicUrl,
        thumbnail: `/uploads/buyers/${userId}/${thumbnailFilename}`
      } 
    });
  } catch (error) {
    console.error('Profile image upload failed:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to upload image' });
  }
});

module.exports = router;


