const express = require('express');
const router = express.Router();
const battleController = require('../controllers/battleController');
const { authenticateToken } = require('../middleware/auth');

// Rotas públicas
router.get('/', battleController.getAllBattles);
router.get('/:battleId', battleController.getBattleById);

// Rotas protegidas (requerem autenticação)
router.post('/', authenticateToken, battleController.createBattle);
router.post('/:battleId/participate', authenticateToken, battleController.participateInBattle);
router.post('/participations/:participationId/vote', authenticateToken, battleController.voteOnParticipation);
router.post('/:battleId/finish', authenticateToken, battleController.finishBattle);

module.exports = router; 