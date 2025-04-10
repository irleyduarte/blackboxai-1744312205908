# Configuração do Ambiente de Desenvolvimento para Virtual Mall Rio (VMR)

## Pré-requisitos
- **Node.js**: Versão 14 ou superior.
- **npm**: Gerenciador de pacotes do Node.js.
- **MongoDB**: Banco de dados NoSQL.
- **PostgreSQL**: Banco de dados relacional.
- **Python**: Versão 3.6 ou superior.
- **Docker**: Para containerização de aplicações.

## Passos para Configuração

### 1. Instalação do Node.js e npm
- Baixe e instale o Node.js a partir do [site oficial](https://nodejs.org/).
- Verifique a instalação:
  ```bash
  node -v
  npm -v
  ```

### 2. Instalação do MongoDB
- Siga as instruções de instalação do MongoDB no [site oficial](https://www.mongodb.com/try/download/community).
- Inicie o serviço do MongoDB:
  ```bash
  mongod
  ```

### 3. Instalação do PostgreSQL
- Baixe e instale o PostgreSQL a partir do [site oficial](https://www.postgresql.org/download/).
- Crie um banco de dados para o projeto.

### 4. Instalação do Python
- Baixe e instale o Python a partir do [site oficial](https://www.python.org/downloads/).
- Verifique a instalação:
  ```bash
  python --version
  ```

### 5. Instalação do Docker
- Siga as instruções de instalação do Docker no [site oficial](https://docs.docker.com/get-docker/).

### 6. Clonando o Repositório do Projeto
- Clone o repositório do projeto:
  ```bash
  git clone <URL_DO_REPOSITORIO>
  cd <NOME_DO_REPOSITORIO>
  ```

### 7. Instalando Dependências
- Navegue até a pasta do frontend e instale as dependências:
  ```bash
  cd frontend
  npm install
  ```

- Navegue até a pasta do backend e instale as dependências:
  ```bash
  cd backend
  npm install
  ```

### 8. Executando o Projeto
- Inicie o servidor do backend:
  ```bash
  cd backend
  node server.js
  ```

- Inicie o servidor do frontend:
  ```bash
  cd frontend
  npm start
  ```

## Próximos Passos
1. Verificar se todos os serviços estão funcionando corretamente.
2. Iniciar o desenvolvimento das funcionalidades conforme o cronograma.
