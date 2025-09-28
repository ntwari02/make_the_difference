const securityQuestionsService = require('../services/securityQuestions.service');
const { successResponse, errorResponse } = require('../utils/response');

class SecurityQuestionsController {
    /**
     * Get all available security questions
     */
    async getAvailableQuestions(req, res) {
        try {
            const questions = await securityQuestionsService.getAvailableQuestions();
            return successResponse(res, questions, 'Security questions retrieved successfully');
        } catch (error) {
            return errorResponse(res, error.message, 500);
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
                return errorResponse(res, 'Invalid category', 400);
            }

            const questions = await securityQuestionsService.getQuestionsByCategory(category);
            return successResponse(res, questions, 'Security questions retrieved successfully');
        } catch (error) {
            return errorResponse(res, error.message, 500);
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
                return errorResponse(res, 'Questions array is required', 400);
            }

            // Validate each question
            for (const question of questions) {
                if (!question.questionId || !question.answer) {
                    return errorResponse(res, 'Each question must have questionId and answer', 400);
                }
                if (typeof question.answer !== 'string' || question.answer.trim().length < 2) {
                    return errorResponse(res, 'Answer must be at least 2 characters long', 400);
                }
            }

            const result = await securityQuestionsService.setupSecurityQuestions(userId, questions);
            return successResponse(res, result, 'Security questions set up successfully');
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    }

    /**
     * Get user's security questions (without answers)
     */
    async getUserSecurityQuestions(req, res) {
        try {
            const userId = req.user.id; // Assuming user is authenticated
            const questions = await securityQuestionsService.getUserSecurityQuestions(userId);
            return successResponse(res, questions, 'User security questions retrieved successfully');
        } catch (error) {
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * Verify security question answers for password reset
     */
    async verifySecurityQuestions(req, res) {
        try {
            const { email, answers } = req.body;

            if (!email || !answers) {
                return errorResponse(res, 'Email and answers are required', 400);
            }

            // Get user by email
            const db = require('../db/connection');
            const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
            
            if (users.length === 0) {
                return errorResponse(res, 'User not found', 404);
            }

            const userId = users[0].id;

            // Check if user has security questions set up
            const hasQuestions = await securityQuestionsService.hasSecurityQuestions(userId);
            if (!hasQuestions) {
                return errorResponse(res, 'No security questions set up for this account', 400);
            }

            const result = await securityQuestionsService.verifySecurityQuestions(userId, answers);
            
            if (result.verified) {
                return successResponse(res, {
                    resetToken: result.resetToken,
                    expiresAt: result.expiresAt
                }, 'Security questions verified successfully. You can now reset your password.');
            } else {
                return errorResponse(res, result.message, 400);
            }
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    }

    /**
     * Get user's security questions for password reset (public endpoint)
     */
    async getSecurityQuestionsForReset(req, res) {
        try {
            const { email } = req.params;

            if (!email) {
                return errorResponse(res, 'Email is required', 400);
            }

            // Get user by email
            const db = require('../db/connection');
            const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
            
            if (users.length === 0) {
                return errorResponse(res, 'User not found', 404);
            }

            const userId = users[0].id;

            // Check if user has security questions set up
            const hasQuestions = await securityQuestionsService.hasSecurityQuestions(userId);
            if (!hasQuestions) {
                return errorResponse(res, 'No security questions set up for this account', 400);
            }

            const questions = await securityQuestionsService.getUserSecurityQuestions(userId);
            return successResponse(res, questions, 'Security questions retrieved successfully');
        } catch (error) {
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * Check if user has security questions set up
     */
    async checkSecurityQuestions(req, res) {
        try {
            const userId = req.user.id; // Assuming user is authenticated
            const hasQuestions = await securityQuestionsService.hasSecurityQuestions(userId);
            return successResponse(res, { hasQuestions }, 'Security questions status retrieved successfully');
        } catch (error) {
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * Delete user's security questions
     */
    async deleteSecurityQuestions(req, res) {
        try {
            const userId = req.user.id; // Assuming user is authenticated
            const result = await securityQuestionsService.deleteSecurityQuestions(userId);
            return successResponse(res, result, 'Security questions deleted successfully');
        } catch (error) {
            return errorResponse(res, error.message, 500);
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
                return errorResponse(res, 'Answer must be at least 2 characters long', 400);
            }

            const result = await securityQuestionsService.updateSecurityQuestion(userId, questionId, answer);
            return successResponse(res, result, 'Security question updated successfully');
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    }
}

module.exports = new SecurityQuestionsController();
