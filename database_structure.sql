
-- =========================================
-- AgendoAI - Estrutura Completa do Banco
-- =========================================

-- Tabela de usuários (clientes, prestadores, admin, suporte)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT,
  profile_image TEXT,
  user_type TEXT NOT NULL DEFAULT 'client', -- "client", "provider", "admin", "support"
  phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Endereços dos usuários
CREATE TABLE user_addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'home', -- "home", "work", "other"
  name TEXT NOT NULL,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Métodos de pagamento dos usuários
CREATE TABLE user_payment_methods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  default_payment_method_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Nichos (categorias de alto nível)
CREATE TABLE niches (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categorias de serviços
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  niche_id INTEGER NOT NULL REFERENCES niches(id),
  parent_id INTEGER, -- Para subcategorias
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Templates de serviços padrão do sistema
CREATE TABLE service_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  niche_id INTEGER REFERENCES niches(id),
  icon TEXT,
  duration INTEGER DEFAULT 60, -- Duração padrão em minutos
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Serviços oferecidos pelos prestadores
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL REFERENCES users(id),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  niche_id INTEGER REFERENCES niches(id),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER DEFAULT 0, -- Mantido por compatibilidade
  duration INTEGER NOT NULL, -- Tempo padrão em minutos
  is_active BOOLEAN DEFAULT true
);

-- Serviços do prestador com tempo e preço customizados
CREATE TABLE provider_services (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL REFERENCES users(id),
  service_id INTEGER NOT NULL REFERENCES services(id),
  execution_time INTEGER NOT NULL, -- Tempo de execução personalizado
  duration INTEGER NOT NULL, -- Duração total do serviço
  price INTEGER NOT NULL, -- Preço personalizado
  break_time INTEGER DEFAULT 0, -- Tempo de intervalo após o serviço
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Disponibilidade dos prestadores
CREATE TABLE availability (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0 = Domingo, 6 = Sábado
  start_time TEXT NOT NULL, -- Formato "HH:MM"
  end_time TEXT NOT NULL, -- Formato "HH:MM"
  is_available BOOLEAN DEFAULT true,
  date TEXT, -- Formato "YYYY-MM-DD" para dias específicos
  interval_minutes INTEGER DEFAULT 30 -- Intervalo entre horários
);

-- Horários bloqueados dentro da disponibilidade
CREATE TABLE blocked_time_slots (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL,
  availability_id INTEGER NOT NULL,
  date TEXT, -- "YYYY-MM-DD" ou null para recorrente
  start_time TEXT NOT NULL, -- "HH:MM"
  end_time TEXT NOT NULL, -- "HH:MM"
  reason TEXT,
  blocked_by_user_id INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Intervalos personalizados do prestador
CREATE TABLE provider_breaks (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL,
  name TEXT NOT NULL, -- Nome do intervalo
  day_of_week INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT true,
  date TEXT, -- Para intervalos específicos
  created_at TIMESTAMP DEFAULT NOW()
);

-- Agendamentos
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  provider_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  provider_service_id INTEGER,
  date TEXT NOT NULL, -- "YYYY-MM-DD"
  start_time TEXT NOT NULL, -- "HH:MM"
  end_time TEXT NOT NULL, -- "HH:MM"
  availability_id INTEGER,
  status TEXT DEFAULT 'pending', -- "pending", "confirmed", "completed", "canceled"
  notes TEXT,
  payment_method TEXT, -- "local", "credit_card", "pix"
  payment_status TEXT, -- "pending", "paid", "failed", "refunded"
  payment_id TEXT,
  is_manually_created BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  -- Campos para exibição
  service_name TEXT,
  provider_name TEXT,
  client_name TEXT,
  client_phone TEXT,
  total_price INTEGER
);

-- Configurações do prestador
CREATE TABLE provider_settings (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL UNIQUE,
  is_online BOOLEAN DEFAULT false,
  business_name TEXT,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  zip TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  instagram TEXT,
  facebook TEXT,
  cover_image TEXT,
  latitude TEXT,
  longitude TEXT,
  business_hours TEXT, -- JSON com horários de funcionamento
  specialties TEXT, -- Lista de especialidades separadas por vírgula
  accepts_cards BOOLEAN DEFAULT true,
  accepts_pix BOOLEAN DEFAULT true,
  accepts_cash BOOLEAN DEFAULT true,
  accept_online_payments BOOLEAN DEFAULT false,
  merchant_code TEXT,
  rating INTEGER, -- Armazenado como rating * 10
  rating_count INTEGER DEFAULT 0,
  bio TEXT,
  default_service_duration INTEGER DEFAULT 60
);

-- Preferências de pagamento do prestador
CREATE TABLE provider_payment_preferences (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL UNIQUE,
  accepts_credit_card BOOLEAN DEFAULT true,
  accepts_debit_card BOOLEAN DEFAULT true,
  accepts_pix BOOLEAN DEFAULT true,
  accepts_cash BOOLEAN DEFAULT true,
  accepts_transfer BOOLEAN DEFAULT false,
  prefer_stripe BOOLEAN DEFAULT true,
  prefer_asaas BOOLEAN DEFAULT false,
  prefer_manual BOOLEAN DEFAULT false,
  auto_confirm BOOLEAN DEFAULT false,
  request_pre_payment BOOLEAN DEFAULT false,
  allow_partial_payment BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Preferências de pagamento do cliente
CREATE TABLE client_payment_preferences (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL UNIQUE,
  prefer_credit_card BOOLEAN DEFAULT true,
  prefer_debit_card BOOLEAN DEFAULT false,
  prefer_pix BOOLEAN DEFAULT false,
  prefer_cash BOOLEAN DEFAULT false,
  default_card_id TEXT,
  save_payment_info BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Configurações de pagamento da plataforma
CREATE TABLE payment_settings (
  id SERIAL PRIMARY KEY,
  service_fee_percentage INTEGER DEFAULT 175, -- Taxa em centavos
  service_fee INTEGER DEFAULT 175,
  min_service_fee INTEGER DEFAULT 100,
  max_service_fee INTEGER DEFAULT 5000,
  payout_schedule TEXT DEFAULT 'weekly',
  stripe_enabled BOOLEAN DEFAULT false,
  stripe_live_mode BOOLEAN DEFAULT false,
  stripe_public_key TEXT,
  stripe_secret_key TEXT,
  stripe_webhook_secret TEXT,
  stripe_connect_enabled BOOLEAN DEFAULT false,
  asaas_enabled BOOLEAN DEFAULT false,
  asaas_live_mode BOOLEAN DEFAULT false,
  asaas_api_key TEXT,
  asaas_webhook_token TEXT,
  asaas_wallet_id TEXT,
  asaas_split_enabled BOOLEAN DEFAULT false
);

-- Configurações de integrações externas
CREATE TABLE integrations_settings (
  id SERIAL PRIMARY KEY,
  sendgrid_enabled BOOLEAN DEFAULT false,
  sendgrid_api_key TEXT,
  push_notifications_enabled BOOLEAN DEFAULT false,
  vapid_public_key TEXT,
  vapid_private_key TEXT,
  whatsapp_enabled BOOLEAN DEFAULT false,
  whatsapp_api_key TEXT,
  whatsapp_phone_number_id TEXT,
  whatsapp_verify_token TEXT,
  whatsapp_business_id TEXT,
  whatsapp_chatbot_enabled BOOLEAN DEFAULT false,
  whatsapp_chatbot_welcome_message TEXT,
  whatsapp_chatbot_scheduling_enabled BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Agendas
CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Favoritos
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  provider_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Slots de tempo
CREATE TABLE time_slots (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Dias indisponíveis
CREATE TABLE unavailable_days (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Horários bloqueados recorrentes
CREATE TABLE recurrent_blocked_times (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0-6
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Artigos
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id INTEGER,
  author_id INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categorias de artigos
CREATE TABLE article_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cupons
CREATE TABLE coupons (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL, -- "percentage" ou "fixed"
  discount_value INTEGER NOT NULL,
  min_order_value INTEGER,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Artigos de ajuda
CREATE TABLE help_articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id INTEGER,
  "order" INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categorias de ajuda
CREATE TABLE help_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tickets de suporte
CREATE TABLE support_tickets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  admin_id INTEGER,
  subject TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  last_response_at TIMESTAMP,
  read_by_user BOOLEAN DEFAULT false,
  read_by_admin BOOLEAN DEFAULT false
);

-- Mensagens de suporte
CREATE TABLE support_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id INTEGER,
  admin_id INTEGER,
  message TEXT NOT NULL,
  attachment_url TEXT,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  read_by_user BOOLEAN DEFAULT false,
  read_by_admin BOOLEAN DEFAULT false
);

-- Avaliações
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  provider_id INTEGER NOT NULL,
  appointment_id INTEGER NOT NULL,
  rating INTEGER NOT NULL, -- 1-5
  comment TEXT,
  published_at TIMESTAMP DEFAULT NOW(),
  is_public BOOLEAN DEFAULT true,
  provider_response TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Etapas de onboarding
CREATE TABLE onboarding_steps (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_type TEXT NOT NULL, -- client, provider, admin
  "order" INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,
  icon TEXT,
  help_text TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Progresso do onboarding do usuário
CREATE TABLE user_onboarding_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  step_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in-progress, completed, skipped
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notificações
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  link_to TEXT,
  appointment_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tokens de redefinição de senha
CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  used_at TIMESTAMP
);

-- Promoções
CREATE TABLE promotions (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  discount_percentage INTEGER,
  discount_value INTEGER,
  service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
  provider_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  niche_id INTEGER REFERENCES niches(id) ON DELETE SET NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  image TEXT,
  coupon_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  background_color TEXT,
  text_color TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Saldos dos prestadores
CREATE TABLE provider_balances (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL REFERENCES users(id),
  balance DECIMAL(10,2) DEFAULT 0,
  available_balance DECIMAL(10,2) DEFAULT 0,
  pending_balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transações dos prestadores
CREATE TABLE provider_transactions (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL, -- 'payment', 'commission', 'withdrawal'
  status TEXT NOT NULL, -- 'pending', 'completed', 'failed'
  appointment_id INTEGER REFERENCES appointments(id),
  created_at TIMESTAMP DEFAULT NOW(),
  description TEXT,
  metadata JSONB
);

-- Solicitações de saque
CREATE TABLE payment_withdrawals (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
  payment_method TEXT NOT NULL, -- 'bank_transfer', 'pix'
  payment_details JSONB,
  requested_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  transaction_id TEXT,
  notes TEXT
);

-- Configurações do sistema
CREATE TABLE system_settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  label TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Taxas de serviço específicas por prestador
CREATE TABLE provider_service_fees (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL REFERENCES users(id),
  fixed_fee INTEGER NOT NULL DEFAULT 0, -- Valor fixo em centavos
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================================
-- ÍNDICES PARA OTIMIZAÇÃO
-- =========================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_appointments_provider_id ON appointments(provider_id);
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_availability_provider_id ON availability(provider_id);
CREATE INDEX idx_services_provider_id ON services(provider_id);
CREATE INDEX idx_services_category_id ON services(category_id);
CREATE INDEX idx_provider_services_provider_id ON provider_services(provider_id);
CREATE INDEX idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
