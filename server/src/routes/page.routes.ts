import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireProjectRole } from '../middleware/project-role';
import { PageService } from '../services/page.service';
import { asyncHandler } from '../lib/errors';

export const pageRouter = Router();

const svc = new PageService();

pageRouter.use(requireAuth);

pageRouter.get(
  '/',
  requireProjectRole('viewer', 'editor', 'owner'),
  asyncHandler(async (req, res) => {
    const { page = '1', limit = '12', search = '' } = req.query as Record<string, string>;
    res.json(
      await svc.getPages(req.params.projectId, req.userId, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        search,
      }),
    );
  }),
);

pageRouter.post(
  '/',
  requireProjectRole('editor', 'owner'),
  asyncHandler(async (req, res) => {
    res.json(await svc.createPage(req.params.projectId, req.userId));
  }),
);

pageRouter.patch(
  '/:pageId',
  requireProjectRole('editor', 'owner'),
  asyncHandler(async (req, res) => {
    res.json(await svc.updatePage(req.params.projectId, req.params.pageId, req.body, req.userId));
  }),
);

pageRouter.delete(
  '/:pageId',
  requireProjectRole('editor', 'owner'),
  asyncHandler(async (req, res) => {
    res.json(await svc.deletePage(req.params.projectId, req.params.pageId, req.userId));
  }),
);

pageRouter.get(
  '/:pageId/my-role',
  requireProjectRole('viewer', 'editor', 'owner'),
  asyncHandler(async (req, res) => {
    res.json(await svc.getMyRole(req.params.pageId, req.userId));
  }),
);
