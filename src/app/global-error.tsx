"use client";

import { useEffect } from "react";

/**
 * Soft navigations on Hostinger sometimes land here because the CDN serves a
 * cached HTML/prefetch Flight payload instead of a full RSC response. A full
 * document reload always works (ISR HTML), so retry once automatically.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error?.message, error?.digest);
    const key = `bn-hard-reload:${typeof window !== "undefined" ? window.location.pathname : ""}`;
    try {
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
        return;
      }
    } catch {
      /* private mode */
    }
  }, [error]);

  return (
    <html lang="en-IN">
      <body style={{ margin: 0, minHeight: "100dvh", display: "grid", placeItems: "center", fontFamily: "system-ui, sans-serif", background: "#1a100c", color: "#f5efe6" }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>This page couldn’t load</p>
          <p style={{ opacity: 0.7, marginTop: 8 }}>Reload to try again, or go back.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{ border: 0, borderRadius: 999, padding: "12px 20px", background: "#f5efe6", color: "#1a100c", fontWeight: 600, cursor: "pointer" }}
            >
              Reload
            </button>
            <button
              type="button"
              onClick={() => reset()}
              style={{ borderRadius: 999, padding: "12px 20px", background: "transparent", color: "#f5efe6", border: "1px solid rgba(245,239,230,0.35)", fontWeight: 600, cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
