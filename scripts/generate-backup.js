
const fs = require('fs');
const path = require('path');

// Importar o serviço de backup
const { backupService } = require('../server/services/backup-service');

async function generateBackup() {
  console.log('🔄 Iniciando processo de backup...');
  
  try {
    // Gerar backup completo
    const filename = await backupService.createFullBackup();
    
    console.log('✅ Backup criado com sucesso!');
    console.log(`📁 Arquivo: ${filename}`);
    console.log(`📍 Local: ${backupService.getBackupPath(filename)}`);
    
    // Listar todos os backups disponíveis
    const backups = backupService.listBackups();
    console.log('\n📋 Backups disponíveis:');
    backups.forEach((backup, index) => {
      console.log(`${index + 1}. ${backup}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao gerar backup:', error.message);
    process.exit(1);
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  generateBackup();
}

module.exports = { generateBackup };
