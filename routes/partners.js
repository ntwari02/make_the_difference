import express from 'express';
import db from '../config/database.js';

const router = express.Router();

function inferPartnerType(partner) {
  const explicit = String(partner.partner_type || '').toLowerCase();
  if (explicit) return explicit;
  const haystack = `${partner.organization || ''} ${partner.name || ''} ${partner.message || ''}`.toLowerCase();
  const has = (...k) => k.some(x => haystack.includes(x));
  if (has('university','college','institute','school','academy','polytechnic')) return 'academic';
  if (has('ministry','department','authority','agency','gov','government','council')) return 'government';
  if (has('ngo','non-profit','nonprofit','foundation','charity','association','society')) return 'nonprofit';
  if (has('ltd','inc','corp','company','enterprise','holdings','plc','co.','corporate')) return 'corporate';
  return 'individual';
}

// Public: Submit partnership inquiry
router.post('/', async (req, res) => {
  try {
    const { name, email, organization, phone, message } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }
    // Prevent duplicate by email (soft rule)
    const [existing] = await db.query('SELECT id FROM partners WHERE email = ? LIMIT 1', [email]);
    if (existing && existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Partner with this email already exists' });
    }
    await db.query(
      `INSERT INTO partners (name, email, organization, phone, message, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'new', NOW())`,
      [name, email, organization || null, phone || null, message || null]
    );
    res.status(201).json({ success: true, message: 'Inquiry received' });
  } catch (err) {
    console.error('Public partner create error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit inquiry' });
  }
});

// Public: Approved partners (flat list)
router.get('/approved', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, email, organization, phone, message, status, created_at, profile_picture
       FROM partners WHERE status = 'approved' ORDER BY created_at DESC`
    );
    res.json({ success: true, partners: rows });
  } catch (err) {
    console.error('Fetch approved partners error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch partners' });
  }
});

// Public: Approved partners grouped by inferred type
router.get('/types/approved', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, email, organization, phone, message, status, created_at, profile_picture, partner_type
       FROM partners WHERE status = 'approved' ORDER BY created_at DESC`
    );
    const groups = {};
    for (const p of rows) {
      const key = inferPartnerType(p);
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    }
    res.json({ success: true, groups });
  } catch (err) {
    console.error('Fetch grouped partners error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch partner groups' });
  }
});

export default router;


