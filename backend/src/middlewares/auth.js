const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { logger } = require('../config/logger');

exports.protect = async (req, res, next) => {
    try {
        let token;

        // Verificar se o token está presente no header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                erro: true,
                mensagem: 'Não autorizado - Token não fornecido'
            });
        }

        try {
            // Verificar token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_jwt_super_secreta_aqui');

            // Buscar usuário
            const usuario = await Usuario.findByPk(decoded.id);
            
            if (!usuario) {
                return res.status(401).json({
                    erro: true,
                    mensagem: 'Usuário não encontrado'
                });
            }

            if (!usuario.ativo) {
                return res.status(401).json({
                    erro: true,
                    mensagem: 'Conta desativada'
                });
            }

            // Adicionar usuário à requisição
            req.usuario = usuario;
            next();
        } catch (error) {
            logger.error('Erro na verificação do token:', error);
            return res.status(401).json({
                erro: true,
                mensagem: 'Token inválido ou expirado'
            });
        }
    } catch (error) {
        logger.error('Erro no middleware de autenticação:', error);
        res.status(500).json({
            erro: true,
            mensagem: 'Erro no servidor'
        });
    }
};

// Middleware para verificar tipo de usuário
exports.authorize = (...tipos) => {
    return (req, res, next) => {
        if (!tipos.includes(req.usuario.tipo)) {
            return res.status(403).json({
                erro: true,
                mensagem: 'Acesso negado - Permissão insuficiente'
            });
        }
        next();
    };
};

// Middleware para limitar acesso apenas ao próprio usuário
exports.apenasProprioUsuario = (req, res, next) => {
    const usuarioId = parseInt(req.params.id);
    
    if (usuarioId !== req.usuario.id) {
        return res.status(403).json({
            erro: true,
            mensagem: 'Acesso negado - Você só pode acessar seus próprios dados'
        });
    }
    next();
};
