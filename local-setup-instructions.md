# 🚀 Guia de Instalação Local - AgendoAI

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 18+** (recomendado: versão 20)
- **PostgreSQL 14+** 
- **Git**
- **VS Code** (recomendado)

## 🏗️ Configuração do Projeto

### 1. Clone e Setup Inicial

```bash
# Clone o repositório
git clone <seu-repositorio-url>
cd agendoai

# Instale as dependências do projeto principal
npm install

# Instale as dependências do backend
cd backend
npm install

# Instale as dependências do frontend  
cd ../frontend
npm install
cd ..
```

### 2. Configuração do Banco de Dados

#### Opção A: PostgreSQL Local
```bash
# Instale PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Ou no macOS com Homebrew
brew install postgresql
brew services start postgresql

# Criar banco de dados
sudo -u postgres createdb agendoai_db
sudo -u postgres createuser --interactive
```

#### Opção B: PostgreSQL com Docker
```bash
# Execute PostgreSQL em container
docker run --name agendoai-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=agendoai_db \
  -p 5432:5432 \
  -d postgres:14
```

### 3. Configuração das Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
nano .env
```

**Configuração mínima necessária:**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/agendoai_db
SESSION_SECRET=sua-chave-secreta-super-segura-aqui
NODE_ENV=development
PORT=5000
```

### 4. Configuração do Banco de Dados

```bash
# Entre na pasta backend
cd backend

# Execute as migrações do banco
npm run db:push

# Volte para a pasta raiz
cd ..
```

## 🔧 Executando o Projeto Localmente

### Opção 1: Executar Tudo Junto (Recomendado para desenvolvimento)
```bash
# Na pasta raiz do projeto
npm run dev
```

### Opção 2: Executar Backend e Frontend Separadamente

#### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```
*O backend estará rodando em: http://localhost:5000*

#### Terminal 2 - Frontend:
```bash
cd frontend  
npm run dev
```
*O frontend estará rodando em: http://localhost:3000*

## 🗂️ Estrutura do Projeto

```
agendoai/
├── backend/                 # API do servidor
│   ├── routes/             # Rotas da API
│   ├── middleware/         # Middlewares
│   ├── services/           # Serviços de negócio
│   ├── db.ts              # Configuração do banco
│   ├── storage.ts         # Camada de dados
│   └── index.ts           # Entrada do servidor
├── frontend/               # Interface do usuário
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # React Hooks customizados
│   │   └── lib/           # Utilitários
│   └── index.html
├── shared/                 # Código compartilhado
│   └── schema.ts          # Schema do banco de dados
└── .env                   # Variáveis de ambiente
```

## 🔧 Scripts Úteis

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Executar apenas o backend
cd backend && npm run dev

# Executar apenas o frontend  
cd frontend && npm run dev

# Build para produção
npm run build

# Executar migrações do banco
cd backend && npm run db:push

# Verificar tipos TypeScript
npm run check
```

## 🐛 Solução de Problemas Comuns

### Erro de Conexão com Banco
- Verifique se o PostgreSQL está rodando
- Confirme a URL de conexão no `.env`
- Teste a conexão: `psql -h localhost -U seu_usuario -d agendoai_db`

### Porta já em uso
```bash
# Verificar processo usando a porta
lsof -i :5000
# ou
netstat -tulpn | grep 5000

# Matar processo se necessário
kill -9 <PID>
```

### Erro de dependências
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install

# Fazer o mesmo para backend e frontend
```

## 🌐 URLs de Desenvolvimento

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Documentação da API:** http://localhost:5000/api-docs (se configurado)

## 📝 Próximos Passos

1. Configure as variáveis de ambiente opcionais (Stripe, SendGrid, etc.)
2. Teste o login com: `admin@agendoai.com` / `Admin123`
3. Explore a documentação da API
4. Comece a desenvolver suas funcionalidades!

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs do terminal
2. Confirme se todas as dependências estão instaladas
3. Valide a configuração do banco de dados
4. Consulte a documentação do projeto