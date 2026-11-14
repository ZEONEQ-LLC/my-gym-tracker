// Keep-alive for the Supabase free tier, which pauses a project after 7 days
// without activity. A Vercel Cron Job (vercel.json) calls this route once a day
// and it runs one cheap query against Postgres so the project counts as active.
//
// Auth: when the CRON_SECRET env var is set on the Vercel project, Vercel sends
// `Authorization: Bearer <CRON_SECRET>` with every cron request. Without a
// matching header the route does nothing (401), so it can't be used to generate
// load from outside. proxy.ts excludes this path from session/route gating,
// otherwise the (session-less) cron request would be redirected to /login.

import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  // HEAD request with a count: Postgres executes the query, but no rows leave
  // the database (RLS hides every row from the anon role anyway).
  const { error } = await supabase
    .from("profiles")
    .select("user_id", { count: "exact", head: true });

  if (error) {
    console.error("[keepalive] Supabase query failed:", error.message);
    return Response.json({ ok: false, error: "supabase query failed" }, { status: 502 });
  }
  return Response.json({ ok: true, at: new Date().toISOString() });
}
