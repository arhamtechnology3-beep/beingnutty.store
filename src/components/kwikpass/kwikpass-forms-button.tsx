"use client";

import { kwikpassEnabled } from "@/lib/kwikpass-config";

/** Opens the KwikForms popup (OTP + lead fields) per GoKwik headless docs. */
export function KwikPassFormsButton({
  label = "Join with KwikPass",
  className,
}: {
  label?: string;
  className?: string;
}) {
  if (!kwikpassEnabled()) return null;

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        const open = window.__KP_LOGIN_SDK_INSTANCE__?.kwikForm;
        if (!open) {
          console.warn("[kwikpass] kwikForm() not ready yet");
          return;
        }
        open();
      }}
    >
      {label}
    </button>
  );
}
