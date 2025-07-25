import express from 'express';
import db from '../config/database.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get applications for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const [applications] = await db.promise().query(
      `SELECT sa.*, s.name as scholarship_name 
       FROM scholarship_applications sa
       JOIN scholarships s ON sa.scholarship_id = s.id
       WHERE sa.email_address = ?`,
      [req.user.email]
    );
    res.json(applications);
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

// Get dashboard statistics for the logged-in user
router.get('/stats', auth, async (req, res) => {
  try {
    // Get total applications for the user
    const [applicationsCount] = await db.promise().query(
      'SELECT COUNT(*) as count FROM scholarship_applications WHERE email_address = ?',
      [req.user.email]
    );

    // Get total available scholarships (not expired)
    const [scholarshipsCount] = await db.promise().query(
      "SELECT COUNT(*) as count FROM scholarships WHERE status = 'active' AND (deadline_date IS NULL OR deadline_date >= CURDATE())"
    );

    res.json({
      applications: applicationsCount[0].count,
      scholarships: scholarshipsCount[0].count
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Error fetching user stats' });
  }
});

// Get a single application for the logged-in user
router.get('/:id', auth, async (req, res) => {
  try {
    const [applications] = await db.promise().query(
      `SELECT sa.*, s.name as scholarship_name 
       FROM scholarship_applications sa
       JOIN scholarships s ON sa.scholarship_id = s.id
       WHERE sa.application_id = ? AND sa.email_address = ?`,
      [req.params.id, req.user.email]
    );
    if (applications.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(applications[0]);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ message: 'Error fetching application' });
  }
});

// Update an application for the logged-in user
router.put('/:id', auth, async (req, res) => {
  try {
    const applicationId = req.params.id;
    // Only allow update if the application belongs to the user
    const [existing] = await db.promise().query(
      'SELECT * FROM scholarship_applications WHERE application_id = ? AND email_address = ?',
      [applicationId, req.user.email]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Application not found or not authorized' });
    }
    // Map camelCase body fields to snake_case DB fields
    const {
      fullName, dateOfBirth, gender, phoneNumber, address,
      preferredUniversity, country, academicLevel, intendedMajor, gpaAcademicPerformance,
      extracurricularActivities, parentGuardianName, parentGuardianContact,
      financialNeedStatement, howHeardAbout, motivationStatement, termsAgreed
    } = req.body;
    // Validate required fields
    if (!fullName || !dateOfBirth || !gender || !phoneNumber || !address || !academicLevel || !termsAgreed) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    // Update application
    const [result] = await db.promise().query(
      `UPDATE scholarship_applications SET 
        full_name = ?, date_of_birth = ?, gender = ?, phone_number = ?, address = ?,
        preferred_university = ?, country = ?, academic_level = ?, intended_major = ?, gpa_academic_performance = ?,
        extracurricular_activities = ?, parent_guardian_name = ?, parent_guardian_contact = ?,
        financial_need_statement = ?, how_heard_about = ?, motivation_statement = ?, terms_agreed = ?
      WHERE application_id = ? AND email_address = ?`,
      [
        fullName,
        dateOfBirth,
        gender,
        phoneNumber,
        address,
        preferredUniversity || null,
        country || null,
        academicLevel,
        intendedMajor || null,
        gpaAcademicPerformance || null,
        extracurricularActivities || null,
        parentGuardianName || null,
        parentGuardianContact || null,
        financialNeedStatement || null,
        howHeardAbout || null,
        motivationStatement || null,
        termsAgreed === 'on' || termsAgreed === true || termsAgreed === 'true' ? 1 : 0,
        applicationId,
        req.user.email
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Application not found or not authorized' });
    }
    res.json({ message: 'Application updated successfully' });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Error updating application' });
  }
});

// Delete an application for the logged-in user
router.delete('/:id', auth, async (req, res) => {
  try {
    const applicationId = req.params.id;
    // Only allow delete if the application belongs to the user
    const [existing] = await db.promise().query(
      'SELECT * FROM scholarship_applications WHERE application_id = ? AND email_address = ?',
      [applicationId, req.user.email]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Application not found or not authorized' });
    }
    const [result] = await db.promise().query(
      'DELETE FROM scholarship_applications WHERE application_id = ? AND email_address = ?',
      [applicationId, req.user.email]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Application not found or not authorized' });
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ message: 'Error deleting application' });
  }
});

export default router; 