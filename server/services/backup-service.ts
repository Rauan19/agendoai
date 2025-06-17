
import { storage } from '../storage';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { logger } from '../logger';

export class BackupService {
  private backupDir = join(process.cwd(), 'backups');

  constructor() {
    // Criar diretório de backup se não existir
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Criar backup completo do banco de dados em formato SQL
   */
  async createFullBackup(): Promise<string> {
    try {
      logger.info('Iniciando backup completo do banco de dados...');
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup_${timestamp}.sql`;
      const filepath = join(this.backupDir, filename);

      let sqlContent = `-- Backup do banco de dados AgendoAI\n`;
      sqlContent += `-- Criado em: ${new Date().toISOString()}\n\n`;

      // Backup de usuários
      const users = await storage.getAllUsers();
      if (users.length > 0) {
        sqlContent += `-- Tabela: users\n`;
        sqlContent += `INSERT INTO users (id, email, name, phone, userType, isActive, isVerified, createdAt, updatedAt) VALUES\n`;
        const userValues = users.map(user => 
          `(${user.id}, '${user.email}', '${user.name || ''}', '${user.phone || ''}', '${user.userType}', ${user.isActive}, ${user.isVerified}, '${user.createdAt}', '${user.updatedAt || user.createdAt}')`
        );
        sqlContent += userValues.join(',\n') + ';\n\n';
      }

      // Backup de categorias
      const categories = await storage.getCategories();
      if (categories.length > 0) {
        sqlContent += `-- Tabela: categories\n`;
        sqlContent += `INSERT INTO categories (id, name, description, isActive, createdAt, updatedAt) VALUES\n`;
        const categoryValues = categories.map(cat => 
          `(${cat.id}, '${cat.name}', '${cat.description || ''}', ${cat.isActive}, '${cat.createdAt}', '${cat.updatedAt || cat.createdAt}')`
        );
        sqlContent += categoryValues.join(',\n') + ';\n\n';
      }

      // Backup de serviços
      const services = await storage.getServices();
      if (services.length > 0) {
        sqlContent += `-- Tabela: services\n`;
        sqlContent += `INSERT INTO services (id, name, description, price, duration, categoryId, providerId, isActive, createdAt, updatedAt) VALUES\n`;
        const serviceValues = services.map(service => 
          `(${service.id}, '${service.name}', '${service.description || ''}', ${service.price}, ${service.duration}, ${service.categoryId}, ${service.providerId}, ${service.isActive}, '${service.createdAt}', '${service.updatedAt || service.createdAt}')`
        );
        sqlContent += serviceValues.join(',\n') + ';\n\n';
      }

      // Backup de agendamentos
      const appointments = await storage.getAllAppointments();
      if (appointments.length > 0) {
        sqlContent += `-- Tabela: appointments\n`;
        sqlContent += `INSERT INTO appointments (id, clientId, providerId, serviceId, date, startTime, endTime, status, notes, createdAt, updatedAt) VALUES\n`;
        const appointmentValues = appointments.map(apt => 
          `(${apt.id}, ${apt.clientId}, ${apt.providerId}, ${apt.serviceId}, '${apt.date}', '${apt.startTime}', '${apt.endTime}', '${apt.status}', '${apt.notes || ''}', '${apt.createdAt}', '${apt.updatedAt || apt.createdAt}')`
        );
        sqlContent += appointmentValues.join(',\n') + ';\n\n';
      }

      // Backup de avaliações
      const reviews = await storage.getAllReviews();
      if (reviews.length > 0) {
        sqlContent += `-- Tabela: reviews\n`;
        sqlContent += `INSERT INTO reviews (id, appointmentId, clientId, providerId, rating, comment, isActive, createdAt, updatedAt) VALUES\n`;
        const reviewValues = reviews.map(review => 
          `(${review.id}, ${review.appointmentId}, ${review.clientId}, ${review.providerId}, ${review.rating}, '${review.comment || ''}', ${review.isActive}, '${review.createdAt}', '${review.updatedAt || review.createdAt}')`
        );
        sqlContent += reviewValues.join(',\n') + ';\n\n';
      }

      // Salvar arquivo
      writeFileSync(filepath, sqlContent, 'utf8');
      
      logger.info(`Backup criado com sucesso: ${filename}`);
      return filename;

    } catch (error) {
      logger.error('Erro ao criar backup:', error);
      throw new Error('Falha ao criar backup do banco de dados');
    }
  }

  /**
   * Criar backup incremental (últimas 24 horas)
   */
  async createIncrementalBackup(): Promise<string> {
    try {
      logger.info('Iniciando backup incremental...');
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup_incremental_${timestamp}.sql`;
      const filepath = join(this.backupDir, filename);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const cutoffDate = yesterday.toISOString().split('T')[0];

      let sqlContent = `-- Backup incremental do banco de dados AgendoAI\n`;
      sqlContent += `-- Dados criados/atualizados após: ${cutoffDate}\n`;
      sqlContent += `-- Criado em: ${new Date().toISOString()}\n\n`;

      // Agendamentos recentes
      const recentAppointments = await storage.getRecentAppointments(100);
      const filteredAppointments = recentAppointments.filter(apt => 
        apt.createdAt >= cutoffDate || (apt.updatedAt && apt.updatedAt >= cutoffDate)
      );

      if (filteredAppointments.length > 0) {
        sqlContent += `-- Agendamentos recentes\n`;
        sqlContent += `INSERT INTO appointments (id, clientId, providerId, serviceId, date, startTime, endTime, status, notes, createdAt, updatedAt) VALUES\n`;
        const appointmentValues = filteredAppointments.map(apt => 
          `(${apt.id}, ${apt.clientId}, ${apt.providerId}, ${apt.serviceId}, '${apt.date}', '${apt.startTime}', '${apt.endTime}', '${apt.status}', '${apt.notes || ''}', '${apt.createdAt}', '${apt.updatedAt || apt.createdAt}')`
        );
        sqlContent += appointmentValues.join(',\n') + ';\n\n';
      }

      // Salvar arquivo
      writeFileSync(filepath, sqlContent, 'utf8');
      
      logger.info(`Backup incremental criado: ${filename}`);
      return filename;

    } catch (error) {
      logger.error('Erro ao criar backup incremental:', error);
      throw new Error('Falha ao criar backup incremental');
    }
  }

  /**
   * Listar backups disponíveis
   */
  listBackups(): string[] {
    try {
      const fs = require('fs');
      return fs.readdirSync(this.backupDir)
        .filter((file: string) => file.endsWith('.sql'))
        .sort((a: string, b: string) => b.localeCompare(a)); // Mais recente primeiro
    } catch (error) {
      logger.error('Erro ao listar backups:', error);
      return [];
    }
  }

  /**
   * Obter caminho completo do backup
   */
  getBackupPath(filename: string): string {
    return join(this.backupDir, filename);
  }
}

export const backupService = new BackupService();
