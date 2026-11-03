"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/passwords";

export type LoginState = { error?: string } | null;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const admin = await db.adminUser.findUnique({ where: { email } });
  const ok = await verifyPassword(password, admin?.passwordHash);
  if (!admin || !ok) return { error: "Incorrect email or password." };

  await db.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
  try {
    await createSession(admin.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start a login session.";
    if (/AUTH_SECRET/i.test(message)) {
      return { error: "Server misconfigured: add AUTH_SECRET (32+ characters) in Hostinger Environment variables, then restart the app." };
    }
    return { error: message };
  }
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
