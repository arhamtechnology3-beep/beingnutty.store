/** True while `next build` / `npm run build` is generating pages. */
export function isProductionBuild() {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.npm_lifecycle_event === "build" ||
    process.env.SKIP_DB_AT_BUILD === "1"
  );
}

/**
 * Runs `fn`, or returns `fallback` when the DB is unreachable during a production build
 * (Hostinger often can't open a Supabase socket while compiling).
 */
export async function buildSafe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (!isProductionBuild()) throw error;
    console.warn("[build-safe]", error instanceof Error ? error.message : error);
    return fallback;
  }
}
