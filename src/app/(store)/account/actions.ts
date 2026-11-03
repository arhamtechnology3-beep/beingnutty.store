"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { FormState } from "@/components/action-form";
import { createCustomerSession, destroyCustomerSession, requireCustomer, safeNext } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import { INDIAN_STATES } from "@/lib/india";
import { hashPassword, verifyPassword } from "@/lib/passwords";

const phone = z
  .string()
  .transform((v) => v.replace(/\D/g, "").slice(-10))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"));

export async function loginCustomer(formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const customer = await db.customer.findUnique({ where: { email } });
  const ok = await verifyPassword(password, customer?.passwordHash);
  if (!customer || !ok) return { error: "Incorrect email or password." };

  await createCustomerSession(customer.id);
  redirect(safeNext(formData.get("next")));
}

const registerSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name").max(60),
  lastName: z.string().trim().max(60),
  email: z.email("Enter a valid email").transform((v) => v.toLowerCase()),
  phone,
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  acceptsMarketing: z.boolean(),
});

export async function registerCustomer(formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    ...Object.fromEntries(["firstName", "lastName", "email", "phone", "password"].map((k) => [k, String(formData.get(k) ?? "")])),
    acceptsMarketing: formData.get("acceptsMarketing") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;

  const existing = await db.customer.findUnique({ where: { email: d.email } });
  if (existing?.passwordHash) return { error: "An account with this email already exists. Please sign in instead." };
  // Guest checkouts create a customer record; require the checkout mobile number before attaching past orders.
  if (existing?.phone && existing.phone !== d.phone) {
    return { error: "This email has earlier orders. Use the same mobile number you entered at checkout to claim them." };
  }

  const data = {
    firstName: d.firstName,
    lastName: d.lastName || null,
    phone: d.phone,
    passwordHash: await hashPassword(d.password),
    acceptsMarketing: d.acceptsMarketing || (existing?.acceptsMarketing ?? false),
  };
  const customer = existing
    ? await db.customer.update({ where: { id: existing.id }, data })
    : await db.customer.create({ data: { ...data, email: d.email } });

  await createCustomerSession(customer.id);
  redirect(safeNext(formData.get("next")));
}

export async function logoutCustomer() {
  await destroyCustomerSession();
  redirect("/");
}

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name").max(60),
  lastName: z.string().trim().max(60),
  phone,
  acceptsMarketing: z.boolean(),
});

export async function updateProfile(formData: FormData): Promise<FormState> {
  const customer = await requireCustomer();
  const parsed = profileSchema.safeParse({
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    acceptsMarketing: formData.get("acceptsMarketing") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  await db.customer.update({
    where: { id: customer.id },
    data: { ...parsed.data, lastName: parsed.data.lastName || null },
  });
  revalidatePath("/account");
  return { ok: "Profile saved." };
}

export async function changePassword(formData: FormData): Promise<FormState> {
  const customer = await requireCustomer();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("password") ?? "");
  if (next.length < 8) return { error: "New password must be at least 8 characters." };
  const row = await db.customer.findUniqueOrThrow({ where: { id: customer.id }, select: { passwordHash: true } });
  if (!(await verifyPassword(current, row.passwordHash))) return { error: "Your current password is incorrect." };
  await db.customer.update({ where: { id: customer.id }, data: { passwordHash: await hashPassword(next) } });
  return { ok: "Password updated." };
}

const addressSchema = z.object({
  name: z.string().trim().min(2, "Enter the recipient's name").max(80),
  phone,
  line1: z.string().trim().min(3, "Enter the house / street").max(160),
  line2: z.string().trim().max(160),
  city: z.string().trim().min(2, "Enter the city").max(80),
  state: z.enum(INDIAN_STATES as unknown as [string, ...string[]], "Select a state"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  isDefault: z.boolean(),
});

export async function addAddress(formData: FormData): Promise<FormState> {
  const customer = await requireCustomer("/account/addresses");
  const parsed = addressSchema.safeParse({
    ...Object.fromEntries(["name", "phone", "line1", "line2", "city", "state", "pincode"].map((k) => [k, String(formData.get(k) ?? "")])),
    isDefault: formData.get("isDefault") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;

  await db.$transaction(async (tx) => {
    const count = await tx.address.count({ where: { customerId: customer.id } });
    const isDefault = d.isDefault || count === 0;
    if (isDefault) await tx.address.updateMany({ where: { customerId: customer.id }, data: { isDefault: false } });
    await tx.address.create({ data: { ...d, line2: d.line2 || null, isDefault, customerId: customer.id } });
  });
  revalidatePath("/account/addresses");
  return { ok: "Address saved." };
}

export async function deleteAddress(addressId: string) {
  const customer = await requireCustomer("/account/addresses");
  await db.address.deleteMany({ where: { id: addressId, customerId: customer.id } });
  revalidatePath("/account/addresses");
}

export async function makeDefaultAddress(addressId: string) {
  const customer = await requireCustomer("/account/addresses");
  await db.$transaction([
    db.address.updateMany({ where: { customerId: customer.id }, data: { isDefault: false } }),
    db.address.updateMany({ where: { id: addressId, customerId: customer.id }, data: { isDefault: true } }),
  ]);
  revalidatePath("/account/addresses");
}
