# Gym Tracker

Single-user mobile web app zum Tracken von Gym-Workouts: Übungen mit Maschinen-Einstellungen verwalten, Trainings (Datum, Sätze, Reps, Gewicht) protokollieren und Fortschritt + Konsequenz im Verlauf sehen. UI ist deutsch, optimiert fürs Smartphone.

Umgesetzt aus dem Design-Handoff in `design_handoff_gym_tracker/` (**nur Referenz, nicht Teil der App** — vom Build ausgeschlossen).

## Stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** (CSS-first Tokens in `app/globals.css`)
- **TanStack Query v5** als Datenschicht über einem austauschbaren Repository
- **Persistenz:** heute `localStorage`; der Data-Layer ist so gebaut, dass später Supabase mit `userId` andocken kann (siehe unten)

## Befehle

```bash
npm install        # Abhängigkeiten
npm run dev        # Dev-Server (http://localhost:3000)
npm run build      # Production-Build
npm start          # Production-Server (nach build)
npm run lint       # ESLint (next lint)
npm run typecheck  # tsc --noEmit
```

`build`, `lint` und `typecheck` laufen sauber durch; der komplette Nutzer-Flow wurde im Browser verifiziert (Empty-State, Seed, Übung anlegen, Training eintragen inkl. Done-today, Verlauf/Streak, Akzentwechsel, Persistenz nach Reload).

## Lokal testen

Daten liegen pro Browser im `localStorage` (Key `gymtracker_v1`) — also nur auf dem Gerät/Browser, mit dem du testest. Reset über **Profil → „Alle Übungen löschen"**, Beispieldaten über **Profil → „Beispieldaten laden"**.

- **OrbStack:** Server mit `npm run dev -- -H 0.0.0.0` starten, dann im Host-Browser `http://my-gym-tracker.orb.local:3000` (oder via Port-Forwarding `http://localhost:3000`).
- **Browser-Verifikation (optional):** Playwright ist als devDependency installiert. Browser-Binaries einmalig laden mit `npx playwright install chromium` (System-Libs: `npx playwright install-deps chromium`), dann ein eigenes Treiber-Script gegen den laufenden Server fahren. Es ist bewusst **kein** Test-Runner/CI-Suite eingerichtet — verifiziert wird durch Bedienen der laufenden App.

## Screens

Tab-Shell (`Übungen` / `Verlauf` / `Profil`) plus gepushte Sub-Screens:

| Route | Screen |
|---|---|
| `/` | Übungsliste (nach Kategorie gruppiert, Quick-Log, Done-today) |
| `/verlauf` | Verlauf: Stats, Wochen-Serie, Konsequenz-Chart, Fortschritt, alle Trainings |
| `/profil` | Name/Ziel/Aufwärmen, Akzentfarbe, Dev-Tools (Seed/Reset) |
| `/uebung/neu` | Neue Übung anlegen |
| `/uebung/[id]` | Detail: Einstellungen, Fortschritts-Chart, Verlauf |
| `/uebung/[id]/eintragen` | Training eintragen (Log) |
| `/uebung/[id]/einstellungen` | Einstellungen / Zielvorgabe bearbeiten |

## Datenhaltung & Supabase-Migration

Der gesamte Zustand (`GymData = { exercises, profile }`) wird über ein async **Repository-Interface** gelesen/geschrieben (`lib/data/repository.ts`). Aktuelle Implementierung: `LocalStorageRepository` (ein JSON-Blob unter dem Key `gymtracker_v1`, Migration bei jedem Load). Die React-Schicht (`lib/data/hooks.ts`) spricht ausschließlich das Interface über TanStack Query an.

**Umstieg auf Supabase** betrifft nur eine Datei: eine `SupabaseRepository`-Klasse schreiben und in `lib/data/index.ts` (der Factory) zurückgeben. Jede Repo-Methode nimmt bereits `userId` (heute Konstante `"local"`) — Interface und alle Aufrufer bleiben unverändert.

## Start-Daten

Die App startet **leer** (Empty-States sind Teil des Designs). Zum Testen lädt der Profil-Screen unter „Entwicklung" die 8 Beispiel-Übungen (`lib/domain/seed.ts`) bzw. löscht alle Übungen.

## Projektstruktur

```
app/                 App-Router-Routen (Tab-Shell als (shell)-Group)
components/ui/        Primitives (Card, Felder, Charts, Chips, Screen, …)
components/exercise/  Feature-Komponenten (ExerciseCard, PhotoUpload)
components/layout/    BottomTabBar, AccentSync
lib/domain/           Reine Logik: types, selectors (View-Models), drafts, date, migrate, seed
lib/data/             Repository, localStorage-Impl, Factory, Query-Provider, Hooks
lib/theme/            Akzent-Themes
```
