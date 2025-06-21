/**
 * Rotas para relatórios administrativos
 * 
 * Este módulo implementa as rotas para relatórios e dashboards administrativos.
 */

import { Router } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { Request, Response } from 'express';

// Funções de middleware de autenticação
const isAdminOrSupport = (req: Request, res: Response, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  const user = req.user as any;
  if (user.userType !== 'admin' && user.userType !== 'support') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  next();
};

const router = Router();

// Middleware para verificar se é admin
const isAdmin = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Usuário não autenticado" });
  }
  
  const user = req.user;
  if (user?.userType === "admin" || user?.role === "admin") {
    return next();
  }
  return res.status(403).json({ error: "Acesso negado - requer permissão de administrador" });
};

/**
 * Rota para obter resumo do dashboard administrativo
 * GET /api/admin/reports/dashboard
 */
router.get('/dashboard', isAdminOrSupport, async (req: Request, res: Response) => {
  try {
    // Buscar estatísticas gerais do sistema
    const totalUsers = await storage.getUsersCount();
    const totalProviders = await storage.getUsersCount('provider');
    const totalClients = await storage.getUsersCount('client');

    // Estatísticas básicas de agendamentos
    const appointmentStats = {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      canceled: 0
    };

    // Estatísticas de serviços
    const serviceTemplates = await storage.getServiceTemplates();
    const categories = await storage.getCategories();

    // Retornar dados consolidados
    res.json({
      users: {
        total: totalUsers,
        providers: totalProviders,
        clients: totalClients
      },
      appointments: appointmentStats,
      services: {
        total: serviceTemplates.length,
        categories: categories.length
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório do dashboard:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório do dashboard' });
  }
});

// Rota para obter resumo do dashboard
router.get("/summary", isAdmin, async (req, res) => {
  try {
    console.log("Buscando dados de resumo do dashboard...");

    // Buscar contadores básicos com fallbacks
    let users, providers, clients, appointments, services;

    try {
      [users, providers, clients, appointments, services] = await Promise.all([
        db.execute(sql`SELECT COUNT(*) as count FROM users`).catch(() => ({ rows: [{ count: 0 }] })),
        db.execute(sql`SELECT COUNT(*) as count FROM users WHERE user_type = 'provider'`).catch(() => ({ rows: [{ count: 0 }] })),
        db.execute(sql`SELECT COUNT(*) as count FROM users WHERE user_type = 'client'`).catch(() => ({ rows: [{ count: 0 }] })),
        db.execute(sql`SELECT COUNT(*) as count FROM appointments`).catch(() => ({ rows: [{ count: 0 }] })),
        db.execute(sql`SELECT COUNT(*) as count FROM services`).catch(() => ({ rows: [{ count: 0 }] }))
      ]);
    } catch (error) {
      console.warn("Erro ao buscar contadores básicos, usando valores padrão:", error);
      users = providers = clients = appointments = services = { rows: [{ count: 0 }] };
    }

    // Buscar agendamentos por status
    const appointmentsByStatus = await db.execute(sql`
      SELECT status, COUNT(*) as count 
      FROM appointments 
      GROUP BY status
    `);

    // Buscar receita total (aproximada dos agendamentos confirmados)
    const revenueResult = await db.execute(sql`
      SELECT COALESCE(SUM(total_price), 0) as total_revenue
      FROM appointments 
      WHERE status IN ('confirmed', 'completed')
    `);

    // Buscar novos usuários no último mês
    const newUsersResult = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);

    const summary = {
      totalUsers: users.rows[0]?.count || 0,
      totalProviders: providers.rows[0]?.count || 0,
      totalClients: clients.rows[0]?.count || 0,
      totalAppointments: appointments.rows[0]?.count || 0,
      totalServices: services.rows[0]?.count || 0,
      totalRevenue: revenueResult.rows[0]?.total_revenue || 0,
      newUsersThisMonth: newUsersResult.rows[0]?.count || 0,
      appointmentsByStatus: appointmentsByStatus.rows.reduce((acc: any, row: any) => {
        acc[row.status] = row.count;
        return acc;
      }, {})
    };

    console.log("Resumo gerado:", summary);
    res.json(summary);
  } catch (error) {
    console.error("Erro ao obter resumo para dashboard:", error);
    res.status(500).json({ error: "Erro ao obter resumo para dashboard" });
  }
});

// Rota para obter novos usuários por dia
router.get("/new-users-by-day", isAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    console.log(`Buscando novos usuários dos últimos ${days} dias...`);

    const result = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(CASE WHEN role = 'client' THEN 1 ELSE 0 END) as clients,
        SUM(CASE WHEN role = 'provider' THEN 1 ELSE 0 END) as providers
      FROM users 
      WHERE created_at >= CURRENT_DATE - INTERVAL ${days} day
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `).catch((error) => {
      console.warn("Erro na consulta de usuários por dia:", error);
      return { rows: [] };
    });

    const data = result.rows.map((row: any) => ({
      date: row.date,
      users: parseInt(row.count),
      clients: parseInt(row.clients),
      providers: parseInt(row.providers)
    }));

    console.log(`Encontrados dados para ${data.length} dias`);
    res.json(data);
  } catch (error) {
    console.error("Erro ao obter novos usuários por dia:", error);
    res.status(500).json({ error: "Erro ao obter novos usuários por dia" });
  }
});

// Rota para obter estatísticas de agendamentos
router.get("/appointments-stats", isAdmin, async (req, res) => {
  try {
    console.log("Buscando estatísticas de agendamentos...");

    const stats = await db.execute(sql`
      SELECT 
        status,
        COUNT(*) as count,
        AVG(total_price) as avg_amount
      FROM appointments 
      GROUP BY status
    `);

    const monthlyStats = await db.execute(sql`
      SELECT 
        DATE_TRUNC('month', date) as month,
        COUNT(*) as appointments,
        SUM(total_price) as revenue
      FROM appointments 
      WHERE date >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', date)
      ORDER BY month DESC
    `);

    res.json({
      byStatus: stats.rows,
      monthly: monthlyStats.rows
    });
  } catch (error) {
    console.error("Erro ao obter estatísticas de agendamentos:", error);
    res.status(500).json({ error: "Erro ao obter estatísticas de agendamentos" });
  }
});

// Rota para obter estatísticas de serviços
router.get("/services-stats", isAdmin, async (req, res) => {
  try {
    console.log("Buscando estatísticas de serviços...");

    const topServices = await db.execute(sql`
      SELECT 
        s.name,
        COUNT(a.id) as bookings,
        AVG(a.total_price) as avg_price
      FROM services s
      LEFT JOIN appointments a ON s.id = a.service_id
      GROUP BY s.id, s.name
      ORDER BY bookings DESC
      LIMIT 10
    `);

    const servicesByCategory = await db.execute(sql`
      SELECT 
        c.name as category,
        COUNT(s.id) as service_count
      FROM categories c
      LEFT JOIN services s ON c.id = s.category_id
      GROUP BY c.id, c.name
      ORDER BY service_count DESC
    `);

    res.json({
      topServices: topServices.rows,
      byCategory: servicesByCategory.rows
    });
  } catch (error) {
    console.error("Erro ao obter estatísticas de serviços:", error);
    res.status(500).json({ error: "Erro ao obter estatísticas de serviços" });
  }
});

export default router;