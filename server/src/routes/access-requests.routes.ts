import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireProjectRole } from '../middleware/project-role';
import { AccessRequestsService } from '../services/access-requests.service';
import { asyncHandler } from '../lib/errors';

export const accessRequestsRouter = Router();

const svc = new AccessRequestsService();

accessRequestsRouter.use(requireAuth);

accessRequestsRouter.post('/', asyncHandler(async (req, res) => {
  res.json(await svc.create(req.userId, req.body.projectId, req.body.message));
}));

accessRequestsRouter.patch('/:id/respond', asyncHandler(async (req, res) => {
  res.json(await svc.respondWithReason(req.params.id, req.userId, req.body.approved, req.body.reason));
}));

accessRequestsRouter.post('/bulk-respond', asyncHandler(async (req, res) => {
  res.json(await svc.bulkRespond(req.userId, req.body.ids, req.body.approved));
}));

accessRequestsRouter.post('/:id/cancel', asyncHandler(async (req, res) => {
  res.json(await svc.cancel(req.userId, req.params.id));
}));

accessRequestsRouter.get('/', asyncHandler(async (req, res) => {
  const { status, search, sort, order, page, limit } = req.query as Record<string, string>;
  res.json(
    await svc.findAll(req.userId, {
      status,
      search,
      sort,
      order: order as 'asc' | 'desc',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    }),
  );
}));

accessRequestsRouter.get('/pending', asyncHandler(async (req, res) => {
  res.json(await svc.getAllPendingForOwner(req.userId));
}));

accessRequestsRouter.get(
  '/project/:projectId/pending',
  requireProjectRole('owner'),
  asyncHandler(async (req, res) => {
    res.json(await svc.getPendingForProject(req.params.projectId));
  }),
);

accessRequestsRouter.get('/mine', asyncHandler(async (req, res) => {
  res.json(await svc.myRequests(req.userId));
}));

accessRequestsRouter.get('/:id', asyncHandler(async (req, res) => {
  res.json(await svc.findOne(req.params.id, req.userId));
}));
