// Migration on load — carries legacy/partial persisted blobs forward to the
// current GymData shape. Keep this idempotent: it runs on every load.
//
// Rules (see README "Migration on load"):
//   - `devices` → `exercises`
//   - default targetSets=3, targetReps=10
//   - drop the legacy `icon` field (photos replaced icons)

import {
  AccentName,
  DEFAULT_TARGET_REPS,
  DEFAULT_TARGET_SETS,
  Exercise,
  GymData,
  Profile,
  emptyData,
  emptyProfile,
} from "./types";

const ACCENTS: AccentName[] = ["Emerald", "Slate-Blau", "Terrakotta", "Pflaume"];

export function migrate(raw: unknown): GymData {
  if (!raw || typeof raw !== "object") return emptyData();
  const d = raw as Record<string, unknown>;

  // devices → exercises
  if (d.devices && !d.exercises) {
    d.exercises = d.devices;
    delete d.devices;
  }

  const exercisesIn = Array.isArray(d.exercises) ? d.exercises : [];
  const exercises: Exercise[] = exercisesIn.map((ex) => migrateExercise(ex));

  return {
    exercises,
    profile: migrateProfile(d.profile),
  };
}

function migrateExercise(raw: unknown): Exercise {
  const ex = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  // drop legacy `icon`
  delete ex.icon;

  const variants = Array.isArray(ex.variants)
    ? (ex.variants as unknown[]).map(String)
    : null;

  return {
    id: String(ex.id ?? ""),
    name: String(ex.name ?? ""),
    group: String(ex.group ?? "Weitere"),
    photo: typeof ex.photo === "string" ? ex.photo : null,
    variants: variants && variants.length ? variants : null,
    targetSets: toPosInt(ex.targetSets, DEFAULT_TARGET_SETS),
    targetReps: toPosInt(ex.targetReps, DEFAULT_TARGET_REPS),
    settings: migrateSettings(ex.settings),
    note: String(ex.note ?? ""),
    history: Array.isArray(ex.history) ? (ex.history as Exercise["history"]) : [],
  };
}

function migrateSettings(raw: unknown): Record<string, Record<string, string>> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, Record<string, string>> = {};
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    if (val && typeof val === "object") {
      const inner: Record<string, string> = {};
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        inner[k] = v == null ? "" : String(v);
      }
      out[key] = inner;
    }
  }
  return out;
}

function migrateProfile(raw: unknown): Profile {
  const base = emptyProfile();
  if (!raw || typeof raw !== "object") return base;
  const p = raw as Record<string, unknown>;
  const accent = ACCENTS.includes(p.accent as AccentName)
    ? (p.accent as AccentName)
    : base.accent;
  return {
    name: typeof p.name === "string" ? p.name : base.name,
    goal: typeof p.goal === "string" ? p.goal : base.goal,
    warmup: typeof p.warmup === "string" ? p.warmup : base.warmup,
    accent,
  };
}

function toPosInt(v: unknown, fallback: number): number {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n >= 1 ? n : fallback;
}
