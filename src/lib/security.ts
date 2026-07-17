import { headers } from "next/headers";

const HTML_TAG_RE = /<[^>]*>/g;
const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Strip HTML tags and control characters to reduce XSS risk in stored text. */
export function sanitizeText(input: string, maxLength = 5000): string {
  return input
    .replace(HTML_TAG_RE, "")
    .replace(CONTROL_CHARS_RE, "")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeOptional(
  input: string | undefined | null,
  maxLength = 500
): string | undefined {
  if (input == null || input === "") return undefined;
  const cleaned = sanitizeText(String(input), maxLength);
  return cleaned || undefined;
}

/**
 * CSRF-style origin check for Server Actions / API routes.
 * Allows same-origin requests and configured site URL.
 */
export async function assertSameOrigin(): Promise<{ ok: true } | { ok: false; message: string }> {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  const referer = headerStore.get("referer");
  const host = headerStore.get("host");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

  const allowed = new Set<string>();
  if (host) {
    allowed.add(`http://${host}`);
    allowed.add(`https://${host}`);
  }
  if (siteUrl) allowed.add(siteUrl);
  allowed.add("http://localhost:3001");
  allowed.add("http://127.0.0.1:3001");
  allowed.add("http://localhost:3000");

  const candidate = origin || (referer ? new URL(referer).origin : null);

  // Server Actions from same site usually send Origin. Block clear cross-origin.
  if (candidate && ![...allowed].some((a) => candidate === a || candidate.startsWith(a))) {
    return { ok: false, message: "Invalid request origin" };
  }

  return { ok: true };
}

export function getClientIpFromHeaders(headerStore: Headers): string {
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return headerStore.get("x-real-ip") || headerStore.get("cf-connecting-ip") || "unknown";
}

export const securityHeaders: Record<string, string> = {
  "X-DNS-Prefetch-Control": "on",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-XSS-Protection": "1; mode=block",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.supabase.co",
    "font-src 'self' data:",
    "worker-src 'self' blob: https://cdn.jsdelivr.net",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://cdn.jsdelivr.net https://tessdata.projectnaptha.com https://api.openai.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};
