import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { HttpError } from './lib/errors';

import { healthRouter } from './routes/health.routes';
import { projectRouter } from './routes/project.routes';
import { pageRouter } from './routes/page.routes';
import { usersRouter } from './routes/users.routes';
import { nodesRouter } from './routes/nodes.routes';
import { liveblocksRouter } from './routes/liveblocks.routes';
import { accessRequestsRouter } from './routes/access-requests.routes';
import { projectMembersRouter } from './routes/project-members.routes';
import { notificationsRouter } from './routes/notifications.routes';
import { dashboardRouter } from './routes/dashboard.routes';
import { invitationsRouter } from './routes/invitations.routes';
import { accessRouter } from './routes/access.routes';
import { searchRouter } from './routes/search.routes';
import { aiRouter } from './routes/ai.routes';
import { captureMountParams } from './middleware/mount-params';

export function createApp() {
  const app = express();

  app.use(express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  }));
  app.use(cookieParser());
  app.use(helmet());

  // Global guardrail: 300 req / 15 min per IP. The real protection for
  // sensitive routes comes from the stricter limiters applied per-router.
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
      message: { statusCode: 429, message: 'Too many requests, try again later.' },
      // Liveblocks storage webhooks can burst during active collaboration;
      // they are already authenticated by signature, so skip them here.
      // Socket.IO uses authenticated HTTP long-polling + websocket upgrades,
      // which otherwise burn the per-IP budget for the whole API.
      skip: (req) =>
        req.path === '/webhooks/liveblocks' || req.path.startsWith('/socket.io'),
    }),
  );

  const allowedOrigins = (
    process.env.FRONTEND_URLS ?? process.env.FRONTEND_URL ?? ''
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) callback(null, true);
        else callback(new HttpError(403, 'Origin not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  const swaggerDocument = {
    openapi: '3.0.0',
    info: {
      title: 'Canvazz Flow API',
      description: 'API documentation for the Canvazz Flow application',
      version: '1.0',
    },
    paths: {},
  };
  app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.use('/', healthRouter);
  app.use('/project', projectRouter);
  app.use('/project/:projectId/pages', captureMountParams('/project/:projectId/pages'));
  app.use('/project/:projectId/pages', pageRouter);
  app.use('/users', usersRouter);
  app.use('/', nodesRouter);
  app.use('/liveblocks', liveblocksRouter);
  app.use('/access-requests', accessRequestsRouter);
  app.use('/projects/:projectId/members', captureMountParams('/projects/:projectId/members'));
  app.use('/projects/:projectId/members', projectMembersRouter);
  app.use('/notifications', notificationsRouter);
  app.use('/dashboard', dashboardRouter);
  app.use('/', invitationsRouter);
  app.use('/access', accessRouter);
  app.use('/search', searchRouter);
  app.use('/ai', aiRouter);

  // 404 for unknown routes (mirrors Nest's NotFoundException default).
  app.use((req, res) => {
    res.status(404).json({ statusCode: 404, message: 'Not Found' });
  });

  // Global error handler (mirrors NestJS default exception filter).
  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      if (err instanceof HttpError) {
        return res
          .status(err.status)
          .json({ statusCode: err.status, message: err.message });
      }
      console.error(err);
      res.status(500).json({ statusCode: 500, message: 'Internal Server Error' });
    },
  );

  return app;
}
