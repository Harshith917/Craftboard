import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { LiveblocksService } from '../services/liveblocks.service';
import { asyncHandler } from '../lib/errors';

export const liveblocksRouter = Router();

const liveblocksService = new LiveblocksService();

liveblocksRouter.post(
  '/auth',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { status, body } = await liveblocksService.authorizeUser(
      req.userId,
      req.body.room,
    );
    res.status(status).json(body);
  }),
);
