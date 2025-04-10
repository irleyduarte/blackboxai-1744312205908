const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const auth = require('../middlewares/auth');

// Rotas públicas
router.post('/registrar', usuarioController.registrar);
router.post('/login', usuarioController.login);

// Rotas protegidas
router.get('/perfil', auth.protect, usuarioController.getPerfil);
router.put('/perfil', auth.protect, usuarioController.atualizarPerfil);
router.delete('/desativar', auth.protect, usuarioController.desativarConta);

// Rotas específicas para lojistas
router.get('/lojista/:id', 
    auth.protect, 
    auth.authorize('lojista', 'admin'), 
    usuarioController.getPerfilLojista
);

module.exports = router;
