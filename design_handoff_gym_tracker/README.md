# Handoff: Gym-Workout Tracker (Mobile Web App)

## Overview
A single-user mobile web app for tracking gym workouts. The user maintains a list of **exercises** (each optionally tied to a machine with saved settings), reviews those settings at the gym, and logs each training session with date, sets, reps and weight. Progress and training consistency are visualised in a dedicated history view.

Built from a paper form ("Trainings Protokoll", REHA Zentrum Papieri). The two logical halves of that form map directly to the app:
1. **Settings** per exercise — machine parameters the user wants to remember (e.g. seat height, backrest position).
2. **Logbook** — dated training entries with sets/reps/weight.

> **Single-user today, multi-user later.** All data currently lives in `localStorage` under one implicit user. The data model is intentionally user-scoped (settings belong to the user, not globally) so a `userId` can be introduced later without restructuring.

## About the Design Files
The file in this bundle (`Gym Tracker.dc.html`) is a **design reference created in HTML** — a working prototype showing the intended look, layout and behaviour. It is **not production code to copy directly.** It runs on a small in-house component runtime (`support.js`, also bundled for reference only) and uses inline styles throughout.

**The task is to recreate this design in the target codebase's environment** (React Native, Flutter, SwiftUI, a React/Vue PWA, etc.) using that environment's established patterns, component library and state/storage layer. If no codebase exists yet, choose the most appropriate stack for a single-user mobile web/native app and implement the design there. Treat the HTML as the source of truth for *visuals and interaction*, and this README as the source of truth for *data model and behaviour*.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, icons and interactions. Recreate the UI faithfully (the rounded device frame in the prototype is just a preview shell — build the screens to fill the real device viewport, respecting safe areas). The design is sized for **iPhone 17 Pro Max (440 × 956 pt logical)** but should be responsive down to smaller phones.

---

## Screens / Views

The app has a **bottom tab bar** with three tabs: **Übungen** (Exercises), **Verlauf** (History/Progress), **Profil** (Profile). On top of the tabbed shell sit several pushed sub-screens (exercise detail, log entry, edit settings, new exercise).

### 1. Übungen (Exercise List) — main tab
- **Purpose:** Browse all exercises grouped by category; jump directly into logging; see at a glance what's already done today.
- **Layout:** Vertical scroll. Header ("Hoi!" eyebrow + "Übungen" H1 + goal subtitle top-right). Search field. Then category sections ("BEINE & RUMPF", "OBERKÖRPER" …), each a label + a stack of exercise cards (gap 10px). A dashed "Neue Übung" button closes the list.
- **Exercise card** (`display:flex`, white-ish `#fdfcf9`, border `#e8e5dd`, radius 17px):
  - Left tappable region → opens detail. Contains: 54×54 photo thumbnail (radius 13px, `object-fit:cover`) or a dashed camera placeholder; exercise name (16px/700); subtitle line.
  - Subtitle shows `Zuletzt {topWeight} kg · {relativeDate}`, or "Noch nicht trainiert", or a variant badge ("2 Varianten").
  - Right 64px button → quick-log (skips detail). Shows a "+ Eintragen" affordance in accent-soft.
  - **Done-today state:** if any history entry has today's date → card border becomes accent green, thumbnail gets a green check badge (bottom-right), subtitle becomes "Heute erledigt" in accent/700, and the right button flips to a **filled green "Erledigt"** button with a checkmark (still tappable to add another set).

### 2. Übungsdetail (Exercise Detail) — pushed
- **Purpose:** Review settings, see progress chart + history, start a log, edit settings.
- **Layout:** Sticky top bar (back + edit). Header row: 76×76 photo (tap to upload, ✕ to remove) + category eyebrow + name H1. A target chip below ("Ziel · 3 Sätze × 10 Wdh", accent-soft pill). For exercises with variants, a segmented variant toggle. Then: **Einstellungen** card (parameter rows: name left, value right; empty values show "—"). **"Zu beachten"** note block (if present). **Fortschritt** mini bar chart (last 6 sessions, newest bar in accent). **Verlauf** list of past entries (date, rel-date, set chips "12 × 80 kg", optional note). A sticky bottom **"+ Training eintragen"** primary button.

### 3. Training eintragen (Log Entry) — pushed
- **Purpose:** Record one session.
- **Layout:** Sticky bar with "Abbrechen" + title ("Training eintragen") + exercise name. For variant exercises, a segmented toggle that re-prefills the sets when switched. Date field (defaults today). A list of **set rows**: each has set number, a reps input and a weight input (both numeric), and a remove button (disabled-look when only one set). "+ Satz hinzufügen" button. Optional note textarea. Sticky bottom **"Sichern"** button (disabled/grey until at least one set has reps > 0).
- **Prefill rule:** sets are prefilled from the **last session** of that exercise/variant (reps + weight); if no history, from the exercise **target** (`targetSets` rows × `targetReps`).

### 4. Einstellungen bearbeiten (Edit Settings) — pushed
- **Purpose:** Edit a single variant's machine settings, target, and note.
- **Layout:** Context line (exercise · variant). **Zielvorgabe**: two numeric inputs (Sätze × Wdh). **Einstellungen**: editable parameter rows (name + value), each removable; "+ Eigenschaft hinzufügen". Note textarea. "Sichern" saves into `settings[variantKey]`.

### 5. Neue Übung (New Exercise) — pushed
- **Purpose:** Create an exercise, with or without a machine.
- **Layout:** Name input. **Foto** upload tile (76×76) + helper text / "Foto entfernen". **Kategorie** chips (existing groups) + free-text custom group. **Varianten** toggle → if on, list of variant name rows ("+ Variante hinzufügen"). **Zielvorgabe** (Sätze × Wdh). **Einstellungs-Eigenschaften** rows (name + value). Note. "Übung erstellen" button. An exercise needs only a name — settings/variants are optional (e.g. bodyweight exercises like push-ups).

### 6. Verlauf (History & Progress) — tab
- **Purpose:** See progress and how consistently the user trains.
- **Layout:** H1 "Verlauf" + subtitle. Then:
  - **3 stat tiles:** "Diese Woche" (training days this week), "Wochen-Serie 🔥" (consecutive weeks with ≥1 training), "Trainings total" (distinct training days ever).
  - **Konsequenz** card: bar chart of the last 8 weeks, one bar per week = number of training days that week. Bars are accent-green when the weekly goal (2×) is reached, light-green for 1×, grey for 0. Current week's label is highlighted. Subtitle "Ziel 2× / Woche".
  - **Fortschritt** list: per exercise, best weight + a delta chip vs. the first recorded session (↑ +10 kg / ↓ / "gehalten" / "Neu"), sorted by biggest gain.
  - **Alle Trainings**: full chronological history (date badge, exercise, set summary, top weight).
  - Empty state when no history.

### 7. Profil (Profile) — tab
- **Purpose:** User-level fields (name, goal, warm-up note) + the accent color tweak. Single-user today; this is where a future account/login would live.

---

## Interactions & Behavior
- **Navigation:** tab bar switches Übungen/Verlauf/Profil. Cards push detail; back returns. Quick-log and "Training eintragen" both open the log screen; on save/cancel the user returns to wherever they came from (list vs. detail).
- **Quick log from list:** tapping "Eintragen"/"Erledigt" on a card sets that exercise active (first variant if any) and opens the log screen directly.
- **Variant switching in log:** changing the segmented toggle rebuilds the set prefill for that variant but keeps the entered date and note.
- **Photo upload:** native file input (`accept="image/*"`, which offers camera on mobile). Image is downscaled client-side to max 720px and stored as a compressed JPEG data URL (~quality 0.82). ✕ removes it.
- **Done-today detection:** an exercise is "done today" if any history entry's `date` equals today's local ISO date (`YYYY-MM-DD`). State resets automatically at midnight (it's derived, not stored).
- **Save-button enablement:** log "Sichern" is disabled until at least one set has reps > 0.
- **Animations:** subtle entrance transitions (`gtIn` fade+rise 8px; `gtSheet` for pushed screens 24px). Keep durations short (~200–260ms, ease-out).
- **Scroll:** hidden scrollbars; sticky headers and sticky bottom CTAs with a fade gradient behind them.

## State Management
Per-exercise and global app state. Suggested store shape (mirrors the prototype's `data`):
- `exercises: Exercise[]`
- `profile: { name, goal, warmup }`
- UI/navigation state: `tab`, `screen`, `activeId` (current exercise), `activeVariant`, `search`, plus transient drafts: `logDraft`, `editDraft`, `newExerciseDraft`, and `logReturn` ('list' | 'exercise').
- **Persistence:** prototype uses `localStorage` key `gymtracker_v1` (JSON). Replace with the target app's storage (AsyncStorage / IndexedDB / backend API). Keep a migration step on load (see below).
- **Derived (not stored):** done-today flag, progress deltas, weekly consistency buckets, streak — compute from `history`.

### Data model
```ts
type SetEntry   = { reps: number; weight: number };
type HistoryEntry = {
  id: string;            // e.g. 'e' + Date.now()
  date: string;          // 'YYYY-MM-DD' (local)
  variant: string;       // variant name, or 'default'
  sets: SetEntry[];
  note: string;
};
type Exercise = {
  id: string;            // slug
  name: string;
  group: string;         // category, e.g. 'Beine & Rumpf'
  photo: string | null;  // data URL today; swap for a hosted URL in prod
  variants: string[] | null;   // null = single variant ('default')
  targetSets: number;    // default 3
  targetReps: number;    // default 10
  settings: Record<string, Record<string, string>>;
    // keyed by variant name (or 'default') → { paramName: value }
  note: string;          // "Zu beachten"
  history: HistoryEntry[];
};
```
**Migration on load** (carry forward): `devices` → `exercises`; default `targetSets=3`, `targetReps=10`; drop the legacy `icon` field (no longer used — photos replaced icons).

## Design Tokens
**Colors**
- Accent (primary / Emerald): `#117a57`
- Accent-soft (tint): `#e4f1ea`
- Text primary: `#1d2024`
- Text secondary: `#8a8f95` / muted `#9aa0a6`
- Eyebrow/label: `#a7a399`
- Surface (cards): `#fdfcf9`; card border `#e8e5dd`
- App background (inside frame): `#f7f6f3`; page behind frame: `#e9e8e3`
- Placeholder fills: `#efeee9` / `#f1f0eb`; dashed borders `#cfccc3`
- Positive delta: text `#117a57` on `#e4f1ea`; negative delta: text `#b0473b` on `#f7e9e6`
- Bar chart: newest/accent `#117a57`, prior `#d7e7df`; consistency light-green `#bfe0d0`, empty `#ececea`
- Device frame: `#16181b`
- **Selectable accent themes (tweak):** Emerald `#117a57`/`#e4f1ea` (default), Slate-Blau `#2c5fb8`/`#e6ecf7`, Terrakotta `#b35a33`/`#f6e7df`, Pflaume `#6a4a9c`/`#ece5f4`. The accent is applied via CSS custom properties `--accent` / `--accent-soft`.

**Typography**
- UI font: **Hanken Grotesk** (400/500/600/700/800), fallback `system-ui, sans-serif`.
- Numeric / mono: **JetBrains Mono** (500/600/700) — used for weights, reps, stats, time.
- Scale (px): H1 30/800 (−0.8 letter-spacing); section title 16/700; card title 16/700; body 13–15; labels 12/700 uppercase +0.5; stat numbers 27/800 mono; eyebrow 11.5/700 uppercase +1.

**Radius:** cards 15–18px; thumbnails 13px; inputs 13px; pills 6–10px; device frame 60px (border 11px).
**Spacing:** screen padding 22px horizontal; card gaps 10px; control heights 50px; tab bar ~92px with safe-area bottom padding.
**Shadows:** soft only — e.g. active segmented control `0 1px 4px rgba(0,0,0,0.1)`; device `0 30px 70px -22px rgba(40,40,30,0.45)`.

## Assets
- **Fonts:** Hanken Grotesk + JetBrains Mono via Google Fonts (use the codebase's font pipeline / bundle them in native).
- **Icons:** simple inline SVGs (camera placeholder, check, plus, chevron, battery/signal in the status bar). No external icon set — recreate with the codebase's icon system.
- **Exercise photos:** user-supplied at runtime (camera/upload). The seed data ships **no** images. The original PDF's machine photos could not be cleanly extracted, so photos are user-captured.
- **Seed data:** the prototype seeds 8 exercises (Beinpresse, Leg curl/extension, Hyperextension, Back curl/extension, Ruderzug/Brustpresse, Latzug, Seilzug, Langhantel Rack) with realistic settings/history for demoing — replace with empty state or your own seeding strategy.

## Files
- `Gym Tracker.dc.html` — the full design prototype (all screens, logic, seed data). Open in a browser to interact with it. **Reference only.**
- `support.js` — the prototype runtime that renders the `.dc.html`. **Reference only — do not port.**
