import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

/**
 * Lazy-initialized Prisma client singleton
 * Only instantiates on first access to prevent build-time database connection errors
 * This is the recommended pattern for Next.js with Prisma
 */
function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    });
  }
  return globalForPrisma.prisma;
}

// Export as a getter to maintain lazy initialization
export const prisma = new Proxy({}, {
  get: (_, prop) => getPrisma()[prop as keyof PrismaClient],
}) as unknown as PrismaClient;
