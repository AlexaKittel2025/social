const { Pool } = require('pg');
const config = require('./config');
const mockDbModule = require('./mock/mockDb');
const prisma = require('./prisma');

let pool = null;
let isMockMode = true; // Definindo explicitamente o modo mock como verdadeiro

// Modo mock está agora habilitado por padrão
console.log('Modo mock ativado por configuração explícita.');

// Verificar se devemos usar modo mock (verificar variável de ambiente ou outros fatores)
if (process.env.USE_MOCK === 'true') {
  console.log('Modo mock ativado por configuração.');
  isMockMode = true;
} else if (process.env.FORCE_DB === 'true') {
  // Somente tentar conectar ao banco se explicitamente solicitado
  try {
    // Criar um pool de conexões com o PostgreSQL
    pool = new Pool({
      user: config.db.user,
      password: config.db.password,
      host: config.db.host,
      port: config.db.port,
      database: config.db.database
    });

    // Testar a conexão
    pool.connect((err, client, release) => {
      if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        console.log('ATENÇÃO: Modo mock ativado automaticamente devido a erro de conexão.');
        console.log('Para usar dados reais, certifique-se que:');
        console.log('1. PostgreSQL está instalado e em execução');
        console.log('2. As credenciais estão corretas no arquivo .env:');
        console.log(`   - Usuário: ${config.db.user}`);
        console.log(`   - Senha: ${config.db.password}`);
        console.log(`   - Host: ${config.db.host}`);
        console.log(`   - Porta: ${config.db.port}`);
        console.log(`   - Banco de dados: ${config.db.database}`);
        console.log('3. O banco de dados foi criado');
        isMockMode = true;
      } else {
        console.log('Conexão com o banco de dados PostgreSQL estabelecida com sucesso');
        isMockMode = false;
        release();
      }
    });
  } catch (error) {
    console.error('Erro ao configurar conexão com o banco de dados:', error);
    console.log('Modo mock ativado devido a erro de configuração.');
    isMockMode = true;
  }
}

// Função para debug - mostrar usuários mockados
console.log('Base de dados mock - Usuários:', mockDbModule.getUsers().map(u => ({ id: u.id, username: u.username, email: u.email })));

// Função para processar consultas simuladas de mock
const processMockQuery = (text, params) => {
  console.log('MOCK QUERY:', text, params);
  
  // Simulação de algumas consultas básicas
  if (text.includes('SELECT * FROM users')) {
    return { rows: mockDbModule.getUsers(), rowCount: mockDbModule.getUsers().length };
  }
  
  if (text.includes('SELECT * FROM posts')) {
    return { rows: mockDbModule.getPosts(), rowCount: mockDbModule.getPosts().length };
  }
  
  // Verificação de usuário existente (para registro)
  if (text.includes('SELECT * FROM users WHERE username = $1 OR email = $2')) {
    const username = params[0];
    const email = params[1];
    
    console.log(`Verificando usuário existente - Username: ${username}, Email: ${email}`);
    
    // Verificar cada campo separadamente para mensagens de erro mais específicas
    const existingUsername = mockDbModule.getUserByUsername(username);
    const existingEmail = mockDbModule.getUserByEmail(email);
    
    console.log('Username já existe?', existingUsername ? 'SIM' : 'NÃO');
    console.log('Email já existe?', existingEmail ? 'SIM' : 'NÃO');
    
    // Se username ou email existir, retornar o registro encontrado
    const existingUser = existingUsername || existingEmail;
    
    if (existingUser) {
      console.log('Usuário existente encontrado:', {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email
      });
    } else {
      console.log('Usuário não encontrado, permitindo registro');
    }
    
    return { rows: existingUser ? [existingUser] : [], rowCount: existingUser ? 1 : 0 };
  }
  
  // Simulação de login
  if (text.includes('SELECT * FROM users WHERE email = $1')) {
    const email = params[0];
    console.log(`Tentativa de login com email: ${email}`);
    const user = mockDbModule.getUserByEmail(email);
    console.log('Usuário encontrado para login?', user ? 'SIM' : 'NÃO');
    
    if (user) {
      console.log('Detalhes do usuário encontrado:', { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        senha_hash_parcial: user.password.substring(0, 10) + '...'
      });
    }
    
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }
  
  // Inserção de novo usuário
  if (text.includes('INSERT INTO users')) {
    const newUser = {
      username: params[0],
      display_name: params[1],
      email: params[2],
      photo_url: params[3] || null,
      bio: params[4] || null,
      points: params[5] || 0,
      level: params[6] || 1,
      is_pro: params[7] || false,
      password: params[8], // Cuidado: este é o hash da senha
    };
    
    console.log('Inserindo novo usuário:', { 
      username: newUser.username, 
      email: newUser.email, 
      displayName: newUser.display_name 
    });
    
    const createdUser = mockDbModule.addUser(newUser);
    
    console.log('Usuário criado com sucesso:', {
      id: createdUser.id,
      username: createdUser.username,
      email: createdUser.email
    });
    
    // Log de todos os usuários após a inserção
    console.log('Lista atualizada de usuários:', 
      mockDbModule.getUsers().map(u => ({ id: u.id, username: u.username, email: u.email })));
    
    return { rows: [createdUser], rowCount: 1 };
  }
  
  // Inserção de configurações do usuário
  if (text.includes('INSERT INTO user_settings')) {
    return { rows: [{ user_id: params[0] }], rowCount: 1 };
  }
  
  // Pesquisa de usuário por ID
  if (text.includes('SELECT * FROM users WHERE id = $1')) {
    const userId = params[0];
    const user = mockDbModule.getUserById(userId);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }
  
  // Consulta padrão
  console.log('Consulta não implementada no mock:', text);
  return { rows: [], rowCount: 0 };
};

// Função para executar consultas - exportada para uso externo
const query = async (text, params = []) => {
  if (isMockMode) {
    return processMockQuery(text, params);
  } else {
    try {
      // Em modo não-mock, tentamos usar Prisma primeiro
      console.log('Executando consulta com Prisma:', text);
      
      // Aqui precisaríamos mapear consultas SQL para operações Prisma
      // Isso é complexo e depende de cada consulta específica
      // No mundo real, reescreveríamos cada controlador para usar diretamente o Prisma
      
      // Por enquanto, fallback para SQL direto com Pool
      return await pool.query(text, params);
    } catch (error) {
      console.error('Erro ao executar consulta no banco de dados real:', error);
      
      // Tentar processar a consulta em modo mock como fallback
      console.log('Tentando processar consulta em modo mock como fallback');
      return processMockQuery(text, params);
    }
  }
};

// Função para obter um cliente do pool (para transações)
const getClient = async () => {
  if (isMockMode) {
    return {
      query: processMockQuery,
      release: () => console.log('Mock client released')
    };
  }
  return await pool.connect();
};

// Exportando as funções e objetos necessários
module.exports = {
  query,
  getClient,
  pool,
  isMockMode,
  mockDbModule, // Exportando o módulo de mock para uso direto
  prisma // Exportando o cliente Prisma para uso direto
}; 