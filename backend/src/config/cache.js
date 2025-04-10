const NodeCache = require('node-cache');
const { logger } = require('./logger');

// Criar instância do cache com TTL padrão de 1 hora
const appCache = new NodeCache({
    stdTTL: parseInt(process.env.CACHE_TTL) || 3600,
    checkperiod: 120,
    useClones: false
});

// Middleware de cache
const cacheMiddleware = (duration) => {
    return (req, res, next) => {
        // Pular cache para métodos não-GET
        if (req.method !== 'GET') {
            return next();
        }

        const key = `__express__${req.originalUrl || req.url}`;
        const cachedResponse = appCache.get(key);

        if (cachedResponse) {
            logger.debug(`Cache hit for: ${key}`);
            return res.json(cachedResponse);
        }

        // Substituir res.json para interceptar a resposta
        const originalJson = res.json;
        res.json = function(body) {
            originalJson.call(this, body);
            appCache.set(key, body, duration);
            logger.debug(`Cache set for: ${key}`);
        };

        next();
    };
};

// Serviço de cache para uso geral
const cacheService = {
    get: (key) => {
        const value = appCache.get(key);
        if (value) {
            logger.debug(`Cache hit for key: ${key}`);
        }
        return value;
    },

    set: (key, value, ttl) => {
        appCache.set(key, value, ttl);
        logger.debug(`Cache set for key: ${key}`);
    },

    del: (key) => {
        appCache.del(key);
        logger.debug(`Cache deleted for key: ${key}`);
    },

    flush: () => {
        appCache.flushAll();
        logger.info('Cache flushed');
    },

    stats: () => {
        return appCache.getStats();
    },

    keys: () => {
        return appCache.keys();
    },

    clearAll: () => {
        appCache.flushAll();
        logger.info('Cache cleared completely');
    }
};

// Eventos de cache
appCache.on('expired', (key, value) => {
    logger.debug(`Cache expired for key: ${key}`);
});

appCache.on('flush', () => {
    logger.info('Cache flushed');
});

appCache.on('set', (key, value) => {
    logger.debug(`Cache set for key: ${key}`);
});

appCache.on('del', (key, value) => {
    logger.debug(`Cache deleted for key: ${key}`);
});

module.exports = {
    appCache,
    cacheMiddleware,
    cacheService
};
