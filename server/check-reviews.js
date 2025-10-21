const { executeQuery } = require('./config/database');

async function checkReviews() {
  try {
    console.log('🔍 Checking actual review data...');
    
    const reviews = await executeQuery(
      'SELECT rating, COUNT(*) as count FROM seller_reviews WHERE seller_id = ? AND status = "active" GROUP BY rating ORDER BY rating DESC',
      ['d81f4eb1-a67f-4cc4-a685-04ca3cc30056']
    );
    
    console.log('📊 Actual rating distribution:', reviews);
    
    const avgRating = await executeQuery(
      'SELECT AVG(rating) as average_rating FROM seller_reviews WHERE seller_id = ? AND status = "active"',
      ['d81f4eb1-a67f-4cc4-a685-04ca3cc30056']
    );
    
    console.log('📊 Actual average rating:', avgRating);
    
    const allReviews = await executeQuery(
      'SELECT rating, first_name, last_name, title FROM seller_reviews WHERE seller_id = ? AND status = "active" ORDER BY created_at DESC',
      ['d81f4eb1-a67f-4cc4-a685-04ca3cc30056']
    );
    
    console.log('📊 All reviews:', allReviews);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkReviews();
