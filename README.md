# 🚀 AgendoAI - Sistema de Agendamento Inteligente

Sistema completo de agendamento com IA, separado em backend Node.js/Express com MongoDB e frontend React.

## 📋 Visão Geral

O AgendoAI é uma plataforma moderna de agendamento que conecta clientes e prestadores de serviços, utilizando inteligência artificial para otimizar horários e maximizar produtividade.

### ✨ Funcionalidades Principais

- **Sistema de Autenticação JWT** - Login seguro para clientes e prestadores
- **Gestão de Serviços** - Cadastro e gerenciamento de serviços pelos prestadores
- **Agendamento Inteligente** - Sistema de reservas com validação de conflitos
- **Dashboard Personalizado** - Interface específica para cada tipo de usuário
- **API REST Completa** - Backend robusto com validações e middleware de segurança
- **Interface Responsiva** - Frontend moderno e mobile-first

## 🏗️ Arquitetura

```
AgendoAI/
├── backend/          # API Node.js + Express + MongoDB
│   ├── models/       # Modelos Mongoose
│   ├── controllers/  # Controladores MVC
│   ├── routes/       # Rotas da API
│   ├── middlewares/  # Middlewares (auth, errors)
│   └── config/       # Configurações do banco
├── frontend/         # App React + TypeScript
│   ├── src/
│   │   ├── pages/    # Páginas da aplicação
│   │   ├── components/ # Componentes reutilizáveis
│   │   ├── services/ # Integração com API
│   │   └── hooks/    # Custom hooks
└── README.md         # Este arquivo
```

## 🚀 Início Rápido

### Pré-requisitos

- **Node.js** 18+ 
- **MongoDB** (local ou Atlas)
- **npm** ou **yarn**

### 1. Backend Setup

```bash
# Navegar para o backend
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Iniciar servidor de desenvolvimento
npm run dev
```

O backend estará rodando em `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navegar para o frontend
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com a URL do backend

# Iniciar aplicação
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

## ⚙️ Configuração Detalhada

### Backend (.env)

```env
# Database
MONGO_URI=mongodb://localhost:27017/agendoai

# Server
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=seu-jwt-secret-super-seguro

# Optional APIs
STRIPE_SECRET_KEY=sk_test_...
ANTHROPIC_API_KEY=sua-chave-anthropic
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=AgendoAI
```

## 🗄️ Banco de Dados

### MongoDB Local

```bash
# Instalar MongoDB Community Edition
# Iniciar serviço
sudo systemctl start mongod
```

### MongoDB Atlas (Recomendado)

1. Crie conta em [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie um cluster gratuito
3. Configure acesso à rede
4. Obtenha string de conexão
5. Configure no `.env` do backend

## 📚 Documentação da API

### Endpoints Principais

**Autenticação**
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário atual

**Serviços**
- `GET /api/services` - Listar serviços
- `POST /api/services` - Criar serviço (prestadores)
- `PUT /api/services/:id` - Atualizar serviço
- `DELETE /api/services/:id` - Excluir serviço

**Agendamentos**
- `GET /api/appointments` - Listar agendamentos
- `POST /api/appointments` - Criar agendamento
- `PUT /api/appointments/:id/cancel` - Cancelar agendamento

## 🔐 Segurança

- **JWT Authentication** - Tokens seguros para autenticação
- **Password Hashing** - bcryptjs para hash de senhas
- **Rate Limiting** - Proteção contra ataques de força bruta
- **CORS Configuration** - Configuração adequada para produção
- **Input Validation** - Validação rigorosa com express-validator
- **Error Handling** - Middleware personalizado para tratamento de erros

## 🎨 Frontend

### Tecnologias

- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **React Router** para navegação
- **TanStack Query** para gerenciamento de estado
- **Axios** para requisições HTTP

### Páginas

- **/** - Landing page
- **/login** - Autenticação
- **/register** - Cadastro
- **/dashboard** - Dashboard personalizado
- **/services** - Gestão de serviços
- **/appointments** - Gestão de agendamentos

## 🚀 Deploy

### Backend

```bash
# Build para produção
npm start

# Com PM2
npm install -g pm2
pm2 start server.js --name "agendoai-backend"
```

### Frontend

```bash
# Build para produção
npm run build

# Servir arquivos estáticos
npm run preview
```

## 🧪 Desenvolvimento

### Comandos Úteis

**Backend:**
```bash
npm run dev      # Desenvolvimento com nodemon
npm start        # Produção
```

**Frontend:**
```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview da build
```

## 📁 Estrutura de Pastas

### Backend (MVC)
```
backend/
├── config/       # Configurações do banco
├── controllers/  # Lógica de negócio
├── middlewares/  # Middlewares customizados
├── models/       # Modelos Mongoose
├── routes/       # Definição de rotas
└── server.js     # Ponto de entrada
```

### Frontend (React)
```
frontend/
├── public/       # Arquivos estáticos
├── src/
│   ├── components/ # Componentes UI
│   ├── hooks/    # Custom hooks
│   ├── pages/    # Páginas/rotas
│   ├── services/ # API integration
│   └── utils/    # Utilitários
└── index.html    # Template principal
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Scripts de Desenvolvimento

**Iniciar projeto completo:**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

## 🐛 Troubleshooting

### Problemas Comuns

**Erro de conexão MongoDB:**
- Verifique se o MongoDB está rodando
- Confirme a string de conexão no `.env`
- Para Atlas, verifique acesso à rede

**Erro CORS:**
- Verifique configuração CORS no backend
- Confirme URLs no frontend `.env`

**Dependências:**
```bash
# Limpar cache npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

## 📄 Licença

Este projeto está sob a licença ISC.

---

**Desenvolvido com ❤️ para otimizar agendamentos com Inteligência Artificial**