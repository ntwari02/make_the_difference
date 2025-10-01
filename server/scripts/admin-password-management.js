const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../db/connection');

// Helper functions
function hashAnswer(answer) {
    return crypto.createHash('sha256').update(answer.toLowerCase().trim()).digest('hex');
}

function verifyAnswer(providedAnswer, storedHash) {
    const providedHash = hashAnswer(providedAnswer);
    return providedHash === storedHash;
}

async function hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

// Check if user is admin
async function isAdmin(userId) {
    const [roles] = await db.execute(`
        SELECT r.name 
        FROM rbac_user_roles ur
        JOIN rbac_roles r ON ur.role_id = r.id
        WHERE ur.user_id = ? AND r.name = 'admin'
    `, [userId]);
    return roles.length > 0;
}

// Log admin action
async function logAdminAction(adminId, action, targetUserId, details) {
    await db.execute(`
        INSERT INTO user_activity_logs (user_id, action, resource_type, resource_id, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
        adminId,
        action,
        'user',
        targetUserId,
        JSON.stringify({
            admin_action: true,
            ...details,
            timestamp: new Date().toISOString()
        })
    ]);
}

// Admin password reset function
async function adminResetPassword(adminId, targetUserId, newPassword, reason) {
    try {
        // Verify admin privileges
        const adminCheck = await isAdmin(adminId);
        if (!adminCheck) {
            throw new Error('Insufficient privileges: Admin role required');
        }

        // Get target user info
        const [targetUser] = await db.execute(`
            SELECT id, email, first_name, last_name, role 
            FROM users WHERE id = ?
        `, [targetUserId]);
        
        if (targetUser.length === 0) {
            throw new Error('Target user not found');
        }

        const user = targetUser[0];
        
        // Hash new password
        const newPasswordHash = await hashPassword(newPassword);
        
        // Update password
        await db.execute(`
            UPDATE users 
            SET password = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [newPasswordHash, targetUserId]);
        
        // Log admin action
        await logAdminAction(adminId, 'admin_password_reset', targetUserId, {
            target_user_email: user.email,
            target_user_role: user.role,
            reason: reason,
            password_changed: true
        });
        
        return {
            success: true,
            message: `Password reset successfully for ${user.email}`,
            user: user
        };
        
    } catch (error) {
        // Log failed attempt
        await logAdminAction(adminId, 'admin_password_reset_failed', targetUserId, {
            error: error.message,
            reason: reason
        });
        
        throw error;
    }
}

// User self-reset with security questions
async function userSelfResetPassword(userId, securityAnswers, newPassword) {
    try {
        // Get user's security questions
        const [userQuestions] = await db.execute(`
            SELECT usq.question_id, usq.answer_hash, sq.question_text
            FROM user_security_questions usq
            JOIN security_questions sq ON usq.question_id = sq.id
            WHERE usq.user_id = ?
        `, [userId]);
        
        if (userQuestions.length === 0) {
            throw new Error('No security questions set up');
        }
        
        // Verify answers
        let correctAnswers = 0;
        for (const answer of securityAnswers) {
            const question = userQuestions.find(q => q.question_id === answer.questionId);
            if (question && verifyAnswer(answer.answer, question.answer_hash)) {
                correctAnswers++;
            }
        }
        
        // Require at least 2 correct answers
        if (correctAnswers < 2) {
            await logAdminAction(userId, 'password_reset_failed', userId, {
                reason: 'insufficient_security_answers',
                correct_answers: correctAnswers,
                required_answers: 2
            });
            throw new Error('Insufficient correct answers');
        }
        
        // Reset password
        const newPasswordHash = await hashPassword(newPassword);
        await db.execute(`
            UPDATE users 
            SET password = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [newPasswordHash, userId]);
        
        // Log successful reset
        await logAdminAction(userId, 'self_password_reset', userId, {
            method: 'security_questions',
            correct_answers: correctAnswers,
            total_questions: userQuestions.length
        });
        
        return {
            success: true,
            message: 'Password reset successfully using security questions'
        };
        
    } catch (error) {
        throw error;
    }
}

// Main demo function
async function demonstrateAdminPasswordManagement() {
    try {
        console.log('🔐 Admin Password Management System Demo\n');

        // Get admin user
        console.log('👑 Step 1: Finding admin user...');
        const [adminUsers] = await db.execute(`
            SELECT u.id, u.email, u.first_name, u.last_name
            FROM users u
            JOIN rbac_user_roles ur ON u.id = ur.user_id
            JOIN rbac_roles r ON ur.role_id = r.id
            WHERE r.name = 'admin'
            LIMIT 1
        `);
        
        if (adminUsers.length === 0) {
            console.log('❌ No admin users found. Creating a test admin...');
            
            // Create test admin
            const adminEmail = 'admin@test.com';
            const adminPassword = await hashPassword('AdminPassword123!');
            
            await db.execute(`
                INSERT INTO users (id, email, password, first_name, last_name, role, is_active, created_at)
                VALUES (UUID(), ?, ?, 'Admin', 'User', 'admin', 1, CURRENT_TIMESTAMP)
            `, [adminEmail, adminPassword]);
            
            const [newAdmin] = await db.execute('SELECT id FROM users WHERE email = ?', [adminEmail]);
            const adminId = newAdmin[0].id;
            
            // Assign admin role
            const [adminRole] = await db.execute('SELECT id FROM rbac_roles WHERE name = ?', ['admin']);
            if (adminRole.length > 0) {
                await db.execute(`
                    INSERT INTO rbac_user_roles (id, user_id, role_id, created_at)
                    VALUES (UUID(), ?, ?, CURRENT_TIMESTAMP)
                `, [adminId, adminRole[0].id]);
            }
            
            console.log(`✅ Created test admin: ${adminEmail}`);
            adminUsers.push({ id: adminId, email: adminEmail, first_name: 'Admin', last_name: 'User' });
        }
        
        const admin = adminUsers[0];
        console.log(`✅ Found admin: ${admin.first_name} ${admin.last_name} (${admin.email})`);

        // Get target user
        console.log('\n👤 Step 2: Finding target user...');
        const [targetUsers] = await db.execute(`
            SELECT id, email, first_name, last_name, role 
            FROM users 
            WHERE id != ? AND role != 'admin'
            LIMIT 1
        `, [admin.id]);
        
        if (targetUsers.length === 0) {
            console.log('❌ No target users found. Creating a test user...');
            const testEmail = 'user@test.com';
            const testPassword = await hashPassword('UserPassword123!');
            
            await db.execute(`
                INSERT INTO users (id, email, password, first_name, last_name, role, is_active, created_at)
                VALUES (UUID(), ?, ?, 'Test', 'User', 'student', 1, CURRENT_TIMESTAMP)
            `, [testEmail, testPassword]);
            
            const [newUser] = await db.execute('SELECT id FROM users WHERE email = ?', [testEmail]);
            targetUsers.push({ id: newUser[0].id, email: testEmail, first_name: 'Test', last_name: 'User', role: 'student' });
        }
        
        const targetUser = targetUsers[0];
        console.log(`✅ Found target user: ${targetUser.first_name} ${targetUser.last_name} (${targetUser.email})`);

        // Scenario 1: Admin reset user password
        console.log('\n🔧 Scenario 1: Admin resetting user password...');
        const newPassword = 'NewPassword123!';
        const resetReason = 'User requested password reset via support ticket #12345';
        
        try {
            const result = await adminResetPassword(admin.id, targetUser.id, newPassword, resetReason);
            console.log(`✅ ${result.message}`);
            console.log(`   Reason: ${resetReason}`);
            console.log(`   New password: ${newPassword}`);
        } catch (error) {
            console.log(`❌ Admin reset failed: ${error.message}`);
        }

        // Scenario 2: User self-reset with security questions
        console.log('\n🔐 Scenario 2: User self-reset with security questions...');
        
        // Set up security questions for target user
        const [questions] = await db.execute(`
            SELECT id, question_text FROM security_questions WHERE is_active = 1 LIMIT 3
        `);
        
        const testAnswers = ['MyMother123', 'MyPetDog', 'Blue'];
        
        // Clear existing questions first
        await db.execute('DELETE FROM user_security_questions WHERE user_id = ?', [targetUser.id]);
        
        for (let i = 0; i < questions.length; i++) {
            const answerHash = hashAnswer(testAnswers[i]);
            await db.execute(`
                INSERT INTO user_security_questions (user_id, question_id, answer_hash)
                VALUES (?, ?, ?)
            `, [targetUser.id, questions[i].id, answerHash]);
        }
        
        console.log(`✅ Set up ${questions.length} security questions for user`);
        
        // Simulate self-reset
        const securityAnswers = [
            { questionId: questions[0].id, answer: testAnswers[0] },
            { questionId: questions[1].id, answer: testAnswers[1] }
        ];
        
        try {
            const result = await userSelfResetPassword(targetUser.id, securityAnswers, 'SelfResetPassword123!');
            console.log(`✅ ${result.message}`);
        } catch (error) {
            console.log(`❌ Self-reset failed: ${error.message}`);
        }

        // Scenario 3: Show admin audit log
        console.log('\n📋 Scenario 3: Admin audit log...');
        const [auditLogs] = await db.execute(`
            SELECT action, resource_id, metadata, created_at
            FROM user_activity_logs
            WHERE user_id = ? AND action LIKE '%password%'
            ORDER BY created_at DESC
            LIMIT 5
        `, [admin.id]);
        
        console.log(`📊 Recent password-related admin actions:`);
        auditLogs.forEach((log, index) => {
            const metadata = log.metadata; // metadata is already parsed as JSON object by MySQL
            console.log(`   ${index + 1}. ${log.action} - ${metadata.target_user_email || 'N/A'}`);
            console.log(`      Reason: ${metadata.reason || 'N/A'}`);
            console.log(`      Time: ${log.created_at}`);
        });

        console.log('\n🎉 Admin Password Management Demo Complete!');
        console.log('\n📊 Summary:');
        console.log('   ✅ Admin can reset any user\'s password');
        console.log('   ✅ Users can reset their own password with security questions');
        console.log('   ✅ All actions are logged for audit purposes');
        console.log('   ✅ Admin actions require proper role verification');

    } catch (error) {
        console.error('❌ Demo failed:', error.message);
        throw error;
    } finally {
        await db.end();
    }
}

// Run the demo
demonstrateAdminPasswordManagement()
    .then(() => {
        console.log('\n✅ Admin password management demo completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Demo failed:', error);
        process.exit(1);
    });
