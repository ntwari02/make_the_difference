import express from 'express';
import db from '../config/database.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// GET all security questions
router.get('/', async (req, res) => {
    try {
        const [questions] = await db.query(
            'SELECT id, question FROM security_questions WHERE is_active = 1 ORDER BY question'
        );
        res.json(questions);
    } catch (error) {
        console.error('Error fetching security questions:', error);
        res.status(500).json({ message: 'Error fetching security questions' });
    }
});

// POST verify security questions for password reset
router.post('/verify', async (req, res) => {
    try {
        const { email, answers } = req.body;
        
        if (!email || !answers || !Array.isArray(answers) || answers.length < 2) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and at least 2 security question answers are required' 
            });
        }

        // First check if it's an admin user
        const [admins] = await db.query(`
            SELECT au.id, au.email, au.user_id, u.security_questions_setup,
                   usa.question_id, usa.answer
            FROM admin_users au
            LEFT JOIN users u ON au.user_id = u.id
            LEFT JOIN user_security_answers usa ON u.id = usa.user_id
            WHERE au.email = ? AND au.is_active = TRUE
        `, [email]);

        if (admins.length > 0) {
            // It's an admin user
            const admin = admins[0];
            
            if (!admin.security_questions_setup) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Security questions not set up for this admin account' 
                });
            }

            // Group answers by admin
            const adminAnswers = {};
            admins.forEach(row => {
                if (row.question_id && row.answer) {
                    adminAnswers[row.question_id] = row.answer;
                }
            });

            // Check if admin has at least 2 security questions set up
            if (Object.keys(adminAnswers).length < 2) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Insufficient security questions set up for admin account' 
                });
            }

            // Verify answers (case-insensitive comparison)
            let correctAnswers = 0;
            const requiredCorrect = Math.min(2, answers.length);

            answers.forEach(answer => {
                const questionId = answer.question_id;
                const providedAnswer = answer.answer.toLowerCase().trim();
                const storedAnswer = adminAnswers[questionId];
                
                if (storedAnswer && storedAnswer.toLowerCase().trim() === providedAnswer) {
                    correctAnswers++;
                }
            });

            if (correctAnswers >= requiredCorrect) {
                // Generate a temporary token for password reset
                const resetToken = crypto.randomBytes(32).toString('hex');
                const expiry = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes
                
                await db.query(
                    'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
                    [resetToken, expiry, admin.user_id]
                );

                res.json({ 
                    success: true, 
                    message: 'Security questions verified successfully. You can now reset your password.',
                    reset_token: resetToken,
                    can_reset: true,
                    isAdmin: true
                });
            } else {
                // Create admin help request
                const helpToken = crypto.randomBytes(32).toString('hex');
                const helpExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
                
                await db.query(
                    'UPDATE users SET help_token = ?, help_token_expiry = ?, help_requested_at = NOW() WHERE id = ?',
                    [helpToken, helpExpiry, admin.user_id]
                );

                res.json({ 
                    success: false, 
                    message: 'Incorrect answers. Super admin help has been requested. You will be notified when assistance is available.',
                    help_token: helpToken,
                    can_reset: false,
                    requires_admin: true,
                    isAdmin: true
                });
            }
            return;
        }

        // Check if it's a regular user
        const [users] = await db.query(`
            SELECT u.id, u.email, u.security_questions_setup,
                   usa.question_id, usa.answer
            FROM users u
            LEFT JOIN user_security_answers usa ON u.id = usa.user_id
            WHERE u.email = ?
        `, [email]);

        if (users.length === 0) {
            return res.json({ 
                success: false, 
                message: 'If this email exists, we have sent instructions to proceed.' 
            });
        }

        const user = users[0];
        
        if (!user.security_questions_setup) {
            return res.status(400).json({ 
                success: false, 
                message: 'Security questions not set up for this account' 
            });
        }

        // Group answers by user
        const userAnswers = {};
        users.forEach(row => {
            if (row.question_id && row.answer) {
                userAnswers[row.question_id] = row.answer;
            }
        });

        // Check if user has at least 2 security questions set up
        if (Object.keys(userAnswers).length < 2) {
            return res.json({ 
                success: false, 
                message: 'Insufficient security questions set up' 
            });
        }

        // Verify answers (case-insensitive comparison)
        let correctAnswers = 0;
        const requiredCorrect = Math.min(2, answers.length); // Require at least 2 correct answers

        answers.forEach(answer => {
            const questionId = answer.question_id;
            const providedAnswer = answer.answer.toLowerCase().trim();
            const storedAnswer = userAnswers[questionId];
            
            if (storedAnswer && storedAnswer.toLowerCase().trim() === providedAnswer) {
                correctAnswers++;
            }
        });

        if (correctAnswers >= requiredCorrect) {
            // Generate a temporary token for password reset
            const resetToken = crypto.randomBytes(32).toString('hex');
            const expiry = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes
            
            await db.query(
                'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
                [resetToken, expiry, user.id]
            );

            res.json({ 
                success: true, 
                message: 'Security questions verified successfully. You can now reset your password.',
                reset_token: resetToken,
                can_reset: true,
                isAdmin: false
            });
        } else {
                            // Create admin help request
                const helpToken = crypto.randomBytes(32).toString('hex');
            const helpExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
            
            await db.query(
                'UPDATE users SET help_token = ?, help_token_expiry = ?, help_requested_at = NOW() WHERE id = ?',
                [helpToken, helpExpiry, user.id]
            );

            res.json({ 
                success: false, 
                message: 'Incorrect answers. Admin help has been requested. You will be notified when an admin can assist you.',
                help_token: helpToken,
                can_reset: false,
                requires_admin: true,
                isAdmin: false
            });
        }

    } catch (error) {
        console.error('Error verifying security questions:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error verifying security questions' 
        });
    }
});

// GET user's security questions (for display during reset)
router.get('/user/:email', async (req, res) => {
    try {
        const { email } = req.params;
        
        const [questions] = await db.query(`
            SELECT sq.id, sq.question
            FROM security_questions sq
            INNER JOIN user_security_answers usa ON sq.id = usa.question_id
            INNER JOIN users u ON usa.user_id = u.id
            WHERE u.email = ?
            ORDER BY sq.question
        `, [email]);

        if (questions.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No security questions found for this user' 
            });
        }

        res.json({ 
            success: true, 
            questions: questions 
        });

    } catch (error) {
        console.error('Error fetching user security questions:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching security questions' 
        });
    }
});

// POST set or update security questions for the authenticated admin (mirrors regular users)
router.post('/admin/setup', adminAuth, async (req, res) => {
    try {
        const { security_questions } = req.body || {};
        // Expect: [{ question_id, answer }, ...] at least 2
        if (!Array.isArray(security_questions) || security_questions.length < 2) {
            return res.status(400).json({ success: false, message: 'At least 2 security questions are required' });
        }
        // req.user.id is the admin's user_id from adminAuth
        const userId = req.user.id;
        // Mark setup flag
        await db.query('UPDATE users SET security_questions_setup = 1 WHERE id = ?', [userId]);
        // Clear existing answers
        await db.query('DELETE FROM user_security_answers WHERE user_id = ?', [userId]);
        // Insert new answers
        for (const q of security_questions) {
            const qid = Number(q && q.question_id);
            const ans = (q && q.answer) ? String(q.answer).trim() : '';
            if (!qid || !ans) continue;
            await db.query(
                'INSERT INTO user_security_answers (user_id, question_id, answer) VALUES (?, ?, ?)',
                [userId, qid, ans]
            );
        }
        return res.json({ success: true, message: 'Admin security questions saved' });
    } catch (error) {
        console.error('admin setup security questions error:', error);
        res.status(500).json({ success: false, message: 'Error saving security questions' });
    }
});

// GET current admin security questions (for edit form)
router.get('/admin/mine', adminAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.query(`
            SELECT sq.id, sq.question
            FROM security_questions sq
            INNER JOIN user_security_answers usa ON sq.id = usa.question_id
            WHERE usa.user_id = ?
            ORDER BY sq.question
        `, [userId]);
        res.json({ success: true, questions: rows });
    } catch (error) {
        console.error('admin get mine security questions error:', error);
        res.status(500).json({ success: false, message: 'Error fetching admin security questions' });
    }
});

export default router; 
