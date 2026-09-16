import { PrismaClient } from "@prisma/client";

function getPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
    if (!databaseUrl) {
      throw new Error("[Database Configuration Error] DATABASE_URL is missing in production environment variables.");
    }
    if (databaseUrl.startsWith("file:") || databaseUrl.startsWith("sqlite:")) {
      throw new Error(
        "[Database Configuration Error] Production database MUST be PostgreSQL (Supabase). SQLite files are not supported in serverless production."
      );
    }
    if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
      throw new Error(
        "[Database Configuration Error] DATABASE_URL must be a valid PostgreSQL connection string starting with 'postgresql://' or 'postgres://'."
      );
    }
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const db = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
