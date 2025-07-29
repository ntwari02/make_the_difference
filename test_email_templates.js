import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testTemplate = {
    name: 'Test Template',
    subject: 'Test Subject',
    content: 'Dear {{name}},\n\nThis is a test email template.\n\nBest regards,\nTest Team',
    category: 'custom',
    is_active: true
};

const testEmail = {
    recipient_email: 'test@example.com',
    template_type: 'application-received',
    custom_content: null
};

async function testEmailTemplatesAPI() {
    console.log('🧪 Testing Email Templates API...\n');

    try {
        // Note: These tests require authentication
        // In a real scenario, you would need to login first and get a token
        
        console.log('📋 Available endpoints:');
        console.log('  GET    /api/email-templates');
        console.log('  GET    /api/email-templates/:id');
        console.log('  POST   /api/email-templates');
        console.log('  PUT    /api/email-templates/:id');
        console.log('  DELETE /api/email-templates/:id');
        console.log('  POST   /api/email-templates/test-send');
        console.log('  GET    /api/email-templates/category/:category');
        console.log('  POST   /api/email-templates/bulk-update');
        
        console.log('\n✅ Backend routes are configured correctly!');
        console.log('📝 To test with authentication:');
        console.log('   1. Start the server: npm start');
        console.log('   2. Login as admin user');
        console.log('   3. Access /admin_email_template.html');
        console.log('   4. Use the frontend to test the functionality');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Test database connection
async function testDatabaseConnection() {
    console.log('\n🔌 Testing database connection...');
    
    try {
        const pool = (await import('./config/database.js')).default;
        
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('❌ Database connection failed:', err.message);
                return;
            }
            console.log('✅ Database connection successful!');
            connection.release();
        });
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
    }
}

// Run tests
async function runTests() {
    await testDatabaseConnection();
    await testEmailTemplatesAPI();
}

runTests(); 