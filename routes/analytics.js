import express from 'express';
import db from '../config/database.js';
import { bypassAuth } from '../middleware/auth.js';

const router = express.Router();

// Get overall analytics summary
router.get('/summary', bypassAuth, async (req, res) => {
  try {
    // Get total users
    const [usersResult] = await db.query('SELECT COUNT(*) as total FROM users');
    const totalUsers = usersResult[0].total;

    // Get active users (users with active status)
    const [activeUsersResult] = await db.query(
      'SELECT COUNT(*) as active FROM users WHERE status = "active"'
    );
    const activeUsers = activeUsersResult[0].active;

    // Get total scholarship applications
    const [applicationsResult] = await db.query('SELECT COUNT(*) as total FROM scholarship_applications');
    const totalApplications = applicationsResult[0].total;

    // Get application status breakdown
    const [statusResult] = await db.query(`
      SELECT 
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN status = 'waitlisted' THEN 1 END) as waitlisted
      FROM scholarship_applications
    `);
    const statusBreakdown = statusResult[0];

    // Get total scholarships
    const [scholarshipsResult] = await db.query('SELECT COUNT(*) as total FROM scholarships');
    const totalScholarships = scholarshipsResult[0].total;

    // Get completed scholarships (with deadline passed)
    const [completedResult] = await db.query(
      'SELECT COUNT(*) as completed FROM scholarships WHERE application_deadline < CURDATE()'
    );
    const completedScholarships = completedResult[0].completed;

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers
      },
      applications: {
        total: totalApplications,
        pending: statusBreakdown.pending,
        approved: statusBreakdown.approved,
        rejected: statusBreakdown.rejected,
        under_review: statusBreakdown.under_review,
        waitlisted: statusBreakdown.waitlisted
      },
      scholarships: {
        total: totalScholarships,
        completed: completedScholarships,
        active: totalScholarships - completedScholarships
      }
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
});

// Get user growth data for chart
router.get('/user-growth', bypassAuth, async (req, res) => {
  try {
    const { period = '6' } = req.query; // Default to 6 months
    const months = parseInt(period);

    // Since users table doesn't have created_at, we'll use a placeholder approach
    // You can add a created_at column to users table with this query:
    // ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    
    // For now, return sample data based on existing user count
    const [totalUsers] = await db.query('SELECT COUNT(*) as total FROM users');
    const userCount = totalUsers[0].total;
    
    const monthsData = [];
    const currentDate = new Date();
    const avgUsersPerMonth = Math.max(1, Math.floor(userCount / months));
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      monthsData.push({
        month: monthKey,
        new_users: Math.floor(Math.random() * avgUsersPerMonth) + 1
      });
    }

    res.json(monthsData);
  } catch (error) {
    console.error('Error fetching user growth data:', error);
    res.status(500).json({ message: 'Error fetching user growth data' });
  }
});

// Get application statistics
router.get('/application-stats', bypassAuth, async (req, res) => {
  try {
    const { period = '6' } = req.query;
    const months = parseInt(period);

    // Get real application data from scholarship_applications table
    const [result] = await db.query(`
      SELECT 
        DATE_FORMAT(application_date, '%Y-%m') as month,
        COUNT(*) as total_applications
      FROM scholarship_applications 
      WHERE application_date >= DATE_SUB(NOW(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(application_date, '%Y-%m')
      ORDER BY month ASC
    `, [months]);

    // Fill in missing months
    const monthsData = [];
    const currentDate = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      const existingData = result.find(row => row.month === monthKey);
      monthsData.push({
        month: monthKey,
        total_applications: existingData ? existingData.total_applications : 0,
        approved: 0, // No approval status in current structure
        rejected: 0, // No rejection status in current structure
        pending: existingData ? existingData.total_applications : 0
      });
    }

    res.json(monthsData);
  } catch (error) {
    console.error('Error fetching application statistics:', error);
    res.status(500).json({ message: 'Error fetching application statistics' });
  }
});

// Get top performing scholarships with comprehensive analytics
router.get('/top-scholarships', bypassAuth, async (req, res) => {
  try {
    // Allow period parameter for trends (default 6 months)
    const period = parseInt(req.query.period) || 6;

    // 1. Get all summary stats in one go using subqueries
    const [summary] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM scholarships) as total_scholarships,
        (SELECT COUNT(*) FROM scholarships WHERE application_deadline >= CURDATE()) as active_scholarships,
        (SELECT COUNT(*) FROM scholarship_applications) as total_applications
    `);
    const totalScholarships = summary[0].total_scholarships;
    const activeScholarships = summary[0].active_scholarships;
    const totalApplications = summary[0].total_applications;
    const avgApplicationsPerScholarship = totalScholarships > 0 ? (totalApplications / totalScholarships).toFixed(1) : 0;

    // 2. Top scholarships by application count
    const [topScholarships] = await db.query(`
      SELECT 
        s.id,
        s.name as title,
        s.description,
        s.university,
        s.application_deadline as deadline,
        COUNT(sa.application_id) as application_count
      FROM scholarships s
      LEFT JOIN scholarship_applications sa ON s.id = sa.scholarship_id
      GROUP BY s.id, s.name, s.description, s.university, s.application_deadline
      ORDER BY application_count DESC, s.name ASC
      LIMIT 10
    `);

    // 3. Application trends (parameterized period)
    const [trends] = await db.query(`
      SELECT 
        DATE_FORMAT(application_date, '%Y-%m') as month,
        COUNT(*) as applications
      FROM scholarship_applications 
      WHERE application_date >= DATE_SUB(NOW(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(application_date, '%Y-%m')
      ORDER BY month ASC
    `, [period]);

    // 4. Scholarship categories (by university)
    const [categories] = await db.query(`
      SELECT 
        s.university as name,
        COUNT(sa.application_id) as count
      FROM scholarships s
      LEFT JOIN scholarship_applications sa ON s.id = sa.scholarship_id
      WHERE s.university IS NOT NULL AND s.university != ''
      GROUP BY s.university
      ORDER BY count DESC
      LIMIT 5
    `);

    // 5. Recent applications
    const [recentApplications] = await db.query(`
      SELECT 
        sa.full_name,
        sa.email_address,
        sa.application_date,
        sa.academic_level,
        s.name as scholarship_title
      FROM scholarship_applications sa
      LEFT JOIN scholarships s ON sa.scholarship_id = s.id
      ORDER BY sa.application_date DESC
      LIMIT 10
    `);

    // 6. Real performance metrics (if possible)
    // Completion rate: % of scholarships with at least one application
    const [withApps] = await db.query(`
      SELECT COUNT(DISTINCT scholarship_id) as with_applications FROM scholarship_applications WHERE scholarship_id IS NOT NULL
    `);
    const completionRate = totalScholarships > 0 ? ((withApps[0].with_applications / totalScholarships) * 100).toFixed(1) + '%' : '0%';

    // Calculate real performance metrics using status fields
    const [performanceMetrics] = await db.query(`
      SELECT 
        -- Success rate: % of applications that are approved
        ROUND(
          (COUNT(CASE WHEN status = 'approved' THEN 1 END) * 100.0 / COUNT(*)), 1
        ) as success_rate,
        
        -- Average processing time for completed applications
        ROUND(
          AVG(CASE WHEN processing_days IS NOT NULL THEN processing_days END), 1
        ) as avg_processing_days,
        
        -- Average review time
        ROUND(
          AVG(CASE WHEN review_days IS NOT NULL THEN review_days END), 1
        ) as avg_review_days,
        
        -- Total applications by status
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review_count,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
        COUNT(CASE WHEN status = 'waitlisted' THEN 1 END) as waitlisted_count,
        
        -- Applications completed in last 30 days
        COUNT(CASE WHEN completed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as completed_last_30_days
      FROM scholarship_applications
    `);

    const metrics = performanceMetrics[0];
    
    // Format performance metrics
    const avgProcessingTime = metrics.avg_processing_days ? `${metrics.avg_processing_days} days` : 'N/A';
    const successRate = metrics.success_rate ? `${metrics.success_rate}%` : '0%';
    
    // Calculate user satisfaction based on approval rate and processing speed
    // This is a simplified metric - you could implement a real rating system
    let userSatisfaction = 'N/A';
    if (metrics.success_rate && metrics.avg_processing_days) {
      const satisfactionScore = Math.min(5, Math.max(1, 
        (metrics.success_rate / 20) + (10 / Math.max(1, metrics.avg_processing_days))
      ));
      userSatisfaction = `${satisfactionScore.toFixed(1)}/5`;
    }

    const performance = {
      completion_rate: completionRate,
      avg_processing_time: avgProcessingTime,
      success_rate: successRate,
      user_satisfaction: userSatisfaction,
      // Additional detailed metrics
      application_status_breakdown: {
        pending: metrics.pending_count || 0,
        under_review: metrics.under_review_count || 0,
        approved: metrics.approved_count || 0,
        rejected: metrics.rejected_count || 0,
        waitlisted: metrics.waitlisted_count || 0
      },
      avg_review_time: metrics.avg_review_days ? `${metrics.avg_review_days} days` : 'N/A',
      completed_last_30_days: metrics.completed_last_30_days || 0
    };

    res.json({
      total_scholarships: totalScholarships,
      active_scholarships: activeScholarships,
      total_applications: totalApplications,
      avg_applications: avgApplicationsPerScholarship,
      top_scholarships: topScholarships,
      trends: trends,
      categories: categories,
      recent_applications: recentApplications,
      performance: performance
    });
  } catch (error) {
    console.error('Error fetching top scholarships:', error);
    res.status(500).json({ message: 'Error fetching top scholarships data' });
  }
});

// Get user activity by month
router.get('/user-activity', bypassAuth, async (req, res) => {
  try {
    const { period = '6' } = req.query;
    const months = parseInt(period);

    // Since users table doesn't have created_at, return sample data
    const monthsData = [];
    const currentDate = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      monthsData.push({
        month: monthKey,
        active_users: Math.floor(Math.random() * 20) + 5
      });
    }

    res.json(monthsData);
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ message: 'Error fetching user activity data' });
  }
});

// Get recent activity
router.get('/recent-activity', bypassAuth, async (req, res) => {
  try {
    // Get recent scholarship applications
    const [result] = await db.query(`
      SELECT 
        'application' as type,
        application_id as id,
        'pending' as status,
        application_date as created_at,
        full_name as user_name,
        CONCAT('Application for ', s.name) as scholarship_title
      FROM scholarship_applications sa
      LEFT JOIN scholarships s ON sa.scholarship_id = s.id
      WHERE sa.application_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY sa.application_date DESC
      LIMIT 20
    `);

    res.json(result);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Error fetching recent activity' });
  }
});

// Get export data
router.get('/export', bypassAuth, async (req, res) => {
  try {
    const { type = 'all' } = req.query;
    
    let data = {};
    
    if (type === 'all' || type === 'users') {
      const [users] = await db.query(`
        SELECT id, full_name, email, status
        FROM users 
        ORDER BY id DESC
      `);
      data.users = users;
    }
    
    if (type === 'all' || type === 'applications') {
      const [applications] = await db.query(`
        SELECT 
          sa.application_id as id,
          sa.full_name,
          sa.email_address,
          sa.application_date,
          s.name as scholarship_name,
          sa.academic_level,
          sa.country
        FROM scholarship_applications sa
        LEFT JOIN scholarships s ON sa.scholarship_id = s.id
        ORDER BY sa.application_date DESC
      `);
      data.applications = applications;
    }
    
    if (type === 'all' || type === 'scholarships') {
      const [scholarships] = await db.query(`
        SELECT id, name, description, application_deadline, status, scholarship_type, 
        FROM scholarships
        ORDER BY created_at DESC
      `);
      data.scholarships = scholarships;
    }

    res.json({
      success: true,
      data: data,
      exported_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ message: 'Error exporting data' });
  }
});

export default router;
