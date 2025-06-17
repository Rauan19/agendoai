
/**
 * Servidor específico para desenvolvimento local
 * Execute este arquivo para rodar o projeto em sua máquina local
 */

import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import { registerRoutes } from "./routes";
import { localConfig, validateLocalConfig } from "./local-config";

const app = express();

// Validar configuração local
validateLocalConfig();

// Configurar CORS para desenvolvimento local
app.use(cors(localConfig.server.cors));

// Log para debugging local
app.use((req, res, next) => {
  if (localConfig.development.enableDebugLogs) {
    console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  }
  next();
});

// Parser JSON
app.use(express.json({ 
  limit: localConfig.server.jsonLimit,
  verify: (req: Request, res, buf, encoding) => {
    try {
      JSON.parse(buf.toString(encoding as BufferEncoding));
    } catch (e) {
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        console.error('Erro de parsing JSON:', e);
        req.body = { _jsonParseError: e instanceof Error ? e.message : 'Formato JSON inválido' };
      }
    }
  }
}));

// Middleware para capturar erros de parsing JSON
app.use((req, res, next) => {
  if (req.body && req.body._jsonParseError) {
    return res.status(400).json({
      error: 'Erro ao processar JSON da requisição',
      details: req.body._jsonParseError
    });
  }
  next();
});

app.use(express.urlencoded({ extended: false }));

// Servir arquivos estáticos de uploads
app.use('/uploads', express.static(path.join(process.cwd(), localConfig.static.uploadsPath)));

// Log de performance para desenvolvimento
app.use((req, res, next) => {
  const start = Date.now();
  const originalResJson = res.json;
  
  res.json = function (bodyJson, ...args) {
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api") && localConfig.development.enableDebugLogs) {
      console.log(`${req.method} ${req.path} ${res.statusCode} em ${duration}ms`);
    }
  });

  next();
});

async function startLocalServer() {
  try {
    // Registrar rotas
    const server = await registerRoutes(app);

    // Middleware de tratamento de erros
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error("Erro no servidor local:", {
        status,
        message,
        stack: localConfig.development.enableDebugLogs ? err.stack : undefined
      });

      if (!res.headersSent) {
        return res.status(status).json({ 
          error: message,
          status,
          timestamp: new Date().toISOString(),
          development: localConfig.development.enableDebugLogs
        });
      }
    });

    // Rota catch-all para APIs
    app.use('/api/*', (req, res) => {
      res.status(404).json({ 
        error: 'API route not found', 
        path: req.originalUrl,
        availableRoutes: '/api/user, /api/appointments, /api/providers, etc.'
      });
    });

    // Para desenvolvimento local, servir arquivos estáticos do client se existirem
    const clientPath = path.join(process.cwd(), 'client/dist');
    try {
      app.use(express.static(clientPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(clientPath, 'index.html'));
      });
    } catch (error) {
      console.log('📁 Arquivos de build do cliente não encontrados. Execute "npm run build" primeiro.');
    }

    // Iniciar servidor
    const port = localConfig.server.port;
    server.listen(port, localConfig.server.host, () => {
      console.log('\n🚀 Servidor local iniciado com sucesso!');
      console.log(`📍 Backend: ${localConfig.urls.backend}`);
      console.log(`🌐 Frontend: ${localConfig.urls.frontend}`);
      console.log(`📂 Uploads: ${localConfig.static.uploadsPath}`);
      console.log('\n📋 Para desenvolvimento:');
      console.log('   - Execute "npm run dev" para o frontend (Vite)');
      console.log('   - Execute "npm run local" para este servidor');
      console.log('\n⚙️  Variáveis de ambiente necessárias em .env.local:');
      console.log('   - SESSION_SECRET');
      console.log('   - LOCAL_DATABASE_URL');
      console.log('   - STRIPE_TEST_PUBLISHABLE_KEY (opcional)');
      console.log('   - STRIPE_TEST_SECRET_KEY (opcional)');
      console.log('   - ANTHROPIC_API_KEY (opcional)');
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor local:', error);
    process.exit(1);
  }
}

// Manipular sinais de encerramento
process.on('SIGINT', () => {
  console.log('\n👋 Encerrando servidor local...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Encerrando servidor local...');
  process.exit(0);
});

// Iniciar servidor
startLocalServer();
