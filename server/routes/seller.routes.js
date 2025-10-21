const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { authenticate, authorizeRoles } = require('../middlewares/auth');
const sellerService = require('../services/seller.service');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Helper function to process and save images
const processAndSaveImages = async (files, sellerId) => {
  const uploadsDir = path.join(__dirname, '../uploads/seller-profiles');
  const sellerDir = path.join(uploadsDir, sellerId);
  
  // Ensure directories exist
  await fs.mkdir(sellerDir, { recursive: true });
  
  const savedImages = [];
  
  for (const file of files) {
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filepath = path.join(sellerDir, filename);
    const webpFilename = filename.replace(/\.[^/.]+$/, '.webp');
    const webpFilepath = path.join(sellerDir, webpFilename);
    
    try {
      // Process image with Sharp
      await sharp(file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(webpFilepath);
      
      // Create thumbnail
      const thumbFilename = `thumb-${webpFilename}`;
      const thumbFilepath = path.join(sellerDir, thumbFilename);
      
      await sharp(file.buffer)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 70 })
        .toFile(thumbFilepath);
      
      savedImages.push(`/uploads/seller-profiles/${sellerId}/${webpFilename}`);
    } catch (error) {
      console.error(`Failed to process image ${file.originalname}:`, error);
      // Continue with other images even if one fails
    }
  }
  
  return savedImages;
};

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

// POST /api/seller/profile/photos - upload seller profile photos
router.post('/profile/photos', authenticate, authorizeRoles('seller','admin'), upload.array('images', 10), async (req, res) => {
  try {
    console.log('Seller photo upload - User:', req.user);
    console.log('Seller photo upload - Files:', req.files?.length || 0);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images provided' });
    }

    const sellerId = req.user.id;
    const savedImages = await processAndSaveImages(req.files, sellerId);
    
    if (savedImages.length === 0) {
      return res.status(500).json({ success: false, message: 'Failed to process any images' });
    }

    // Update seller profile with new images
    const profile = await sellerService.getSellerProfile(sellerId);
    const existingImages = profile?.images || [];
    const allImages = [...existingImages, ...savedImages];
    
    await sellerService.upsertSellerProfile(sellerId, { images: allImages });

    res.json({
      success: true,
      message: `Successfully uploaded ${savedImages.length} image(s)`,
      data: {
        images: savedImages,
        all_images: allImages
      }
    });
  } catch (err) {
    console.error('Photo upload error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/seller/profile/photos - delete seller profile photos
router.delete('/profile/photos', authenticate, authorizeRoles('seller','admin'), async (req, res) => {
  try {
    const { imageUrls } = req.body;
    
    if (!imageUrls || !Array.isArray(imageUrls)) {
      return res.status(400).json({ success: false, message: 'imageUrls array is required' });
    }

    const sellerId = req.user.id;
    
    // Get current profile
    const profile = await sellerService.getSellerProfile(sellerId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const existingImages = profile.images || [];
    const remainingImages = existingImages.filter(img => !imageUrls.includes(img));
    
    // Delete files from filesystem
    for (const imageUrl of imageUrls) {
      try {
        const filename = path.basename(imageUrl);
        const filepath = path.join(__dirname, '../uploads/seller-profiles', sellerId, filename);
        await fs.unlink(filepath);
        
        // Also delete thumbnail
        const thumbFilepath = path.join(__dirname, '../uploads/seller-profiles', sellerId, `thumb-${filename}`);
        try {
          await fs.unlink(thumbFilepath);
        } catch (thumbErr) {
          // Thumbnail might not exist, ignore error
        }
      } catch (fileErr) {
        console.error(`Failed to delete file ${imageUrl}:`, fileErr);
        // Continue with other files
      }
    }
    
    // Update profile with remaining images
    await sellerService.upsertSellerProfile(sellerId, { images: remainingImages });

    res.json({
      success: true,
      message: `Successfully deleted ${imageUrls.length} image(s)`,
      data: {
        deleted_images: imageUrls,
        remaining_images: remainingImages
      }
    });
  } catch (err) {
    console.error('Photo deletion error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;


