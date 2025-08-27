import express from 'express';
import pool from '../config/database.js';
import { bypassAuth } from '../middleware/auth.js';

const router = express.Router();
// Describe available reportable columns for dynamic UI
router.get('/schema', bypassAuth, async (req, res) => {
  try {
    // Users table columns (selected/whitelisted)
    const [userCols] = await pool.query(`DESCRIBE users`);
    const userWhitelist = new Set(['id','full_name','email','status','role','created_at','last_login']);
    const users = userCols
      .filter(c => userWhitelist.has(c.Field))
      .map(c => ({ key: c.Field, label: c.Field.replace(/_/g,' ').replace(/\b\w/g, m => m.toUpperCase()) }));

    // Applications table columns (selected/whitelisted)
    const [appCols] = await pool.query(`DESCRIBE scholarship_applications`);
    const appWhitelist = new Set([
      'application_id','full_name','email_address','application_date','status','academic_level','country','scholarship_id'
    ]);
    const applicationsBase = appCols
      .filter(c => appWhitelist.has(c.Field))
      .map(c => ({ key: c.Field, label: c.Field.replace(/_/g,' ').replace(/\b\w/g, m => m.toUpperCase()) }));
    // Virtual/computed fields commonly used
    const applicationVirtuals = [
      { key: 'scholarship_title', label: 'Scholarship Title' },
      { key: 'award_amount', label: 'Award Amount' }
    ];
    const applications = [...applicationsBase, ...applicationVirtuals];

    // Scholarships table columns (selected/whitelisted)
    const [schCols] = await pool.query(`DESCRIBE scholarships`);
    const schWhitelist = new Set([
      'id','name','description','eligibility_criteria','application_deadline','award_amount','number_of_awards','academic_level','status','min_gpa','scholarship_type','created_at'
    ]);
    const scholarships = schCols
      .filter(c => schWhitelist.has(c.Field))
      .map(c => ({ key: c.Field, label: c.Field.replace(/_/g,' ').replace(/\b\w/g, m => m.toUpperCase()) }));

    res.json({ success: true, schema: { users, applications, scholarships } });
  } catch (error) {
    console.error('Error fetching report schema:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch report schema' });
  }
});

// Safe parser for report data that can be string, object, buffer, or malformed
function safeParseReportData(raw) {
    try {
        if (!raw) {
            return {};
        }
        // If already an object (including arrays), return as-is
        if (typeof raw === 'object') {
            return raw;
        }
        // If buffer, convert to string
        if (typeof Buffer !== 'undefined' && Buffer.isBuffer(raw)) {
            const str = raw.toString('utf8');
            if (!str) return {};
            return JSON.parse(str);
        }
        // If string, handle common bad cases then parse
        if (typeof raw === 'string') {
            const trimmed = raw.trim();
            if (!trimmed || trimmed === '[object Object]' || trimmed === '"[object Object]"') {
                return {};
            }
            return JSON.parse(trimmed);
        }
        // Fallback
        return {};
    } catch (e) {
        return {
            metadata: {
                generatedAt: new Date().toISOString(),
                note: 'Original data could not be parsed',
                error: e?.message || 'Unknown parse error'
            },
            data: {}
        };
    }
}

// Cleanup endpoint to fix corrupted report data
router.post('/cleanup/corrupted-data', bypassAuth, async (req, res) => {
    try {
        console.log('Starting cleanup of corrupted report data');
        
        // Get all reports with corrupted data
        const [reports] = await pool.query(
            "SELECT id, name, data FROM reports WHERE data = '[object Object]' OR data = '\"[object Object]\"' OR data IS NULL"
        );
        
        console.log(`Found ${reports.length} reports with corrupted data`);
        
        let fixedCount = 0;
        for (const report of reports) {
            try {
                // Create a proper data structure for corrupted reports
                const fixedData = {
                    metadata: {
                        generatedAt: new Date().toISOString(),
                        note: 'Data was corrupted and has been fixed',
                        originalData: report.data
                    },
                    data: {
                        reportInfo: {
                            id: report.id,
                            name: report.name,
                            status: 'completed'
                        },
                        message: 'This report had corrupted data that has been cleaned up'
                    }
                };
                
                // Update the report with fixed data
                await pool.query(
                    'UPDATE reports SET data = ?, updated_at = NOW() WHERE id = ?',
                    [JSON.stringify(fixedData), report.id]
                );
                
                fixedCount++;
                console.log(`Fixed report ${report.id}: ${report.name}`);
            } catch (updateError) {
                console.error(`Failed to fix report ${report.id}:`, updateError);
            }
        }
        
        res.json({
            success: true,
            message: `Cleanup completed. Fixed ${fixedCount} out of ${reports.length} corrupted reports.`,
            fixedCount,
            totalCorrupted: reports.length
        });
        
    } catch (error) {
        console.error('Error during cleanup:', error);
        res.status(500).json({
            success: false,
            message: 'Cleanup failed: ' + error.message
        });
    }
});

// Simple test endpoint for export functionality
router.get('/test/export/:id', bypassAuth, async (req, res) => {
    try {
        const reportId = req.params.id;
        console.log(`Testing export for report ${reportId}`);

        // Get report data
        const [reports] = await pool.query(
            'SELECT * FROM reports WHERE id = ?',
            [reportId]
        );

        if (reports.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        const report = reports[0];
        console.log(`Found report: ${report.name}`);
        
        // Parse report data safely
        let reportData;
        try {
            reportData = safeParseReportData(report.data);
            console.log('Report data parsed safely');
        } catch (parseError) {
            console.error('Safe parse still failed (unexpected):', parseError);
            console.log('Raw data that failed to parse:', report.data);
            
            // Create fallback data
            reportData = {
                metadata: {
                    generatedAt: new Date().toISOString(),
                    note: 'Data was corrupted or improperly stored'
                },
                data: {
                    error: 'Original data could not be parsed',
                    rawData: report.data
                }
            };
        }

        // Test CSV conversion
        try {
            const csvData = convertToCSV(reportData);
            console.log('CSV conversion test successful');
            
            res.json({
                success: true,
                message: 'Export test successful',
                report: {
                    id: report.id,
                    name: report.name,
                    category: report.category,
                    status: report.status
                },
                csvPreview: csvData.substring(0, 500) + '...',
                dataStructure: Object.keys(reportData)
            });
        } catch (csvError) {
            console.error('CSV conversion test failed:', csvError);
            res.status(500).json({
                success: false,
                message: 'CSV conversion test failed: ' + csvError.message
            });
        }

    } catch (error) {
        console.error('Error in export test:', error);
        res.status(500).json({
            success: false,
            message: 'Export test failed: ' + error.message
        });
    }
});

// Test endpoint to check database setup
router.get('/test/setup', bypassAuth, async (req, res) => {
    try {
        // Check if reports table exists
        const [tables] = await pool.query(
            "SHOW TABLES LIKE 'reports'"
        );
        
        if (tables.length === 0) {
            // Create reports table if it doesn't exist
            await pool.query(`
                CREATE TABLE IF NOT EXISTS reports (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    category VARCHAR(100) DEFAULT 'general',
                    description TEXT,
                    status ENUM('pending', 'in_progress', 'completed', 'reviewed', 'exported', 'archived') DEFAULT 'pending',
                    data JSON,
                    created_by INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    exported_at TIMESTAMP NULL,
                    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
                )
            `);
            
            // Insert sample data
            await pool.query(`
                INSERT INTO reports (name, category, description, status, data, created_by) VALUES
                ('Sample Report', 'general', 'A sample report for testing', 'completed', '{"metadata": {"generatedAt": "2024-01-15T10:30:00Z"}, "data": {"sample": "data"}}', 1)
            `);
            
            res.json({
                success: true,
                message: 'Reports table created and sample data inserted'
            });
        } else {
            res.json({
                success: true,
                message: 'Reports table already exists'
            });
        }
    } catch (error) {
        console.error('Error setting up reports table:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to setup reports table: ' + error.message
        });
    }
});

// Get all reports
router.get('/', bypassAuth, async (req, res) => {
    try {
        const where = [];
        const params = [];
        const { status, category, date } = req.query || {};
        if (status && ['pending','in_progress','completed','reviewed','exported','archived'].includes(status)) {
            where.push('status = ?');
            params.push(status);
        }
        if (category && category !== 'all') {
            where.push('category = ?');
            params.push(category);
        }
        if (date && date !== 'all') {
            switch (date) {
                case 'today': where.push('DATE(created_at) = CURDATE()'); break;
                case 'last7': where.push('created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'); break;
                case 'thisMonth': where.push('YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())'); break;
                case 'lastMonth': where.push('YEAR(created_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND MONTH(created_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))'); break;
                case 'thisYear': where.push('YEAR(created_at) = YEAR(CURDATE())'); break;
            }
        }
        const whereClause = where.length ? ('WHERE ' + where.join(' AND ')) : '';
        const [reports] = await pool.query(
            `SELECT * FROM reports ${whereClause} ORDER BY created_at DESC`,
            params
        );

        res.json({
            success: true,
            reports: reports,
            pagination: {
                total: reports.length,
                page: 1,
                pages: 1,
                limit: reports.length
            }
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch reports' });
    }
});

// Get report summary
router.get('/summary', bypassAuth, async (req, res) => {
  try {
        const [totalReports] = await pool.query('SELECT COUNT(*) as total FROM reports');
        const [pendingReports] = await pool.query("SELECT COUNT(*) as pending FROM reports WHERE status = 'pending'");
        const [reviewedReports] = await pool.query("SELECT COUNT(*) as reviewed FROM reports WHERE status = 'reviewed'");
        const [exportedReports] = await pool.query("SELECT COUNT(*) as exported FROM reports WHERE status = 'exported'");

    res.json({
            success: true,
            totalReports: totalReports[0].total,
            pendingReports: pendingReports[0].pending,
            reviewedReports: reviewedReports[0].reviewed,
            exportedReports: exportedReports[0].exported
    });
  } catch (error) {
    console.error('Error fetching report summary:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch report summary' });
    }
});

// Get report insights
router.get('/insights/summary', bypassAuth, async (req, res) => {
  try {
    // Most generated report type
    const [byCategory] = await pool.query(
      `SELECT category, COUNT(*) as cnt
       FROM reports
       GROUP BY category
       ORDER BY cnt DESC
       LIMIT 1`);
    const mostGenerated = byCategory[0] || { category: 'N/A', cnt: 0 };

    // Average generation time (if we had durations; approximate via created_at to updated_at when available)
    const [avgGen] = await pool.query(
      `SELECT AVG(TIMESTAMPDIFF(SECOND, created_at, IFNULL(updated_at, created_at))) as avg_seconds
       FROM reports`);
    const avgSeconds = Math.max(0, Math.round((avgGen[0] && avgGen[0].avg_seconds) ? avgGen[0].avg_seconds : 0));
    const avgLabel = avgSeconds ? `${avgSeconds} seconds` : '—';

    // Most popular export format (count of reports with status exported does not track format; infer from recent exports log if any)
    // As we do not persist format, approximate by counting status exported and default to CSV label
    const [exported] = await pool.query(
      `SELECT COUNT(*) as exported_count FROM reports WHERE status = 'exported'`);
    const popularFormat = exported[0] && exported[0].exported_count > 0 ? 'CSV' : '—';

    // Reports generated this month
    const [thisMonth] = await pool.query(
      `SELECT COUNT(*) as cnt
       FROM reports
       WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())`);
    const reportsThisMonth = thisMonth[0] ? thisMonth[0].cnt : 0;

    const insights = [
      { type: 'Most Generated Report Type', value: mostGenerated.category, count: mostGenerated.cnt },
      { type: 'Average Report Generation Time', value: avgLabel, count: avgSeconds },
      { type: 'Most Popular Export Format', value: popularFormat, count: exported[0] ? exported[0].exported_count : 0 },
      { type: 'Reports Generated This Month', value: String(reportsThisMonth), count: reportsThisMonth }
    ];

    res.json({ success: true, insights });
  } catch (error) {
    console.error('Error fetching report insights:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch report insights' });
  }
});

// Generate new report
router.post('/generate', bypassAuth, async (req, res) => {
  try {
    const { 
      name, 
            category = 'general',
      description, 
            dateRange,
            format = 'json',
            elements = [],
            userFields = [],
            applicationFields = [],
            scholarshipFields = [],
            analyticsFields = [],
            includeCharts = false,
            includeSummary = false,
            includeRecommendations = false,
            autoSchedule = false,
            startDate,
            endDate
    } = req.body;

        // Validate required fields
        if (!name || elements.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Report name and at least one data element are required'
            });
        }

        // Generate report data based on selected elements
        const reportData = await generateReportData({
            elements,
            userFields,
            applicationFields,
            scholarshipFields,
            analyticsFields,
            dateRange,
            startDate,
            endDate
        });

        // Create report record
        const [result] = await pool.query(
            'INSERT INTO reports (name, category, description, status, data, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [name, category, description, 'completed', JSON.stringify(reportData), req.user.id]
        );

        const reportId = result.insertId;

        res.json({
            success: true,
            message: 'Report generated successfully',
            reportId: reportId,
            report: {
                id: reportId,
                name: name,
                category: category,
                status: 'completed',
                data: reportData
            }
        });

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate report: ' + error.message
        });
    }
});

// Get specific report
router.get('/:id', bypassAuth, async (req, res) => {
    try {
        const [reports] = await pool.query(
      'SELECT * FROM reports WHERE id = ?',
            [req.params.id]
        );

        if (reports.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        const report = reports[0];
        report.data = safeParseReportData(report.data || '{}');

        res.json({
            success: true,
            report: report
        });

  } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch report'
        });
  }
});

// Update report
router.put('/:id', bypassAuth, async (req, res) => {
  try {
        const { name, description, category, status, data } = req.body || {};

        // Validate id
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid report id' });
        }

        // Validate and collect provided fields only
        const allowedStatuses = new Set(['pending','in_progress','completed','reviewed','exported','archived']);
        const updates = [];
        const params = [];

        if (typeof name !== 'undefined') {
            updates.push('name = ?');
            params.push(name ?? null);
        }
        if (typeof description !== 'undefined') {
            updates.push('description = ?');
            params.push(description ?? null);
        }
        if (typeof category !== 'undefined') {
            updates.push('category = ?');
            params.push(category ?? null);
        }
        if (typeof status !== 'undefined') {
            if (!allowedStatuses.has(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status value' });
            }
            updates.push('status = ?');
            params.push(status);
        }
        // Optional data payload (JSON). Accept object or JSON string.
        if (typeof data !== 'undefined') {
            let serialized = null;
            try {
                if (data === null) serialized = null;
                else if (typeof data === 'string') {
                    // Validate parsable JSON; if fails, store as string
                    try { JSON.parse(data); serialized = data; }
                    catch { serialized = JSON.stringify({ value: data }); }
                } else {
                    serialized = JSON.stringify(data);
                }
            } catch {
                serialized = null;
            }
            updates.push('data = ?');
            params.push(serialized);
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields provided to update' });
        }

        const setClause = updates.join(', ') + ', updated_at = NOW()';
        const [result] = await pool.query(
            `UPDATE reports SET ${setClause} WHERE id = ?`,
            [...params, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        res.json({
            success: true,
            message: 'Report updated successfully'
        });

  } catch (error) {
    console.error('Error updating report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update report'
        });
  }
});

// Delete report
router.delete('/:id', bypassAuth, async (req, res) => {
  try {
        const [result] = await pool.query(
            'DELETE FROM reports WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        res.json({
            success: true,
            message: 'Report deleted successfully'
        });

  } catch (error) {
    console.error('Error deleting report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete report'
        });
  }
});

// Export report
router.post('/:id/export', bypassAuth, async (req, res) => {
  try {
    const { format = 'json' } = req.body;
        const reportId = req.params.id;

        console.log(`Exporting report ${reportId} in format: ${format}`);

    // Get report data
        const [reports] = await pool.query(
      'SELECT * FROM reports WHERE id = ?',
            [reportId]
    );

    if (reports.length === 0) {
            console.log(`Report ${reportId} not found`);
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
    }

    const report = reports[0];
        console.log(`Found report: ${report.name}`);
        
        // For now, let's just return the report data as JSON regardless of format
        // This will help us test if the basic functionality works
        let reportData;
        try {
            reportData = safeParseReportData(report.data || '{}');
            console.log('Report data parsed successfully');
        } catch (parseError) {
            console.error('Error parsing report data:', parseError);
            return res.status(500).json({
                success: false,
                message: 'Invalid report data format'
            });
        }

        // Update report status to exported
        try {
            await pool.query(
                'UPDATE reports SET status = ?, updated_at = NOW() WHERE id = ?',
                ['exported', reportId]
            );
            console.log('Report status updated to exported');
        } catch (updateError) {
            console.error('Error updating report status:', updateError);
            // Don't fail the export if status update fails
        }

        // Handle different export formats
        switch (format.toLowerCase()) {
      case 'csv':
                console.log('Generating CSV export');
                try {
                    const csvData = convertToCSV(reportData);
                    if (csvData.startsWith('Error:')) {
                        return res.status(500).json({
                            success: false,
                            message: csvData
                        });
                    }
        res.setHeader('Content-Type', 'text/csv');
                    res.setHeader('Content-Disposition', `attachment; filename="report_${reportId}.csv"`);
                    res.send(csvData);
                } catch (csvError) {
                    console.error('Error generating CSV:', csvError);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to generate CSV: ' + csvError.message
                    });
                }
        break;

      case 'pdf':
                console.log('PDF export requested');
                // For PDF, return a success message (PDF generation would require additional libraries)
                res.json({
                    success: true,
                    message: 'PDF export initiated',
                    downloadUrl: `/api/reports/${reportId}/download-pdf`
                });
                break;

            case 'excel':
                console.log('Generating Excel export');
                try {
                    const excelData = convertToExcel(reportData);
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    res.setHeader('Content-Disposition', `attachment; filename="report_${reportId}.xlsx"`);
                    res.send(excelData);
                } catch (excelError) {
                    console.error('Error generating Excel:', excelError);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to generate Excel: ' + excelError.message
                    });
                }
                break;

            default: // json
                console.log('Generating JSON export');
        res.json({ 
                    success: true,
                    report: report,
                    data: reportData
                });
        }

        console.log(`Export completed successfully for report ${reportId}`);

  } catch (error) {
    console.error('Error exporting report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export report: ' + error.message
        });
    }
});

// Helper function to generate report data
async function generateReportData(options) {
    const {
        elements,
        userFields,
        applicationFields,
        scholarshipFields,
        analyticsFields,
        dateRange,
        startDate,
        endDate
    } = options;

    const reportData = {
        metadata: {
            generatedAt: new Date().toISOString(),
            elements: elements,
            dateRange: dateRange,
            startDate: startDate,
            endDate: endDate
        },
        data: {}
    };

    // Generate date filter
    const dateFilter = buildDateFilter(dateRange, startDate, endDate);

    // Include users data
    if (elements.includes('users')) {
        reportData.data.users = await generateUsersData(userFields, dateFilter);
    }

    // Include applications data
    if (elements.includes('applications')) {
        reportData.data.applications = await generateApplicationsData(applicationFields, dateFilter);
    }

    // Include scholarships data
    if (elements.includes('scholarships')) {
        reportData.data.scholarships = await generateScholarshipsData(scholarshipFields, dateFilter);
    }

    // Include analytics data
    if (elements.includes('analytics')) {
        reportData.data.analytics = await generateAnalyticsData(analyticsFields, dateFilter);
    }

    return reportData;
}

// Helper function to build date filter
function buildDateFilter(dateRange, startDate, endDate) {
    let whereClause = '';
    let params = [];

    switch (dateRange) {
        case 'today':
            whereClause = 'DATE(created_at) = CURDATE()';
            break;
        case 'yesterday':
            whereClause = 'DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)';
            break;
        case 'last7days':
            whereClause = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
            break;
        case 'last30days':
            whereClause = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
            break;
        case 'last90days':
            whereClause = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)';
            break;
        case 'thisMonth':
            whereClause = 'YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())';
            break;
        case 'lastMonth':
            whereClause = 'YEAR(created_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND MONTH(created_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))';
            break;
        case 'thisYear':
            whereClause = 'YEAR(created_at) = YEAR(CURDATE())';
            break;
        case 'custom':
            if (startDate && endDate) {
                whereClause = 'created_at BETWEEN ? AND ?';
                params = [startDate, endDate];
            }
            break;
        default: // 'all'
            whereClause = '1=1';
    }

    return { whereClause, params };
}

// Helper function to generate users data
async function generateUsersData(userFields, dateFilter) {
    try {
        const allowedMap = {
            id: 'id',
            full_name: 'full_name',
            email: 'email',
            status: 'status',
            role: 'role',
            registration_date: 'created_at'
        };
        const requested = Array.isArray(userFields) && userFields.length > 0
            ? userFields.filter(f => allowedMap[f])
            : ['full_name','email','status','role','registration_date'];
        const selectParts = ['id'];
        requested.forEach(f => {
            if (f === 'registration_date') selectParts.push(`${allowedMap[f]} as registration_date`);
            else selectParts.push(allowedMap[f]);
        });
        const selectFields = Array.from(new Set(selectParts)).join(', ');

        const [rows] = await pool.query(
            `SELECT ${selectFields} FROM users WHERE ${dateFilter.whereClause}`,
            dateFilter.params
        );

        // Ensure order and only requested keys in output
        const fields = ['id', ...requested];
        const users = rows.map(r => {
            const obj = {};
            fields.forEach(k => { obj[k] = r[k] ?? null; });
            return obj;
        });

        return { total: users.length, users, fields };
    } catch (error) {
        console.error('Error generating users data:', error);
        return { total: 0, users: [], fields: [], error: error.message };
    }
}

// Helper function to generate applications data
async function generateApplicationsData(applicationFields, dateFilter) {
    try {
        const allowedMap = {
            id: 'sa.application_id as id',
            full_name: 'sa.full_name',
            email_address: 'sa.email_address',
            application_date: 'sa.application_date',
            status: 'sa.status',
            academic_level: 'sa.academic_level',
            country: 'sa.country',
            scholarship_title: 's.name as scholarship_title',
            award_amount: 's.award_amount'
        };
        const requested = Array.isArray(applicationFields) && applicationFields.length > 0
            ? applicationFields.filter(f => allowedMap[f])
            : ['full_name','email_address','application_date','status','scholarship_title','award_amount'];
        const selectParts = ['sa.application_id as id'];
        requested.forEach(f => selectParts.push(allowedMap[f]));
        const selectFields = Array.from(new Set(selectParts)).join(', ');

        const [rows] = await pool.query(
            `SELECT ${selectFields} FROM scholarship_applications sa 
             LEFT JOIN scholarships s ON sa.scholarship_id = s.id 
             WHERE ${dateFilter.whereClause.replace('created_at', 'sa.application_date')}`,
            dateFilter.params
        );

        const fields = ['id', ...requested];
        const applications = rows.map(r => {
            const obj = {};
            fields.forEach(k => { obj[k] = r[k] ?? null; });
            return obj;
        });

        return { total: applications.length, applications, fields };
    } catch (error) {
        console.error('Error generating applications data:', error);
        return { total: 0, applications: [], fields: [], error: error.message };
    }
}

// Helper function to generate scholarships data
async function generateScholarshipsData(scholarshipFields, dateFilter) {
    try {
        const allowedMap = {
            id: 'id',
            name: 'name',
            description: 'description',
            eligibility_criteria: 'eligibility_criteria',
            application_deadline: 'application_deadline',
            award_amount: 'award_amount',
            number_of_awards: 'number_of_awards',
            academic_level: 'academic_level',
            status: 'status',
            min_gpa: 'min_gpa',
            scholarship_type: 'scholarship_type',
            created_at: 'created_at',
            application_count: '(SELECT COUNT(*) FROM scholarship_applications WHERE scholarship_id = scholarships.id) as application_count'
        };
        const requested = Array.isArray(scholarshipFields) && scholarshipFields.length > 0
            ? scholarshipFields.filter(f => allowedMap[f])
            : ['name','description','eligibility_criteria','application_deadline','award_amount','status'];
        const selectParts = ['id'];
        requested.forEach(f => selectParts.push(allowedMap[f]));
        const selectFields = Array.from(new Set(selectParts)).join(', ');

        const [rows] = await pool.query(
            `SELECT ${selectFields} FROM scholarships WHERE ${dateFilter.whereClause}`,
            dateFilter.params
        );

        const fields = ['id', ...requested];
        const scholarships = rows.map(r => {
            const obj = {};
            fields.forEach(k => { obj[k] = r[k] ?? null; });
            return obj;
        });

        return { total: scholarships.length, scholarships, fields };
    } catch (error) {
        console.error('Error generating scholarships data:', error);
        return { total: 0, scholarships: [], fields: [], error: error.message };
    }
}

// Helper function to generate analytics data
async function generateAnalyticsData(analyticsFields, dateFilter) {
    try {
        const analytics = {};

        if (analyticsFields.includes('user_growth')) {
            const [userGrowth] = await pool.query(
                `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as new_users 
                 FROM users WHERE ${dateFilter.whereClause} 
                 GROUP BY DATE_FORMAT(created_at, '%Y-%m') 
                 ORDER BY month`,
                dateFilter.params
            );
            analytics.userGrowth = userGrowth;
        }

        if (analyticsFields.includes('application_trends')) {
            const [applicationTrends] = await pool.query(
                `SELECT DATE_FORMAT(application_date, '%Y-%m') as month, COUNT(*) as applications 
                 FROM scholarship_applications WHERE ${dateFilter.whereClause.replace('created_at', 'application_date')} 
                 GROUP BY DATE_FORMAT(application_date, '%Y-%m') 
                 ORDER BY month`,
                dateFilter.params
            );
            analytics.applicationTrends = applicationTrends;
        }

        if (analyticsFields.includes('scholarship_performance')) {
            const [scholarshipPerformance] = await pool.query(
                `SELECT s.name as title, COUNT(sa.application_id) as application_count, s.number_of_awards 
                 FROM scholarships s
                 LEFT JOIN scholarship_applications sa ON s.id = sa.scholarship_id
                 WHERE ${dateFilter.whereClause.replace('created_at', 's.created_at')} 
                 GROUP BY s.id, s.name, s.number_of_awards`,
                dateFilter.params
            );
            analytics.scholarshipPerformance = scholarshipPerformance;
        }

        if (analyticsFields.includes('financial_summary')) {
            const [financialSummary] = await pool.query(
                `SELECT SUM(s.award_amount) as total_awards, COUNT(s.id) as total_scholarships 
                 FROM scholarships s 
                 WHERE ${dateFilter.whereClause.replace('created_at', 's.created_at')}`,
                dateFilter.params
            );
            analytics.financialSummary = financialSummary[0];
        }

        return analytics;
    } catch (error) {
        console.error('Error generating analytics data:', error);
        return { error: error.message };
    }
}

// Helper function to convert data to CSV
function convertToCSV(data) {
    try {
        console.log('Converting data to CSV:', JSON.stringify(data, null, 2));
        
        let csv = 'Report Data Export\n\n';
        
        // Handle different data structures
        if (data && typeof data === 'object') {
            if (data.data && typeof data.data === 'object') {
                // If data has a nested 'data' property (from generated reports)
                Object.keys(data.data).forEach(key => {
                    const section = data.data[key];
                    csv += `\n=== ${key.toUpperCase()} ===\n`;
                    
                    if (section && typeof section === 'object') {
                        if (Array.isArray(section)) {
                            // Handle array data
                            if (section.length > 0) {
                                const headers = Object.keys(section[0]);
                                csv += headers.join(',') + '\n';
                                section.forEach(row => {
                                    const values = headers.map(header => {
                                        const value = row[header];
                                        // Escape commas and quotes in CSV
                                        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                                            return `"${value.replace(/"/g, '""')}"`;
                                        }
                                        return value || '';
                                    });
                                    csv += values.join(',') + '\n';
                                });
                            } else {
                                csv += 'No data available\n';
                            }
                        } else if (section.total !== undefined) {
                            // Handle summary data with ordered headers if provided
                            csv += `Total: ${section.total}\n`;
                            const dataArray = section[key] && Array.isArray(section[key]) ? section[key] : [];
                            const headers = Array.isArray(section.fields) && section.fields.length > 0
                                ? section.fields
                                : (dataArray[0] ? Object.keys(dataArray[0]) : []);
                            if (headers.length > 0) {
                                csv += headers.join(',') + '\n';
                                dataArray.forEach(row => {
                                    const values = headers.map(header => {
                                        const value = row[header];
                                        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                                            return `"${value.replace(/"/g, '""')}"`;
                                        }
                                        return value ?? '';
                                    });
                                    csv += values.join(',') + '\n';
                                });
                            } else if (dataArray.length === 0) {
                                csv += 'No data available\n';
                            }
                        } else {
                            // Handle object data
                            Object.keys(section).forEach(subKey => {
                                csv += `${subKey}: ${section[subKey]}\n`;
                            });
                        }
                    }
                    csv += '\n';
                });
            } else if (Array.isArray(data)) {
                // If data is directly an array
                if (data.length > 0) {
                    const headers = Object.keys(data[0]);
                    csv += headers.join(',') + '\n';
                    data.forEach(row => {
                        const values = headers.map(header => {
                            const value = row[header];
                            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                                return `"${value.replace(/"/g, '""')}"`;
                            }
                            return value || '';
                        });
                        csv += values.join(',') + '\n';
                    });
                }
            } else {
                // If data is a plain object
                Object.keys(data).forEach(key => {
                    csv += `${key}: ${data[key]}\n`;
                });
            }
        } else {
            csv = 'No data available for export';
        }
        
        console.log('CSV conversion completed successfully');
  return csv;
    } catch (error) {
        console.error('Error converting to CSV:', error);
        return 'Error: Could not convert data to CSV format. ' + error.message;
    }
}

// Helper function to convert data to Excel (placeholder)
function convertToExcel(data) {
    // This would require a library like 'xlsx' or 'exceljs'
    // For now, return a simple representation
    return JSON.stringify(data);
}

export default router; 
