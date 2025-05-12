const express = require('express');
const router = express.Router();

// Rota de status da API
router.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'API está funcionando corretamente', 
    timestamp: new Date(),
    socketio: 'enabled'
  });
});

// Rota para verificar o status do Socket.IO
router.get('/socket', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'Socket.IO está funcionando',
    timestamp: new Date()
  });
});

// Rota para verificar a saúde da API
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date()
  });
});

module.exports = router; 