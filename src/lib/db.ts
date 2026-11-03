import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { isProductionBuild } from "./build-safe";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Hostinger builds + serverless need a small pool and a short connect timeout. */
function connectionString() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    if (isProductionBuild()) {
      // Never throw while compiling — Hostinger may inject DATABASE_URL only at runtime.
      console.warn("[db] DATABASE_URL missing during build — using unreachable placeholder");
      return "postgresql://build:build@127.0.0.1:1/build?connect_timeout=1&sslmode=disable";
    }
    throw new Error("DATABASE_URL is not set");
  }
  const u = new URL(url);
  if (!u.searchParams.has("connection_limit")) u.searchParams.set("connection_limit", "1");
  if (!u.searchParams.has("connect_timeout")) u.searchParams.set("connect_timeout", "15");
  if (!u.searchParams.has("sslmode")) u.searchParams.set("sslmode", "require");
  return u.toString();
}

function createClient() {
  const missing = !process.env.DATABASE_URL?.trim();
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: connectionString(),
      connectionTimeoutMillis: missing ? 500 : 15_000,
      max: 1,
    }),
  });
}

function getClient() {
  if (!globalForPrisma.prisma) globalForPrisma.prisma = createClient();
  return globalForPrisma.prisma;
}

/** Lazy so importing this module during build doesn't require DATABASE_URL. */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
