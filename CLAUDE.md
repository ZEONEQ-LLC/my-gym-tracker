# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A mobile-web **Gym Tracker** built with Next.js 16 (App Router, Turbopack), React 19, TypeScript 6 and Tailwind CSS v4, backed by **Supabase** (email+password auth, Postgres with Row-Level Security) and deployed on **Vercel**. Each user has their own account and sees only their own data. UI strings are German. Recreated from the design handoff in `design_handoff_gym_tracker/`.

**`design_handoff_gym_tracker/` is reference only** — never import from it; it is excluded in `tsconfig.json` and `eslint.config.mjs`. It holds the original design prototype (`.dc.html`) and its own `CLAUDE.md`. Treat that HTML as the source of truth for visuals/interaction and its README for the data model.

## Commands

```bash
npm run dev        # dev server (localhost:3000)
npm run build      # production build
npm run lint       # eslint . (flat config — Next 16 removed `next lint`)
npm run typecheck  # tsc --noEmit
```

Requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (gitignored). Without them the proxy throws on every request. `CRON_SECRET` is only needed to call `/api/keepalive` (never print its value).

There is **no unit-test suite and no CI**. Verify changes by running the app in a browser: data lives in Supabase and is fetched client-side, so behaviour only exists at runtime. Playwright is a devDependency for this — load the browser once (`npx playwright install chromium`, system deps via `npx playwright install-deps chromium`), start the dev server, and drive the running app with a throwaway script kept outside the repo. Wait for hydration (`waitUntil: "networkidle"`) before typing into forms, or React resets the controlled inputs. Don't add a test runner or "verify by importing selectors" — go through the real UI. Browser verification needs a Supabase account; prefer reusing an existing test account over signing up new users (ask the user for credentials).

When running in OrbStack, start with `npm run dev -- -H 0.0.0.0` so the host can reach it at `http://my-gym-tracker.orb.local:3000` (or `http://localhost:3000` via port-forward).

## Architecture

Three layers; components never touch storage directly:

1. **`lib/domain/`** — pure, framework-free logic. No React, no storage.
   - `types.ts` — `Exercise`, `HistoryEntry`, `SetEntry`, `Profile`, `GymData`.
   - `selectors.ts` — view-models (`vmGroups`, `vmDetail`, `vmProgress`, `vmRecent`) plus `topW`, `groupOrder`, `isDoneToday`. All derived state (done-today, streaks, deltas, weekly consistency) is computed here, never stored.
   - `drafts.ts` — form draft shapes + builders (`buildLogDraft` prefill rule, `buildEditDraft`), `keyFor` (falls back to the first variant for unknown variant names), `slugify`, `logHasValidSet`.
   - `date.ts` — local-ISO date helpers. `migrate.ts` — legacy blob migration (only used by the localStorage repo). `seed.ts` — 8 demo exercises (dev only).

2. **`lib/data/`** — storage + React data access.
   - `repository.ts` — the async `GymRepository` interface. Every method takes `userId`; mutations return the full updated `GymData`.
   - `supabase-repository.ts` — **the active implementation**. Maps snake_case ↔ camelCase, `category` ↔ `group`, `jsonb` for `settings`/`sets`. Mutations re-`load()` so the cache always holds a consistent snapshot. `upsertExercise` writes only the exercise row; history is owned by `addHistoryEntry`.
   - `local-storage-repository.ts` — kept as a reference implementation, not wired in.
   - `index.ts` — the factory (`getRepository`), the only place that picks the backend.
   - `hooks.ts` — TanStack Query hooks. One query `["gym", userId]` per user, disabled until a user is signed in; mutations write through the repo and `setQueryData` the returned `GymData`.

3. **`lib/supabase/`** — auth plumbing (current `@supabase/ssr` App Router pattern).
   - `client.ts` / `server.ts` — browser and server clients.
   - `proxy.ts` — `updateSession`: refreshes the session and gates routes; called from the root `proxy.ts` (Next 16's replacement for `middleware.ts`, runs on Node).
   - `use-user.tsx` — `AuthProvider` + `useUserId()`, kept in sync via `onAuthStateChange`.

4. **`app/` + `components/`** — UI. Routes:
   - `/login` — sign in / sign up. **The only public route** — never gate it, or users lock themselves out.
   - `/api/keepalive` — Supabase keep-alive for the Vercel cron. Excluded from the proxy matcher (the cron has no session) and guarded by `Authorization: Bearer $CRON_SECRET` instead; must stay a dynamic route so every call reaches Postgres.
   - `(shell)/` route group = tab shell with `BottomTabBar`: `/` (Übungen), `/verlauf`, `/profil` (includes logout).
   - `uebung/` (outside the group, so **no tab bar**): `neu`, `[id]`, `[id]/eintragen`, `[id]/einstellungen`.
   - Navigation between list↔detail↔log uses `router.back()` so "return to where you came from" works without tracking it explicitly.

**Database:** `supabase/schema.sql` defines `profiles`, `exercises` (PK `(user_id, id)` where `id` is the slug), `history_entries` (composite FK → exercises, `on delete cascade`), RLS policies (`auth.uid() = user_id` for every operation) and the `handle_new_user` trigger that creates a profile on signup. The user applies it manually in the Supabase SQL editor; keep it idempotent. Email confirmation is **off** in Supabase Auth, so signup logs in directly.

## Conventions & gotchas

- **Client-side data.** Pages that read data are `"use client"` and render a loading state until `useGymData()` resolves. Don't move data reads into Server Components.
- **No state initialisation in effects.** The `react-hooks/set-state-in-effect` rule (Next 16) forbids it. Pattern used by the form pages: the page handles loading/not-found, then renders an inner form that receives the loaded entity, initialises state via `useState(() => build…Draft(...))`, and is reset by a `key` prop. React to user choices (e.g. variant switch) in event handlers.
- **Drafts are string-typed** (raw input) and parsed to numbers only on save. Mirror this when adding form fields.
- **Accent theming.** Colors are CSS variables `--accent` / `--accent-soft` on `<html>`, set at runtime by `components/layout/accent-sync.tsx` from `profile.accent`. Use the token classes (`bg-accent`, `text-accent`; see `@theme` in `app/globals.css`), never hard-code the green.
- **Design tokens** live in `app/globals.css` under `@theme` (Tailwind v4 CSS-first). Fonts via `next/font` (Hanken Grotesk + JetBrains Mono → `font-sans`/`font-mono`).
- **No device frame.** Screens fill the viewport and respect `env(safe-area-inset-*)`; the app column is capped at `max-w-[480px]`.
- **New accounts start empty.** Seed/reset live under "Entwicklung" on the Profil screen and act on the signed-in user's Supabase rows; don't auto-seed.
- When adding derived/computed values, put them in `lib/domain/selectors.ts` as pure functions — keep components thin.

## Deployment & workflow

- Vercel is linked to the GitHub repo: every PR gets a **Preview**, merges to `main` deploy **Production**.
- `NEXT_PUBLIC_SUPABASE_*` must be set in Vercel for **both Preview and Production**; missing vars show up as `MIDDLEWARE_INVOCATION_FAILED` (500 on every route).
- Workflow: feature branch → PR → squash merge. Don't push to `main` directly. GitHub auto-deletes merged branches.
- **Supabase free tier pauses after 7 days of inactivity.** `vercel.json` schedules a daily Vercel Cron (Hobby plan: max once per day) hitting `/api/keepalive`, which runs one `count` query. It only runs on the Production deployment and only works if `CRON_SECRET` is set in Vercel Production (otherwise every call is a 401 and the project will pause).

## Version constraints (as of Nov 2026)

- **Next.js docs ship with the package:** `node_modules/next/dist/docs/` matches the installed version — check it before relying on memory for Next APIs. `AGENTS.md` is a managed file that `next dev` writes when it detects an AI agent (disable with `agentRules: false` in `next.config`); keep it committed.

- **TypeScript stays on 6.x:** `typescript-eslint` (peer `<6.1.0`) crashes on TS 7, even though `next build` and `tsc` work with it.
- **ESLint stays on 9.x:** `eslint-config-next`'s bundled `eslint-plugin-react`, `-import` and `-jsx-a11y` only declare support up to ESLint 9.
- **`npm audit`:** production deps are clean; the remaining moderate findings are dev-only (`typescript-eslint` → `minimatch@10`) with no upstream fix yet. Don't force them with `overrides`.
