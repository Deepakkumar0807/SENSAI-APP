import { PrismaClient } from "@prisma/client";

export const db = globalThis.Prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalThis.Prisma = db;
}