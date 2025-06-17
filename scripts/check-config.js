
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configurações do arquivo .env...\n');

// Verificar se o arquivo .env existe
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Arquivo .env não encontrado!');
  console.log('💡 Copie o arquivo .env.local.example para .env e configure as variáveis');
  process.exit(1);
}

// Carregar variáveis do .env
require('dotenv').config();

// Variáveis obrigatórias
const required = [
  'SESSION_SECRET',
  'DATABASE_URL',
  'NODE_ENV'
];

// Variáveis opcionais mas importantes
const optional = [
  'STRIPE_SECRET_KEY',
  'SENDGRID_API_KEY',
  'ANTHROPIC_API_KEY',
  'WHATSAPP_API_URL',
  'VITE_MAPBOX_ACCESS_TOKEN'
];

console.log('📋 Verificando variáveis obrigatórias:');
let hasErrors = false;

required.forEach(key => {
  if (process.env[key]) {
    console.log(`✅ ${key}: Configurado`);
  } else {
    console.log(`❌ ${key}: NÃO CONFIGURADO`);
    hasErrors = true;
  }
});

console.log('\n📋 Verificando variáveis opcionais:');
optional.forEach(key => {
  if (process.env[key]) {
    console.log(`✅ ${key}: Configurado`);
  } else {
    console.log(`⚠️  ${key}: Não configurado`);
  }
});

console.log('\n🔧 Configurações do servidor:');
console.log(`   - Porta: ${process.env.PORT || '5000'}`);
console.log(`   - Host: ${process.env.HOST || '0.0.0.0'}`);
console.log(`   - Ambiente: ${process.env.NODE_ENV || 'development'}`);
console.log(`   - Debug: ${process.env.DEBUG || 'false'}`);

console.log('\n🌐 URLs do sistema:');
console.log(`   - Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
console.log(`   - Backend: ${process.env.BACKEND_URL || 'http://localhost:5000'}`);
console.log(`   - API: ${process.env.VITE_API_URL || 'http://localhost:5000/api'}`);

if (hasErrors) {
  console.log('\n❌ Configuração incompleta! Configure as variáveis obrigatórias no arquivo .env');
  process.exit(1);
} else {
  console.log('\n✅ Configuração validada com sucesso!');
}
