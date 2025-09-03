import express from 'express';
import db from '../config/database.js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = express.Router();

router.use(helmet());
router.use(hpp());

const adminRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
router.use(adminRateLimit);

// Admin JWT auth (same pattern as admin-partners)
const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;
    if (!token) return res.status(401).json({ success:false, message:'No authentication token', code:'NO_TOKEN' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const [users] = await db.query(`
      SELECT u.id, u.role, u.status, au.is_active as admin_active
      FROM users u LEFT JOIN admin_users au ON u.id = au.user_id
      WHERE u.id = ? AND u.status = 'active'`, [decoded.id]);
    if (users.length === 0) return res.status(401).json({ success:false, message:'User not found or inactive', code:'USER_INACTIVE' });
    const u = users[0];
    const isAdmin = (u.role && String(u.role).toLowerCase().includes('admin')) || u.admin_active === 1;
    if (!isAdmin) return res.status(403).json({ success:false, message:'Admin privileges required', code:'INSUFFICIENT_PRIVILEGES' });
    req.user = { id: u.id };
    next();
  } catch (e) {
    return res.status(401).json({ success:false, message:'Invalid or expired token', code:'INVALID_TOKEN' });
  }
};

router.use(adminAuth);

// Upload setup
const servicesDir = path.resolve('uploads/services');
try { if (!fs.existsSync(servicesDir)) fs.mkdirSync(servicesDir, { recursive: true }); } catch {}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, servicesDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}-${file.originalname.replace(/\s+/g,'_')}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// List services with basic pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '50', 10);
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    let where = 'WHERE 1=1';
    const params = [];
    if (search) { where += ' AND (name LIKE ? OR description LIKE ?)'; params.push(`%${search}%`,`%${search}%`); }
    const [countRows] = await db.query(`SELECT COUNT(*) as total FROM services ${where}`, params);
    const total = countRows[0]?.total || 0;
    const [rows] = await db.query(`SELECT id, name, description, image_url, created_at FROM services ${where} ORDER BY id DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
    res.json({ success:true, services: rows, pagination: { page, limit, total, pages: Math.ceil(total/limit) } });
  } catch (e) {
    console.error('List services error', e);
    res.status(500).json({ success:false, message:'Failed to fetch services' });
  }
});

// Stats for cards
router.get('/stats', async (req, res) => {
  try {
    const [totalRows] = await db.query('SELECT COUNT(*) as total FROM services');
    const total = totalRows[0]?.total || 0;

    const [withImgRows] = await db.query("SELECT COUNT(*) as cnt FROM services WHERE image_url IS NOT NULL AND image_url != ''");
    const withImages = withImgRows[0]?.cnt || 0;

    const [avgLenRows] = await db.query('SELECT AVG(CHAR_LENGTH(IFNULL(description, ""))) as avgLen FROM services');
    const avgDescLen = Math.round(avgLenRows[0]?.avgLen || 0);

    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1; // MySQL MONTH is 1-12
    const lastY = m === 1 ? y - 1 : y;
    const lastM = m === 1 ? 12 : m - 1;

    const [monthlyRows] = await db.query('SELECT COUNT(*) as cnt FROM services WHERE YEAR(created_at)=? AND MONTH(created_at)=?', [y, m]);
    const monthly = monthlyRows[0]?.cnt || 0;
    const [prevRows] = await db.query('SELECT COUNT(*) as cnt FROM services WHERE YEAR(created_at)=? AND MONTH(created_at)=?', [lastY, lastM]);
    const prevMonthly = prevRows[0]?.cnt || 0;
    const growth = prevMonthly > 0 ? Math.round(((monthly - prevMonthly) / prevMonthly) * 100) : 0;

    res.json({ success:true, total, withImages, avgDescLen, monthly, prevMonthly, growth });
  } catch (e) {
    console.error('Services stats error', e);
    res.status(500).json({ success:false, message:'Failed to fetch stats' });
  }
});

// Get service by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success:false, message:'Service not found' });
    res.json({ success:true, service: rows[0] });
  } catch (e) {
    res.status(500).json({ success:false, message:'Failed to fetch service' });
  }
});

// Create service
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, image_url } = req.body;
    let finalImage = image_url || null;
    if (req.file) finalImage = `uploads/services/${req.file.filename}`.replace(/\\/g,'/');
    if (!name || !description || !finalImage) return res.status(400).json({ success:false, message:'Name, description, and image are required' });
    const [result] = await db.query('INSERT INTO services (name, description, image_url, created_at) VALUES (?, ?, ?, NOW())', [name, description, finalImage]);
    res.status(201).json({ success:true, id: result.insertId });
  } catch (e) {
    console.error('Create service error', e);
    res.status(500).json({ success:false, message:'Failed to create service' });
  }
});

// Update service
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, image_url } = req.body;
    const [rows] = await db.query('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success:false, message:'Service not found' });
    let finalImage = image_url || rows[0].image_url;
    if (req.file) finalImage = `uploads/services/${req.file.filename}`.replace(/\\/g,'/');
    await db.query('UPDATE services SET name = ?, description = ?, image_url = ? WHERE id = ?', [name || rows[0].name, description || rows[0].description, finalImage, req.params.id]);
    res.json({ success:true, message:'Service updated' });
  } catch (e) {
    console.error('Update service error', e);
    res.status(500).json({ success:false, message:'Failed to update service' });
  }
});

// Delete service
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM services WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success:false, message:'Service not found' });
    res.json({ success:true, message:'Service deleted' });
  } catch (e) {
    console.error('Delete service error', e);
    res.status(500).json({ success:false, message:'Failed to delete service' });
  }
});

// Upload image utility endpoint
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success:false, message:'No image provided' });
    const rel = `uploads/services/${req.file.filename}`.replace(/\\/g,'/');
    res.json({ success:true, url: rel });
  } catch (e) {
    res.status(500).json({ success:false, message:'Failed to upload image' });
  }
});

export default router;


