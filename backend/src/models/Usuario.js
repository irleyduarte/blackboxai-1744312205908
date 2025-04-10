const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Usuario = sequelize.define('Usuario', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'O nome é obrigatório'
            },
            len: {
                args: [2, 100],
                msg: 'O nome deve ter entre 2 e 100 caracteres'
            }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            msg: 'Este email já está em uso'
        },
        validate: {
            isEmail: {
                msg: 'Email inválido'
            },
            notEmpty: {
                msg: 'O email é obrigatório'
            }
        }
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'A senha é obrigatória'
            },
            len: {
                args: [6, 100],
                msg: 'A senha deve ter no mínimo 6 caracteres'
            }
        }
    },
    tipo: {
        type: DataTypes.ENUM('comprador', 'lojista'),
        allowNull: false,
        defaultValue: 'comprador',
        validate: {
            isIn: {
                args: [['comprador', 'lojista']],
                msg: 'Tipo de usuário inválido'
            }
        }
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    ultimo_login: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'usuarios',
    hooks: {
        beforeSave: async (usuario) => {
            if (usuario.changed('senha')) {
                const salt = await bcrypt.genSalt(10);
                usuario.senha = await bcrypt.hash(usuario.senha, salt);
            }
        }
    }
});

// Método para verificar senha
Usuario.prototype.verificarSenha = async function(senhaInformada) {
    return await bcrypt.compare(senhaInformada, this.senha);
};

// Método para gerar token JWT
Usuario.prototype.gerarToken = function() {
    return jwt.sign(
        { 
            id: this.id,
            email: this.email,
            tipo: this.tipo
        },
        process.env.JWT_SECRET || 'sua_chave_jwt_super_secreta_aqui',
        { 
            expiresIn: '24h'
        }
    );
};

// Método para retornar objeto sem a senha
Usuario.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.senha;
    return values;
};

module.exports = Usuario;
