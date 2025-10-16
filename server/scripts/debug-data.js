const { executeQuery } = require('../config/database');

async function checkData() {
  try {
    // Check if cars exist
    const cars = await executeQuery('SELECT COUNT(*) as count FROM cars WHERE seller_id = (SELECT id FROM users WHERE email = ?)', ['s@e.com']);
    console.log('Cars count:', cars[0].count);
    
    // Check seller analytics endpoint
    const sellerId = await executeQuery('SELECT id FROM users WHERE email = ? AND role = ?', ['s@e.com', 'seller']);
    console.log('Seller ID:', sellerId[0]?.id);
    
    // Test the analytics query directly
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_vehicles,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_listings,
        COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_vehicles,
        AVG(price) as average_price
      FROM cars 
      WHERE seller_id = ?
    `, [sellerId[0].id]);
    
    console.log('Direct stats query result:', stats[0]);
    
    // Check all cars for this seller
    const allCars = await executeQuery('SELECT id, title, status, price FROM cars WHERE seller_id = ?', [sellerId[0].id]);
    console.log('All cars:', allCars);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkData();
