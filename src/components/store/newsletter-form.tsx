"use client";

import { useActionState } from "react";
import { subscribeNewsletter, type NewsletterState } from "@/app/(store)/actions";

export function NewsletterForm() {
  const [state, action, pending] = useActionState<NewsletterState, FormData>(subscribeNewsletter, null);

  return (
    <form action={action} className="w-full max-w-md">
      <label htmlFor="newsletter-email" className="text-sm font-medium text-paper/70">
        Get offers and new launches first
      </label>
      <div className="mt-3 flex rounded-full bg-paper/10 p-1.5 ring-1 ring-paper/20 focus-within:ring-caramel">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="min-w-0 flex-1 bg-transparent px-4 text-paper placeholder:text-paper/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-caramel px-5 py-2.5 text-sm font-semibold text-ink transition-opacity disabled:opacity-60"
        >
          {pending ? "Joining…" : "Join"}
        </button>
      </div>
      <p role="status" className={state?.ok ? "mt-2 text-sm text-pista" : "mt-2 text-sm text-caramel"}>
        {state?.message}
      </p>
    </form>
  );
}
