// Este arquivo contém a configuração do cliente Prisma para o projeto UTASK
// Salve como lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// Evita múltiplas instâncias do Prisma Client em desenvolvimento
// https://www.prisma.io/docs/guides/performance-and-optimization/connection-management

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // @ts-ignore
  if (!global.prisma) {
    // @ts-ignore
    global.prisma = new PrismaClient();
  }
  // @ts-ignore
  prisma = global.prisma;
}

export default prisma;
