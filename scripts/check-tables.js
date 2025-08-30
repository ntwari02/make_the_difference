import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkTables() {
    let connection;
    
    try {
        // Connect to database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Loading99.99%',
            database: process.env.DB_NAME || 'mbappe',
            port: process.env.DB_PORT || 3306
        });

        console.log('🔐 Connected to database successfully');

        // Check what tables exist
        const [tables] = await connection.query('SHOW TABLES');
        console.log('\n📋 Existing tables:');
        tables.forEach(table => {
            console.log(`- ${Object.values(table)[0]}`);
        });

        // Check if help_requests table exists and its structure
        const [helpTableExists] = await connection.query('SHOW TABLES LIKE "help_requests"');
        
        if (helpTableExists.length > 0) {
            console.log('\n🔍 help_requests table structure:');
            const [columns] = await connection.query('DESCRIBE help_requests');
            columns.forEach(col => {
                console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
            });
        } else {
            console.log('\n❌ help_requests table does not exist');
        }

        // Check users table structure
        const [usersColumns] = await connection.query('DESCRIBE users');
        console.log('\n👥 users table structure:');
        usersColumns.forEach(col => {
            console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
        });

    } catch (error) {
        console.error('❌ Error checking tables:', error);
        console.error('Error details:', {
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage
        });
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔐 Database connection closed');
        }
    }
}

checkTables();
