# Mentei - Plataforma de Mentiras Criativas

Uma plataforma social para compartilhar e interagir com mentiras criativas, histórias temporárias (storyments), e participar de batalhas de mentiras.

## Estrutura do Projeto

O projeto consiste em duas partes principais:

- **Frontend** - Localizado em `/mentei`, construído com React e TypeScript
- **Backend** - Localizado em `/api`, construído com Node.js, Express e PostgreSQL

## Requisitos

- Node.js (v16+)
- PostgreSQL (v12+)

## Configuração e Execução

### Configuração do Banco de Dados

Antes de iniciar o projeto, você precisa configurar o banco de dados PostgreSQL:

1. Certifique-se de que o PostgreSQL está instalado e em execução
2. Crie um banco de dados chamado `mentei_db`
3. Ajuste as configurações de conexão em `/api/.env`
4. Execute a configuração do banco de dados:

```bash
npm run setup:db
```

### Instalação de Dependências

Para instalar todas as dependências do projeto (frontend e backend):

```bash
npm run install:all
```

### Iniciar a Aplicação

Para iniciar tanto o backend quanto o frontend simultaneamente:

```bash
npm start
```

Isso iniciará:
- Backend: http://localhost:3001
- Frontend: http://localhost:3000

## Funcionalidades Principais

- **Autenticação de usuários**: Registro e login
- **Posts**: Criação, reações, julgamentos e compartilhamento
- **Storyments**: Histórias temporárias que expiram após 24 horas
- **Perfil de usuário**: Conquistas, estatísticas e mentiras favoritas
- **Plano PRO**: Assinatura com recursos especiais, incluindo gerador automático de mentiras
- **Batalhas**: Competições entre usuários para a melhor mentira

## Tecnologias Utilizadas

### Frontend
- React
- TypeScript
- Tailwind CSS
- React Router

### Backend
- Node.js
- Express
- PostgreSQL
- JSON Web Tokens (JWT)
- Bcrypt

## Implementação

- Arquitetura cliente-servidor
- Banco de dados PostgreSQL com tabelas relacionais
- Autenticação via JWT
- Estilização com Tailwind CSS
- Gerenciamento de estado local com hooks do React

## Documentação

- [Documentação da API](api/README.md)
- [Documentação do Frontend](mentei/README.md)

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

# Servidor de Chat para Mentei

Este é um servidor simples de chat em tempo real para a aplicação Mentei.

## Requisitos

- Node.js (v14+)
- npm 

## Instalação

```bash
# Instalar dependências
npm install
```

## Configuração

O servidor usa as seguintes variáveis de ambiente:

- `PORT`: Porta onde o servidor irá rodar (padrão: 3001)
- `JWT_SECRET`: Chave secreta para autenticação JWT (opcional para desenvolvimento)

## Iniciar o servidor

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Iniciar servidor de produção
npm start
```

## Funcionalidades

- Socket.IO para comunicação em tempo real
- Salas de chat públicas e privadas
- Status de usuário online/offline
- Notificações de digitação
- Confirmação de leitura de mensagens

## Rotas da API

- `GET /`: Verifica se o servidor está funcionando
- `GET /status`: Retorna o status atual do servidor com número de conexões

## Conexão com o cliente

Os clientes podem se conectar ao servidor via Socket.IO usando:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: 'seu-token-jwt'
  }
});
```

## Eventos do Socket.IO

### Eventos do servidor para o cliente

- `connect:success`: Confirmação de conexão
- `message:receive`: Recebimento de nova mensagem
- `user:status`: Atualização de status de usuário
- `user:typing`: Notificação de usuário digitando
- `message:read`: Confirmação de leitura de mensagens

### Eventos do cliente para o servidor

- `user:online`: Atualização de status online
- `message:send`: Envio de mensagem
- `user:typing`: Notificação de digitação
- `message:read`: Marcar mensagens como lidas

## Solução de Problemas

Se você estiver tendo problemas para conectar ao servidor:

1. Verifique se o servidor está rodando na porta 3001
2. Certifique-se de que os tokens JWT estão configurados corretamente
3. Verifique as configurações de CORS se estiver acessando de um domínio diferente
4. Verifique os logs do servidor para erros específicos 