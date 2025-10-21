const { executeQuery } = require('../config/database');

async function checkData() {
  try {
    console.log('🔍 Checking sellers in database...');
    const [sellers] = await executeQuery('SELECT id, user_id, business_name, rating, review_count FROM sellers');
    console.log('Sellers found:', sellers);
    
    console.log('🔍 Checking seller reviews...');
    const [reviews] = await executeQuery('SELECT id, seller_id, rating, title FROM seller_reviews');
    console.log('Reviews found:', reviews);
    
    console.log('🔍 Checking users...');
    const [users] = await executeQuery('SELECT id, email, first_name, last_name, role FROM users WHERE role = "seller"');
    console.log('Seller users found:', users);
    
    if (sellers.length > 0 && reviews.length > 0) {
      console.log('✅ Data exists in database');
      console.log('🔗 The issue is likely that the frontend is looking for a different seller ID');
      console.log('📝 Seller ID in DB:', sellers[0].id);
      console.log('📝 Reviews for seller:', reviews.filter(r => r.seller_id === sellers[0].id).length);
    } else {
      console.log('❌ No data found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkData();
