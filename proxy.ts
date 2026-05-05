// proxy.ts — Next.js 16 middleware replacement
// Auth is handled client-side in app/admin/layout.tsx
// This file is kept minimal to avoid adapterFn issues.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // No server-side auth redirect here — the admin layout handles it
  // to avoid race conditions with Firebase client-side cookie setting.
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
