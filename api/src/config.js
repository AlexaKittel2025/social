require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  db: {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'mentei_db'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'mentei_jwt_secret_key_123456',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  }
}; 