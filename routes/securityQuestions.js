import express from 'express';
import db from '../config/database.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

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

        // Get user and their security answers
        const [users] = await db.query(`
            SELECT u.id, u.email, u.security_questions_setup,
                   usa.question_id, usa.answer
            FROM users u
            LEFT JOIN user_security_answers usa ON u.id = usa.user_id
            WHERE u.email = ?
        `, [email]);

        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
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
            return res.status(400).json({ 
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
                can_reset: true
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
                requires_admin: true
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

export default router; 
