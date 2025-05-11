const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const chatController = require('../controllers/chatController');

// Rota para obter a sala de chat global - IMPORTANTE: deve vir antes da rota com parâmetro
router.get('/rooms/global', chatController.getGlobalChatRoom);

// Rota para obter salas de chat de um usuário
router.get('/rooms/:userId', chatController.getUserChatRooms);

// Rota para obter ou criar um chat privado
router.post('/rooms/private', chatController.getOrCreatePrivateRoom);

// Rota para criar uma nova sala de chat
router.post('/rooms', chatController.createChatRoom);

// Rota para buscar mensagens de uma sala
router.get('/messages/:roomId', chatController.getChatMessages);

// Rota para enviar mensagem
router.post('/messages', chatController.sendMessage);

// Rota para marcar mensagens como lidas
router.put('/messages/read', chatController.markMessagesAsRead);

module.exports = router; 