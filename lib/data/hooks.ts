"use client";

// React data hooks over the repository. The whole GymData lives under the query
// key ["gym", userId]; every mutation writes through the repository and pushes
// the returned fresh GymData into that user's cache. The userId comes from the
// authenticated Supabase session (useUserId) — queries stay disabled until a
// user is present, so nothing runs on the login screen.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Exercise, GymData, HistoryEntry, Profile } from "@/lib/domain/types";
import { useUserId } from "@/lib/supabase/use-user";
import { getRepository } from "./index";

function gymKey(userId: string | null) {
  return ["gym", userId] as const;
}

export function useGymData() {
  const userId = useUserId();
  return useQuery({
    queryKey: gymKey(userId),
    queryFn: () => getRepository().load(userId as string),
    enabled: !!userId,
  });
}

function useGymMutation<TArgs extends unknown[]>(
  userId: string | null,
  fn: (...args: TArgs) => Promise<GymData>,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: TArgs) => fn(...vars),
    onSuccess: (data) => qc.setQueryData(gymKey(userId), data),
  });
}

export function useUpsertExercise() {
  const userId = useUserId();
  const m = useGymMutation(userId, (ex: Exercise) =>
    getRepository().upsertExercise(userId as string, ex),
  );
  return (ex: Exercise) => m.mutateAsync([ex]);
}

export function useDeleteExercise() {
  const userId = useUserId();
  const m = useGymMutation(userId, (id: string) =>
    getRepository().deleteExercise(userId as string, id),
  );
  return (id: string) => m.mutateAsync([id]);
}

export function useAddHistoryEntry() {
  const userId = useUserId();
  const m = useGymMutation(userId, (exId: string, entry: HistoryEntry) =>
    getRepository().addHistoryEntry(userId as string, exId, entry),
  );
  return (exId: string, entry: HistoryEntry) => m.mutateAsync([exId, entry]);
}

export function useUpdateProfile() {
  const userId = useUserId();
  const m = useGymMutation(userId, (patch: Partial<Profile>) =>
    getRepository().updateProfile(userId as string, patch),
  );
  return (patch: Partial<Profile>) => m.mutateAsync([patch]);
}

export function useReplaceAll() {
  const userId = useUserId();
  const m = useGymMutation(userId, (data: GymData) =>
    getRepository().replaceAll(userId as string, data),
  );
  return (data: GymData) => m.mutateAsync([data]);
}
