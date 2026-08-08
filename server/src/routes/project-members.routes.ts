import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireProjectRole } from '../middleware/project-role';
import { ProjectMembersService } from '../services/project-members.service';
import { asyncHandler } from '../lib/errors';

export const projectMembersRouter = Router();

const svc = new ProjectMembersService();

projectMembersRouter.use(requireAuth);
projectMembersRouter.use(requireProjectRole('viewer', 'editor', 'owner'));

projectMembersRouter.get('/', asyncHandler(async (req, res) => {
  res.json(await svc.list(req.params.projectId));
}));

projectMembersRouter.get('/my-role', asyncHandler(async (req, res) => {
  res.json(await svc.getMyRole(req.params.projectId, req.userId));
}));

projectMembersRouter.patch(
  '/:userId/role',
  requireProjectRole('owner'),
  asyncHandler(async (req, res) => {
    res.json(await svc.updateRole(req.params.projectId, req.params.userId, req.body.role, req.userId));
  }),
);

projectMembersRouter.delete('/:userId', asyncHandler(async (req, res) => {
  res.json(await svc.remove(req.params.projectId, req.params.userId, req.userId));
}));
