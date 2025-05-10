const express = require('express');
const cors = require('cors');
const config = require('./config');
const db = require('./db');

// Importar rotas
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const storymentRoutes = require('./routes/storyments');
const generatorRoutes = require('./routes/generator');

// Inicializar aplicação Express
const app = express();

// Configurar middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logs simples
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Definir rotas da API
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/storyments', storymentRoutes);
app.use('/api/generator', generatorRoutes);

// Rota raiz para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.json({ 
    message: 'API do Mentei está funcionando!', 
    version: '1.0.0', 
    env: config.server.nodeEnv 
  });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar o servidor
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} em modo ${config.server.nodeEnv}`);
  console.log(`API disponível em http://localhost:${PORT}`);
});

// Tratamento de exceções não capturadas
process.on('uncaughtException', (err) => {
  console.error('Exceção não capturada:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promessa rejeitada não tratada:', reason);
}); 