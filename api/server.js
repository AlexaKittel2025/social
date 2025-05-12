const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Configuração do servidor Express
const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3002', 'http://127.0.0.1:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Criar servidor HTTP
const server = http.createServer(app);

// Inicializar Socket.IO
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3002', 'http://127.0.0.1:3002'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'] // Garantir que todos os transportes estejam habilitados
});

// Rota básica para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.json({ message: 'Servidor de chat funcionando!' });
});

// Rota de status
app.get('/status', (req, res) => {
  res.json({ 
    status: 'online',
    timestamp: new Date(),
    uptime: process.uptime(),
    clients: io.engine.clientsCount,
    memoryUsage: process.memoryUsage(),
    apiVersion: '1.0.0'
  });
});

// Rota de ping para testes rápidos de conexão
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Middleware para Socket.IO
io.use((socket, next) => {
  // Autenticação simples para desenvolvimento
  const token = socket.handshake.auth.token;
  if (token) {
    // Para desenvolvimento, aceitar qualquer token
    socket.data.userId = token === 'mock-token' ? 'user123' : 'user-' + Math.random().toString(36).substr(2, 9);
    next();
  } else {
    next(new Error('Autenticação necessária'));
  }
});

// Eventos do Socket.IO
io.on('connection', (socket) => {
  const userId = socket.data.userId;
  console.log(`Usuário conectado: ${userId}, Socket ID: ${socket.id}`);
  
  // Enviar confirmação de conexão
  socket.emit('connect:success', { 
    userId, 
    socketId: socket.id,
    message: 'Conexão estabelecida com sucesso'
  });
  
  // Associar usuário à sala global
  socket.join('global');
  
  // Evento de usuário online
  socket.on('user:online', ({ userId }) => {
    console.log(`Usuário online: ${userId}`);
    socket.broadcast.emit('user:status', { userId, status: 'online' });
  });
  
  // Evento de envio de mensagem
  socket.on('message:send', (message) => {
    console.log(`Mensagem recebida de ${userId} para sala ${message.roomId}:`, message);
    
    // Adicionar dados à mensagem
    const enhancedMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    // Enviar mensagem para toda a sala
    io.to(message.roomId).emit('message:receive', enhancedMessage);
  });
  
  // Evento de usuário digitando
  socket.on('user:typing', ({ roomId, userId, isTyping }) => {
    console.log(`Usuário ${userId} está ${isTyping ? 'digitando' : 'parou de digitar'} na sala ${roomId}`);
    socket.to(roomId).emit('user:typing', { roomId, userId, isTyping });
  });
  
  // Evento de mensagens lidas
  socket.on('message:read', ({ roomId, userId }) => {
    console.log(`Mensagens lidas por ${userId} na sala ${roomId}`);
    socket.to(roomId).emit('message:read', { roomId, userId });
  });
  
  // Evento de desconexão
  socket.on('disconnect', (reason) => {
    console.log(`Usuário desconectado: ${userId}, razão: ${reason}`);
    socket.broadcast.emit('user:status', { userId, status: 'offline' });
  });
});

// Iniciar servidor na porta 3001
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor simples rodando em http://localhost:${PORT}`);
  console.log('Socket.IO inicializado e pronto para conexões!');
  console.log(`CORS configurado para aceitar conexões de http://localhost:3000 e http://localhost:3002`);
}); 