Adding instructions about .env configuration to the project's README.
```
```replit_final_file
# AgendoAI

## 🔧 Configuração

### Variáveis de Ambiente

Todas as configurações do sistema são gerenciadas através do arquivo `.env`. 

#### 1. Configuração Inicial

```bash
# Copie o arquivo de exemplo
cp .env.local.example .env

# Configure as variáveis no arquivo .env
nano .env
```

#### 2. Verificar Configuração

```bash
# Execute o script de verificação
node scripts/check-config.js
```

#### 3. Variáveis Obrigatórias

- `SESSION_SECRET`: Chave secreta para sessões
- `DATABASE_URL`: URL de conexão com o banco de dados
- `NODE_ENV`: Ambiente (development/production)

#### 4. Configurações por Categoria

- **Banco de Dados**: `DATABASE_URL`, `LOCAL_DATABASE_URL`
- **Pagamentos**: `STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY`
- **Email**: `SENDGRID_API_KEY`, `FROM_EMAIL`
- **IA**: `ANTHROPIC_API_KEY`
- **WhatsApp**: `WHATSAPP_API_URL`, `WHATSAPP_TOKEN`
- **Mapas**: `VITE_MAPBOX_ACCESS_TOKEN`, `GOOGLE_MAPS_API_KEY`
- **Push**: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`

Para mais detalhes, consulte: `docs/environment-variables.md`

---
AgendoAI: Agendamento de Serviços Simplificado

Conectamos clientes e prestadores de serviços com uma experiência rápida, fácil e segura – sem ligações, sem confusão!

Serviços Disponíveis no AgendoAI:
🚗 Lava-Rápido & Estética Automotiva
💅 Beleza Feminina

Manicure & Pedicure

Cabelereiros & Coloristas

Maquiagem Profissional

Depilação & Estética Facial
✂️ Beleza Masculina

Barbearias Tradicionais & Modernas

Corte de Cabelo & Barba

Tratamentos Capilares

Tatuagens & Piercings (opcional)

Como Funciona?
Para Clientes:
📱 Escolha o serviço, local e horário
✅ Veja perfis, avaliações e preços
🔄 Agendamento instantâneo com confirmação automática
🔔 Lembretes inteligentes (SMS ou WhatsApp)

Para Prestadores:
📅 Controle total da agenda online
👥 Atraia mais clientes com perfil otimizado
💬 Chat integrado para confirmar detalhes
💳 Sistema de pagamentos seguro (PIX, cartão, etc.)

Por Que Usar?
⏳ Economize tempo – Sem esperar atendimento telefônico
📊 Transparência – Preços e horários claros
⭐ Qualidade garantida – Avaliações reais de clientes

```# Copie o arquivo de exemplo
cp .env.local.example .env

# Configure as variáveis no arquivo .env
nano .env
```

#### 2. Verificar Configuração

```bash
# Execute o script de verificação
node scripts/check-config.js