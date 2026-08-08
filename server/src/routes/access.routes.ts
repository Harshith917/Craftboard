import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { AccessService } from '../services/access.service';
import { asyncHandler } from '../lib/errors';

export const accessRouter = Router();

const svc = new AccessService();

accessRouter.use(requireAuth);

accessRouter.get('/incoming', asyncHandler(async (req, res) => {
  res.json(await svc.getIncoming(req.userId));
}));

accessRouter.get('/outgoing', asyncHandler(async (req, res) => {
  res.json(await svc.getOutgoing(req.userId));
}));

accessRouter.get('/history', asyncHandler(async (req, res) => {
  const filter = (req.query.filter as string) || undefined;
  res.json(await svc.getHistory(req.userId, filter));
}));

accessRouter.get('/count', asyncHandler(async (req, res) => {
  res.json(await svc.getBadgeCount(req.userId));
}));
