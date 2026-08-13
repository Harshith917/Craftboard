import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireProjectRole } from '../middleware/project-role';
import { ProjectsService } from '../services/project.service';
import { asyncHandler } from '../lib/errors';

export const projectRouter = Router();

const svc = new ProjectsService();

projectRouter.use(requireAuth);

projectRouter.get('/', asyncHandler(async (req, res) => {
  const { page, limit, search, sort, filter, favoriteIds } = req.query as Record<string, string>;
  const result = await svc.findAll(req.userId, {
    search,
    sort,
    filter,
    favoriteIds: favoriteIds?.split(',').filter(Boolean),
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 12,
  });
  res.json(result);
}));

projectRouter.get('/search', asyncHandler(async (req, res) => {
  const q = (req.query.q as string) || '';
  res.json(await svc.searchProjects(req.userId, q));
}));

projectRouter.get('/public/:id', asyncHandler(async (req, res) => {
  res.json(await svc.getPublicProject(req.params.id, req.userId));
}));

projectRouter.get(
  '/:id',
  requireProjectRole('viewer', 'editor', 'owner'),
  asyncHandler(async (req, res) => {
    res.json(await svc.getProject(req.params.id, req.userId));
  }),
);

projectRouter.post('/', asyncHandler(async (req, res) => {
  res.json(await svc.createProject(req.userId, req.body));
}));

projectRouter.patch(
  '/:id',
  requireProjectRole('owner'),
  asyncHandler(async (req, res) => {
    res.json(await svc.updateProject(req.params.id, req.userId, req.body));
  }),
);

projectRouter.delete(
  '/:id',
  requireProjectRole('owner'),
  asyncHandler(async (req, res) => {
    res.json(await svc.deleteProject(req.params.id, req.userId));
  }),
);

projectRouter.post('/membership/:membershipId/toggle-favorite', asyncHandler(async (req, res) => {
  res.json(await svc.toggleFavorite(req.params.membershipId, req.userId));
}));

projectRouter.post('/membership/:membershipId/toggle-archive', asyncHandler(async (req, res) => {
  res.json(await svc.toggleArchive(req.params.membershipId, req.userId));
}));

projectRouter.post(
  '/:id/record-open',
  requireProjectRole('viewer', 'editor', 'owner'),
  asyncHandler(async (req, res) => {
    res.json(await svc.recordOpen(req.params.id, req.userId));
  }),
);

projectRouter.get(
  '/:id/settings',
  requireProjectRole('viewer', 'editor', 'owner'),
  asyncHandler(async (req, res) => {
    res.json(await svc.getSettings(req.params.id, req.userId));
  }),
);

projectRouter.post('/:id/toggle-archive', asyncHandler(async (req, res) => {
  res.json(await svc.toggleArchiveByProject(req.params.id, req.userId));
}));

projectRouter.post('/:id/toggle-pin', asyncHandler(async (req, res) => {
  res.json(await svc.togglePin(req.params.id, req.userId));
}));

projectRouter.post(
  '/:id/pages/:pageId/visit',
  requireProjectRole('viewer', 'editor', 'owner'),
  asyncHandler(async (req, res) => {
    res.json(await svc.recordPageVisit(req.params.pageId, req.params.id, req.userId));
  }),
);

projectRouter.get('/:id/recent-pages', asyncHandler(async (req, res) => {
  res.json(await svc.getRecentPages(req.userId));
}));

projectRouter.post(
  '/:id/transfer-ownership',
  requireProjectRole('owner'),
  asyncHandler(async (req, res) => {
    res.json(await svc.transferOwnership(req.params.id, req.body.userId, req.userId));
  }),
);
