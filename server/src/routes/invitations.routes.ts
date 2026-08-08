import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { InvitationsService } from '../services/invitations.service';
import { asyncHandler } from '../lib/errors';

export const invitationsRouter = Router();

const svc = new InvitationsService();

invitationsRouter.use(requireAuth);

invitationsRouter.get('/users/search', asyncHandler(async (req, res) => {
  const { q = '', projectId } = req.query as Record<string, string>;
  res.json(await svc.searchUsers(q, req.userId, projectId));
}));

invitationsRouter.post('/projects/:projectId/invite/email', asyncHandler(async (req, res) => {
  const b = req.body;
  res.json(await svc.inviteByEmail(req.params.projectId, req.userId, b.email, b.role || 'editor', b.message, b.expiresInHours));
}));

invitationsRouter.post('/projects/:projectId/invite/user', asyncHandler(async (req, res) => {
  const b = req.body;
  res.json(await svc.inviteByUser(req.params.projectId, req.userId, b.userId, b.role || 'editor', b.message, b.expiresInHours));
}));

invitationsRouter.post('/projects/:projectId/invite/link', asyncHandler(async (req, res) => {
  const b = req.body;
  res.json(await svc.generateLink(req.params.projectId, req.userId, b.role || 'editor', b.oneTime ?? false, b.expiresInHours));
}));

invitationsRouter.get('/projects/:projectId/invitations', asyncHandler(async (req, res) => {
  res.json(await svc.listForProject(req.params.projectId, req.userId));
}));

invitationsRouter.get('/invitations/:token', asyncHandler(async (req, res) => {
  res.json(await svc.getByToken(req.params.token, req.userId));
}));

invitationsRouter.post('/invitations/:token/accept', asyncHandler(async (req, res) => {
  res.json(await svc.accept(req.params.token, req.userId));
}));

invitationsRouter.post('/invitations/:token/decline', asyncHandler(async (req, res) => {
  res.json(await svc.decline(req.params.token, req.userId));
}));

invitationsRouter.post('/invitations/:id/cancel', asyncHandler(async (req, res) => {
  res.json(await svc.cancel(req.params.id, req.userId));
}));

invitationsRouter.post('/invitations/:id/resend', asyncHandler(async (req, res) => {
  res.json(await svc.resend(req.params.id, req.userId));
}));

invitationsRouter.get('/me/invitations', asyncHandler(async (req, res) => {
  res.json(await svc.listMyPending(req.userId));
}));

invitationsRouter.get('/me/invitations/sent', asyncHandler(async (req, res) => {
  res.json(await svc.listSentInvitations(req.userId));
}));
