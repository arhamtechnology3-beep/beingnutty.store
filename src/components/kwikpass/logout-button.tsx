"use client";

import { logoutCustomer } from "@/app/(store)/account/actions";

/** Calls KwikPass logout before clearing our session (required by GoKwik). */
export function LogoutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          window.__KP_LOGIN_SDK_INSTANCE__?.handleKPLogout?.();
        } catch {
          /* ignore */
        }
        await logoutCustomer();
      }}
    >
      Sign out
    </button>
  );
}
