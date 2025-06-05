const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');

// Function to update expired scholarships
async function updateExpiredScholarships() {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Update scholarships where deadline has passed and status is still active
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

// Get all scholarships
router.get('/', async (req, res) => {
  try {
    // First update any expired scholarships
    await updateExpiredScholarships();

    // Then fetch all scholarships
    const [scholarships] = await db.promise().query(`
      SELECT *, 
      CASE 
        WHEN deadline_date < CURDATE() AND status = 'active' THEN 'expired'
        ELSE status 
      END as status 
      FROM scholarships
    `);

    res.json(scholarships);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching scholarships' });
  }
});

// Get single scholarship
router.get('/:id', async (req, res) => {
  try {
    // First update any expired scholarships
    await updateExpiredScholarships();

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

// Create scholarship (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, description, type, deadline_date, status } = req.body;
    
    console.log('Received scholarship data:', req.body); // Debug log

    if (!name || !description || !type) {
      return res.status(400).json({ 
        message: 'Name, description, and type are required fields' 
      });
    }

    const [result] = await db.promise().query(
      'INSERT INTO scholarships (name, description, type, deadline_date, status) VALUES (?, ?, ?, ?, ?)',
      [name, description, type, deadline_date || null, status || 'active']
    );

    console.log('Insert result:', result); // Debug log

    res.status(201).json({
      message: 'Scholarship created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating scholarship:', error);
    res.status(500).json({ message: 'Error creating scholarship: ' + error.message });
  }
});

// Update scholarship (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, description, type, deadline_date, status } = req.body;
    
    console.log('Updating scholarship with data:', req.body);

    if (!name || !description || !type) {
      return res.status(400).json({ 
        message: 'Name, description, and type are required fields' 
      });
    }

    // Calculate status based on deadline_date if it's provided
    let calculatedStatus = status;
    if (deadline_date) {
      const currentDate = new Date().toISOString().split('T')[0];
      const deadlineDate = new Date(deadline_date).toISOString().split('T')[0];
      
      if (deadlineDate < currentDate) {
        calculatedStatus = 'expired';
      } else if (status === 'expired' && deadlineDate > currentDate) {
        // If deadline is extended beyond current date and was expired, make it active
        calculatedStatus = 'active';
      }
    }

    const [result] = await db.promise().query(
      'UPDATE scholarships SET name = ?, description = ?, type = ?, deadline_date = ?, status = ? WHERE id = ?',
      [name, description, type, deadline_date || null, calculatedStatus, req.params.id]
    );

    console.log('Update result:', result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    // Fetch the updated scholarship to return the new state
    const [updatedScholarship] = await db.promise().query(
      `SELECT *, 
       CASE 
         WHEN deadline_date < CURDATE() AND status = 'active' THEN 'expired'
         ELSE status 
       END as status 
       FROM scholarships 
       WHERE id = ?`,
      [req.params.id]
    );

    res.json({
      message: 'Scholarship updated successfully',
      scholarship: updatedScholarship[0]
    });
  } catch (error) {
    console.error('Error updating scholarship:', error);
    res.status(500).json({ message: 'Error updating scholarship: ' + error.message });
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
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const { full_name, email, university, country, motivation } = req.body;
    const scholarship_id = req.params.id;

    // Check if scholarship exists
    const [scholarships] = await db.promise().query(
      'SELECT * FROM scholarships WHERE id = ?',
      [scholarship_id]
    );

    if (scholarships.length === 0) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    // Check if already applied
    const [existingApplications] = await db.promise().query(
      'SELECT * FROM scholarship_applications WHERE scholarship_id = ? AND email = ?',
      [scholarship_id, email]
    );

    if (existingApplications.length > 0) {
      return res.status(400).json({ message: 'You have already applied for this scholarship' });
    }

    // Validate required fields
    if (!full_name || !email || !university || !country || !motivation) {
      return res.status(400).json({ 
        error: 'All fields are required: full_name, email, university, country, motivation' 
      });
    }

    // Create application
    const [result] = await db.promise().query(
      'INSERT INTO scholarship_applications (scholarship_id, full_name, email, university, country, motivation) VALUES (?, ?, ?, ?, ?, ?)',
      [scholarship_id, full_name, email, university, country, motivation]
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

module.exports = router; 