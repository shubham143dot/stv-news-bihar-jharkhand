// middleware.ts
// Protects /admin routes — redirects unauthenticated users to home
// Note: Full server-side session cookie auth requires Firebase Admin SDK session management.
// This middleware uses a lightweight client cookie check.
// For production, consider firebase-admin session cookie verification.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (pathname.startsWith("/admin")) {
    // Check for Firebase auth cookie (set by client-side auth)
    // The actual security enforcement is in the admin layout client component
    // This middleware is a first line of defense / redirect hint
    const authCookie =
      request.cookies.get("__session") ||
      request.cookies.get("firebase-auth-token");

    // If no session cookie, redirect to home
    // The admin layout also performs a client-side check with isAdmin
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
