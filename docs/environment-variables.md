
# Variáveis de Ambiente (Secrets) - Documentação Completa

## Visão Geral

Este documento lista todas as variáveis de ambiente utilizadas no projeto AgendoAI. As variáveis são organizadas por categoria e incluem descrições, valores padrão e exemplos.

## Como Configurar

### No Replit
1. Acesse a aba **Secrets** no painel de ferramentas
2. Clique em **+ New Secret**
3. Adicione a chave e o valor correspondente
4. Salve a configuração

### No Código
As variáveis são acessadas através de:
- **Backend**: `process.env.NOME_DA_VARIAVEL`
- **Frontend**: `import.meta.env.VITE_NOME_DA_VARIAVEL`

---

## 1. Configurações do Servidor

### NODE_ENV
- **Descrição**: Define o ambiente de execução
- **Valores**: `development`, `production`, `test`
- **Padrão**: `development`
- **Exemplo**: `production`

### PORT
- **Descrição**: Porta onde o servidor irá rodar
- **Padrão**: `5000`
- **Exemplo**: `5000`

### HTTPS
- **Descrição**: Habilita HTTPS em produção
- **Valores**: `true`, `false`
- **Exemplo**: `true`

---

## 2. Banco de Dados

### DATABASE_URL
- **Descrição**: URL de conexão com o banco de dados
- **Formato**: `postgresql://user:password@host:port/database`
- **Exemplo**: `postgresql://user:pass@localhost:5432/agendoai`

### DB_HOST
- **Descrição**: Host do banco de dados
- **Exemplo**: `localhost`

### DB_PORT
- **Descrição**: Porta do banco de dados
- **Padrão**: `5432`
- **Exemplo**: `5432`

### DB_USER
- **Descrição**: Usuário do banco de dados
- **Exemplo**: `agendoai_user`

### DB_PASSWORD
- **Descrição**: Senha do banco de dados
- **Exemplo**: `secure_password_123`

### DB_NAME
- **Descrição**: Nome do banco de dados
- **Exemplo**: `agendoai_db`

---

## 3. Autenticação e Sessão

### SESSION_SECRET
- **Descrição**: Chave secreta para sessões
- **Requerido**: Sim
- **Exemplo**: `super_secret_session_key_2024`

### JWT_SECRET
- **Descrição**: Chave secreta para tokens JWT
- **Exemplo**: `jwt_secret_key_very_secure`

### BCRYPT_ROUNDS
- **Descrição**: Número de rounds para hash de senhas
- **Padrão**: `12`
- **Exemplo**: `12`

---

## 4. Pagamentos - Stripe

### STRIPE_SECRET_KEY
- **Descrição**: Chave secreta do Stripe (backend)
- **Formato**: `sk_test_...` ou `sk_live_...`
- **Exemplo**: `sk_test_51234567890abcdef...`

### VITE_STRIPE_PUBLISHABLE_KEY
- **Descrição**: Chave pública do Stripe (frontend)
- **Formato**: `pk_test_...` ou `pk_live_...`
- **Exemplo**: `pk_test_51234567890abcdef...`

### STRIPE_WEBHOOK_SECRET
- **Descrição**: Segredo do webhook do Stripe
- **Formato**: `whsec_...`
- **Exemplo**: `whsec_1234567890abcdef...`

### STRIPE_PRICE_ID
- **Descrição**: ID do preço no Stripe para assinaturas
- **Exemplo**: `price_1234567890abcdef`

---

## 5. Pagamentos - SumUp

### SUMUP_API_KEY
- **Descrição**: Chave da API SumUp
- **Exemplo**: `sumup_api_key_123456`

### SUMUP_CLIENT_ID
- **Descrição**: ID do cliente SumUp
- **Exemplo**: `sumup_client_123`

### SUMUP_CLIENT_SECRET
- **Descrição**: Segredo do cliente SumUp
- **Exemplo**: `sumup_secret_456`

---

## 6. Pagamentos - Asaas

### ASAAS_API_KEY
- **Descrição**: Chave da API Asaas
- **Exemplo**: `asaas_api_key_789`

### ASAAS_ENVIRONMENT
- **Descrição**: Ambiente Asaas
- **Valores**: `sandbox`, `production`
- **Exemplo**: `sandbox`

---

## 7. WhatsApp e Comunicação

### WHATSAPP_API_TOKEN
- **Descrição**: Token da API do WhatsApp Business
- **Exemplo**: `whatsapp_token_123456789`

### WHATSAPP_PHONE_NUMBER_ID
- **Descrição**: ID do número de telefone do WhatsApp
- **Exemplo**: `1234567890123456`

### WHATSAPP_VERIFY_TOKEN
- **Descrição**: Token de verificação do webhook
- **Exemplo**: `verify_token_whatsapp_123`

### VITE_WHATSAPP_API_URL
- **Descrição**: URL da API WhatsApp (frontend)
- **Exemplo**: `https://graph.facebook.com/v17.0`

---

## 8. Email

### EMAIL_SERVICE
- **Descrição**: Serviço de email
- **Valores**: `gmail`, `sendgrid`, `mailgun`
- **Exemplo**: `gmail`

### EMAIL_USER
- **Descrição**: Email do remetente
- **Exemplo**: `noreply@agendoai.com`

### EMAIL_PASSWORD
- **Descrição**: Senha do email
- **Exemplo**: `email_password_123`

### SENDGRID_API_KEY
- **Descrição**: Chave da API SendGrid
- **Exemplo**: `SG.1234567890abcdef...`

---

## 9. Inteligência Artificial

### OPENAI_API_KEY
- **Descrição**: Chave da API OpenAI
- **Exemplo**: `sk-1234567890abcdef...`

### ANTHROPIC_API_KEY
- **Descrição**: Chave da API Anthropic (Claude)
- **Exemplo**: `sk-ant-1234567890abcdef...`

### AI_MODEL
- **Descrição**: Modelo de IA padrão
- **Exemplo**: `gpt-4` ou `claude-3-sonnet`

---

## 10. Mapas e Localização

### VITE_MAPBOX_ACCESS_TOKEN
- **Descrição**: Token de acesso Mapbox (frontend)
- **Exemplo**: `pk.eyJ1IjoidXNlciIsImEiOiJhYmNkZWZnIn0...`

### GOOGLE_MAPS_API_KEY
- **Descrição**: Chave da API Google Maps
- **Exemplo**: `AIzaSyD1234567890abcdef...`

### VITE_GOOGLE_MAPS_API_KEY
- **Descrição**: Chave Google Maps (frontend)
- **Exemplo**: `AIzaSyD1234567890abcdef...`

---

## 11. Notificações Push

### VITE_PUSH_NOTIFICATION_PUBLIC_KEY
- **Descrição**: Chave pública para notificações push (frontend)
- **Exemplo**: `BG1234567890abcdef...`

### PUSH_NOTIFICATION_PRIVATE_KEY
- **Descrição**: Chave privada para notificações push (backend)
- **Exemplo**: `1234567890abcdef...`

### VAPID_EMAIL
- **Descrição**: Email para VAPID
- **Exemplo**: `admin@agendoai.com`

---

## 12. Upload e Armazenamento

### UPLOAD_DIR
- **Descrição**: Diretório de uploads
- **Padrão**: `uploads`
- **Exemplo**: `uploads`

### MAX_FILE_SIZE
- **Descrição**: Tamanho máximo de arquivo (bytes)
- **Padrão**: `10485760` (10MB)
- **Exemplo**: `10485760`

### AWS_ACCESS_KEY_ID
- **Descrição**: Chave de acesso AWS S3
- **Exemplo**: `AKIA1234567890ABCDEF`

### AWS_SECRET_ACCESS_KEY
- **Descrição**: Chave secreta AWS S3
- **Exemplo**: `1234567890abcdef...`

### AWS_REGION
- **Descrição**: Região AWS
- **Exemplo**: `us-east-1`

### AWS_S3_BUCKET
- **Descrição**: Nome do bucket S3
- **Exemplo**: `agendoai-uploads`

---

## 13. APIs Externas

### VITE_API_URL
- **Descrição**: URL da API backend (frontend)
- **Exemplo**: `https://agendoai.replit.app/api`

### EXTERNAL_API_URL
- **Descrição**: URL de API externa
- **Exemplo**: `https://api.exemplo.com`

### EXTERNAL_API_KEY
- **Descrição**: Chave de API externa
- **Exemplo**: `external_api_key_123`

---

## 14. Logs e Monitoramento

### LOG_LEVEL
- **Descrição**: Nível de log
- **Valores**: `debug`, `info`, `warn`, `error`
- **Padrão**: `info`
- **Exemplo**: `debug`

### SENTRY_DSN
- **Descrição**: DSN do Sentry para monitoramento
- **Exemplo**: `https://1234567890abcdef@sentry.io/123456`

---

## 15. Cache e Redis

### REDIS_URL
- **Descrição**: URL de conexão Redis
- **Exemplo**: `redis://localhost:6379`

### REDIS_PASSWORD
- **Descrição**: Senha do Redis
- **Exemplo**: `redis_password_123`

### CACHE_TTL
- **Descrição**: Tempo de vida do cache (segundos)
- **Padrão**: `3600`
- **Exemplo**: `3600`

---

## 16. Configurações de Segurança

### CORS_ORIGIN
- **Descrição**: Origens permitidas para CORS
- **Exemplo**: `https://agendoai.com,https://www.agendoai.com`

### RATE_LIMIT_REQUESTS
- **Descrição**: Limite de requisições por minuto
- **Padrão**: `100`
- **Exemplo**: `100`

### RATE_LIMIT_WINDOW
- **Descrição**: Janela de tempo para rate limit (ms)
- **Padrão**: `60000`
- **Exemplo**: `60000`

---

## 17. Configurações de Desenvolvimento

### DEBUG
- **Descrição**: Modo de debug
- **Valores**: `true`, `false`
- **Padrão**: `false`
- **Exemplo**: `true`

### HOT_RELOAD
- **Descrição**: Hot reload para desenvolvimento
- **Valores**: `true`, `false`
- **Padrão**: `true`
- **Exemplo**: `true`

---

## Configuração Mínima Recomendada

Para um ambiente de desenvolvimento básico, configure pelo menos:

```bash
# Essenciais
NODE_ENV=development
SESSION_SECRET=sua_chave_secreta_aqui

# Stripe (modo test)
STRIPE_SECRET_KEY=sk_test_seu_stripe_secret_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_seu_stripe_public_key

# AI (opcional)
OPENAI_API_KEY=sk-seu_openai_key_aqui

# WhatsApp (opcional)
WHATSAPP_API_TOKEN=seu_whatsapp_token
```

## Configuração para Produção

Para produção, adicione todas as variáveis relevantes e certifique-se de:

1. Usar chaves de produção (não test/sandbox)
2. Configurar `NODE_ENV=production`
3. Usar URLs HTTPS
4. Configurar todas as integrações necessárias

## Segurança

⚠️ **IMPORTANTE**:
- Nunca commite secrets no código
- Use sempre valores diferentes entre desenvolvimento e produção
- Rotacione chaves regularmente
- Use chaves com complexidade adequada
- Monitore o uso das APIs

## Suporte

Para dúvidas sobre configuração de secrets específicos:
1. Consulte a documentação da API correspondente
2. Verifique os logs do servidor para erros de configuração
3. Entre em contato com o suporte técnico
