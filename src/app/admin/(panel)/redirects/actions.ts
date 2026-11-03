"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/components/action-form";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { isUniqueViolation } from "@/lib/form";

/** Normalises "https://site/old-page/?x" or "old-page/" to "/old-page". */
function toPath(value: string) {
  const raw = value.trim();
  let path = URL.canParse(raw) ? new URL(raw).pathname : raw;
  path = `/${path.replace(/^\/+/, "").replace(/\/+$/, "")}`;
  return path.split("?")[0].toLowerCase();
}

export async function createRedirect(formData: FormData): Promise<FormState> {
  await requireAdmin();
  const from = toPath(String(formData.get("from") ?? ""));
  const rawTo = String(formData.get("to") ?? "").trim();
  if (from === "/") return { error: "Enter the old path, e.g. /old-product" };
  if (!rawTo) return { error: "Enter where it should go." };
  const to = /^https?:\/\//.test(rawTo) ? rawTo : `/${rawTo.replace(/^\/+/, "")}`;
  if (to.toLowerCase() === from) return { error: "A redirect can't point to itself." };

  try {
    await db.redirect.create({ data: { from, to, permanent: formData.get("permanent") === "on" } });
  } catch (e) {
    if (isUniqueViolation(e)) return { error: `There's already a redirect for ${from}.` };
    throw e;
  }
  revalidatePath("/admin/redirects");
  revalidatePath(from);
  return { ok: `Redirect from ${from} created.` };
}

export async function deleteRedirect(id: string) {
  await requireAdmin();
  const r = await db.redirect.delete({ where: { id } });
  revalidatePath("/admin/redirects");
  revalidatePath(r.from);
}
