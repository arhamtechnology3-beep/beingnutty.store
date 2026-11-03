import { notFound, permanentRedirect, redirect } from "next/navigation";
import { db } from "@/lib/db";

/** Serves the admin-managed redirect for `path` if one exists, otherwise a 404. */
export async function redirectOrNotFound(path: string): Promise<never> {
  const match = await db.redirect.findUnique({ where: { from: path.toLowerCase() } });
  if (!match) notFound();
  if (match.permanent) permanentRedirect(match.to);
  redirect(match.to);
}
