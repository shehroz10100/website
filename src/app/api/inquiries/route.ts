import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { inquirySchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import {
  getClientIpFromHeaders,
  sanitizeOptional,
  sanitizeText,
  securityHeaders,
} from "@/lib/security";

function withSecurityHeaders(response: NextResponse) {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

function isAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!origin) return true; // same-origin navigations may omit Origin on GET
  const allowed = new Set<string>();
  if (host) {
    allowed.add(`http://${host}`);
    allowed.add(`https://${host}`);
  }
  if (siteUrl) allowed.add(siteUrl);
  allowed.add("http://localhost:3001");
  allowed.add("http://127.0.0.1:3001");
  return allowed.has(origin);
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return withSecurityHeaders(
      NextResponse.json({ error: "Invalid origin" }, { status: 403 })
    );
  }

  const ip = getClientIpFromHeaders(request.headers);
  const limited = rateLimit({
    key: `api-inquiry:${ip}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!limited.success) {
    return withSecurityHeaders(
      NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((limited.resetAt - Date.now()) / 1000)
            ),
          },
        }
      )
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return withSecurityHeaders(
      NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    );
  }

  const record = body as Record<string, unknown>;

  if (String(record.website || "").trim()) {
    return withSecurityHeaders(
      NextResponse.json({ success: true }, { status: 201 })
    );
  }

  const parsed = inquirySchema.safeParse({
    customer_name: sanitizeText(String(record.customer_name || ""), 120),
    company_name: sanitizeOptional(String(record.company_name || ""), 160),
    email: String(record.email || "").trim().toLowerCase(),
    phone: sanitizeOptional(String(record.phone || ""), 40),
    country: sanitizeOptional(String(record.country || ""), 80),
    message: sanitizeText(String(record.message || ""), 4000),
    product_id: record.product_id || undefined,
    website: "",
  });

  if (!parsed.success) {
    return withSecurityHeaders(
      NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    );
  }

  const supabase = await createClient();
  const { product_id, website: _hp, ...rest } = parsed.data;

  const { error } = await supabase.from("inquiries").insert({
    customer_name: rest.customer_name,
    email: rest.email,
    message: rest.message,
    product_id: product_id || null,
    company_name: rest.company_name || null,
    phone: rest.phone || null,
    country: rest.country || null,
  });

  if (error) {
    return withSecurityHeaders(
      NextResponse.json({ error: "Unable to save inquiry" }, { status: 500 })
    );
  }

  return withSecurityHeaders(
    NextResponse.json({ success: true }, { status: 201 })
  );
}

export async function GET() {
  return withSecurityHeaders(
    NextResponse.json({ error: "Method not allowed" }, { status: 405 })
  );
}
