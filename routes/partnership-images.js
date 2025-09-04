import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Public: Return partnership images (tolerates missing table)
router.get('/', async (_req, res) => {
  try {
    // Try to fetch from a likely table name; if it fails, return empty
    let rows = [];
    try {
      const [r] = await db.query(
        `SELECT id, image_path, image_name, title, description, partner_type, created_at
         FROM partnership_images ORDER BY created_at DESC`
      );
      rows = r || [];
    } catch {
      rows = [];
    }
    res.json({ success: true, images: rows });
  } catch (err) {
    console.error('Fetch partnership images error:', err);
    res.json({ success: true, images: [] });
  }
});

export default router;


