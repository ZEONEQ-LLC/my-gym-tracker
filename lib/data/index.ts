// Repository factory — the single place that selects the storage backend.
// The app now runs on Supabase; the LocalStorageRepository is kept around as a
// reference implementation (and a possible offline fallback) but is no longer
// wired in.

import { SupabaseRepository } from "./supabase-repository";
import { GymRepository } from "./repository";

let instance: GymRepository | null = null;

export function getRepository(): GymRepository {
  if (!instance) instance = new SupabaseRepository();
  return instance;
}

export type { GymRepository };
