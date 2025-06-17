
# 🔌 Conexões do Sistema com o Banco de Dados

## Arquivos Principais de Conexão

### 1. **server/db.ts** - Arquivo Principal de Conexão
```typescript
// Configuração principal do banco usando Drizzle ORM e Neon Database
- Pool de conexões com PostgreSQL
- Configuração de WebSockets para Neon
- Estratégia de reconexão automática
- Export do cliente Drizzle ORM
```
**Localização:** `server/db.ts`
**Função:** Estabelece e gerencia a conexão principal com o banco

### 2. **shared/schema.ts** - Schema do Banco de Dados
```typescript
// Definição de todas as tabelas usando Drizzle ORM
- 30+ tabelas definidas
- Relacionamentos entre tabelas
- Tipos TypeScript gerados automaticamente
- Schemas de validação com Zod
```
**Localização:** `shared/schema.ts`
**Função:** Define a estrutura completa do banco e tipos

### 3. **drizzle.config.ts** - Configuração do Drizzle
```typescript
// Configuração para migrações e geração de tipos
- Configuração do dialeto PostgreSQL
- Caminho para migrations
- Credenciais do banco
```
**Localização:** `drizzle.config.ts`
**Função:** Configura o Drizzle ORM e migrações

### 4. **server/storage.ts** - Camada de Acesso a Dados
```typescript
// Funções de acesso ao banco de dados
- CRUD operations para todas as entidades
- Queries complexas otimizadas
- Cache de consultas frequentes
```
**Localização:** `server/storage.ts`
**Função:** Camada de abstração para operações no banco

## Arquivos de Configuração

### 5. **.env.local.example** - Variáveis de Ambiente
```bash
# Configuração de conexão local
LOCAL_DATABASE_URL=file:./local.db
# ou
LOCAL_DATABASE_URL=postgresql://username:password@localhost:5432/agendoai_local
```
**Localização:** `.env.local.example`
**Função:** Template para configuração do banco

### 6. **server/local-config.ts** - Configuração Local
```typescript
// Configurações específicas para desenvolvimento local
- Validação de variáveis de ambiente
- Configurações padrão para desenvolvimento
```
**Localização:** `server/local-config.ts`
**Função:** Configurações de desenvolvimento local

## Arquivos de Serviços que Usam o Banco

### 7. **server/services/** - Serviços de Negócio
- `backup-service.ts` - Backup do banco
- `provider-service-manager.ts` - Gestão de serviços
- `marketplace-payment-service.ts` - Pagamentos

### 8. **server/routes/** - Rotas da API
- Mais de 20 arquivos de rotas
- Cada rota utiliza a conexão do banco
- Operações CRUD via Drizzle ORM

## Como a Conexão Funciona

### Fluxo de Conexão:
1. **Inicialização:** `server/index.ts` importa `server/db.ts`
2. **Pool de Conexões:** Neon Pool gerencia conexões WebSocket
3. **ORM:** Drizzle ORM mapeia queries para TypeScript
4. **Schema:** `shared/schema.ts` define estrutura e validações
5. **Storage:** `server/storage.ts` abstrai operações complexas
6. **Routes:** Arquivos em `server/routes/` executam operações

### Tecnologias Utilizadas:
- **Banco:** PostgreSQL (Neon Database)
- **ORM:** Drizzle ORM
- **Conexão:** WebSocket via @neondatabase/serverless
- **Pool:** Gerenciamento automático de conexões
- **Validação:** Zod para schemas TypeScript

### Variáveis de Ambiente Necessárias:
```bash
DATABASE_URL=postgresql://...  # Produção (Neon)
LOCAL_DATABASE_URL=...         # Desenvolvimento local
SESSION_SECRET=...             # Autenticação
```

## Arquivos de Backup e Manutenção

### 9. **server/services/backup-service.ts**
- Geração de backups SQL
- Restore de dados
- Exportação completa do banco

### 10. **scripts/generate-backup.js**
- Script automatizado de backup
- Geração de arquivos .sql

## Monitoramento e Logs

### Logs de Conexão:
- Pool de conexões registra erros
- Reconexão automática em caso de falha
- Métricas de performance em `server/db.ts`

### Health Check:
- Verificação de conexão ativa
- Timeout configurável
- Retry automático com backoff

## Resumo dos Arquivos Críticos:

| Arquivo | Função | Criticidade |
|---------|---------|-------------|
| `server/db.ts` | Conexão principal | 🔴 Crítico |
| `shared/schema.ts` | Estrutura do banco | 🔴 Crítico |
| `drizzle.config.ts` | Config ORM | 🟡 Importante |
| `server/storage.ts` | Camada de dados | 🟡 Importante |
| `.env` | Credenciais | 🔴 Crítico |

## Comandos Úteis:

```bash
# Gerar backup completo
node scripts/generate-backup.js

# Aplicar migrações
npx drizzle-kit push

# Visualizar banco
npx drizzle-kit studio
```
