import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Ensure table exists
async function ensureTable() {
  await db.query(`CREATE TABLE IF NOT EXISTS services_monetization (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    pricing_type ENUM('free','one_time','subscription') NOT NULL DEFAULT 'free',
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_automated TINYINT(1) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_service (service_id),
    INDEX idx_service_id (service_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
}

router.get('/', async (req,res) => {
  try {
    await ensureTable();
    const [rows] = await db.query('SELECT * FROM services_monetization');
    res.json(rows);
  } catch (e) {
    console.error(e); res.status(500).json({ message: 'Error fetching monetization' });
  }
});

router.post('/', async (req,res) => {
  try {
    await ensureTable();
    const { service_id, pricing_type, price, is_automated } = req.body;
    if (!service_id) return res.status(400).json({ message: 'service_id required' });
    const _pricing = ['free','one_time','subscription'].includes(pricing_type) ? pricing_type : 'free';
    const _price = Number(price || 0);
    const _auto = is_automated ? 1 : 0;
    await db.query(
      `INSERT INTO services_monetization (service_id, pricing_type, price, is_automated)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE pricing_type=VALUES(pricing_type), price=VALUES(price), is_automated=VALUES(is_automated)`,
      [service_id, _pricing, _price, _auto]
    );
    res.json({ message: 'Saved' });
  } catch (e) {
    console.error(e); res.status(500).json({ message: 'Error saving monetization' });
  }
});

export default router;


