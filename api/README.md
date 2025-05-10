# Mentei API

API backend para o aplicativo Mentei, uma plataforma para compartilhar mentiras criativas.

## Requisitos

- Node.js (v16+)
- PostgreSQL (v12+)

## Configuração

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto com as configurações:

```
# Configurações do servidor
PORT=3001

# Configurações do banco de dados PostgreSQL
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mentei_db

# Configurações JWT
JWT_SECRET=sua_chave_secreta_para_jwt
JWT_EXPIRES_IN=7d
```

4. Configure o banco de dados PostgreSQL:

```bash
# Criar o banco de dados
createdb mentei_db

# Executar script de configuração
npm run setup-db
```

## Executando a aplicação

### Modo de desenvolvimento

```bash
npm run dev
```

### Modo de produção

```bash
npm start
```

## Estrutura da API

A API segue uma arquitetura MVC (Model-View-Controller) simplificada:

- `src/controllers/`: Controladores que processam requisições
- `src/routes/`: Definição de rotas
- `src/middleware/`: Middleware de autenticação e outros
- `src/db/`: Configuração e scripts do banco de dados
- `src/config.js`: Configurações da aplicação
- `src/index.js`: Ponto de entrada da aplicação

## Endpoints

A API possui os seguintes endpoints principais:

### Usuários

- `POST /api/users/register`: Registra um novo usuário
- `POST /api/users/login`: Autentica um usuário
- `GET /api/users/:id`: Obtém usuário por ID
- `GET /api/users/username/:username`: Obtém usuário por nome de usuário
- `PUT /api/users/:id`: Atualiza informações do usuário
- `GET /api/users/:id/pro-status`: Verifica status PRO do usuário
- `POST /api/users/:id/upgrade-pro`: Atualiza usuário para status PRO

### Posts

- `GET /api/posts`: Obtém todos os posts
- `GET /api/posts/:id`: Obtém post por ID
- `GET /api/posts/user/:userId`: Obtém posts de um usuário
- `GET /api/posts/tag/:tagName`: Obtém posts por tag
- `POST /api/posts`: Cria um novo post
- `PUT /api/posts/:id`: Atualiza um post
- `DELETE /api/posts/:id`: Exclui um post
- `POST /api/posts/:id/reactions`: Adiciona uma reação a um post
- `POST /api/posts/:id/judgements`: Adiciona um julgamento a um post

### Storyments

- `GET /api/storyments/active`: Obtém storyments ativos
- `GET /api/storyments/:id`: Obtém storyment por ID
- `GET /api/storyments/user/:userId`: Obtém storyments de um usuário
- `POST /api/storyments`: Cria um novo storyment
- `DELETE /api/storyments/:id`: Exclui um storyment
- `POST /api/storyments/:id/view`: Marca um storyment como visualizado
- `GET /api/storyments/:id/viewed/:userId`: Verifica se um usuário visualizou um storyment

### Gerador de Mentiras (Recurso PRO)

- `POST /api/generator/lie`: Gera uma mentira criativa (exclusivo para usuários PRO)

## Licença

MIT 