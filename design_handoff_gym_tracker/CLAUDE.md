# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is a **design handoff bundle**, not a runnable application. It describes a single-user
mobile web app for tracking gym workouts ("Gym Tracker"). The deliverable is to **recreate
the design in a target codebase** (React Native / Flutter / SwiftUI / React or Vue PWA) using
that environment's own patterns, component library, and storage layer.

There is no build, lint, or test setup here — the `.dc.html` prototype is opened directly in a
browser to interact with it. Do not try to "build" or "run tests" in this folder.

## The three files and how to use them

- **`README.md`** — the **source of truth for data model and behavior**. Read it fully before
  implementing anything. It specifies every screen, interaction, the persisted state shape, the
  `Exercise`/`HistoryEntry`/`SetEntry` types, derived values (done-today, streaks, deltas), and
  the design tokens (colors, typography, radii, spacing, accent themes).
- **`Gym Tracker.dc.html`** — the **source of truth for visuals and interaction**. It is a working
  prototype with all screens, real logic, and seed data, written with inline styles. Treat it as
  pixel/interaction reference. **Reference only — do not copy directly.** It embeds an authoritative
  implementation of the business logic (persistence, photo downscaling, accent map, seed data,
  derived calculations) inside its `<script type="text/x-dc">` block — read that script when you
  need to know exactly how a behavior works.
- **`support.js`** — the prototype's in-house component runtime (generated, "do not edit /
  do not port"). It is **not** part of the product. You only need to understand it enough to read
  the `.dc.html`; never reproduce it in the target codebase.

## Reading the `.dc.html` prototype

The prototype runs on a custom React-based template runtime (`support.js`), not plain HTML:
- The UI lives inside a single `<x-dc>` element; logic lives in the `<script type="text/x-dc"
  data-dc-script>` block as a `class Component extends DCLogic`.
- `DCLogic` gives the component `state`, `setState`-like updates, and methods; the template
  re-renders on state change (it compiles to `React.createElement`).
- Template directives: `{{ expr }}` interpolates; `<sc-if value="{{ ... }}">` conditionally
  renders; `<sc-for>` iterates. `hint-placeholder-*` attributes are design-tool hints only and
  carry no runtime meaning — ignore them when porting.
- All styling is inline `style="..."`; the accent color is driven by the CSS custom properties
  `--accent` / `--accent-soft` on the root element.

When recreating, **port the logic and visuals into idiomatic target-stack code** (components,
state management, styling system) — do not transcribe inline styles or the `<sc-*>` template form.

## Domain specifics worth knowing up front

- **Persistence:** prototype stores everything under one `localStorage` key, `gymtracker_v1`
  (JSON). Replace with the target app's storage, but keep a migration step on load.
- **Migration on load (carry forward):** rename legacy `devices` → `exercises`; default
  `targetSets=3` / `targetReps=10`; the legacy `icon` field is dead (photos replaced icons) —
  drop it. The prototype's `loadData()` shows the exact migration.
- **Data is user-scoped by design** (settings belong to the user, not globally) so a `userId`
  can be added later without restructuring — preserve this shape.
- **Variants:** an exercise either has `variants: null` (single variant keyed `'default'`) or a
  list of named variants; `settings` and history entries are keyed by variant name.
- **German UI:** all user-facing strings are German (Übungen / Verlauf / Profil, etc.). Keep them.
- **Photos** are user-captured at runtime, downscaled client-side to max 720px and stored as a
  ~0.82-quality JPEG data URL. The seed data ships no images.
- **Seed data** (8 exercises) lives in the prototype's `seed()` — for production, prefer an empty
  state or your own seeding strategy.
