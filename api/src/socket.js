const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

// Função para configurar o servidor Socket.io
const setupSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Middleware para autenticação
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Autenticação necessária'));
    }

    try {
      // Verificar token de forma simples para demonstração
      // Em produção, usar verificação JWT completa
      const decoded = token === 'mock-token' 
        ? { id: 'user123' } 
        : jwt.verify(token, JWT_SECRET);
        
      socket.data.userId = decoded.id;
      next();
    } catch (error) {
      console.error('Erro na autenticação do socket:', error);
      return next(new Error('Token inválido'));
    }
  });

  // Gerenciamento de conexões
  io.on('connection', async (socket) => {
    const userId = socket.data.userId;
    console.log(`Usuário conectado ao socket: ${userId}, socketId: ${socket.id}`);

    // Notificar cliente que conexão foi estabelecida
    socket.emit('connect:success', { 
      message: 'Conexão estabelecida com sucesso', 
      userId 
    });

    // Associar usuário ao chat global
    socket.join('global');
      
    // Evento quando usuário fica online
    socket.on('user:online', ({ userId }) => {
      console.log(`Usuário online: ${userId}`);
      socket.broadcast.emit('user:status', { userId, status: 'online' });
    });

    // Evento de envio de mensagem
    socket.on('message:send', (message) => {
      console.log(`Mensagem recebida de ${userId} para sala ${message.roomId}:`, message);
      
      // Adicionar dados necessários à mensagem
      const enhancedMessage = {
        ...message,
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      // Emitir mensagem para a sala (incluindo o remetente para confirmar entrega)
      io.to(message.roomId).emit('message:receive', enhancedMessage);
    });

    // Evento de digitação
    socket.on('user:typing', ({ roomId, userId, isTyping }) => {
      console.log(`Usuário ${userId} está ${isTyping ? 'digitando' : 'parou de digitar'} na sala ${roomId}`);
      socket.to(roomId).emit('user:typing', { userId, roomId, isTyping });
    });

    // Evento de leitura de mensagens
    socket.on('message:read', ({ roomId, userId }) => {
      console.log(`Mensagens lidas por ${userId} na sala ${roomId}`);
      socket.to(roomId).emit('message:read', { roomId, userId });
    });

    // Evento de desconexão
    socket.on('disconnect', () => {
      console.log(`Usuário desconectado: ${userId}`);
      socket.broadcast.emit('user:status', { userId, status: 'offline' });
    });
  });

  return io;
};

module.exports = setupSocketServer; 