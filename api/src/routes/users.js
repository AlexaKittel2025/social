const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Rotas públicas
router.post('/register', userController.register);
router.post('/login', userController.login);

// Rotas protegidas (requerem autenticação)
router.get('/:id', authenticate, userController.getUserById);
router.get('/username/:username', authenticate, userController.getUserByUsername);
router.put('/:id', authenticate, userController.updateUser);
router.get('/:id/pro-status', authenticate, userController.checkProStatus);
router.post('/:id/upgrade-pro', authenticate, userController.upgradeToPro);

module.exports = router; 