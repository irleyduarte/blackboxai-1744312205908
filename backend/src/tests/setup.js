require('dotenv').config({
    path: process.env.NODE_ENV === 'test' 
        ? './src/config/test.env' 
        : './src/config/dev.env'
});

process.env.NODE_ENV = 'test';
process.env.PORT = 8001;
process.env.MONGODB_URI_TEST = 'mongodb://localhost:27017/marketplace_test';
process.env.JWT_SECRET = 'chave_secreta_teste_muito_segura';
