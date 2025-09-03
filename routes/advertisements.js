import express from 'express';
import pool from '../config/database.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = express.Router();
// Ensure weight column exists for weighted selection
async function ensureWeightColumn() {
    try {
        const [cols] = await pool.execute(
            "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'advertisements' AND COLUMN_NAME = 'weight'"
        );
        if (!Array.isArray(cols) || cols.length === 0) {
            await pool.execute("ALTER TABLE advertisements ADD COLUMN weight TINYINT NOT NULL DEFAULT 1 CHECK (weight BETWEEN 0 AND 5) AFTER is_active");
        }
    } catch (e) {
        // Non-fatal: if fails, continue without weight
        console.warn('ensureWeightColumn failed or already exists:', e && (e.sqlMessage || e.message));
    }
}


// Ensure uploads directory exists for advertisements
const adsUploadDir = path.resolve('uploads/ads');
if (!fs.existsSync(adsUploadDir)) {
    fs.mkdirSync(adsUploadDir, { recursive: true });
}

// Multer storage for advertisement images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, adsUploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const safeName = (file.originalname || 'image.png').replace(/[^a-zA-Z0-9_.-]/g, '_');
        cb(null, uniqueSuffix + '-' + safeName);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Upload endpoint for images (used by cropped or selected files)
router.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image provided' });
        }
        const relativePath = `uploads/ads/${req.file.filename}`.replace(/\\/g, '/');
        return res.json({ success: true, url: relativePath });
    } catch (error) {
        console.error('Error uploading advertisement image:', error);
        return res.status(500).json({ success: false, message: 'Failed to upload image' });
    }
});

// Upload endpoint for videos (optional, larger limit)
const uploadVideo = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

router.post('/upload-video', uploadVideo.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No video provided' });
        }
        const relativePath = `uploads/ads/${req.file.filename}`.replace(/\\/g, '/');
        return res.json({ success: true, url: relativePath });
    } catch (error) {
        console.error('Error uploading advertisement video:', error);
        return res.status(500).json({ success: false, message: 'Failed to upload video' });
    }
});

// Get active advertisement
router.get('/active', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM advertisements WHERE is_active = 1 AND start_date <= NOW() AND end_date >= NOW() ORDER BY created_at DESC LIMIT 1'
        );
        
        if (rows.length === 0) {
            return res.json({ 
                success: false, 
                message: 'No active advertisement found',
                advertisement: null 
            });
        }
        
        res.json({ 
            success: true, 
            advertisement: rows[0] 
        });
    } catch (error) {
        console.error('Error fetching active advertisement:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Get all advertisements (admin)
router.get('/', async (req, res) => {
    try {
        await ensureWeightColumn();
        const [rows] = await pool.execute('SELECT * FROM advertisements ORDER BY created_at DESC');
        
        res.json({ 
            success: true, 
            advertisements: rows 
        });
    } catch (error) {
        console.error('Error fetching advertisements:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Create new advertisement (admin)
router.post('/', async (req, res) => {
    try {
        await ensureWeightColumn();
        const { title, description, image_url, video_url, link_url, start_date, end_date, is_active, weight } = req.body;
        
        const [result] = await pool.execute(
            'INSERT INTO advertisements (title, description, image_url, video_url, link_url, start_date, end_date, is_active, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, description, image_url, video_url, link_url, start_date, end_date, is_active || 0, Math.max(0, Math.min(5, Number.isFinite(Number(weight)) ? Number(weight) : 1))]
        );
        
        res.json({ 
            success: true, 
            message: 'Advertisement created successfully',
            id: result.insertId 
        });
    } catch (error) {
        console.error('Error creating advertisement:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Update advertisement (admin)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await ensureWeightColumn();
        const { title, description, image_url, video_url, link_url, start_date, end_date, is_active, weight } = req.body;
        
        const params = [title, description, image_url, video_url, link_url, start_date, end_date, is_active, id];
        let sql = 'UPDATE advertisements SET title = ?, description = ?, image_url = ?, video_url = ?, link_url = ?, start_date = ?, end_date = ?, is_active = ?';
        if (weight !== undefined) {
            const w = Math.max(0, Math.min(5, Number.isFinite(Number(weight)) ? Number(weight) : 1));
            sql += ', weight = ' + w;
        }
        sql += ', updated_at = NOW() WHERE id = ?';
        const [result] = await pool.execute(sql, params);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Advertisement not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Advertisement updated successfully' 
        });
    } catch (error) {
        console.error('Error updating advertisement:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Delete advertisement (admin)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.execute(
            'DELETE FROM advertisements WHERE id = ?',
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Advertisement not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Advertisement deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting advertisement:', error);
        res.status(500).json({ 
            success: false, 
            message: error && (error.message || error.sqlMessage) ? (error.sqlMessage || error.message) : 'Internal server error' 
        });
    }
});

// Toggle advertisement status (admin)
router.patch('/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.execute(
            'UPDATE advertisements SET is_active = NOT is_active, updated_at = NOW() WHERE id = ?',
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Advertisement not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Advertisement status toggled successfully' 
        });
    } catch (error) {
        console.error('Error toggling advertisement status:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Weighted random active advertisement
router.get('/random', async (req, res, next) => {
    try {
        await ensureWeightColumn();
        const [rows] = await pool.execute(
            'SELECT * FROM advertisements WHERE is_active = 1 AND start_date <= NOW() AND end_date >= NOW() AND (weight IS NULL OR weight >= 0)'
        );
        if (!rows || rows.length === 0) {
            return res.json({ success: false, advertisement: null });
        }
        // Build weighted pool
        const poolList = [];
        for (const ad of rows) {
            const w = Math.max(0, Number(ad.weight ?? 1)) || 1;
            if (w === 0) continue;
            poolList.push({ ad, w });
        }
        if (poolList.length === 0) {
            return res.json({ success: false, advertisement: null });
        }
        const totalW = poolList.reduce((s, x) => s + x.w, 0);
        let r = Math.random() * totalW;
        let selected = poolList[0].ad;
        for (const item of poolList) {
            if ((r -= item.w) <= 0) { selected = item.ad; break; }
        }
        return res.json({ success: true, advertisement: selected });
    } catch (error) {
        console.error('Error fetching random advertisement:', error);
        if (res.headersSent) return next(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Track advertisement view/click
router.post('/track-view', async (req, res) => {
    try {
        const { advertisement_id, action, user_profile, ab_test_variant } = req.body;
        
        // Log the action with additional data
        console.log(`Advertisement ${advertisement_id} ${action} tracked`);
        if (user_profile) {
            console.log('User profile:', user_profile);
        }
        if (ab_test_variant) {
            console.log('A/B Test variant:', ab_test_variant);
        }
        
        res.json({ 
            success: true, 
            message: 'Advertisement action tracked successfully' 
        });
    } catch (error) {
        console.error('Error tracking advertisement action:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Analytics endpoint
router.post('/analytics', async (req, res) => {
    try {
        const { advertisement_id, action, timestamp, user_agent, referrer, engagementTime } = req.body;
        
        // Log analytics data
        console.log(`Analytics: Ad ${advertisement_id} - ${action}`);
        console.log(`Timestamp: ${new Date(timestamp).toISOString()}`);
        console.log(`User Agent: ${user_agent}`);
        console.log(`Referrer: ${referrer}`);
        if (engagementTime) {
            console.log(`Engagement Time: ${engagementTime}ms`);
        }
        
        res.json({ 
            success: true, 
            message: 'Analytics data recorded successfully' 
        });
    } catch (error) {
        console.error('Error recording analytics:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// User preferences endpoint
router.post('/preferences', async (req, res) => {
    try {
        const { interests, behavior, preferences } = req.body;
        
        // Log user preferences
        console.log('User preferences updated:');
        if (interests) console.log('Interests:', interests);
        if (behavior) console.log('Behavior:', behavior);
        if (preferences) console.log('Preferences:', preferences);
        
        res.json({ 
            success: true, 
            message: 'User preferences updated successfully' 
        });
    } catch (error) {
        console.error('Error updating user preferences:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Targeting endpoint
router.post('/targeting', async (req, res) => {
    try {
        const { deviceType, browser, timeOfDay, dayOfWeek } = req.body;
        
        // Log targeting data
        console.log('Targeting data:');
        console.log(`Device: ${deviceType}`);
        console.log(`Browser: ${browser}`);
        console.log(`Time of Day: ${timeOfDay}`);
        console.log(`Day of Week: ${dayOfWeek}`);
        
        res.json({ 
            success: true, 
            message: 'Targeting data recorded successfully' 
        });
    } catch (error) {
        console.error('Error recording targeting data:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Get advertisement statistics (admin)
router.get('/stats', async (req, res) => {
    try {
        const [totalAds] = await pool.execute('SELECT COUNT(*) as total FROM advertisements');
        const [activeAds] = await pool.execute('SELECT COUNT(*) as active FROM advertisements WHERE is_active = 1');
        const [expiredAds] = await pool.execute('SELECT COUNT(*) as expired FROM advertisements WHERE end_date < NOW()');
        
        res.json({
            success: true,
            stats: {
                total: totalAds[0].total,
                active: activeAds[0].active,
                expired: expiredAds[0].expired
            }
        });
    } catch (error) {
        console.error('Error fetching advertisement stats:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

export default router;
