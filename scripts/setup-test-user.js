import bcrypt from 'bcryptjs';
import db from '../config/database.js';

async function setupTestUser() {
    try {
        console.log('Setting up test user...');
        
        // Test user data
        const testUser = {
            full_name: 'Test User',
            email: 'test@example.com',
            password: 'TestPassword123!',
            security_questions: [
                { question_id: 1, answer: 'Fluffy' }, // What was the name of your first pet?
                { question_id: 2, answer: 'New York' }, // In which city were you born?
                { question_id: 3, answer: 'Smith' } // What was your mother's maiden name?
            ]
        };

        // Check if user already exists
        const [existingUsers] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [testUser.email]
        );

        if (existingUsers.length > 0) {
            console.log('Test user already exists, updating security questions...');
            const userId = existingUsers[0].id;
            
            // Update user to have security questions set up
            await db.query(
                'UPDATE users SET security_questions_setup = ? WHERE id = ?',
                [true, userId]
            );

            // Clear existing security answers
            await db.query(
                'DELETE FROM user_security_answers WHERE user_id = ?',
                [userId]
            );

            // Add new security answers
            for (const question of testUser.security_questions) {
                await db.query(
                    'INSERT INTO user_security_answers (user_id, question_id, answer) VALUES (?, ?, ?)',
                    [userId, question.question_id, question.answer]
                );
            }

            console.log(`Test user updated successfully! User ID: ${userId}`);
        } else {
            console.log('Creating new test user...');
            
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(testUser.password, salt);

            // Start transaction
            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                // Insert new user
                const [result] = await connection.query(
                    'INSERT INTO users (full_name, email, password, security_questions_setup) VALUES (?, ?, ?, ?)',
                    [testUser.full_name, testUser.email, hashedPassword, true]
                );

                const userId = result.insertId;

                // Insert security question answers
                for (const question of testUser.security_questions) {
                    await connection.query(
                        'INSERT INTO user_security_answers (user_id, question_id, answer) VALUES (?, ?, ?)',
                        [userId, question.question_id, question.answer]
                    );
                }

                await connection.commit();
                console.log(`Test user created successfully! User ID: ${userId}`);
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        }

        console.log('\n=== Test User Details ===');
        console.log('Email: test@example.com');
        console.log('Password: TestPassword123!');
        console.log('Security Questions:');
        console.log('1. What was the name of your first pet? Answer: Fluffy');
        console.log('2. In which city were you born? Answer: New York');
        console.log('3. What was your mother\'s maiden name? Answer: Smith');
        console.log('\nYou can now test the forgot password functionality with this user!');

    } catch (error) {
        console.error('Error setting up test user:', error);
    } finally {
        process.exit(0);
    }
}

setupTestUser();
