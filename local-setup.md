
# Configuração para Desenvolvimento Local

Este guia explica como configurar o projeto AgendoAI em sua máquina local para desenvolvimento.

## Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- PostgreSQL (opcional) ou SQLite será usado automaticamente

## Configuração Inicial

### 1. Clone e Instale Dependências

```bash
# Clone o repositório (se ainda não tiver)
git clone <url-do-repositorio>
cd agendoai

# Instalar dependências
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.local.example .env.local

# Editar arquivo com suas configurações
nano .env.local  # ou seu editor preferido
```

### 3. Configurar Banco de Dados

#### Opção A: SQLite (Recomendado para desenvolvimento)
```bash
# O SQLite será criado automaticamente
# Apenas certifique-se que a variável esteja configurada:
LOCAL_DATABASE_URL=file:./local.db
```

#### Opção B: PostgreSQL Local
```bash
# Instalar PostgreSQL em sua máquina
# Ubuntu/Debian:
sudo apt install postgresql postgresql-contrib

# macOS:
brew install postgresql

# Criar banco de dados
createdb agendoai_local

# Configurar variável de ambiente
LOCAL_DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/agendoai_local
```

### 4. Executar Migrações

```bash
# Aplicar migrações do banco
npm run db:push
```

## Scripts de Desenvolvimento

### Servidor Backend Local
```bash
# Executar servidor backend em modo local
node server/local-server.ts

# Ou com tsx para auto-reload
npx tsx watch server/local-server.ts
```

### Frontend (Vite Dev Server)
```bash
# Em outro terminal, executar frontend
npm run dev
```

### Ambos Simultaneamente
```bash
# Usar concurrently para executar ambos
npm install -g concurrently
concurrently "npx tsx watch server/local-server.ts" "npm run dev"
```

## Estrutura de Desenvolvimento Local

```
Projeto/
├── .env.local              # Suas variáveis de ambiente locais
├── local.db               # Banco SQLite (se usado)
├── uploads-local/         # Pasta de uploads locais
├── server/
│   ├── local-config.ts    # Configurações específicas para local
│   └── local-server.ts    # Servidor configurado para local
└── client/
    └── dist/              # Build do frontend (npm run build)
```

## URLs de Desenvolvimento

- **Frontend (Vite):** http://localhost:5173
- **Backend (API):** http://localhost:3000
- **Uploads:** http://localhost:3000/uploads

## Comandos Úteis

```bash
# Build do frontend para produção local
npm run build

# Verificar tipos TypeScript
npm run check

# Executar migrações
npm run db:push

# Gerar schemas do banco
npm run generate
```

## Diferenças do Ambiente Replit

| Aspecto | Replit | Local |
|---------|--------|-------|
| Porta | 5000 | 3000 |
| Host | 0.0.0.0 | localhost |
| Banco | PostgreSQL | SQLite ou PostgreSQL local |
| Uploads | /uploads | /uploads-local |
| CORS | Mais permissivo | Restrito ao localhost |
| HTTPS | Automático | HTTP apenas |

## Resolução de Problemas

### Erro de Porta em Uso
```bash
# Verificar qual processo está usando a porta
lsof -i :3000

# Matar processo se necessário
kill -9 <PID>
```

### Problemas com Banco de Dados
```bash
# Resetar banco SQLite
rm local.db
npm run db:push

# Para PostgreSQL, recrear banco
dropdb agendoai_local
createdb agendoai_local
npm run db:push
```

### Problemas com Uploads
```bash
# Criar pasta de uploads se não existir
mkdir uploads-local
chmod 755 uploads-local
```

## Produção Local (Simulação)

Para testar como ficaria em produção:

```bash
# Build completo
npm run build

# Executar servidor de produção localmente
NODE_ENV=production npm start
```

## Integração com IDEs

### VS Code
Recomendado instalar extensões:
- TypeScript Importer
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- SQLite Viewer (se usar SQLite)

### Configuração de Debug
Arquivo `.vscode/launch.json` já incluído para debug do servidor.
