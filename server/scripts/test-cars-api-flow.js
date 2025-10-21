const { executeQuery } = require('../config/database');
const carsRepo = require('../ecommerce/repositories/cars.repository');

async function testCarsAPI() {
  try {
    console.log('=== TESTING CARS API DATA FLOW ===');
    
    // Test 1: Direct database query
    console.log('\n1. Direct database query:');
    const dbResults = await executeQuery(`
      SELECT id, title, images 
      FROM cars 
      WHERE images IS NOT NULL AND JSON_LENGTH(images) > 0 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    
    console.log('Database results:');
    dbResults.forEach(car => {
      console.log(`  - ${car.title}: ${car.images?.length} images`);
      console.log(`    Images: ${JSON.stringify(car.images)}`);
    });
    
    // Test 2: Repository layer
    console.log('\n2. Repository layer:');
    const repoResults = await carsRepo.listCars({ limit: 3 });
    
    console.log('Repository results:');
    repoResults.forEach(car => {
      console.log(`  - ${car.title}: ${car.images?.length} images`);
      console.log(`    Images: ${JSON.stringify(car.images)}`);
    });
    
    // Test 3: Service layer
    console.log('\n3. Service layer:');
    const service = require('../ecommerce/services/cars.service');
    const serviceResults = await service.listCars({ limit: 3 });
    
    console.log('Service results:');
    serviceResults.forEach(car => {
      console.log(`  - ${car.title}: ${car.images?.length} images`);
      console.log(`    Images: ${JSON.stringify(car.images)}`);
    });
    
    // Test 4: Check if images are accessible
    console.log('\n4. Image file accessibility:');
    const fs = require('fs');
    const path = require('path');
    
    for (const car of serviceResults) {
      if (car.images && car.images.length > 0) {
        for (const imagePath of car.images) {
          if (imagePath.startsWith('/uploads/')) {
            const fullPath = path.join(__dirname, '..', imagePath);
            const exists = fs.existsSync(fullPath);
            console.log(`  - ${imagePath}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
            if (exists) {
              const stats = fs.statSync(fullPath);
              console.log(`    Size: ${stats.size} bytes`);
            }
          }
        }
      }
    }
    
    console.log('\n=== TEST COMPLETE ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
  
  process.exit(0);
}

testCarsAPI();
