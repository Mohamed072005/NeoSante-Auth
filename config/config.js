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
        username: process.env.TEST_DB_USERNAME || process.env.DB_USERNAME,
        password: process.env.TEST_DB_PASSWORD || process.env.DB_PASSWORD,
        database: process.env.TEST_DB_DATABASE || process.env.DB_DATABASE,
        host: process.env.TEST_DB_HOST || process.env.DB_HOST,
        dialect: process.env.TEST_DB_DIALECT || process.env.DB_DIALECT
    }
};
