/** Client-side marketing attribution + light browse journey (Shopify-style basics). */

export type Attribution = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  referrer: string | null;
  landingPage: string | null;
  sourceChannel: string;
};

export type JourneyEvent = {
  at: string;
  type: "page" | "product" | "add_to_cart" | "checkout";
  path?: string;
  title?: string;
  productSlug?: string;
  productTitle?: string;
  variantTitle?: string;
};

const ATTR_KEY = "bn_attr";
const JOURNEY_KEY = "bn_journey";
const MAX_JOURNEY = 40;

function hostOf(url: string | null | undefined) {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/** Maps UTM + referrer into a seller-friendly channel label. */
export function detectChannel(a: Omit<Attribution, "sourceChannel">): string {
  const src = (a.utmSource ?? "").toLowerCase();
  const med = (a.utmMedium ?? "").toLowerCase();
  const ref = hostOf(a.referrer);

  if (src.includes("facebook") || src === "fb" || src === "meta" || src.includes("ig") || src.includes("instagram")) {
    if (med.includes("paid") || med.includes("cpc") || med.includes("cpm") || med.includes("ads") || med === "paidsocial") {
      return "Meta Ads";
    }
    if (src.includes("instagram") || src === "ig") return "Instagram";
    return "Facebook";
  }
  if (src.includes("google") || med === "cpc" || med === "ppc") return med.includes("organic") ? "Google Organic" : "Google Ads";
  if (src.includes("youtube")) return "YouTube";
  if (src.includes("whatsapp") || src === "wa") return "WhatsApp";
  if (src.includes("email") || med === "email") return "Email";
  if (src) return a.utmSource!;

  if (ref.includes("instagram.com") || ref.includes("l.instagram.com")) return "Instagram";
  if (ref.includes("facebook.com") || ref.includes("fb.com") || ref.includes("l.facebook.com")) return "Facebook";
  if (ref.includes("google.")) return "Google Organic";
  if (ref.includes("youtube.com") || ref.includes("youtu.be")) return "YouTube";
  if (ref && !ref.includes("beingnutty")) return `Referral (${ref})`;
  return "Direct / Website";
}

export function readAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ATTR_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Attribution;
  } catch {
    return null;
  }
}

/** Capture first-touch UTM/referrer once per browser (first campaign wins). */
export function captureAttributionFromLocation() {
  if (typeof window === "undefined") return;
  if (readAttribution()) return;

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");
  const utmContent = params.get("utm_content");
  const utmTerm = params.get("utm_term");
  const referrer = document.referrer || null;
  const landingPage = `${window.location.pathname}${window.location.search}` || "/";

  // Only persist when we have a signal (UTM, external referrer, or any landing).
  const base = {
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    referrer: referrer && !hostOf(referrer).includes("beingnutty") ? referrer : null,
    landingPage,
  };
  const attr: Attribution = { ...base, sourceChannel: detectChannel(base) };
  localStorage.setItem(ATTR_KEY, JSON.stringify(attr));
}

export function readJourney(): JourneyEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(JOURNEY_KEY);
    return raw ? (JSON.parse(raw) as JourneyEvent[]) : [];
  } catch {
    return [];
  }
}

export function trackJourney(event: Omit<JourneyEvent, "at">) {
  if (typeof window === "undefined") return;
  const next = [...readJourney(), { ...event, at: new Date().toISOString() }].slice(-MAX_JOURNEY);
  sessionStorage.setItem(JOURNEY_KEY, JSON.stringify(next));
}

export function checkoutAttributionPayload() {
  return {
    attribution: readAttribution(),
    journey: readJourney(),
  };
}
