// Storage-agnostic data access. Every method is async and scoped by `userId`
// so the localStorage implementation can later be swapped for a Supabase one
// without touching any caller. Mutations return the full updated GymData; the
// query layer sets that straight into its cache (works equally for a
// read-modify-write localStorage blob and for a Supabase round-trip).

import { Exercise, GymData, HistoryEntry, Profile } from "@/lib/domain/types";

/** Single implicit user today. A real userId slots in here for multi-user. */
export const LOCAL_USER = "local";

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
