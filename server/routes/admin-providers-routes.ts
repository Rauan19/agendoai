import express, { Request, Response } from "express";
import { isAdmin } from "../middleware/auth";
import { storage } from "../storage";

const router = express.Router();

// Middleware para verificar se o usuário é administrador
router.use(isAdmin);

// Rota específica para buscar prestadores na página de administração
router.get("/", async (req: Request, res: Response) => {
  try {
    console.log("Buscando prestadores para página de administração...");

    // Buscar apenas usuários com userType = 'provider'
    const providers = await storage.getUsersByType("provider");
    console.log(`Encontrados ${providers.length} prestadores`);

    // Enriquecer os dados com informações adicionais
    const enrichedProviders = await Promise.all(providers.map(async (provider) => {
      try {
        // Buscar configurações do prestador
        const settings = await storage.getProviderSettings(provider.id);

        // Buscar avaliações para calcular média
        const reviews = await storage.getProviderReviews(provider.id);
        let averageRating = 0;
        if (reviews.length > 0) {
          averageRating = reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) / reviews.length;
        }

        // Buscar agendamentos do prestador
        const appointments = await storage.getAppointmentsByProviderId(provider.id);
        const completedAppointments = appointments.filter((apt: any) => apt.status === 'completed').length;
        const canceledAppointments = appointments.filter((apt: any) => apt.status === 'cancelled').length;

        // Buscar serviços do prestador
        const services = await storage.getServicesByProvider(provider.id);

        return {
          ...provider,
          providerData: {
            rating: averageRating > 0 ? Math.round(averageRating * 20) : null, // Converter para escala 0-100
            isOnline: settings?.isOnline || false,
            businessName: settings?.businessName || null,
            totalAppointments: appointments.length,
            servicesCount: services.length,
            completedAppointments,
            canceledAppointments,
            address: provider.address,
            bio: settings?.bio || null,
            joinedAt: provider.createdAt,
            lastActive: settings?.lastActive || provider.createdAt,
            avgResponseTime: null,
            categories: [] // Será implementado quando necessário
          }
        };
      } catch (error) {
        console.error(`Erro ao enriquecer dados do prestador ${provider.id}:`, error);
        return {
          ...provider,
          providerData: {
            rating: null,
            isOnline: false,
            businessName: null,
            totalAppointments: 0,
            servicesCount: 0,
            completedAppointments: 0,
            canceledAppointments: 0,
            address: provider.address,
            bio: null,
            joinedAt: provider.createdAt,
            lastActive: provider.createdAt,
            avgResponseTime: null,
            categories: []
          }
        };
      }
    }));

    res.json(enrichedProviders);
  } catch (error) {
    console.error("Erro ao buscar prestadores:", error);
    res.status(500).json({ error: "Erro ao buscar prestadores" });
  }
});

export default router;