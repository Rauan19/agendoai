# 🔧 Guia de Configuração Local - AgendoAI

Este guia te ajudará a configurar o AgendoAI para rodar localmente em seu computador.

## 📋 Pré-requisitos

### 1. Instalar Node.js
- Baixe e instale Node.js 18+ de: https://nodejs.org/
- Verifique a instalação: `node --version` e `npm --version`

### 2. Instalar PostgreSQL
Escolha uma das opções:

#### Opção A: PostgreSQL Local
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (com Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# Baixe de: https://www.postgresql.org/download/windows/
```

#### Opção B: NeonDB (Recomendado)
1. Acesse: https://neon.tech/
2. Crie conta gratuita
3. Crie novo projeto
4. Copie a string de conexão

## 🚀 Configuração Passo a Passo

### 1. Baixar o Projeto
```bash
# Clone ou baixe o projeto
git clone seu-repositorio-agendoai
cd agendoai
```

### 2. Configurar Variáveis de Ambiente
```bash
# Copie o arquivo de exemplo
cp .env.local .env

# Edite o arquivo .env com suas configurações
# Use qualquer editor de texto (nano, vim, VSCode, etc.)
nano .env
```

### 3. Configurar o Banco de Dados no .env
```env
# Opção A: PostgreSQL Local
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/agendoai

# Opção B: NeonDB (Cole sua string de conexão)
DATABASE_URL=postgresql://user:password@ep-example.us-east-2.aws.neon.tech/dbname?sslmode=require

# Gerar JWT Secret
JWT_SECRET=sua-chave-jwt-super-segura-aqui
```

### 4. Instalar Dependências
```bash
# Instalar dependências do projeto
npm install
```

### 5. Configurar o Banco de Dados
```bash
# Criar tabelas no banco de dados
npm run db:push
```

### 6. Iniciar o Servidor
```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm start
```

## 🔑 Gerando Chaves de Segurança

### JWT Secret
```bash
# Gerar JWT Secret seguro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### VAPID Keys (Notificações Push - Opcional)
```bash
# Gerar chaves VAPID
npx web-push generate-vapid-keys
```

## 🗄️ Configuração do PostgreSQL Local

### 1. Criar Usuário e Banco
```sql
-- Conectar ao PostgreSQL
sudo -u postgres psql

-- Criar usuário
CREATE USER agendoai_user WITH PASSWORD 'sua_senha_segura';

-- Criar banco de dados
CREATE DATABASE agendoai OWNER agendoai_user;

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE agendoai TO agendoai_user;

-- Sair
\q
```

### 2. Configurar .env para PostgreSQL Local
```env
DATABASE_URL=postgresql://agendoai_user:sua_senha_segura@localhost:5432/agendoai
PGHOST=localhost
PGPORT=5432
PGUSER=agendoai_user
PGPASSWORD=sua_senha_segura
PGDATABASE=agendoai
```

## 🔧 Configurações Opcionais

### APIs Externas (Opcional)
```env
# Stripe (para pagamentos)
STRIPE_SECRET_KEY=sk_test_sua_chave_stripe
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_stripe

# Anthropic (para IA)
ANTHROPIC_API_KEY=sk-ant-sua-chave-anthropic

# SendGrid (para emails)
SENDGRID_API_KEY=SG.sua-chave-sendgrid
```

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor com auto-reload

# Produção
npm start           # Inicia servidor de produção

# Banco de Dados
npm run db:push     # Aplica mudanças no schema
npm run db:studio   # Abre interface visual do banco

# Utilitários
npm run build       # Build para produção
npm test           # Executa testes (quando disponível)
```

## 🔍 Verificação da Instalação

### 1. Testar Conexão com Banco
```bash
# Verificar se o banco está acessível
npm run db:push
```

### 2. Testar Servidor
```bash
# Iniciar servidor
npm run dev

# Em outro terminal, testar API
curl http://localhost:5000/api/health
```

### 3. Acessar Aplicação
- Backend: http://localhost:5000
- Frontend: http://localhost:5000 (servido pelo mesmo servidor)

## 🐛 Soluções para Problemas Comuns

### Erro: "relation users does not exist"
```bash
# Executar migração do banco
npm run db:push
```

### Erro: "ECONNREFUSED" (Banco não conecta)
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Ou para macOS
brew services list | grep postgresql
```

### Erro: "JWT Secret not defined"
```bash
# Gerar e adicionar JWT Secret no .env
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

### Erro: "Port 5000 already in use"
```bash
# Encontrar processo usando a porta
lsof -i :5000

# Ou mudar porta no .env
PORT=3001
```

## 📁 Estrutura de Arquivos Locais

```
agendoai/
├── .env                 # Suas configurações (NÃO commitar)
├── .env.local          # Exemplo de configurações
├── package.json        # Dependências
├── server/             # Código do servidor
├── client/             # Código do frontend
├── shared/             # Esquemas compartilhados
└── uploads/            # Arquivos enviados
```

## 🔒 Segurança Local

### Arquivo .env
- NUNCA commitar o arquivo `.env` no Git
- Manter backup seguro das configurações
- Usar senhas fortes para banco de dados

### Firewall
```bash
# Ubuntu: permitir apenas localhost
sudo ufw allow from 127.0.0.1 to any port 5000
```

## 📊 Monitoramento Local

### Logs
```bash
# Ver logs do servidor
npm run dev

# Logs específicos
tail -f logs/app.log
```

### Banco de Dados
```bash
# Interface visual do banco
npm run db:studio
```

## 🎯 Próximos Passos

1. ✅ Configurar variáveis de ambiente
2. ✅ Testar conexão com banco
3. ✅ Iniciar servidor
4. ✅ Criar primeiro usuário
5. ✅ Testar funcionalidades básicas

## 💡 Dicas de Desenvolvimento

- Use `npm run dev` para desenvolvimento (auto-reload)
- Mantenha o arquivo `.env` seguro e privado
- Faça backup regular do banco de dados
- Use NeonDB para facilitar desenvolvimento
- Configure VSCode com extensões TypeScript e PostgreSQL

## 📞 Suporte

Se encontrar problemas:
1. Verifique logs do servidor
2. Confirme configurações do `.env`
3. Teste conexão com banco separadamente
4. Consulte documentação do PostgreSQL/NeonDB