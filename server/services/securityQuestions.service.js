const db = require('../db/connection');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class SecurityQuestionsService {
    /**
     * Get all available security questions
     */
    async getAvailableQuestions() {
        try {
            const [questions] = await db.execute(
                'SELECT id, question_text, category FROM security_questions WHERE is_active = TRUE ORDER BY category, question_text'
            );
            return questions;
        } catch (error) {
            throw new Error(`Failed to fetch security questions: ${error.message}`);
        }
    }

    /**
     * Get security questions by category
     */
    async getQuestionsByCategory(category) {
        try {
            const [questions] = await db.execute(
                'SELECT id, question_text, category FROM security_questions WHERE category = ? AND is_active = TRUE ORDER BY question_text',
                [category]
            );
            return questions;
        } catch (error) {
            throw new Error(`Failed to fetch questions by category: ${error.message}`);
        }
    }

    /**
     * Set up security questions for a user
     * @param {string} userId - User ID
     * @param {Array} questions - Array of {questionId, answer} objects
     */
    async setupSecurityQuestions(userId, questions) {
        try {
            // Validate that user exists
            const [user] = await db.execute('SELECT id FROM users WHERE id = ?', [userId]);
            if (user.length === 0) {
                throw new Error('User not found');
            }

            // Validate questions format
            if (!Array.isArray(questions) || questions.length < 3) {
                throw new Error('At least 3 security questions are required');
            }

            if (questions.length > 5) {
                throw new Error('Maximum 5 security questions allowed');
            }

            // Validate that all question IDs exist
            const questionIds = questions.map(q => q.questionId);
            const [validQuestions] = await db.execute(
                'SELECT id FROM security_questions WHERE id IN (' + questionIds.map(() => '?').join(',') + ') AND is_active = TRUE',
                questionIds
            );

            if (validQuestions.length !== questionIds.length) {
                throw new Error('One or more security questions are invalid');
            }

            // Check for duplicate questions
            const uniqueQuestionIds = [...new Set(questionIds)];
            if (uniqueQuestionIds.length !== questionIds.length) {
                throw new Error('Duplicate security questions are not allowed');
            }

            // Hash answers and store
            const connection = await db.getConnection();
            
            try {
                await connection.beginTransaction();
                
                // Clear existing security questions for this user
                await connection.execute('DELETE FROM user_security_questions WHERE user_id = ?', [userId]);

                // Insert new security questions
                for (const question of questions) {
                    const answerHash = await bcrypt.hash(question.answer.toLowerCase().trim(), 12);
                    await connection.execute(
                        'INSERT INTO user_security_questions (user_id, question_id, answer_hash) VALUES (?, ?, ?)',
                        [userId, question.questionId, answerHash]
                    );
                }

                await connection.commit();
                return { message: 'Security questions set up successfully' };
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        } catch (error) {
            throw new Error(`Failed to setup security questions: ${error.message}`);
        }
    }

    /**
     * Get user's security questions (without answers)
     */
    async getUserSecurityQuestions(userId) {
        try {
            const [questions] = await db.execute(`
                SELECT 
                    usq.id,
                    sq.question_text,
                    sq.category
                FROM user_security_questions usq
                JOIN security_questions sq ON usq.question_id = sq.id
                WHERE usq.user_id = ?
                ORDER BY usq.created_at
            `, [userId]);

            return questions;
        } catch (error) {
            throw new Error(`Failed to fetch user security questions: ${error.message}`);
        }
    }

    /**
     * Verify security question answers
     * @param {string} userId - User ID
     * @param {Array} answers - Array of {questionId, answer} objects
     */
    async verifySecurityQuestions(userId, answers) {
        try {
            if (!Array.isArray(answers) || answers.length === 0) {
                throw new Error('Security question answers are required');
            }

            // Get user's security questions with answers
            const [userQuestions] = await db.execute(`
                SELECT 
                    usq.question_id,
                    usq.answer_hash,
                    sq.question_text
                FROM user_security_questions usq
                JOIN security_questions sq ON usq.question_id = sq.id
                WHERE usq.user_id = ?
            `, [userId]);

            if (userQuestions.length === 0) {
                throw new Error('No security questions set up for this user');
            }

            // Create a map for quick lookup
            const questionMap = new Map();
            userQuestions.forEach(q => {
                questionMap.set(q.question_id, q);
            });

            let correctAnswers = 0;
            const totalQuestions = userQuestions.length;
            const requiredCorrect = Math.ceil(totalQuestions * 0.6); // Require 60% correct answers

            // Verify each provided answer
            for (const answer of answers) {
                const userQuestion = questionMap.get(answer.questionId);
                if (userQuestion) {
                    const isCorrect = await bcrypt.compare(
                        answer.answer.toLowerCase().trim(),
                        userQuestion.answer_hash
                    );
                    if (isCorrect) {
                        correctAnswers++;
                    }
                }
            }

            if (correctAnswers >= requiredCorrect) {
                // Generate a temporary token for password reset
                const resetToken = crypto.randomBytes(32).toString('hex');
                const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

                await db.execute(
                    'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?',
                    [resetToken, resetExpires, userId]
                );

                return {
                    verified: true,
                    resetToken,
                    expiresAt: resetExpires,
                    message: 'Security questions verified successfully'
                };
            } else {
                return {
                    verified: false,
                    message: 'Incorrect answers provided. Please try again.',
                    correctAnswers,
                    requiredCorrect
                };
            }
        } catch (error) {
            throw new Error(`Failed to verify security questions: ${error.message}`);
        }
    }

    /**
     * Check if user has security questions set up
     */
    async hasSecurityQuestions(userId) {
        try {
            const [questions] = await db.execute(
                'SELECT COUNT(*) as count FROM user_security_questions WHERE user_id = ?',
                [userId]
            );
            return questions[0].count > 0;
        } catch (error) {
            throw new Error(`Failed to check security questions: ${error.message}`);
        }
    }

    /**
     * Delete user's security questions
     */
    async deleteSecurityQuestions(userId) {
        try {
            await db.execute('DELETE FROM user_security_questions WHERE user_id = ?', [userId]);
            return { message: 'Security questions deleted successfully' };
        } catch (error) {
            throw new Error(`Failed to delete security questions: ${error.message}`);
        }
    }

    /**
     * Update a specific security question answer
     */
    async updateSecurityQuestion(userId, questionId, newAnswer) {
        try {
            // Check if the question belongs to the user
            const [existing] = await db.execute(
                'SELECT id FROM user_security_questions WHERE user_id = ? AND question_id = ?',
                [userId, questionId]
            );

            if (existing.length === 0) {
                throw new Error('Security question not found for this user');
            }

            const answerHash = await bcrypt.hash(newAnswer.toLowerCase().trim(), 12);
            
            await db.execute(
                'UPDATE user_security_questions SET answer_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND question_id = ?',
                [answerHash, userId, questionId]
            );

            return { message: 'Security question updated successfully' };
        } catch (error) {
            throw new Error(`Failed to update security question: ${error.message}`);
        }
    }
}

module.exports = new SecurityQuestionsService();
