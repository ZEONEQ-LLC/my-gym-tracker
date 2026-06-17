// Session refresh + route gating for Next.js middleware.
//
// On every matched request it binds a Supabase server client to the request/
// response cookies and calls getUser() (refreshes an expired token and writes
// the new cookies onto the response). It then gates routes:
//   • no user, not on /login        → redirect to /login
//   • signed-in user on /login       → redirect to /
//
// Lock-out safety:
//   • /login is the only public route and is NEVER redirected away when signed
//     out, so the sign-in screen is always reachable.
//   • static assets / images are excluded by the matcher in middleware.ts.
//   • redirect responses copy the freshly-set auth cookies, so a token refresh
//     is never lost across the redirect.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do not run code between createServerClient and getUser() —
  // misordering can cause hard-to-debug random logouts.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.includes(path);

  if (!user && !isPublic) {
    return redirectKeepingCookies(request, response, "/login");
  }
  if (user && isPublic) {
    return redirectKeepingCookies(request, response, "/");
  }

  return response;
}

/** Redirect to `pathname` while preserving any cookies set on `from`. */
function redirectKeepingCookies(request: NextRequest, from: NextResponse, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
