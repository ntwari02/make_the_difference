const db = require('../db/connection');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { successResponse, errorResponse } = require('../utils/response');
const securityQuestionsService = require('../services/securityQuestions.service');

class PasswordResetController {
    /**
     * Initiate password reset with security questions
     * This is the first step - user provides email and answers security questions
     */
    async initiatePasswordReset(req, res) {
        try {
            const { email, answers } = req.body;

            if (!email) {
                return errorResponse(res, 'Email is required', 400);
            }

            // Check if user exists
            const [users] = await db.execute('SELECT id, email FROM users WHERE email = ?', [email]);
            if (users.length === 0) {
                return errorResponse(res, 'User not found', 404);
            }

            const userId = users[0].id;

            // Check if user has security questions set up
            const hasQuestions = await securityQuestionsService.hasSecurityQuestions(userId);
            if (!hasQuestions) {
                return errorResponse(res, 'No security questions set up for this account. Please contact support.', 400);
            }

            // If answers are provided, verify them
            if (answers && answers.length > 0) {
                const verificationResult = await securityQuestionsService.verifySecurityQuestions(userId, answers);
                
                if (verificationResult.verified) {
                    return successResponse(res, {
                        resetToken: verificationResult.resetToken,
                        expiresAt: verificationResult.expiresAt,
                        message: 'Security questions verified. You can now reset your password.'
                    }, 'Password reset initiated successfully');
                } else {
                    return errorResponse(res, verificationResult.message, 400);
                }
            } else {
                // Return security questions for user to answer
                const questions = await securityQuestionsService.getUserSecurityQuestions(userId);
                return successResponse(res, {
                    questions,
                    message: 'Please answer your security questions to reset your password'
                }, 'Security questions retrieved for password reset');
            }
        } catch (error) {
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * Reset password using the token from security questions verification
     */
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;

            if (!token || !newPassword) {
                return errorResponse(res, 'Token and new password are required', 400);
            }

            // Validate password strength
            if (newPassword.length < 8) {
                return errorResponse(res, 'Password must be at least 8 characters long', 400);
            }

            // Check if token is valid and not expired
            const [users] = await db.execute(
                'SELECT id FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW()',
                [token]
            );

            if (users.length === 0) {
                return errorResponse(res, 'Invalid or expired reset token', 400);
            }

            const userId = users[0].id;

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 12);

            // Update password and clear reset token
            await db.execute(
                'UPDATE users SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?',
                [hashedPassword, userId]
            );

            return successResponse(res, { message: 'Password reset successfully' }, 'Password reset completed');
        } catch (error) {
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * Traditional password reset via email (fallback method)
     * This can be used as an alternative to security questions
     */
    async initiateEmailPasswordReset(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return errorResponse(res, 'Email is required', 400);
            }

            // Check if user exists
            const [users] = await db.execute('SELECT id, email FROM users WHERE email = ?', [email]);
            if (users.length === 0) {
                return errorResponse(res, 'User not found', 404);
            }

            const userId = users[0].id;

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            // Store reset token
            await db.execute(
                'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?',
                [resetToken, resetExpires, userId]
            );

            // TODO: Send email with reset link
            // For now, return the token (in production, this should be sent via email)
            return successResponse(res, {
                resetToken, // Remove this in production
                expiresAt: resetExpires,
                message: 'Password reset email sent (token returned for testing)'
            }, 'Password reset email sent');
        } catch (error) {
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * Verify reset token validity
     */
    async verifyResetToken(req, res) {
        try {
            const { token } = req.params;

            if (!token) {
                return errorResponse(res, 'Token is required', 400);
            }

            // Check if token is valid and not expired
            const [users] = await db.execute(
                'SELECT id, email FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW()',
                [token]
            );

            if (users.length === 0) {
                return errorResponse(res, 'Invalid or expired reset token', 400);
            }

            return successResponse(res, {
                valid: true,
                email: users[0].email
            }, 'Reset token is valid');
        } catch (error) {
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * Get password reset options for a user
     * Returns available reset methods (security questions, email, etc.)
     */
    async getPasswordResetOptions(req, res) {
        try {
            const { email } = req.params;

            if (!email) {
                return errorResponse(res, 'Email is required', 400);
            }

            // Check if user exists
            const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
            if (users.length === 0) {
                return errorResponse(res, 'User not found', 404);
            }

            const userId = users[0].id;

            // Check available reset methods
            const hasSecurityQuestions = await securityQuestionsService.hasSecurityQuestions(userId);
            const hasEmail = true; // Assuming all users have email

            const options = [];
            if (hasSecurityQuestions) {
                options.push({
                    method: 'security_questions',
                    name: 'Security Questions',
                    description: 'Answer your security questions to reset your password'
                });
            }
            if (hasEmail) {
                options.push({
                    method: 'email',
                    name: 'Email Reset',
                    description: 'Receive a password reset link via email'
                });
            }

            return successResponse(res, {
                options,
                message: 'Available password reset methods retrieved'
            }, 'Password reset options retrieved successfully');
        } catch (error) {
            return errorResponse(res, error.message, 500);
        }
    }
}

module.exports = new PasswordResetController();
