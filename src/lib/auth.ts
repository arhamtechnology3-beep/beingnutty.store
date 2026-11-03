import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { readSessionCookie, setSessionCookie } from "./jwt";

export const SESSION_COOKIE = "bn_admin";
const MAX_AGE = 60 * 60 * 24 * 7;

export async function createSession(adminId: string) {
  await setSessionCookie(SESSION_COOKIE, "admin", adminId, MAX_AGE);
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export const getAdmin = cache(async () => {
  const adminId = await readSessionCookie(SESSION_COOKIE, "admin");
  if (!adminId) return null;
  return db.adminUser.findUnique({
    where: { id: adminId },
    select: { id: true, email: true, name: true, role: true },
  });
});

/** Use in every admin page and server action — proxy.ts is only an optimistic check. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function requireOwner() {
  const admin = await requireAdmin();
  if (admin.role !== "OWNER") redirect("/admin");
  return admin;
}
