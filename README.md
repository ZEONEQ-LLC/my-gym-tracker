# Gym Tracker

Mobile Web-App zum Tracken von Gym-Workouts: Übungen mit Maschinen-Einstellungen verwalten, Trainings (Datum, Sätze, Reps, Gewicht) protokollieren und Fortschritt + Konsequenz im Verlauf sehen. Jeder Nutzer hat ein eigenes Konto und sieht nur seine eigenen Daten. UI ist deutsch, optimiert fürs Smartphone.

Umgesetzt aus dem Design-Handoff in `design_handoff_gym_tracker/` (**nur Referenz, nicht Teil der App** — vom Build und Lint ausgeschlossen).

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript 6**
- **Tailwind CSS v4** (CSS-first Tokens in `app/globals.css`)
- **TanStack Query v5** als Datenschicht über einem austauschbaren Repository
- **Supabase** — Auth (E-Mail + Passwort) und Postgres mit Row-Level-Security
- **Vercel** — mit dem GitHub-Repo verknüpft (Preview pro PR, Production von `main`)

## Befehle

```bash
npm install        # Abhängigkeiten
npm run dev        # Dev-Server (http://localhost:3000)
npm run build      # Production-Build
npm start          # Production-Server (nach build)
npm run lint       # ESLint (Flat-Config in eslint.config.mjs)
npm run typecheck  # tsc --noEmit
```

`build`, `lint` und `typecheck` laufen sauber durch. Der komplette Nutzer-Flow wurde zuletzt im November 2026 nach dem Abhängigkeits-Update im Browser gegen Supabase verifiziert (Login, Route-Schutz, Übung mit Varianten anlegen, Einstellungen bearbeiten, Training eintragen inkl. Varianten-Wechsel, Persistenz, Akzent, Logout).

## Einrichtung

1. **`.env.local`** anlegen (ist gitignored):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   ```
2. **Schema** einmalig im Supabase SQL-Editor ausführen: `supabase/schema.sql` (Tabellen, RLS-Policies, Trigger für das Profil bei Registrierung). Das Skript ist idempotent und darf wiederholt laufen.
3. **Supabase Auth:** „Confirm email" ist ausgeschaltet → eine Registrierung meldet direkt an.

## Lokal testen

- **OrbStack:** Server mit `npm run dev -- -H 0.0.0.0` starten, dann im Host-Browser `http://my-gym-tracker.orb.local:3000` (oder via Port-Forwarding `http://localhost:3000`).
- Daten liegen **in Supabase, pro Konto** — nicht mehr im Browser. „Beispieldaten laden" / „Alle Übungen löschen" (Profil → Entwicklung) wirken auf das eigene Konto.
- **Browser-Verifikation:** Playwright ist als devDependency installiert. Browser einmalig laden mit `npx playwright install chromium` (System-Libs: `npx playwright install-deps chromium`), dann ein eigenes Treiber-Script gegen den laufenden Server fahren. Es gibt bewusst **keinen** Test-Runner und keine CI-Suite — verifiziert wird durch Bedienen der laufenden App.

## Screens

Tab-Shell (`Übungen` / `Verlauf` / `Profil`) plus gepushte Sub-Screens:

| Route | Screen |
|---|---|
| `/login` | Anmelden / Registrieren (einzige öffentliche Route) |
| `/` | Übungsliste (nach Kategorie gruppiert, Quick-Log, Done-today) |
| `/verlauf` | Verlauf: Stats, Wochen-Serie, Konsequenz-Chart, Fortschritt, alle Trainings |
| `/profil` | Name/Ziel/Aufwärmen, Akzentfarbe, Konto/Abmelden, Dev-Tools (Seed/Reset) |
| `/uebung/neu` | Neue Übung anlegen |
| `/uebung/[id]` | Detail: Einstellungen, Fortschritts-Chart, Verlauf |
| `/uebung/[id]/eintragen` | Training eintragen (Log) |
| `/uebung/[id]/einstellungen` | Einstellungen / Zielvorgabe bearbeiten |

## Datenhaltung

Der gesamte Zustand eines Nutzers (`GymData = { exercises, profile }`) wird über ein async **Repository-Interface** gelesen und geschrieben (`lib/data/repository.ts`). Die React-Schicht (`lib/data/hooks.ts`) spricht ausschließlich das Interface über TanStack Query an.

- **`SupabaseRepository`** (aktiv) — Tabellen `profiles`, `exercises`, `history_entries`; Mapping snake_case ↔ camelCase, `category` ↔ `group`, `jsonb` für `settings`/`sets`. Gelöschte Übungen nehmen ihre History per Foreign-Key-Cascade mit.
- **`LocalStorageRepository`** — bleibt als Referenz-Implementierung im Code, ist aber nicht mehr verdrahtet.
- Die Factory `lib/data/index.ts` ist der einzige Ort, der das Backend auswählt.

## Auth & Zugriffsschutz

- **`proxy.ts`** (Next 16, früher `middleware.ts`) erneuert bei jedem Request die Session und schützt die Routen: nicht angemeldet → `/login`; angemeldet auf `/login` → `/`.
- **Row-Level-Security:** Jede Tabelle hat `user_id` → `auth.users`; Policies erlauben select/insert/update/delete nur bei `auth.uid() = user_id`.
- **Profil-Trigger:** `handle_new_user` legt bei jeder Registrierung automatisch ein Profil an (`security definer`, `search_path = ''`).

## Deployment

- Vercel baut jeden PR als **Preview** und `main` als **Production**.
- Die beiden `NEXT_PUBLIC_SUPABASE_*`-Variablen müssen in Vercel für **Preview und Production** gesetzt sein — fehlen sie, scheitert der Proxy mit `MIDDLEWARE_INVOCATION_FAILED` (500 auf allen Routen).
- Workflow: Feature-Branch → PR → Squash-Merge auf `main`.

## Start-Daten

Ein neues Konto startet **leer** (Empty-States sind Teil des Designs). Zum Testen lädt der Profil-Screen unter „Entwicklung" die 8 Beispiel-Übungen (`lib/domain/seed.ts`) bzw. löscht alle Übungen.

## Projektstruktur

```
app/                  App-Router-Routen (Tab-Shell als (shell)-Group, /login, /uebung/…)
components/ui/        Primitives (Card, Felder, Charts, Chips, Screen, …)
components/exercise/  Feature-Komponenten (ExerciseCard, PhotoUpload)
components/layout/    BottomTabBar, AccentSync
lib/domain/           Reine Logik: types, selectors (View-Models), drafts, date, migrate, seed
lib/data/             Repository-Interface, Supabase- + localStorage-Impl, Factory, Query-Provider, Hooks
lib/supabase/         Browser-/Server-Client, Session-Refresh + Gating, AuthProvider
lib/theme/            Akzent-Themes
proxy.ts              Next-16-Proxy (Session + Route-Schutz)
supabase/schema.sql   Datenbank-Schema inkl. RLS und Trigger
```

## Bewusste Versionsgrenzen

Stand November 2026 — nicht blind hochziehen:

- **TypeScript 6, nicht 7:** `typescript-eslint` unterstützt TS 7 noch nicht (der Linter stürzt ab). Build und Typecheck würden mit TS 7 laufen.
- **ESLint 9, nicht 10:** Die von `eslint-config-next` mitgebrachten Plugins (`react`, `import`, `jsx-a11y`) unterstützen ESLint 10 noch nicht.
- **`npm audit`:** Produktions-Abhängigkeiten sind sauber. Die verbleibenden *moderate*-Meldungen betreffen nur Dev-Tooling (`typescript-eslint` → `minimatch@10`); dafür gibt es noch keinen Upstream-Fix.
