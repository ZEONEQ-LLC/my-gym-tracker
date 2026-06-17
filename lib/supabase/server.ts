// Supabase server client (Server Components, Route Handlers, Server Actions).
// Reads/writes auth cookies via next/headers. The setAll try/catch guards the
// case where cookies are written from a Server Component — there the cookie
// store is read-only and the middleware (lib/supabase/middleware.ts) is what
// actually refreshes the session, so swallowing the error is correct.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — ignore; middleware refreshes the
            // session cookie on the response instead.
          }
        },
      },
    },
  );
}
