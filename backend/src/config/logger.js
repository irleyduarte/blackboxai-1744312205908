const winston = require('winston');
const path = require('path');
const morgan = require('morgan');

// Configuração de níveis de log personalizados
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

// Configuração de cores para diferentes níveis
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue'
};

// Adicionar cores ao Winston
winston.addColors(colors);

// Formato personalizado para logs
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:SSS' }),
    winston.format.json(),
    winston.format.errors({ stack: true })
);

// Configuração dos transportes (destinos) dos logs
const transports = [
    // Console
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.printf(
                (info) => `${info.timestamp} ${info.level}: ${info.message}`
            )
        )
    }),
    // Arquivo de erros
    new winston.transports.File({
        filename: path.join(__dirname, '../logs/error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: winston.format.combine(
            winston.format.uncolorize(),
            winston.format.json()
        )
    }),
    // Arquivo com todos os logs
    new winston.transports.File({
        filename: path.join(__dirname, '../logs/combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: winston.format.combine(
            winston.format.uncolorize(),
            winston.format.json()
        )
    })
];

// Criar o logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    format,
    transports,
    exitOnError: false
});

// Middleware para logging de HTTP requests
const httpLogger = morgan('combined', {
    stream: {
        write: (message) => logger.http(message.trim())
    }
});

// Middleware para logging de erros
const errorLogger = (err, req, res, next) => {
    logger.error('Erro na aplicação:', {
        error: {
            message: err.message,
            stack: err.stack,
            status: err.status
        },
        request: {
            method: req.method,
            url: req.url,
            body: req.body,
            headers: req.headers,
            ip: req.ip
        }
    });
    next(err);
};

// Função para log de performance
const logPerformance = (label, startTime) => {
    const duration = process.hrtime(startTime);
    const durationMs = (duration[0] * 1000) + (duration[1] / 1e6);
    logger.debug(`Performance - ${label}: ${durationMs.toFixed(3)}ms`);
};

// Função para log de queries do banco de dados
const logQuery = (query, params, duration) => {
    logger.debug('Database Query:', {
        query,
        params,
        duration: `${duration}ms`
    });
};

// Função para log de cache
const logCache = (action, key, hit = null) => {
    logger.debug('Cache Operation:', {
        action,
        key,
        hit
    });
};

// Função para log de autenticação
const logAuth = (action, userId, success) => {
    logger.info('Authentication:', {
        action,
        userId,
        success,
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    logger,
    httpLogger,
    errorLogger,
    logPerformance,
    logQuery,
    logCache,
    logAuth
};
