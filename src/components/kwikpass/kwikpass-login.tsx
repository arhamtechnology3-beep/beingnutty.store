"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { kwikpassEnabled } from "@/lib/kwikpass-config";
import { storeButton, storeField } from "@/components/store/fields";

type Step = "phone" | "otp";

export function KwikPassLogin({ next = "/account" }: { next?: string }) {
  const router = useRouter();
  const enabled = kwikpassEnabled();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const mark = () => {
      setSdkReady(Boolean(window.__KP_LOGIN_SDK_INSTANCE__?.kpSendOTP));
      window.__KP_LOGIN_SDK_INSTANCE__?.handleKpSSOButton?.();
    };
    mark();
    window.addEventListener("kp-script-loaded", mark);

    const onSso = async (event: Event) => {
      const detail = (event as CustomEvent<{ kpToken?: string }>).detail;
      const kpToken = detail?.kpToken;
      if (!kpToken) return;
      await finishWithToken(kpToken);
    };
    window.addEventListener("kwikpass-sso", onSso as EventListener);
    return () => {
      window.removeEventListener("kp-script-loaded", mark);
      window.removeEventListener("kwikpass-sso", onSso as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, next]);

  if (!enabled) return null;

  const digits = phone.replace(/\D/g, "").slice(-10);

  async function finishWithToken(kpToken: string, fallbackPhone?: string) {
    setError(null);
    const res = await fetch("/api/kwikpass/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kpToken, phone: fallbackPhone || digits, next }),
    });
    const data = (await res.json()) as { ok: boolean; next?: string; error?: string };
    if (!data.ok) {
      setError(data.error ?? "Could not sign you in.");
      return;
    }
    router.push(data.next || next);
    router.refresh();
  }

  const sendOtp = () => {
    setError(null);
    setInfo(null);
    if (!/^[6-9]\d{9}$/.test(digits)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    const send = window.__KP_LOGIN_SDK_INSTANCE__?.kpSendOTP;
    if (!send) {
      setError("KwikPass is still loading. Please wait a moment and try again.");
      return;
    }
    startTransition(async () => {
      try {
        const result = await send(digits);
        if (result.status === 200 || result.status === 400) {
          if (result.status === 200) {
            setStep("otp");
            setInfo(result.message || "OTP sent successfully.");
          } else {
            setError(result.message || "Could not send OTP.");
          }
        } else {
          setError(result.message || "Could not send OTP.");
        }
      } catch {
        setError("Could not send OTP. Please try again.");
      }
    });
  };

  const verifyOtp = () => {
    setError(null);
    const verify = window.__KP_LOGIN_SDK_INSTANCE__?.kpVerifyOTP;
    if (!verify) {
      setError("KwikPass is still loading. Please wait a moment and try again.");
      return;
    }
    if (!/^\d{4,6}$/.test(otp.trim())) {
      setError("Enter the OTP you received.");
      return;
    }
    startTransition(async () => {
      try {
        const result = await verify({ phone: digits, otp: otp.trim() });
        if (result.status !== 200 || !result.body?.data?.kpToken) {
          setError(result.message || "OTP is invalid. Please try again.");
          return;
        }
        await finishWithToken(result.body.data.kpToken, digits);
      } catch {
        setError("Could not verify OTP. Please try again.");
      }
    });
  };

  return (
    <div className="space-y-5 rounded-[1.75rem] border border-line bg-paper p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-caramel">KwikPass</p>
        <h2 className="mt-1 font-display text-2xl font-bold">Sign in with mobile OTP</h2>
        <p className="mt-1 text-sm text-roast">Faster checkout with GoKwik network login / SSO.</p>
      </div>

      {/* GoKwik injects masked SSO button into this host when available */}
      <div id="kp-sso-btn" className="min-h-12" />

      {step === "phone" ? (
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Mobile number</span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="10-digit mobile"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={storeField}
            />
          </label>
          <button type="button" disabled={pending || !sdkReady} onClick={sendOtp} className={`${storeButton} w-full disabled:opacity-60`}>
            {pending ? "Sending OTP…" : sdkReady ? "Send OTP" : "Loading KwikPass…"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-roast">
            OTP sent to <strong className="text-ink">+91 {digits}</strong>
          </p>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Enter OTP</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="4-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className={storeField}
            />
          </label>
          <button type="button" disabled={pending} onClick={verifyOtp} className={`${storeButton} w-full disabled:opacity-60`}>
            {pending ? "Verifying…" : "Verify & sign in"}
          </button>
          <button type="button" className="w-full text-sm font-semibold text-roast underline" onClick={() => setStep("phone")}>
            Change number
          </button>
        </div>
      )}

      {info ? <p className="text-sm text-pista">{info}</p> : null}
      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
