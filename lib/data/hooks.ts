"use client";

// React data hooks over the repository. The whole GymData lives under one query
// key; every mutation writes through the repository and pushes the returned
// fresh GymData into the cache. Swapping to Supabase changes only the
// repository — these hooks stay identical (a future version might switch
// setQueryData for invalidateQueries to refetch from the server).

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Exercise, GymData, HistoryEntry, Profile } from "@/lib/domain/types";
import { getRepository, LOCAL_USER } from "./index";

const gymKey = ["gym", LOCAL_USER] as const;

export function useGymData() {
  const query = useQuery({
    queryKey: gymKey,
    queryFn: () => getRepository().load(LOCAL_USER),
  });
  return query;
}

function useGymMutation<TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<GymData>,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: TArgs) => fn(...vars),
    onSuccess: (data) => qc.setQueryData(gymKey, data),
  });
}

export function useUpsertExercise() {
  const m = useGymMutation((ex: Exercise) => getRepository().upsertExercise(LOCAL_USER, ex));
  return (ex: Exercise) => m.mutateAsync([ex]);
}

export function useDeleteExercise() {
  const m = useGymMutation((id: string) => getRepository().deleteExercise(LOCAL_USER, id));
  return (id: string) => m.mutateAsync([id]);
}

export function useAddHistoryEntry() {
  const m = useGymMutation((exId: string, entry: HistoryEntry) =>
    getRepository().addHistoryEntry(LOCAL_USER, exId, entry),
  );
  return (exId: string, entry: HistoryEntry) => m.mutateAsync([exId, entry]);
}

export function useUpdateProfile() {
  const m = useGymMutation((patch: Partial<Profile>) =>
    getRepository().updateProfile(LOCAL_USER, patch),
  );
  return (patch: Partial<Profile>) => m.mutateAsync([patch]);
}

export function useReplaceAll() {
  const m = useGymMutation((data: GymData) => getRepository().replaceAll(LOCAL_USER, data));
  return (data: GymData) => m.mutateAsync([data]);
}
