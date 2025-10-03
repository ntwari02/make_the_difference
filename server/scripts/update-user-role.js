const readline = require('readline');
const db = require('../config/database');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function updateUserRole() {
  try {
    console.log('\n📝 Update User Role Script\n');
    
    const email = await question('Enter user email: ');
    const newRole = await question('Enter new role (dealer/student/instructor/admin/buyer/seller): ');
    
    const validRoles = ['dealer', 'student', 'instructor', 'admin', 'buyer', 'seller', 'university', 'visa_officer', 'advertiser'];
    
    if (!validRoles.includes(newRole)) {
      console.error(`❌ Invalid role. Valid roles: ${validRoles.join(', ')}`);
      rl.close();
      process.exit(1);
    }
    
    // Check if user exists
    const { executeQuery } = db;
    const users = await executeQuery(
      'SELECT id, email, role FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      console.error(`❌ User not found with email: ${email}`);
      rl.close();
      process.exit(1);
    }
    
    const user = users[0];
    console.log(`\n👤 Current user info:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Role: ${user.role}`);
    
    const confirm = await question(`\n⚠️  Change role from "${user.role}" to "${newRole}"? (yes/no): `);
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled');
      rl.close();
      process.exit(0);
    }
    
    // Update role
    await executeQuery(
      'UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?',
      [newRole, user.id]
    );
    
    console.log(`\n✅ Successfully updated user role to "${newRole}"`);
    console.log('🔄 Please logout and login again to apply the changes\n');
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating user role:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Run the script
updateUserRole();

