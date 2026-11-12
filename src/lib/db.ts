import "server-only";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { isProductionBuild } from "./build-safe";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; pgPool?: pg.Pool };

/**
 * Hostinger's outbound TLS proxy injects a self-signed cert. node-pg treats
 * `sslmode=require` as verify-full and IGNORES any `ssl` object when sslmode is
 * in the URL — so we strip ssl* params and pass rejectUnauthorized: false on the Pool.
 */
function connectionString() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    if (isProductionBuild()) {
      console.warn("[db] DATABASE_URL missing during build — using unreachable placeholder");
      return "postgresql://build:build@127.0.0.1:1/build";
    }
    throw new Error("DATABASE_URL is not set");
  }
  const u = new URL(url);
  u.searchParams.set("connection_limit", "5");
  if (!u.searchParams.has("connect_timeout")) u.searchParams.set("connect_timeout", "15");
  for (const key of ["sslmode", "sslrootcert", "sslcert", "sslkey", "uselibpqcompat"]) {
    u.searchParams.delete(key);
  }
  return u.toString();
}

function useSsl(connection: string) {
  try {
    const host = new URL(connection).hostname;
    // Local Postgres has no TLS; Hostinger/Supabase need encrypt-without-verify.
    if (!host || host === "localhost" || host === "127.0.0.1" || host === "::1") return false;
  } catch {
    return false;
  }
  return { rejectUnauthorized: false } as const;
}

function getPool() {
  if (globalForPrisma.pgPool) return globalForPrisma.pgPool;
  const missing = !process.env.DATABASE_URL?.trim();
  const connection = connectionString();
  const pool = new pg.Pool({
    connectionString: connection,
    max: 5,
    connectionTimeoutMillis: missing ? 500 : 15_000,
    ssl: missing ? false : useSsl(connection),
  });
  pool.on("error", (err) => console.error("[db] idle client error", err.message));
  globalForPrisma.pgPool = pool;
  return pool;
}

function getClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({ adapter: new PrismaPg(getPool()) });
  }
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
