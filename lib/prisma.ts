import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { prismaRollbackExtension } from './prisma-rollback'

const globalForPrisma = globalThis as unknown as {
    prisma: ReturnType<typeof createPrismaClient> | undefined
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is not set in production environment variables");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool)

function createPrismaClient() {
    return new PrismaClient({ adapter }).$extends(prismaRollbackExtension)
}

export const prisma =
    globalForPrisma.prisma ??
    createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
