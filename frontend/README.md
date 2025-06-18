# AgendoAI Frontend

Interface web React para o sistema de agendamento AgendoAI, construída com React, TypeScript e Tailwind CSS.

## 🚀 Tecnologias

- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Superset tipado do JavaScript
- **Vite** - Build tool e dev server
- **React Router DOM** - Roteamento
- **Tailwind CSS** - Framework CSS utilitário
- **Axios** - Cliente HTTP
- **TanStack Query** - Gerenciamento de estado de servidor
- **React Hook Form** - Formulários performáticos
- **Zod** - Validação de esquemas

## 📁 Estrutura do Projeto

```
frontend/
├── public/                 # Arquivos estáticos
├── src/
│   ├── components/         # Componentes reutilizáveis
│   │   ├── ui/            # Componentes de interface
│   │   ├── Navbar.tsx     # Barra de navegação
│   │   └── ProtectedRoute.tsx # Rota protegida
│   ├── hooks/             # Custom hooks
│   │   └── useAuth.tsx    # Hook de autenticação
│   ├── pages/             # Páginas da aplicação
│   │   ├── HomePage.tsx   # Página inicial
│   │   ├── LoginPage.tsx  # Página de login
│   │   ├── RegisterPage.tsx # Página de registro
│   │   ├── DashboardPage.tsx # Dashboard
│   │   ├── ServicesPage.tsx # Página de serviços
│   │   └── AppointmentsPage.tsx # Página de agendamentos
│   ├── services/          # Serviços e APIs
│   │   └── api.ts         # Configuração da API
│   ├── utils/             # Funções utilitárias
│   ├── App.tsx           # Componente principal
│   ├── main.tsx          # Ponto de entrada
│   └── index.css         # Estilos globais
├── .env.example          # Exemplo de variáveis de ambiente
├── package.json          # Dependências e scripts
├── tailwind.config.js    # Configuração do Tailwind
├── vite.config.ts        # Configuração do Vite
└── index.html           # Template HTML
```

## ⚙️ Configuração

### 1. Instalação das Dependências

```bash
cd frontend
npm install
```

### 2. Configuração do Ambiente

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=AgendoAI
VITE_APP_VERSION=1.0.0

# Environment
VITE_NODE_ENV=development
```

**Importante:** Todas as variáveis de ambiente no frontend devem começar com `VITE_` para serem acessíveis no navegador.

## 🚀 Execução

### Desenvolvimento
```bash
npm run dev
```

A aplicação será iniciada em `http://localhost:3000`

### Build para Produção
```bash
npm run build
```

### Preview da Build
```bash
npm run preview
```

## 🎨 Estilização

O projeto usa **Tailwind CSS** para estilização. Classes utilitárias estão disponíveis em toda a aplicação.

### Tema Customizado
O arquivo `index.css` contém variáveis CSS customizadas para cores do tema:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  /* ... outras variáveis */
}
```

## 🔗 Integração com API

A integração com o backend é feita através do serviço API (`src/services/api.ts`):

```typescript
import { authAPI, servicesAPI, appointmentsAPI } from '@/services/api';

// Exemplo de uso
const { data } = await authAPI.login({ email, password });
```

### Interceptadores HTTP
- **Request:** Adiciona automaticamente o token JWT
- **Response:** Redireciona para login em caso de 401

## 🛣️ Roteamento

As rotas são gerenciadas pelo React Router DOM:

- `/` - Página inicial
- `/login` - Login
- `/register` - Registro
- `/dashboard` - Dashboard (protegida)
- `/services` - Serviços (protegida)
- `/appointments` - Agendamentos (protegida)

### Rotas Protegidas
Rotas que requerem autenticação usam o componente `ProtectedRoute`.

## 🔐 Autenticação

O sistema de autenticação usa:
- **JWT Tokens** armazenados no localStorage
- **Context API** para gerenciamento de estado
- **Custom Hook** `useAuth` para acesso às funções de auth

```typescript
const { user, login, logout, isAuthenticated } = useAuth();
```

## 📱 Responsividade

A interface é totalmente responsiva usando as classes utilitárias do Tailwind:

```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Conteúdo responsivo */}
</div>
```

## 🔍 Gerenciamento de Estado

- **TanStack Query** para estado de servidor (cache, sincronização)
- **React Context** para estado global (autenticação)
- **React Hook Form** para estado de formulários

## 🧪 Desenvolvimento

### Estrutura de Componentes
```tsx
import React from 'react';

interface ComponentProps {
  prop1: string;
  prop2?: number;
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      {/* JSX */}
    </div>
  );
};

export default Component;
```

### Custom Hooks
```tsx
export const useCustomHook = () => {
  const [state, setState] = useState();
  
  // Lógica do hook
  
  return { state, setState };
};
```

## 📦 Build e Deploy

### Build Local
```bash
npm run build
```

Gera arquivos otimizados na pasta `dist/`

### Deploy
1. Configure as variáveis de ambiente para produção
2. Execute o build
3. Sirva os arquivos estáticos (Nginx, Vercel, Netlify, etc.)

### Exemplo Nginx
```nginx
server {
  listen 80;
  server_name seu-dominio.com;
  
  root /caminho/para/dist;
  index index.html;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  location /api {
    proxy_pass http://localhost:5000;
  }
}
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Preview da build
- `npm run lint` - Executa linting (quando configurado)

## 🐛 Tratamento de Erros

### Boundary de Erro
Implementar Error Boundaries para capturar erros React:

```tsx
class ErrorBoundary extends React.Component {
  // Implementação do error boundary
}
```

### Interceptação de Erros HTTP
Erros da API são interceptados automaticamente no serviço.

## 🚀 Otimizações

- **Code Splitting** automático com React.lazy
- **Tree Shaking** pelo Vite
- **Minificação** automática em build
- **Cache** inteligente com TanStack Query

## 📖 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Faça commit das mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.