const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

describe('Testes do Servidor', () => {
    beforeAll(async () => {
        // Criar instância do MongoDB em memória
        mongod = await MongoMemoryServer.create();
        const mongoUri = mongod.getUri();
        await mongoose.connect(mongoUri);
    });

    afterAll(async () => {
        // Fechar conexão e parar servidor MongoDB
        await mongoose.connection.close();
        await mongod.stop();
    });

    describe('Rota Inicial', () => {
        it('deve retornar status 200 e informações básicas da API', async () => {
            const response = await request(app).get('/');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('nome', 'API do Marketplace');
            expect(response.body).toHaveProperty('status', 'online');
        });
    });

    describe('Autenticação de Usuário', () => {
        const usuarioTeste = {
            nome: 'Teste Jest',
            email: 'jest@teste.com',
            senha: '123456',
            tipo: 'lojista'
        };

        it('deve registrar um novo usuário', async () => {
            const response = await request(app)
                .post('/api/usuarios/registrar')
                .send(usuarioTeste);

            expect(response.status).toBe(201);
            expect(response.body.erro).toBe(false);
            expect(response.body.dados).toHaveProperty('token');
            expect(response.body.dados.email).toBe(usuarioTeste.email);
        });

        it('deve fazer login com usuário registrado', async () => {
            const response = await request(app)
                .post('/api/usuarios/login')
                .send({
                    email: usuarioTeste.email,
                    senha: usuarioTeste.senha
                });

            expect(response.status).toBe(200);
            expect(response.body.erro).toBe(false);
            expect(response.body.dados).toHaveProperty('token');
        });

        it('deve retornar erro ao tentar login com credenciais inválidas', async () => {
            const response = await request(app)
                .post('/api/usuarios/login')
                .send({
                    email: usuarioTeste.email,
                    senha: 'senha_errada'
                });

            expect(response.status).toBe(401);
            expect(response.body.erro).toBe(true);
        });
    });

    describe('Rotas Protegidas', () => {
        let token;

        beforeAll(async () => {
            // Criar usuário e obter token
            const response = await request(app)
                .post('/api/usuarios/registrar')
                .send({
                    nome: 'Usuário Protegido',
                    email: 'protegido@teste.com',
                    senha: '123456',
                    tipo: 'lojista'
                });

            token = response.body.dados.token;
        });

        it('deve acessar perfil com token válido', async () => {
            const response = await request(app)
                .get('/api/usuarios/perfil')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.erro).toBe(false);
            expect(response.body.dados).toHaveProperty('email', 'protegido@teste.com');
        });

        it('deve negar acesso sem token', async () => {
            const response = await request(app)
                .get('/api/usuarios/perfil');

            expect(response.status).toBe(401);
            expect(response.body.erro).toBe(true);
        });

        it('deve negar acesso com token inválido', async () => {
            const response = await request(app)
                .get('/api/usuarios/perfil')
                .set('Authorization', 'Bearer token_invalido');

            expect(response.status).toBe(401);
            expect(response.body.erro).toBe(true);
        });
    });
});
