import express from 'express';
import db from '../config/database.js';
import { bypassAuth } from '../middleware/auth.js';
import multer from 'multer';
import nodemailer from 'nodemailer';

// Accept any multipart form (fields + optional files) but we ignore files
const anyForm = multer({ storage: multer.memoryStorage() }).any();

// Optional mailer (only active if SMTP env vars are configured)
function getMailer() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;
    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: String(SMTP_SECURE || '').toLowerCase() === 'true',
        auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
    return transporter;
}

async function sendSuitabilityEmail({ to, name, scholarship, score }) {
    const transporter = getMailer();
    if (!transporter || !to) return;
    const firstName = (name || '').split(' ')[0] || 'Applicant';
    const subj = `Your scholarship application match score: ${score}%`;
    const text = `Hello ${firstName},\n\n` +
        `Thank you for applying${scholarship ? ` to ${scholarship}` : ''}. ` +
        `Based on your submission, your current match score is ${score}%.` +
        `\n\nThis score is an estimate and not a decision. You can improve it by ensuring your documents are complete and your information matches the scholarship requirements.\n\n` +
        `Regards,\nAdmissions Team`;
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject: subj,
            text
        });
    } catch (e) {
        console.warn('Failed to send suitability email:', e?.message || e);
    }
}

// Helper: Build insert columns/values covering all NOT NULL columns without defaults
async function buildInsertForRequiredColumns(tableName, body){
    const dbName = process.env.DB_NAME || process.env.MYSQL_DATABASE || process.env.DB_DATABASE;
    const [cols] = await db.query(
        `SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
           AND IS_NULLABLE = 'NO' AND COLUMN_DEFAULT IS NULL
           AND COLUMN_NAME NOT IN ('id','created_at','updated_at')`,
        [dbName, tableName]
    );
    const columns = [];
    const values = [];
    const placeholders = [];

    const provideDefault = (col) => {
        const key = col.COLUMN_NAME;
        if (Object.prototype.hasOwnProperty.call(body, key)) {
            const incoming = body[key];
            const isEmptyString = typeof incoming === 'string' && incoming.trim() === '';
            if (incoming !== undefined && incoming !== null && !isEmptyString) {
                return incoming;
            }
        }
        const dataType = String(col.DATA_TYPE || '').toLowerCase();
        const columnType = String(col.COLUMN_TYPE || '').toLowerCase();
        if (dataType === 'date') return '2000-01-01';
        if (dataType === 'datetime' || dataType === 'timestamp') return new Date();
        if (dataType === 'int' || dataType === 'bigint' || dataType === 'smallint' || dataType === 'mediumint' || dataType === 'tinyint') return 0;
        if (dataType === 'decimal' || dataType === 'float' || dataType === 'double') return 0;
        if (dataType === 'enum') {
            const m = columnType.match(/enum\((.*)\)/);
            if (m && m[1]) {
                const first = m[1].split(',')[0];
                return first.replace(/^'|"|`/, '').replace(/'|"|`$/, '');
            }
            return '';
        }
        // default string
        return '';
    };

    for (const col of cols) {
        columns.push(col.COLUMN_NAME);
        values.push(provideDefault(col));
        placeholders.push('?');
    }

    return { columns, values, placeholders };
}
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

// Multer in-memory storage for CSV bulk uploads
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Utility: robust CSV line splitter supporting quotes
function splitCsvLine(line) {
    const cells = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === ',' && !inQuotes) {
            cells.push(current);
            current = '';
        } else {
            current += ch;
        }
    }
    cells.push(current);
    return cells.map(v => v.trim());
}

// POST bulk upload applications (admin only)
router.post('/applications/bulk-upload', adminAuth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Optional override: apply all rows to this scholarship ID (selected by admin in UI)
        const scholarshipIdOverrideRaw = (req.body && req.body.scholarship_id ? String(req.body.scholarship_id) : '').trim();
        let scholarshipIdOverride = null;
        if (scholarshipIdOverrideRaw) {
            const idNum = Number(scholarshipIdOverrideRaw);
            if (!Number.isInteger(idNum)) {
                return res.status(400).json({ success: false, message: 'Invalid scholarship selection' });
            }
            const [exists] = await db.query('SELECT id FROM scholarships WHERE id = ? LIMIT 1', [idNum]);
            if (!exists || !exists.length) {
                return res.status(400).json({ success: false, message: 'Selected scholarship does not exist' });
            }
            scholarshipIdOverride = idNum;
        }

        const text = req.file.buffer.toString('utf8');
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        if (lines.length < 2) {
            return res.status(400).json({ success: false, message: 'CSV must include a header and at least one data row' });
        }

        const headers = splitCsvLine(lines[0]).map(h => h.trim());
        const headerIndex = Object.fromEntries(headers.map((h, idx) => [h.toLowerCase(), idx]));

        function getVal(cells, key, fallback = null) {
            const idx = headerIndex[key.toLowerCase()];
            if (idx === undefined) return fallback;
            const raw = (cells[idx] || '').trim();
            return raw === '' ? fallback : raw;
        }

        const required = scholarshipIdOverride
            ? ['full_name', 'email_address', 'date_of_birth']
            : ['full_name', 'email_address', 'scholarship_id', 'date_of_birth'];
        const missingRequired = required.filter(r => !(r.toLowerCase() in headerIndex));
        if (missingRequired.length) {
            return res.status(400).json({ success: false, message: `CSV missing required headers: ${missingRequired.join(', ')}` });
        }

        const results = { inserted: 0, duplicates: 0, errors: 0, rows: [] };

        // Preload scholarship constraints and current application counts
        const scholarshipMap = new Map(); // id -> row
        const currentCounts = new Map(); // id -> count
        const batchSeen = new Set(); // key: `${id}|${email}` to prevent duplicates within CSV
        const batchInsertedCounts = new Map(); // id -> count inserted in this batch

        async function loadScholarship(id) {
            if (scholarshipMap.has(id)) return scholarshipMap.get(id);
            const [rows] = await db.query(
                `SELECT id, academic_level, min_gpa, number_of_awards, status, application_deadline
                 FROM scholarships WHERE id = ? LIMIT 1`,
                [id]
            );
            const row = rows && rows[0] ? rows[0] : null;
            scholarshipMap.set(id, row);
            return row;
        }

        async function loadCountsFor(ids) {
            if (!ids.length) return;
            const [rows] = await db.query(
                `SELECT scholarship_id, COUNT(*) AS cnt
                 FROM scholarship_applications
                 WHERE scholarship_id IN (${ids.map(()=>'?').join(',')})
                 GROUP BY scholarship_id`,
                ids
            );
            rows.forEach(r => currentCounts.set(Number(r.scholarship_id), Number(r.cnt)));
        }

        if (scholarshipIdOverride) {
            await loadScholarship(scholarshipIdOverride);
            await loadCountsFor([scholarshipIdOverride]);
        } else {
            // Collect scholarship ids referenced in CSV
            const ids = new Set();
            for (let rowNum = 1; rowNum < lines.length; rowNum++) {
                const cells = splitCsvLine(lines[rowNum]);
                const raw = (cells[(headerIndex['scholarship_id'])]||'').trim();
                const n = Number(raw);
                if (Number.isInteger(n)) ids.add(n);
            }
            const idArr = Array.from(ids);
            await loadCountsFor(idArr);
            for (const id of idArr) { // cache scholarship rows
                await loadScholarship(id);
            }
        }

        // Process rows sequentially to keep logic simple
        for (let rowNum = 1; rowNum < lines.length; rowNum++) {
            const line = lines[rowNum];
            const cells = splitCsvLine(line);
            try {
                const full_name = getVal(cells, 'full_name');
                const email_address = getVal(cells, 'email_address');
                let scholarship_id = scholarshipIdOverride ?? getVal(cells, 'scholarship_id');
                let date_of_birth = getVal(cells, 'date_of_birth');

                const rowData = {
                    full_name,
                    email_address,
                    scholarship_id: scholarship_id,
                    date_of_birth,
                    gender: getVal(cells, 'gender'),
                    phone_number: getVal(cells, 'phone_number'),
                    address: getVal(cells, 'address'),
                    preferred_university: getVal(cells, 'preferred_university'),
                    country: getVal(cells, 'country'),
                    academic_level: getVal(cells, 'academic_level'),
                    intended_major: getVal(cells, 'intended_major'),
                    gpa_academic_performance: getVal(cells, 'gpa_academic_performance'),
                    extracurricular_activities: getVal(cells, 'extracurricular_activities'),
                    parent_guardian_name: getVal(cells, 'parent_guardian_name'),
                    parent_guardian_contact: getVal(cells, 'parent_guardian_contact'),
                    financial_need_statement: getVal(cells, 'financial_need_statement'),
                    how_heard_about: getVal(cells, 'how_heard_about'),
                    motivation_statement: getVal(cells, 'motivation_statement'),
                    terms_agreed: getVal(cells, 'terms_agreed')
                };

                if (!full_name || !email_address || !scholarship_id || !date_of_birth) {
                    results.errors++;
                    results.rows.push({ row: rowNum + 1, status: 'error', message: 'Missing required field(s)', email: email_address || undefined, scholarship_id: scholarship_id || undefined, data: rowData });
                    continue;
                }

                // Normalize scholarship_id to integer
                scholarship_id = Number(scholarship_id);
                if (!Number.isInteger(scholarship_id)) {
                    results.errors++;
                    results.rows.push({ row: rowNum + 1, status: 'error', message: 'Invalid scholarship_id (must be integer or selected in UI)', email: email_address, scholarship_id, data: rowData });
                    continue;
                }

                // Normalize date format to YYYY-MM-DD
                try {
                    const d = new Date(date_of_birth);
                    if (isNaN(d.getTime())) throw new Error('Invalid date');
                    date_of_birth = d.toISOString().split('T')[0];
                } catch {
                    results.errors++;
                    results.rows.push({ row: rowNum + 1, status: 'error', message: 'Invalid date_of_birth', email: email_address, scholarship_id, data: rowData });
                    continue;
                }

                // Duplicate check per scholarship + email (normalized)
                const batchKey = `${scholarship_id}|${String(email_address).toLowerCase().trim()}`;
                if (batchSeen.has(batchKey)) {
                    results.duplicates++;
                    results.rows.push({ row: rowNum + 1, status: 'duplicate', email: email_address, scholarship_id });
                    continue;
                }
                const [dup] = await db.query(
                    `SELECT 1 FROM scholarship_applications WHERE scholarship_id = ? AND LOWER(TRIM(email_address)) = LOWER(TRIM(?)) LIMIT 1`,
                    [scholarship_id, email_address]
                );
                if (dup && dup.length) {
                    results.duplicates++;
                    results.rows.push({ row: rowNum + 1, status: 'duplicate', email: email_address, scholarship_id });
                    continue;
                }

                // Optional fields (must be defined before constraints validation)
                const gender = getVal(cells, 'gender');
                const phone_number = getVal(cells, 'phone_number');
                const address = getVal(cells, 'address');
                const preferred_university = getVal(cells, 'preferred_university');
                const country = getVal(cells, 'country');
                const academic_level = getVal(cells, 'academic_level');
                const intended_major = getVal(cells, 'intended_major');
                const gpa_academic_performance = getVal(cells, 'gpa_academic_performance');
                const extracurricular_activities = getVal(cells, 'extracurricular_activities');
                const parent_guardian_name = getVal(cells, 'parent_guardian_name');
                const parent_guardian_contact = getVal(cells, 'parent_guardian_contact');
                const financial_need_statement = getVal(cells, 'financial_need_statement');
                const how_heard_about = getVal(cells, 'how_heard_about');
                const motivation_statement = getVal(cells, 'motivation_statement');
                const terms_agreed_raw = getVal(cells, 'terms_agreed');
                const terms_agreed = (String(terms_agreed_raw).toLowerCase() === 'true' || terms_agreed_raw === '1') ? 1 : 0;

                // Scholarship constraints validation
                const sch = await loadScholarship(scholarship_id);
                if (!sch) {
                    results.errors++;
                    results.rows.push({ row: rowNum + 1, status: 'error', email: email_address, scholarship_id, message: 'Scholarship not found', data: rowData });
                    continue;
                }
                // Status and deadline
                const today = new Date().toISOString().split('T')[0];
                if (sch.status !== 'active') {
                    results.errors++;
                    results.rows.push({ row: rowNum + 1, status: 'error', email: email_address, scholarship_id, message: 'Scholarship not active', data: rowData });
                    continue;
                }
                if (sch.application_deadline && sch.application_deadline < today) {
                    results.errors++;
                    results.rows.push({ row: rowNum + 1, status: 'error', email: email_address, scholarship_id, message: 'Scholarship deadline passed', data: rowData });
                    continue;
                }
                // Academic level match (if provided in row). If scholarship requires 'other', accept any.
                if (
                    academic_level && sch.academic_level &&
                    String(sch.academic_level).toLowerCase() !== 'other' &&
                    String(academic_level).toLowerCase() !== String(sch.academic_level).toLowerCase()
                ) {
                    results.errors++;
                    results.rows.push({ row: rowNum + 1, status: 'error', email: email_address, scholarship_id, message: 'Academic level does not meet requirement', data: rowData });
                    continue;
                }
                // GPA check
                const minGpa = sch.min_gpa == null ? null : Number(sch.min_gpa);
                const rowGpa = gpa_academic_performance == null || gpa_academic_performance === '' ? null : Number(gpa_academic_performance);
                if (minGpa != null) {
                    if (rowGpa == null || isNaN(rowGpa) || rowGpa < minGpa) {
                        results.errors++;
                        results.rows.push({ row: rowNum + 1, status: 'error', email: email_address, scholarship_id, message: `GPA below minimum (${minGpa})`, data: rowData });
                        continue;
                    }
                }
                // Capacity check
                const cap = sch.number_of_awards == null ? null : Number(sch.number_of_awards);
                if (cap != null && cap > 0) {
                    const used = (currentCounts.get(scholarship_id) || 0) + (batchInsertedCounts.get(scholarship_id) || 0);
                    if (used >= cap) {
                        results.errors++;
                        results.rows.push({ row: rowNum + 1, status: 'error', email: email_address, scholarship_id, message: 'Scholarship capacity reached', data: rowData });
                        continue;
                    }
                }

                // Insert row (no profile picture, no documents from bulk) => defaults to null
                await db.query(
                    `INSERT INTO scholarship_applications (
                        profile_picture_url, full_name, email_address, date_of_birth, gender, phone_number, address,
                        preferred_university, country, academic_level, intended_major, gpa_academic_performance,
                        uploaded_documents_json, extracurricular_activities, parent_guardian_name, parent_guardian_contact,
                        financial_need_statement, how_heard_about, scholarship_id, motivation_statement, terms_agreed
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        null, full_name, email_address, date_of_birth, gender || null, phone_number || null, address || null,
                        preferred_university || null, country || null, academic_level || null, intended_major || null, gpa_academic_performance || null,
                        null, extracurricular_activities || null, parent_guardian_name || null, parent_guardian_contact || null,
                        financial_need_statement || null, how_heard_about || null, scholarship_id, motivation_statement || null, terms_agreed
                    ]
                );

                results.inserted++;
                results.rows.push({ row: rowNum + 1, status: 'inserted', email: email_address, scholarship_id });
                batchSeen.add(batchKey);
                batchInsertedCounts.set(scholarship_id, (batchInsertedCounts.get(scholarship_id) || 0) + 1);
            } catch (err) {
                console.error('Bulk upload row error:', err);
                results.errors++;
                results.rows.push({ row: rowNum + 1, status: 'error', message: err.message || 'Unknown error' });
            }
        }

        if (!res.headersSent) {
        return res.json({ success: true, summary: results });
        } else {
            return; // response already sent by an upstream guard; avoid double-send
        }
    } catch (error) {
        console.error('Bulk upload error:', error);
        if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Error processing bulk upload' });
        }
    }
});

// Bulk delete duplicates by scholarship_id + email (admin only)
router.post('/applications/bulk-delete-duplicates', adminAuth, async (req, res) => {
    try {
        const items = Array.isArray(req.body && req.body.items) ? req.body.items : [];
        if (!items.length) {
            return res.status(400).json({ success: false, message: 'No items provided' });
        }
        let deleted = 0;
        for (const it of items) {
            const scholarship_id = it && it.scholarship_id;
            const email_address = it && it.email_address;
            if (!scholarship_id || !email_address) continue;
            const [result] = await db.query(
                `DELETE FROM scholarship_applications 
                 WHERE scholarship_id = ? 
                   AND LOWER(TRIM(email_address)) = LOWER(TRIM(?))`,
                [scholarship_id, email_address]
            );
            deleted += Number(result.affectedRows || 0);
        }
        return res.json({ success: true, deleted });
    } catch (error) {
        console.error('bulk-delete-duplicates error:', error);
        res.status(500).json({ success: false, message: 'Error deleting duplicates' });
    }
});

// Expand scholarship capacity (number_of_awards) by an increment
router.post('/scholarships/:id/expand-capacity', adminAuth, async (req, res) => {
    try {
        const id = Number(req.params.id);
        const add = Number((req.body && (req.body.add ?? req.body.increment)) || 0);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid scholarship id' });
        }
        if (!Number.isInteger(add) || add <= 0) {
            return res.status(400).json({ success: false, message: 'Increment must be a positive integer' });
        }
        const [exists] = await db.query('SELECT id, number_of_awards FROM scholarships WHERE id = ? LIMIT 1', [id]);
        if (!exists || !exists.length) {
            return res.status(404).json({ success: false, message: 'Scholarship not found' });
        }
        await db.query('UPDATE scholarships SET number_of_awards = number_of_awards + ? WHERE id = ?', [add, id]);
        const [updated] = await db.query('SELECT id, number_of_awards FROM scholarships WHERE id = ? LIMIT 1', [id]);
        return res.json({ success: true, scholarship: updated && updated[0] ? updated[0] : { id, number_of_awards: (exists[0].number_of_awards || 0) + add } });
    } catch (error) {
        console.error('expand-capacity error:', error);
        res.status(500).json({ success: false, message: 'Error expanding capacity' });
    }
});

// GET all applications (paginated)
router.get('/applications', adminAuth, async (req, res) => {
    try {
        const page = Math.min(Math.max(parseInt(req.query.page) || 1, 1), 1000000);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 200); // cap at 200
        const offset = (page - 1) * limit;
        const status = req.query.status || '';
        const search = req.query.search || '';

        let whereClause = '1=1';
        let params = [];

        if (status) {
            whereClause += ' AND sa.status = ?';
            params.push(status);
        }

        if (search) {
            whereClause += ' AND (sa.full_name LIKE ? OR sa.email_address LIKE ? OR s.name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Get total count
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total FROM scholarship_applications sa 
             LEFT JOIN scholarships s ON sa.scholarship_id = s.id 
             WHERE ${whereClause}`,
            params
        );

        // Get applications with pagination
        const [applications] = await db.query(`
            SELECT 
                sa.application_id as id,
                sa.status,
                sa.application_date as created_at,
                s.award_amount as amount,
                sa.full_name as applicant_name,
                sa.email_address as applicant_email,
                s.name as scholarship_title,
                u.id as user_id,
                sa.academic_level,
                sa.country,
                sa.intended_major,
                sa.gpa_academic_performance,
                sa.uploaded_documents_json,
                sa.motivation_statement,
                s.academic_level as sch_academic_level,
                s.min_gpa as sch_min_gpa,
                s.field_of_study as sch_field_of_study,
                s.documents_required as sch_documents_required
            FROM scholarship_applications sa
            LEFT JOIN scholarships s ON sa.scholarship_id = s.id
            LEFT JOIN users u ON LOWER(TRIM(u.email)) = LOWER(TRIM(sa.email_address))
            WHERE ${whereClause}
            ORDER BY sa.application_date DESC
            LIMIT ? OFFSET ?
        `, [...params, limit, offset]);

        // Compute suitability on the fly for list view
        function computeSuitability(row) {
            let total = 0;
            // Academic level (20)
            const appLevel = (row.academic_level||'').toString().toLowerCase();
            const schLevel = (row.sch_academic_level||'').toString().toLowerCase();
            total += appLevel && schLevel && appLevel === schLevel ? 20 : 0;
            // GPA (25)
            const gpaStr = (row.gpa_academic_performance||'').toString();
            const gpaMatch = gpaStr.match(/([0-9]+(?:\.[0-9]+)?)/);
            const gpa = gpaMatch ? parseFloat(gpaMatch[1]) : null;
            const minGpa = row.sch_min_gpa != null ? parseFloat(row.sch_min_gpa) : null;
            if (minGpa != null) {
                if (gpa != null) {
                    if (gpa >= minGpa) total += 25; else if (gpa >= minGpa - 0.3) total += 12;
                }
            }
            // Field of study (20)
            const major = (row.intended_major||'').toString().toLowerCase();
            const schField = (row.sch_field_of_study||'').toString().toLowerCase();
            if (schField) {
                total += (major.includes(schField) || schField.includes(major)) ? 20 : 0;
            }
            // Country (10)
            // If scholarship has country in s.sponsor, we don't have it here; skip or award partial if provided
            total += row.country ? 5 : 0;
            // Documents (10)
            let docsPts = 0;
            try {
                const uploaded = JSON.parse(row.uploaded_documents_json||'[]');
                docsPts = Array.isArray(uploaded) && uploaded.length > 0 ? 10 : 0;
            } catch {}
            total += docsPts;
            // Motivation + extracurricular omitted here (no extra fields)
            return Math.max(0, Math.min(100, Math.round(total)));
        }

        const withSuitability = applications.map(a => ({ ...a, suitability_percent: computeSuitability(a) }));

        res.setHeader('Cache-Control', 'private, max-age=15');
        res.json({ 
            success: true, 
            data: withSuitability,
            pagination: {
                page,
                limit,
                total: countResult[0].total,
                pages: Math.ceil(countResult[0].total / limit)
            }
        });
    } catch (error) {
        console.error('get applications error:', error);
        res.status(500).json({ success: false, message: 'Error fetching applications' });
    }
});

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
router.post('/applications', anyForm, bypassAuth, async (req, res) => {
    try {
        // This is a simplified example; insert fields as needed
        const {
            full_name,
            email_address,
            scholarship_id,
            date_of_birth
        } = req.body || {};
        // Normalize common aliases from client forms, with heuristics
        const body = req.body || {};
        const pickFirst = (keys) => {
            for (const k of keys) {
                if (Object.prototype.hasOwnProperty.call(body, k) && body[k] !== undefined && body[k] !== null && String(body[k]).trim() !== '') {
                    return body[k];
                }
            }
            return undefined;
        };
        const tryInferEmail = () => {
            for (const [k, v] of Object.entries(body)) {
                if (!v) continue;
                const val = String(v).trim();
                if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return val;
                if (/email/i.test(k) && val) return val;
            }
            return undefined;
        };
        const tryInferName = () => {
            const nameCandidate = pickFirst(['name','fullName','full_name','applicant_name','applicantName','firstName','first_name']);
            if (nameCandidate) return nameCandidate;
            for (const [k, v] of Object.entries(body)) {
                if (/name/i.test(k) && v) return v;
            }
            return undefined;
        };
        const tryInferPhone = () => pickFirst(['phone_number','phone','phoneNumber','tel','mobile','contact_phone']);
        const tryInferDob = () => pickFirst(['date_of_birth','dob','birthdate','birth_date']);
        const tryInferUniversity = () => pickFirst(['university','university_name','school','college','institution']);
        const tryInferCountry = () => pickFirst(['country','country_of_residence','nationality','residence_country']);

        // Normalize all potential fields from the admin form (accept camelCase and snake_case)
        const pickVal = (...keys) => {
            for (const k of keys) {
                if (Object.prototype.hasOwnProperty.call(body, k)) return body[k];
            }
            return undefined;
        };
        const normalized = {
            full_name: full_name || pickVal('full_name','fullName') || tryInferName(),
            email_address: email_address || pickVal('email_address','emailAddress') || tryInferEmail(),
            phone_number: pickVal('phone_number','phone','phoneNumber') || tryInferPhone(),
            date_of_birth: date_of_birth || pickVal('date_of_birth','dateOfBirth') || tryInferDob(),
            gender: pickVal('gender'),
            address: pickVal('address'),
            preferred_university: pickVal('preferred_university','preferredUniversity') || tryInferUniversity(),
            country: pickVal('country') || tryInferCountry(),
            academic_level: pickVal('academic_level','academicLevel'),
            intended_major: pickVal('intended_major','intendedMajor'),
            gpa_academic_performance: pickVal('gpa_academic_performance','gpaAcademicPerformance'),
            extracurricular_activities: pickVal('extracurricular_activities','extracurricularActivities'),
            parent_guardian_name: pickVal('parent_guardian_name','parentGuardianName'),
            parent_guardian_contact: pickVal('parent_guardian_contact','parentGuardianContact'),
            financial_need_statement: pickVal('financial_need_statement','financialNeedStatement'),
            how_heard_about: pickVal('how_heard_about','howHeardAbout'),
            motivation_statement: pickVal('motivation_statement','motivationStatement'),
            terms_agreed: pickVal('terms_agreed','termsAgreed'),
            scholarship_id: scholarship_id || pickVal('scholarship_id')
        };
        // Relaxed: allow minimal submissions by synthesizing defaults if missing
        const safeName = (normalized.full_name && String(normalized.full_name).trim()) || 'Anonymous Applicant';
        const safeEmail = (normalized.email_address && String(normalized.email_address).trim()) || 'unknown@example.com';
        const safeDob = (normalized.date_of_birth && String(normalized.date_of_birth).trim()) || '2000-01-01';

        // Start with known fields
        const baseColumns = ['full_name','email_address','scholarship_id','date_of_birth','status'];
        const baseValues = [safeName, safeEmail, normalized.scholarship_id || null, safeDob, 'pending'];
        const basePlaceholders = ['?','?','?','?','?'];

        // Add any other NOT NULL columns without defaults
        const schemaInsert = await buildInsertForRequiredColumns('scholarship_applications', normalized);
        for (let i = 0; i < schemaInsert.columns.length; i++) {
            const col = schemaInsert.columns[i];
            // avoid duplicates of base columns
            if (!baseColumns.includes(col)) {
                baseColumns.push(col);
                baseValues.push(schemaInsert.values[i]);
                basePlaceholders.push('?');
            }
        }

        // Also include any optional fields provided in the request body
        const optionalFieldMap = [
            'gender','phone_number','address','preferred_university','country','academic_level','intended_major',
            'gpa_academic_performance','extracurricular_activities','parent_guardian_name','parent_guardian_contact',
            'financial_need_statement','how_heard_about','motivation_statement','terms_agreed'
        ];
        optionalFieldMap.forEach((col) => {
            const val = normalized[col];
            if (val !== undefined && !baseColumns.includes(col)) {
                baseColumns.push(col);
                // Normalize checkbox-like terms_agreed
                if (col === 'terms_agreed') {
                    const on = (val === 'on' || val === true || val === 'true' || String(val) === '1') ? 1 : 0;
                    baseValues.push(on);
                } else {
                    baseValues.push(val === '' ? null : val);
                }
                basePlaceholders.push('?');
            }
        });

        const sql = `INSERT INTO scholarship_applications (${baseColumns.join(', ')}) VALUES (${basePlaceholders.join(', ')})`;
        const [result] = await db.query(sql, baseValues);

        // Compute a suitability percentage based on scholarship requirements, if possible
        let suitability = null;
        let breakdown = null;
        let scholarshipName = null;
        try {
            let sid = normalized.scholarship_id;
            // Fallback: infer scholarship_id by preferred_university name if not provided
            if (!sid && normalized.preferred_university) {
                const [byName] = await db.query('SELECT id FROM scholarships WHERE name = ? LIMIT 1', [normalized.preferred_university]);
                if (byName && byName[0]) sid = byName[0].id;
            }
            if (sid) {
                const [schRows] = await db.query('SELECT id, country, academic_level, field_of_study, min_gpa FROM scholarships WHERE id = ? LIMIT 1', [sid]);
                if (schRows && schRows[0]) {
                    const sch = schRows[0];
                    const parts = [];
                    let total = 0;

                    // Academic level match (20)
                    let levelPts = 0;
                    if (normalized.academic_level && sch.academic_level) {
                        levelPts = String(normalized.academic_level).toLowerCase() === String(sch.academic_level).toLowerCase() ? 20 : 0;
                    } else {
                        levelPts = 10; // partial if unknown
                    }
                    parts.push({ key: 'academic_level', points: levelPts }); total += levelPts;

                    // GPA match (25)
                    let gpaPts = 0;
                    const minGpa = sch.min_gpa != null ? Number(sch.min_gpa) : null;
                    const applicantGpa = normalized.gpa_academic_performance != null ? Number(String(normalized.gpa_academic_performance).replace(/[^0-9.]/g,'')) : null;
                    if (minGpa != null && applicantGpa != null && !Number.isNaN(applicantGpa)) {
                        if (applicantGpa >= minGpa) gpaPts = 25; else if (applicantGpa >= minGpa - 0.2) gpaPts = 15; else if (applicantGpa >= minGpa - 0.5) gpaPts = 8;
                    } else {
                        gpaPts = 10; // partial when missing
                    }
                    parts.push({ key: 'gpa', points: gpaPts }); total += gpaPts;

                    // Field of study / intended major match (20)
                    let fieldPts = 0;
                    if (sch.field_of_study) {
                        const field = String(sch.field_of_study).toLowerCase();
                        const major = (normalized.intended_major || '').toString().toLowerCase();
                        if (major && (major.includes(field) || field.includes(major))) fieldPts = 20;
                    } else {
                        fieldPts = 10;
                    }
                    parts.push({ key: 'field_of_study', points: fieldPts }); total += fieldPts;

                    // Country match (10)
                    let countryPts = 0;
                    if (sch.country && normalized.country) {
                        countryPts = String(sch.country).toLowerCase() === String(normalized.country).toLowerCase() ? 10 : 0;
                    } else {
                        countryPts = 5;
                    }
                    parts.push({ key: 'country', points: countryPts }); total += countryPts;

                    // Documentation provided (10)
                    let docsPts = 0;
                    try {
                        const files = req.files && (req.files.documents || req.files.uploaded_documents_json);
                        const hasDocs = (Array.isArray(files) && files.length > 0) || (normalized.uploaded_documents_json && String(normalized.uploaded_documents_json).length > 0);
                        docsPts = hasDocs ? 10 : 0;
                    } catch { docsPts = 0; }
                    parts.push({ key: 'documents', points: docsPts }); total += docsPts;

                    // Motivation + extracurriculars quality (15 split)
                    const motivationLen = (normalized.motivation_statement || '').toString().length;
                    const extraLen = (normalized.extracurricular_activities || '').toString().length;
                    const motPts = motivationLen >= 150 ? 10 : motivationLen >= 60 ? 6 : motivationLen > 0 ? 3 : 0;
                    const extPts = extraLen >= 80 ? 5 : extraLen >= 20 ? 3 : extraLen > 0 ? 2 : 0;
                    parts.push({ key: 'motivation', points: motPts }); total += motPts;
                    parts.push({ key: 'extracurricular', points: extPts }); total += extPts;

                    suitability = Math.max(0, Math.min(100, Math.round(total)));
                    breakdown = parts;
                }
            }
        } catch {}

        // Try to load scholarship name for email context
        try {
            if (!scholarshipName && normalized.scholarship_id) {
                const [rows] = await db.query('SELECT name FROM scholarships WHERE id = ?', [normalized.scholarship_id]);
                scholarshipName = rows && rows[0] ? rows[0].name : null;
            }
        } catch {}

        // Optionally email the applicant their score
        if (typeof suitability === 'number' && normalized.email_address) {
            sendSuitabilityEmail({
                to: String(normalized.email_address).trim(),
                name: normalized.full_name,
                scholarship: scholarshipName,
                score: suitability
            });
        }

        res.json({ success: true, data: { id: result.insertId, suitability_percent: suitability, suitability_breakdown: breakdown } });
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

// PUT update applicant details (name, email, phone, dob, university, country, address, gender)
router.put('/applications/:id/details', adminAuth, async (req, res) => {
    try {
        const applicationId = req.params.id;
        const body = req.body || {};
        const allowed = {
            full_name: 'full_name',
            email_address: 'email_address',
            phone_number: 'phone_number',
            date_of_birth: 'date_of_birth',
            preferred_university: 'preferred_university',
            country: 'country',
            address: 'address',
            gender: 'gender',
            academic_level: 'academic_level',
            intended_major: 'intended_major',
            gpa_academic_performance: 'gpa_academic_performance',
            extracurricular_activities: 'extracurricular_activities',
            parent_guardian_name: 'parent_guardian_name',
            parent_guardian_contact: 'parent_guardian_contact',
            financial_need_statement: 'financial_need_statement',
            how_heard_about: 'how_heard_about',
            motivation_statement: 'motivation_statement',
            terms_agreed: 'terms_agreed'
        };
        const sets = [];
        const params = [];
        Object.entries(allowed).forEach(([key, col]) => {
            if (Object.prototype.hasOwnProperty.call(body, key)) {
                const val = body[key];
                // Normalize empty strings to null for optional columns
                const normalized = (val === '' || val === undefined) ? null : val;
                sets.push(`${col} = ?`);
                params.push(normalized);
            }
        });
        if (!sets.length) {
            return res.status(400).json({ success: false, message: 'No editable fields provided' });
        }
        params.push(applicationId);
        await db.query(`UPDATE scholarship_applications SET ${sets.join(', ')} WHERE application_id = ?`, params);
        const [row] = await db.query(`SELECT application_id as id, full_name, email_address, phone_number, date_of_birth, preferred_university, country, address, gender, academic_level, intended_major, gpa_academic_performance, extracurricular_activities, parent_guardian_name, parent_guardian_contact, financial_need_statement, how_heard_about, motivation_statement, terms_agreed FROM scholarship_applications WHERE application_id = ? LIMIT 1`, [applicationId]);
        return res.json({ success: true, data: row && row[0] ? row[0] : { id: applicationId } });
    } catch (error) {
        console.error('update applicant details error:', error);
        res.status(500).json({ success: false, message: 'Error updating applicant details' });
    }
});

export default router;


