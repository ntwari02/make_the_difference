const { executeQuery } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function cleanupInvalidImages() {
  try {
    console.log('=== CLEANING UP INVALID IMAGE REFERENCES ===');
    
    const cars = await executeQuery(`
      SELECT id, title, images 
      FROM cars 
      WHERE images IS NOT NULL AND JSON_LENGTH(images) > 0
    `);
    
    console.log(`Found ${cars.length} cars with images`);
    
    for (const car of cars) {
      console.log(`\nProcessing: ${car.title}`);
      
      let images = car.images;
      
      // Handle different data types
      if (typeof images === 'string') {
        try {
          images = JSON.parse(images);
        } catch (error) {
          console.log('  ❌ Invalid JSON in images field');
          continue;
        }
      }
      
      if (!Array.isArray(images)) {
        console.log('  ❌ Images is not an array');
        continue;
      }
      
      const validImages = [];
      
      for (const imagePath of images) {
        if (typeof imagePath !== 'string') {
          console.log('  ❌ Image path is not a string:', typeof imagePath);
          continue;
        }
        
        if (imagePath.startsWith('/uploads/')) {
          const fullPath = path.join(__dirname, '..', imagePath);
          if (fs.existsSync(fullPath)) {
            validImages.push(imagePath);
            console.log('  ✅', imagePath, 'EXISTS');
          } else {
            console.log('  ❌', imagePath, 'NOT FOUND - removing');
          }
        } else if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
          validImages.push(imagePath);
          console.log('  ✅', imagePath, 'External URL - keeping');
        } else {
          console.log('  ❌', imagePath, 'Invalid format - removing');
        }
      }
      
      if (validImages.length !== images.length) {
        await executeQuery('UPDATE cars SET images = ? WHERE id = ?', [
          JSON.stringify(validImages), 
          car.id
        ]);
        console.log(`  🔄 Updated ${car.title}: ${images.length} → ${validImages.length} images`);
      } else {
        console.log(`  ✅ ${car.title}: All ${validImages.length} images are valid`);
      }
    }
    
    console.log('\n=== CLEANUP COMPLETE ===');
    
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
  
  process.exit(0);
}

cleanupInvalidImages();
