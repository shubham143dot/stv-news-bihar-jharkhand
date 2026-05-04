// proxy.ts — Next.js 16 replacement for middleware.ts
// Protects /admin routes — redirects unauthenticated users to home.
// In Next.js 16, the exported function must be named "proxy" (not "middleware").

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (pathname.startsWith("/admin")) {
    // Check for Firebase auth cookie (set by client-side auth)
    // The actual security enforcement is also in the admin layout client component.
    const authCookie =
      request.cookies.get("__session") ||
      request.cookies.get("firebase-auth-token");

    if (!authCookie) {
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("auth", "required");
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
