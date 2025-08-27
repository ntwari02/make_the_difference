import bcrypt from 'bcryptjs';
import db from '../config/database.js';

async function createAdminUser() {
    console.log('👨‍💼 Creating Admin User...\n');

    try {
        // Admin user details
        const adminData = {
            full_name: 'System Administrator',
            email: 'admin@system.com',
            password: 'AdminPassword123!',
            admin_level: 'super_admin',
            permissions: {
                users: ['read', 'write', 'delete'],
                applications: ['read', 'write', 'delete'],
                scholarships: ['read', 'write', 'delete'],
                settings: ['read', 'write'],
                analytics: ['read'],
                reports: ['read', 'write'],
                email_templates: ['read', 'write', 'delete'],
                admin_users: ['read', 'write', 'delete']
            }
        };

        console.log('📋 Admin User Details:');
        console.log(`   Name: ${adminData.full_name}`);
        console.log(`   Email: ${adminData.email}`);
        console.log(`   Password: ${adminData.password}`);
        console.log(`   Admin Level: ${adminData.admin_level}`);
        console.log(`   Permissions: ${JSON.stringify(adminData.permissions, null, 2)}`);

        // Check if admin already exists
        const [existingUsers] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [adminData.email]
        );

        if (existingUsers.length > 0) {
            console.log('⚠️ Admin user already exists! Updating...');
            
            const userId = existingUsers[0].id;
            
            // Update user password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminData.password, salt);
            
            await db.query(
                'UPDATE users SET password = ?, role = ?, status = ? WHERE id = ?',
                [hashedPassword, 'admin', 'active', userId]
            );

            // Update admin_users entry
            await db.query(
                `UPDATE admin_users SET 
                 full_name = ?, 
                 admin_level = ?, 
                 permissions = ?, 
                 is_active = TRUE,
                 updated_at = CURRENT_TIMESTAMP 
                 WHERE user_id = ?`,
                [adminData.full_name, adminData.admin_level, JSON.stringify(adminData.permissions), userId]
            );

            console.log('✅ Admin user updated successfully!');
            console.log(`   User ID: ${userId}`);
        } else {
            console.log('🆕 Creating new admin user...');
            
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminData.password, salt);

            // Start transaction
            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                // Insert into users table
                const [userResult] = await connection.query(
                    'INSERT INTO users (full_name, email, password, role, status, security_questions_setup) VALUES (?, ?, ?, ?, ?, ?)',
                    [adminData.full_name, adminData.email, hashedPassword, 'admin', 'active', true]
                );

                const userId = userResult.insertId;
                console.log(`   ✅ User created with ID: ${userId}`);

                // Insert into admin_users table
                const [adminResult] = await connection.query(
                    'INSERT INTO admin_users (user_id, full_name, email, admin_level, permissions, is_active) VALUES (?, ?, ?, ?, ?, ?)',
                    [userId, adminData.full_name, adminData.email, adminData.admin_level, JSON.stringify(adminData.permissions), true]
                );

                console.log(`   ✅ Admin user created with ID: ${adminResult.insertId}`);

                // Insert security questions for password reset functionality
                const securityQuestions = [
                    { question_id: 1, answer: 'Admin Pet' },
                    { question_id: 2, answer: 'Admin City' },
                    { question_id: 3, answer: 'Admin Maiden' }
                ];

                for (const question of securityQuestions) {
                    await connection.query(
                        'INSERT INTO user_security_answers (user_id, question_id, answer) VALUES (?, ?, ?)',
                        [userId, question.question_id, question.answer]
                    );
                }

                console.log('   ✅ Security questions added');

                // Insert admin account settings
                await connection.query(
                    `INSERT INTO admin_account_settings 
                     (user_id, full_name, email, position, bio, theme_preference, email_notifications) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [userId, adminData.full_name, adminData.email, 'System Administrator', 'Primary system administrator with full access', 'auto', true]
                );

                console.log('   ✅ Admin account settings added');

                // Insert admin login security
                await connection.query(
                    'INSERT INTO admin_login_security (user_id, two_factor_enabled) VALUES (?, ?)',
                    [userId, false]
                );

                console.log('   ✅ Admin login security added');

                await connection.commit();
                console.log('✅ Admin user created successfully!');

            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        }

        // Verify the admin user was created/updated
        const [verifyUser] = await db.query(
            `SELECT u.id, u.full_name, u.email, u.role, u.status,
                    au.admin_level, au.permissions, au.is_active
             FROM users u
             LEFT JOIN admin_users au ON u.id = au.user_id
             WHERE u.email = ?`,
            [adminData.email]
        );

        if (verifyUser.length > 0) {
            const user = verifyUser[0];
            console.log('\n🔍 Verification Results:');
            console.log(`   User ID: ${user.id}`);
            console.log(`   Name: ${user.full_name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Status: ${user.status}`);
            console.log(`   Admin Level: ${user.admin_level}`);
            console.log(`   Admin Active: ${user.is_active ? 'Yes' : 'No'}`);
            console.log(`   Permissions: ${user.permissions}`);
        }

        console.log('\n🎯 Admin User Setup Complete!');
        console.log('\n💡 Login Credentials:');
        console.log(`   Email: ${adminData.email}`);
        console.log(`   Password: ${adminData.password}`);
        console.log('\n🔧 Test the admin login:');
        console.log('   1. Open http://localhost:3000/login.html');
        console.log('   2. Use the credentials above');
        console.log('   3. Should redirect to admin_dashboard.html');
        console.log('   4. Check browser console for debug info');

        // Test the admin login API
        console.log('\n🧪 Testing Admin Login API...');
        try {
            const response = await fetch('http://localhost:3000/api/auth/admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: adminData.email,
                    password: adminData.password
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                console.log('✅ Admin login API test: PASSED');
                console.log(`   Token: ${data.token ? 'Received' : 'None'}`);
                console.log(`   User: ${data.user.full_name}`);
                console.log(`   Admin Level: ${data.user.adminLevel}`);
                console.log(`   Is Admin: ${data.user.isAdmin}`);
            } else {
                console.log('❌ Admin login API test: FAILED');
                console.log(`   Error: ${data.message}`);
            }
        } catch (error) {
            console.log('❌ Admin login API test: ERROR');
            console.log(`   Error: ${error.message}`);
        }

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

createAdminUser();
