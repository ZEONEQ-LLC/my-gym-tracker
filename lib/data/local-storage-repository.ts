// localStorage implementation of GymRepository. Persists the whole GymData blob
// under a single key (matching the prototype's `gymtracker_v1`) and runs the
// migration on every load. All mutations are read-modify-write on that blob.
//
// Note: `userId` is accepted for interface parity but, since localStorage is
// inherently single-user/single-device, it is not used to scope the key today.

import { migrate } from "@/lib/domain/migrate";
import { emptyData, Exercise, GymData, HistoryEntry, Profile } from "@/lib/domain/types";
import { GymRepository } from "./repository";

const STORAGE_KEY = "gymtracker_v1";

function read(): GymData {
  if (typeof window === "undefined") return emptyData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData();
    return migrate(JSON.parse(raw));
  } catch {
    return emptyData();
  }
}

function write(data: GymData): GymData {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // quota / serialization errors are swallowed (matches prototype)
    }
  }
  return data;
}

export class LocalStorageRepository implements GymRepository {
  async load(): Promise<GymData> {
    return read();
  }

  async upsertExercise(_userId: string, exercise: Exercise): Promise<GymData> {
    const data = read();
    const idx = data.exercises.findIndex((e) => e.id === exercise.id);
    const exercises = data.exercises.slice();
    if (idx >= 0) exercises[idx] = exercise;
    else exercises.push(exercise);
    return write({ ...data, exercises });
  }

  async deleteExercise(_userId: string, exerciseId: string): Promise<GymData> {
    const data = read();
    return write({
      ...data,
      exercises: data.exercises.filter((e) => e.id !== exerciseId),
    });
  }

  async addHistoryEntry(_userId: string, exerciseId: string, entry: HistoryEntry): Promise<GymData> {
    const data = read();
    const exercises = data.exercises.map((e) =>
      e.id === exerciseId ? { ...e, history: [...(e.history || []), entry] } : e,
    );
    return write({ ...data, exercises });
  }

  async updateProfile(_userId: string, patch: Partial<Profile>): Promise<GymData> {
    const data = read();
    return write({ ...data, profile: { ...data.profile, ...patch } });
  }

  async replaceAll(_userId: string, data: GymData): Promise<GymData> {
    return write(data);
  }
}
