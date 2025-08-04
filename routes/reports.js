import express from 'express';
import db from '../config/database.js';
import { adminAuth } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get all reports with pagination and filtering
router.get('/', adminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      dateRange, 
      keyword,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];

    // Apply filters
    if (status && status !== 'all') {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (category && category !== 'all') {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    if (keyword) {
      whereClause += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (dateRange) {
        case 'lastWeek':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'lastMonth':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case 'lastYear':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        whereClause += ' AND created_at >= ?';
        params.push(startDate);
      }
    }

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM reports ${whereClause}`,
      params
    );
    const totalReports = countResult[0].total;

    // Get reports with pagination
    const [reports] = await db.query(
      `SELECT * FROM reports ${whereClause} 
       ORDER BY ${sortBy} ${sortOrder} 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      reports,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReports / limit),
        totalReports,
        hasNext: page * limit < totalReports,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
});

// Get report summary statistics
router.get('/summary', adminAuth, async (req, res) => {
  try {
    // Get total reports count
    const [totalResult] = await db.query('SELECT COUNT(*) as total FROM reports');
    const totalReports = totalResult[0].total;

    // Get reports by status
    const [statusResult] = await db.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM reports 
      GROUP BY status
    `);

    // Get reports by category
    const [categoryResult] = await db.query(`
      SELECT 
        category,
        COUNT(*) as count
      FROM reports 
      GROUP BY category
    `);

    // Get recent reports (last 7 days)
    const [recentResult] = await db.query(`
      SELECT COUNT(*) as count 
      FROM reports 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Get reports created this month
    const [monthlyResult] = await db.query(`
      SELECT COUNT(*) as count 
      FROM reports 
      WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
    `);

    const statusBreakdown = statusResult.reduce((acc, item) => {
      acc[item.status] = item.count;
      return acc;
    }, {});

    const categoryBreakdown = categoryResult.reduce((acc, item) => {
      acc[item.category] = item.count;
      return acc;
    }, {});

    res.json({
      totalReports,
      pendingReports: statusBreakdown.pending || 0,
      reviewedReports: statusBreakdown.reviewed || 0,
      exportedReports: statusBreakdown.exported || 0,
      recentReports: recentResult[0].count,
      monthlyReports: monthlyResult[0].count,
      statusBreakdown,
      categoryBreakdown
    });
  } catch (error) {
    console.error('Error fetching report summary:', error);
    res.status(500).json({ message: 'Error fetching report summary' });
  }
});

// Get single report by ID
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [reports] = await db.query(
      'SELECT * FROM reports WHERE id = ?',
      [id]
    );

    if (reports.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(reports[0]);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ message: 'Error fetching report' });
  }
});

// Create new report
router.post('/', adminAuth, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      category, 
      data, 
      status = 'pending',
      type = 'custom'
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: 'Name and category are required' });
    }

    const [result] = await db.query(
      `INSERT INTO reports (name, description, category, data, status, type, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description, category, JSON.stringify(data), status, type, req.user.id]
    );

    const [newReport] = await db.query(
      'SELECT * FROM reports WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newReport[0]);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Error creating report' });
  }
});

// Update report
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      category, 
      data, 
      status,
      type 
    } = req.body;

    // Check if report exists
    const [existingReports] = await db.query(
      'SELECT * FROM reports WHERE id = ?',
      [id]
    );

    if (existingReports.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Update report
    await db.query(
      `UPDATE reports 
       SET name = ?, description = ?, category = ?, data = ?, status = ?, type = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, description, category, JSON.stringify(data), status, type, id]
    );

    const [updatedReport] = await db.query(
      'SELECT * FROM reports WHERE id = ?',
      [id]
    );

    res.json(updatedReport[0]);
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ message: 'Error updating report' });
  }
});

// Delete report
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if report exists
    const [existingReports] = await db.query(
      'SELECT * FROM reports WHERE id = ?',
      [id]
    );

    if (existingReports.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    await db.query('DELETE FROM reports WHERE id = ?', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Error deleting report' });
  }
});

// Generate report
router.post('/generate', adminAuth, async (req, res) => {
  try {
    const { 
      type, 
      parameters, 
      name, 
      category = 'generated',
      description 
    } = req.body;

    let reportData = {};

    // Generate different types of reports
    switch (type) {
      case 'applications_summary':
        reportData = await generateApplicationsSummary(parameters);
        break;
      case 'scholarship_performance':
        reportData = await generateScholarshipPerformance(parameters);
        break;
      case 'user_activity':
        reportData = await generateUserActivity(parameters);
        break;
      case 'financial_summary':
        reportData = await generateFinancialSummary(parameters);
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    // Save the generated report
    const [result] = await db.query(
      `INSERT INTO reports (name, description, category, data, status, type, created_by) 
       VALUES (?, ?, ?, ?, 'completed', 'generated', ?)`,
      [name, description, category, JSON.stringify(reportData), req.user.id]
    );

    const [newReport] = await db.query(
      'SELECT * FROM reports WHERE id = ?',
      [result.insertId]
    );

    res.json({
      message: 'Report generated successfully',
      report: newReport[0]
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
});

// Export report
router.post('/:id/export', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'json' } = req.body;

    // Get report data
    const [reports] = await db.query(
      'SELECT * FROM reports WHERE id = ?',
      [id]
    );

    if (reports.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const report = reports[0];
    let exportData;

    switch (format) {
      case 'json':
        exportData = JSON.stringify(report, null, 2);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${report.name}.json"`);
        break;
      case 'csv':
        exportData = convertToCSV(report);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${report.name}.csv"`);
        break;
      case 'pdf':
        // For PDF export, you would typically use a library like puppeteer or jsPDF
        // For now, we'll return a JSON response indicating PDF generation
        res.json({ 
          message: 'PDF export not implemented yet',
          report: report 
        });
        return;
      default:
        return res.status(400).json({ message: 'Unsupported export format' });
    }

    // Update report status to exported
    await db.query(
      'UPDATE reports SET status = "exported", exported_at = NOW() WHERE id = ?',
      [id]
    );

    res.send(exportData);
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({ message: 'Error exporting report' });
  }
});

// Get report insights
router.get('/insights/summary', adminAuth, async (req, res) => {
  try {
    // Get various insights
    const insights = await generateReportInsights();
    res.json(insights);
  } catch (error) {
    console.error('Error fetching report insights:', error);
    res.status(500).json({ message: 'Error fetching report insights' });
  }
});

// Helper functions for report generation
async function generateApplicationsSummary(parameters = {}) {
  const { period = '30' } = parameters;
  
  // Get applications summary
  const [applicationsResult] = await db.query(`
    SELECT 
      COUNT(*) as total_applications,
      COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
      COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review
    FROM scholarship_applications 
    WHERE application_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
  `, [period]);

  // Get applications by scholarship
  const [scholarshipResult] = await db.query(`
    SELECT 
      s.name as scholarship_name,
      COUNT(sa.application_id) as application_count
    FROM scholarships s
    LEFT JOIN scholarship_applications sa ON s.id = sa.scholarship_id
    WHERE sa.application_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY s.id, s.name
    ORDER BY application_count DESC
    LIMIT 10
  `, [period]);

  return {
    summary: applicationsResult[0],
    topScholarships: scholarshipResult,
    period: period,
    generatedAt: new Date().toISOString()
  };
}

async function generateScholarshipPerformance(parameters = {}) {
  // Get scholarship performance metrics
  const [performanceResult] = await db.query(`
    SELECT 
      s.name as scholarship_name,
      COUNT(sa.application_id) as total_applications,
      COUNT(CASE WHEN sa.status = 'approved' THEN 1 END) as approved_applications,
      ROUND((COUNT(CASE WHEN sa.status = 'approved' THEN 1 END) * 100.0 / COUNT(sa.application_id)), 2) as approval_rate,
      AVG(sa.processing_days) as avg_processing_days
    FROM scholarships s
    LEFT JOIN scholarship_applications sa ON s.id = sa.scholarship_id
    GROUP BY s.id, s.name
    ORDER BY total_applications DESC
  `);

  return {
    performance: performanceResult,
    generatedAt: new Date().toISOString()
  };
}

async function generateUserActivity(parameters = {}) {
  const { period = '30' } = parameters;
  
  // Get user activity data
  const [activityResult] = await db.query(`
    SELECT 
      DATE(application_date) as date,
      COUNT(*) as applications
    FROM scholarship_applications 
    WHERE application_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY DATE(application_date)
    ORDER BY date
  `, [period]);

  return {
    activity: activityResult,
    period: period,
    generatedAt: new Date().toISOString()
  };
}

async function generateFinancialSummary(parameters = {}) {
  // This would typically include payment data, but for now we'll return a placeholder
  return {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    currency: 'USD',
    generatedAt: new Date().toISOString(),
    note: 'Financial data not available in current system'
  };
}

async function generateReportInsights() {
  // Generate various insights
  const [recentActivity] = await db.query(`
    SELECT 
      'recent_activity' as type,
      COUNT(*) as count,
      'Applications submitted in last 7 days' as description
    FROM scholarship_applications 
    WHERE application_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
  `);

  const [topPerforming] = await db.query(`
    SELECT 
      'top_performing' as type,
      s.name as value,
      COUNT(sa.application_id) as count,
      'Most popular scholarship' as description
    FROM scholarships s
    LEFT JOIN scholarship_applications sa ON s.id = sa.scholarship_id
    GROUP BY s.id, s.name
    ORDER BY count DESC
    LIMIT 1
  `);

  const [processingEfficiency] = await db.query(`
    SELECT 
      'processing_efficiency' as type,
      ROUND(AVG(processing_days), 1) as value,
      'Average processing time (days)' as description
    FROM scholarship_applications 
    WHERE processing_days IS NOT NULL
  `);

  return {
    insights: [
      recentActivity[0],
      topPerforming[0],
      processingEfficiency[0]
    ],
    generatedAt: new Date().toISOString()
  };
}

function convertToCSV(report) {
  // Simple CSV conversion for report data
  const data = report.data ? JSON.parse(report.data) : {};
  
  let csv = 'Report Name,Category,Status,Created At\n';
  csv += `"${report.name}","${report.category}","${report.status}","${report.created_at}"\n`;
  
  // Add data rows if available
  if (data.summary) {
    csv += '\nSummary\n';
    Object.entries(data.summary).forEach(([key, value]) => {
      csv += `"${key}","${value}"\n`;
    });
  }
  
  return csv;
}

export default router; 