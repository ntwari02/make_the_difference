#!/usr/bin/env node

/**
 * Seed the database with sample help requests
 * Run with: node scripts/seed-help-data.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function seedHelpData() {
    let connection;
    
    try {
        // Connect to database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Loading99.99%',
            database: process.env.DB_NAME || 'mbappe',
            port: process.env.DB_PORT || 3306
        });

        console.log('🔐 Connected to database successfully');

        // Check if help_requests table exists
        const [tables] = await connection.query(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'help_requests'
        `, [process.env.DB_NAME || 'mbappe']);

        if (tables.length === 0) {
            console.log('❌ help_requests table does not exist. Please create it first.');
            return;
        } else {
            console.log('✅ help_requests table exists');
        }

        // Check if users exist
        const [users] = await connection.query('SELECT id, full_name, email FROM users LIMIT 5');
        
        if (users.length === 0) {
            console.log('❌ No users found in database. Please create some users first.');
            return;
        }

        console.log(`👥 Found ${users.length} users for seeding help requests`);

        // Sample help request data
        const helpRequests = [
            {
                user_id: users[0].id,
                email: users[0].email,
                subject: 'Login issues',
                message: 'I am unable to log into my account. Getting an error message.',
                status: 'pending'
            },
            {
                user_id: users[0].id,
                email: users[0].email,
                subject: 'Password reset',
                message: 'I forgot my password and need to reset it.',
                status: 'active'
            },
            {
                user_id: users[Math.min(1, users.length - 1)].id,
                email: users[Math.min(1, users.length - 1)].email,
                subject: 'Service availability',
                message: 'What services are available in my area?',
                status: 'pending'
            },
            {
                user_id: users[Math.min(2, users.length - 1)].id,
                email: users[Math.min(2, users.length - 1)].email,
                subject: 'Payment method update',
                message: 'I need to update my payment information.',
                status: 'pending'
            },
            {
                user_id: users[Math.min(3, users.length - 1)].id,
                email: users[Math.min(3, users.length - 1)].email,
                subject: 'Mobile app not working',
                message: 'The mobile application crashes when I try to open it.',
                status: 'resolved'
            }
        ];

        // Insert help requests
        console.log('📝 Inserting help requests...');
        for (const request of helpRequests) {
            await connection.query(`
                INSERT INTO help_requests (user_id, email, subject, message, status, created_at) 
                VALUES (?, ?, ?, ?, ?, NOW())
            `, [request.user_id, request.email, request.subject, request.message, request.status]);
        }

        console.log(`✅ Successfully inserted ${helpRequests.length} help requests`);

        // Show the created requests
        const [createdRequests] = await connection.query(`
            SELECT hr.*, u.full_name as user_name 
            FROM help_requests hr 
            JOIN users u ON hr.user_id = u.id 
            ORDER BY hr.created_at DESC
        `);

        console.log('\n📊 Created help requests:');
        createdRequests.forEach((request, index) => {
            console.log(`${index + 1}. [${request.status.toUpperCase()}] ${request.subject} - ${request.user_name}`);
        });

    } catch (error) {
        console.error('❌ Error seeding help data:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔐 Database connection closed');
        }
    }
}

// Run the seeding
seedHelpData();
