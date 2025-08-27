import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';
import { bypassAuth } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File upload config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    }
});
const upload = multer({ storage });

// GET current settings
router.get('/', bypassAuth, async (req, res) => {
    try {
        // Ensure maintenance_pages column exists
        try {
            await pool.query("ALTER TABLE general_settings ADD COLUMN maintenance_pages JSON NULL AFTER maintenance_mode");
        } catch (e) { /* ignore if exists */ }
        const [rows] = await pool.query("SELECT * FROM general_settings ORDER BY id DESC LIMIT 1");
        res.json(rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST/UPDATE settings
router.post('/', bypassAuth, upload.fields([{ name: 'logo' }, { name: 'favicon' }]), async (req, res) => {
    try {
        const {
            siteTitle, contactEmail, siteDescription, homepageContent,
            homepageBanner, maintenanceMode,
            facebookLink, twitterLink, instagramLink, services, maintenancePages
        } = req.body;

        // Get the latest settings row
        const [rows] = await pool.query("SELECT * FROM general_settings ORDER BY id DESC LIMIT 1");
        const latest = rows[0];

        // Handle logo and favicon
        let logo = latest?.logo_url || null;
        let favicon = latest?.favicon_url || null;
        if (req.files['logo']?.[0]) {
            logo = req.files['logo'][0].filename;
        }
        if (req.files['favicon']?.[0]) {
            favicon = req.files['favicon'][0].filename;
        }

        const servicesJson = JSON.stringify(JSON.parse(services || '[]'));
        let maintenancePagesJson = null;
        try { maintenancePagesJson = JSON.stringify(JSON.parse(maintenancePages || '[]')); } catch { maintenancePagesJson = latest?.maintenance_pages || null; }

        if (latest) {
            // Update existing row
            const sql = `UPDATE general_settings SET
                site_title=?, contact_email=?, site_description=?, homepage_content=?,
                homepage_banner=?, maintenance_mode=?, maintenance_pages=?,
                facebook_link=?, twitter_link=?, instagram_link=?,
                services=?, logo_url=?, favicon_url=?
                WHERE id=?`;
            const values = [
                siteTitle, contactEmail, siteDescription, homepageContent,
                homepageBanner, maintenanceMode, maintenancePagesJson,
                facebookLink, twitterLink, instagramLink,
                servicesJson, logo, favicon, latest.id
            ];
            await pool.query(sql, values);
        } else {
            // Insert new row
            const sql = `INSERT INTO general_settings (
                site_title, contact_email, site_description, homepage_content,
                homepage_banner, maintenance_mode, maintenance_pages,
                facebook_link, twitter_link, instagram_link,
                services, logo_url, favicon_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const values = [
                siteTitle, contactEmail, siteDescription, homepageContent,
                homepageBanner, maintenanceMode, maintenancePagesJson,
                facebookLink, twitterLink, instagramLink,
                servicesJson, logo, favicon
            ];
            await pool.query(sql, values);
        }
        // Return the updated settings
        const [updatedRows] = await pool.query("SELECT * FROM general_settings ORDER BY id DESC LIMIT 1");
        res.json(updatedRows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
