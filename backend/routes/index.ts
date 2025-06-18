import { Router, Express } from "express";
import { adminRouter } from "./admin-routes";
import { providerAvailabilityRouter } from './provider-availability-routes';
import providerServicesRoutes from './provider-services-routes';
import servicesRoutes from './services-routes';
import { backupService } from '../services/backup-service';
import { join } from 'path';

// Main application routes
const appRouter = Router();

// Use admin routes
appRouter.use("/admin", adminRouter);

// Provider availability routes
appRouter.use('/api', providerAvailabilityRouter);

// Placeholder for other routes (e.g., services, provider services) - adapt based on actual app structure
// appRouter.use("/services", servicesRoutes);
// appRouter.use("/provider-services", providerServicesRoutes);

export { appRouter, adminRouter };