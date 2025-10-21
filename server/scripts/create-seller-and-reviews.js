const { executeQuery } = require('../config/database');

async function createSellerAndReviews() {
  try {
    console.log('🔍 Checking for existing users...');
    
    // Get the first user from the database
    const [users] = await executeQuery('SELECT id, first_name, last_name, email FROM users LIMIT 1');
    
    if (users.length === 0) {
      console.log('❌ No users found in database. Please create a user account first.');
      return;
    }
    
    const user = users[0];
    console.log(`✅ Found user: ${user.first_name} ${user.last_name} (${user.email})`);
    
    // Check if user already has a seller profile
    const [existingSeller] = await executeQuery('SELECT id FROM sellers WHERE user_id = ?', [user.id]);
    
    let sellerId;
    if (existingSeller.length > 0) {
      sellerId = existingSeller[0].id;
      console.log(`✅ User already has seller profile: ${sellerId}`);
    } else {
      // Create seller profile
      sellerId = require('crypto').randomUUID();
      await executeQuery(
        `INSERT INTO sellers (
          id, user_id, business_name, business_type, status, 
          rating, review_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          sellerId,
          user.id,
          `${user.first_name}'s Auto Sales`,
          'Independent Seller',
          'active',
          0.0,
          0
        ]
      );
      console.log(`✅ Created seller profile: ${sellerId}`);
    }
    
    // Get other users to create reviews
    const [reviewers] = await executeQuery('SELECT id, first_name, last_name FROM users WHERE id != ? LIMIT 5', [user.id]);
    
    if (reviewers.length === 0) {
      console.log('❌ No other users found to create reviews. Creating reviews with anonymous users...');
      
      // Create some anonymous reviews
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
      
      console.log('📝 Adding sample reviews with anonymous users...');
      
      for (let i = 0; i < sampleReviews.length; i++) {
        const review = sampleReviews[i];
        const reviewId = require('crypto').randomUUID();
        const anonymousUserId = require('crypto').randomUUID();
        
        // Create anonymous user for the review
        await executeQuery(
          `INSERT INTO users (id, email, password, first_name, last_name, role, is_active, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            anonymousUserId,
            `reviewer${i + 1}@example.com`,
            'hashed_password',
            `Reviewer${i + 1}`,
            'User',
            'buyer',
            1
          ]
        );
        
        await executeQuery(
          `INSERT INTO seller_reviews (
            id, seller_id, user_id, rating, title, comment, purchase_type, 
            is_verified, helpful_count, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            reviewId,
            sellerId,
            anonymousUserId,
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
    } else {
      console.log(`✅ Found ${reviewers.length} users to create reviews`);
      
      // Create reviews with existing users
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
        }
      ];
      
      for (let i = 0; i < Math.min(sampleReviews.length, reviewers.length); i++) {
        const review = sampleReviews[i];
        const reviewer = reviewers[i];
        const reviewId = require('crypto').randomUUID();
        
        await executeQuery(
          `INSERT INTO seller_reviews (
            id, seller_id, user_id, rating, title, comment, purchase_type, 
            is_verified, helpful_count, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            reviewId,
            sellerId,
            reviewer.id,
            review.rating,
            review.title,
            review.comment,
            review.purchase_type,
            review.is_verified ? 1 : 0,
            review.helpful_count,
            'active'
          ]
        );
        
        console.log(`✅ Added review ${i + 1}: ${review.title} (${review.rating} stars) by ${reviewer.first_name}`);
      }
    }
    
    // Update seller rating statistics
    console.log('📊 Updating seller rating statistics...');
    const [stats] = await executeQuery(
      `SELECT 
         AVG(rating) as avg_rating,
         COUNT(*) as review_count
       FROM seller_reviews 
       WHERE seller_id = ? AND status = "active"`,
      [sellerId]
    );
    
    const avgRating = stats[0].avg_rating ? parseFloat(stats[0].avg_rating.toFixed(2)) : 0;
    const reviewCount = stats[0].review_count;
    
    await executeQuery(
      'UPDATE sellers SET rating = ?, review_count = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [avgRating, reviewCount, sellerId]
    );
    
    console.log(`✅ Updated seller statistics: ${avgRating} average rating, ${reviewCount} reviews`);
    console.log('🎉 Sample reviews added successfully!');
    console.log(`🔗 Visit http://localhost:5173/seller/reviews to see the reviews`);
    console.log(`📝 Seller ID: ${sellerId}`);
    
  } catch (error) {
    console.error('❌ Error adding sample reviews:', error);
  }
}

// Run the script
createSellerAndReviews().then(() => {
  console.log('✅ Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
