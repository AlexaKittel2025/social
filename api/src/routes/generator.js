const express = require('express');
const generatorController = require('../controllers/generatorController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Rotas protegidas (requerem autenticação e verificação de status PRO)
router.post('/lie', authenticate, generatorController.generateLie);

module.exports = router; 