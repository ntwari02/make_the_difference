const { executeQuery } = require('../config/database');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function migrateImagesToFilePaths() {
  try {
    console.log('=== MIGRATING BASE64 IMAGES TO FILE PATHS ===');
    
    // Check spare parts with base64 images
    const sparePartsWithImages = await executeQuery(`
      SELECT id, name, images 
      FROM spare_parts 
      WHERE images IS NOT NULL 
      AND JSON_TYPE(images) = 'ARRAY'
      AND JSON_LENGTH(images) > 0
    `);
    
    console.log(`Found ${sparePartsWithImages.length} spare parts with images`);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const part of sparePartsWithImages) {
      try {
        console.log(`\nProcessing spare part: ${part.name} (${part.id})`);
        
        const images = Array.isArray(part.images) ? part.images : JSON.parse(part.images || '[]');
        const newImagePaths = [];
        
        // Create directory for this spare part
        const uploadsRoot = path.join(__dirname, 'uploads');
        const partDir = path.join(uploadsRoot, 'spare-parts', part.id);
        fs.mkdirSync(partDir, { recursive: true });
        
        for (let i = 0; i < images.length; i++) {
          const imageData = images[i];
          
          // Check if it's already a file path
          if (typeof imageData === 'string' && imageData.startsWith('/uploads/')) {
            console.log(`  Image ${i + 1}: Already a file path, skipping`);
            newImagePaths.push(imageData);
            continue;
          }
          
          // Check if it's base64 data
          if (typeof imageData === 'string' && imageData.startsWith('data:image/')) {
            console.log(`  Image ${i + 1}: Converting base64 to file...`);
            
            // Extract base64 data
            const base64Data = imageData.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            
            // Generate filename
            const timestamp = Date.now();
            const filename = `${timestamp}-migrated-image-${i + 1}.webp`;
            const filePath = path.join(partDir, filename);
            
            // Convert and optimize with Sharp
            await sharp(buffer)
              .rotate()
              .resize({ width: 1600, withoutEnlargement: true })
              .webp({ quality: 80, effort: 6 })
              .toFile(filePath);
            
            // Create thumbnail
            const thumbnailFilename = `thumb-${filename}`;
            const thumbnailPath = path.join(partDir, thumbnailFilename);
            await sharp(buffer)
              .rotate()
              .resize({ width: 300, withoutEnlargement: true })
              .webp({ quality: 70, effort: 6 })
              .toFile(thumbnailPath);
            
            const publicPath = `/uploads/spare-parts/${part.id}/${filename}`;
            newImagePaths.push(publicPath);
            
            console.log(`  Image ${i + 1}: Converted to ${publicPath}`);
          } else {
            console.log(`  Image ${i + 1}: Unknown format, skipping`);
            if (typeof imageData === 'string') {
              newImagePaths.push(imageData);
            }
          }
        }
        
        // Update database with new file paths
        if (newImagePaths.length > 0) {
          await executeQuery(
            'UPDATE spare_parts SET images = ? WHERE id = ?',
            [JSON.stringify(newImagePaths), part.id]
          );
          console.log(`  Updated database with ${newImagePaths.length} file paths`);
          migratedCount++;
        }
        
      } catch (error) {
        console.error(`  Error processing spare part ${part.id}:`, error.message);
        errorCount++;
      }
    }
    
    // Check cars with base64 images
    console.log('\n=== CHECKING CARS ===');
    const carsWithImages = await executeQuery(`
      SELECT id, title, images 
      FROM cars 
      WHERE images IS NOT NULL 
      AND JSON_TYPE(images) = 'ARRAY'
      AND JSON_LENGTH(images) > 0
    `);
    
    console.log(`Found ${carsWithImages.length} cars with images`);
    
    for (const car of carsWithImages) {
      try {
        console.log(`\nProcessing car: ${car.title} (${car.id})`);
        
        const images = Array.isArray(car.images) ? car.images : JSON.parse(car.images || '[]');
        const newImagePaths = [];
        
        // Create directory for this car
        const uploadsRoot = path.join(__dirname, 'uploads');
        const carDir = path.join(uploadsRoot, 'cars', car.id);
        fs.mkdirSync(carDir, { recursive: true });
        
        for (let i = 0; i < images.length; i++) {
          const imageData = images[i];
          
          // Check if it's already a file path
          if (typeof imageData === 'string' && imageData.startsWith('/uploads/')) {
            console.log(`  Image ${i + 1}: Already a file path, skipping`);
            newImagePaths.push(imageData);
            continue;
          }
          
          // Check if it's base64 data
          if (typeof imageData === 'string' && imageData.startsWith('data:image/')) {
            console.log(`  Image ${i + 1}: Converting base64 to file...`);
            
            // Extract base64 data
            const base64Data = imageData.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            
            // Generate filename
            const timestamp = Date.now();
            const filename = `${timestamp}-migrated-image-${i + 1}.webp`;
            const filePath = path.join(carDir, filename);
            
            // Convert and optimize with Sharp
            await sharp(buffer)
              .rotate()
              .resize({ width: 1600, withoutEnlargement: true })
              .webp({ quality: 80, effort: 6 })
              .toFile(filePath);
            
            // Create thumbnail
            const thumbnailFilename = `thumb-${filename}`;
            const thumbnailPath = path.join(carDir, thumbnailFilename);
            await sharp(buffer)
              .rotate()
              .resize({ width: 300, withoutEnlargement: true })
              .webp({ quality: 70, effort: 6 })
              .toFile(thumbnailPath);
            
            const publicPath = `/uploads/cars/${car.id}/${filename}`;
            newImagePaths.push(publicPath);
            
            console.log(`  Image ${i + 1}: Converted to ${publicPath}`);
          } else {
            console.log(`  Image ${i + 1}: Unknown format, skipping`);
            if (typeof imageData === 'string') {
              newImagePaths.push(imageData);
            }
          }
        }
        
        // Update database with new file paths
        if (newImagePaths.length > 0) {
          await executeQuery(
            'UPDATE cars SET images = ? WHERE id = ?',
            [JSON.stringify(newImagePaths), car.id]
          );
          console.log(`  Updated database with ${newImagePaths.length} file paths`);
          migratedCount++;
        }
        
      } catch (error) {
        console.error(`  Error processing car ${car.id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n=== MIGRATION SUMMARY ===');
    console.log(`✅ Successfully migrated: ${migratedCount} records`);
    console.log(`❌ Errors encountered: ${errorCount} records`);
    console.log('🎉 Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
  
  process.exit(0);
}

migrateImagesToFilePaths();
