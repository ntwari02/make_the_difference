import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import db from '../config/database.js';
import { authenticateToken, bypassAuth } from '../middleware/auth.js';

const router = express.Router();

// Storage for team photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/team';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safe = String(file.originalname || 'photo').replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `team_${Date.now()}_${safe}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if ((file.mimetype || '').startsWith('image/')) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

// Public: list active members ordered
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, title, bio, email, phone, linkedin, twitter, image_path, display_order FROM team_members WHERE is_active = 1 ORDER BY display_order, created_at DESC'
    );
    res.json({ success: true, team: rows });
  } catch (e) {
    console.error('List team error:', e);
    res.status(500).json({ success: false, error: 'Failed to fetch team' });
  }
});

// Admin: list all
router.get('/all', bypassAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM team_members ORDER BY display_order, created_at DESC');
    res.json({ success: true, team: rows });
  } catch (e) {
    console.error('List all team error:', e);
    res.status(500).json({ success: false, error: 'Failed to fetch team' });
  }
});

// Create
router.post('/', bypassAuth, async (req, res) => {
  try {
    const { name, title, bio, email, phone, linkedin, twitter, display_order, is_active } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Name is required' });
    const [result] = await db.query(
      'INSERT INTO team_members (name, title, bio, email, phone, linkedin, twitter, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, title || null, bio || null, email || null, phone || null, linkedin || null, twitter || null, parseInt(display_order || 0, 10), is_active == null ? 1 : Number(is_active)]
    );
    const [row] = await db.query('SELECT * FROM team_members WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, member: row[0] });
  } catch (e) {
    console.error('Create team error:', e);
    res.status(500).json({ success: false, error: 'Failed to create member' });
  }
});

// Update
router.put('/:id', bypassAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, title, bio, email, phone, linkedin, twitter, display_order, is_active } = req.body;
    const [exist] = await db.query('SELECT * FROM team_members WHERE id = ?', [id]);
    if (!exist.length) return res.status(404).json({ success: false, error: 'Not found' });
    const m = exist[0];
    await db.query(
      'UPDATE team_members SET name=?, title=?, bio=?, email=?, phone=?, linkedin=?, twitter=?, display_order=?, is_active=?, updated_at=NOW() WHERE id=?',
      [name || m.name, title ?? m.title, bio ?? m.bio, email ?? m.email, phone ?? m.phone, linkedin ?? m.linkedin, twitter ?? m.twitter, parseInt(display_order ?? m.display_order, 10), is_active == null ? m.is_active : Number(is_active), id]
    );
    const [row] = await db.query('SELECT * FROM team_members WHERE id = ?', [id]);
    res.json({ success: true, member: row[0] });
  } catch (e) {
    console.error('Update team error:', e);
    res.status(500).json({ success: false, error: 'Failed to update member' });
  }
});

// Delete
router.delete('/:id', bypassAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const [exist] = await db.query('SELECT image_path FROM team_members WHERE id = ?', [id]);
    if (!exist.length) return res.status(404).json({ success: false, error: 'Not found' });
    const img = exist[0].image_path;
    if (img && fs.existsSync(img)) { try { fs.unlinkSync(img); } catch {}
    }
    await db.query('DELETE FROM team_members WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (e) {
    console.error('Delete team error:', e);
    res.status(500).json({ success: false, error: 'Failed to delete member' });
  }
});

// Upload/replace photo
router.post('/:id/photo', bypassAuth, upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ success: false, error: 'No image' });
    const [exist] = await db.query('SELECT image_path FROM team_members WHERE id = ?', [id]);
    if (!exist.length) return res.status(404).json({ success: false, error: 'Not found' });
    const prev = exist[0].image_path;
    if (prev && fs.existsSync(prev)) { try { fs.unlinkSync(prev); } catch {} }
    await db.query('UPDATE team_members SET image_path=?, updated_at=NOW() WHERE id=?', [req.file.path, id]);
    res.json({ success: true, image_path: req.file.path });
  } catch (e) {
    console.error('Upload team photo error:', e);
    res.status(500).json({ success: false, error: 'Failed to upload photo' });
  }
});

export default router;


