import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../config/database.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/partnership-images';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// GET all partnership images (public)
router.get('/', async (req, res) => {
  try {
    const [images] = await db.query(`
      SELECT id, partner_type, title, description, image_path, image_name, alt_text, display_order, created_at
      FROM partnership_images 
      WHERE is_active = 1 
      ORDER BY partner_type, display_order, created_at DESC
    `);
    
    res.json({
      success: true,
      images
    });
  } catch (error) {
    console.error('Error fetching partnership images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch images'
    });
  }
});

// GET all images (admin) regardless of active status
router.get('/all', authenticateToken, checkPermission('partnerships', 'read'), async (req, res) => {
  try {
    const [images] = await db.query(`
      SELECT id, partner_type, title, description, image_path, image_name, alt_text, display_order, is_active, created_at
      FROM partnership_images 
      ORDER BY created_at DESC
    `);
    res.json({ success: true, images });
  } catch (error) {
    console.error('Error fetching all partnership images:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch images' });
  }
});

// GET partnership images by type
router.get('/type/:partnerType', async (req, res) => {
  try {
    const { partnerType } = req.params;
    const [images] = await db.query(`
      SELECT id, partner_type, title, description, image_path, image_name, alt_text, display_order, created_at
      FROM partnership_images 
      WHERE is_active = 1 AND partner_type = ?
      ORDER BY display_order, created_at DESC
    `, [partnerType]);
    
    res.json({
      success: true,
      images
    });
  } catch (error) {
    console.error('Error fetching images by type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch images'
    });
  }
});

// POST upload new partnership image (admin only)
router.post('/', authenticateToken, checkPermission('partnerships', 'write'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image uploaded'
      });
    }

    const { partnerType, title, description, altText, displayOrder } = req.body;
    const imagePath = req.file.path;
    const imageName = req.file.originalname;
    const uploadedBy = req.user.id;

    const [result] = await db.query(`
      INSERT INTO partnership_images (partner_type, title, description, image_path, image_name, alt_text, display_order, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [partnerType, title, description, imagePath, imageName, altText, displayOrder || 0, uploadedBy]);

    const [newImage] = await db.query(`
      SELECT * FROM partnership_images WHERE id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      image: newImage[0]
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
});

// PUT update partnership image (admin only)
router.put('/:id', authenticateToken, checkPermission('partnerships', 'write'), async (req, res) => {
  try {
    const { id } = req.params;
    const { partnerType, title, description, altText, displayOrder, is_active } = req.body;

    const [existing] = await db.query(`
      SELECT * FROM partnership_images WHERE id = ?
    `, [id]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    await db.query(`
      UPDATE partnership_images 
      SET partner_type = ?, title = ?, description = ?, alt_text = ?, display_order = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?
    `, [partnerType, title, description, altText, displayOrder, is_active, id]);

    const [updatedImage] = await db.query(`
      SELECT * FROM partnership_images WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Image updated successfully',
      image: updatedImage[0]
    });
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update image'
    });
  }
});

// PUT update image file (admin only)
router.put('/:id/image', authenticateToken, checkPermission('partnerships', 'write'), upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image uploaded'
      });
    }

    const [existing] = await db.query(`
      SELECT image_path FROM partnership_images WHERE id = ?
    `, [id]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    // Delete old image file
    const oldImagePath = existing[0].image_path;
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }

    // Update with new image
    const newImagePath = req.file.path;
    const newImageName = req.file.originalname;

    await db.query(`
      UPDATE partnership_images 
      SET image_path = ?, image_name = ?, updated_at = NOW()
      WHERE id = ?
    `, [newImagePath, newImageName, id]);

    const [updatedImage] = await db.query(`
      SELECT * FROM partnership_images WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Image file updated successfully',
      image: updatedImage[0]
    });
  } catch (error) {
    console.error('Error updating image file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update image file'
    });
  }
});

// DELETE partnership image (admin only)
router.delete('/:id', authenticateToken, checkPermission('partnerships', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query(`
      SELECT image_path FROM partnership_images WHERE id = ?
    `, [id]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    // Delete image file from filesystem
    const imagePath = existing[0].image_path;
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete from database
    await db.query(`
      DELETE FROM partnership_images WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image'
    });
  }
});

// GET image statistics (admin only)
router.get('/stats/overview', authenticateToken, checkPermission('partnerships', 'read'), async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_images,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_images,
        COUNT(DISTINCT partner_type) as partner_types_count
      FROM partnership_images
    `);

    const [typeStats] = await db.query(`
      SELECT 
        partner_type,
        COUNT(*) as image_count
      FROM partnership_images 
      WHERE is_active = 1
      GROUP BY partner_type
      ORDER BY image_count DESC
    `);

    res.json({
      success: true,
      stats: stats[0],
      typeStats
    });
  } catch (error) {
    console.error('Error fetching image stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

// GET available partner types
router.get('/partner-types', async (req, res) => {
  try {
    const [types] = await db.query(`
      SELECT DISTINCT partner_type, COUNT(*) as image_count
      FROM partnership_images 
      WHERE is_active = 1
      GROUP BY partner_type
      ORDER BY partner_type
    `);
    
    res.json({
      success: true,
      partnerTypes: types
    });
  } catch (error) {
    console.error('Error fetching partner types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch partner types'
    });
  }
});

export default router;
