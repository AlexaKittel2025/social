const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const db = require('../db');
const mockDbModule = require('../mock/mockDb');

// Endpoints sem autenticação
router.post('/register', userController.register);
router.post('/login', userController.login);

// Endpoint de teste para limpar usuários mock (apenas para ambiente de desenvolvimento)
router.post('/reset-mock-users', (req, res) => {
  // Somente permitir em modo de desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    if (db.isMockMode) {
      try {
        // Limpar usuários do mock mantendo os originais
        mockDbModule.clearUsers();
        // Se um usuário específico foi requisitado para remoção
        if (req.body.username) {
          const removed = mockDbModule.clearUserByUsername(req.body.username);
          if (removed) {
            return res.json({ message: `Usuário ${req.body.username} removido com sucesso` });
          }
          return res.json({ message: `Usuário ${req.body.username} não encontrado` });
        }
        return res.json({ message: 'Dados de usuários mock resetados com sucesso' });
      } catch (err) {
        console.error('Erro ao resetar usuários mock:', err);
        return res.status(500).json({ error: 'Erro ao resetar dados de usuários' });
      }
    } else {
      return res.status(400).json({ error: 'Este endpoint só funciona em modo mock' });
    }
  } else {
    return res.status(403).json({ error: 'Endpoint não disponível em ambiente de produção' });
  }
});

// Endpoints com autenticação
router.use(authMiddleware.authenticate);
router.get('/profile', userController.getProfile);
router.get('/:id', userController.getUserById);
router.get('/username/:username', userController.getUserByUsername);
router.put('/:id', userController.updateUser);
router.get('/:id/pro-status', userController.checkProStatus);
router.post('/:id/upgrade-pro', userController.upgradeToPro);

module.exports = router; 