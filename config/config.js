require('dotenv').config();  // Load environment variables from .env file


module.exports = {
    development: {
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '123456789',
        database: process.env.DB_DATABASE || 'neo_sante_auth',
        host: process.env.DB_HOST || 'localhst',
        dialect: process.env.DB_DIALECT || 'postgres' 
    },
    test: {
    username: 'test-user',
    password: '12345678',
    database: 'neo-sante-test',
    host: 'localhost',
    dialect: 'postgres',
    logging: false
  }
};
