# Como Executar Localmente no VS Code

## Configuração Rápida

### 1. Instalar Dependências
```bash
# Instalar dependências raiz
npm install

# Backend
cd backend && npm install && cd ..

# Frontend  
cd frontend && npm install && cd ..
```

### 2. Configurar Banco de Dados
```bash
# Copiar variáveis de ambiente
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Editar backend/.env com sua configuração de banco
# DATABASE_URL=postgresql://user:password@localhost:5432/agendoai
```

### 3. Executar Desenvolvimento

#### Opção A: Tudo junto (2 terminais)
Terminal 1:
```bash
cd backend
npm run dev
```

Terminal 2:
```bash
cd frontend
npm run dev
```

#### Opção B: Separado (1 terminal cada)
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

## URLs de Acesso
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Credenciais de Teste
- Email: admin@agendoai.com
- Senha: Admin123