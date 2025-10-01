const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Railway MySQL connection configuration
const dbConfig = {
  host: 'tramway.proxy.rlwy.net',
  port: 54880,
  user: 'root',
  password: 'XOCwwEyAzulQupJJEmbKgiZFdsalhAaf',
  database: 'railway',
  ssl: { rejectUnauthorized: false }, // Required for Railway
  multipleStatements: true // Allow multiple SQL statements
};

async function runDatabaseSetup() {
  let connection;
  
  try {
    console.log('🚀 Connecting to Railway MySQL database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to Railway database successfully!\n');

    // Read the SQL file from parent directory
    const sqlFilePath = path.join(__dirname, '..', 'DATABASE_SETUP_COMMANDS.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split into individual statements (remove comments and empty lines)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('/*'))
      .map(stmt => stmt.replace(/--.*$/gm, '').trim()) // Remove inline comments
      .filter(stmt => stmt.length > 0);

    console.log(`📝 Found ${statements.length} SQL statements to execute...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (!statement) continue;
      
      try {
        console.log(`🔄 Executing statement ${i + 1}/${statements.length}...`);
        console.log(`   ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
        
        await connection.execute(statement);
        successCount++;
        console.log(`   ✅ Success\n`);
        
      } catch (error) {
        // Some errors are expected (like table already exists)
        if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
            error.code === 'ER_DUP_KEYNAME' || 
            error.code === 'ER_CANT_DROP_FIELD_OR_KEY' ||
            error.message.includes('already exists')) {
          console.log(`   ⚠️  Skipped (already exists): ${error.message}\n`);
        } else {
          console.log(`   ❌ Error: ${error.message}\n`);
          errorCount++;
        }
      }
    }

    console.log('🎉 Database setup completed!');
    console.log(`📊 Results: ${successCount} successful, ${errorCount} errors\n`);

    // Verify the tables were created
    console.log('🔍 Verifying new tables...');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'railway' 
      AND TABLE_NAME IN ('dealer_reviews', 'content_moderation', 'user_reports', 'user_moderation')
      ORDER BY TABLE_NAME
    `);

    if (tables.length > 0) {
      console.log('✅ Successfully created tables:');
      tables.forEach(table => {
        console.log(`   • ${table.TABLE_NAME}`);
      });
    } else {
      console.log('❌ No new tables found. Check the errors above.');
    }

    // Check content_flags table updates
    console.log('\n🔍 Checking content_flags table updates...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'railway' 
      AND TABLE_NAME = 'content_flags' 
      AND COLUMN_NAME IN ('priority', 'user_id')
      ORDER BY COLUMN_NAME
    `);

    if (columns.length > 0) {
      console.log('✅ Successfully added columns to content_flags:');
      columns.forEach(col => {
        console.log(`   • ${col.COLUMN_NAME}`);
      });
    }

    console.log('\n🚀 Your User Role APIs are now ready to use!');
    console.log('📋 Next steps:');
    console.log('   1. Start your server: npm run dev');
    console.log('   2. Test the APIs using the documentation in USER_ROLE_APIS_DOCUMENTATION.md');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed.');
    }
  }
}

// Run the setup
runDatabaseSetup();
