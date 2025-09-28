const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../db/connection');

// Helper function to hash answers
function hashAnswer(answer) {
    return crypto.createHash('sha256').update(answer.toLowerCase().trim()).digest('hex');
}

// Helper function to verify answer
function verifyAnswer(providedAnswer, storedHash) {
    const providedHash = hashAnswer(providedAnswer);
    return providedHash === storedHash;
}

// Helper function to hash password
async function hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
}

// Helper function to verify password
async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

async function demonstratePasswordResetWithSecurityQuestions() {
    try {
        console.log('🔐 Password Reset with Security Questions Demo\n');

        // Step 1: Get a test user
        console.log('👤 Step 1: Finding a test user...');
        const [users] = await db.execute('SELECT id, email, first_name, last_name FROM users LIMIT 1');
        
        if (users.length === 0) {
            console.log('❌ No users found. Please create a user first.');
            return;
        }
        
        const user = users[0];
        console.log(`✅ Found user: ${user.first_name} ${user.last_name} (${user.email})`);
        
        // Step 2: Check if user has security questions set up
        console.log('\n🔍 Step 2: Checking user\'s security questions...');
        const [userSecurityQuestions] = await db.execute(`
            SELECT 
                usq.id,
                usq.question_id,
                sq.question_text,
                sq.category,
                usq.created_at
            FROM user_security_questions usq
            JOIN security_questions sq ON usq.question_id = sq.id
            WHERE usq.user_id = ?
            ORDER BY usq.created_at
        `, [user.id]);
        
        if (userSecurityQuestions.length === 0) {
            console.log('❌ User has no security questions set up. Setting up some test questions...');
            
            // Set up some test security questions
            const [sampleQuestions] = await db.execute(`
                SELECT id, question_text, category 
                FROM security_questions 
                WHERE is_active = 1 
                ORDER BY RAND() 
                LIMIT 3
            `);
            
            const testAnswers = [
                'MyMother123',
                'MyPetDog',
                'Blue'
            ];
            
            for (let i = 0; i < sampleQuestions.length; i++) {
                const question = sampleQuestions[i];
                const answer = testAnswers[i];
                const answerHash = hashAnswer(answer);
                
                await db.execute(`
                    INSERT INTO user_security_questions (user_id, question_id, answer_hash)
                    VALUES (?, ?, ?)
                `, [user.id, question.id, answerHash]);
                
                console.log(`   ✅ Set up: ${question.question_text}`);
                console.log(`      Answer: ${answer} (hashed)`);
            }
            
            // Refresh the user security questions
            const [updatedQuestions] = await db.execute(`
                SELECT 
                    usq.id,
                    usq.question_id,
                    sq.question_text,
                    sq.category,
                    usq.created_at
                FROM user_security_questions usq
                JOIN security_questions sq ON usq.question_id = sq.id
                WHERE usq.user_id = ?
                ORDER BY usq.created_at
            `, [user.id]);
            
            userSecurityQuestions.push(...updatedQuestions);
        }
        
        console.log(`✅ User has ${userSecurityQuestions.length} security questions set up:`);
        userSecurityQuestions.forEach((q, index) => {
            console.log(`   ${index + 1}. [${q.category}] ${q.question_text}`);
        });

        // Step 3: Simulate password reset request
        console.log('\n🔄 Step 3: Simulating password reset request...');
        console.log(`📧 User ${user.email} requests password reset`);
        console.log('🔐 System requires security question verification');
        
        // Step 4: Present security questions to user
        console.log('\n❓ Step 4: Presenting security questions for verification...');
        
        // Select 2 random questions for verification
        const [verificationQuestions] = await db.execute(`
            SELECT 
                usq.id,
                usq.question_id,
                sq.question_text,
                sq.category,
                usq.answer_hash
            FROM user_security_questions usq
            JOIN security_questions sq ON usq.question_id = sq.id
            WHERE usq.user_id = ?
            ORDER BY RAND()
            LIMIT 2
        `, [user.id]);
        
        console.log('📝 Please answer these security questions:');
        verificationQuestions.forEach((q, index) => {
            console.log(`   ${index + 1}. ${q.question_text}`);
        });

        // Step 5: Simulate user answering questions
        console.log('\n✍️ Step 5: Simulating user answers...');
        
        const userAnswers = [
            'MyMother123',  // Answer to first question
            'MyPetDog'      // Answer to second question
        ];
        
        let allAnswersCorrect = true;
        
        for (let i = 0; i < verificationQuestions.length; i++) {
            const question = verificationQuestions[i];
            const providedAnswer = userAnswers[i];
            const isCorrect = verifyAnswer(providedAnswer, question.answer_hash);
            
            console.log(`   Question ${i + 1}: ${question.question_text}`);
            console.log(`   Provided Answer: "${providedAnswer}"`);
            console.log(`   Verification: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
            
            if (!isCorrect) {
                allAnswersCorrect = false;
            }
        }

        // Step 6: Process password reset based on verification
        if (allAnswersCorrect) {
            console.log('\n✅ Step 6: Security questions verified successfully!');
            console.log('🔓 Proceeding with password reset...');
            
            // Get current password for comparison
            const [currentUserData] = await db.execute('SELECT password FROM users WHERE id = ?', [user.id]);
            const currentPassword = currentUserData[0].password;
            
            // Generate new password
            const newPassword = 'NewSecurePassword123!';
            const newPasswordHash = await hashPassword(newPassword);
            
            console.log(`   Current password hash: ${currentPassword.substring(0, 20)}...`);
            console.log(`   New password: ${newPassword}`);
            console.log(`   New password hash: ${newPasswordHash.substring(0, 20)}...`);
            
            // Update password in database
            await db.execute(`
                UPDATE users 
                SET password = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `, [newPasswordHash, user.id]);
            
            console.log('✅ Password updated successfully!');
            
            // Verify the new password works
            const [updatedUserData] = await db.execute('SELECT password FROM users WHERE id = ?', [user.id]);
            const passwordVerification = await verifyPassword(newPassword, updatedUserData[0].password);
            
            console.log(`🔍 Password verification: ${passwordVerification ? '✅ SUCCESS' : '❌ FAILED'}`);
            
            // Log the password reset event
            await db.execute(`
                INSERT INTO user_activity_logs (user_id, action, resource_type, metadata, created_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            `, [
                user.id, 
                'password_reset', 
                'user', 
                JSON.stringify({
                    method: 'security_questions',
                    questions_answered: verificationQuestions.length,
                    ip_address: '127.0.0.1',
                    user_agent: 'Password Reset Demo Script'
                })
            ]);
            
            console.log('📝 Password reset event logged');
            
        } else {
            console.log('\n❌ Step 6: Security question verification failed!');
            console.log('🚫 Password reset denied - insufficient verification');
            
            // Log failed attempt
            await db.execute(`
                INSERT INTO user_activity_logs (user_id, action, resource_type, metadata, created_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            `, [
                user.id, 
                'password_reset_failed', 
                'user', 
                JSON.stringify({
                    method: 'security_questions',
                    reason: 'incorrect_answers',
                    ip_address: '127.0.0.1',
                    user_agent: 'Password Reset Demo Script'
                })
            ]);
            
            console.log('📝 Failed attempt logged');
        }

        // Step 7: Show security recommendations
        console.log('\n🛡️ Step 7: Security Recommendations:');
        console.log('   • Users should set up at least 3 security questions');
        console.log('   • Answers should be memorable but not easily guessable');
        console.log('   • Consider requiring multiple questions for password reset');
        console.log('   • Log all password reset attempts for security monitoring');
        console.log('   • Consider rate limiting password reset attempts');

        console.log('\n🎉 Password Reset Demo Complete!');
        
    } catch (error) {
        console.error('❌ Demo failed:', error.message);
        throw error;
    } finally {
        // Close the database connection
        await db.end();
    }
}

// Run the demo
demonstratePasswordResetWithSecurityQuestions()
    .then(() => {
        console.log('\n✅ Password reset with security questions demo completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Demo failed:', error);
        process.exit(1);
    });
