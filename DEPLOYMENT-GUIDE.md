# 🚀 Guia Completo de Deploy - AgendoAI

## ✅ Status da Migração

**Migração do Replit Agent para Replit Standard concluída com sucesso!**

### O que foi feito:
- ✅ Banco de dados PostgreSQL configurado e funcionando
- ✅ Schema do banco criado e sincronizado
- ✅ Sistema de autenticação corrigido (login/registro)
- ✅ API routes funcionando corretamente
- ✅ Frontend React conectado ao backend
- ✅ Estrutura para desenvolvimento local configurada

## 🌐 URLs de Acesso

**Replit (Produção):**
- Frontend: https://09fcacbb-53d8-49a5-a1db-39fe81ca69d1-00-2skv7yvvkc7iu.riker.replit.dev
- Backend API: https://09fcacbb-53d8-49a5-a1db-39fe81ca69d1-00-2skv7yvvkc7iu.riker.replit.dev/api

**Local (Desenvolvimento):**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔑 Credenciais de Teste

```
Email: admin@agendoai.com
Senha: Admin123
Tipo: Admin
```

## 💻 Setup Local no VS Code

### 1. Estrutura do Projeto
```
agendoai/
├── backend/           # API Express + TypeScript
├── frontend/          # React + Vite + TypeScript  
├── shared/           # Schemas compartilhados
├── .env.example      # Exemplo de variáveis globais
├── backend/.env.example
└── frontend/.env.example
```

### 2. Instalação Rápida
```bash
# 1. Clone o projeto
git clone <seu-repo-url>
cd agendoai

# 2. Instalar dependências
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 3. Configurar ambiente
cp .env.example .env
cp backend/.env.example backend/.env  
cp frontend/.env.example frontend/.env
```

### 3. Configuração do Banco
```bash
# Opção A: PostgreSQL Local
sudo apt install postgresql
sudo -u postgres createdb agendoai_local

# Opção B: Docker
docker run -d --name postgres \
  -e POSTGRES_DB=agendoai_local \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 postgres:14
```

### 4. Variáveis de Ambiente Mínimas

**backend/.env:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/agendoai_local
SESSION_SECRET=your-secret-key-here
NODE_ENV=development
PORT=5000
```

**frontend/.env:**
```env
VITE_API_URL=http://localhost:5000
VITE_NODE_ENV=development
```

### 5. Executar em Desenvolvimento

**Opção A - Separado (Recomendado):**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

**Opção B - Automatizado:**
```bash
# Instalar concurrently globalmente
npm install -g concurrently

# Executar ambos
npm run dev
```

## 🔧 Comandos Úteis

```bash
# Migrações do banco
cd backend && npm run db:push

# Build para produção
npm run build

# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 🛠️ Funcionalidades Implementadas

### Backend (Express + TypeScript)
- ✅ Sistema de autenticação completo
- ✅ Rotas de API organizadas
- ✅ Integração com PostgreSQL
- ✅ Middleware de segurança
- ✅ Sistema de sessões
- ✅ Validação de dados com Zod

### Frontend (React + Vite)
- ✅ Interface responsiva
- ✅ Autenticação de usuários
- ✅ Componentes reutilizáveis
- ✅ Roteamento configurado
- ✅ Estado global gerenciado

### Integrações Opcionais
- 🔲 Stripe (pagamentos) - configurar STRIPE_SECRET_KEY
- 🔲 SendGrid (emails) - configurar SENDGRID_API_KEY  
- 🔲 Anthropic/Claude (IA) - configurar ANTHROPIC_API_KEY
- 🔲 Push Notifications - configurar VAPID keys
- 🔲 WhatsApp - configurar WhatsApp API

## 🚀 Deploy em Produção

### Replit (Atual)
- ✅ Já está rodando e funcional
- ✅ Banco PostgreSQL Neon configurado
- ✅ Variáveis de ambiente definidas

### Outras Plataformas
- **Vercel:** Ideal para frontend + API routes
- **Railway:** Excelente para full-stack
- **Heroku:** Clássico para Node.js
- **DigitalOcean:** App Platform

## 📊 Próximos Passos

1. **Configurar integrações opcionais** (Stripe, emails, etc.)
2. **Implementar funcionalidades de negócio:**
   - Sistema de agendamento
   - Gestão de prestadores
   - Pagamentos
   - Notificações
3. **Otimizações:**
   - Cache Redis
   - CDN para assets
   - Monitoramento
4. **Testes:**
   - Testes unitários
   - Testes de integração
   - E2E testing

## 🆘 Solução de Problemas

### Erro de Conexão com Banco
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão
psql -h localhost -U usuario -d agendoai_local
```

### Porta em Uso
```bash
# Verificar processo
lsof -i :5000
kill -9 <PID>
```

### Problemas de Dependências
```bash
# Limpar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

**Migração concluída com sucesso! 🎉**

O sistema está funcionando tanto no Replit quanto configurado para desenvolvimento local no VS Code.