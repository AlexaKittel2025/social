const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const { authenticate } = require('../middleware/authMiddleware');

// Aplicar middleware de autenticação a todas as rotas
router.use(authenticate);

// Seguir um usuário
router.post('/:userId/follow', followController.followUser);

// Deixar de seguir um usuário
router.delete('/:userId/follow', followController.unfollowUser);

// Obter seguidores de um usuário
router.get('/:userId/followers', followController.getFollowers);

// Obter usuários que um usuário segue
router.get('/:userId/following', followController.getFollowing);

// Verificar se o usuário logado segue outro usuário
router.get('/:userId/status', followController.checkFollowStatus);

module.exports = router; 