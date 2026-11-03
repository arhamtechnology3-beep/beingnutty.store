import "server-only";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

export type Audience = "admin" | "customer";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET must be set (32+ characters)");
  return new TextEncoder().encode(value);
}

export async function setSessionCookie(name: string, audience: Audience, subject: string, maxAgeSeconds: number) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(subject)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(secret());
  (await cookies()).set(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

/** Returns the session subject (user id), or null if the cookie is missing, expired, tampered or for another audience. */
export async function readSessionCookie(name: string, audience: Audience) {
  const token = (await cookies()).get(name)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"], audience });
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
