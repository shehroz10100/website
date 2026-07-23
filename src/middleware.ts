import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { securityHeaders } from "@/lib/security-headers";

/**
 * Admin-only middleware. Public pages skip Edge middleware entirely
 * so TTFB / FCP are not blocked by an auth round-trip.
 */
export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
