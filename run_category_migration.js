import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runCategoryMigration() {
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
        const migrationPath = path.join(__dirname, 'migrations', 'add_category_column.sql');
        const migrationContent = fs.readFileSync(migrationPath, 'utf8');

        console.log('📖 Reading category migration file...');
        
        // Execute the migration
        await connection.query(migrationContent);
        console.log('✅ Category column migration completed successfully!');
        
        // Verify the column was added
        const [columns] = await connection.query('SHOW COLUMNS FROM advertisements LIKE "category"');
        if (columns.length > 0) {
            console.log('✅ Category column added successfully');
            
            // Check the updated data
            const [ads] = await connection.query('SELECT id, title, category FROM advertisements');
            console.log('✅ Updated advertisements with categories:');
            ads.forEach(ad => {
                console.log(`   - ID ${ad.id}: "${ad.title}" (Category: ${ad.category})`);
            });
        } else {
            console.log('❌ Category column was not added');
        }

    } catch (error) {
        console.error('❌ Error running category migration:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔐 Database connection closed');
        }
    }
}

// Run the migration
runCategoryMigration().catch(console.error);
