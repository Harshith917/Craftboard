import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { SearchService } from '../services/search.service';
import { asyncHandler } from '../lib/errors';

export const searchRouter = Router();

const svc = new SearchService();

searchRouter.use(requireAuth);

searchRouter.get('/', asyncHandler(async (req, res) => {
  const q = (req.query.q as string) || '';
  res.json(await svc.search(req.userId, q));
}));
