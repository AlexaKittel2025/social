const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Middleware para autenticar requisições usando JWT
 * Verifica se o token é válido e adiciona o id do usuário à requisição
 */
function authenticate(req, res, next) {
  // Obter o token do cabeçalho Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }
  
  // Formato esperado: "Bearer TOKEN"
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Erro no formato do token' });
  }
  
  const [scheme, token] = parts;
  
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token mal formatado' });
  }
  
  // Verificar se o token é válido
  jwt.verify(token, config.jwt.secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    // Adicionar o ID do usuário à requisição
    req.userId = decoded.id;
    
    return next();
  });
}

/**
 * Middleware para verificar se o usuário tem status PRO
 * Deve ser usado após o middleware de autenticação
 */
async function verifyProStatus(req, res, next) {
  try {
    // Aqui seria feita uma consulta ao banco para verificar o status PRO
    // Por simplicidade, vamos apenas verificar o userId por enquanto
    const proUsers = ['1', '3', '5']; // IDs mockados de usuários PRO
    
    if (!proUsers.includes(req.userId.toString())) {
      return res.status(403).json({ 
        error: 'Acesso negado', 
        message: 'Esta funcionalidade é exclusiva para usuários PRO'
      });
    }
    
    return next();
  } catch (error) {
    console.error('Erro ao verificar status PRO:', error);
    return res.status(500).json({ error: 'Erro ao verificar status PRO' });
  }
}

module.exports = { authenticate, verifyProStatus }; 