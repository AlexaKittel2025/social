const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const chatRoutes = require('./routes/chat');
const generatorRoutes = require('./routes/generator');
const storymentsRoutes = require('./routes/storyments');

// Novas rotas
const notificationRoutes = require('./routes/notifications');
const followRoutes = require('./routes/follows');

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar aplicação Express
const app = express();
const PORT = process.env.PORT || 3001;

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

// Rotas da API
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/generator', generatorRoutes);
app.use('/api/storyments', storymentsRoutes);

// Adicionar novas rotas
app.use('/api/notifications', notificationRoutes);
app.use('/api/follows', followRoutes);

// Rota de teste para verificar se a API está funcionando
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', message: 'API está funcionando corretamente', timestamp: new Date() });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`API disponível em http://localhost:${PORT}/api`);
});