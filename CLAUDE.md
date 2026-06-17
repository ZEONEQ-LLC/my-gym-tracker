# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-user mobile-web **Gym Tracker** built with Next.js 15 (App Router), React 19, TypeScript and Tailwind CSS v4. UI strings are German. Recreated from the design handoff in `design_handoff_gym_tracker/`.

**`design_handoff_gym_tracker/` is reference only** — never import from it; it is excluded in `tsconfig.json`. It holds the original design prototype (`.dc.html`) and its own `CLAUDE.md` describing the handoff. Treat that HTML as the source of truth for visuals/interaction and its README for the data model.

## Commands

```bash
npm run dev        # dev server (localhost:3000)
npm run build      # production build
npm run lint       # next lint
npm run typecheck  # tsc --noEmit
```

There is **no unit-test suite and no CI**. Verify changes by running the app in a browser — the data layer is client-side localStorage (see below), so behaviour only exists at runtime. Playwright is installed as a devDependency for this: load the browser once (`npx playwright install chromium`, deps via `npx playwright install-deps chromium`), start the dev server, and drive the running app with a throwaway script. Don't add a test runner or "verify by importing selectors" — go through the real UI. `build`, `lint` and `typecheck` currently pass and the full user flow has been browser-verified.

When running in OrbStack, start with `npm run dev -- -H 0.0.0.0` so the host can reach it at `http://my-gym-tracker.orb.local:3000` (or `http://localhost:3000` via port-forward).

## Architecture

Three layers, deliberately decoupled so storage can later move to Supabase:

1. **`lib/domain/`** — pure, framework-free logic. No React, no storage.
   - `types.ts` — `Exercise`, `HistoryEntry`, `SetEntry`, `Profile`, `GymData`.
   - `selectors.ts` — view-models (`vmGroups`, `vmDetail`, `vmProgress`, `vmRecent`) plus `topW`, `groupOrder`, `isDoneToday`. All derived state (done-today, streaks, deltas, weekly consistency) is computed here, never stored.
   - `drafts.ts` — form draft shapes + `buildLogDraft` (prefill rule), `keyFor`, `slugify`, `logHasValidSet`.
   - `date.ts` — local-ISO date helpers (`todayISO`, `fmtRel`, `weekStart`, …).
   - `migrate.ts` — load-time migration (legacy `devices`→`exercises`, default targets 3/10, drop dead `icon`). Runs on every load; keep it idempotent.
   - `seed.ts` — the 8 demo exercises (dev only).

2. **`lib/data/`** — storage + React data access.
   - `repository.ts` — the async `GymRepository` interface. **Every method takes `userId`** (today the constant `LOCAL_USER = "local"`) and mutations return the full updated `GymData`.
   - `local-storage-repository.ts` — current impl; one JSON blob under key `gymtracker_v1`, read-modify-write, migration on load.
   - `index.ts` — the factory (`getRepository`). **The only place to change for Supabase**: return a `SupabaseRepository` here.
   - `hooks.ts` — TanStack Query hooks. One query (`["gym","local"]`) holds all data; mutations write through the repo and `setQueryData` the returned `GymData`. Components only ever touch these hooks, never the repository directly.
   - `query-provider.tsx` — client `QueryClientProvider` (staleTime/gcTime Infinity — local data never goes stale).

3. **`app/` + `components/`** — UI. Routes:
   - `(shell)/` route group = tab shell with `BottomTabBar`: `/` (Übungen), `/verlauf`, `/profil`.
   - `uebung/` (outside the group, so **no tab bar**): `neu`, `[id]`, `[id]/eintragen`, `[id]/einstellungen`.
   - Navigation between list↔detail↔log uses `router.back()` so "return to where you came from" works without tracking it explicitly.

## Conventions & gotchas

- **Client-only data.** Pages that read data are `"use client"` and render a loading state until `useGymData()` resolves. localStorage is read in the query function (client only); `read()`/`write()` guard `typeof window`. Don't move data reads into Server Components.
- **Accent theming.** Colors are CSS variables `--accent` / `--accent-soft` on `<html>`, set at runtime by `components/layout/accent-sync.tsx` from `profile.accent`. In Tailwind, `bg-accent`/`text-accent` resolve to those vars (see `@theme` in `app/globals.css`). Use the token classes; avoid hard-coding the green.
- **Design tokens** live in `app/globals.css` under `@theme` (Tailwind v4 CSS-first). Fonts via `next/font` (Hanken Grotesk + JetBrains Mono → `font-sans`/`font-mono`).
- **No device frame.** The prototype's phone frame is preview-only; screens fill the viewport and respect `env(safe-area-inset-*)`. The app column is capped at `max-w-[480px]`.
- **Drafts are string-typed** (raw input) and parsed to numbers only on save (`saveLog`, `saveEdit`, `saveNewExercise`). Mirror this when adding form fields.
- **App starts empty.** Seed/reset live under "Entwicklung" on the Profil screen; don't auto-seed.
- When adding derived/computed values, put them in `lib/domain/selectors.ts` as pure functions — keep components thin.
