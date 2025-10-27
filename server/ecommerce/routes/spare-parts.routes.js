const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const sparePartsService = require('../services/spare-parts.service');
const sparePartsSimpleService = require('../services/spare-parts-simple.service');
const sparePartsAnalyticsService = require('../services/spare-parts-analytics.service');
const path = require('path');
const fs = require('fs');
let multer, sharp;
try {
  multer = require('multer');
  sharp = require('sharp');
} catch (e) {
  // Dependencies may not be installed yet; route will error if used until installed
}

// Create multer upload middleware if multer is available
const upload = multer ? multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 10 }
}) : null;
const { authenticateToken, authorizeRoles } = require('../../middleware/auth.middleware');
const { validateSparePart, validateInventory, validateVehicleCompatibility } = require('../../middleware/spare-parts-validation.middleware');
const { executeQuery } = require('../../config/database');

// Enhanced rate limiting specifically for spare parts operations
const sparePartsRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Very high limits for authenticated sellers/admins doing dashboard operations
    if (req.user && (req.user.role === 'seller' || req.user.role === 'admin')) {
      return 500; // 500 requests per 15 minutes for sellers/admins
    }
    // Lower limit for public access
    return 100;
  },
  keyGenerator: (req) => {
    const ipKey = (rateLimit.ipKeyGenerator ? rateLimit.ipKeyGenerator(req) : req.ip);
    if (req.user && req.user.id) {
      return `spare-parts-${ipKey}-${req.user.id}`;
    }
    return `spare-parts-${ipKey}`;
  },
  message: {
    error: {
      code: 'SPARE_PARTS_RATE_LIMIT_EXCEEDED',
      message: 'Too many requests to spare parts API, please try again later.',
      retryAfter: 900 // 15 minutes in seconds
    }
  },
  handler: (req, res) => {
    res.set('Retry-After', '900');
    res.status(429).json({
      error: {
        code: 'SPARE_PARTS_RATE_LIMIT_EXCEEDED',
        message: 'Too many requests to spare parts API, please try again later.',
        retryAfter: 900
      }
    });
  }
});

// Apply rate limiting to all spare parts routes
router.use(sparePartsRateLimit);

// ==================== SPARE PARTS CRUD ROUTES ====================

// Create spare part
router.post('/', authenticateToken, authorizeRoles(['seller', 'admin']), validateSparePart, async (req, res) => {
  try {
    // Sanitize the data - convert empty strings to defaults for integer fields actually used by client
    const sanitizeData = (data) => {
      const sanitized = { ...data };
      // Only sanitize fields actually used by client form
      const defaultValues = {
        quantity_available: 0,
        quantity_reserved: 0,
        reorder_point: 10,
        warranty_period_months: 12
      };
      
      Object.keys(defaultValues).forEach(field => {
        if (sanitized[field] === '' || sanitized[field] === 'null' || sanitized[field] === 'undefined' || sanitized[field] === null || sanitized[field] === undefined) {
          sanitized[field] = defaultValues[field];
        } else if (typeof sanitized[field] === 'string') {
          const parsed = parseInt(sanitized[field]);
          sanitized[field] = isNaN(parsed) ? defaultValues[field] : parsed;
        }
      });
      
      return sanitized;
    };
    
    const sparePartData = sanitizeData({
      ...req.body,
      seller_id: req.user.role === 'admin' ? req.body.seller_id : req.user.id
    });
    
    const sparePart = await sparePartsService.createSparePart(sparePartData);
    res.status(201).json({
      success: true,
      message: 'Spare part created successfully',
      data: sparePart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== IMAGE UPLOAD ROUTE ====================
// Upload images for a spare part; saves optimized images to /uploads/spare-parts/:id
// This route is always registered, but checks for sharp/multer availability at runtime

const imageUploadHandler = async (req, res) => {
  try {
    const sparePartId = req.params.id;
    
    // Validate spare part ID format
    if (!sparePartId || typeof sparePartId !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid spare part ID' });
    }
    
    // Check if sharp is available for image processing
    if (!sharp) {
      return res.status(503).json({ 
        success: false, 
        message: 'Image upload service temporarily unavailable. Please ensure sharp is installed.' 
      });
    }
    
    // Basic ownership check (admin can bypass)
    if (req.user.role !== 'admin') {
      const part = await sparePartsService.getSparePartById(sparePartId);
      if (!part || part.seller_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not allowed to upload images for this spare part' });
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
    const partDir = path.join(uploadsRoot, 'spare-parts', sparePartId);
    
    // Ensure directory exists
    fs.mkdirSync(partDir, { recursive: true });

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
        const outPath = path.join(partDir, filename);

        // Optimize and convert to webp (lossy, quality 80) and max width 1600
        await sharp(file.buffer)
          .rotate()
          .resize({ width: 1600, withoutEnlargement: true })
          .webp({ quality: 80, effort: 6 })
          .toFile(outPath);

        // Also create a thumbnail version (300px max width)
        const thumbnailFilename = `thumb-${filename}`;
        const thumbnailPath = path.join(partDir, thumbnailFilename);
        await sharp(file.buffer)
          .rotate()
          .resize({ width: 300, withoutEnlargement: true })
          .webp({ quality: 70, effort: 6 })
          .toFile(thumbnailPath);

        // Build public URL served by /uploads static
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

    // Persist image URLs by appending to existing images array
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
    console.error('Image upload failed:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to upload images' });
  }
};

// Register the route with multer middleware if available, otherwise return an error
if (upload) {
  router.post('/:id/images', authenticateToken, authorizeRoles(['seller', 'admin']), upload.array('images', 10), imageUploadHandler);
} else {
  router.post('/:id/images', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
    return res.status(503).json({ 
      success: false, 
      message: 'Image upload service temporarily unavailable. Please ensure multer is installed.' 
    });
  });
}

if (false) { // Original conditional code below for reference
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024, files: 10 } // 10MB per file, up to 10 files
  });

  router.post('/:id/images', authenticateToken, authorizeRoles(['seller', 'admin']), upload.array('images', 10), async (req, res) => {
    try {
      const sparePartId = req.params.id;
      
      // Validate spare part ID format
      if (!sparePartId || typeof sparePartId !== 'string') {
        return res.status(400).json({ success: false, message: 'Invalid spare part ID' });
      }
      
      // Basic ownership check (admin can bypass)
      if (req.user.role !== 'admin') {
        const part = await sparePartsService.getSparePartById(sparePartId);
        if (!part || part.seller_id !== req.user.id) {
          return res.status(403).json({ success: false, message: 'Not allowed to upload images for this spare part' });
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
      const partDir = path.join(uploadsRoot, 'spare-parts', sparePartId);
      
      // Ensure directory exists
      fs.mkdirSync(partDir, { recursive: true });

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
          const outPath = path.join(partDir, filename);

          // Optimize and convert to webp (lossy, quality 80) and max width 1600
          await sharp(file.buffer)
            .rotate()
            .resize({ width: 1600, withoutEnlargement: true })
            .webp({ quality: 80, effort: 6 })
            .toFile(outPath);

          // Also create a thumbnail version (300px max width)
          const thumbnailFilename = `thumb-${filename}`;
          const thumbnailPath = path.join(partDir, thumbnailFilename);
          await sharp(file.buffer)
            .rotate()
            .resize({ width: 300, withoutEnlargement: true })
            .webp({ quality: 70, effort: 6 })
            .toFile(thumbnailPath);

          // Build public URL served by /uploads static
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

      // Persist image URLs by appending to existing images array
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
      console.error('Image upload failed:', error);
      return res.status(400).json({ success: false, message: error.message || 'Failed to upload images' });
    }
  });
} else {
  // Fallback route when multer or sharp is not available
  router.post('/:id/images', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
    return res.status(503).json({ 
      success: false, 
      message: 'Image upload service temporarily unavailable. Please ensure multer and sharp are installed.' 
    });
  });
}

// Route to get thumbnail URLs for images (always available)
  router.get('/:id/images/thumbnails', async (req, res) => {
    try {
      const sparePartId = req.params.id;
      const part = await sparePartsService.getSparePartById(sparePartId);
      
      if (!part || !part.images) {
        return res.json({ success: true, data: { thumbnails: [] } });
      }
      
      const images = Array.isArray(part.images) ? part.images : JSON.parse(part.images || '[]');
      const thumbnails = images.map(imageUrl => {
        const filename = imageUrl.split('/').pop();
        return imageUrl.replace(filename, `thumb-${filename}`);
      });
      
      res.json({ success: true, data: { thumbnails } });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message || 'Failed to get thumbnails' });
    }
  });

// Delete images route (always available)
  router.delete('/:id/images', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
    try {
      const sparePartId = req.params.id;
      const { imageUrls } = req.body;
      
      if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
        return res.status(400).json({ success: false, message: 'Image URLs array is required' });
      }
      
      // Basic ownership check (admin can bypass)
      if (req.user.role !== 'admin') {
        const part = await sparePartsService.getSparePartById(sparePartId);
        if (!part || part.seller_id !== req.user.id) {
          return res.status(403).json({ success: false, message: 'Not allowed to delete images for this spare part' });
        }
      }
      
      const part = await sparePartsService.getSparePartById(sparePartId);
      if (!part) {
        return res.status(404).json({ success: false, message: 'Spare part not found' });
      }
      
      const existingImages = Array.isArray(part.images)
        ? part.images
        : (typeof part.images === 'string' ? (JSON.parse(part.images || '[]') || []) : []);
      
      // Filter out the images to be deleted
      const updatedImages = existingImages.filter(imageUrl => !imageUrls.includes(imageUrl));
      
      // Delete files from filesystem
      const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');
      const deletedFiles = [];
      const errors = [];
      
      for (const imageUrl of imageUrls) {
        try {
          if (imageUrl.startsWith('/uploads/spare-parts/')) {
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
      await sparePartsService.updateSparePart(sparePartId, { images: updatedImages });
      
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

// Update spare part
router.put('/:id', authenticateToken, authorizeRoles(['seller', 'admin']), validateSparePart, async (req, res) => {
  try {
    const sparePart = await sparePartsService.updateSparePart(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Spare part updated successfully',
      data: sparePart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete spare part
router.delete('/:id', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const result = await sparePartsService.deleteSparePart(req.params.id);
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== ADVANCED SEARCH ROUTES ====================

// Public route for customers to browse spare parts (no authentication required)
router.get('/public', async (req, res) => {
  try {
    const searchParams = {
      query: req.query.q,
      category_id: req.query.category_id,
      brand_id: req.query.brand_id,
      seller_id: req.query.seller_id, // Allow filtering by specific seller
      price_min: req.query.price_min ? parseFloat(req.query.price_min) : undefined,
      price_max: req.query.price_max ? parseFloat(req.query.price_max) : undefined,
      vehicle_make: req.query.vehicle_make,
      vehicle_model: req.query.vehicle_model,
      vehicle_year_from: req.query.vehicle_year_from ? parseInt(req.query.vehicle_year_from) : undefined,
      vehicle_year_to: req.query.vehicle_year_to ? parseInt(req.query.vehicle_year_to) : undefined,
      engine_type: req.query.engine_type,
      fuel_type: req.query.fuel_type,
      transmission_type: req.query.transmission_type,
      availability_status: req.query.availability_status || 'in_stock', // Default to in_stock for public
      sort_by: req.query.sort_by,
      sort_order: req.query.sort_order,
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
      location_radius: req.query.location_radius ? parseFloat(req.query.location_radius) : undefined,
      user_latitude: req.query.user_latitude ? parseFloat(req.query.user_latitude) : undefined,
      user_longitude: req.query.user_longitude ? parseFloat(req.query.user_longitude) : undefined
    };

    const result = await sparePartsService.searchSpareParts(searchParams);
    res.json({
      success: true,
      data: result.spare_parts,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Search spare parts with advanced filters (authenticated - for sellers to manage their own parts)
router.get('/', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    // COMPREHENSIVE PARAMETER VALIDATION AND SANITIZATION
    console.log('=== ROUTE LEVEL VALIDATION ===');
    console.log('Raw user object:', req.user);
    console.log('Raw query params:', req.query);
    
    // Validate and sanitize seller_id
    let seller_id;
    if (req.user.role === 'admin') {
      seller_id = req.query.seller_id;
    } else {
      seller_id = req.user.id;
    }
    
    // Additional validation for seller_id
    if (!seller_id || seller_id === 'undefined' || seller_id === 'null' || seller_id === '') {
      console.warn('Invalid seller_id detected:', seller_id);
      seller_id = undefined;
    }
    
    console.log('Processed seller_id:', seller_id);
    
    // Validate numeric parameters
    const validateNumeric = (value, defaultValue = undefined) => {
      if (value === undefined || value === null || value === '') return defaultValue;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    };
    
    const validateInteger = (value, defaultValue = undefined) => {
      if (value === undefined || value === null || value === '') return defaultValue;
      const parsed = parseInt(value);
      return isNaN(parsed) ? defaultValue : parsed;
    };
    
    const searchParams = {
      query: req.query.q || undefined,
      category_id: req.query.category_id || undefined,
      brand_id: req.query.brand_id || undefined,
      seller_id: seller_id, // Already validated above
      price_min: validateNumeric(req.query.price_min),
      price_max: validateNumeric(req.query.price_max),
      vehicle_make: req.query.vehicle_make || undefined,
      vehicle_model: req.query.vehicle_model || undefined,
      vehicle_year_from: validateInteger(req.query.vehicle_year_from),
      vehicle_year_to: validateInteger(req.query.vehicle_year_to),
      engine_type: req.query.engine_type || undefined,
      fuel_type: req.query.fuel_type || undefined,
      transmission_type: req.query.transmission_type || undefined,
      availability_status: req.query.availability_status || undefined,
      sort_by: req.query.sort_by || undefined,
      sort_order: req.query.sort_order || 'ASC',
      page: validateInteger(req.query.page, 1),
      limit: validateInteger(req.query.limit, 50),
      location_radius: validateNumeric(req.query.location_radius),
      user_latitude: validateNumeric(req.query.user_latitude),
      user_longitude: validateNumeric(req.query.user_longitude)
    };
    
    console.log('Sanitized search params:', JSON.stringify(searchParams, null, 2));
    console.log('===============================');

    // Try multiple approaches to get spare parts data
    let result;
    
    try {
      // Attempt 1: Use the main service
      console.log('Attempt 1: Using main spare parts service');
      result = await sparePartsService.searchSpareParts(searchParams);
      console.log('✅ Main service succeeded');
    } catch (error) {
      console.error('❌ Main service failed:', error.message);
      
      try {
        // Attempt 2: Use the simple service
        console.log('Attempt 2: Using simple spare parts service');
        result = await sparePartsSimpleService.searchSpareParts(searchParams);
        console.log('✅ Simple service succeeded');
      } catch (simpleError) {
        console.error('❌ Simple service failed:', simpleError.message);
        
        try {
          // Attempt 3: Direct database query
          console.log('Attempt 3: Using direct database query');
          const simpleQuery = `
            SELECT
              sp.id,
              sp.sku,
              sp.name,
              sp.description,
              sp.category_id,
              sp.brand_id,
              sp.images,
              sp.price,
              sp.currency,
              sp.seller_id,
              sp.status,
              sp.created_at,
              sp.updated_at,
              c.name as category_name,
              b.name as brand_name,
              sp.quantity_available,
              sp.quantity_reserved,
              sp.reorder_point,
              sp.max_stock_level,
              sp.last_restocked_at,
              sp.last_sold_at
            FROM spare_parts sp
            LEFT JOIN spare_parts_categories c ON sp.category_id = c.id
            LEFT JOIN spare_parts_brands b ON sp.brand_id = b.id
            WHERE sp.seller_id = ?
            ORDER BY sp.created_at DESC
            LIMIT ${searchParams.limit} OFFSET ${(searchParams.page - 1) * searchParams.limit}
          `;
          
          const simpleParams = [searchParams.seller_id || ''];
          console.log('Direct query params:', simpleParams);
          
          const spareParts = await executeQuery(simpleQuery, simpleParams);
          
          // Parse JSON fields and convert image URLs for each spare part
          const parseSparePartFields = (part) => {
            if (!part) return part;
            
            // Parse images JSON string to array and convert to absolute URLs
            if (part.images) {
              try {
                part.images = typeof part.images === 'string' ? JSON.parse(part.images) : part.images;
                
                // Convert relative paths to absolute URLs
                let baseUrl = process.env.API_URL || process.env.BASE_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:3001';
                
                // Prefer production URL in production
                if (process.env.NODE_ENV === 'production' || process.env.ENVIRONMENT === 'production') {
                  baseUrl = 'https://www.reaglex.com';
                } else if (req && req.protocol && req.get('host')) {
                  baseUrl = `${req.protocol}://${req.get('host')}`;
                }
                
                part.images = part.images.map(img => {
                  if (img && (img.startsWith('http://') || img.startsWith('https://'))) {
                    return img;
                  }
                  if (img && img.startsWith('/uploads/')) {
                    return `${baseUrl}${img}`;
                  }
                  return img;
                }).filter(Boolean);
              } catch (e) {
                console.warn('Failed to parse images JSON:', e);
                part.images = [];
              }
            } else {
              part.images = [];
            }
            
            return part;
          };
          
          // Process each spare part
          const processedSpareParts = spareParts.map(parseSparePartFields);
          
          // Get count for pagination
          const countQuery = `SELECT COUNT(*) as total FROM spare_parts sp WHERE sp.seller_id = ?`;
          const countResult = await executeQuery(countQuery, [searchParams.seller_id || '']);
          const total = countResult[0].total;
          
          result = {
            spare_parts: processedSpareParts,
            pagination: {
              page: searchParams.page,
              limit: searchParams.limit,
              total,
              total_pages: Math.ceil(total / searchParams.limit),
              has_next: searchParams.page * searchParams.limit < total,
              has_prev: searchParams.page > 1
            }
          };
          console.log('✅ Direct query succeeded');
        } catch (directError) {
          console.error('❌ All attempts failed:', directError.message);
          throw directError;
        }
      }
    }
    
    // Helper function to convert image URLs
    const convertImageUrls = (images) => {
      if (!Array.isArray(images)) return images || [];
      
      // Determine base URL from environment or request
      let baseUrl = process.env.API_URL || process.env.BASE_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:3001';
      
      // Prefer production URL in production
      if (process.env.NODE_ENV === 'production' || process.env.ENVIRONMENT === 'production') {
        baseUrl = 'https://www.reaglex.com';
      } else if (req && req.protocol && req.get('host')) {
        baseUrl = `${req.protocol}://${req.get('host')}`;
      }
      
      return images.map(img => {
        if (img && (img.startsWith('http://') || img.startsWith('https://'))) {
          return img;
        }
        if (img && img.startsWith('/uploads/')) {
          return `${baseUrl}${img}`;
        }
        return img;
      }).filter(Boolean);
    };
    
    // Parse and convert image URLs for all spare parts
    const processedSpareParts = result.spare_parts.map(part => {
      if (part.images) {
        try {
          part.images = typeof part.images === 'string' ? JSON.parse(part.images) : part.images;
          part.images = convertImageUrls(part.images);
        } catch (e) {
          console.warn('Failed to parse images JSON:', e);
          part.images = [];
        }
      } else {
        part.images = [];
      }
      return part;
    });
    
    res.json({
      success: true,
      data: processedSpareParts,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== TEST ROUTES ====================

// Simple test endpoint to verify basic functionality
router.get('/test', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    console.log('=== TEST ENDPOINT ===');
    console.log('User:', req.user);
    
    const simpleQuery = `
      SELECT 
        sp.id,
        sp.name,
        sp.seller_id,
        sp.quantity_available
      FROM spare_parts sp
      WHERE sp.seller_id = ?
      LIMIT 5
    `;
    
    const testParams = [req.user.id];
    console.log('Test query:', simpleQuery);
    console.log('Test params:', testParams);
    
    const results = await executeQuery(simpleQuery, testParams);
    
    res.json({
      success: true,
      message: 'Test endpoint working',
      data: results,
      user_id: req.user.id
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
      error: error
    });
  }
});

// ==================== UTILITY ROUTES ====================

// Get categories (both /categories and /meta/categories for compatibility)
router.get('/categories', async (req, res) => {
  try {
    let categories;
    try {
      categories = await sparePartsService.getCategories();
    } catch (error) {
      console.log('Main service failed, using simple service for categories');
      try {
      categories = await sparePartsSimpleService.getCategories();
      } catch (simpleError) {
        console.log('Simple service failed, using mock data for categories');
        // Mock categories data as fallback
        categories = [
          { id: '1', name: 'Brake System', description: 'Brake components and parts' },
          { id: '2', name: 'Engine & Lubrication', description: 'Engine parts and lubricants' },
          { id: '3', name: 'Electrical', description: 'Electrical components' },
          { id: '4', name: 'Suspension', description: 'Suspension and steering parts' },
          { id: '5', name: 'Exhaust System', description: 'Exhaust components' },
          { id: '6', name: 'Cooling System', description: 'Cooling system parts' },
          { id: '7', name: 'Fuel System', description: 'Fuel system components' },
          { id: '8', name: 'Filters', description: 'Air, oil, and fuel filters' }
        ];
      }
    }
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    // Final fallback with mock data
    res.json({
      success: true,
      data: [
        { id: '1', name: 'Brake System', description: 'Brake components and parts' },
        { id: '2', name: 'Engine & Lubrication', description: 'Engine parts and lubricants' },
        { id: '3', name: 'Electrical', description: 'Electrical components' },
        { id: '4', name: 'Suspension', description: 'Suspension and steering parts' },
        { id: '5', name: 'Exhaust System', description: 'Exhaust components' }
      ]
    });
  }
});

router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await sparePartsService.getCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get brands (both /brands and /meta/brands for compatibility)
router.get('/brands', async (req, res) => {
  try {
    let brands;
    try {
      brands = await sparePartsService.getBrands();
    } catch (error) {
      console.log('Main service failed, using simple service for brands');
      try {
      brands = await sparePartsSimpleService.getBrands();
      } catch (simpleError) {
        console.log('Simple service failed, using mock data for brands');
        // Mock brands data as fallback
        brands = [
          { id: '1', name: 'OEM', description: 'Original Equipment Manufacturer' },
          { id: '2', name: 'Bosch', description: 'Bosch Auto Parts' },
          { id: '3', name: 'Delphi', description: 'Delphi Technologies' },
          { id: '4', name: 'Denso', description: 'Denso Corporation' },
          { id: '5', name: 'ACDelco', description: 'ACDelco Parts' },
          { id: '6', name: 'Motorcraft', description: 'Motorcraft Parts' },
          { id: '7', name: 'NGK', description: 'NGK Spark Plugs' },
          { id: '8', name: 'Fram', description: 'Fram Filters' }
        ];
      }
    }
    
    res.json({
      success: true,
      data: brands
    });
  } catch (error) {
    console.error('Error getting brands:', error);
    // Final fallback with mock data
    res.json({
      success: true,
      data: [
        { id: '1', name: 'OEM', description: 'Original Equipment Manufacturer' },
        { id: '2', name: 'Bosch', description: 'Bosch Auto Parts' },
        { id: '3', name: 'Delphi', description: 'Delphi Technologies' },
        { id: '4', name: 'Denso', description: 'Denso Corporation' }
      ]
    });
  }
});

router.get('/meta/brands', async (req, res) => {
  try {
    const brands = await sparePartsService.getBrands();
    res.json({
      success: true,
      data: brands
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get spare part by ID (must be after specific routes)
router.get('/:id', async (req, res) => {
  try {
    const sparePart = await sparePartsService.getSparePartById(req.params.id);
    res.json({
      success: true,
      data: sparePart
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// Find compatible parts for a vehicle
router.post('/compatibility/search', async (req, res) => {
  try {
    const vehicleData = req.body;
    const compatibleParts = await sparePartsService.findCompatibleParts(vehicleData);
    res.json({
      success: true,
      data: compatibleParts
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== INVENTORY MANAGEMENT ROUTES ====================

// Update inventory
router.put('/:id/inventory', authenticateToken, authorizeRoles(['seller', 'admin']), validateInventory, async (req, res) => {
  try {
    const result = await sparePartsService.updateInventory(req.params.id, req.body);
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update stock (simple method for main table)
router.put('/:id/stock', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }
    
    const result = await sparePartsService.updateStock(req.params.id, quantity);
    res.json({
      success: true,
      message: result.message,
      data: {
        spare_part_id: result.spare_part_id,
        quantity_available: result.quantity_available
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Restock (add new purchases to existing stock)
router.post('/:id/restock', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const { quantity_added, cost_per_unit } = req.body || {};
    const qty = Number(quantity_added);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'quantity_added must be a positive number' });
    }

    const result = await sparePartsService.restockStock(req.params.id, qty, cost_per_unit);
    return res.json({ success: true, message: result.message, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// Reserve inventory
router.post('/:id/inventory/reserve', authenticateToken, async (req, res) => {
  try {
    const { warehouse_id, quantity } = req.body;
    const result = await sparePartsService.reserveInventory(req.params.id, warehouse_id, quantity);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Release inventory
router.post('/:id/inventory/release', authenticateToken, async (req, res) => {
  try {
    const { warehouse_id, quantity } = req.body;
    const result = await sparePartsService.releaseInventory(req.params.id, warehouse_id, quantity);
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Sell inventory
router.post('/:id/inventory/sell', authenticateToken, async (req, res) => {
  try {
    const { warehouse_id, quantity } = req.body;
    const result = await sparePartsService.sellInventory(req.params.id, warehouse_id, quantity);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get low stock items
router.get('/inventory/low-stock', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const sellerId = req.user.role === 'admin' ? req.query.seller_id : req.user.id;
    const lowStockItems = await sparePartsService.getLowStockItems(sellerId);
    res.json({
      success: true,
      data: lowStockItems
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== VEHICLE COMPATIBILITY ROUTES ====================

// Add vehicle compatibility
router.post('/:id/compatibility', authenticateToken, authorizeRoles(['seller', 'admin']), validateVehicleCompatibility, async (req, res) => {
  try {
    const result = await sparePartsService.addVehicleCompatibility(req.params.id, req.body);
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get vehicle compatibility
router.get('/:id/compatibility', async (req, res) => {
  try {
    const compatibility = await sparePartsService.getVehicleCompatibility(req.params.id);
    res.json({
      success: true,
      data: compatibility
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update vehicle compatibility
router.put('/:id/compatibility', authenticateToken, authorizeRoles(['seller', 'admin']), validateVehicleCompatibility, async (req, res) => {
  try {
    const result = await sparePartsService.updateVehicleCompatibility(req.params.id, req.body);
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== PRICE COMPARISON ROUTES ====================

// Add price comparison
router.post('/:id/price-comparison', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const result = await sparePartsService.addPriceComparison(req.params.id, req.body);
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get price comparisons
router.get('/:id/price-comparison', async (req, res) => {
  try {
    const comparisons = await sparePartsService.getPriceComparisons(req.params.id);
    res.json({
      success: true,
      data: comparisons
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get price analysis
router.get('/:id/price-analysis', async (req, res) => {
  try {
    const analysis = await sparePartsService.getPriceAnalysis(req.params.id);
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== BUNDLE MANAGEMENT ROUTES ====================

// Create bundle
router.post('/bundles', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const bundleData = {
      ...req.body,
      seller_id: req.user.role === 'admin' ? req.body.seller_id : req.user.id
    };
    
    const bundle = await sparePartsService.createBundle(bundleData);
    res.status(201).json({
      success: true,
      message: 'Bundle created successfully',
      data: bundle
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get bundle by ID
router.get('/bundles/:id', async (req, res) => {
  try {
    const bundle = await sparePartsService.getBundleById(req.params.id);
    res.json({
      success: true,
      data: bundle
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// Add bundle items
router.post('/bundles/:id/items', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const result = await sparePartsService.addBundleItems(req.params.id, req.body);
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== INSTALLATION SERVICES ROUTES ====================

// Add installation services
router.post('/:id/installation-services', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const result = await sparePartsService.addInstallationServices(req.params.id, req.body);
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get installation services
router.get('/:id/installation-services', async (req, res) => {
  try {
    const services = await sparePartsService.getInstallationServices(req.params.id);
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update installation services
router.put('/:id/installation-services', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const result = await sparePartsService.updateInstallationServices(req.params.id, req.body);
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get seller stats
router.get('/seller/:sellerId/stats', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const sellerId = req.user.role === 'admin' ? req.params.sellerId : req.user.id;
    const stats = await sparePartsService.getSellerStats(sellerId);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== ANALYTICS AND REPORTING ROUTES ====================

// Get comprehensive analytics overview
router.get('/analytics/overview', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const sellerId = req.user.role === 'admin' ? req.query.seller_id : req.user.id;
    const { time_range = '6m' } = req.query;

    const analytics = await sparePartsAnalyticsService.getAnalyticsOverview(sellerId, time_range);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get performance metrics
router.get('/analytics/metrics', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const sellerId = req.user.role === 'admin' ? req.query.seller_id : req.user.id;
    const { time_range = '6m' } = req.query;
    
    const dateRange = sparePartsAnalyticsService.getDateRange(time_range);
    const metrics = await sparePartsAnalyticsService.getPerformanceMetrics(sellerId, dateRange);
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get sales trends
router.get('/analytics/sales-trends', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const sellerId = req.user.role === 'admin' ? req.query.seller_id : req.user.id;
    const { time_range = '6m' } = req.query;
    
    const dateRange = sparePartsAnalyticsService.getDateRange(time_range);
    const trends = await sparePartsAnalyticsService.getSalesTrends(sellerId, dateRange);
    
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Sales trends error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get category analysis
router.get('/analytics/categories', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const sellerId = req.user.role === 'admin' ? req.query.seller_id : req.user.id;
    const { time_range = '6m' } = req.query;
    
    const dateRange = sparePartsAnalyticsService.getDateRange(time_range);
    const analysis = await sparePartsAnalyticsService.getCategoryAnalysis(sellerId, dateRange);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Category analysis error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get top selling parts
router.get('/analytics/top-selling', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const sellerId = req.user.role === 'admin' ? req.query.seller_id : req.user.id;
    const { time_range = '6m', limit = 10 } = req.query;
    
    const dateRange = sparePartsAnalyticsService.getDateRange(time_range);
    const topSelling = await sparePartsAnalyticsService.getTopSellingParts(sellerId, dateRange, parseInt(limit));
    
    res.json({
      success: true,
      data: topSelling
    });
  } catch (error) {
    console.error('Top selling parts error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get inventory alerts
router.get('/analytics/inventory-alerts', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const sellerId = req.user.role === 'admin' ? req.query.seller_id : req.user.id;
    
    const alerts = await sparePartsAnalyticsService.getInventoryAlerts(sellerId);
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Inventory alerts error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get seller statistics
router.get('/analytics/stats', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    const sellerId = req.user.role === 'admin' ? req.query.seller_id : req.user.id;
    
    const stats = await sparePartsAnalyticsService.getSellerStats(sellerId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Seller stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get trending spare parts (enhanced)
router.get('/analytics/trending', async (req, res) => {
  try {
    const { category_id, brand_id, limit = 10, time_range = '1m' } = req.query;
    
    // This would typically analyze sales data, views, searches, etc.
    // For now, we'll return a placeholder response with some mock data
    res.json({
      success: true,
      data: {
        message: 'Trending analysis would be implemented here',
        filters: { category_id, brand_id, limit, time_range },
        trending: [
          { id: 1, name: 'Brake Pads', growth: 25.3, sales: 156 },
          { id: 2, name: 'Engine Oil', growth: 18.7, sales: 234 },
          { id: 3, name: 'Air Filter', growth: 12.1, sales: 89 }
        ]
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== RECOMMENDATION ROUTES ====================

// Get recommendations for user
router.get('/recommendations/user', authenticateToken, async (req, res) => {
  try {
    const { limit = 10, category_id, brand_id } = req.query;
    
    // This would typically analyze user behavior, purchase history, etc.
    // For now, we'll return a placeholder response
    res.json({
      success: true,
      data: {
        message: 'User recommendations would be implemented here',
        user_id: req.user.id,
        filters: { limit, category_id, brand_id }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get recommendations for spare part
router.get('/:id/recommendations', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    // This would typically find similar parts, complementary parts, etc.
    // For now, we'll return a placeholder response
    res.json({
      success: true,
      data: {
        message: 'Spare part recommendations would be implemented here',
        spare_part_id: req.params.id,
        limit
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Circuit breaker reset endpoint
router.post('/reset-circuit-breaker', async (req, res) => {
  try {
    const { resetCircuitBreaker } = require('../../config/database');
    resetCircuitBreaker();
    res.json({
      success: true,
      message: 'Circuit breaker reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
