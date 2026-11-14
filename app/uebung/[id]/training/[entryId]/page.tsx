"use client";

// Training detail: one logged session of an exercise. Reached by tapping a
// session in the exercise's "Verlauf" or in the Verlauf tab's "Alle Trainings".
// Primary action edits the session; deleting asks for an inline confirmation.

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { TrashIcon } from "@/components/ui/icons";
import { Card, Eyebrow, SectionLabel } from "@/components/ui/primitives";
import { Screen, ScreenHeader } from "@/components/ui/screen";
import { CenteredNote } from "@/components/ui/states";
import { StickyCta } from "@/components/ui/sticky-cta";
import { useDeleteHistoryEntry, useGymData } from "@/lib/data/hooks";
import { vmEntry } from "@/lib/domain/selectors";

export default function TrainingDetailPage() {
  const router = useRouter();
  const { id, entryId } = useParams<{ id: string; entryId: string }>();
  const { data, isPending } = useGymData();
  const deleteEntry = useDeleteHistoryEntry();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exercise = data?.exercises.find((e) => e.id === id);
  const vm = useMemo(() => (exercise ? vmEntry(exercise, entryId) : null), [exercise, entryId]);

  if (isPending || !vm) {
    return (
      <Screen>
        <ScreenHeader />
        <CenteredNote>
          {isPending ? "Lädt …" : deleting ? "Training gelöscht." : "Training nicht gefunden."}
        </CenteredNote>
      </Screen>
    );
  }

  async function remove() {
    setDeleting(true);
    setError(null);
    try {
      await deleteEntry(id, entryId);
      router.back();
    } catch {
      setDeleting(false);
      setError("Löschen hat nicht geklappt. Bitte nochmals versuchen.");
    }
  }

  return (
    <Screen>
      <ScreenHeader />

      <div className="no-scrollbar flex-1 px-[22px] pt-1" style={{ paddingBottom: 110 }}>
        <Eyebrow>
          {vm.exerciseName}
          {vm.variant ? ` · ${vm.variant}` : ""}
        </Eyebrow>
        <h1 className="mt-1 fs-24 font-extrabold leading-tight tracking-[-0.5px] text-ink">
          {vm.dateLong}
        </h1>
        <div className="mt-1 fs-13 text-ink-2">{vm.rel}</div>

        <Card className="mt-5 flex px-2 py-3">
          <Stat value={String(vm.setCount)} label={vm.setCount === 1 ? "Satz" : "Sätze"} />
          <Stat value={`${vm.topWeight} kg`} label="Top-Gewicht" />
          <Stat value={`${vm.volumeText} kg`} label="Volumen" />
        </Card>

        <div className="mt-6">
          <SectionLabel className="mb-2">Sätze</SectionLabel>
          <Card className="px-4 py-1">
            {vm.sets.map((s, i) => (
              <div
                key={s.n}
                className="flex items-center justify-between py-3"
                style={i > 0 ? { borderTop: "1px solid #f0eee9" } : undefined}
              >
                <span className="fs-14 text-ink-2">Satz {s.n}</span>
                <span className="font-mono fs-15 font-bold text-ink">
                  {s.reps} × {s.weight} kg
                </span>
              </div>
            ))}
          </Card>
        </div>

        {vm.hasNote ? (
          <div className="mt-5">
            <SectionLabel className="mb-2">Notiz</SectionLabel>
            <div className="rounded-[15px] bg-fill-2 px-4 py-3 fs-14 leading-snug text-ink">{vm.note}</div>
          </div>
        ) : null}

        <div className="mt-8">
          {confirming ? (
            <div className="rounded-[15px] border border-line bg-surface p-4">
              <div className="fs-15 font-bold text-ink">Training wirklich löschen?</div>
              <div className="mt-0.5 fs-13 text-ink-2">Das lässt sich nicht rückgängig machen.</div>
              <div className="mt-3 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={deleting}
                  className="h-[46px] flex-1 rounded-[13px] bg-fill fs-14 font-bold text-ink"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={remove}
                  disabled={deleting}
                  className="h-[46px] flex-1 rounded-[13px] bg-neg fs-14 font-bold text-white"
                >
                  {deleting ? "Löscht …" : "Löschen"}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[13px] border fs-14 font-bold text-neg"
              style={{ borderColor: "#ecd3ce" }}
            >
              <TrashIcon size={15} /> Training löschen
            </button>
          )}
          {error ? <div className="mt-2 fs-13 text-neg">{error}</div> : null}
        </div>
      </div>

      <StickyCta onClick={() => router.push(`/uebung/${id}/training/${entryId}/bearbeiten`)}>
        Training bearbeiten
      </StickyCta>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 text-center">
      <span className="font-mono fs-16 font-bold leading-tight text-ink">{value}</span>
      <span className="fs-12 text-ink-2">{label}</span>
    </div>
  );
}
