import express from 'express';
import db from '../config/database.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Lightweight admin auth (reuse logic in admin-dashboard.js without importing it)
const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ success: false, message: 'No authentication token' });
        let decoded;
        try { decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key'); }
        catch { return res.status(401).json({ success: false, message: 'Invalid or expired token' }); }
        const [users] = await db.query(`SELECT id, email, role, status FROM users WHERE id = ? AND status = 'active'`, [decoded.id]);
        if (!users.length || users[0].role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
        req.user = { id: users[0].id, email: users[0].email, role: users[0].role };
        next();
    } catch (error) {
        console.error('adminAuth error:', error);
        res.status(500).json({ success: false, message: 'Authentication error' });
    }
};

// GET recent applications
router.get('/applications/recent', adminAuth, async (req, res) => {
    try {
        const [applications] = await db.query(`
            SELECT 
                sa.application_id as id,
                sa.status,
                sa.application_date as created_at,
                s.award_amount as amount,
                sa.full_name as applicant_name,
                sa.email_address as applicant_email,
                s.name as scholarship_title,
                u.id as user_id
            FROM scholarship_applications sa
            LEFT JOIN scholarships s ON sa.scholarship_id = s.id
            LEFT JOIN users u ON LOWER(TRIM(u.email)) = LOWER(TRIM(sa.email_address))
            ORDER BY sa.application_date DESC
            LIMIT 10
        `);
        res.json({ success: true, data: applications });
    } catch (error) {
        console.error('recent applications error:', error);
        res.json({ success: true, data: [] });
    }
});

// GET single application (joined and normalized)
router.get('/applications/:id', adminAuth, async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                sa.application_id as id,
                sa.status,
                sa.application_date as created_at,
                sa.reviewed_at,
                sa.reviewer_notes as notes,
                sa.full_name,
                sa.email_address,
                sa.date_of_birth,
                sa.gender,
                sa.phone_number,
                sa.address,
                sa.preferred_university,
                sa.country,
                sa.academic_level,
                sa.intended_major,
                sa.gpa_academic_performance,
                sa.uploaded_documents_json,
                sa.extracurricular_activities,
                sa.parent_guardian_name,
                sa.parent_guardian_contact,
                sa.financial_need_statement,
                sa.how_heard_about,
                sa.motivation_statement,
                sa.terms_agreed,
                sa.processing_days,
                sa.review_days,
                sa.profile_picture_url,
                s.name as scholarship_title,
                s.award_amount as amount,
                s.id as scholarship_id,
                u.id as user_id
            FROM scholarship_applications sa
            LEFT JOIN scholarships s ON sa.scholarship_id = s.id
            LEFT JOIN users u ON LOWER(TRIM(u.email)) = LOWER(TRIM(sa.email_address))
            WHERE sa.application_id = ?
            LIMIT 1
        `, [req.params.id]);
        if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Application not found' });
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('get application error:', error);
        res.status(500).json({ success: false, message: 'Error fetching application' });
    }
});

// PUT update application status
router.put('/applications/:id/status', adminAuth, async (req, res) => {
    try {
        const { status, reviewer_notes } = req.body || {};
        const allowed = ['pending', 'approved', 'rejected'];
        if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
        await db.query(
            `UPDATE scholarship_applications SET status = ?, reviewer_notes = ?, reviewed_at = CURRENT_TIMESTAMP WHERE application_id = ?`,
            [status, reviewer_notes || null, req.params.id]
        );
        res.json({ message: 'Application status updated', status });
    } catch (error) {
        console.error('update status error:', error);
        res.status(500).json({ message: 'Error updating application status' });
    }
});

// DELETE application
router.delete('/applications/:id', adminAuth, async (req, res) => {
    try {
        const applicationId = req.params.id;
        const [exists] = await db.query('SELECT 1 FROM scholarship_applications WHERE application_id = ? LIMIT 1', [applicationId]);
        if (!exists || exists.length === 0) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        await db.query('DELETE FROM scholarship_applications WHERE application_id = ?', [applicationId]);
        res.json({ success: true, message: 'Application deleted' });
    } catch (error) {
        console.error('delete application error:', error);
        res.status(500).json({ success: false, message: 'Error deleting application' });
    }
});

// POST create application (basic pass-through for multipart handled earlier if any)
router.post('/applications', adminAuth, async (req, res) => {
    try {
        // This is a simplified example; insert fields as needed
        const {
            full_name,
            email_address,
            scholarship_id
        } = req.body || {};
        if (!full_name || !email_address) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const [result] = await db.query(
            `INSERT INTO scholarship_applications (full_name, email_address, scholarship_id, status) VALUES (?,?,?, 'pending')`,
            [full_name, email_address, scholarship_id || null]
        );
        res.json({ success: true, data: { id: result.insertId } });
    } catch (error) {
        console.error('create application error:', error);
        res.status(500).json({ success: false, message: 'Error creating application' });
    }
});

// PUT update application (basic)
router.put('/applications/:id', adminAuth, async (req, res) => {
    try {
        const applicationId = req.params.id;
        const { status, reviewer_notes } = req.body || {};
        await db.query(
            `UPDATE scholarship_applications SET status = COALESCE(?, status), reviewer_notes = COALESCE(?, reviewer_notes) WHERE application_id = ?`,
            [status || null, reviewer_notes || null, applicationId]
        );
        res.json({ success: true, message: 'Application updated' });
    } catch (error) {
        console.error('update application error:', error);
        res.status(500).json({ success: false, message: 'Error updating application' });
    }
});

export default router;


