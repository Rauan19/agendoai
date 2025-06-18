import { db } from './db';
import { 
  users, appointments, services, categories, niches,
  providerServices, availability, blockedTimeSlots, reviews,
  providerServiceFees, paymentSettings
} from '../shared/schema';
import { eq, and, sql, desc, asc, gte, lte, isNull, or } from 'drizzle-orm';

// Complete storage interface for booking wizard functionality
export interface IStorage {
  // User methods
  getUserByEmail(email: string): Promise<any>;
  createUser(user: any): Promise<any>;
  getUser(id: number): Promise<any>;
  getUsers(): Promise<any[]>;
  
  // Appointment methods
  createAppointment(appointment: any): Promise<any>;
  getAppointmentsByProvider(providerId: number): Promise<any[]>;
  getAppointments(): Promise<any[]>;
  
  // Provider methods
  getProviders(): Promise<any[]>;
  getProviderById(id: number): Promise<any>;
  
  // Service methods
  getServices(): Promise<any[]>;
  getServiceById(id: number): Promise<any>;
  getService(id: number): Promise<any>;
  
  // Category and Niche methods
  getCategories(): Promise<any[]>;
  getNiches(): Promise<any[]>;
  getCategoriesByNicheId(nicheId: number): Promise<any[]>;
  getCategoriesWithServices(nicheId?: number): Promise<any[]>;
  getCategoriesWithNicheInfo(): Promise<any[]>;
  
  // Provider Service methods
  getProviderServices(): Promise<any[]>;
  getProviderServicesByProvider(providerId: number): Promise<any[]>;
  getProviderServicesByProviderId(providerId: number): Promise<any[]>;
  getProviderServiceByProviderAndService(providerId: number, serviceId: number): Promise<any>;
  getServicesByCategoryId(categoryId: number): Promise<any[]>;
  getServicesWithProviders(categoryId?: number): Promise<any[]>;
  
  // Core booking methods
  getProviderAvailability(providerId: number, date: string): Promise<any[]>;
  getBlockedTimeSlots(providerId: number, date: string): Promise<any[]>;
  getPaymentSettings(): Promise<any>;
  blockTimeSlot(providerId: number, date: string, startTime: string, endTime: string): Promise<boolean>;
  getProviderSettings(providerId: number): Promise<any>;
  getAvailabilityByDate(providerId: number, date: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getUserByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: any) {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getUser(id: number) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUsers() {
    return await db.select().from(users);
  }

  async createAppointment(appointment: any) {
    const result = await db.insert(appointments).values(appointment).returning();
    return result[0];
  }

  async getAppointmentsByProvider(providerId: number) {
    return await db.select().from(appointments).where(eq(appointments.providerId, providerId));
  }

  async getAppointments() {
    return await db.select().from(appointments);
  }

  async getProviders() {
    return await db.select().from(users).where(eq(users.userType, 'provider'));
  }

  async getProviderById(id: number) {
    const result = await db.select().from(users).where(and(eq(users.id, id), eq(users.userType, 'provider')));
    return result[0];
  }

  async getServices() {
    return await db.select().from(services);
  }

  async getServiceById(id: number) {
    const result = await db.select().from(services).where(eq(services.id, id));
    return result[0];
  }

  async getService(id: number) {
    const result = await db.select().from(services).where(eq(services.id, id));
    return result[0];
  }

  async getCategories() {
    return await db.select().from(categories);
  }

  async getNiches() {
    return await db.select().from(niches);
  }

  async getProviderServices() {
    return await db.select().from(providerServices);
  }

  async getProviderServicesByProvider(providerId: number) {
    return await db.select().from(providerServices).where(eq(providerServices.providerId, providerId));
  }

  async getProviderServicesByProviderId(providerId: number) {
    return await db.select().from(providerServices).where(eq(providerServices.providerId, providerId));
  }

  async getCategoriesByNicheId(nicheId: number) {
    return await db.select().from(categories).where(eq(categories.nicheId, nicheId));
  }

  async getCategoriesWithServices(nicheId?: number) {
    try {
      let query = db.select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        icon: categories.icon,
        color: categories.color,
        nicheId: categories.nicheId,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt
      }).from(categories);

      if (nicheId) {
        query = query.where(eq(categories.nicheId, nicheId));
      }

      return await query;
    } catch (error) {
      console.error('Error in getCategoriesWithServices:', error);
      return [];
    }
  }

  async getCategoriesWithNicheInfo() {
    try {
      const result = await db.select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        icon: categories.icon,
        color: categories.color,
        nicheId: categories.nicheId,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        nicheName: niches.name
      })
      .from(categories)
      .leftJoin(niches, eq(categories.nicheId, niches.id));

      return result;
    } catch (error) {
      console.error('Error in getCategoriesWithNicheInfo:', error);
      return [];
    }
  }

  async getServicesByCategoryId(categoryId: number) {
    return await db.select().from(services).where(eq(services.categoryId, categoryId));
  }

  async getServicesWithProviders(categoryId?: number) {
    try {
      let query = db.select({
        id: services.id,
        name: services.name,
        description: services.description,
        categoryId: services.categoryId,
        nicheId: services.nicheId,
        isActive: services.isActive,
        createdAt: services.createdAt,
        updatedAt: services.updatedAt
      }).from(services);

      if (categoryId) {
        query = query.where(eq(services.categoryId, categoryId));
      }

      return await query;
    } catch (error) {
      console.error('Error in getServicesWithProviders:', error);
      return [];
    }
  }

  async getProviderAvailability(providerId: number, date: string) {
    try {
      const result = await db.select()
        .from(availability)
        .where(eq(availability.providerId, providerId));
      return result;
    } catch (error) {
      console.error('Error getting provider availability:', error);
      return [];
    }
  }

  async getBlockedTimeSlots(providerId: number, date: string) {
    try {
      const result = await db.select()
        .from(blockedTimeSlots)
        .where(and(
          eq(blockedTimeSlots.providerId, providerId),
          eq(blockedTimeSlots.date, date)
        ));
      return result.map((row: any) => ({
        id: row.id,
        providerId: row.providerId,
        availabilityId: row.availabilityId,
        date: row.date,
        startTime: row.startTime,
        endTime: row.endTime,
        reason: row.reason,
        blockedByUserId: row.blockedByUserId,
        metadata: row.metadata,
        createdAt: row.createdAt
      }));
    } catch (error) {
      console.error('Error getting blocked time slots:', error);
      return [];
    }
  }

  async getPaymentSettings() {
    return {
      stripeEnabled: false,
      asaasEnabled: false,
      platformFeePercentage: 3.5,
      defaultPaymentMethods: ['money', 'pix', 'credit_card']
    };
  }

  async blockTimeSlot(blockData: any): Promise<any> {
    try {
      const result = await db.insert(blockedTimeSlots).values({
        providerId: blockData.providerId,
        date: blockData.date,
        startTime: blockData.startTime,
        endTime: blockData.endTime,
        reason: blockData.reason || 'Bloqueado manualmente',
        blockedByUserId: blockData.blockedByUserId,
        metadata: blockData.metadata ? JSON.stringify(blockData.metadata) : null,
        createdAt: new Date()
      }).returning();
      
      return result[0];
    } catch (error) {
      console.error('Erro ao bloquear slot:', error);
      throw error;
    }
  }

  async unblockTimeSlot(unblockData: any): Promise<boolean> {
    try {
      const result = await db.delete(blockedTimeSlots)
        .where(and(
          eq(blockedTimeSlots.providerId, unblockData.providerId),
          eq(blockedTimeSlots.date, unblockData.date),
          eq(blockedTimeSlots.startTime, unblockData.startTime),
          eq(blockedTimeSlots.endTime, unblockData.endTime)
        ));
      
      return true;
    } catch (error) {
      console.error('Erro ao desbloquear slot:', error);
      return false;
    }
  }

  // Métodos para appointments por cliente
  async getAppointmentsByClientId(clientId: number) {
    return await db.select().from(appointments).where(eq(appointments.clientId, clientId));
  }

  async getClientAppointments(clientId: number) {
    return await db.select().from(appointments).where(eq(appointments.clientId, clientId));
  }

  async getAppointmentsByProviderId(providerId: number) {
    return await db.select().from(appointments).where(eq(appointments.providerId, providerId));
  }

  // Métodos para provider settings
  async getProviderSettings(providerId: number) {
    try {
      // Buscar configurações do prestador na tabela users ou criar um fallback
      const user = await db.select().from(users).where(eq(users.id, providerId));
      if (user[0]) {
        // Retornar configurações padrão baseadas nos dados do usuário
        return {
          rating: 0, // Pode ser calculado a partir de reviews
          isOnline: user[0].isActive || false,
          acceptsOnlinePayment: true,
          timezone: 'America/Sao_Paulo'
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar configurações do prestador:', error);
      return null;
    }
  }

  // Métodos para availability por data e dia
  async getAvailabilityByDate(providerId: number, date: string) {
    try {
      const result = await db.select()
        .from(availability)
        .where(and(
          eq(availability.providerId, providerId),
          eq(availability.date, date)
        ));
      return result;
    } catch (error) {
      console.error('Erro ao buscar disponibilidade por data:', error);
      return [];
    }
  }

  async getAvailabilityByDay(providerId: number, dayOfWeek: number) {
    try {
      const result = await db.select()
        .from(availability)
        .where(and(
          eq(availability.providerId, providerId),
          eq(availability.dayOfWeek, dayOfWeek)
        ));
      return result;
    } catch (error) {
      console.error('Erro ao buscar disponibilidade por dia da semana:', error);
      return [];
    }
  }

  async getBlockedTimeSlotsByDate(providerId: number, date: string) {
    try {
      const result = await db.select()
        .from(blockedTimeSlots)
        .where(and(
          eq(blockedTimeSlots.providerId, providerId),
          eq(blockedTimeSlots.date, date)
        ));
      return result;
    } catch (error) {
      console.error('Erro ao buscar slots bloqueados por data:', error);
      return [];
    }
  }

  // Métodos para buscar usuários por tipo
  async getUsersByType(userType: string) {
    return await db.select().from(users).where(eq(users.userType, userType));
  }

  // Métodos para serviços por prestador
  async getServicesByProvider(providerId: number) {
    try {
      const result = await db.select()
        .from(providerServices)
        .where(eq(providerServices.providerId, providerId));
      return result;
    } catch (error) {
      console.error('Erro ao buscar serviços do prestador:', error);
      return [];
    }
  }

  async getProviderServiceByProviderAndService(providerId: number, serviceId: number) {
    try {
      const result = await db.select()
        .from(providerServices)
        .where(and(
          eq(providerServices.providerId, providerId),
          eq(providerServices.serviceId, serviceId)
        ));
      return result[0];
    } catch (error) {
      console.error('Erro ao buscar serviço específico do prestador:', error);
      return null;
    }
  }

  // Métodos adicionais para taxas de prestador
  async getAllProviderFees() {
    try {
      const result = await db.select().from(providerServiceFees);
      return result;
    } catch (error) {
      console.error('Erro ao buscar todas as taxas de prestador:', error);
      return [];
    }
  }

  async getProviderFee(id: number) {
    try {
      const result = await db.select()
        .from(providerServiceFees)
        .where(eq(providerServiceFees.id, id));
      return result[0];
    } catch (error) {
      console.error('Erro ao buscar taxa de prestador:', error);
      return null;
    }
  }

  async createProviderFee(data: any) {
    try {
      const result = await db.insert(providerServiceFees).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar taxa de prestador:', error);
      throw error;
    }
  }

  async updateProviderFee(id: number, data: any) {
    try {
      const result = await db.update(providerServiceFees)
        .set(data)
        .where(eq(providerServiceFees.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao atualizar taxa de prestador:', error);
      return null;
    }
  }

  async deleteProviderFee(id: number) {
    try {
      await db.delete(providerServiceFees)
        .where(eq(providerServiceFees.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar taxa de prestador:', error);
      return false;
    }
  }

  async getFinancialSettings() {
    try {
      const result = await db.select().from(paymentSettings);
      return result[0];
    } catch (error) {
      console.error('Erro ao buscar configurações financeiras:', error);
      return null;
    }
  }

  async saveFinancialSettings(data: any) {
    try {
      // Verificar se já existe configuração
      const existing = await this.getFinancialSettings();
      
      if (existing) {
        const result = await db.update(paymentSettings)
          .set(data)
          .where(eq(paymentSettings.id, existing.id))
          .returning();
        return result[0];
      } else {
        const result = await db.insert(paymentSettings).values(data).returning();
        return result[0];
      }
    } catch (error) {
      console.error('Erro ao salvar configurações financeiras:', error);
      throw error;
    }
  }

  // Métodos para reviews de prestador
  async getProviderReviews(providerId: number) {
    try {
      const result = await db.select()
        .from(reviews)
        .where(eq(reviews.providerId, providerId));
      return result;
    } catch (error) {
      console.error('Erro ao buscar reviews do prestador:', error);
      return [];
    }
  }

  // Método para atualizar usuário
  async updateUser(userId: number, updates: any) {
    try {
      const result = await db.update(users)
        .set(updates)
        .where(eq(users.id, userId))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return null;
    }
  }

  // Métodos para availability management
  async getAvailabilitiesByProviderId(providerId: number) {
    try {
      const result = await db.select()
        .from(availability)
        .where(eq(availability.providerId, providerId));
      return result;
    } catch (error) {
      console.error('Erro ao buscar availabilities do prestador:', error);
      return [];
    }
  }

  async updateAvailability(availabilityId: number, updates: any) {
    try {
      const result = await db.update(availability)
        .set(updates)
        .where(eq(availability.id, availabilityId))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao atualizar availability:', error);
      return null;
    }
  }

  async getProvider(providerId: number) {
    try {
      const result = await db.select()
        .from(users)
        .where(and(
          eq(users.id, providerId),
          eq(users.userType, 'provider')
        ));
      return result[0];
    } catch (error) {
      console.error('Erro ao buscar prestador:', error);
      return null;
    }
  }

  async getProviderAppointmentsByDate(providerId: number, date: string) {
    try {
      const result = await db.select()
        .from(appointments)
        .where(and(
          eq(appointments.providerId, providerId),
          eq(appointments.date, date)
        ));
      return result;
    } catch (error) {
      console.error('Erro ao buscar agendamentos do prestador por data:', error);
      return [];
    }
  }

  async generateTimeSlots(providerId: number, date: string, serviceId?: number) {
    try {
      // Buscar disponibilidade do prestador para o dia da semana
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();
      
      const availability = await this.getAvailabilityByDay(providerId, dayOfWeek);
      if (!availability) {
        console.log(`Nenhuma disponibilidade encontrada para o prestador ${providerId} no dia ${dayOfWeek}`);
        return [];
      }

      // Buscar agendamentos existentes para a data
      const existingAppointments = await this.getProviderAppointmentsByDate(providerId, date);
      
      // Buscar bloqueios para a data
      const blockedSlots = await this.getBlockedTimeSlotsByDate(providerId, date);

      // Gerar slots de 30 em 30 minutos no horário de trabalho
      const slots = [];
      const startTime = availability.startTime || '08:00';
      const endTime = availability.endTime || '18:00';
      
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      
      // Gerar slots a cada 30 minutos
      for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
        const slotStart = `${Math.floor(minutes / 60).toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`;
        const slotEnd = `${Math.floor((minutes + 30) / 60).toString().padStart(2, '0')}:${((minutes + 30) % 60).toString().padStart(2, '0')}`;
        
        // Verificar se o slot não conflita com agendamentos ou bloqueios
        const hasConflict = existingAppointments.some(apt => 
          (apt.startTime <= slotStart && apt.endTime > slotStart) ||
          (apt.startTime < slotEnd && apt.endTime >= slotEnd)
        ) || blockedSlots.some(block => 
          (block.startTime <= slotStart && block.endTime > slotStart) ||
          (block.startTime < slotEnd && block.endTime >= slotEnd)
        );
        
        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          isAvailable: !hasConflict,
          availabilityId: availability.id
        });
      }
      
      return slots;
    } catch (error) {
      console.error('Erro ao gerar slots de tempo:', error);
      return [];
    }
  }

  async getServiceTemplate(serviceId: number) {
    try {
      const result = await db.select()
        .from(services)
        .where(eq(services.id, serviceId));
      return result[0];
    } catch (error) {
      console.error('Erro ao buscar template de serviço:', error);
      return null;
    }
  }
}

export const storage = new DatabaseStorage();