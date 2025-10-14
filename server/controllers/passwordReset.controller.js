const db = require('../db/connection');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { ok, badRequest, notFound, internalError } = require('../utils/response');
const securityQuestionsService = require('../services/securityQuestions.service');
const Email = require('../services/email.service');

class PasswordResetController {
    /**
     * Initiate password reset with security questions
     * This is the first step - user provides email and answers security questions
     */
    async initiatePasswordReset(req, res) {
        try {
            const { email, answers } = req.body;

            if (!email) {
                return badRequest(res, 'Email is required');
            }

            // Check if user exists
            const [users] = await db.execute('SELECT id, email FROM users WHERE email = ?', [email]);
            if (users.length === 0) {
                return notFound(res, 'User not found');
            }

            const userId = users[0].id;

            // Check if user has security questions set up
            const hasQuestions = await securityQuestionsService.hasSecurityQuestions(userId);
            if (!hasQuestions) {
                return badRequest(res, 'No security questions set up for this account. Please contact support.');
            }

            // If answers are provided, verify them
            if (answers && answers.length > 0) {
                const verificationResult = await securityQuestionsService.verifySecurityQuestions(userId, answers);
                
                if (verificationResult.verified) {
                    return ok(res, {
                        data: {
                            resetToken: verificationResult.resetToken,
                            expiresAt: verificationResult.expiresAt,
                            message: 'Security questions verified. You can now reset your password.'
                        }
                    }, 'Password reset initiated successfully');
                } else {
                    return badRequest(res, verificationResult.message);
                }
            } else {
                // Return security questions for user to answer
                const questions = await securityQuestionsService.getUserSecurityQuestions(userId);
                return ok(res, {
                    data: {
                        questions,
                        message: 'Please answer your security questions to reset your password'
                    }
                }, 'Security questions retrieved for password reset');
            }
        } catch (error) {
            return internalError(res, error.message);
        }
    }

    /**
     * Reset password using the token from security questions verification
     */
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;

            if (!token || !newPassword) {
                return badRequest(res, 'Token and new password are required');
            }

            // Validate password strength
            if (newPassword.length < 8) {
                return badRequest(res, 'Password must be at least 8 characters long');
            }

            // Check if token is valid and not expired
            const [users] = await db.execute(
                'SELECT id FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW()',
                [token]
            );

            if (users.length === 0) {
                return badRequest(res, 'Invalid or expired reset token');
            }

            const userId = users[0].id;

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 12);

            // Update password and clear reset token
            await db.execute(
                'UPDATE users SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?',
                [hashedPassword, userId]
            );

            return ok(res, { data: { message: 'Password reset successfully' } }, 'Password reset completed');
        } catch (error) {
            return internalError(res, error.message);
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
                return badRequest(res, 'Email is required');
            }

            // Check if user exists
            const [users] = await db.execute('SELECT id, email FROM users WHERE email = ?', [email]);
            if (users.length === 0) {
                return notFound(res, 'User not found');
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

            // Send email with reset link
            const appUrl = process.env.APP_BASE_URL || 'http://localhost:5173';
            const link = `${appUrl}/auth/reset-password/${resetToken}`;
            await Email.sendMail({
                to: email,
                subject: 'Reset your password',
                html: `<p>We received a request to reset your password.</p>
                       <p>Click the link below to choose a new password:</p>
                       <p><a href="${link}">${link}</a></p>
                       <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>`
            });

            return ok(res, { data: { sent: true, expiresAt: resetExpires } }, 'Password reset email sent');
        } catch (error) {
            return internalError(res, error.message);
        }
    }

    /**
     * Verify reset token validity
     */
    async verifyResetToken(req, res) {
        try {
            const { token } = req.params;

            if (!token) {
                return badRequest(res, 'Token is required');
            }

            // Check if token is valid and not expired
            const [users] = await db.execute(
                'SELECT id, email FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW()',
                [token]
            );

            if (users.length === 0) {
                return badRequest(res, 'Invalid or expired reset token');
            }

            return ok(res, {
                data: {
                    valid: true,
                    email: users[0].email
                }
            }, 'Reset token is valid');
        } catch (error) {
            return internalError(res, error.message);
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
                return badRequest(res, 'Email is required');
            }

            // Check if user exists
            const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
            if (users.length === 0) {
                return notFound(res, 'User not found');
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

            return ok(res, {
                data: {
                    options,
                    message: 'Available password reset methods retrieved'
                }
            }, 'Password reset options retrieved successfully');
        } catch (error) {
            return internalError(res, error.message);
        }
    }
}

module.exports = new PasswordResetController();
