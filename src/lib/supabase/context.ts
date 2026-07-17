import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  verifyCredentials,
  createContextClient,
  createAdminClient,
} from "@supabase/server/core";
import type {
  AuthModeWithKey,
  SupabaseContext,
  SupabaseEnv,
} from "@supabase/server";
import {
  getSupabasePublishableKey,
  getSupabaseSecretKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

function resolveNextEnv(): Partial<SupabaseEnv> {
  const url = getSupabaseUrl();
  const publishableKey = getSupabasePublishableKey();
  const secretKey = getSupabaseSecretKey();

  return {
    url: url || undefined,
    publishableKeys: publishableKey ? { default: publishableKey } : {},
    secretKeys: secretKey ? { default: secretKey } : {},
  };
}

let cachedJwks: SupabaseEnv["jwks"] = null;

async function getJwks(supabaseUrl: string): Promise<SupabaseEnv["jwks"]> {
  if (cachedJwks) return cachedJwks;

  try {
    const jwksUrl =
      process.env.SUPABASE_JWKS_URL ||
      `${supabaseUrl}/auth/v1/.well-known/jwks.json`;
    const res = await fetch(jwksUrl);
    if (!res.ok) return null;
    cachedJwks = await res.json();
    return cachedJwks;
  } catch {
    return null;
  }
}

/**
 * Composed Next.js adapter: @supabase/ssr cookies + @supabase/server JWT verify.
 */
export async function createSupabaseContext(
  options: { auth?: AuthModeWithKey | AuthModeWithKey[] } = { auth: "user" }
): Promise<
  { data: SupabaseContext; error: null } | { data: null; error: Error }
> {
  const nextEnv = resolveNextEnv();

  if (!nextEnv.url || !nextEnv.publishableKeys?.default) {
    return {
      data: null,
      error: new Error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY"),
    };
  }

  const cookieStore = await cookies();
  const ssrClient = createServerClient(
    nextEnv.url,
    nextEnv.publishableKeys.default,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components can't write cookies — middleware handles it.
          }
        },
      },
    }
  );

  const {
    data: { session },
  } = await ssrClient.auth.getSession();
  const token = session?.access_token ?? null;

  const jwks = await getJwks(nextEnv.url);
  const env: Partial<SupabaseEnv> = { ...nextEnv, jwks };

  const { data: auth, error } = await verifyCredentials(
    { token, apikey: null },
    { auth: options.auth ?? "user", env }
  );

  if (error) {
    return { data: null, error };
  }

  const supabase = createContextClient({
    auth: { token: auth!.token },
    env,
  });
  const supabaseAdmin = createAdminClient({ env });

  return {
    data: {
      supabase,
      supabaseAdmin,
      userClaims: auth!.userClaims,
      jwtClaims: auth!.jwtClaims,
      authMode: auth!.authMode,
    } as SupabaseContext,
    error: null,
  };
}
