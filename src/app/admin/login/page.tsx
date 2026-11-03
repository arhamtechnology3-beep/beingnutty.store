"use client";

import Image from "next/image";
import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, null);

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16">
        <form action={action} className="w-full max-w-sm">
          <p className="flex items-center gap-3 font-display text-3xl font-black">
            <Image src="/brand/mascot.png" alt="" width={642} height={700} className="h-12 w-auto" />
            <span>
              Being<span className="text-caramel">·</span>Nutty
            </span>
          </p>
          <h1 className="mt-10 text-2xl font-semibold">Sign in to admin</h1>
          <p className="mt-1 text-sm text-roast">Manage products, orders and customers.</p>

          <label className="mt-8 block">
            <span className="mb-1.5 block text-sm font-medium">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              className="w-full rounded-lg border border-black/15 bg-white px-4 py-2.5 focus:border-ink focus:outline-none"
            />
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium">Password</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-black/15 bg-white px-4 py-2.5 focus:border-ink focus:outline-none"
            />
          </label>
          {state?.error ? (
            <p role="alert" className="mt-4 text-sm font-medium text-red-700">
              {state.error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-6 w-full rounded-lg bg-ink py-3 font-semibold text-paper transition-colors hover:bg-roast disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
      <div className="grain relative hidden items-end overflow-hidden bg-ink p-12 text-paper lg:flex">
        <p className="font-display text-7xl font-black italic leading-[0.9]">
          Stay
          <br />
          nutty.
        </p>
      </div>
    </div>
  );
}
