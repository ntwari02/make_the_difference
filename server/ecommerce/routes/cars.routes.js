const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');
const { authenticate, authorizeRoles } = require('../../middlewares/auth');
const ctrl = require('../controllers/cars.controller');
const service = require('../services/cars.service');
const v = require('../validators/cars.validators');

// Import Sharp for image optimization
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.warn('Sharp not available for image optimization');
}

// Configure multer for memory storage (best practice)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const router = express.Router();

const handleValidation = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	return next();
};

// Public routes (no authentication required)
router.get('/', ctrl.listCars);
router.get('/search', ctrl.searchCars);
router.get('/:id', ctrl.getCar);
router.get('/:id/reviews', ctrl.getCarReviews);

// Seller routes (authentication required)
router.post('/', authenticate, authorizeRoles('seller', 'admin'), upload.array('images', 10), v.validateCreateCar, handleValidation, async (req, res) => {
  try {
    const uploadedFiles = req.files || [];
    
    // Store original files for processing after car creation
    req.originalFiles = uploadedFiles;
    
    // Call the original controller
    const originalJson = res.json;
    res.json = async function(data) {
      // After car is created, process images with Sharp
      if (sharp && uploadedFiles.length > 0 && data && data.data && data.data.id) {
        const carId = data.data.id;
        const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');
        const carDir = path.join(uploadsRoot, 'cars', carId);
        fs.mkdirSync(carDir, { recursive: true });

        const processedImagePaths = [];
        
        for (const file of uploadedFiles) {
          try {
            // Derive a safe filename
            const timestamp = Date.now();
            const baseName = (file.originalname || 'image')
              .toLowerCase()
              .replace(/[^a-z0-9\.\-_]+/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$|\.+$/g, '');
            const filename = `${timestamp}-${baseName || 'image'}`.replace(/\.+$/, '') + '.webp';
            const outPath = path.join(carDir, filename);

            // Optimize and convert to webp
            await sharp(file.buffer)
              .rotate()
              .resize({ width: 1600, withoutEnlargement: true })
              .webp({ quality: 80, effort: 6 })
              .toFile(outPath);

            // Create thumbnail
            const thumbnailFilename = `thumb-${filename}`;
            const thumbnailPath = path.join(carDir, thumbnailFilename);
            await sharp(file.buffer)
              .rotate()
              .resize({ width: 300, withoutEnlargement: true })
              .webp({ quality: 70, effort: 6 })
              .toFile(thumbnailPath);

            processedImagePaths.push(`/uploads/cars/${carId}/${filename}`);
          } catch (fileError) {
            console.error(`Failed to process file ${file.originalname}:`, fileError);
          }
        }
        
        // Update the car with processed image paths
        if (processedImagePaths.length > 0) {
          try {
            await service.updateCar(carId, req.user.id, { images: processedImagePaths });
            data.data.images = processedImagePaths;
          } catch (updateError) {
            console.error('Failed to update car with processed images:', updateError);
          }
        }
      }
      
      return originalJson.call(this, data);
    };
    
    await ctrl.createCar(req, res);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});
router.patch('/:id', authenticate, authorizeRoles('seller', 'admin'), v.validateUpdateCar, handleValidation, ctrl.updateCar);
router.patch('/:id/status', authenticate, authorizeRoles('seller', 'admin'), ctrl.updateSellerCarStatus);
router.delete('/:id', authenticate, authorizeRoles('seller', 'admin'), ctrl.deleteCar);
router.get('/seller/my-cars', authenticate, authorizeRoles('seller', 'admin'), ctrl.getMyCars);

// Seller analytics (cars)
router.get('/seller/analytics/stats', authenticate, authorizeRoles('seller', 'admin'), ctrl.getSellerAnalyticsStats);
router.get('/seller/analytics', authenticate, authorizeRoles('seller', 'admin'), ctrl.getSellerAnalyticsSeries);

// Buyer routes (authentication required)
router.post('/:id/favorite', authenticate, authorizeRoles('buyer', 'admin'), ctrl.addToFavorites);
router.delete('/:id/favorite', authenticate, authorizeRoles('buyer', 'admin'), ctrl.removeFromFavorites);
router.get('/buyer/favorites', authenticate, authorizeRoles('buyer', 'admin'), ctrl.getFavorites);
router.post('/:id/review', authenticate, authorizeRoles('buyer', 'admin'), v.validateCreateReview, handleValidation, ctrl.createReview);

// Seller review reply
router.post('/reviews/:reviewId/respond', authenticate, authorizeRoles('seller', 'admin'), v.validateCreateReview, handleValidation, ctrl.respondToReview);

// Admin routes - Full e-commerce management access
router.patch('/:id/status', authenticate, authorizeRoles('admin'), v.validateUpdateStatus, handleValidation, ctrl.updateCarStatus);
router.get('/admin/pending', authenticate, authorizeRoles('admin'), ctrl.getPendingCars);
router.get('/admin/all-cars', authenticate, authorizeRoles('admin'), ctrl.getAllCars);
router.get('/admin/sellers', authenticate, authorizeRoles('admin'), ctrl.getAllSellers);
router.get('/admin/buyers', authenticate, authorizeRoles('admin'), ctrl.getAllBuyers);
router.get('/admin/analytics', authenticate, authorizeRoles('admin'), ctrl.getEcommerceAnalytics);
router.patch('/admin/:id/force-update', authenticate, authorizeRoles('admin'), v.validateUpdateCar, handleValidation, ctrl.forceUpdateCar);
router.delete('/admin/:id/force-delete', authenticate, authorizeRoles('admin'), ctrl.forceDeleteCar);
router.get('/admin/reviews/all', authenticate, authorizeRoles('admin'), ctrl.getAllReviews);
router.patch('/admin/reviews/:reviewId/status', authenticate, authorizeRoles('admin'), ctrl.updateReviewStatus);

// ==================== IMAGE MANAGEMENT ROUTES ====================
// Upload images for a car; saves optimized images to /uploads/cars/:id
if (sharp) {
  router.post('/:id/images', authenticate, authorizeRoles('seller', 'admin'), upload.array('images', 10), async (req, res) => {
    try {
      const carId = req.params.id;
      
      // Validate car ID format
      if (!carId || typeof carId !== 'string') {
        return res.status(400).json({ success: false, message: 'Invalid car ID' });
      }
      
      // Basic ownership check (admin can bypass)
      if (req.user.role !== 'admin') {
        const car = await service.getCarById(carId);
        if (!car || car.seller_id !== req.user.id) {
          return res.status(403).json({ success: false, message: 'Not allowed to upload images for this car' });
        }
      }

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

      const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');
      const carDir = path.join(uploadsRoot, 'cars', carId);
      
      // Ensure directory exists
      fs.mkdirSync(carDir, { recursive: true });

      const publicUrls = [];
      const errors = [];
      
      for (const file of files) {
        try {
          // Derive a safe filename
          const timestamp = Date.now();
          const baseName = (file.originalname || 'image')
            .toLowerCase()
            .replace(/[^a-z0-9\.\-_]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$|\.+$/g, '');
          const filename = `${timestamp}-${baseName || 'image'}`.replace(/\.+$/, '') + '.webp';
          const outPath = path.join(carDir, filename);

          // Optimize and convert to webp (lossy, quality 80) and max width 1600
          await sharp(file.buffer)
            .rotate()
            .resize({ width: 1600, withoutEnlargement: true })
            .webp({ quality: 80, effort: 6 })
            .toFile(outPath);

          // Also create a thumbnail version (300px max width)
          const thumbnailFilename = `thumb-${filename}`;
          const thumbnailPath = path.join(carDir, thumbnailFilename);
          await sharp(file.buffer)
            .rotate()
            .resize({ width: 300, withoutEnlargement: true })
            .webp({ quality: 70, effort: 6 })
            .toFile(thumbnailPath);

          // Build public URL served by /uploads static
          const publicUrl = `/uploads/cars/${carId}/${filename}`;
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

      // Persist image URLs by appending to existing images array
      const car = await service.getCarById(carId);
      const existingImages = Array.isArray(car.images)
        ? car.images
        : (typeof car.images === 'string' ? (JSON.parse(car.images || '[]') || []) : []);
      const updatedImages = [...existingImages, ...publicUrls];

      await service.updateCar(carId, req.user.id, { images: updatedImages });

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
      console.error('Image upload failed:', error);
      return res.status(400).json({ success: false, message: error.message || 'Failed to upload images' });
    }
  });

  // Route to get thumbnail URLs for images
  router.get('/:id/images/thumbnails', async (req, res) => {
    try {
      const carId = req.params.id;
      const car = await service.getCarById(carId);
      
      if (!car || !car.images) {
        return res.json({ success: true, data: { thumbnails: [] } });
      }
      
      const images = Array.isArray(car.images) ? car.images : JSON.parse(car.images || '[]');
      const thumbnails = images.map(imageUrl => {
        const filename = imageUrl.split('/').pop();
        return imageUrl.replace(filename, `thumb-${filename}`);
      });
      
      res.json({ success: true, data: { thumbnails } });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message || 'Failed to get thumbnails' });
    }
  });

  // Route to delete specific images
  router.delete('/:id/images', authenticate, authorizeRoles('seller', 'admin'), async (req, res) => {
    try {
      const carId = req.params.id;
      const { imageUrls } = req.body;
      
      if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
        return res.status(400).json({ success: false, message: 'Image URLs array is required' });
      }
      
      // Basic ownership check (admin can bypass)
      if (req.user.role !== 'admin') {
        const car = await service.getCarById(carId);
        if (!car || car.seller_id !== req.user.id) {
          return res.status(403).json({ success: false, message: 'Not allowed to delete images for this car' });
        }
      }
      
      const car = await service.getCarById(carId);
      if (!car) {
        return res.status(404).json({ success: false, message: 'Car not found' });
      }
      
      const existingImages = Array.isArray(car.images)
        ? car.images
        : (typeof car.images === 'string' ? (JSON.parse(car.images || '[]') || []) : []);
      
      // Filter out the images to be deleted
      const updatedImages = existingImages.filter(imageUrl => !imageUrls.includes(imageUrl));
      
      // Delete files from filesystem
      const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');
      const deletedFiles = [];
      const errors = [];
      
      for (const imageUrl of imageUrls) {
        try {
          if (imageUrl.startsWith('/uploads/cars/')) {
            const filePath = path.join(uploadsRoot, imageUrl.replace('/uploads/', ''));
            const thumbnailPath = filePath.replace(/([^/]+)$/, 'thumb-$1');
            
            // Delete main image
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              deletedFiles.push(imageUrl);
            }
            
            // Delete thumbnail
            if (fs.existsSync(thumbnailPath)) {
              fs.unlinkSync(thumbnailPath);
              deletedFiles.push(imageUrl.replace(/([^/]+)$/, 'thumb-$1'));
            }
          }
        } catch (fileError) {
          console.error(`Failed to delete file ${imageUrl}:`, fileError);
          errors.push(`Failed to delete ${imageUrl}: ${fileError.message}`);
        }
      }
      
      // Update database
      await service.updateCar(carId, req.user.id, { images: updatedImages });
      
      res.json({ 
        success: true, 
        message: `Successfully deleted ${deletedFiles.length} image(s)`, 
        data: { 
          deleted_images: imageUrls,
          remaining_images: updatedImages,
          errors: errors.length > 0 ? errors : undefined
        } 
      });
    } catch (error) {
      console.error('Image deletion failed:', error);
      res.status(400).json({ success: false, message: error.message || 'Failed to delete images' });
    }
  });
}

module.exports = router;
