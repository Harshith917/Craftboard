import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { verifyToken } from '@clerk/backend';

// Singleton Socket.IO server attached to the same HTTP server, replacing the
// NestJS @WebSocketGateway. Event names and auth behavior are preserved.
let io: Server | null = null;

const userSockets = new Map<string, Set<string>>();

function allowedOrigins(): string[] {
  return (process.env.FRONTEND_URLS ?? process.env.FRONTEND_URL ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

export function initGateway(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins(),
      credentials: true,
    },
  });

  io.on('connection', async (client) => {
    const token = client.handshake.auth?.token as string | undefined;

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });
      const userId = payload.sub;
      client.data.userId = userId;

      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId)!.add(client.id);
    } catch {
      client.disconnect();
    }

    client.on('disconnect', () => {
      const userId = client.data.userId as string;
      if (!userId) return;
      const sockets = userSockets.get(userId);
      if (!sockets) return;
      sockets.delete(client.id);
      if (sockets.size === 0) userSockets.delete(userId);
    });

    // Empty handler preserved for client compatibility (was @SubscribeMessage('register')).
    client.on('register', () => {});
  });

  return io;
}

export function getGateway(): Server | null {
  return io;
}

export function notifyUser(userId: string, event: string, payload: unknown) {
  if (!io) return;
  const sockets = userSockets.get(userId);
  if (!sockets) return;
  for (const sid of sockets) {
    io.to(sid).emit(event, payload);
  }
}

export function broadcastToAll(event: string, payload: unknown) {
  if (!io) return;
  io.emit(event, payload);
}

export function broadcastToCollaborators(userId: string, event: string, payload: unknown) {
  if (!io) return;
  const sockets = userSockets.get(userId);
  if (!sockets) return;
  for (const sid of sockets) {
    io.to(sid).emit(event, payload);
  }
}
