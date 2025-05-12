const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

/**
 * Middleware para autenticação JWT
 * Verifica se o token é válido e adiciona o usuário decodificado à requisição
 */
const authenticate = (req, res, next) => {
  // Obter token do cabeçalho Authorization
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  // Mock token para desenvolvimento
  if (token === 'mock-token') {
    req.user = { id: 'user123', username: 'user_test' };
    return next();
  }

  // Se não houver token, retornar erro
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token de autenticação não fornecido' 
    });
  }

  // Verificar token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      error: 'Token inválido ou expirado' 
    });
  }
};

/**
 * Middleware opcional que não bloqueia a requisição sem autenticação
 * Apenas adiciona o usuário à requisição se o token for válido
 */
const optionalAuth = (req, res, next) => {
  // Obter token do cabeçalho Authorization
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  // Mock token para desenvolvimento
  if (token === 'mock-token') {
    req.user = { id: 'user123', username: 'user_test' };
    return next();
  }

  // Se não houver token, continuar sem usuário
  if (!token) {
    return next();
  }

  // Verificar token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    // Ignorar erro, apenas não adiciona o usuário
  }
  
  next();
};

module.exports = {
  authenticate,
  optionalAuth
}; 