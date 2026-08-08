import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { DashboardService } from '../services/dashboard.service';
import { asyncHandler } from '../lib/errors';

export const dashboardRouter = Router();

const svc = new DashboardService();

dashboardRouter.use(requireAuth);

dashboardRouter.get('/', asyncHandler(async (req, res) => {
  res.json(await svc.getDashboard(req.userId));
}));
