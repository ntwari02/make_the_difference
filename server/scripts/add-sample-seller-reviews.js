const { executeQuery } = require('../config/database');

async function addSampleSellerReviews() {
  try {
    console.log('🔍 Checking for existing sellers...');
    
    // Get the first seller from the database
    const [sellers] = await executeQuery('SELECT id, user_id FROM sellers LIMIT 1');
    
    if (sellers.length === 0) {
      console.log('❌ No sellers found in database. Please create a seller profile first.');
      return;
    }
    
    const seller = sellers[0];
    console.log(`✅ Found seller: ${seller.id}`);
    
    // Get some users to create reviews
    const [users] = await executeQuery('SELECT id, first_name, last_name FROM users WHERE role != "seller" LIMIT 5');
    
    if (users.length === 0) {
      console.log('❌ No users found to create reviews. Please create some user accounts first.');
      return;
    }
    
    console.log(`✅ Found ${users.length} users to create reviews`);
    
    // Sample review data
    const sampleReviews = [
      {
        rating: 5,
        title: "Excellent Service!",
        comment: "The seller was very professional and the car was exactly as described. Highly recommend!",
        purchase_type: "car_purchase",
        is_verified: true,
        helpful_count: 12
      },
      {
        rating: 4,
        title: "Good Experience",
        comment: "Smooth transaction and good communication throughout the process.",
        purchase_type: "car_purchase",
        is_verified: true,
        helpful_count: 8
      },
      {
        rating: 5,
        title: "Outstanding!",
        comment: "The vehicle exceeded my expectations. The seller was honest and helpful.",
        purchase_type: "service",
        is_verified: false,
        helpful_count: 15
      },
      {
        rating: 3,
        title: "Average Experience",
        comment: "The car was okay, but the communication could have been better.",
        purchase_type: "car_purchase",
        is_verified: true,
        helpful_count: 3
      },
      {
        rating: 5,
        title: "Perfect Transaction",
        comment: "Fast response, fair pricing, and the car was in excellent condition. Will definitely buy again!",
        purchase_type: "car_purchase",
        is_verified: true,
        helpful_count: 20
      }
    ];
    
    console.log('📝 Adding sample reviews...');
    
    for (let i = 0; i < Math.min(sampleReviews.length, users.length); i++) {
      const review = sampleReviews[i];
      const user = users[i];
      const reviewId = require('crypto').randomUUID();
      
      await executeQuery(
        `INSERT INTO seller_reviews (
          id, seller_id, user_id, rating, title, comment, purchase_type, 
          is_verified, helpful_count, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          reviewId,
          seller.id,
          user.id,
          review.rating,
          review.title,
          review.comment,
          review.purchase_type,
          review.is_verified ? 1 : 0,
          review.helpful_count,
          'active'
        ]
      );
      
      console.log(`✅ Added review ${i + 1}: ${review.title} (${review.rating} stars)`);
    }
    
    // Update seller rating statistics
    console.log('📊 Updating seller rating statistics...');
    const [stats] = await executeQuery(
      `SELECT 
         AVG(rating) as avg_rating,
         COUNT(*) as review_count
       FROM seller_reviews 
       WHERE seller_id = ? AND status = "active"`,
      [seller.id]
    );
    
    const avgRating = stats[0].avg_rating ? parseFloat(stats[0].avg_rating.toFixed(2)) : 0;
    const reviewCount = stats[0].review_count;
    
    await executeQuery(
      'UPDATE sellers SET rating = ?, review_count = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [avgRating, reviewCount, seller.id]
    );
    
    console.log(`✅ Updated seller statistics: ${avgRating} average rating, ${reviewCount} reviews`);
    console.log('🎉 Sample reviews added successfully!');
    console.log(`🔗 Visit http://localhost:5173/seller/reviews to see the reviews`);
    
  } catch (error) {
    console.error('❌ Error adding sample reviews:', error);
  }
}

// Run the script
addSampleSellerReviews().then(() => {
  console.log('✅ Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
