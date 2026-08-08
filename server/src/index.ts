import 'dotenv/config';
import http from 'http';
import { createApp } from './app';
import { initGateway } from './lib/gateway';
import { prisma } from './lib/prisma';

async function bootstrap() {
  try {
    await prisma.$connect();
  } catch (e) {
    console.error('Failed to connect to database', e);
    process.exit(1);
  }

  const app = createApp();
  const server = http.createServer(app);
  initGateway(server);

  const port = process.env.PORT ?? 5002;
  server.listen(port, () => {
    console.log(`Canvazz Flow API running on http://localhost:${port}`);
  });
}

bootstrap();
