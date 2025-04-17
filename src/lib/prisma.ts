// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // Impede recriação do PrismaClient durante hot reload no desenvolvimento
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Usar a URL da conexão do PostgreSQL do ambiente Vercel (.env.local)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
