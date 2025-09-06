import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../config/database.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/scholarship-documents';
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
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// GET all scholarship documents (public)
router.get('/', async (req, res) => {
  try {
    const [documents] = await db.query(`
      SELECT id, title, description, file_name, file_size, category, download_count, created_at
      FROM scholarship_documents 
      WHERE is_active = 1 
      ORDER BY category, created_at DESC
    `);
    
    res.json({
      success: true,
      documents
    });
  } catch (error) {
    console.error('Error fetching scholarship documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents'
    });
  }
});

// GET scholarship documents by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const [documents] = await db.query(`
      SELECT id, title, description, file_name, file_size, category, download_count, created_at
      FROM scholarship_documents 
      WHERE is_active = 1 AND category = ?
      ORDER BY created_at DESC
    `, [category]);
    
    res.json({
      success: true,
      documents
    });
  } catch (error) {
    console.error('Error fetching documents by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents'
    });
  }
});

// POST upload new scholarship document (admin only)
router.post('/', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { title, description, category } = req.body;
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;
    const uploadedBy = req.user?.id || 1; // Default to admin user ID if not authenticated

    const [result] = await db.query(`
      INSERT INTO scholarship_documents (title, description, file_path, file_name, file_size, category, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, description, filePath, fileName, fileSize, category || 'general', uploadedBy]);

    const [newDocument] = await db.query(`
      SELECT * FROM scholarship_documents WHERE id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document: newDocument[0]
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload document'
    });
  }
});

// GET download scholarship document
router.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [documents] = await db.query(`
      SELECT file_path, file_name FROM scholarship_documents WHERE id = ? AND is_active = 1
    `, [id]);

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    const document = documents[0];
    const filePath = document.file_path;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found on server'
      });
    }

    // Update download count
    await db.query(`
      UPDATE scholarship_documents SET download_count = download_count + 1 WHERE id = ?
    `, [id]);

    // Set proper headers for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${document.file_name}"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Send file
    res.download(filePath, document.file_name);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download document'
    });
  }
});

// PUT update scholarship document (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, is_active } = req.body;

    const [existing] = await db.query(`
      SELECT * FROM scholarship_documents WHERE id = ?
    `, [id]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    await db.query(`
      UPDATE scholarship_documents 
      SET title = ?, description = ?, category = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?
    `, [title, description, category, is_active, id]);

    const [updatedDocument] = await db.query(`
      SELECT * FROM scholarship_documents WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Document updated successfully',
      document: updatedDocument[0]
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update document'
    });
  }
});

// DELETE scholarship document (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query(`
      SELECT file_path FROM scholarship_documents WHERE id = ?
    `, [id]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Delete file from filesystem
    const filePath = existing[0].file_path;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await db.query(`
      DELETE FROM scholarship_documents WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete document'
    });
  }
});

// GET document statistics (admin only)
router.get('/stats/overview', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_documents,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_documents,
        SUM(download_count) as total_downloads,
        COUNT(DISTINCT category) as categories_count
      FROM scholarship_documents
    `);

    const [categoryStats] = await db.query(`
      SELECT 
        category,
        COUNT(*) as document_count,
        SUM(download_count) as total_downloads
      FROM scholarship_documents 
      WHERE is_active = 1
      GROUP BY category
      ORDER BY document_count DESC
    `);

    res.json({
      success: true,
      stats: stats[0],
      categoryStats
    });
  } catch (error) {
    console.error('Error fetching document stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

export default router;
