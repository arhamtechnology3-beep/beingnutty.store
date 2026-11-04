/** Shared KwikPass / KwikForms config (safe for client — no secrets). */

export function kwikpassEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_KWIKPASS_MERCHANT_ID?.trim());
}

export function kwikpassMerchantId() {
  return process.env.NEXT_PUBLIC_KWIKPASS_MERCHANT_ID?.trim() ?? "";
}

export function kwikpassEnvironment(): "sandbox" | "production" {
  const env = (process.env.NEXT_PUBLIC_KWIKPASS_ENVIRONMENT ?? "sandbox").trim().toLowerCase();
  return env === "production" ? "production" : "sandbox";
}

export function kwikpassScriptSrc() {
  return kwikpassEnvironment() === "production"
    ? "https://pdp.gokwik.co/kwikpass/plugin/build/kp-custom-merchant.js"
    : "https://sandbox.pdp.gokwik.co/kwikpass/plugin/build/kp-custom-merchant.js";
}

export function kwikpassOrigin() {
  return kwikpassEnvironment() === "production" ? "https://pdp.gokwik.co" : "https://sandbox.pdp.gokwik.co";
}
