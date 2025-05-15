# Mentei - Plataforma de Mentiras Criativas

Uma plataforma social para compartilhar e interagir com mentiras criativas, histórias temporárias (storyments), e participar de batalhas de mentiras.

## Estrutura do Projeto

O projeto consiste em duas partes principais:

* **Frontend** - Localizado em `/mentei`, construído com React e TypeScript
* **Backend** - Localizado em `/api`, construído com Node.js, Express e PostgreSQL

## Requisitos

* Node.js (v16+)
* PostgreSQL (v12+)

## Configuração e Execução

### Configuração do Banco de Dados

Antes de iniciar o projeto, você precisa configurar o banco de dados PostgreSQL:

1. Certifique-se de que o PostgreSQL está instalado e em execução
2. Crie um banco de dados chamado `mentei_db`
3. Ajuste as configurações de conexão em `/api/.env`
4. Execute a configuração do banco de dados:

```
npm run setup:db
```

### Instalação de Dependências

Para instalar todas as dependências do projeto (frontend e backend):

```
npm run install:all
```

### Iniciar a Aplicação

Para iniciar tanto o backend quanto o frontend simultaneamente:

```
npm start
```

Isso iniciará:
* Backend: http://localhost:3001
* Frontend: http://localhost:3000

## Funcionalidades Principais

* **Autenticação de usuários**: Registro e login
* **Posts**: Criação, reações, julgamentos e compartilhamento
* **Storyments**: Histórias temporárias que expiram após 24 horas
* **Perfil de usuário**: Conquistas, estatísticas e mentiras favoritas
* **Plano PRO**: Assinatura com recursos especiais, incluindo gerador automático de mentiras
* **Batalhas**: Competições entre usuários para a melhor mentira 