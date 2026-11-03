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
  await createSession(admin.id);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
