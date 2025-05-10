const { Pool } = require('pg');
const config = require('./config');

let pool = null;
let isMockMode = false;

// Verifique se estamos usando mock ou banco de dados real
if (!process.env.USE_MOCK && process.env.NODE_ENV !== 'test') {
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
        console.log('Modo de mock ativado devido a erro de conexão.');
        isMockMode = true;
      } else {
        console.log('Conexão com o banco de dados PostgreSQL estabelecida com sucesso');
        isMockMode = false;
        release();
      }
    });
  } catch (error) {
    console.error('Erro ao configurar conexão com o banco de dados:', error);
    console.log('Modo de mock ativado devido a erro de configuração.');
    isMockMode = true;
  }
} else {
  console.log('Usando modo de mock para banco de dados.');
  isMockMode = true;
}

// Função para executar consultas no banco de dados
const query = async (text, params) => {
  if (isMockMode) {
    console.log('MOCK QUERY:', text, params);
    return { rows: [], rowCount: 0 };
  }
  
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Erro na consulta ao banco de dados:', error);
    throw error;
  }
};

// Função para obter um cliente do pool (para transações)
const getClient = async () => {
  if (isMockMode) {
    console.log('MOCK CLIENT REQUESTED');
    return {
      query: (text, params) => {
        console.log('MOCK CLIENT QUERY:', text, params);
        return { rows: [], rowCount: 0 };
      },
      release: () => console.log('MOCK CLIENT RELEASED')
    };
  }
  
  return await pool.connect();
};

module.exports = {
  query,
  getClient,
  pool,
  isMockMode
}; 