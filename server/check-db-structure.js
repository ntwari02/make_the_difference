const { executeQuery } = require('./config/database');

async function checkDatabaseStructure() {
  try {
    console.log('🔍 Checking database structure...\n');
    
    // Get all tables
    console.log('📋 Tables in database:');
    const tables = await executeQuery('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    console.log(tableNames.join(', '));
    console.log(`\nTotal tables: ${tableNames.length}\n`);
    
    // Check each table structure
    for (const tableName of tableNames) {
      console.log(`\n📊 Table: ${tableName}`);
      console.log('─'.repeat(50));
      
      const columns = await executeQuery(`DESCRIBE ${tableName}`);
      columns.forEach(col => {
        console.log(`  ${col.Field.padEnd(20)} | ${col.Type.padEnd(15)} | ${col.Null} | ${col.Key} | ${col.Default || 'NULL'}`);
      });
    }
    
    // Check for specific problematic table
    if (tableNames.includes('system_settings')) {
      console.log('\n🔍 Checking system_settings table structure:');
      const systemSettingsCols = await executeQuery('DESCRIBE system_settings');
      systemSettingsCols.forEach(col => {
        console.log(`  ${col.Field} - ${col.Type}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking database structure:', error.message);
  } finally {
    process.exit(0);
  }
}

checkDatabaseStructure();
