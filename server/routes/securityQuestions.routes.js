const express = require('express');
const router = express.Router();
const securityQuestionsController = require('../controllers/securityQuestions.controller');
const { authenticateToken: authMiddleware } = require('../middleware/auth.middleware');

// Public routes (no authentication required)

/**
 * @route GET /api/security-questions
 * @desc Get all available security questions
 * @access Public
 */
router.get('/', securityQuestionsController.getAvailableQuestions);

/**
 * @route GET /api/security-questions/category/:category
 * @desc Get security questions by category
 * @access Public
 */
router.get('/category/:category', securityQuestionsController.getQuestionsByCategory);

/**
 * @route GET /api/security-questions/reset/:email
 * @desc Get user's security questions for password reset
 * @access Public
 */
router.get('/reset/:email', securityQuestionsController.getSecurityQuestionsForReset);

/**
 * @route POST /api/security-questions/verify
 * @desc Verify security question answers for password reset
 * @access Public
 */
router.post('/verify', securityQuestionsController.verifySecurityQuestions);

// Protected routes (authentication required)

/**
 * @route POST /api/security-questions/setup
 * @desc Set up security questions for authenticated user
 * @access Private
 */
router.post('/setup', authMiddleware, securityQuestionsController.setupSecurityQuestions);

/**
 * @route GET /api/security-questions/user
 * @desc Get authenticated user's security questions
 * @access Private
 */
router.get('/user', authMiddleware, securityQuestionsController.getUserSecurityQuestions);

/**
 * @route GET /api/security-questions/check
 * @desc Check if authenticated user has security questions set up
 * @access Private
 */
router.get('/check', authMiddleware, securityQuestionsController.checkSecurityQuestions);

/**
 * @route DELETE /api/security-questions/user
 * @desc Delete authenticated user's security questions
 * @access Private
 */
router.delete('/user', authMiddleware, securityQuestionsController.deleteSecurityQuestions);

/**
 * @route PATCH /api/security-questions/user/:questionId
 * @desc Update a specific security question answer for authenticated user
 * @access Private
 */
router.patch('/user/:questionId', authMiddleware, securityQuestionsController.updateSecurityQuestion);

module.exports = router;
