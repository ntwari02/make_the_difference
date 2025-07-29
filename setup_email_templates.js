import pool from './config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupEmailTemplates() {
    try {
        console.log('Setting up email templates...');
        
        // Read the SQL file
        const sqlPath = path.join(__dirname, 'database', 'email_templates.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        // Split the SQL into individual statements
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);
        
        // Execute each statement
        for (const statement of statements) {
            if (statement.trim()) {
                await pool.promise().query(statement);
                console.log('Executed:', statement.substring(0, 50) + '...');
            }
        }
        
        console.log('✅ Email templates setup completed successfully!');
        console.log('📧 Default templates have been created:');
        console.log('   - Application Received');
        console.log('   - Application Approved');
        console.log('   - Application Rejected');
        console.log('   - Document Submission Reminder');
        console.log('   - Interview Schedule');
        
    } catch (error) {
        console.error('❌ Error setting up email templates:', error.message);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

setupEmailTemplates(); 