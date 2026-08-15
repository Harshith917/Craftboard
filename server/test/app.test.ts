import 'dotenv/config';
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

process.env.LIVEBLOCKS_WEBHOOK_SECRET = 'whsec_test_1234';
process.env.LIVEBLOCKS_SECRET_KEY = 'sk_test_1234';
process.env.FRONTEND_URLS = 'http://localhost:5173';

let createApp: (typeof import('../src/app'))['createApp'];

before(async () => {
  const mod = await import('../src/app');
  createApp = mod.createApp;
});

after(async () => {
  const { prisma } = await import('../src/lib/prisma');
  await prisma.$disconnect();
});

async function startServer() {
  const app = createApp();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const addr = server.address() as { port: number };
  const close = () => new Promise<void>((resolve) => {
    server.closeAllConnections();
    server.close(() => resolve());
  });
  return { server, base: `http://127.0.0.1:${addr.port}`, close };
}

test('GET /health responds with API status', async () => {
  const { close, base } = await startServer();
  try {
    const res = await fetch(`${base}/health`);
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.status, 'ok');
  } finally {
    await close();
  }
});

test('unknown routes reject unauthenticated requests', async () => {
  const { close, base } = await startServer();
  try {
    const res = await fetch(`${base}/nope`);
    // The root-mounted routers apply requireAuth before the 404 fallback, so
    // anonymous requests to unknown paths are rejected with 401.
    assert.equal(res.status, 401);
  } finally {
    await close();
  }
});

test('CORS rejects disallowed origins', async () => {
  const { close, base } = await startServer();
  try {
    const res = await fetch(`${base}/health`, {
      headers: { Origin: 'https://evil.example.com' },
    });
    assert.equal(res.status, 403);
  } finally {
    await close();
  }
});

test('helmet security headers are present', async () => {
  const { close, base } = await startServer();
  try {
    const res = await fetch(`${base}/health`);
    assert.ok(res.headers.get('x-content-type-options') === 'nosniff');
  } finally {
    await close();
  }
});

test('webhooks reject unsigned requests', async () => {
  const { close, base } = await startServer();
  try {
    const res = await fetch(`${base}/webhooks/liveblocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'storageUpdated' }),
    });
    assert.equal(res.status, 401);
  } finally {
    await close();
  }
});
