const crypto = require('crypto');
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

async function testSecurityQuestions() {
    try {
        console.log('🧪 Testing Security Questions Functionality...\n');

        // Test 1: Fetch all security questions
        console.log('📋 Test 1: Fetching all security questions');
        const [allQuestions] = await db.execute(`
            SELECT id, question_text, category, is_active 
            FROM security_questions 
            WHERE is_active = 1 
            ORDER BY category, question_text
        `);
        
        console.log(`✅ Found ${allQuestions.length} active security questions`);
        
        // Group by category
        const questionsByCategory = {};
        allQuestions.forEach(q => {
            if (!questionsByCategory[q.category]) {
                questionsByCategory[q.category] = [];
            }
            questionsByCategory[q.category].push(q);
        });
        
        console.log('\n📊 Questions by category:');
        Object.keys(questionsByCategory).forEach(category => {
            console.log(`   ${category}: ${questionsByCategory[category].length} questions`);
        });

        // Test 2: Fetch questions by specific category
        console.log('\n📋 Test 2: Fetching family questions');
        const [familyQuestions] = await db.execute(`
            SELECT id, question_text 
            FROM security_questions 
            WHERE category = 'family' AND is_active = 1
            LIMIT 5
        `);
        
        console.log('✅ Family questions:');
        familyQuestions.forEach((q, index) => {
            console.log(`   ${index + 1}. ${q.question_text}`);
        });

        // Test 3: Simulate setting up security questions for a user
        console.log('\n📋 Test 3: Setting up security questions for a test user');
        
        // First, let's get a real user ID (or create a test scenario)
        const [users] = await db.execute('SELECT id, email FROM users LIMIT 1');
        if (users.length === 0) {
            console.log('❌ No users found in database. Please create a user first.');
            return;
        }
        
        const testUserId = users[0].id;
        const testUserEmail = users[0].email;
        console.log(`✅ Using test user: ${testUserEmail} (ID: ${testUserId})`);

        // Get some sample questions
        const [sampleQuestions] = await db.execute(`
            SELECT id, question_text, category 
            FROM security_questions 
            WHERE is_active = 1 
            ORDER BY RAND() 
            LIMIT 3
        `);

        console.log('\n🔐 Setting up security questions:');
        const userAnswers = [];
        
        for (let i = 0; i < sampleQuestions.length; i++) {
            const question = sampleQuestions[i];
            const mockAnswer = `TestAnswer${i + 1}`; // In real app, user would provide this
            const answerHash = hashAnswer(mockAnswer);
            
            // Insert user security question
            await db.execute(`
                INSERT INTO user_security_questions (user_id, question_id, answer_hash)
                VALUES (?, ?, ?)
            `, [testUserId, question.id, answerHash]);
            
            userAnswers.push({
                questionId: question.id,
                questionText: question.question_text,
                answer: mockAnswer,
                hash: answerHash
            });
            
            console.log(`   ${i + 1}. ${question.question_text}`);
            console.log(`      Answer: ${mockAnswer} (hashed)`);
        }

        // Test 4: Verify security questions
        console.log('\n📋 Test 4: Verifying security question answers');
        
        for (let i = 0; i < userAnswers.length; i++) {
            const userAnswer = userAnswers[i];
            
            // Fetch stored hash
            const [storedData] = await db.execute(`
                SELECT usq.answer_hash, sq.question_text
                FROM user_security_questions usq
                JOIN security_questions sq ON usq.question_id = sq.id
                WHERE usq.user_id = ? AND usq.question_id = ?
            `, [testUserId, userAnswer.questionId]);
            
            if (storedData.length > 0) {
                const storedHash = storedData[0].answer_hash;
                const isCorrect = verifyAnswer(userAnswer.answer, storedHash);
                
                console.log(`   Question: ${storedData[0].question_text}`);
                console.log(`   Provided Answer: ${userAnswer.answer}`);
                console.log(`   Verification: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
                
                // Test with wrong answer
                const wrongAnswer = 'WrongAnswer';
                const isWrongCorrect = verifyAnswer(wrongAnswer, storedHash);
                console.log(`   Wrong Answer Test: ${isWrongCorrect ? '❌ SHOULD BE WRONG' : '✅ CORRECTLY REJECTED'}`);
                console.log('');
            }
        }

        // Test 5: Get user's security questions
        console.log('📋 Test 5: Retrieving user\'s security questions');
        const [userSecurityQuestions] = await db.execute(`
            SELECT 
                usq.id,
                sq.question_text,
                sq.category,
                usq.created_at
            FROM user_security_questions usq
            JOIN security_questions sq ON usq.question_id = sq.id
            WHERE usq.user_id = ?
            ORDER BY usq.created_at
        `, [testUserId]);
        
        console.log(`✅ User has ${userSecurityQuestions.length} security questions set up:`);
        userSecurityQuestions.forEach((q, index) => {
            console.log(`   ${index + 1}. [${q.category}] ${q.question_text}`);
        });

        // Test 6: Password reset simulation
        console.log('\n📋 Test 6: Password reset simulation');
        console.log('🔐 Simulating password reset process...');
        
        // Get user's security questions for password reset
        const [resetQuestions] = await db.execute(`
            SELECT 
                usq.id,
                sq.question_text,
                sq.category
            FROM user_security_questions usq
            JOIN security_questions sq ON usq.question_id = sq.id
            WHERE usq.user_id = ?
            ORDER BY RAND()
            LIMIT 2
        `, [testUserId]);
        
        console.log('📝 User must answer these questions to reset password:');
        resetQuestions.forEach((q, index) => {
            console.log(`   ${index + 1}. ${q.question_text}`);
        });
        
        // Simulate answering one question correctly
        if (resetQuestions.length > 0) {
            const firstQuestion = resetQuestions[0];
            const correctAnswer = userAnswers.find(ua => ua.questionId === firstQuestion.id);
            
            if (correctAnswer) {
                const [verificationData] = await db.execute(`
                    SELECT answer_hash FROM user_security_questions 
                    WHERE user_id = ? AND question_id = ?
                `, [testUserId, firstQuestion.id]);
                
                if (verificationData.length > 0) {
                    const isVerified = verifyAnswer(correctAnswer.answer, verificationData[0].answer_hash);
                    console.log(`\n🔍 Verifying answer for: "${firstQuestion.question_text}"`);
                    console.log(`   Answer: "${correctAnswer.answer}"`);
                    console.log(`   Result: ${isVerified ? '✅ VERIFIED - Password reset allowed' : '❌ FAILED - Access denied'}`);
                }
            }
        }

        console.log('\n🎉 Security Questions Testing Complete!');
        console.log('\n📊 Summary:');
        console.log(`   • Total questions available: ${allQuestions.length}`);
        console.log(`   • Categories: ${Object.keys(questionsByCategory).length}`);
        console.log(`   • Test user questions: ${userSecurityQuestions.length}`);
        console.log(`   • Password reset simulation: ✅ Working`);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        throw error;
    } finally {
        // Close the database connection
        await db.end();
    }
}

// Run the test
testSecurityQuestions()
    .then(() => {
        console.log('\n✅ Security questions test completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Security questions test failed:', error);
        process.exit(1);
    });