const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const config = require('../config');

async function setupDatabase() {
  console.log('Iniciando configuração do banco de dados...');
  
  // Criar o pool de conexão com o PostgreSQL
  const pool = new Pool({
    user: config.db.user,
    password: config.db.password,
    host: config.db.host,
    port: config.db.port,
    database: config.db.database
  });
  
  try {
    // Testar conexão
    console.log('Testando conexão com o PostgreSQL...');
    await pool.query('SELECT NOW()');
    console.log('Conexão com o PostgreSQL estabelecida com sucesso.');
    
    // Ler o arquivo SQL
    console.log('Lendo arquivo de configuração SQL...');
    const sqlFilePath = path.join(__dirname, 'setup.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Executar o script SQL
    console.log('Executando script SQL...');
    await pool.query(sqlScript);
    
    console.log('Configuração do banco de dados concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a configuração do banco de dados:', error);
  } finally {
    // Encerrar a conexão
    await pool.end();
    console.log('Conexão com o banco de dados encerrada.');
  }
}

// Executar a configuração
setupDatabase(); 