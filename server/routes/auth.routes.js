const { Router } = require('express');
const AuthController = require('../controllers/auth.controller');
const OauthController = require('../controllers/oauth.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth');

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
// Relaxed rate limiting for logout handled at global middleware (skip), keep route simple
router.post('/logout', AuthController.logout);
router.post('/magic/request', AuthController.requestMagicLink);
router.post('/magic/consume', AuthController.consumeMagicLink);

// OAuth routes
router.get('/oauth/google/url', OauthController.googleAuthUrl);
router.get('/oauth/google/callback', OauthController.googleCallback);
router.get('/oauth/facebook/url', OauthController.facebookAuthUrl);
router.get('/oauth/facebook/callback', OauthController.facebookCallback);

// Protected routes
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, AuthController.updateProfile);
router.post('/change-password', authenticate, AuthController.changePassword);
router.get('/sessions', authenticate, AuthController.listSessions);
router.delete('/sessions', authenticate, AuthController.revokeAllSessions);
router.delete('/sessions/:sessionId', authenticate, AuthController.revokeSession);
router.delete('/delete-account', authenticate, AuthController.deleteAccount);
router.get('/2fa/setup', authenticate, AuthController.twoFASetup);
router.post('/2fa/enable', authenticate, AuthController.twoFAEnable);
router.post('/2fa/disable', authenticate, AuthController.twoFADisable);
router.get('/export', authenticate, AuthController.exportData);

// Admin-only routes
router.post('/users', authenticate, authorizeRoles('admin'), AuthController.createUser);
router.get('/users', authenticate, authorizeRoles('admin'), AuthController.listUsers);
router.put('/users/:userId/role', authenticate, authorizeRoles('admin'), AuthController.updateUserRole);
router.delete('/users/:userId', authenticate, authorizeRoles('admin'), AuthController.deleteUser);

module.exports = router;


