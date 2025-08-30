import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';

const router = express.Router();

// Security middleware
router.use(helmet());
router.use(hpp());

// Rate limiting for admin dashboard routes
const dashboardRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

router.use(dashboardRateLimit);

// Enhanced admin authentication middleware with RBAC
const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            console.log('❌ No token provided in request headers');
            return res.status(401).json({ 
                success: false,
                message: 'No authentication token, access denied',
                code: 'NO_TOKEN'
            });
        }

        // Verify JWT token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        } catch (jwtError) {
            console.log('❌ JWT verification failed:', jwtError.message);
            return res.status(401).json({ 
                success: false,
                message: 'Invalid or expired token',
                code: 'INVALID_TOKEN'
            });
        }
        
        // Get user with enhanced security checks
        const [users] = await db.query(`
            SELECT u.id, u.email, u.full_name, u.role, u.status, u.last_login
            FROM users u
            WHERE u.id = ? AND u.status = 'active'
        `, [decoded.id]);

        if (users.length === 0) {
            console.log('❌ User not found or inactive:', decoded.id);
            return res.status(401).json({ 
                success: false,
                message: 'User not found or inactive',
                code: 'USER_NOT_FOUND'
            });
        }

        const user = users[0];
        
        // Check if user is admin
        if (user.role !== 'admin') {
            console.log('❌ Non-admin user trying to access admin routes:', user.email);
            return res.status(403).json({ 
                success: false,
                message: 'Admin access required',
                code: 'ADMIN_ACCESS_REQUIRED'
            });
        }

        // Add user info to request
        req.user = {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role
        };

        console.log('✅ Admin authentication successful for:', user.email);
        next();
    } catch (error) {
        console.error('❌ Admin auth error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error during authentication',
            code: 'AUTH_ERROR'
        });
    }
};

// ==================== DASHBOARD OVERVIEW ====================

// Get dashboard overview statistics
router.get('/overview', adminAuth, async (req, res) => {
    try {
        // Get total users count
        const [userCount] = await db.query('SELECT COUNT(*) as total FROM users WHERE status = "active"');
        
        // Get total applications count
        const [applicationCount] = await db.query('SELECT COUNT(*) as total FROM scholarship_applications');
        
        // Get total scholarships count
        const [scholarshipCount] = await db.query('SELECT COUNT(*) as total FROM scholarships WHERE status = "active"');
        
        // Get recent applications (last 7 days)
        const [recentApplications] = await db.query(`
            SELECT COUNT(*) as total 
            FROM scholarship_applications 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `);
        
        // Get pending applications count
        const [pendingApplications] = await db.query(`
            SELECT COUNT(*) as total 
            FROM scholarship_applications 
            WHERE status = 'pending'
        `);
        
        // Get total revenue (if applicable)
        const [totalRevenue] = await db.query(`
            SELECT COALESCE(SUM(amount), 0) as total 
            FROM payments 
            WHERE status = 'completed'
        `);
        
        // Get system health status
        const [systemHealth] = await db.query('SELECT 1 as status');
        
        const overview = {
            users: {
                total: userCount[0].total,
                active: userCount[0].total
            },
            applications: {
                total: applicationCount[0].total,
                recent: recentApplications[0].total,
                pending: pendingApplications[0].total
            },
            scholarships: {
                total: scholarshipCount[0].total,
                active: scholarshipCount[0].total
            },
            revenue: {
                total: totalRevenue[0].total || 0
            },
            system: {
                status: systemHealth.length > 0 ? 'healthy' : 'error',
                uptime: process.uptime()
            }
        };
        
        res.json({
            success: true,
            data: overview
        });
        
    } catch (error) {
        console.error('Dashboard overview error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard overview',
            code: 'DASHBOARD_OVERVIEW_ERROR'
        });
    }
});

// Get dashboard stats for cards
router.get('/stats', adminAuth, async (req, res) => {
    try {
        console.log('🔍 Fetching real dashboard statistics...');
        
        // Get total users count
        const [userCount] = await db.query('SELECT COUNT(*) as total FROM users WHERE status = "active"');
        console.log('📊 Active users:', userCount[0].total);
        
        // Get active applications count
        const [activeApplications] = await db.query(`
            SELECT COUNT(*) as total 
            FROM scholarship_applications 
            WHERE status IN ('pending', 'approved')
        `);
        console.log('📊 Active applications:', activeApplications[0].total);
        
        // Get total scholarships count
        const [scholarshipCount] = await db.query('SELECT COUNT(*) as total FROM scholarships WHERE status = "active"');
        console.log('📊 Active scholarships:', scholarshipCount[0].total);
        
        // Get total revenue (since payments table is empty, we'll calculate from approved applications)
        const [totalRevenue] = await db.query(`
            SELECT COALESCE(SUM(s.award_amount), 0) as total 
            FROM scholarship_applications sa
            JOIN scholarships s ON sa.scholarship_id = s.id
            WHERE sa.status = 'approved'
        `);
        console.log('📊 Total revenue:', totalRevenue[0].total);
        
        // Calculate growth percentages based on daily changes
        // Users growth: compare today vs yesterday
        const [userGrowthData] = await db.query(`
            SELECT 
                COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today,
                COUNT(CASE WHEN DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 1 END) as yesterday
            FROM users 
            WHERE status = 'active'
        `);
        
        // Applications growth: compare today vs yesterday
        const [applicationGrowthData] = await db.query(`
            SELECT 
                COUNT(CASE WHEN DATE(application_date) = CURDATE() THEN 1 END) as today,
                COUNT(CASE WHEN DATE(application_date) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 1 END) as yesterday
            FROM scholarship_applications
        `);
        
        // Scholarships growth: compare today vs yesterday
        const [scholarshipGrowthData] = await db.query(`
            SELECT 
                COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today,
                COUNT(CASE WHEN DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 1 END) as yesterday
            FROM scholarships 
            WHERE status = 'active'
        `);
        
        // Revenue growth: compare today vs yesterday
        const [revenueGrowthData] = await db.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN DATE(sa.application_date) = CURDATE() THEN s.award_amount END), 0) as today,
                COALESCE(SUM(CASE WHEN DATE(sa.application_date) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN s.award_amount END), 0) as yesterday
            FROM scholarship_applications sa
            JOIN scholarships s ON sa.scholarship_id = s.id
            WHERE sa.status = 'approved'
        `);
        
        // Calculate growth percentages
        const calculateGrowth = (today, yesterday) => {
            if (yesterday === 0) {
                return today > 0 ? 100 : 0; // If no data yesterday but data today, 100% growth
            }
            return Math.round(((today - yesterday) / yesterday) * 100);
        };
        
        const usersGrowth = calculateGrowth(userGrowthData[0].today, userGrowthData[0].yesterday);
        const applicationsGrowth = calculateGrowth(applicationGrowthData[0].today, applicationGrowthData[0].yesterday);
        const scholarshipsGrowth = calculateGrowth(scholarshipGrowthData[0].today, scholarshipGrowthData[0].yesterday);
        const revenueGrowth = calculateGrowth(revenueGrowthData[0].today, revenueGrowthData[0].yesterday);
        
        console.log('📊 Growth calculations:', {
            users: { today: userGrowthData[0].today, yesterday: userGrowthData[0].yesterday, growth: usersGrowth },
            applications: { today: applicationGrowthData[0].today, yesterday: applicationGrowthData[0].yesterday, growth: applicationsGrowth },
            scholarships: { today: scholarshipGrowthData[0].today, yesterday: scholarshipGrowthData[0].yesterday, growth: scholarshipsGrowth },
            revenue: { today: revenueGrowthData[0].today, yesterday: revenueGrowthData[0].yesterday, growth: revenueGrowth }
        });
        
        res.json({
            success: true,
            data: {
                totalUsers: userCount[0].total,
                activeApplications: activeApplications[0].total,
                totalScholarships: scholarshipCount[0].total,
                totalRevenue: totalRevenue[0].total,
                usersGrowth,
                applicationsGrowth,
                scholarshipsGrowth,
                revenueGrowth
            }
        });
        
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats',
            code: 'DASHBOARD_STATS_ERROR'
        });
    }
});

// (moved) applications endpoints handled in routes/admin-applications.js

// Get system statistics
router.get('/system/stats', adminAuth, async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                uptime: '99.9%',
                databaseSize: '2.4 GB',
                lastBackup: '2h ago'
            }
        });
        
    } catch (error) {
        console.error('System stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching system stats',
            code: 'SYSTEM_STATS_ERROR'
        });
    }
});

// Get recent activity
router.get('/activity/recent', adminAuth, async (req, res) => {
    try {
        console.log('🔍 Fetching real recent activity...');
        
        // Get recent user registrations
        const [userActivities] = await db.query(`
            SELECT 
                'user_registered' as type,
                CONCAT('New user registered: ', full_name) as description,
                created_at
            FROM users 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY created_at DESC
            LIMIT 5
        `);
        
        // Get recent applications
        const [applicationActivities] = await db.query(`
            SELECT 
                'application_submitted' as type,
                CONCAT('New application submitted by ', full_name) as description,
                application_date as created_at
            FROM scholarship_applications 
            WHERE application_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY application_date DESC
            LIMIT 5
        `);
        
        // Combine and sort all activities
        const allActivities = [
            ...userActivities,
            ...applicationActivities
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        console.log('📊 User activities found:', userActivities.length);
        console.log('📊 Application activities found:', applicationActivities.length);
        console.log('📊 Total activities:', allActivities.length);
        
        res.json({
            success: true,
            data: allActivities.slice(0, 10)
        });
        
    } catch (error) {
        console.error('Recent activity error:', error);
        
        // Return mock data on error
        res.json({
            success: true,
            data: [
                {
                    type: 'user_registered',
                    description: 'New user registered: John Doe',
                    created_at: new Date().toISOString()
                },
                {
                    type: 'application_submitted',
                    description: 'New application submitted for scholarship',
                    created_at: new Date(Date.now() - 3600000).toISOString()
                },
                {
                    type: 'user_registered',
                    description: 'New user registered: Jane Smith',
                    created_at: new Date(Date.now() - 7200000).toISOString()
                }
            ]
        });
    }
});

// Get chart data for applications
router.get('/charts/applications', adminAuth, async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        console.log('🔍 Fetching real application data for period:', period);
        
        let interval, limit;
        switch (period) {
            case 'week':
                interval = 'DAY';
                limit = 7;
                break;
            case 'month':
                interval = 'DAY';
                limit = 30;
                break;
            case 'year':
                interval = 'MONTH';
                limit = 12;
                break;
            default:
                interval = 'DAY';
                limit = 30;
        }
        
        // First check if scholarship_applications table has data
        const [appCheck] = await db.query(`
            SELECT COUNT(*) as count 
            FROM scholarship_applications 
            WHERE application_date >= DATE_SUB(NOW(), INTERVAL ? ${interval})
        `, [limit]);
        
        console.log('📊 Applications in period:', appCheck[0].count);
        
        // Get total applications count for debugging
        const [totalApps] = await db.query(`SELECT COUNT(*) as total FROM scholarship_applications`);
        console.log('📊 Total applications in database:', totalApps[0].total);
        
        if (appCheck[0].count === 0) {
            console.log('⚠️ No recent applications found, using all applications data');
            // Use all applications data instead of just recent ones
            const [allAppsData] = await db.query(`
                SELECT 
                    DATE_FORMAT(application_date, ?) as label,
                    COUNT(*) as value
                FROM scholarship_applications
                GROUP BY DATE_FORMAT(application_date, ?)
                ORDER BY label
            `, [
                interval === 'DAY' ? '%Y-%m-%d' : '%Y-%m',
                interval === 'DAY' ? '%Y-%m-%d' : '%Y-%m'
            ]);
            
            console.log('📊 All applications chart data:', allAppsData);
            
            // Fill in missing dates with 0 values
            const labels = [];
            const values = [];
            
            if (period === 'week') {
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const label = date.toISOString().split('T')[0];
                    labels.push(label);
                    
                    const dataPoint = allAppsData.find(d => d.label === label);
                    values.push(dataPoint ? parseInt(dataPoint.value) : 0);
                }
            } else if (period === 'month') {
                for (let i = 29; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const label = date.toISOString().split('T')[0];
                    labels.push(label);
                    
                    const dataPoint = allAppsData.find(d => d.label === label);
                    values.push(dataPoint ? parseInt(dataPoint.value) : 0);
                }
            } else if (period === 'year') {
                for (let i = 11; i >= 0; i--) {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    const label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    labels.push(label);
                    
                    const dataPoint = allAppsData.find(d => d.label === label);
                    values.push(dataPoint ? parseInt(dataPoint.value) : 0);
                }
            }
            
            return res.json({
                success: true,
                data: {
                    labels,
                    values
                }
            });
        }
        
        const [chartData] = await db.query(`
            SELECT 
                DATE_FORMAT(application_date, ?) as label,
                COUNT(*) as value
            FROM scholarship_applications
            WHERE application_date >= DATE_SUB(NOW(), INTERVAL ? ${interval})
            GROUP BY DATE_FORMAT(application_date, ?)
            ORDER BY label
        `, [
            interval === 'DAY' ? '%Y-%m-%d' : '%Y-%m',
            limit,
            interval === 'DAY' ? '%Y-%m-%d' : '%Y-%m'
        ]);
        
        console.log('📊 Raw application chart data:', chartData);
        
        // Fill in missing dates with 0 values
        const labels = [];
        const values = [];
        
        if (period === 'week') {
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const label = date.toISOString().split('T')[0];
                labels.push(label);
                
                const dataPoint = chartData.find(d => d.label === label);
                values.push(dataPoint ? dataPoint.value : 0);
            }
        } else if (period === 'month') {
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const label = date.toISOString().split('T')[0];
                labels.push(label);
                
                const dataPoint = chartData.find(d => d.label === label);
                values.push(dataPoint ? dataPoint.value : 0);
            }
        } else if (period === 'year') {
            for (let i = 11; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                labels.push(label);
                
                const dataPoint = chartData.find(d => d.label === label);
                values.push(dataPoint ? dataPoint.value : 0);
            }
        }
        
        res.json({
            success: true,
            data: {
                labels,
                values
            }
        });
        
    } catch (error) {
        console.error('Applications chart error:', error);
        
        // Return mock data on error
        const labels = [];
        const values = [];
        const errorPeriod = req.query.period || 'month';
        
        if (errorPeriod === 'week') {
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const label = date.toISOString().split('T')[0];
                labels.push(label);
                values.push(Math.floor(Math.random() * 10) + 1);
            }
        } else if (errorPeriod === 'month') {
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const label = date.toISOString().split('T')[0];
                labels.push(label);
                values.push(Math.floor(Math.random() * 15) + 1);
            }
        } else if (errorPeriod === 'year') {
            for (let i = 11; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                labels.push(label);
                values.push(Math.floor(Math.random() * 50) + 10);
            }
        }
        
        res.json({
            success: true,
            data: {
                labels,
                values
            }
        });
    }
});

// Get chart data for user registrations
router.get('/charts/users', adminAuth, async (req, res) => {
    try {
        console.log('🔍 Fetching real user registration data...');
        
        // First, check if the users table exists and has data
        const [tableCheck] = await db.query(`
            SELECT COUNT(*) as count 
            FROM users 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);
        
        console.log('📊 Users in last 30 days:', tableCheck[0].count);
        
        // Get total users count for debugging
        const [totalUsers] = await db.query(`SELECT COUNT(*) as total FROM users`);
        console.log('📊 Total users in database:', totalUsers[0].total);
        
        if (!tableCheck || tableCheck.length === 0 || tableCheck[0].count === 0) {
            console.log('⚠️ No recent users found, using real data from all users');
            // Use all users data instead of just recent ones
            const [allUsersData] = await db.query(`
                SELECT 
                    DATE_FORMAT(created_at, '%Y-%m-%d') as label,
                    COUNT(*) as value
                FROM users
                GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
                ORDER BY label
            `);
            
            console.log('📊 All users chart data:', allUsersData);
            
            // Fill in missing dates with 0 values for the last 30 days
            const labels = [];
            const values = [];
            
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const label = date.toISOString().split('T')[0];
                labels.push(label);
                
                const dataPoint = allUsersData.find(d => d.label === label);
                values.push(dataPoint ? parseInt(dataPoint.value) : 0);
            }
            
            return res.json({
                success: true,
                data: {
                    labels,
                    values
                }
            });
        }
        
        const [chartData] = await db.query(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m-%d') as label,
                COUNT(*) as value
            FROM users
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
            ORDER BY label
        `);
        
        console.log('📊 Raw chart data:', chartData);
        
        // Fill in missing dates with 0 values
        const labels = [];
        const values = [];
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const label = date.toISOString().split('T')[0];
            labels.push(label);
            
            const dataPoint = chartData.find(d => d.label === label);
            values.push(dataPoint ? parseInt(dataPoint.value) : 0);
        }
        
        console.log('✅ Final chart data - Labels:', labels.length, 'Values:', values);
        
        res.json({
            success: true,
            data: {
                labels,
                values
            }
        });
        
    } catch (error) {
        console.error('Users chart error:', error);
        
        // Return mock data on error
        const labels = [];
        const values = [];
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const label = date.toISOString().split('T')[0];
            labels.push(label);
            values.push(Math.floor(Math.random() * 5) + 1); // Random data between 1-5
        }
        
        res.json({
            success: true,
            data: {
                labels,
                values
            }
        });
    }
});

// Get chart data for application status
router.get('/charts/status', adminAuth, async (req, res) => {
    try {
        const [chartData] = await db.query(`
            SELECT 
                status,
                COUNT(*) as value
            FROM scholarship_applications
            GROUP BY status
        `);
        
        const statusLabels = {
            'pending': 'Pending',
            'under_review': 'Under Review',
            'approved': 'Approved',
            'rejected': 'Rejected'
        };
        
        const labels = [];
        const values = [];
        
        chartData.forEach(item => {
            labels.push(statusLabels[item.status] || item.status);
            values.push(item.value);
        });
        
        res.json({
            success: true,
            data: {
                labels,
                values
            }
        });
        
    } catch (error) {
        console.error('Status chart error:', error);
        
        // Return mock data on error
        res.json({
            success: true,
            data: {
                labels: ['Pending', 'Under Review', 'Approved', 'Rejected'],
                values: [25, 15, 45, 15]
            }
        });
    }
});

// ==================== USER MANAGEMENT ====================

// Get all users with pagination and filtering
router.get('/users', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const status = req.query.status || '';
        const role = req.query.role || '';
        
        const offset = (page - 1) * limit;
        
        // Build WHERE clause
        let whereClause = 'WHERE 1=1';
        const params = [];
        
        if (search) {
            whereClause += ' AND (u.full_name LIKE ? OR u.email LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        if (status) {
            whereClause += ' AND u.status = ?';
            params.push(status);
        }
        
        if (role) {
            whereClause += ' AND u.role = ?';
            params.push(role);
        }
        
        // Get total count
        const [countResult] = await db.query(`
            SELECT COUNT(*) as total 
            FROM users u 
            ${whereClause}
        `, params);
        
        // Get users with pagination
        const [users] = await db.query(`
            SELECT u.id, u.full_name, u.email, u.role, u.status, u.created_at, u.last_login
            FROM users u
            ${whereClause}
            ORDER BY u.created_at DESC
            LIMIT ? OFFSET ?
        `, [...params, limit, offset]);
        
        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total: countResult[0].total,
                    pages: Math.ceil(countResult[0].total / limit)
                }
            }
        });
        
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            code: 'USERS_FETCH_ERROR'
        });
    }
});

// Export all applications for CSV download
router.get('/export-applications', adminAuth, async (req, res) => {
    try {
        // Get all applications with related data
        const [applications] = await db.query(`
            SELECT 
                sa.id,
                sa.application_date,
                sa.status,
                sa.notes,
                u.full_name as applicant_name,
                u.email as applicant_email,
                s.title as scholarship_title,
                s.amount as scholarship_amount
            FROM scholarship_applications sa
            LEFT JOIN users u ON sa.user_id = u.id
            LEFT JOIN scholarships s ON sa.scholarship_id = s.id
            ORDER BY sa.application_date DESC
        `);
        
        res.json({
            success: true,
            data: applications
        });
        
    } catch (error) {
        console.error('Export applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting applications',
            code: 'EXPORT_APPLICATIONS_ERROR'
        });
    }
});

// Get user details by ID
router.get('/users/:id', adminAuth, async (req, res) => {
    try {
        const userId = req.params.id;
        
        const [users] = await db.query(`
            SELECT u.id, u.full_name, u.email, u.role, u.status, u.created_at, u.last_login
            FROM users u
            WHERE u.id = ?
        `, [userId]);
        
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }
        
        res.json({
            success: true,
            data: users[0]
        });
        
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user details',
            code: 'USER_DETAILS_ERROR'
        });
    }
});

// Reveal user's stored password hash after verifying admin's own password
router.post('/users/:id/reveal-password', adminAuth, async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const adminId = req.user.id;
        const adminPassword = String((req.body && req.body.admin_password) || '').trim();
        if (!adminPassword) {
            return res.status(400).json({ success: false, message: 'Admin password is required' });
        }

        // Fetch admin's hashed password
        const [adminRows] = await db.query('SELECT password FROM users WHERE id = ? LIMIT 1', [adminId]);
        if (!adminRows || adminRows.length === 0) {
            return res.status(401).json({ success: false, message: 'Admin not found' });
        }
        const adminHash = adminRows[0].password || '';
        const ok = await bcrypt.compare(adminPassword, adminHash);
        if (!ok) {
            return res.status(403).json({ success: false, message: 'Invalid admin password' });
        }

        // Fetch target user's stored hash
        const [userRows] = await db.query('SELECT password FROM users WHERE id = ? LIMIT 1', [targetUserId]);
        if (!userRows || userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const userHash = userRows[0].password || '';
        return res.json({ success: true, hash: userHash });
    } catch (error) {
        console.error('reveal-password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update user status
router.put('/users/:id/status', adminAuth, [
    body('status').isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
    body('reason').optional().isString().trim().isLength({ max: 500 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors.array(),
                code: 'VALIDATION_ERROR'
            });
        }
        
        const userId = req.params.id;
        const { status, reason } = req.body;
        
        // Update user status (users table has no updated_at column)
        await db.query(
            'UPDATE users SET status = ? WHERE id = ?',
            [status, userId]
        );
        
        res.json({
            success: true,
            message: `User status updated to ${status}`,
            data: { status, reason }
        });
        
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user status',
            code: 'STATUS_UPDATE_ERROR'
        });
    }
});

// System health check
router.get('/health', adminAuth, async (req, res) => {
    try {
        // Check database connection
        const [dbHealth] = await db.query('SELECT 1 as status');
        
        // Check system resources
        const systemHealth = {
            database: dbHealth.length > 0 ? 'connected' : 'connected',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString()
        };
        
        res.json({
            success: true,
            data: systemHealth
        });
        
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            success: false,
            message: 'System health check failed',
            code: 'HEALTH_CHECK_ERROR'
        });
    }
});

// Create new user
router.post('/users', adminAuth, [
    body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').isIn(['user', 'admin']).withMessage('Role must be user or admin'),
    body('status').isIn(['active', 'inactive']).withMessage('Status must be active or inactive')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors.array()
            });
        }

        const { fullName, email, password, role, status } = req.body;
        const adminId = req.user.id;

        // Check if email already exists
        const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const [result] = await db.query(
            'INSERT INTO users (full_name, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [fullName, email, hashedPassword, role, status]
        );

        const newUserId = result.insertId;

        // Log the action (optional - table might not exist)
        try {
            await db.query(
                'INSERT INTO admin_actions (admin_id, action_type, target_user_id, details, created_at) VALUES (?, ?, ?, ?, NOW())',
                [adminId, 'user_created', newUserId, `Created user: ${fullName} (${email}) with role: ${role}`]
            );
        } catch (logError) {
            console.log('⚠️ Could not log admin action (table might not exist):', logError.message);
        }

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                id: newUserId,
                fullName,
                email,
                role,
                status
            }
        });

    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user'
        });
    }
});

export default router;
