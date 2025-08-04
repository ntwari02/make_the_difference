import express from 'express';
import db from '../config/database.js';
import { auth, adminAuth } from '../middleware/auth.js';
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

// Get all scholarships (for public and admin use)
router.get('/', async (req, res) => {
    try {
        await updateExpiredScholarships();
        const [scholarships] = await db.query(`
            SELECT 
                id, 
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
                scholarship_type,
                created_at,
                updated_at
            FROM scholarships
        `);
        res.json(scholarships);
    } catch (error) {
        console.error('Error fetching scholarships:', error);
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
router.get('/test-auth', adminAuth, (req, res) => {
  res.json({ message: 'Authentication working', user: req.user });
});

// Test endpoint to check database schema
router.get('/test-schema', adminAuth, async (req, res) => {
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
    role: req.user.role,
    userId: req.user.id
  });
});

// Endpoint to update user role to admin (for testing purposes)
router.post('/make-admin', auth, async (req, res) => {
  try {
    const [result] = await db.query('UPDATE users SET role = ? WHERE id = ?', ['admin', req.user.id]);
    console.log('Updated user role to admin for user ID:', req.user.id);
    res.json({ message: 'User role updated to admin successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Error updating user role' });
  }
});

// Create new scholarship (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    console.log('Received scholarship creation request:', req.body);
    console.log('User making request:', req.user);
    console.log('User role:', req.user.role);
    
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
      application_deadline,
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
router.put('/:id', adminAuth, async (req, res) => {
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
    
    let calculatedStatus = status;
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
      application_deadline || null,
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
    res.status(500).json({ message: 'Error updating scholarship' });
  }
});


// Delete scholarship (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
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

// Apply for scholarship
router.post('/:id/apply', upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'documents', maxCount: 10 }
]), async (req, res) => {
  try {
    const scholarship_id = req.params.id;
    const {
      fullName, emailAddress, dateOfBirth, gender, phoneNumber, address,
      preferredUniversity, country, academicLevel, intendedMajor, gpaAcademicPerformance,
      extracurricularActivities, parentGuardianName, parentGuardianContact,
      financialNeedStatement, howHeardAbout, motivationStatement, termsAgreed
    } = req.body;

    if (!fullName || !emailAddress || !dateOfBirth) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const [existingApplications] = await db.query(
      'SELECT * FROM scholarship_applications WHERE scholarship_id = ? AND email_address = ?',
      [scholarship_id, emailAddress]
    );
    if (existingApplications.length > 0) {
      return res.status(400).json({ message: 'You have already applied for this scholarship' });
    }

    let profilePictureUrl = null;
    if (req.files['profilePicture'] && req.files['profilePicture'][0]) {
      profilePictureUrl = req.files['profilePicture'][0].path.replace(/\\/g, '/');
    }
    let uploadedDocuments = [];
    if (req.files['documents']) {
      uploadedDocuments = req.files['documents'].map(file => file.path.replace(/\\/g, '/'));
    }

    const [result] = await db.query(
      `INSERT INTO scholarship_applications (
        profile_picture_url, full_name, email_address, date_of_birth, gender, phone_number, address,
        preferred_university, country, academic_level, intended_major, gpa_academic_performance,
        uploaded_documents_json, extracurricular_activities, parent_guardian_name, parent_guardian_contact,
        financial_need_statement, how_heard_about, scholarship_id, motivation_statement, terms_agreed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        profilePictureUrl, fullName, emailAddress, dateOfBirth, gender, phoneNumber, address,
        preferredUniversity, country, academicLevel, intendedMajor, gpaAcademicPerformance,
        JSON.stringify(uploadedDocuments), extracurricularActivities, parentGuardianName, parentGuardianContact,
        financialNeedStatement, howHeardAbout, scholarship_id, motivationStatement, 
        termsAgreed === 'on' || termsAgreed === true || termsAgreed === 'true' ? 1 : 0
      ]
    );

    res.status(201).json({
      message: 'Application submitted successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Get applications for a scholarship (admin only)
router.get('/:id/applications', adminAuth, async (req, res) => {
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