
import { Router } from 'express';
import { z } from 'zod';
import { timeSlotGenerator } from '../time-slot-generator';
import express from 'express';
import { storage } from '../storage';
import { createLogger } from '../logger';

const logger = createLogger('ProviderAvailability');
const router = express.Router();

// Middleware para verificar autenticação
function isAuthenticated(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Não autorizado' });
}

const availabilityParamsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  serviceDuration: z.number().positive(),
});

const validateProviderAvailabilityParams = (req: any, res: any, next: any) => {
  try {
    const { date, serviceDuration } = req.query;
    availabilityParamsSchema.parse({
      date,
      serviceDuration: Number(serviceDuration)
    });
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid parameters' });
  }
};

// Slot generation route
router.get('/:id/availability', 
  validateProviderAvailabilityParams,
  async (req, res) => {
    try {
      const providerId = Number(req.params.id);
      const date = new Date(req.query.date as string);
      const duration = Number(req.query.serviceDuration);

      const slots = await timeSlotGenerator.generateSlots(providerId, date, duration);
      res.json({ slots });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate availability slots' });
    }
  }
);

// GET /api/availability/provider/:providerId - Buscar disponibilidade semanal
router.get('/provider/:providerId', async (req, res) => {
  try {
    const providerId = parseInt(req.params.providerId);
    
    if (!providerId) {
      return res.status(400).json({ error: 'ID do prestador é obrigatório' });
    }

    // Buscar disponibilidade para todos os dias da semana
    const weeklyAvailability = [];
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const availability = await storage.getAvailabilityByDay(providerId, dayOfWeek);
      if (availability) {
        weeklyAvailability.push({
          ...availability,
          dayOfWeek,
          dayName: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dayOfWeek],
        });
      } else {
        // Se não há disponibilidade configurada, criar um padrão indisponível
        weeklyAvailability.push({
          id: null,
          providerId,
          dayOfWeek,
          dayName: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dayOfWeek],
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: false,
          intervalMinutes: 30,
          date: null
        });
      }
    }

    return res.json(weeklyAvailability);
  } catch (error) {
    logger.error('Erro ao buscar disponibilidade do prestador:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/availability/weekly - Salvar disponibilidade semanal
router.post('/weekly', isAuthenticated, async (req, res) => {
  try {
    const { providerId, weeklySchedule } = req.body;
    
    if (!providerId || !weeklySchedule) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    // Verificar se o usuário pode editar a disponibilidade
    if (req.user!.userType !== 'admin' && req.user!.id !== providerId) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    // Salvar disponibilidade para cada dia
    const results = [];
    for (const daySchedule of weeklySchedule) {
      const result = await storage.saveAvailability({
        providerId,
        dayOfWeek: daySchedule.dayOfWeek,
        startTime: daySchedule.startTime,
        endTime: daySchedule.endTime,
        isAvailable: daySchedule.isAvailable,
        intervalMinutes: daySchedule.intervalMinutes || 15
      });
      results.push(result);
    }

    return res.json({ 
      success: true, 
      message: 'Disponibilidade salva com sucesso',
      results 
    });
  } catch (error) {
    logger.error('Erro ao salvar disponibilidade:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/blocked-times/provider/:providerId - Buscar bloqueios
router.get('/blocked-times/provider/:providerId', async (req, res) => {
  try {
    const providerId = parseInt(req.params.providerId);
    const date = req.query.date as string;
    
    if (!providerId) {
      return res.status(400).json({ error: 'ID do prestador é obrigatório' });
    }

    let blockedTimes = [];
    if (date) {
      // Buscar bloqueios para data específica
      blockedTimes = await storage.getBlockedTimeSlotsByDate(providerId, date);
    } else {
      // Buscar todos os bloqueios futuros
      const today = new Date().toISOString().split('T')[0];
      blockedTimes = await storage.getBlockedTimeSlotsFromDate(providerId, today);
    }

    return res.json({ blockedTimes });
  } catch (error) {
    logger.error('Erro ao buscar bloqueios:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export { router as providerAvailabilityRouter };
export default router;
