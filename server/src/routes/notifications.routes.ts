import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { NotificationsService } from '../services/notifications.service';
import { asyncHandler } from '../lib/errors';

export const notificationsRouter = Router();

const svc = new NotificationsService();

notificationsRouter.use(requireAuth);

notificationsRouter.get('/', asyncHandler(async (req, res) => {
  const { page, limit, filter, search, type } = req.query as Record<string, string>;
  res.json(
    await svc.findByUser(req.userId, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      filter,
      search,
      type,
    }),
  );
}));

notificationsRouter.get('/unread-count', asyncHandler(async (req, res) => {
  res.json(await svc.unreadCount(req.userId));
}));

notificationsRouter.patch('/read-all', asyncHandler(async (req, res) => {
  res.json(await svc.markAllAsRead(req.userId));
}));

notificationsRouter.patch('/:id/read', asyncHandler(async (req, res) => {
  res.json(await svc.markAsRead(req.userId, req.params.id));
}));

notificationsRouter.delete('/:id', asyncHandler(async (req, res) => {
  res.json(await svc.delete(req.userId, req.params.id));
}));
