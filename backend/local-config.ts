
/**
 * Configuração específica para desenvolvimento local
 * Use este arquivo quando rodar o projeto em sua máquina local
 */

export const localConfig = {
  // Configuração de servidor local
  server: {
    port: 3000, // Porta padrão para desenvolvimento local
    host: 'localhost', // Para desenvolvimento local, usar localhost
    
    // Configuração de CORS mais restritiva para local
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    
    // Limites para desenvolvimento
    jsonLimit: '50mb',
  },

  // Configuração de banco de dados local
  database: {
    // Para desenvolvimento local, você pode usar SQLite
    url: process.env.LOCAL_DATABASE_URL || 'file:./local.db',
    
    // Ou PostgreSQL local
    // url: 'postgresql://username:password@localhost:5432/agendoai_local'
  },

  // Configuração de sessão para desenvolvimento local
  session: {
    secret: process.env.SESSION_SECRET || 'local-dev-secret-change-in-production',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    
    cookie: {
      secure: false, // HTTP em desenvolvimento local
      sameSite: 'lax',
      httpOnly: true,
      path: '/',
    },
    
    resave: false,
    saveUninitialized: false,
  },

  // Configurações de desenvolvimento
  development: {
    enableHotReload: true,
    enableDebugLogs: true,
    enableCors: true,
    enableMockPayments: true, // Para testar pagamentos sem APIs reais
  },

  // Configurações de arquivos estáticos
  static: {
    uploadsPath: './uploads-local',
    maxFileSize: '10mb',
  },

  // URLs de desenvolvimento local
  urls: {
    frontend: 'http://localhost:5173', // Vite dev server
    backend: 'http://localhost:3000',
    webhooks: 'http://localhost:3000/webhooks',
  },

  // Configurações de APIs externas para desenvolvimento
  apis: {
    // Use chaves de teste/sandbox quando disponível
    stripe: {
      publishableKey: process.env.STRIPE_TEST_PUBLISHABLE_KEY,
      secretKey: process.env.STRIPE_TEST_SECRET_KEY,
      webhookSecret: process.env.STRIPE_TEST_WEBHOOK_SECRET,
    },
    
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: process.env.FROM_EMAIL || 'test@localhost.com',
    },
    
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
    },
    
    whatsapp: {
      apiUrl: process.env.WHATSAPP_API_URL || 'http://localhost:8080',
      token: process.env.WHATSAPP_TOKEN,
    }
  },

  // Configurações de notificações push
  pushNotifications: {
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
    vapidEmail: process.env.VAPID_EMAIL || 'mailto:test@localhost.com',
  }
};

// Função para validar configuração local
export function validateLocalConfig() {
  const required = [
    'SESSION_SECRET',
    'LOCAL_DATABASE_URL'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn('⚠️  Variáveis de ambiente faltando para desenvolvimento local:');
    missing.forEach(key => console.warn(`   - ${key}`));
    console.warn('   O sistema pode não funcionar corretamente.');
  }

  return missing.length === 0;
}
