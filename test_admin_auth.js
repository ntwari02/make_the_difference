import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function testAdminAuth() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Loading99.99%',
            database: process.env.DB_NAME || 'mbappe'
        });

        console.log('🔍 Testing admin authentication setup...\n');

        // Check for admin users in the users table
        console.log('1. Checking users with admin role:');
        const [adminUsers] = await connection.query(`
            SELECT id, full_name, email, role, status
            FROM users 
            WHERE role = 'admin'
        `);
        
        console.log(`Found ${adminUsers.length} admin users:`);
        adminUsers.forEach(user => {
            console.log(`  - ${user.full_name} (${user.email}) - Status: ${user.status}`);
        });

        // Check admin_users table
        console.log('\n2. Checking admin_users table:');
        try {
            const [adminTableUsers] = await connection.query(`
                SELECT au.*, u.full_name, u.email, u.status as user_status
                FROM admin_users au
                JOIN users u ON au.user_id = u.id
            `);
            
            console.log(`Found ${adminTableUsers.length} entries in admin_users:`);
            adminTableUsers.forEach(admin => {
                console.log(`  - ${admin.full_name} (${admin.email}) - Level: ${admin.admin_level}, Active: ${admin.is_active}`);
            });
        } catch (error) {
            console.log('  admin_users table might not exist or have issues:', error.message);
        }

        // Test login for first admin user
        if (adminUsers.length > 0) {
            const testUser = adminUsers[0];
            console.log(`\n3. Testing login for: ${testUser.email}`);
            
            // Try to get password and test bcrypt
            const [userWithPassword] = await connection.query(`
                SELECT password FROM users WHERE id = ?
            `, [testUser.id]);
            
            if (userWithPassword.length > 0) {
                console.log('  Password hash found in database');
                console.log('  You can test login with this user in your application');
                
                // Suggest creating a test admin if password is not hashed properly
                console.log('\n💡 To create a test admin account, run this in your database:');
                const testPassword = 'admin123';
                const hashedPassword = await bcrypt.hash(testPassword, 10);
                console.log(`
UPDATE users 
SET password = '${hashedPassword}' 
WHERE email = '${testUser.email}';
                `);
                console.log(`Then you can login with email: ${testUser.email} and password: ${testPassword}`);
            }
        } else {
            console.log('\n💡 No admin users found. Creating a test admin...');
            
            // Create a test admin user
            const testEmail = 'admin@test.com';
            const testPassword = 'admin123';
            const hashedPassword = await bcrypt.hash(testPassword, 10);
            
            try {
                const [result] = await connection.query(`
                    INSERT INTO users (full_name, email, password, role, status)
                    VALUES (?, ?, ?, ?, ?)
                `, ['Test Admin', testEmail, hashedPassword, 'admin', 'active']);
                
                console.log(`✅ Test admin created:`);
                console.log(`   Email: ${testEmail}`);
                console.log(`   Password: ${testPassword}`);
                console.log(`   You can now login with these credentials`);
                
            } catch (error) {
                console.log('❌ Error creating test admin:', error.message);
            }
        }

    } catch (error) {
        console.error('❌ Error testing admin auth:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testAdminAuth();
