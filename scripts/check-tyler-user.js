import db from '../config/database.js';

async function checkTylerUser() {
    try {
        console.log('🔍 Checking database for tyler@gmail.com user...\n');
        
        // Check users table
        const [users] = await db.query(`
            SELECT id, full_name, email, role, status, created_at, last_login, password
            FROM users 
            WHERE email = ?
        `, ['tyler@gmail.com']);
        
        if (users.length === 0) {
            console.log('❌ No user found with email: tyler@gmail.com');
            console.log('💡 This user needs to be created first');
            return;
        }
        
        const user = users[0];
        console.log('✅ User found in users table:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Full Name: ${user.full_name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Created: ${user.created_at}`);
        console.log(`   Last Login: ${user.last_login || 'Never'}`);
        console.log(`   Password Hash: ${user.password ? 'Exists' : 'Missing'}`);
        
        // Check admin_users table
        const [adminUsers] = await db.query(`
            SELECT admin_level, permissions, is_active, created_at
            FROM admin_users 
            WHERE user_id = ?
        `, [user.id]);
        
        if (adminUsers.length > 0) {
            const adminUser = adminUsers[0];
            console.log('\n🔐 Admin user details:');
            console.log(`   Admin Level: ${adminUser.admin_level}`);
            console.log(`   Permissions: ${adminUser.permissions || 'None'}`);
            console.log(`   Is Active: ${adminUser.is_active}`);
            console.log(`   Created: ${adminUser.created_at}`);
        } else {
            console.log('\n⚠️  User NOT found in admin_users table');
            console.log('💡 This user is NOT an admin - they will be redirected to home.html');
        }
        
        // Check if user has admin role
        if (user.role !== 'admin') {
            console.log('\n⚠️  User role is not "admin"');
            console.log(`   Current role: ${user.role}`);
            console.log(`   Required role: admin`);
            console.log('💡 User needs role="admin" to access admin dashboard');
        }
        
        console.log('\n📋 Summary:');
        console.log(`   Email: tyler@gmail.com`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Admin Status: ${adminUsers.length > 0 ? 'Yes' : 'No'}`);
        console.log(`   Redirected to: ${user.role === 'admin' && adminUsers.length > 0 ? 'admin_dashboard.html' : 'home.html'}`);
        
        if (user.role !== 'admin' || adminUsers.length === 0) {
            console.log('\n🔧 To fix this and make tyler@gmail.com an admin:');
            console.log('   1. Update user role to "admin" in users table');
            console.log('   2. Add entry in admin_users table');
            console.log('   3. Set admin_level and permissions');
        }
        
    } catch (error) {
        console.error('❌ Error checking tyler user:', error);
    } finally {
        process.exit(0);
    }
}

checkTylerUser();
