import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { AIService } from '../services/ai.service';
import { asyncHandler } from '../lib/errors';
import { BadRequestException } from '../lib/errors';

export const aiRouter = Router();

const ai = new AIService();

aiRouter.use(requireAuth);

aiRouter.get('/status', asyncHandler(async (_req, res) => {
  res.json(await ai.getStatus());
}));

aiRouter.post('/generate', asyncHandler(async (req, res) => {
  const prompt = typeof req.body?.prompt === 'string'
    ? req.body.prompt.trim()
    : '';
  if (!prompt) throw new BadRequestException('Prompt is required');
  if (prompt.length > 2000) {
    throw new BadRequestException('Prompt is too long (max 2000 chars)');
  }
  res.json(await ai.generateShapes(prompt));
}));

aiRouter.post('/assist', asyncHandler(async (req, res) => {
  const prompt = typeof req.body?.prompt === 'string'
    ? req.body.prompt.trim()
    : '';
  if (!prompt) throw new BadRequestException('Prompt is required');
  if (prompt.length > 2000) {
    throw new BadRequestException('Prompt is too long (max 2000 chars)');
  }
  const context =
    req.body?.context && typeof req.body.context === 'object'
      ? req.body.context
      : {};
  res.json(await ai.assist(prompt, context));
}));
