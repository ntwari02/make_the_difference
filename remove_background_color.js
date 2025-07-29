import pool from './config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function removeBackgroundColor() {
    try {
        console.log('Removing background_color column from general_settings table...');
        
        // Read the SQL file
        const sqlPath = path.join(__dirname, 'database', 'remove_background_color.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        // Execute the SQL statement
        await pool.promise().query(sqlContent);
        
        console.log('✅ Background color column removed successfully!');
        console.log('📝 The background_color functionality has been completely removed from:');
        console.log('   - Frontend (admin_generalSettings.html)');
        console.log('   - Backend (routes/settings.js)');
        console.log('   - Database (general_settings table)');
        
    } catch (error) {
        console.error('❌ Error removing background color column:', error.message);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

removeBackgroundColor(); 