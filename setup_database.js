import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
    let connection;
    
    try {
        // First connect without specifying database to create it if it doesn't exist
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Loading99.99%',
            multipleStatements: true
        });

        console.log('Connected to MySQL server');

        // Create database if it doesn't exist
        const dbName = process.env.DB_NAME || 'mbappe';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`Database '${dbName}' created or already exists`);

        // Switch to the database
        await connection.query(`USE \`${dbName}\``);
        console.log(`Using database '${dbName}'`);

        // Read and execute the SQL dump file
        const sqlFilePath = path.join(__dirname, 'config', 'mbappe.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('📖 Reading SQL dump file...');
        
        // Execute the entire SQL file at once since it's a MySQL dump
        // MySQL dumps are designed to be executed as a single script
        try {
            await connection.query(sqlContent);
            console.log('✅ SQL dump executed successfully');
        } catch (error) {
            // If executing as one fails, try statement by statement
            console.log('⚠ Bulk execution failed, trying statement by statement...');
            
            // Clean and split SQL statements more carefully
            const statements = sqlContent
                .split('\n')
                .filter(line => !line.startsWith('--') && line.trim() !== '')
                .join('\n')
                .replace(/\/\*.*?\*\//g, '') // Remove /* */ comments
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.match(/^(LOCK|UNLOCK)/));

            console.log(`Found ${statements.length} SQL statements to execute`);

            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i];
                if (statement.trim()) {
                    try {
                        await connection.query(statement);
                        console.log(`✓ Executed statement ${i + 1}/${statements.length}`);
                    } catch (error) {
                        // Some statements might fail if tables already exist, which is okay
                        if (!error.message.includes('already exists') && 
                            !error.message.includes('DROP TABLE') &&
                            !error.message.includes('Duplicate entry')) {
                            console.warn(`⚠ Warning on statement ${i + 1}: ${error.message}`);
                        }
                    }
                }
            }
        }

        console.log('🎉 Database setup completed successfully!');
        
        // Verify tables were created
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`\n📊 Created ${tables.length} tables:`);
        tables.forEach(table => {
            console.log(`  - ${Object.values(table)[0]}`);
        });

    } catch (error) {
        console.error('❌ Error setting up database:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔐 Database connection closed');
        }
    }
}

// Run the setup
if (process.argv[1] === __filename) {
    setupDatabase().catch(console.error);
}

export default setupDatabase;
