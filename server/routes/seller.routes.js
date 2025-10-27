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

module.exports = router;


