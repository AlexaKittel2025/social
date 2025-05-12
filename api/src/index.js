const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const setupSocketServer = require('./socket');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const chatRoutes = require('./routes/chat');
const generatorRoutes = require('./routes/generator');
const storymentsRoutes = require('./routes/storyments');
const notificationRoutes = require('./routes/notifications');
const followRoutes = require('./routes/follows');
const statusRoutes = require('./routes/statusRoutes');

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar aplicação Express
const app = express();
const PORT = process.env.PORT || 3001;

// Criar servidor HTTP
const server = http.createServer(app);

// Inicializar Socket.IO
const io = setupSocketServer(server);

// Configurar CORS para permitir requisições do frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Middleware para processar JSON no corpo das requisições
app.use(express.json());

// Log de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Rota de teste raiz
app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API Mentei' });
});

// Rota de teste rápida para status
app.get('/status', (req, res) => {
  res.json({ status: 'online', timestamp: new Date() });
});

// Rotas principais da API
app.use('/api/status', statusRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/generator', generatorRoutes);
app.use('/api/storyments', storymentsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/follows', followRoutes);

// Middleware para lidar com rotas não encontradas
app.use((req, res, next) => {
  console.log(`Rota não encontrada: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada'
  });
});

// Middleware para lidar com erros
app.use((err, req, res, next) => {
  console.error('Erro na API:', err.stack || err);
  res.status(500).json({
    success: false,
    error: 'Erro interno no servidor',
    message: err.message
  });
});

// Iniciar o servidor HTTP
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`API disponível em http://localhost:${PORT}/api`);
  console.log(`Status da API em http://localhost:${PORT}/api/status`);
  console.log(`Socket.IO inicializado e escutando por conexões`);
});