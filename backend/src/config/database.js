const { Sequelize } = require('sequelize');
const { logger } = require('./logger');
const path = require('path');

// Criar diretório para o banco de dados SQLite
const dbPath = path.join(__dirname, '../../data/database.sqlite');

// Configurar o Sequelize com SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: (msg) => logger.debug(msg),
    define: {
        timestamps: true,
        underscored: true,
        underscoredAll: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Conexão com SQLite estabelecida com sucesso.');

        // Sincronizar modelos com o banco de dados
        await sequelize.sync();
        logger.info('Modelos sincronizados com o banco de dados.');

        return sequelize;
    } catch (error) {
        logger.error('Erro ao conectar com o banco de dados:', error);
        if (process.env.NODE_ENV === 'development') {
            logger.info('Tentando reconectar em 5 segundos...');
            setTimeout(connectDB, 5000);
        } else {
            throw error;
        }
    }
};

// Função para limpar o banco de dados (útil para testes)
const clearDatabase = async () => {
    if (process.env.NODE_ENV === 'test') {
        try {
            await sequelize.drop();
            await sequelize.sync();
            logger.info('Banco de dados limpo e recriado com sucesso.');
        } catch (error) {
            logger.error('Erro ao limpar banco de dados:', error);
            throw error;
        }
    } else {
        logger.warn('Tentativa de limpar banco de dados fora do ambiente de teste.');
    }
};

// Função para fechar a conexão
const closeDatabase = async () => {
    try {
        await sequelize.close();
        logger.info('Conexão com o banco de dados fechada com sucesso.');
    } catch (error) {
        logger.error('Erro ao fechar conexão com o banco de dados:', error);
        throw error;
    }
};

// Tratamento de erros de conexão
sequelize.addHook('beforeConnect', async (config) => {
    logger.info('Tentando conectar ao banco de dados...');
});

sequelize.addHook('afterConnect', async (connection) => {
    logger.info('Conexão estabelecida com sucesso.');
});

// Exportar instância do Sequelize e funções auxiliares
module.exports = {
    sequelize,
    connectDB,
    clearDatabase,
    closeDatabase
};
