import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Hostinger builds + serverless need a small pool and a short connect timeout. */
function connectionString() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const u = new URL(url);
  if (!u.searchParams.has("connection_limit")) u.searchParams.set("connection_limit", "1");
  if (!u.searchParams.has("connect_timeout")) u.searchParams.set("connect_timeout", "15");
  if (!u.searchParams.has("sslmode")) u.searchParams.set("sslmode", "require");
  return u.toString();
}

function createClient() {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: connectionString(),
      // Fail fast on Hostinger if the DB host is unreachable (e.g. IPv6-only).
      connectionTimeoutMillis: 15_000,
      max: 1,
    }),
  });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
