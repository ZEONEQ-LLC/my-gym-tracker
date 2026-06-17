// Supabase implementation of GymRepository.
//
// Mapping (DB column ↔ domain field):
//   exercises.category ↔ group, target_sets ↔ targetSets, target_reps ↔ targetReps
//   exercises.settings (jsonb) ↔ settings, exercises.variants (text[]) ↔ variants
//   history_entries.exercise_id ↔ exerciseId, .sets (jsonb) ↔ sets, .date (date) ↔ date
//
// RLS scopes every row to auth.uid(), so reads are already user-bound; we still
// pass user_id on writes (required by the insert/update WITH CHECK policies) and
// filter reads by it defensively. Mutations re-load the full GymData so the
// query cache always holds a consistent snapshot (same contract as the old
// localStorage repo).

import { emptyProfile, Exercise, GymData, HistoryEntry, Profile } from "@/lib/domain/types";
import { createClient } from "@/lib/supabase/client";
import { GymRepository } from "./repository";

type ExerciseRow = {
  user_id: string;
  id: string;
  name: string;
  category: string;
  photo: string | null;
  variants: string[] | null;
  target_sets: number;
  target_reps: number;
  settings: Record<string, Record<string, string>> | null;
  note: string | null;
  created_at?: string;
};

type HistoryRow = {
  user_id: string;
  id: string;
  exercise_id: string;
  date: string;
  variant: string;
  sets: { reps: number; weight: number }[] | null;
  note: string | null;
};

type ProfileRow = {
  user_id: string;
  name: string;
  goal: string;
  warmup: string;
  accent: Profile["accent"];
};

function rowToHistory(r: HistoryRow): HistoryEntry {
  return {
    id: r.id,
    date: r.date,
    variant: r.variant,
    sets: r.sets ?? [],
    note: r.note ?? "",
  };
}

function rowToExercise(r: ExerciseRow, history: HistoryEntry[]): Exercise {
  return {
    id: r.id,
    name: r.name,
    group: r.category,
    photo: r.photo ?? null,
    variants: r.variants && r.variants.length ? r.variants : null,
    targetSets: r.target_sets,
    targetReps: r.target_reps,
    settings: r.settings ?? {},
    note: r.note ?? "",
    history,
  };
}

function exerciseToRow(userId: string, ex: Exercise): ExerciseRow {
  return {
    user_id: userId,
    id: ex.id,
    name: ex.name,
    category: ex.group,
    photo: ex.photo,
    variants: ex.variants,
    target_sets: ex.targetSets,
    target_reps: ex.targetReps,
    settings: ex.settings,
    note: ex.note,
  };
}

function historyToRow(userId: string, exerciseId: string, e: HistoryEntry): HistoryRow {
  return {
    user_id: userId,
    id: e.id,
    exercise_id: exerciseId,
    date: e.date,
    variant: e.variant,
    sets: e.sets,
    note: e.note,
  };
}

function profileToRow(userId: string, p: Profile): ProfileRow {
  return { user_id: userId, name: p.name, goal: p.goal, warmup: p.warmup, accent: p.accent };
}

export class SupabaseRepository implements GymRepository {
  private client() {
    return createClient();
  }

  async load(userId: string): Promise<GymData> {
    const supabase = this.client();
    const [profileRes, exercisesRes, historyRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("exercises").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
      supabase.from("history_entries").select("*").eq("user_id", userId),
    ]);

    if (exercisesRes.error) throw exercisesRes.error;
    if (historyRes.error) throw historyRes.error;
    if (profileRes.error) throw profileRes.error;

    const historyByExercise = new Map<string, HistoryEntry[]>();
    for (const row of (historyRes.data ?? []) as HistoryRow[]) {
      const list = historyByExercise.get(row.exercise_id) ?? [];
      list.push(rowToHistory(row));
      historyByExercise.set(row.exercise_id, list);
    }

    const exercises = ((exercisesRes.data ?? []) as ExerciseRow[]).map((r) =>
      rowToExercise(r, historyByExercise.get(r.id) ?? []),
    );

    const profileRow = profileRes.data as ProfileRow | null;
    const profile: Profile = profileRow
      ? {
          name: profileRow.name ?? "",
          goal: profileRow.goal ?? "",
          warmup: profileRow.warmup ?? "",
          accent: profileRow.accent ?? "Emerald",
        }
      : emptyProfile();

    return { exercises, profile };
  }

  async upsertExercise(userId: string, exercise: Exercise): Promise<GymData> {
    const supabase = this.client();
    // Only the exercise row is written here; history is owned by addHistoryEntry.
    const { error } = await supabase.from("exercises").upsert(exerciseToRow(userId, exercise));
    if (error) throw error;
    return this.load(userId);
  }

  async deleteExercise(userId: string, exerciseId: string): Promise<GymData> {
    const supabase = this.client();
    // history rows cascade via the composite FK on delete.
    const { error } = await supabase
      .from("exercises")
      .delete()
      .eq("user_id", userId)
      .eq("id", exerciseId);
    if (error) throw error;
    return this.load(userId);
  }

  async addHistoryEntry(userId: string, exerciseId: string, entry: HistoryEntry): Promise<GymData> {
    const supabase = this.client();
    const { error } = await supabase
      .from("history_entries")
      .insert(historyToRow(userId, exerciseId, entry));
    if (error) throw error;
    return this.load(userId);
  }

  async updateProfile(userId: string, patch: Partial<Profile>): Promise<GymData> {
    const supabase = this.client();
    const { error } = await supabase
      .from("profiles")
      .upsert({ user_id: userId, ...patch }, { onConflict: "user_id" });
    if (error) throw error;
    return this.load(userId);
  }

  async replaceAll(userId: string, data: GymData): Promise<GymData> {
    const supabase = this.client();

    // Wipe existing exercises (history cascades) and write the new set.
    const del = await supabase.from("exercises").delete().eq("user_id", userId);
    if (del.error) throw del.error;

    const prof = await supabase
      .from("profiles")
      .upsert(profileToRow(userId, data.profile), { onConflict: "user_id" });
    if (prof.error) throw prof.error;

    if (data.exercises.length) {
      const exRows = data.exercises.map((ex) => exerciseToRow(userId, ex));
      const exIns = await supabase.from("exercises").insert(exRows);
      if (exIns.error) throw exIns.error;

      const histRows = data.exercises.flatMap((ex) =>
        ex.history.map((e) => historyToRow(userId, ex.id, e)),
      );
      if (histRows.length) {
        const histIns = await supabase.from("history_entries").insert(histRows);
        if (histIns.error) throw histIns.error;
      }
    }

    return this.load(userId);
  }
}
