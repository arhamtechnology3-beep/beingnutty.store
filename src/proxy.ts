import { NextResponse, type NextRequest } from "next/server";

/** Keep pages off Hostinger's shared CDN — it ignores Vary: rsc and breaks soft nav. */
function withNoCdnCache(response: NextResponse) {
  response.headers.set("CDN-Cache-Control", "no-store");
  response.headers.set("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname.startsWith("/admin/login")) return withNoCdnCache(NextResponse.next());
    if (!request.cookies.has("bn_admin")) {
      return withNoCdnCache(NextResponse.redirect(new URL("/admin/login", request.url)));
    }
    return withNoCdnCache(NextResponse.next());
  }

  return withNoCdnCache(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
