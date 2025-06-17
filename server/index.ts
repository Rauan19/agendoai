import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import cors from "cors";
import { DatabaseStorage, storage } from './storage';

const app = express();

// Configurar CORS para permitir requisições de todos os origens durante desenvolvimento
app.use(cors({
  origin: true, // Permite qualquer origem
  credentials: true, // Permite cookies (importante para sessão)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Log para debugging
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  next();
});

// Configuração do parser JSON com tratamento de erros
app.use(express.json({
  limit: '10mb',
  verify: (req : Request, res, buf, encoding) => {
    try {
      // Se JSON.parse funcionar, está tudo bem
      JSON.parse(buf.toString(encoding as BufferEncoding));
    } catch (e) {
      // Se não for um JSON válido, mas o content-type for application/json
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        console.error('Erro de parsing JSON:', e);

        // Armazenar erro para ser capturado pelo middleware de erro personalizado
        req.body = { _jsonParseError: e instanceof Error ? e.message : 'Formato JSON inválido' };
      }
    }
  }
}));

// Middleware para capturar erros de parsing JSON e retornar resposta JSON apropriada
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

// Configuração para servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Erro no middleware global:", {
      status,
      message,
      stack: err.stack
    });

    // Verificar se a resposta já foi enviada
    if (!res.headersSent) {
      // Enviar resposta JSON com detalhes do erro
      return res.status(status).json({ 
        error: message,
        status,
        timestamp: new Date().toISOString()
      });
    }

    // Não lançar o erro novamente - isso pode causar problemas
    // com o Express e resultar em HTML em vez de JSON
  });

  // Definir a rota catch-all para APIs - deve estar antes do Vite
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API route not found', path: req.originalUrl });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Usar porta configurada para compatibilidade com o deployment
  const port = process.env.PORT || 5000;

  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();