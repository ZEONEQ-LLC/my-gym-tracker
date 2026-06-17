// Repository factory — the single place that selects the storage backend.
// Swapping to Supabase later means returning a SupabaseRepository here; nothing
// else in the app needs to change.

import { LocalStorageRepository } from "./local-storage-repository";
import { GymRepository, LOCAL_USER } from "./repository";

let instance: GymRepository | null = null;

export function getRepository(): GymRepository {
  if (!instance) instance = new LocalStorageRepository();
  return instance;
}

export { LOCAL_USER };
export type { GymRepository };
