import express from 'express';
import db from '../config/database.js';
import { auth, bypassAuth } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const router = express.Router();

// Set up multer storage for profile pictures and documents
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest = 'uploads/';
    if (file.fieldname === 'profilePicture') dest += 'profile_pictures/';
    else if (file.fieldname === 'documents') dest += 'documents/';
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Normalize various incoming date formats to 'YYYY-MM-DD' for MySQL DATE columns
function toDateOnly(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    // If already 'YYYY-MM-DD' or starts with it, take first 10 chars
    const m = value.match(/^\d{4}-\d{2}-\d{2}/);
    if (m) return m[0];
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  // Use UTC date portion to avoid TZ shifts
  return d.toISOString().split('T')[0];
}

// Function to update expired scholarships
async function updateExpiredScholarships() {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    
    const [result] = await db.query(
      `UPDATE scholarships 
       SET status = 'expired' 
       WHERE application_deadline < ? 
       AND status = 'active'`,
      [currentDate]
    );

    if (result.affectedRows > 0) {
      console.log(`${result.affectedRows} scholarships marked as expired`);
    }
  } catch (error) {
    console.error('Error updating expired scholarships:', error);
  }
}

// Get scholarships (supports optional pagination, search, and includes application counts)
router.get('/', async (req, res, next) => {
  try {
    await updateExpiredScholarships();

    const pageParam = parseInt(req.query.page, 10);
    const limitParam = parseInt(req.query.limit, 10);
    const hasPagination = !Number.isNaN(pageParam) && !Number.isNaN(limitParam) && pageParam > 0 && limitParam > 0;
    const search = (req.query.search || '').trim();
    const status = (req.query.status || '').trim();
    const academicLevel = (req.query.academic_level || '').trim();
    const scholarshipType = (req.query.scholarship_type || '').trim();
    const sort = (req.query.sort || 'created_at').trim();
    const order = ((req.query.order || 'DESC').toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

    const allowedSort = new Set(['created_at', 'application_deadline', 'award_amount', 'name']);
    const sortColumn = allowedSort.has(sort) ? sort : 'created_at';

    let where = 'WHERE 1=1';
    const params = [];
    if (search) {
      where += ' AND (s.name LIKE ? OR s.description LIKE ? OR s.sponsor LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      where += ' AND s.status = ?';
      params.push(status);
    }
    if (academicLevel) {
      where += ' AND s.academic_level = ?';
      params.push(academicLevel);
    }
    if (scholarshipType) {
      where += ' AND s.scholarship_type = ?';
      params.push(scholarshipType);
    }

    if (!hasPagination) {
      // Legacy response (array), used by other pages
      const [rows] = await db.query(
        `SELECT 
            s.id,
            s.name,
            s.description,
            s.eligibility_criteria,
            s.application_deadline,
            s.award_amount,
            s.is_recurring,
            s.number_of_awards,
            s.academic_level,
            s.field_of_study,
            s.sponsor,
            s.link_to_application,
            s.contact_email,
            s.status,
            s.min_gpa,
            s.documents_required,
            s.scholarship_type,
            s.created_at,
            s.updated_at,
            COALESCE(apps.cnt, 0) AS application_count
         FROM scholarships s
         LEFT JOIN (
           SELECT scholarship_id, COUNT(*) AS cnt FROM scholarship_applications GROUP BY scholarship_id
         ) apps ON apps.scholarship_id = s.id
         ${where}
         ORDER BY s.${sortColumn} ${order}`,
        params
      );
      // Strong caching validators
      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.json(rows);
    }

    const page = Math.min(Math.max(pageParam, 1), 1000000);
    const limit = Math.min(Math.max(limitParam, 1), 100); // hard cap 100 per request
    const offset = (page - 1) * limit;

    // Total count
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM scholarships s ${where}`,
      params
    );
    const total = countRows[0]?.total || 0;

    // Paged items with application counts
    const [items] = await db.query(
      `SELECT 
          s.id,
          s.name,
          s.description,
          s.eligibility_criteria,
          s.application_deadline,
          s.award_amount,
          s.is_recurring,
          s.number_of_awards,
          s.academic_level,
          s.field_of_study,
          s.sponsor,
          s.link_to_application,
          s.contact_email,
          s.status,
          s.min_gpa,
          s.documents_required,
          s.scholarship_type,
          s.created_at,
          s.updated_at,
          COALESCE(apps.cnt, 0) AS application_count
       FROM scholarships s
       LEFT JOIN (
         SELECT scholarship_id, COUNT(*) AS cnt FROM scholarship_applications GROUP BY scholarship_id
       ) apps ON apps.scholarship_id = s.id
       ${where}
       ORDER BY s.${sortColumn} ${order}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.setHeader('Cache-Control', 'public, max-age=30');
    return res.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          perPage: limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    if (res.headersSent) return next(error);
    res.status(500).json({ message: 'Error fetching scholarships' });
  }
});


// Get a single scholarship
router.get('/:id', async (req, res) => {
  try {
    const [scholarships] = await db.query(
        `SELECT *,
         CASE 
           WHEN application_deadline < CURDATE() AND status = 'active' THEN 'expired'
           ELSE status 
         END as status 
         FROM scholarships 
         WHERE id = ?`,
        [req.params.id]
    );

    if (scholarships.length === 0) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    res.json(scholarships[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching scholarship' });
  }
});

// Test endpoint to check authentication
router.get('/test-auth', bypassAuth, (req, res) => {
  res.json({ message: 'Authentication working', user: req.user });
});

// Test endpoint to check database schema
router.get('/test-schema', bypassAuth, async (req, res) => {
  try {
    const [columns] = await db.query('DESCRIBE scholarships');
    res.json({ 
      message: 'Database schema check',
      columns: columns,
      tableExists: true
    });
  } catch (error) {
    console.error('Schema check error:', error);
    res.status(500).json({ 
      message: 'Database schema error', 
      error: error.message 
    });
  }
});

// Test endpoint to check authentication without admin requirement
router.get('/test-auth-basic', auth, (req, res) => {
  console.log('Auth test request from user:', req.user);
  res.json({ 
    message: 'Basic authentication working', 
    user: req.user,
    userId: req.user.id
  });
});

// Removed test endpoint that modified users.role. Admins are tracked in admin_users table.

// Create new scholarship (admin only)
router.post('/', bypassAuth, async (req, res) => {
  try {
    console.log('Received scholarship creation request:', req.body);
    console.log('User making request:', req.user);
    // req.user contains admin-related info from middleware if needed
    
    const { 
      name, 
      description, 
      eligibility_criteria,
      application_deadline, 
      award_amount,
      is_recurring,
      number_of_awards,
      academic_level,
      field_of_study,
      sponsor,
      link_to_application,
      contact_email,
      status,
      min_gpa,
      documents_required,
      scholarship_type
    } = req.body;
    
    // Validate required fields
    if (!name || !description || !eligibility_criteria || !application_deadline || !award_amount || !number_of_awards || !academic_level || !scholarship_type) {
      console.log('Missing required fields:', { name, description, eligibility_criteria, application_deadline, award_amount, number_of_awards, academic_level, scholarship_type });
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Convert data types to match database schema
    const processedData = [
      name,
      description,
      eligibility_criteria,
      toDateOnly(application_deadline),
      parseFloat(award_amount) || 0,
      parseInt(is_recurring) || 0,
      parseInt(number_of_awards) || 1,
      academic_level,
      field_of_study || null,
      sponsor || null,
      link_to_application || null,
      contact_email || null,
      status || 'active',
      min_gpa ? parseFloat(min_gpa) : null,
      documents_required || null,
      scholarship_type
    ];

    console.log('Processed data for insertion:', processedData);

    const [result] = await db.query(
      `INSERT INTO scholarships (
        name, description, eligibility_criteria, application_deadline, award_amount,
        is_recurring, number_of_awards, academic_level, field_of_study, sponsor,
        link_to_application, contact_email, status, min_gpa, documents_required, scholarship_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      processedData
    );

    console.log('Scholarship created successfully with ID:', result.insertId);
    res.status(201).json({ 
      message: 'Scholarship created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating scholarship:', error);
    console.error('Error details:', error.message, error.code, error.sqlMessage);
    res.status(500).json({ message: 'Error creating scholarship', error: error.message });
  }
});


// Update scholarship (admin only)
router.put('/:id', bypassAuth, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      eligibility_criteria,
      application_deadline, 
      award_amount,
      is_recurring,
      number_of_awards,
      academic_level,
      field_of_study,
      sponsor,
      link_to_application,
      contact_email,
      status,
      min_gpa,
      documents_required,
      scholarship_type
    } = req.body;
    
    // Validate required fields similar to create to avoid NOT NULL violations
    if (!name || !description || !eligibility_criteria || !application_deadline || !award_amount || !number_of_awards || !academic_level || !scholarship_type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Ensure we always send a valid status (enum not null)
    let calculatedStatus = status || 'active';
    if (application_deadline) {
      const currentDate = new Date().toISOString().split('T')[0];
      const deadlineDate = new Date(application_deadline).toISOString().split('T')[0];
      
      if (deadlineDate < currentDate) {
        calculatedStatus = 'expired';
      } else if (status === 'expired' && deadlineDate >= currentDate) {
        calculatedStatus = 'active';
      }
    }

    // Convert data types to match database schema
    const processedUpdateData = [
      name,
      description,
      eligibility_criteria,
      toDateOnly(application_deadline),
      parseFloat(award_amount) || 0,
      parseInt(is_recurring) || 0,
      parseInt(number_of_awards) || 1,
      academic_level,
      field_of_study || null,
      sponsor || null,
      link_to_application || null,
      contact_email || null,
      calculatedStatus,
      min_gpa ? parseFloat(min_gpa) : null,
      documents_required || null,
      scholarship_type,
      req.params.id
    ];

    console.log('Processed update data:', processedUpdateData);

    const [result] = await db.query(
      `UPDATE scholarships SET 
        name = ?, 
        description = ?, 
        eligibility_criteria = ?,
        application_deadline = ?, 
        award_amount = ?,
        is_recurring = ?,
        number_of_awards = ?,
        academic_level = ?,
        field_of_study = ?,
        sponsor = ?,
        link_to_application = ?,
        contact_email = ?,
        status = ?,
        min_gpa = ?,
        documents_required = ?,
        scholarship_type = ?
       WHERE id = ?`,
      processedUpdateData
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    const [updatedScholarship] = await db.query(
      `SELECT * FROM scholarships WHERE id = ?`,
      [req.params.id]
    );

    res.json({
      message: 'Scholarship updated successfully',
      scholarship: updatedScholarship[0]
    });
  } catch (error) {
    console.error('Error updating scholarship:', error);
    res.status(500).json({ message: 'Error updating scholarship', error: error?.message });
  }
});


// Delete scholarship (admin only)
router.delete('/:id', bypassAuth, async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM scholarships WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    res.json({ message: 'Scholarship deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting scholarship' });
  }
});

// Apply for scholarship (public submission disabled - use admin dashboard)
router.post('/:id/apply', async (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Public applications are disabled. Please apply via the admin dashboard.'
  });
});

// Check if an email has already applied to a specific scholarship (lightweight)
router.get('/:id/has-applied', async (req, res) => {
  try {
    const scholarshipId = req.params.id;
    const emailRaw = (req.query.email || '').trim();
    if (!emailRaw) {
      return res.status(400).json({ message: 'Email query parameter is required' });
    }
    const [rows] = await db.query(
      `SELECT COUNT(*) AS cnt
       FROM scholarship_applications
       WHERE scholarship_id = ?
         AND LOWER(TRIM(email_address)) = LOWER(TRIM(?))`,
      [scholarshipId, emailRaw]
    );
    const count = rows && rows[0] ? Number(rows[0].cnt) : 0;
    return res.json({ hasApplied: count > 0, count });
  } catch (error) {
    console.error('Error checking has-applied:', error);
    return res.status(500).json({ message: 'Error checking application status' });
  }
});

// Get applications for a scholarship (admin only)
router.get('/:id/applications', bypassAuth, async (req, res) => {
  try {
    const [applications] = await db.query(
      'SELECT * FROM scholarship_applications WHERE scholarship_id = ?',
      [req.params.id]
    );

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

export default router; 
