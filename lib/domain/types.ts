// Core domain types — source of truth for the data model.
// Mirrors the prototype's `data` shape (see README "Data model").

export type SetEntry = {
  reps: number;
  weight: number;
};

export type HistoryEntry = {
  id: string; // e.g. 'e' + Date.now()
  date: string; // 'YYYY-MM-DD' (local)
  variant: string; // variant name, or 'default'
  sets: SetEntry[];
  note: string;
};

export type Exercise = {
  id: string; // slug
  name: string;
  group: string; // category, e.g. 'Beine & Rumpf'
  photo: string | null; // data URL today; swap for a hosted URL in prod
  variants: string[] | null; // null = single variant ('default')
  targetSets: number; // default 3
  targetReps: number; // default 10
  // keyed by variant name (or 'default') → { paramName: value }
  settings: Record<string, Record<string, string>>;
  note: string; // "Zu beachten"
  history: HistoryEntry[];
};

export type Profile = {
  name: string;
  goal: string;
  warmup: string;
  /** Selected accent theme name (Emerald | Slate-Blau | Terrakotta | Pflaume). */
  accent: AccentName;
};

export type GymData = {
  exercises: Exercise[];
  profile: Profile;
};

export type AccentName = "Emerald" | "Slate-Blau" | "Terrakotta" | "Pflaume";

/** The variant key used when an exercise has no explicit variants. */
export const DEFAULT_VARIANT = "default";

export const DEFAULT_TARGET_SETS = 3;
export const DEFAULT_TARGET_REPS = 10;

export function emptyProfile(): Profile {
  return {
    name: "",
    goal: "",
    warmup: "5 Min Velo, danach Mobilität für Schultern & Hüfte.",
    accent: "Emerald",
  };
}

export function emptyData(): GymData {
  return { exercises: [], profile: emptyProfile() };
}
