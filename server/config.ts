
/**
 * Configuração centralizada para o servidor
 * 
 * Este arquivo lê todas as configurações do arquivo .env
 */

import dotenv from 'dotenv';

// Carrega variáveis do arquivo .env
dotenv.config();

// Determina se estamos em produção
export const isProduction = process.env.NODE_ENV === 'production';

// Configuração de servidor
export const serverConfig = {
  // Porta onde o servidor irá rodar 
  port: parseInt(process.env.PORT || '5000'),
  
  // Host onde o servidor irá escutar
  host: process.env.HOST || '0.0.0.0',
  
  // Configuração de CORS
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  
  // Limites de JSON parsing
  jsonLimit: '10mb',
};

// Configuração de banco de dados
export const databaseConfig = {
  url: process.env.DATABASE_URL,
  localUrl: process.env.LOCAL_DATABASE_URL,
};

// Configuração de sessão
export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'default-secret-change-me',
  maxAge: 60 * 60 * 24 * 7, // 7 dias
  
  cookie: {
    secure: isProduction && process.env.HTTPS === 'true',
    sameSite: isProduction ? 'none' : 'lax',
    httpOnly: true,
    path: '/',
  },
  
  resave: true,
  saveUninitialized: true,
};

// Configuração de autenticação
export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
};

// Configuração de pagamentos
export const paymentConfig = {
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    priceId: process.env.STRIPE_PRICE_ID,
  },
  
  sumup: {
    apiKey: process.env.SUMUP_API_KEY,
    clientId: process.env.SUMUP_CLIENT_ID,
    clientSecret: process.env.SUMUP_CLIENT_SECRET,
  },
  
  asaas: {
    apiKey: process.env.ASAAS_API_KEY,
    environment: process.env.ASAAS_ENVIRONMENT || 'sandbox',
  },
};

// Configuração de email
export const emailConfig = {
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  fromEmail: process.env.FROM_EMAIL || 'noreply@agendoai.com',
  supportEmail: process.env.SUPPORT_EMAIL || 'suporte@agendoai.com',
};

// Configuração de IA
export const aiConfig = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  model: process.env.AI_MODEL || 'claude-3-sonnet',
};

// Configuração de WhatsApp
export const whatsappConfig = {
  apiUrl: process.env.WHATSAPP_API_URL,
  token: process.env.WHATSAPP_TOKEN,
  phoneNumber: process.env.WHATSAPP_PHONE_NUMBER,
};

// Configuração de mapas
export const mapsConfig = {
  mapboxToken: process.env.VITE_MAPBOX_ACCESS_TOKEN,
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
};

// Configuração de notificações push
export const pushConfig = {
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY || process.env.VITE_PUSH_NOTIFICATION_PUBLIC_KEY,
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || process.env.PUSH_NOTIFICATION_PRIVATE_KEY,
  vapidEmail: process.env.VAPID_EMAIL,
};

// Configuração de upload
export const uploadConfig = {
  directory: process.env.UPLOAD_DIR || 'uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
  
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_S3_BUCKET,
  },
};

// Configuração de cache
export const cacheConfig = {
  redisUrl: process.env.REDIS_URL,
  redisPassword: process.env.REDIS_PASSWORD,
  ttl: parseInt(process.env.CACHE_TTL || '3600'),
};

// Configuração de logs
export const logConfig = {
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  sentryDsn: process.env.SENTRY_DSN,
};

// Configuração de rate limiting
export const rateLimitConfig = {
  requests: parseInt(process.env.RATE_LIMIT_REQUESTS || '100'),
  window: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'),
};

// URLs do sistema
export const urlConfig = {
  frontend: process.env.FRONTEND_URL || 'http://localhost:5173',
  backend: process.env.BACKEND_URL || 'http://localhost:5000',
  api: process.env.VITE_API_URL || 'http://localhost:5000/api',
};

// Configurações de desenvolvimento
export const devConfig = {
  debug: process.env.DEBUG === 'true',
  enableHotReload: process.env.ENABLE_HOT_RELOAD === 'true',
  enableDebugLogs: process.env.ENABLE_DEBUG_LOGS === 'true',
  enableMockPayments: process.env.ENABLE_MOCK_PAYMENTS === 'true',
};

// Função para validar configurações obrigatórias
export function validateConfig() {
  const required = [
    'SESSION_SECRET',
    'DATABASE_URL',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Variáveis de ambiente obrigatórias não encontradas:');
    missing.forEach(key => console.error(`   - ${key}`));
    throw new Error('Configuração incompleta. Verifique o arquivo .env');
  }

  console.log('✅ Configuração validada com sucesso');
  return true;
}

// Outras configurações específicas do aplicativo
export const appConfig = {
  debug: !isProduction,
  uploadsPath: uploadConfig.directory,
  features: {
    enableWebSockets: true,
    enablePushNotifications: true,
    enableChatbot: true,
  },
};
