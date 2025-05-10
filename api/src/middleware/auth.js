const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Middleware para verificar se o usuário está autenticado
 */
const authenticate = (req, res, next) => {
  // Obter o token do cabeçalho
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }
  
  // Formato esperado: "Bearer TOKEN"
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }
  
  const [scheme, token] = parts;
  
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }
  
  // Verificar o token
  jwt.verify(token, config.jwt.secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    // Armazenar as informações do usuário decodificadas na requisição
    req.userId = decoded.id;
    
    return next();
  });
};

module.exports = {
  authenticate
}; 