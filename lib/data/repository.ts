// Storage-agnostic data access. Every method is async and scoped by `userId`
// (the signed-in Supabase user). The active backend is SupabaseRepository; the
// factory in ./index.ts is the only place that chooses it. Mutations return the
// full updated GymData, which the query layer writes straight into its cache.

import { Exercise, GymData, HistoryEntry, Profile } from "@/lib/domain/types";

export interface GymRepository {
  load(userId: string): Promise<GymData>;

  /** Create or update an exercise (settings edits, photo, new exercise). */
  upsertExercise(userId: string, exercise: Exercise): Promise<GymData>;

  deleteExercise(userId: string, exerciseId: string): Promise<GymData>;

  /** Append a logged training session to an exercise. */
  addHistoryEntry(userId: string, exerciseId: string, entry: HistoryEntry): Promise<GymData>;

  updateProfile(userId: string, patch: Partial<Profile>): Promise<GymData>;

  /** Bulk replace — used for dev seed and reset. */
  replaceAll(userId: string, data: GymData): Promise<GymData>;
}
