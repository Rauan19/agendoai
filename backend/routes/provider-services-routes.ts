/**
 * Rotas para gerenciamento de serviços personalizados de prestadores
 *
 * Este módulo implementa as rotas para gerenciar os serviços personalizados
 * e seus tempos de execução específicos para cada prestador.
 */

import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { storage } from "../storage";
import {
  insertProviderServiceSchema,
  type ProviderService,
} from "../shared/schema.ts";
import { db } from "../db";
import { sql } from "drizzle-orm";
import {
  withRetry,
  withFallback,
  withCache,
  withCacheAndFallback,
  clearCache,
  clearAllCache,
} from "../utils/resilience-utils";

// Middleware para verificar se o usuário está autenticado
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  console.log(
    "Verificando autenticação:",
    req.isAuthenticated(),
    req.user?.id,
    req.user?.userType,
  );

  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Não autorizado" });
};

// Middleware para verificar se o usuário é um prestador
const isProvider = (req: Request, res: Response, next: NextFunction) => {
  console.log("Verificando se é prestador:", req.user?.id, req.user?.userType);

  if (req.user && req.user.userType === "provider") {
    return next();
  }
  return res
    .status(403)
    .json({ error: "Acesso permitido apenas para prestadores de serviço" });
};

// Garantindo que req.user está disponível em TypeScript
declare global {
  namespace Express {
    interface User {
      id: number;
      userType: string;
      [key: string]: any;
    }
  }
}

const router = Router();

/**
 * Rota para obter todos os serviços de um prestador específico
 * GET /api/provider-services/provider/:providerId
 */
router.get("/provider/:providerId", isAuthenticated, async (req, res) => {
  try {
    const providerId = parseInt(req.params.providerId);

    // Buscar serviços personalizados do prestador
    const providerServices =
      await storage.getProviderServicesByProvider(providerId);

    // Enriquecer com detalhes dos serviços
    const enrichedServices = await Promise.all(
      providerServices.map(async (ps: ProviderService) => {
        try {
          // Buscar informações do serviço
          const service = await storage.getService(ps.serviceId);
          if (service) {
            const category = await storage.getCategory(service.categoryId);
            const niche = category
              ? await storage.getNiche(category.nicheId)
              : null;
            const dataToRetun = {
              ...ps,
              serviceName: service.name,
              serviceDescription: service.description,
              categoryId: service.categoryId,
              categoryName: category?.name || "Categoria não encontrada",
              nicheId: category?.nicheId || null,
              nicheName: niche?.name || "Especialidade não encontrada",
            };
            return dataToRetun;
          }

          // Se não encontrou o serviço
          return {
            ...ps,
            serviceName: "Serviço não encontrado",
            serviceDescription: "Este serviço não está mais disponível",
            categoryId: null,
            categoryName: "Categoria não encontrada",
            nicheId: null,
            nicheName: "Especialidade não encontrada",
          };
        } catch (error) {
          console.error(`Erro ao enriquecer serviço ${ps.id}:`, error);
          return {
            ...ps,
            serviceName: "Erro ao buscar serviço",
            serviceDescription:
              "Ocorreu um erro ao buscar detalhes deste serviço",
            categoryId: null,
            categoryName: "Indisponível",
            nicheId: null,
            nicheName: "Indisponível",
          };
        }
      }),
    );

    return res.json(enrichedServices);
  } catch (error) {
    console.error("Erro ao buscar serviços do prestador:", error);
    return res
      .status(500)
      .json({ error: "Erro ao buscar serviços do prestador" });
  }
});

/**
 * Rota para adicionar um serviço do catálogo ao portfólio do prestador
 * POST /api/provider-services
 */
router.post("/", isAuthenticated, isProvider, async (req, res) => {
  try {
    // Usar ID do usuário autenticado ou o enviado no corpo da requisição (para testes)
    const providerId = req.user?.id || req.body.providerId;

    if (!providerId) {
      return res.status(400).json({ error: "ID do prestador não informado" });
    }

    console.log(
      "Adicionando serviço ao portfólio do prestador:",
      providerId,
      req.body,
    );

    // Obter dados essenciais da requisição
    const { serviceId, executionTime, price, breakTime } = req.body;

    // Validar dados obrigatórios
    if (!serviceId || !executionTime || price === undefined) {
      return res.status(400).json({
        error: "Dados incompletos. Forneça serviceId, executionTime e price.",
      });
    }

    // Normalizar dados para o formato esperado
    const data = {
      providerId: Number(providerId),
      serviceId: Number(serviceId),
      executionTime: Number(executionTime),
      price: Number(price),
      breakTime: breakTime ? Number(breakTime) : 0,
      duration: Number(executionTime) + (breakTime ? Number(breakTime) : 0),
    };

    console.log("Dados formatados para adicionar serviço:", data);

    // Verificar se o serviço existe
    const service = await storage.getService(data.serviceId);

    if (!service) {
      return res.status(404).json({ error: "Serviço não encontrado" });
    }

    console.log(`Serviço encontrado: "${service.name}"`);

    // Verificar se já existe este serviço no portfólio do prestador
    const existingProviderService = await storage.getProviderServiceByService(
      data.providerId,
      data.serviceId,
    );

    let providerService;

    if (existingProviderService) {
      // Atualizar serviço existente
      console.log(
        `Atualizando serviço existente ID: ${existingProviderService.id}`,
      );
      providerService = await storage.updateProviderService(
        existingProviderService.id,
        {
          executionTime: data.executionTime,
          price: data.price,
          duration: data.duration,
          breakTime: data.breakTime,
          isActive: true,
        },
      );
    } else {
      // Criar novo serviço no portfólio
      console.log(`Criando novo serviço personalizado para: ${service.name}`);
      providerService = await storage.createProviderService({
        providerId: data.providerId,
        serviceId: data.serviceId,
        executionTime: data.executionTime,
        price: data.price,
        duration: data.duration,
        breakTime: data.breakTime,
        isActive: true,
      });
    }

    // Buscar categoria e nicho
    let category = null;
    let niche = null;

    try {
      category = await storage.getCategory(service.categoryId);
      if (category && category.nicheId) {
        niche = await storage.getNiche(category.nicheId);
      }
    } catch (error) {
      console.warn("Erro ao buscar categoria/nicho:", error);
    }

    // Limpar cache
    clearCache(`provider-services-${providerId}`);

    // Retornar resposta enriquecida
    return res.status(201).json({
      ...providerService,
      serviceName: service.name,
      serviceDescription: service.description,
      categoryId: service.categoryId,
      categoryName: category?.name || "Categoria não encontrada",
      nicheId: category?.nicheId || null,
      nicheName: niche?.name || "Especialidade não encontrada",
      isCustomized: true,
      addedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro ao adicionar serviço ao portfólio:", error);
    return res.status(500).json({
      error: "Erro ao adicionar serviço ao portfólio",
      details: error?.message || "Erro desconhecido",
    });
  }
});

/**
 * Rota para atualizar um serviço personalizado
 * PATCH /api/provider-services/:id
 */
router.patch("/:id", isAuthenticated, isProvider, async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);
    const providerId = req.user?.id;

    if (!providerId) {
      return res
        .status(401)
        .json({ error: "Não autorizado. ID do prestador não encontrado." });
    }

    // Verificar se o serviço pertence ao prestador
    const existingService = await storage.getProviderService(serviceId);

    if (!existingService) {
      return res
        .status(404)
        .json({ error: "Serviço personalizado não encontrado" });
    }

    if (existingService.providerId !== providerId) {
      return res
        .status(403)
        .json({ error: "Você não tem permissão para editar este serviço" });
    }

    // Validar dados da requisição
    const updateData = req.body;

    // Atualizar o serviço
    const updatedService = await storage.updateProviderService(
      serviceId,
      updateData,
    );

    // Limpar cache
    clearCache(`provider-services-${providerId}`);

    return res.json(updatedService);
  } catch (error) {
    console.error("Erro ao atualizar serviço personalizado:", error);
    return res
      .status(500)
      .json({ error: "Erro ao atualizar serviço personalizado" });
  }
});

/**
 * Rota para excluir um serviço personalizado
 * DELETE /api/provider-services/:id
 */
router.delete("/:id", isAuthenticated, isProvider, async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);
    const providerId = req.user?.id;

    if (!providerId) {
      return res
        .status(401)
        .json({ error: "Não autorizado. ID do prestador não encontrado." });
    }

    // Verificar se o serviço pertence ao prestador
    const existingService = await storage.getProviderService(serviceId);

    if (!existingService) {
      return res
        .status(404)
        .json({ error: "Serviço personalizado não encontrado" });
    }

    if (existingService.providerId !== providerId) {
      return res
        .status(403)
        .json({ error: "Você não tem permissão para excluir este serviço" });
    }

    // Excluir o serviço
    await storage.deleteProviderService(serviceId);

    // Limpar cache
    clearCache(`provider-services-${providerId}`);

    return res.json({ message: "Serviço personalizado excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir serviço personalizado:", error);
    return res
      .status(500)
      .json({ error: "Erro ao excluir serviço personalizado" });
  }
});

export default router;