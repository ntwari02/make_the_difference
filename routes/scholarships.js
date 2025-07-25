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
    
    const [result] = await db.promise().query(
      `UPDATE scholarships 
       SET status = 'expired' 
       WHERE deadline_date < ? 
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
        const [scholarships] = await db.promise().query(`
            SELECT 
                id, 
                name, 
                description, 
                type, 
                deadline_date, 
                status
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
    const [scholarships] = await db.promise().query(
        `SELECT *,
         CASE 
           WHEN deadline_date < CURDATE() AND status = 'active' THEN 'expired'
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

// Create new scholarship (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, description, type, deadline_date, university, country } = req.body;
    
    const [result] = await db.promise().query(
      'INSERT INTO scholarships (name, description, type, deadline_date, university, country) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, type, deadline_date, university, country]
    );

    res.status(201).json({ 
      message: 'Scholarship created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating scholarship:', error);
    res.status(500).json({ message: 'Error creating scholarship' });
  }
});


// Update scholarship (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, description, type, deadline_date, status } = req.body;
    
    let calculatedStatus = status;
    if (deadline_date) {
      const currentDate = new Date().toISOString().split('T')[0];
      const deadlineDate = new Date(deadline_date).toISOString().split('T')[0];
      
      if (deadlineDate < currentDate) {
        calculatedStatus = 'expired';
      } else if (status === 'expired' && deadlineDate >= currentDate) {
        calculatedStatus = 'active';
      }
    }

    const [result] = await db.promise().query(
      `UPDATE scholarships SET 
        name = ?, 
        description = ?, 
        type = ?, 
        deadline_date = ?, 
        status = ? 
       WHERE id = ?`,
      [name, description, type, deadline_date || null, calculatedStatus, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    const [updatedScholarship] = await db.promise().query(
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
    const [result] = await db.promise().query(
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

    const [existingApplications] = await db.promise().query(
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

    const [result] = await db.promise().query(
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
    const [applications] = await db.promise().query(
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