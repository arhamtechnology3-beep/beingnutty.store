/** True while `next build` / `npm run build` is generating pages. */
export function isProductionBuild() {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.npm_lifecycle_event === "build" ||
    process.env.SKIP_DB_AT_BUILD === "1"
  );
}

/** Prefer skipping the DB entirely during build when Hostinger hasn't injected secrets yet. */
export function dbAvailable() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/**
 * Runs `fn`, or returns `fallback` when the DB is missing/unreachable during a production build
 * (Hostinger often omits env at compile time, or can't open a Supabase socket).
 */
export async function buildSafe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (isProductionBuild() && !dbAvailable()) return fallback;
  try {
    return await fn();
  } catch (error) {
    if (!isProductionBuild()) throw error;
    console.warn("[build-safe]", error instanceof Error ? error.message : error);
    return fallback;
  }
}
