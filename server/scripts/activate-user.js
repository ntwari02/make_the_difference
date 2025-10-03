const { executeQuery } = require('../config/database');

async function activateUser(email) {
  try {
    console.log(`Looking for user: ${email}`);
    
    // Check if user exists
    const users = await executeQuery(
      'SELECT id, email, is_active, is_verified FROM users WHERE email = ?',
      [email]
    );
    
    if (!users || users.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = users[0];
    console.log('User found:', {
      id: user.id,
      email: user.email,
      is_active: user.is_active,
      is_verified: user.is_verified
    });
    
    if (user.is_active) {
      console.log('✅ User is already active');
    } else {
      // Activate the user
      await executeQuery(
        'UPDATE users SET is_active = TRUE WHERE id = ?',
        [user.id]
      );
      console.log('✅ User activated successfully');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('Usage: node activate-user.js <email>');
  process.exit(1);
}

activateUser(email);

