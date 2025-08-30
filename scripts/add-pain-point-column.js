import db from '../config/database.js';

async function addPainPointColumn() {
    try {
        console.log('🔧 Adding pain_point column to help_requests table...');
        
        // Check if pain_point column already exists
        const [columns] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'mbappe' 
            AND TABLE_NAME = 'help_requests' 
            AND COLUMN_NAME = 'pain_point'
        `);
        
        if (columns.length > 0) {
            console.log('✅ pain_point column already exists');
            return;
        }
        
        // Add pain_point column
        await db.query(`
            ALTER TABLE help_requests 
            ADD COLUMN pain_point VARCHAR(50) DEFAULT 'general_inquiry' 
            AFTER email
        `);
        
        console.log('✅ pain_point column added successfully');
        
        // Update existing records to have a default pain point
        await db.query(`
            UPDATE help_requests 
            SET pain_point = 'general_inquiry' 
            WHERE pain_point IS NULL
        `);
        
        console.log('✅ Existing records updated with default pain point');
        
    } catch (error) {
        console.error('❌ Error adding pain_point column:', error);
    } finally {
        await db.end();
    }
}

// Run the migration
addPainPointColumn();
