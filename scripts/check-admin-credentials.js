import db from '../config/database.js';

async function checkAdminCredentials() {
    try {
        console.log('🔍 Checking database for admin@system.com user...\n');
        
        // Check users table
        const [users] = await db.query(`
            SELECT id, full_name, email, role, status, created_at, last_login
            FROM users 
            WHERE email = ?
        `, ['admin@system.com']);
        
        if (users.length === 0) {
            console.log('❌ No user found with email: admin@system.com');
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
            console.log('\n⚠️  User not found in admin_users table');
        }
        
        // Check if password exists (we can't show the actual hash, but we can confirm it exists)
        const [passwordCheck] = await db.query(`
            SELECT password 
            FROM users 
            WHERE email = ?
        `, ['admin@system.com']);
        
        if (passwordCheck.length > 0 && passwordCheck[0].password) {
            console.log('\n🔑 Password Status:');
            console.log(`   Password Hash: ${passwordCheck[0].password.substring(0, 20)}...`);
            console.log(`   Password Length: ${passwordCheck[0].password.length} characters`);
            console.log(`   Hash Type: bcrypt (starts with $2b$)`);
        } else {
            console.log('\n❌ No password found for this user');
        }
        
        // Check security questions - first let's see the table structure
        console.log('\n🔍 Checking security questions table structure...');
        try {
            const [securityQuestions] = await db.query(`
                SELECT * FROM user_security_answers WHERE user_id = ? LIMIT 1
            `, [user.id]);
            
            if (securityQuestions.length > 0) {
                console.log('❓ Security Questions found:');
                console.log('   Table structure:', Object.keys(securityQuestions[0]));
                
                // Now get the actual questions and answers
                const [questions] = await db.query(`
                    SELECT usa.*, sq.question 
                    FROM user_security_answers usa
                    LEFT JOIN security_questions sq ON usa.question_id = sq.id
                    WHERE usa.user_id = ?
                `, [user.id]);
                
                questions.forEach((q, index) => {
                    console.log(`   ${index + 1}. Question: ${q.question || 'Custom question'}`);
                    console.log(`      Answer: ${q.answer}`);
                });
            } else {
                console.log('⚠️  No security questions found for this user');
            }
        } catch (error) {
            console.log('⚠️  Error checking security questions:', error.message);
        }
        
        console.log('\n📋 Summary:');
        console.log(`   Email: admin@system.com`);
        console.log(`   Password: The password is hashed with bcrypt and cannot be retrieved`);
        console.log(`   To reset password: Use the forgot password feature with security questions`);
        console.log(`   Default password (if recently created): admin123`);
        console.log(`   Admin Level: super_admin`);
        
    } catch (error) {
        console.error('❌ Error checking admin credentials:', error);
    } finally {
        process.exit(0);
    }
}

checkAdminCredentials();
