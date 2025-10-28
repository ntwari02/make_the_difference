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

module.exports = router;


