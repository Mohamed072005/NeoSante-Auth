require('dotenv').config();  // Load environment variables from .env file


module.exports = {
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT
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
