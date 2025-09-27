const fs = require('fs');
const path = require('path');
const { executeQuery } = require('../config/database');

async function runSqlFile(filePath) {
  try {
    console.log(`Reading SQL file: ${filePath}`);
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Handle DELIMITER statements and split properly
    let currentDelimiter = ';';
    let statements = [];
    let currentStatement = '';
    
    const lines = sqlContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip comments and empty lines
      if (trimmedLine.startsWith('--') || trimmedLine === '') {
        continue;
      }
      
      // Handle DELIMITER changes
      if (trimmedLine.startsWith('DELIMITER ')) {
        currentDelimiter = trimmedLine.replace('DELIMITER ', '').trim();
        continue;
      }
      
      currentStatement += line + '\n';
      
      // Check if statement ends with current delimiter
      if (currentStatement.trim().endsWith(currentDelimiter)) {
        const statement = currentStatement.trim().slice(0, -currentDelimiter.length).trim();
        if (statement.length > 0) {
          statements.push(statement);
        }
        currentStatement = '';
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          await executeQuery(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          // Continue with other statements unless it's a critical error
          if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log('⚠️  Table already exists, continuing...');
          } else if (error.code === 'ER_FK_CANNOT_DROP_PARENT') {
            console.log('⚠️  Cannot drop table due to foreign key constraint, continuing...');
          } else if (error.code === 'ER_NO_SUCH_TABLE') {
            console.log('⚠️  Table does not exist, continuing...');
          } else {
            throw error;
          }
        }
      }
    }
    
    console.log('✅ All SQL statements executed successfully');
  } catch (error) {
    console.error('❌ Error running SQL file:', error.message);
    process.exit(1);
  }
}

// Get file path from command line arguments
const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node runSqlFile.js <path-to-sql-file>');
  process.exit(1);
}

runSqlFile(filePath);
