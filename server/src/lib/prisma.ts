import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';
import { Pool } from 'pg';

// Singleton PrismaClient using the pg driver adapter, same as the NestJS
// PrismaService it replaces.
export const prisma: PrismaClient = (() => {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 15_000,
    max: 5,
    idleTimeoutMillis: 30_000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
})();
