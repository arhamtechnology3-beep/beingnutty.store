import { Prisma } from "@/generated/prisma/client";

/** Reads the given keys from FormData as trimmed strings (missing → ""). */
export function formStrings<K extends string>(formData: FormData, keys: readonly K[]): Record<K, string> {
  return Object.fromEntries(keys.map((k) => [k, String(formData.get(k) ?? "").trim()])) as Record<K, string>;
}

export const isUniqueViolation = (e: unknown) => e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";

export const orNull = (s: string) => (s ? s : null);
