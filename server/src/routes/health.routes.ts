import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'craftboard-api' });
});

healthRouter.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'up' });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(503).json({ status: 'degraded', database: 'down' });
  }
});
