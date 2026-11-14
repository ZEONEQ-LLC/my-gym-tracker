// Draft builders and form helpers — ports of the prototype's draft logic.
// Drafts hold string-typed fields (raw input values); they are parsed into the
// domain model only on save.

import { todayISO } from "./date";
import {
  DEFAULT_TARGET_REPS,
  DEFAULT_TARGET_SETS,
  DEFAULT_VARIANT,
  Exercise,
  HistoryEntry,
  SetEntry,
} from "./types";

export type SetDraft = { reps: string; weight: string };

export type LogDraft = {
  date: string;
  sets: SetDraft[];
  note: string;
};

export type ParamDraft = { name: string; value: string };

export type EditDraft = {
  rows: ParamDraft[];
  note: string;
  targetSets: string;
  targetReps: string;
};

export type NewExerciseDraft = {
  name: string;
  group: string;
  customGroup: string;
  photo: string | null;
  useVariants: boolean;
  variantRows: { name: string }[];
  targetSets: string;
  targetReps: string;
  paramRows: ParamDraft[];
  note: string;
};

/**
 * Variant key for an exercise given the active variant ('default' when none).
 * An unknown variant (e.g. a stale `?v=` in the URL) falls back to the first one,
 * so nothing is ever saved under a variant the exercise doesn't have.
 */
export function keyFor(ex: Exercise, activeVariant: string | null): string {
  if (!ex.variants) return DEFAULT_VARIANT;
  return activeVariant && ex.variants.includes(activeVariant) ? activeVariant : ex.variants[0];
}

/**
 * Prefill rule: sets come from the last session of that exercise/variant
 * (reps + weight); if no history, from the exercise target
 * (targetSets rows × targetReps).
 */
export function buildLogDraft(ex: Exercise, key: string): LogDraft {
  const hist = (ex.history || [])
    .filter((e) => (ex.variants ? e.variant === key : true))
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const last = hist[0];
  const ts = Math.max(1, ex.targetSets || DEFAULT_TARGET_SETS);
  const tr = ex.targetReps || DEFAULT_TARGET_REPS;
  const sets: SetDraft[] = last
    ? last.sets.map((s) => ({ reps: String(s.reps || tr), weight: String(s.weight) }))
    : Array.from({ length: ts }, () => ({ reps: String(tr), weight: "" }));
  return { date: todayISO(), sets, note: "" };
}

/** Log save is enabled once at least one set has reps > 0. */
export function logHasValidSet(draft: LogDraft): boolean {
  return draft.sets.some((s) => (parseInt(s.reps, 10) || 0) > 0);
}

/** Draft for editing an already logged session: its own date, sets and note. */
export function buildEntryDraft(entry: HistoryEntry): LogDraft {
  return {
    date: entry.date,
    sets: entry.sets.map((s) => ({ reps: String(s.reps), weight: String(s.weight) })),
    note: entry.note || "",
  };
}

/**
 * Parse the draft's sets for saving: reps as integers, weight accepting a
 * decimal comma; sets without reps are dropped.
 */
export function parseLogSets(draft: LogDraft): SetEntry[] {
  return draft.sets
    .map((s) => ({
      reps: parseInt(s.reps, 10) || 0,
      weight: parseFloat(String(s.weight).replace(",", ".")) || 0,
    }))
    .filter((s) => s.reps > 0);
}

/** Edit-settings draft for one variant: its parameter rows, note and targets. */
export function buildEditDraft(ex: Exercise, key: string): EditDraft {
  const settings = (ex.settings && ex.settings[key]) || {};
  return {
    rows: Object.keys(settings).map((name) => ({ name, value: String(settings[name] ?? "") })),
    note: ex.note || "",
    targetSets: String(ex.targetSets || DEFAULT_TARGET_SETS),
    targetReps: String(ex.targetReps || DEFAULT_TARGET_REPS),
  };
}

export function slugify(s: string): string {
  return (
    (s || "")
      .toLowerCase()
      .replace(/[äàá]/g, "a")
      .replace(/[öòó]/g, "o")
      .replace(/[üùú]/g, "u")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "uebung"
  );
}

export function newExerciseDraft(defaultGroup: string): NewExerciseDraft {
  return {
    name: "",
    group: defaultGroup,
    customGroup: "",
    photo: null,
    useVariants: false,
    variantRows: [{ name: "" }, { name: "" }],
    targetSets: String(DEFAULT_TARGET_SETS),
    targetReps: String(DEFAULT_TARGET_REPS),
    paramRows: [{ name: "", value: "" }],
    note: "",
  };
}
