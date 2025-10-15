const { Router } = require('express');
const AuthController = require('../controllers/auth.controller');
const OauthController = require('../controllers/oauth.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth');

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
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

// Admin-only routes
router.post('/users', authenticate, authorizeRoles('admin'), AuthController.createUser);
router.get('/users', authenticate, authorizeRoles('admin'), AuthController.listUsers);
router.put('/users/:userId/role', authenticate, authorizeRoles('admin'), AuthController.updateUserRole);
router.delete('/users/:userId', authenticate, authorizeRoles('admin'), AuthController.deleteUser);

module.exports = router;


