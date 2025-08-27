import express from 'express';
import db from '../config/database.js';
import { auth, bypassAuth } from '../middleware/auth.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
const router = express.Router();

// Ensure 'status' column exists on partners table (adds if missing)
async function ensureStatusColumn() {
  try {
    const [cols] = await db.query("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'partners' AND COLUMN_NAME = 'status'");
    if (!Array.isArray(cols) || cols.length === 0) {
      try {
        await db.query("ALTER TABLE partners ADD COLUMN status ENUM('pending','approved','rejected') DEFAULT 'pending'");
      } catch (e) {
        // Ignore if concurrent add or insufficient privileges; fallback handled elsewhere
      }
    }
  } catch {}
}

// Ensure 'profile_picture' column exists on partners table
async function ensureProfilePictureColumn(){
  try {
    const [cols] = await db.query("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'partners' AND COLUMN_NAME = 'profile_picture'");
    if (!Array.isArray(cols) || cols.length === 0) {
      try {
        await db.query("ALTER TABLE partners ADD COLUMN profile_picture VARCHAR(500) NULL AFTER phone");
      } catch (e) { /* ignore concurrent attempts */ }
    }
  } catch {}
}

// Ensure 'partner_type' column exists on partners table
async function ensurePartnerTypeColumn(){
  try {
    const [cols] = await db.query("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'partners' AND COLUMN_NAME = 'partner_type'");
    if (!Array.isArray(cols) || cols.length === 0) {
      try {
        await db.query("ALTER TABLE partners ADD COLUMN partner_type ENUM('corporate','academic','government','nonprofit','individual') NULL AFTER status");
      } catch (e) { /* ignore concurrent attempts */ }
    }
  } catch {}
}

// Multer storage for partner profile pictures
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/partner-profiles';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safe = String(file.originalname || 'profile').replace(/[^a-zA-Z0-9_.-]/g,'_');
    cb(null, `partner_${Date.now()}_${safe}`);
  }
});
const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if ((file.mimetype||'').startsWith('image/')) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

// Get all partners
router.get('/', async (req, res) => {
  try {
    await ensureStatusColumn();
    const [partners] = await db.query('SELECT * FROM partners');
    res.json(partners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching partners' });
  }
});

// Get approved partners (public)
router.get('/approved', async (req, res) => {
  try {
    await ensureStatusColumn();
    const [partners] = await db.query("SELECT * FROM partners WHERE status = 'approved' ORDER BY id DESC");
    res.json({ success: true, partners });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching approved partners' });
  }
});

// Get approved partners grouped by inferred type
router.get('/types/approved', async (req, res) => {
  try {
    await ensureStatusColumn();
    await ensurePartnerTypeColumn();
    const [rows] = await db.query("SELECT id, name, organization, email, phone, message, status, partner_type, profile_picture, created_at FROM partners WHERE status = 'approved'");

    const toKey = (p) => {
      if (p.partner_type) return p.partner_type;
      const hay = `${p.organization || ''} ${p.name || ''} ${p.message || ''}`.toLowerCase();
      const has = (arr) => arr.some(k => hay.includes(k));
      if (has(['university','college','institute','school','academy','polytechnic'])) return 'academic';
      if (has(['ministry','department','authority','agency','gov','government','council'])) return 'government';
      if (has(['ngo','non-profit','nonprofit','foundation','charity','association','society'])) return 'nonprofit';
      if (has(['ltd','inc','corp','company','enterprise','holdings','plc','co.','corporate'])) return 'corporate';
      return 'individual';
    };

    const groups = { corporate: [], academic: [], government: [], nonprofit: [], individual: [] };
    for (const p of rows) {
      groups[toKey(p)].push(p);
    }

    // Limit per group if requested
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 50);
    const sliced = Object.fromEntries(Object.entries(groups).map(([k,v]) => [k, v.slice(0, limit)]));

    res.json({ success: true, groups: sliced, total: rows.length });
  } catch (error) {
    console.error('Error grouping partners by type:', error);
    res.status(500).json({ message: 'Error grouping partners' });
  }
});

// Submit partnership request
router.post('/', async (req, res) => {
  try {
    const { name, email, organization, phone, message } = req.body;

    const [result] = await db.query(
      'INSERT INTO partners (name, email, organization, phone, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, organization, phone, message]
    );

    res.status(201).json({
      message: 'Partnership request submitted successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error submitting partnership request' });
  }
});

// Get partner details (admin only)
router.get('/:id', bypassAuth, async (req, res) => {
  try {
    await ensureStatusColumn();
    const [partners] = await db.query(
      'SELECT * FROM partners WHERE id = ?',
      [req.params.id]
    );

    if (partners.length === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    res.json(partners[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching partner details' });
  }
});

// Update partner (admin only)
router.put('/:id', bypassAuth, async (req, res) => {
  try {
    const { name, email, organization, phone, message, status, partnerType } = req.body;
    await ensureStatusColumn();
    if (partnerType) await ensurePartnerTypeColumn();
    const [currentRows] = await db.query('SELECT * FROM partners WHERE id = ?', [req.params.id]);
    if (currentRows.length === 0) return res.status(404).json({ message: 'Partner not found' });
    const c = currentRows[0];
    const upd = {
      name: name || c.name,
      email: email || c.email,
      organization: organization || c.organization,
      phone: phone || c.phone,
      message: message || c.message,
      status: status || c.status || 'pending',
      partner_type: partnerType || c.partner_type || null
    };
    try {
      await db.query('UPDATE partners SET name=?, email=?, organization=?, phone=?, message=?, status=?, partner_type=? WHERE id=?',
        [upd.name, upd.email, upd.organization, upd.phone, upd.message, upd.status, upd.partner_type, req.params.id]);
    } catch (e) {
      if (e && e.code === 'ER_BAD_FIELD_ERROR') {
        // Fallback when status or partner_type column doesn't exist
        await db.query('UPDATE partners SET name=?, email=?, organization=?, phone=?, message=?, status=? WHERE id=?',
          [upd.name, upd.email, upd.organization, upd.phone, upd.message, upd.status, req.params.id]);
      } else {
        throw e;
      }
    }
    res.json({ message: 'Partner updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating partner' });
  }
});

// Upload/update partner profile picture (admin)
router.post('/:id/profile-picture', bypassAuth, uploadProfile.single('image'), async (req, res) => {
  try {
    const partnerId = req.params.id;
    await ensureProfilePictureColumn();
    const [rows] = await db.query('SELECT profile_picture FROM partners WHERE id = ?', [partnerId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Partner not found' });
    const prev = rows[0].profile_picture;
    const newPath = req.file?.path;
    if (!newPath) return res.status(400).json({ message: 'No image uploaded' });

    // Remove previous file if exists and different
    if (prev && prev !== newPath && fs.existsSync(prev)) {
      try { fs.unlinkSync(prev); } catch {}
    }

    await db.query('UPDATE partners SET profile_picture = ? WHERE id = ?', [newPath, partnerId]);
    res.json({ success: true, profile_picture: newPath });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ message: 'Failed to upload profile picture' });
  }
});

// Delete partner (admin only)
router.delete('/:id', bypassAuth, async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM partners WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    res.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting partner' });
  }
});

// Get all testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const [testimonials] = await db.query('SELECT * FROM testimonials');
    res.json(testimonials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching testimonials' });
  }
});

// Add testimonial (admin only)
router.post('/testimonials', bypassAuth, async (req, res) => {
  try {
    const { partner_id, name, image_url, testimonial } = req.body;

    const [result] = await db.query(
      'INSERT INTO testimonials (partner_id, name, image_url, testimonial) VALUES (?, ?, ?, ?)',
      [partner_id, name, image_url, testimonial]
    );

    res.status(201).json({
      message: 'Testimonial added successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding testimonial' });
  }
});

// Update testimonial (admin only)
router.put('/testimonials/:id', bypassAuth, async (req, res) => {
  try {
    const { name, image_url, testimonial } = req.body;

    const [result] = await db.query(
      'UPDATE testimonials SET name = ?, image_url = ?, testimonial = ? WHERE id = ?',
      [name, image_url, testimonial, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.json({ message: 'Testimonial updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating testimonial' });
  }
});

// Delete testimonial (admin only)
router.delete('/testimonials/:id', bypassAuth, async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM testimonials WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting testimonial' });
  }
});

export default router; 
