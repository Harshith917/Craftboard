import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireProjectRole } from '../middleware/project-role';
import { NodesService } from '../services/nodes.service';
import { LiveblocksService } from '../services/liveblocks.service';
import { asyncHandler } from '../lib/errors';

export const nodesRouter = Router();

const svc = new NodesService();
const liveblocksService = new LiveblocksService();

nodesRouter.get(
  '/pages/:pageId/nodes',
  requireAuth,
  requireProjectRole('viewer', 'editor', 'owner'),
  asyncHandler(async (req, res) => {
    res.json(await svc.getNodes(req.params.pageId, req.userId));
  }),
);

nodesRouter.post(
  '/pages/:pageId/nodes',
  requireAuth,
  requireProjectRole('editor', 'owner'),
  asyncHandler(async (req, res) => {
    res.json(await svc.saveNodes(req.params.pageId, req.body.nodes, req.userId));
  }),
);

nodesRouter.post('/webhooks/liveblocks', asyncHandler(async (req, res) => {
  const event = liveblocksService.verifyWebhook(
    (req as any).rawBody,
    req.headers as Record<string, string>,
  );

  if (event.type !== 'storageUpdated') return res.json({ ok: true });

  const pageId = liveblocksService.extractPageId(event.data.roomId);
  if (!pageId) return res.json({ ok: true });

  const nodesMap = (event.data as any).storage?.nodes as
    | Record<string, any>
    | undefined;
  if (!nodesMap) return res.json({ ok: true });

  const nodes = Object.values(nodesMap);

  await svc.saveNodesFromWebhook(pageId, nodes);

  return res.json({ ok: true });
}));
