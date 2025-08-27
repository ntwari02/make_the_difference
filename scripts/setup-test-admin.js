import bcrypt from 'bcryptjs';
import db from '../config/database.js';

async function setupTestAdmin() {
    try {
        console.log('Setting up test admin user...');
        
        // Test admin user data
        const testAdmin = {
            full_name: 'Test Admin',
            email: 'admin@example.com',
            password: 'AdminPassword123!',
            admin_level: 'admin',
            security_questions: [
                { question_id: 1, answer: 'Max' }, // What was the name of your first pet?
                { question_id: 2, answer: 'Los Angeles' }, // In which city were you born?
                { question_id: 3, answer: 'Johnson' } // What was your mother's maiden name?
            ]
        };

        // Check if admin already exists
        const [existingAdmins] = await db.query(
            'SELECT id, user_id FROM admin_users WHERE email = ?',
            [testAdmin.email]
        );

        if (existingAdmins.length > 0) {
            console.log('Test admin already exists, updating security questions...');
            const admin = existingAdmins[0];
            
            // Update user to have security questions set up
            await db.query(
                'UPDATE users SET security_questions_setup = ? WHERE id = ?',
                [true, admin.user_id]
            );

            // Clear existing security answers
            await db.query(
                'DELETE FROM user_security_answers WHERE user_id = ?',
                [admin.user_id]
            );

            // Add new security answers
            for (const question of testAdmin.security_questions) {
                await db.query(
                    'INSERT INTO user_security_answers (user_id, question_id, answer) VALUES (?, ?, ?)',
                    [admin.user_id, question.question_id, question.answer]
                );
            }

            console.log(`Test admin updated successfully! Admin ID: ${admin.id}, User ID: ${admin.user_id}`);
        } else {
            console.log('Creating new test admin user...');
            
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(testAdmin.password, salt);

            // Start transaction
            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                // Insert new user first
                const [userResult] = await connection.query(
                    'INSERT INTO users (full_name, email, password, role, security_questions_setup) VALUES (?, ?, ?, ?, ?)',
                    [testAdmin.full_name, testAdmin.email, hashedPassword, 'admin', true]
                );

                const userId = userResult.insertId;

                // Insert admin user
                const [adminResult] = await connection.query(
                    'INSERT INTO admin_users (user_id, full_name, email, admin_level, is_active) VALUES (?, ?, ?, ?, ?)',
                    [userId, testAdmin.full_name, testAdmin.email, testAdmin.admin_level, true]
                );

                const adminId = adminResult.insertId;

                // Insert security question answers
                for (const question of testAdmin.security_questions) {
                    await connection.query(
                        'INSERT INTO user_security_answers (user_id, question_id, answer) VALUES (?, ?, ?)',
                        [userId, question.question_id, question.answer]
                    );
                }

                await connection.commit();
                console.log(`Test admin created successfully! Admin ID: ${adminId}, User ID: ${userId}`);
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        }

        console.log('\n=== Test Admin User Details ===');
        console.log('Email: admin@example.com');
        console.log('Password: AdminPassword123!');
        console.log('Admin Level: admin');
        console.log('Security Questions:');
        console.log('1. What was the name of your first pet? Answer: Max');
        console.log('2. In which city were you born? Answer: Los Angeles');
        console.log('3. What was your mother\'s maiden name? Answer: Johnson');
        console.log('\nYou can now test the admin forgot password functionality with this user!');

    } catch (error) {
        console.error('Error setting up test admin:', error);
    } finally {
        process.exit(0);
    }
}

setupTestAdmin();
