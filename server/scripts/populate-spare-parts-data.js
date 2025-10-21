const { executeQuery } = require('../config/database');

async function populateSparePartsData() {
  try {
    console.log('🚀 Starting to populate spare parts data...');

    // Insert categories
    const categories = [
      { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Brake System', description: 'Brake pads, rotors, calipers, and related components' },
      { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Engine & Lubrication', description: 'Engine oil, filters, and lubrication systems' },
      { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Air & Fuel System', description: 'Air filters, fuel filters, and intake systems' },
      { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Electrical System', description: 'Batteries, alternators, and electrical components' },
      { id: '550e8400-e29b-41d4-a716-446655440005', name: 'Suspension & Steering', description: 'Shocks, struts, and steering components' },
      { id: '550e8400-e29b-41d4-a716-446655440006', name: 'Exhaust System', description: 'Mufflers, catalytic converters, and exhaust pipes' },
    ];

    console.log('📦 Inserting categories...');
    for (const category of categories) {
      try {
        await executeQuery(`
          INSERT INTO spare_parts_categories (id, name, description, created_at, updated_at)
          VALUES (?, ?, ?, NOW(), NOW())
          ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), updated_at = NOW()
        `, [category.id, category.name, category.description]);
        console.log(`✅ Category inserted: ${category.name}`);
      } catch (error) {
        console.log(`⚠️  Category ${category.name} already exists or error:`, error.message);
      }
    }

    // Insert brands
    const brands = [
      { id: '550e8400-e29b-41d4-a716-446655440011', name: 'Bosch', logo_url: 'https://logos-world.net/wp-content/uploads/2021/08/Bosch-Logo.png' },
      { id: '550e8400-e29b-41d4-a716-446655440012', name: 'Mobil 1', logo_url: 'https://logos-world.net/wp-content/uploads/2021/08/Mobil-1-Logo.png' },
      { id: '550e8400-e29b-41d4-a716-446655440013', name: 'K&N', logo_url: 'https://logos-world.net/wp-content/uploads/2021/08/KN-Logo.png' },
      { id: '550e8400-e29b-41d4-a716-446655440014', name: 'ACDelco', logo_url: 'https://logos-world.net/wp-content/uploads/2021/08/ACDelco-Logo.png' },
      { id: '550e8400-e29b-41d4-a716-446655440015', name: 'NGK', logo_url: 'https://logos-world.net/wp-content/uploads/2021/08/NGK-Logo.png' },
    ];

    console.log('🏷️  Inserting brands...');
    for (const brand of brands) {
      try {
        await executeQuery(`
          INSERT INTO spare_parts_brands (id, name, logo_url, created_at, updated_at)
          VALUES (?, ?, ?, NOW(), NOW())
          ON DUPLICATE KEY UPDATE name = VALUES(name), logo_url = VALUES(logo_url), updated_at = NOW()
        `, [brand.id, brand.name, brand.logo_url]);
        console.log(`✅ Brand inserted: ${brand.name}`);
      } catch (error) {
        console.log(`⚠️  Brand ${brand.name} already exists or error:`, error.message);
      }
    }

    console.log('🎉 Spare parts data population completed successfully!');
    
    // Verify the data was inserted
    console.log('\n📊 Verification:');
    const categoryCount = await executeQuery('SELECT COUNT(*) as count FROM spare_parts_categories');
    const brandCount = await executeQuery('SELECT COUNT(*) as count FROM spare_parts_brands');
    
    console.log(`Categories in database: ${categoryCount[0].count}`);
    console.log(`Brands in database: ${brandCount[0].count}`);

  } catch (error) {
    console.error('❌ Error populating spare parts data:', error);
    throw error;
  }
}

// Run the script
populateSparePartsData()
  .then(() => {
    console.log('✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
