import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Hostinger's shared CDN ignores Vary: rsc / next-router-prefetch. A cached HTML
 * document (or a partial prefetch Flight body) then gets reused for App Router
 * soft navigations → "This page couldn't load". Force private responses so the
 * CDN cannot poison client navigations; Next.js ISR still caches in-process.
 */
export function middleware(_request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("CDN-Cache-Control", "no-store");
  response.headers.set("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
  return response;
}

export const config = {
  matcher: [
    /*
     * All storefront routes + RSC payloads. Skip Next internals and static assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|brand/|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
