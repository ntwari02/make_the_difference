const securityQuestionsService = require('../services/securityQuestions.service');
const { ok } = require('../utils/response');

class SecurityQuestionsController {
    /**
     * Get all available security questions
     */
    async getAvailableQuestions(req, res) {
        try {
            const questions = await securityQuestionsService.getAvailableQuestions();
            return ok(res, { data: questions }, 'Security questions retrieved successfully');
        } catch (error) {
            return res.status(500).json({
                message: 'Failed to retrieve security questions',
                error: error.message
            });
        }
    }

    /**
     * Get security questions by category
     */
    async getQuestionsByCategory(req, res) {
        try {
            const { category } = req.params;
            
            // Validate category
            const validCategories = ['personal', 'family', 'childhood', 'education', 'work', 'location', 'preference'];
            if (!validCategories.includes(category)) {
                return res.status(400).json({
                    message: 'Invalid category'
                });
            }

            const questions = await securityQuestionsService.getQuestionsByCategory(category);
            return ok(res, { data: questions }, 'Security questions retrieved successfully');
        } catch (error) {
            return res.status(500).json({
                message: 'Failed to retrieve security questions',
                error: error.message
            });
        }
    }

    /**
     * Set up security questions for a user
     */
    async setupSecurityQuestions(req, res) {
        try {
            const userId = req.user.id; // Assuming user is authenticated
            const { questions } = req.body;

            // Validate input
            if (!questions || !Array.isArray(questions)) {
                return res.status(400).json({
                    message: 'Questions array is required'
                });
            }

            // Validate each question
            for (const question of questions) {
                if (!question.questionId || !question.answer) {
                    return res.status(400).json({
                        message: 'Each question must have questionId and answer'
                    });
                }
                if (typeof question.answer !== 'string' || question.answer.trim().length < 2) {
                    return res.status(400).json({
                        message: 'Answer must be at least 2 characters long'
                    });
                }
            }

            const result = await securityQuestionsService.setupSecurityQuestions(userId, questions);
            return ok(res, { data: result }, 'Security questions set up successfully');
        } catch (error) {
            return res.status(400).json({
                message: 'Failed to setup security questions',
                error: error.message
            });
        }
    }

    /**
     * Get user's security questions (without answers)
     */
    async getUserSecurityQuestions(req, res) {
        try {
            const userId = req.user.id; // Assuming user is authenticated
            const questions = await securityQuestionsService.getUserSecurityQuestions(userId);
            return ok(res, { data: questions }, 'User security questions retrieved successfully');
        } catch (error) {
            return res.status(500).json({
                message: 'Failed to retrieve security questions',
                error: error.message
            });
        }
    }

    /**
     * Verify security question answers for password reset
     */
    async verifySecurityQuestions(req, res) {
        try {
            const { email, answers } = req.body;

            if (!email || !answers) {
                return res.status(400).json({
                    message: 'Email and answers are required'
                });
            }

            // Get user by email
            const db = require('../db/connection');
            const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
            
            if (users.length === 0) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            const userId = users[0].id;

            // Check if user has security questions set up
            const hasQuestions = await securityQuestionsService.hasSecurityQuestions(userId);
            if (!hasQuestions) {
                return res.status(400).json({
                    message: 'No security questions set up for this account'
                });
            }

            const result = await securityQuestionsService.verifySecurityQuestions(userId, answers);
            
            if (result.verified) {
                return ok(res, {
                    data: {
                        resetToken: result.resetToken,
                        expiresAt: result.expiresAt
                    }
                }, 'Security questions verified successfully. You can now reset your password.');
            } else {
                return res.status(400).json({
                    message: result.message
                });
            }
        } catch (error) {
            return res.status(400).json({
                message: 'Failed to setup security questions',
                error: error.message
            });
        }
    }

    /**
     * Get user's security questions for password reset (public endpoint)
     */
    async getSecurityQuestionsForReset(req, res) {
        try {
            const { email } = req.params;

            if (!email) {
                return res.status(400).json({
                    message: 'Email is required'
                });
            }

            // Get user by email
            const db = require('../db/connection');
            const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
            
            if (users.length === 0) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            const userId = users[0].id;

            // Check if user has security questions set up
            const hasQuestions = await securityQuestionsService.hasSecurityQuestions(userId);
            if (!hasQuestions) {
                return res.status(400).json({
                    message: 'No security questions set up for this account'
                });
            }

            const questions = await securityQuestionsService.getUserSecurityQuestions(userId);
            return ok(res, { data: questions }, 'Security questions retrieved successfully');
        } catch (error) {
            return res.status(500).json({
                message: 'Failed to retrieve security questions',
                error: error.message
            });
        }
    }

    /**
     * Check if user has security questions set up
     */
    async checkSecurityQuestions(req, res) {
        try {
            const userId = req.user.id; // Assuming user is authenticated
            const hasQuestions = await securityQuestionsService.hasSecurityQuestions(userId);
            return ok(res, { data: { hasQuestions } }, 'Security questions status retrieved successfully');
        } catch (error) {
            return res.status(500).json({
                message: 'Failed to retrieve security questions',
                error: error.message
            });
        }
    }

    /**
     * Delete user's security questions
     */
    async deleteSecurityQuestions(req, res) {
        try {
            const userId = req.user.id; // Assuming user is authenticated
            const result = await securityQuestionsService.deleteSecurityQuestions(userId);
            return ok(res, { data: result }, 'Security questions deleted successfully');
        } catch (error) {
            return res.status(500).json({
                message: 'Failed to retrieve security questions',
                error: error.message
            });
        }
    }

    /**
     * Update a specific security question answer
     */
    async updateSecurityQuestion(req, res) {
        try {
            const userId = req.user.id; // Assuming user is authenticated
            const { questionId } = req.params;
            const { answer } = req.body;

            if (!answer || typeof answer !== 'string' || answer.trim().length < 2) {
                return res.status(400).json({
                    message: 'Answer must be at least 2 characters long'
                });
            }

            const result = await securityQuestionsService.updateSecurityQuestion(userId, questionId, answer);
            return ok(res, { data: result }, 'Security question updated successfully');
        } catch (error) {
            return res.status(400).json({
                message: 'Failed to setup security questions',
                error: error.message
            });
        }
    }
}

module.exports = new SecurityQuestionsController();
