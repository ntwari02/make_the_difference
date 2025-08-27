import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runAdvertisementMigration() {
    let connection;
    
    try {
        // Connect to the database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Loading99.99%',
            database: process.env.DB_NAME || 'mbappe',
            multipleStatements: true
        });

        console.log('Connected to MySQL database');

        // Read and execute the migration file
        const migrationPath = path.join(__dirname, 'migrations', 'add_advertisements_table.sql');
        const migrationContent = fs.readFileSync(migrationPath, 'utf8');

        console.log('📖 Reading advertisement migration file...');
        
        // Execute the migration
        await connection.query(migrationContent);
        console.log('✅ Advertisement table migration completed successfully!');
        
        // Verify the table was created
        const [tables] = await connection.query('SHOW TABLES LIKE "advertisements"');
        if (tables.length > 0) {
            console.log('✅ Advertisements table created successfully');
            
            // Check if sample data was inserted
            const [ads] = await connection.query('SELECT COUNT(*) as count FROM advertisements');
            console.log(`✅ ${ads[0].count} sample advertisements inserted`);
        } else {
            console.log('❌ Advertisements table was not created');
        }

    } catch (error) {
        console.error('❌ Error running advertisement migration:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔐 Database connection closed');
        }
    }
}

// Run the migration
runAdvertisementMigration().catch(console.error);
