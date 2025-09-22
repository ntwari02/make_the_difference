const { Router } = require('express');
const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);

// Protected routes
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, AuthController.updateProfile);

module.exports = router;


