import express from 'express';
import db from '../config/database.js';
import { auth, bypassAuth } from '../middleware/auth.js';

const router = express.Router();

// Get applications for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const [applications] = await db.query(
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
    const [applicationsCount] = await db.query(
      'SELECT COUNT(*) as count FROM scholarship_applications WHERE email_address = ?',
      [req.user.email]
    );

    // Get total available scholarships (not expired)
    const [scholarshipsCount] = await db.query(
      "SELECT COUNT(*) as count FROM scholarships WHERE status = 'active' AND (application_deadline IS NULL OR application_deadline >= CURDATE())"
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

// Get progress summary (status breakdown) for the logged-in user
router.get('/progress', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT status, COUNT(*) as count
       FROM scholarship_applications
       WHERE email_address = ?
       GROUP BY status`,
      [req.user.email]
    );

    const summary = {
      approved: 0,
      pending: 0,
      rejected: 0,
      under_review: 0,
      waitlisted: 0
    };

    for (const r of rows) {
      const key = String(r.status || '').toLowerCase();
      if (key in summary) summary[key] = Number(r.count) || 0;
    }

    res.json({
      approved: summary.approved,
      pending: summary.pending,
      rejected: summary.rejected,
      under_review: summary.under_review,
      waitlisted: summary.waitlisted
    });
  } catch (error) {
    console.error('Error fetching progress summary:', error);
    res.status(500).json({ message: 'Error fetching progress summary' });
  }
});

// Get a single application for the logged-in user
router.get('/:id', auth, async (req, res) => {
  try {
    const [applications] = await db.query(
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
    const [existing] = await db.query(
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
    const [result] = await db.query(
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

// Update application status and processing information
router.patch('/:id/status', bypassAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewer_notes } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'waitlisted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Get current application
    const [applications] = await db.query(
      'SELECT * FROM scholarship_applications WHERE application_id = ?',
      [id]
    );
    
    if (applications.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const application = applications[0];
    const now = new Date();
    
    // Calculate processing metrics
    let reviewedAt = application.reviewed_at;
    let completedAt = application.completed_at;
    let processingDays = application.processing_days;
    let reviewDays = application.review_days;
    
    // Update reviewed_at if status is changing from pending
    if (application.status === 'pending' && status !== 'pending') {
      reviewedAt = now;
      reviewDays = Math.ceil((now - new Date(application.application_date)) / (1000 * 60 * 60 * 24));
    }
    
    // Update completed_at for final statuses
    if (['approved', 'rejected', 'waitlisted'].includes(status)) {
      completedAt = now;
      processingDays = Math.ceil((now - new Date(application.application_date)) / (1000 * 60 * 60 * 24));
    }
    
    // Update the application
    await db.query(`
      UPDATE scholarship_applications 
      SET status = ?, 
          reviewed_at = ?, 
          completed_at = ?, 
          processing_days = ?, 
          review_days = ?, 
          reviewer_notes = ?
      WHERE application_id = ?
    `, [status, reviewedAt, completedAt, processingDays, reviewDays, reviewer_notes, id]);
    
    // Send notification to user (if you have notification system)
    // This is optional - you can implement user notifications here
    
    res.json({ 
      message: 'Application status updated successfully',
      application_id: id,
      new_status: status
    });
    
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Error updating application status' });
  }
});

// Delete an application for the logged-in user
router.delete('/:id', auth, async (req, res) => {
  try {
    const applicationId = req.params.id;
    // Only allow delete if the application belongs to the user
    const [existing] = await db.query(
      'SELECT * FROM scholarship_applications WHERE application_id = ? AND email_address = ?',
      [applicationId, req.user.email]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Application not found or not authorized' });
    }
    const [result] = await db.query(
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
