const { Router } = require('express');
const AuthController = require('../controllers/auth.controller');

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);

module.exports = router;


