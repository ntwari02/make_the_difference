import express from 'express';
import db from '../config/database.js';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Security middleware
router.use(helmet());
router.use(hpp());

// Rate limiting for admin partners routes
const partnersRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

router.use(partnersRateLimit);

// Admin authentication middleware using JWT (aligns with admin.js)
const adminAuth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No authentication token, access denied',
                code: 'NO_TOKEN'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        const [users] = await db.query(`
            SELECT u.id, u.email, u.full_name, u.role, u.status, u.last_login,
                   au.admin_level, au.permissions, au.is_active as admin_active
            FROM users u
            LEFT JOIN admin_users au ON u.id = au.user_id
            WHERE u.id = ? AND u.status = 'active'
        `, [decoded.id]);

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive',
                code: 'USER_INACTIVE'
            });
        }

        const user = users[0];
        const isAdminRole = (user.role && String(user.role).toLowerCase().includes('admin')) || user.admin_active === 1;
        if (!isAdminRole) {
            return res.status(403).json({
                success: false,
                message: 'Admin privileges required',
                code: 'INSUFFICIENT_PRIVILEGES'
            });
        }

        req.user = { id: user.id, email: user.email, role: user.role };
        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            code: 'INVALID_TOKEN'
        });
    }
};

// Apply admin auth to all routes
router.use(adminAuth);

// Upload setup for partner logos
const partnersDir = path.resolve('uploads/partners');
try { if (!fs.existsSync(partnersDir)) fs.mkdirSync(partnersDir, { recursive: true }); } catch {}
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, partnersDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}-${file.originalname.replace(/\s+/g,'_')}`)
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Validation middleware
const validatePartner = [
    body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required and must be less than 255 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('organization').optional().trim().isLength({ max: 255 }).withMessage('Organization must be less than 255 characters'),
    body('phone').optional().trim().isLength({ max: 50 }).withMessage('Phone must be less than 50 characters'),
    body('message').optional().trim().isLength({ max: 1000 }).withMessage('Message must be less than 1000 characters'),
    body('status').optional().isIn(['new', 'reviewed', 'approved', 'rejected']).withMessage('Invalid status')
];

// GET /api/admin/partners - Get all partners with pagination and filtering
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;
        
        // Build WHERE clause for filtering
        let whereClause = 'WHERE 1=1';
        const params = [];
        
        if (req.query.search) {
            whereClause += ' AND (name LIKE ? OR email LIKE ? OR organization LIKE ?)';
            const searchTerm = `%${req.query.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        if (req.query.status) {
            whereClause += ' AND status = ?';
            params.push(req.query.status);
        }
        
        if (req.query.organization) {
            whereClause += ' AND organization = ?';
            params.push(req.query.organization);
        }
        
        // Get total count
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total FROM partners ${whereClause}`,
            params
        );
        
        const total = countResult[0].total;
        
        // Get partners with pagination
        const [partners] = await db.query(
            `SELECT id, name, email, organization, phone, message, status, created_at 
             FROM partners ${whereClause}
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );
        
        res.json({
            success: true,
            partners: partners,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('Error fetching partners:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch partners',
            code: 'FETCH_ERROR'
        });
    }
});

// GET /api/admin/partners/export - Export partners to CSV (must be before dynamic :id route)
router.get('/export', async (req, res) => {
    try {
        const [partners] = await db.query(
            'SELECT name, email, organization, phone, message, status, created_at FROM partners ORDER BY created_at DESC'
        );
        const csvHeaders = 'Name,Email,Organization,Phone,Message,Status,Created At\n';
        const csvRows = partners.map(partner => [
            `"${partner.name || ''}"`,
            `"${partner.email || ''}"`,
            `"${partner.organization || ''}"`,
            `"${partner.phone || ''}"`,
            `"${(partner.message || '').replace(/"/g, '""')}"`,
            `"${partner.status || 'new'}"`,
            `"${partner.created_at || ''}"`
        ].join(',')).join('\n');
        const csvContent = csvHeaders + csvRows;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="partners-export-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);
    } catch (error) {
        console.error('Error exporting partners:', error);
        res.status(500).json({ success: false, message: 'Failed to export partners', code: 'EXPORT_ERROR' });
    }
});

// POST /api/admin/partners/upload-image - Upload partner logo
router.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success:false, message:'No image provided' });
        const rel = `uploads/partners/${req.file.filename}`.replace(/\\/g,'/');
        res.json({ success:true, url: rel });
    } catch (e) {
        console.error('Partner image upload failed', e);
        res.status(500).json({ success:false, message:'Failed to upload image' });
    }
});

// GET /api/admin/partners/:id - Get specific partner
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [partners] = await db.query('SELECT * FROM partners WHERE id = ?', [id]);
        if (partners.length === 0) {
            return res.status(404).json({ success: false, message: 'Partner not found', code: 'PARTNER_NOT_FOUND' });
        }
        res.json({ success: true, partner: partners[0] });
    } catch (error) {
        console.error('Error fetching partner:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch partner', code: 'FETCH_ERROR' });
    }
});

// POST /api/admin/partners - Create new partner
router.post('/', validatePartner, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
                code: 'VALIDATION_ERROR'
            });
        }
        
        const { name, email, organization, phone, message, status = 'new' } = req.body;
        
        // Check if partner with same email already exists
        const [existing] = await db.query(
            'SELECT id FROM partners WHERE email = ?',
            [email]
        );
        
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Partner with this email already exists',
                code: 'DUPLICATE_EMAIL'
            });
        }
        
        // Insert new partner
        const [result] = await db.query(
            `INSERT INTO partners (name, email, organization, phone, message, status, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [name, email, organization, phone, message, status]
        );
        
        // Get the created partner
        const [newPartner] = await db.query(
            'SELECT * FROM partners WHERE id = ?',
            [result.insertId]
        );
        
        res.status(201).json({
            success: true,
            message: 'Partner created successfully',
            partner: newPartner[0]
        });
        
    } catch (error) {
        console.error('Error creating partner:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create partner',
            code: 'CREATE_ERROR'
        });
    }
});

// PUT /api/admin/partners/:id - Update partner
router.put('/:id', validatePartner, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
                code: 'VALIDATION_ERROR'
            });
        }
        
        const { id } = req.params;
        const { name, email, organization, phone, message, status } = req.body;
        
        // Check if partner exists
        const [existing] = await db.query(
            'SELECT id FROM partners WHERE id = ?',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Partner not found',
                code: 'PARTNER_NOT_FOUND'
            });
        }
        
        // Check if email is already taken by another partner
        if (email) {
            const [emailCheck] = await db.query(
                'SELECT id FROM partners WHERE email = ? AND id != ?',
                [email, id]
            );
            
            if (emailCheck.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Email is already taken by another partner',
                    code: 'DUPLICATE_EMAIL'
                });
            }
        }
        
        // Update partner
        await db.query(
            `UPDATE partners 
             SET name = ?, email = ?, organization = ?, phone = ?, message = ?, status = ?
             WHERE id = ?`,
            [name, email, organization, phone, message, status, id]
        );
        
        // Get the updated partner
        const [updatedPartner] = await db.query(
            'SELECT * FROM partners WHERE id = ?',
            [id]
        );
        
        res.json({
            success: true,
            message: 'Partner updated successfully',
            partner: updatedPartner[0]
        });
        
    } catch (error) {
        console.error('Error updating partner:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update partner',
            code: 'UPDATE_ERROR'
        });
    }
});

// DELETE /api/admin/partners/:id - Delete partner
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if partner exists
        const [existing] = await db.query(
            'SELECT id FROM partners WHERE id = ?',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Partner not found',
                code: 'PARTNER_NOT_FOUND'
            });
        }
        
        // Delete partner
        await db.query('DELETE FROM partners WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Partner deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting partner:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete partner',
            code: 'DELETE_ERROR'
        });
    }
});

// GET /api/admin/partners/export - Export partners to CSV
router.get('/export', async (req, res) => {
    try {
        // Get all partners
        const [partners] = await db.query(
            'SELECT name, email, organization, phone, message, status, created_at FROM partners ORDER BY created_at DESC'
        );
        
        // Create CSV content
        const csvHeaders = 'Name,Email,Organization,Phone,Message,Status,Created At\n';
        const csvRows = partners.map(partner => {
            return [
                `"${partner.name || ''}"`,
                `"${partner.email || ''}"`,
                `"${partner.organization || ''}"`,
                `"${partner.phone || ''}"`,
                `"${(partner.message || '').replace(/"/g, '""')}"`,
                `"${partner.status || 'new'}"`,
                `"${partner.created_at || ''}"`
            ].join(',');
        }).join('\n');
        
        const csvContent = csvHeaders + csvRows;
        
        // Set response headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="partners-export-${new Date().toISOString().split('T')[0]}.csv"`);
        
        res.send(csvContent);
        
    } catch (error) {
        console.error('Error exporting partners:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export partners',
            code: 'EXPORT_ERROR'
        });
    }
});

// PATCH /api/admin/partners/:id/status - Update partner status only
router.patch('/:id/status', [
    body('status').isIn(['new', 'reviewed', 'approved', 'rejected']).withMessage('Invalid status')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
                code: 'VALIDATION_ERROR'
            });
        }
        
        const { id } = req.params;
        const { status } = req.body;
        
        // Check if partner exists
        const [existing] = await db.query(
            'SELECT id FROM partners WHERE id = ?',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Partner not found',
                code: 'PARTNER_NOT_FOUND'
            });
        }
        
        // Update status only
        await db.query(
            'UPDATE partners SET status = ? WHERE id = ?',
            [status, id]
        );
        
        res.json({
            success: true,
            message: 'Partner status updated successfully',
            status: status
        });
        
    } catch (error) {
        console.error('Error updating partner status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update partner status',
            code: 'STATUS_UPDATE_ERROR'
        });
    }
});

export default router;
