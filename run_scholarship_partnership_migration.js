import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    let connection;
    
    try {
        // Connect to the database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Loading99.99%',
            database: process.env.DB_NAME || 'mbappe'
        });

        console.log('Connected to database');

        // Read and execute the migration file
        const migrationPath = path.join(__dirname, 'migrations', 'create_scholarship_documents_table.sql');
        const migrationContent = fs.readFileSync(migrationPath, 'utf8');

        console.log('Creating scholarship documents and partnership images tables...');
        
        // Split and execute statements
        const statements = migrationContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    await connection.query(statement);
                    console.log(`✓ Executed statement ${i + 1}/${statements.length}`);
                } catch (error) {
                    console.error(`✗ Error on statement ${i + 1}: ${error.message}`);
                    // Continue with other statements
                }
            }
        }

        console.log('✅ Migration completed successfully!');
        
        // Verify the tables were created
        const [tables] = await connection.query('SHOW TABLES LIKE "scholarship_documents"');
        if (tables.length > 0) {
            console.log('✅ scholarship_documents table created successfully');
        } else {
            console.log('⚠️ scholarship_documents table not found');
        }

        const [partnershipTables] = await connection.query('SHOW TABLES LIKE "partnership_images"');
        if (partnershipTables.length > 0) {
            console.log('✅ partnership_images table created successfully');
        } else {
            console.log('⚠️ partnership_images table not found');
        }

        const [notificationTables] = await connection.query('SHOW TABLES LIKE "user_notifications"');
        if (notificationTables.length > 0) {
            console.log('✅ user_notifications table created successfully');
        } else {
            console.log('⚠️ user_notifications table not found');
        }

    } catch (error) {
        console.error('❌ Error running migration:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔐 Database connection closed');
        }
    }
}

// Run the migration
if (process.argv[1] === __filename) {
    runMigration().catch(console.error);
}

export default runMigration;
