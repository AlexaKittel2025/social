const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');

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
  jwt.verify(token, config.jwt.secret, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    // Armazenar as informações do usuário decodificadas na requisição
    req.userId = decoded.id;
    
    // Se não estamos em modo mock, verificar se o usuário existe no banco usando Prisma
    if (!db.isMockMode) {
      try {
        const user = await db.prisma.user.findUnique({
          where: { id: decoded.id }
        });
        
        if (!user) {
          return res.status(401).json({ error: 'Usuário não encontrado' });
        }
      } catch (prismaError) {
        console.error('Erro ao verificar usuário com Prisma:', prismaError);
        // Não verificamos o usuário em modo mock ou em caso de erro
        // O padrão é prosseguir para não interromper o fluxo
      }
    }
    
    return next();
  });
};

module.exports = {
  authenticate
}; 