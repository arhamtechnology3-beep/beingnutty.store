/** Soft-fail transient Hostinger↔Supabase TLS / timeout errors so one blip doesn't black-screen the store. */
export async function softDb<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const code =
      typeof error === "object" && error && "code" in error ? String((error as { code: unknown }).code) : "";
    if (
      code === "P1011" ||
      code === "ETIMEDOUT" ||
      code === "ECONNRESET" ||
      /self-signed|TLS|timed out|ECONNREFUSED|Can't reach/i.test(message)
    ) {
      console.error("[soft-db]", message);
      return fallback;
    }
    throw error;
  }
}
