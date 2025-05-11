const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Aplicar middleware de autenticação a todas as rotas
router.use(authenticateToken);

// Obter todas as notificações do usuário logado
router.get('/', notificationController.getUserNotifications);

// Marcar uma notificação como lida
router.put('/:notificationId/read', notificationController.markNotificationAsRead);

// Marcar todas as notificações como lidas
router.put('/read-all', notificationController.markAllNotificationsAsRead);

// Excluir uma notificação
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router; 