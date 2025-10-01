const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordReset.controller');

/**
 * @route GET /api/password-reset/options/:email
 * @desc Get available password reset options for a user
 * @access Public
 */
router.get('/options/:email', passwordResetController.getPasswordResetOptions);

/**
 * @route POST /api/password-reset/initiate
 * @desc Initiate password reset with security questions
 * @access Public
 */
router.post('/initiate', passwordResetController.initiatePasswordReset);

/**
 * @route POST /api/password-reset/reset
 * @desc Reset password using token from security questions verification
 * @access Public
 */
router.post('/reset', passwordResetController.resetPassword);

/**
 * @route GET /api/password-reset/verify/:token
 * @desc Verify reset token validity
 * @access Public
 */
router.get('/verify/:token', passwordResetController.verifyResetToken);

/**
 * @route POST /api/password-reset/email
 * @desc Initiate password reset via email (fallback method)
 * @access Public
 */
router.post('/email', passwordResetController.initiateEmailPasswordReset);

module.exports = router;
