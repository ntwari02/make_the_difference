import db from '../config/database.js';

async function checkAdmin() {
    try {
        console.log('🔍 Checking admin user in database...\n');
        
        // Check users table
        const [users] = await db.query(
            'SELECT id, email, password, role, status FROM users WHERE email = ?',
            ['admin@system.com']
        );
        
        if (users.length > 0) {
            const user = users[0];
            console.log('✅ User found in users table:');
            console.log(`   ID: ${user.id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Status: ${user.status}`);
            console.log(`   Password hash: ${user.password.substring(0, 20)}...`);
        } else {
            console.log('❌ User not found in users table');
        }
        
        // Check admin_users table
        const [admins] = await db.query(
            'SELECT user_id, full_name, email, admin_level, permissions, is_active FROM admin_users WHERE email = ?',
            ['admin@system.com']
        );
        
        if (admins.length > 0) {
            const admin = admins[0];
            console.log('\n✅ Admin found in admin_users table:');
            console.log(`   User ID: ${admin.user_id}`);
            console.log(`   Full Name: ${admin.full_name}`);
            console.log(`   Email: ${admin.email}`);
            console.log(`   Admin Level: ${admin.admin_level}`);
            console.log(`   Is Active: ${admin.is_active}`);
            console.log(`   Permissions: ${admin.permissions}`);
        } else {
            console.log('\n❌ Admin not found in admin_users table');
        }
        
        // Test password verification
        if (users.length > 0) {
            console.log('\n🧪 Testing password verification...');
            const bcrypt = await import('bcryptjs');
            const testPassword = 'AdminPassword123!';
            const isMatch = await bcrypt.default.compare(testPassword, users[0].password);
            console.log(`   Password '${testPassword}' matches hash: ${isMatch ? '✅ YES' : '❌ NO'}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

checkAdmin();
