# AgendoAI Backend

Backend API para o sistema de agendamento AgendoAI, construído com Node.js, Express e MongoDB.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **Helmet** - Segurança
- **CORS** - Cross-Origin Resource Sharing

## 📁 Estrutura do Projeto

```
backend/
├── config/
│   └── database.js          # Configuração do MongoDB
├── controllers/
│   ├── authController.js    # Controlador de autenticação
│   ├── serviceController.js # Controlador de serviços
│   └── appointmentController.js # Controlador de agendamentos
├── middlewares/
│   ├── auth.js             # Middleware de autenticação
│   └── errorHandler.js     # Middleware de tratamento de erros
├── models/
│   ├── User.js             # Modelo de usuário
│   ├── Service.js          # Modelo de serviço
│   ├── Appointment.js      # Modelo de agendamento
│   ├── Category.js         # Modelo de categoria
│   ├── Niche.js           # Modelo de nicho
│   └── Availability.js     # Modelo de disponibilidade
├── routes/
│   ├── authRoutes.js       # Rotas de autenticação
│   ├── serviceRoutes.js    # Rotas de serviços
│   ├── appointmentRoutes.js # Rotas de agendamentos
│   ├── userRoutes.js       # Rotas de usuário
│   ├── categoryRoutes.js   # Rotas de categorias
│   └── providerRoutes.js   # Rotas de prestadores
├── .env.example            # Exemplo de variáveis de ambiente
├── package.json            # Dependências e scripts
└── server.js              # Arquivo principal do servidor
```

## ⚙️ Configuração

### 1. Instalação das Dependências

```bash
cd backend
npm install
```

### 2. Configuração do Ambiente

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/agendoai
# ou para MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/agendoai

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=seu-jwt-secret-super-seguro

# API Keys (opcional)
STRIPE_SECRET_KEY=sk_test_...
ANTHROPIC_API_KEY=sua-chave-anthropic
```

### 3. Configuração do MongoDB

#### Opção 1: MongoDB Local
```bash
# Instalar MongoDB Community Edition
# https://docs.mongodb.com/manual/installation/

# Iniciar o serviço MongoDB
sudo systemctl start mongod

# Verificar se está rodando
sudo systemctl status mongod
```

#### Opção 2: MongoDB Atlas (Recomendado)
1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie uma conta gratuita
3. Crie um novo cluster
4. Configure o acesso à rede (adicione seu IP)
5. Crie um usuário de banco de dados
6. Obtenha a string de conexão e configure no `.env`

## 🚀 Execução

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

O servidor será iniciado na porta configurada (padrão: 5000).

## 📚 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obter dados do usuário atual

### Serviços
- `GET /api/services` - Listar serviços
- `GET /api/services/:id` - Obter serviço específico
- `POST /api/services` - Criar serviço (apenas prestadores)
- `PUT /api/services/:id` - Atualizar serviço (apenas prestadores)
- `DELETE /api/services/:id` - Excluir serviço (apenas prestadores)

### Agendamentos
- `GET /api/appointments` - Listar agendamentos
- `GET /api/appointments/:id` - Obter agendamento específico
- `POST /api/appointments` - Criar agendamento
- `PUT /api/appointments/:id` - Atualizar agendamento
- `PUT /api/appointments/:id/cancel` - Cancelar agendamento

### Categorias
- `GET /api/categories` - Listar categorias
- `GET /api/categories/niches` - Listar nichos

### Prestadores
- `GET /api/providers` - Listar prestadores
- `GET /api/providers/:id` - Obter prestador específico

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header:

```
Authorization: Bearer seu-token-jwt
```

## 🛡️ Segurança

- Senhas são criptografadas com bcryptjs
- Rate limiting para prevenir ataques
- Helmet para headers de segurança
- CORS configurado adequadamente
- Validação de entrada com express-validator

## 🐛 Tratamento de Erros

A API retorna erros em formato JSON:

```json
{
  "success": false,
  "error": "Mensagem de erro"
}
```

## 📝 Logs

Os logs do servidor são exibidos no console durante o desenvolvimento.

## 🧪 Testes

Para executar testes (quando implementados):

```bash
npm test
```

## 🚀 Deploy

Para deploy em produção:

1. Configure as variáveis de ambiente
2. Use PM2 ou similar para gerenciar processos
3. Configure reverse proxy (Nginx)
4. Configure SSL/TLS

```bash
# Exemplo com PM2
npm install -g pm2
pm2 start server.js --name "agendoai-backend"
```

## 📖 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.