import express, { Request, Response } from "express";
import { isAdmin } from "../middleware/auth";
import { storage } from "../storage";
import { z } from "zod";
import { insertProviderServiceFeeSchema } from "../shared/schema.ts";

const router = express.Router();

// Middleware para verificar se o usuário é administrador
router.use(isAdmin);

// Obter todas as taxas de serviço por prestador
router.get("/provider-fees", async (req: Request, res: Response) => {
  try {
    const fees = await storage.getAllProviderFees();
    
    // Adicionar informações do prestador para cada taxa
    const feesWithProviderInfo = await Promise.all(fees.map(async fee => {
      const provider = await storage.getProvider(fee.providerId);
      return {
        ...fee,
        providerName: provider?.name || null,
        providerEmail: provider?.email || null
      };
    }));
    
    res.json(feesWithProviderInfo);
  } catch (error) {
    console.error("Erro ao buscar taxas de prestadores:", error);
    res.status(500).json({ error: "Erro ao buscar taxas de prestadores" });
  }
});

// Obter todos os prestadores para o dropdown de seleção
router.get("/providers", async (req: Request, res: Response) => {
  try {
    // Buscar apenas usuários com userType = 'provider'
    const providers = await storage.getUsersByType("provider");
    
    // Mapear apenas os campos necessários
    const filteredProviders = providers.map(provider => ({
      id: provider.id,
      name: provider.name || "Prestador sem nome",
      email: provider.email,
      isActive: provider.isActive,
      isVerified: provider.isVerified,
      phone: provider.phone,
      address: provider.address,
      profileImage: provider.profileImage,
      createdAt: provider.createdAt,
      userType: provider.userType
    }));
    
    res.json(filteredProviders);
  } catch (error) {
    console.error("Erro ao buscar prestadores:", error);
    res.status(500).json({ error: "Erro ao buscar prestadores" });
  }
});

// Obter uma taxa de prestador específica
router.get("/provider-fees/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    
    const fee = await storage.getProviderFee(id);
    if (!fee) {
      return res.status(404).json({ error: "Taxa de prestador não encontrada" });
    }
    
    // Adicionar informações do prestador
    const provider = await storage.getProvider(fee.providerId);
    const feeWithProvider = {
      ...fee,
      providerName: provider?.name || null,
      providerEmail: provider?.email || null
    };
    
    res.json(feeWithProvider);
  } catch (error) {
    console.error("Erro ao buscar taxa de prestador:", error);
    res.status(500).json({ error: "Erro ao buscar taxa de prestador" });
  }
});

// Atualizar uma taxa de prestador existente
router.put("/provider-fees/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    
    // Verificar se a taxa existe
    const existingFee = await storage.getProviderFee(id);
    if (!existingFee) {
      return res.status(404).json({ error: "Taxa de prestador não encontrada" });
    }
    
    // Validar os dados de entrada
    const data = await insertProviderServiceFeeSchema.parse(req.body);
    
    // Atualizar a taxa
    const updatedFee = await storage.updateProviderFee(id, data);
    res.json(updatedFee);
  } catch (error) {
    console.error("Erro ao atualizar taxa de prestador:", error);
    res.status(500).json({ error: "Erro ao atualizar taxa de prestador" });
  }
});

// Criar uma nova taxa de prestador
router.post("/provider-fees", async (req: Request, res: Response) => {
  try {
    // Validar os dados de entrada
    const data = await insertProviderServiceFeeSchema.parse(req.body);
    
    // Verificar se já existe uma taxa ativa para este prestador
    const existingFees = await storage.getAllProviderFees();
    const hasActiveFee = existingFees.some(fee => 
      fee.providerId === data.providerId && fee.isActive
    );
    
    if (hasActiveFee) {
      // Se já existe uma taxa ativa, desativamos ela antes de criar a nova
      const existingFee = existingFees.find(fee => 
        fee.providerId === data.providerId && fee.isActive
      );
      
      if (existingFee) {
        await storage.updateProviderFee(existingFee.id, { ...existingFee, isActive: false });
      }
    }
    
    // Criar a nova taxa
    const newFee = await storage.createProviderFee(data);
    res.status(201).json(newFee);
  } catch (error) {
    console.error("Erro ao criar taxa de prestador:", error);
    res.status(500).json({ error: "Erro ao criar taxa de prestador" });
  }
});

// Excluir uma taxa de prestador
router.delete("/provider-fees/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    
    // Verificar se a taxa existe
    const fee = await storage.getProviderFee(id);
    if (!fee) {
      return res.status(404).json({ error: "Taxa de prestador não encontrada" });
    }
    
    // Excluir a taxa
    await storage.deleteProviderFee(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir taxa de prestador:", error);
    res.status(500).json({ error: "Erro ao excluir taxa de prestador" });
  }
});

// Obter configurações financeiras gerais
router.get("/financial-settings", async (req: Request, res: Response) => {
  try {
    const settings = await storage.getFinancialSettings();
    res.json(settings || {});
  } catch (error) {
    console.error("Erro ao buscar configurações financeiras:", error);
    res.status(500).json({ error: "Erro ao buscar configurações financeiras" });
  }
});

// Salvar configurações financeiras gerais
router.post("/financial-settings", async (req: Request, res: Response) => {
  try {
    // Esquema de validação para as configurações financeiras
    const financialSettingsSchema = z.object({
      id: z.number().optional(),
      serviceFee: z.number().int().nonnegative(),
      fixedServiceFee: z.number().int().nonnegative(),
      minServiceFee: z.number().int().nonnegative(),
      maxServiceFee: z.number().int().nonnegative(),
      payoutSchedule: z.enum(["instant", "daily", "weekly", "monthly"]),
      
      // Stripe
      stripeEnabled: z.boolean(),
      stripeLiveMode: z.boolean(),
      stripePublicKey: z.string().optional().nullable(),
      stripeSecretKey: z.string().optional().nullable(),
      stripeWebhookSecret: z.string().optional().nullable(),
      stripeConnectEnabled: z.boolean(),
      
      // Asaas
      asaasEnabled: z.boolean(),
      asaasLiveMode: z.boolean(),
      asaasApiKey: z.string().optional().nullable(),
      asaasWebhookToken: z.string().optional().nullable(),
      asaasWalletId: z.string().optional().nullable(),
      asaasSplitEnabled: z.boolean(),
      
      // Cupons
      enableCoupons: z.boolean(),
      maxDiscountPercentage: z.number().int().min(0).max(100),
      defaultExpirationDays: z.number().int().positive(),
    });
    
    const data = financialSettingsSchema.parse(req.body);
    const savedSettings = await storage.saveFinancialSettings(data);
    
    res.json(savedSettings);
  } catch (error) {
    console.error("Erro ao salvar configurações financeiras:", error);
    res.status(500).json({ error: "Erro ao salvar configurações financeiras" });
  }
});

export default router;