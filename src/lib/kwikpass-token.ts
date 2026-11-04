import "server-only";
import { jwtDecrypt, base64url } from "jose";

export type KpTokenPayload = {
  phone?: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  [key: string]: unknown;
};

/** Decrypt KwikPass JWE (kpToken) with the secret from GoKwik. */
export async function decryptKpToken(kpToken: string): Promise<KpTokenPayload> {
  const secret = process.env.KWIKPASS_JWE_SECRET?.trim();
  if (!secret) throw new Error("KWIKPASS_JWE_SECRET is not set");
  const key = base64url.decode(secret);
  const { payload } = await jwtDecrypt(kpToken, key);
  return payload as KpTokenPayload;
}

export function normalizePhone(raw: string | undefined | null) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, "").slice(-10);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}
