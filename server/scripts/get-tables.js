const { executeQuery } = require('../config/database');

async function getAllTables() {
  try {
    console.log('🔍 Fetching all tables from database...\n');
    
    // Get all tables
    const tables = await executeQuery('SHOW TABLES');
    
    console.log('📋 Current tables in database:');
    console.log('================================');
    
    if (tables.length === 0) {
      console.log('❌ No tables found in the database');
      return [];
    }
    
    const tableNames = [];
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0]; // Get the table name from the result object
      tableNames.push(tableName);
      console.log(`${index + 1}. ${tableName}`);
    });
    
    console.log(`\n📊 Total tables: ${tables.length}`);
    
    // Get detailed information about each table
    console.log('\n🔍 Detailed table information:');
    console.log('================================');
    
    for (const tableName of tableNames) {
      console.log(`\n📋 Table: ${tableName}`);
      console.log('─'.repeat(50));
      
      try {
        // Get table structure
        const structure = await executeQuery(`DESCRIBE ${tableName}`);
        console.log('Columns:');
        structure.forEach(col => {
          console.log(`  • ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
        });
        
        // Get row count
        const countResult = await executeQuery(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`  Row count: ${countResult[0].count}`);
        
      } catch (error) {
        console.log(`  ❌ Error getting details for ${tableName}: ${error.message}`);
      }
    }
    
    return tableNames;
    
  } catch (error) {
    console.error('❌ Error fetching tables:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  getAllTables()
    .then(() => {
      console.log('\n✅ Table inspection completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { getAllTables };
