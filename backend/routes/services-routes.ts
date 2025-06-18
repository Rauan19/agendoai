
import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

/**
 * Rota para obter todos os serviços criados pelo administrador
 * GET /api/services
 */
router.get('/', async (req, res) => {
  try {
    console.log('Buscando serviços da tabela services...');
    
    // Buscar todos os serviços da tabela services
    const services = await storage.getServices();
    
    console.log(`Encontrados ${services.length} serviços na tabela services`);
    
    // Na tabela services, TODOS os serviços são criados pelo admin
    // Filtrar apenas por status ativo
    const adminServices = services.filter((service: any) => {
      const isActive = service.isActive !== false;
      return isActive;
    });
    
    console.log(`Serviços ativos do admin: ${adminServices.length}`);
    console.log('Serviços do admin:', adminServices.map(s => ({ id: s.id, name: s.name, providerId: s.providerId })));
    
    return res.json(adminServices);
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    return res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

/**
 * Rota para obter um serviço específico
 * GET /api/services/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);
    
    if (isNaN(serviceId)) {
      return res.status(400).json({ error: 'ID do serviço inválido' });
    }
    
    const service = await storage.getService(serviceId);
    
    if (!service) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    
    return res.json(service);
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    return res.status(500).json({ error: 'Erro ao buscar serviço' });
  }
});

export default router;
