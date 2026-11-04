"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { kwikpassEnvironment, kwikpassMerchantId, kwikpassOrigin, kwikpassScriptSrc } from "@/lib/kwikpass-config";
import { KwikPassPageViews } from "./kwikpass-pageviews";

/**
 * Loads KwikPass Custom Headless SDK on every storefront page.
 * merchantInfo must exist before the plugin script (GoKwik docs).
 */
export function KwikPassProvider({ children }: { children?: React.ReactNode }) {
  const mid = kwikpassMerchantId();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mid) return;
    window.merchantInfo = {
      ...window.merchantInfo,
      environment: kwikpassEnvironment(),
      mid,
      type: "merchantInfo",
      integrationType: "CUSTOM_HEADLESS",
    };
    window.__KP_LOGIN_SDK_INSTANCE__ = window.__KP_LOGIN_SDK_INSTANCE__ || {};
    window.__KP_LOGIN_SDK_INSTANCE__.logEvents =
      window.__KP_LOGIN_SDK_INSTANCE__.logEvents ||
      function (event: unknown) {
        window.kpqueue = window.kpqueue || [];
        window.kpqueue.push(event);
      };
  }, [mid]);

  useEffect(() => {
    if (!mid) return;
    const onForm = (event: MessageEvent) => {
      if (event.origin !== kwikpassOrigin()) return;
      if (event.data?.type !== "kf:submitted") return;
      const payload = event.data?.data;
      if (!payload) return;
      void fetch("/api/kwikpass/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    };
    window.addEventListener("message", onForm);
    return () => window.removeEventListener("message", onForm);
  }, [mid]);

  if (!mid) return children ?? null;

  return (
    <>
      <Script id="kwikpass-merchant-info" strategy="beforeInteractive">{`
        window.merchantInfo = {
          ...window.merchantInfo,
          environment: ${JSON.stringify(kwikpassEnvironment())},
          mid: ${JSON.stringify(mid)},
          type: "merchantInfo",
          integrationType: "CUSTOM_HEADLESS"
        };
        window.__KP_LOGIN_SDK_INSTANCE__ = window.__KP_LOGIN_SDK_INSTANCE__ || {};
        window.__KP_LOGIN_SDK_INSTANCE__.logEvents = window.__KP_LOGIN_SDK_INSTANCE__.logEvents || function(event){
          window.kpqueue = window.kpqueue || [];
          window.kpqueue.push(event);
        };
      `}</Script>
      <Script
        id="kwikpass-sdk"
        src={kwikpassScriptSrc()}
        strategy="afterInteractive"
        onLoad={() => {
          setReady(true);
          window.dispatchEvent(new CustomEvent("kp-script-loaded"));
        }}
      />
      {ready ? <KwikPassPageViews /> : null}
      {children}
    </>
  );
}
