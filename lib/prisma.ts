import { PrismaClient } from "@prisma/client";

// Evita crear una nueva instancia de PrismaClient en cada recarga durante `next dev`
// (que reejecuta los módulos), lo que agotaría las conexiones a la base.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
