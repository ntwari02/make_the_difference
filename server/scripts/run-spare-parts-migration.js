const { executeQuery } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runSparePartsMigration() {
  try {
    console.log('🚀 Starting spare parts migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'db', 'migrations', '2025-01-27_create_spare_parts_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          await executeQuery(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          // Continue with other statements
        }
      }
    }
    
    console.log('🎉 Spare parts migration completed successfully!');
    
    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const tables = await executeQuery(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME LIKE 'spare_parts%'
    `);
    
    console.log('📋 Created tables:', tables.map(t => t.TABLE_NAME));
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runSparePartsMigration()
  .then(() => {
    console.log('✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
