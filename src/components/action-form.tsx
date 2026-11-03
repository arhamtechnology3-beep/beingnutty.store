"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type FormState = { error?: string; ok?: string } | null | void;

/**
 * Submits a server action without React's automatic form reset, so typed values survive validation errors.
 * Actions may return `{ error }` / `{ ok }` or call `redirect()`.
 */
export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel = "Saving…",
  className,
  footerClassName = "space-y-4",
  buttonClassName,
  resetOnSuccess = false,
  tone = "admin",
}: {
  action: (formData: FormData) => Promise<FormState>;
  children: ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  className?: string;
  footerClassName?: string;
  buttonClassName: string;
  resetOnSuccess?: boolean;
  tone?: "admin" | "store";
}) {
  const [state, setState] = useState<FormState>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await action(formData);
      setState(result ?? null);
      if (result?.ok && resetOnSuccess) form.reset();
    });
  };

  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
      <div className={footerClassName}>
        {state?.error ? (
          <p role="alert" className={cn("text-sm font-medium text-red-700", tone === "store" && "rounded-xl bg-red-50 p-3")}>
            {state.error}
          </p>
        ) : null}
        {state?.ok ? (
          <p role="status" className={cn("text-sm font-medium text-emerald-700", tone === "store" && "rounded-xl bg-emerald-50 p-3")}>
            {state.ok}
          </p>
        ) : null}
        <button type="submit" disabled={pending} className={buttonClassName}>
          {pending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
