const { executeQuery } = require('../config/database');

async function checkUserSellerRelationship() {
  try {
    console.log('🔍 Checking user vs seller relationship...');
    const [users] = await executeQuery('SELECT id, email, first_name, last_name, role FROM users WHERE role = "seller"');
    const [sellers] = await executeQuery('SELECT id, user_id, business_name FROM sellers');
    
    console.log('Users:', users);
    console.log('Sellers:', sellers);
    
    // Check if there's a match
    const sellerUser = users.find(u => u.id === sellers[0]?.user_id);
    console.log('Matching seller user:', sellerUser);
    
    console.log('🎯 The issue: Frontend uses user.id but API needs seller.id');
    console.log('User ID:', users[0]?.id);
    console.log('Seller ID:', sellers[0]?.id);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkUserSellerRelationship();
