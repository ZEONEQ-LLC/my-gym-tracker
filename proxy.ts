// Next.js 16 "proxy" (formerly middleware). Runs before every matched request:
// refreshes the Supabase session and gates routes (see lib/supabase/proxy.ts).
// Next 16 runs proxy on the Node.js runtime, so @supabase/ssr no longer trips
// the old Edge-runtime `process.version` warning.

import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Run on all paths except static assets and image files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
