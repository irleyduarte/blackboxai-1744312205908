const Usuario = require('../models/Usuario');
const { logger } = require('../config/logger');
const { appCache } = require('../config/cache');

// Registrar novo usuário
exports.registrar = async (req, res) => {
    try {
        const { nome, email, senha, tipo } = req.body;

        const usuario = await Usuario.create({
            nome,
            email,
            senha,
            tipo
        });

        // Gerar token
        const token = usuario.gerarToken();

        res.status(201).json({
            sucesso: true,
            usuario: usuario.toJSON(),
            token
        });
    } catch (error) {
        logger.error('Erro ao registrar usuário:', error);
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                erro: true,
                mensagem: 'Dados inválidos',
                detalhes: error.errors.map(err => err.message)
            });
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                erro: true,
                mensagem: 'Email já cadastrado'
            });
        }

        res.status(500).json({
            erro: true,
            mensagem: 'Erro ao registrar usuário'
        });
    }
};

// Login de usuário
exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Verificar se o usuário existe
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            return res.status(401).json({
                erro: true,
                mensagem: 'Credenciais inválidas'
            });
        }

        // Verificar senha
        const senhaCorreta = await usuario.verificarSenha(senha);
        if (!senhaCorreta) {
            return res.status(401).json({
                erro: true,
                mensagem: 'Credenciais inválidas'
            });
        }

        // Atualizar último login
        usuario.ultimo_login = new Date();
        await usuario.save();

        // Gerar token
        const token = usuario.gerarToken();

        res.json({
            sucesso: true,
            usuario: usuario.toJSON(),
            token
        });
    } catch (error) {
        logger.error('Erro no login:', error);
        res.status(500).json({
            erro: true,
            mensagem: 'Erro ao realizar login'
        });
    }
};

// Obter perfil do usuário
exports.getPerfil = async (req, res) => {
    try {
        const cacheKey = `perfil_${req.usuario.id}`;
        const perfilCache = appCache.get(cacheKey);

        if (perfilCache) {
            return res.json(perfilCache);
        }

        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario) {
            return res.status(404).json({
                erro: true,
                mensagem: 'Usuário não encontrado'
            });
        }

        const perfil = usuario.toJSON();
        appCache.set(cacheKey, perfil, 300); // Cache por 5 minutos

        res.json(perfil);
    } catch (error) {
        logger.error('Erro ao obter perfil:', error);
        res.status(500).json({
            erro: true,
            mensagem: 'Erro ao obter perfil'
        });
    }
};

// Atualizar perfil do usuário
exports.atualizarPerfil = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario) {
            return res.status(404).json({
                erro: true,
                mensagem: 'Usuário não encontrado'
            });
        }

        const { nome, senha } = req.body;

        if (nome) usuario.nome = nome;
        if (senha) usuario.senha = senha;

        await usuario.save();

        // Limpar cache
        appCache.del(`perfil_${req.usuario.id}`);

        res.json({
            sucesso: true,
            usuario: usuario.toJSON()
        });
    } catch (error) {
        logger.error('Erro ao atualizar perfil:', error);
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                erro: true,
                mensagem: 'Dados inválidos',
                detalhes: error.errors.map(err => err.message)
            });
        }

        res.status(500).json({
            erro: true,
            mensagem: 'Erro ao atualizar perfil'
        });
    }
};

// Desativar conta
exports.desativarConta = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario) {
            return res.status(404).json({
                erro: true,
                mensagem: 'Usuário não encontrado'
            });
        }

        usuario.ativo = false;
        await usuario.save();

        // Limpar cache
        appCache.del(`perfil_${req.usuario.id}`);

        res.json({
            sucesso: true,
            mensagem: 'Conta desativada com sucesso'
        });
    } catch (error) {
        logger.error('Erro ao desativar conta:', error);
        res.status(500).json({
            erro: true,
            mensagem: 'Erro ao desativar conta'
        });
    }
};
