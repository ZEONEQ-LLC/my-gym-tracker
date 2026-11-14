"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SessionFields } from "@/components/exercise/session-fields";
import { Screen, ScreenHeader } from "@/components/ui/screen";
import { CenteredNote } from "@/components/ui/states";
import { StickyCta } from "@/components/ui/sticky-cta";
import { useAddHistoryEntry, useGymData } from "@/lib/data/hooks";
import { buildLogDraft, keyFor, logHasValidSet, parseLogSets, type LogDraft } from "@/lib/domain/drafts";
import type { Exercise } from "@/lib/domain/types";

export default function LogPage() {
  const { id } = useParams<{ id: string }>();
  const queryVariant = useSearchParams().get("v");
  const { data, isPending } = useGymData();
  const exercise = data?.exercises.find((e) => e.id === id);

  if (isPending || !exercise) {
    return (
      <Screen>
        <ScreenHeader backLabel="Abbrechen" title="Training eintragen" />
        <CenteredNote>{isPending ? "Lädt …" : "Übung nicht gefunden."}</CenteredNote>
      </Screen>
    );
  }

  // The form owns its draft state; keying by exercise resets it if the user
  // lands on a different exercise.
  return <LogForm key={exercise.id} exercise={exercise} initialVariant={queryVariant} />;
}

function LogForm({ exercise, initialVariant }: { exercise: Exercise; initialVariant: string | null }) {
  const router = useRouter();
  const addHistoryEntry = useAddHistoryEntry();
  const [variantKey, setVariantKey] = useState(() => keyFor(exercise, initialVariant));
  const [draft, setDraft] = useState<LogDraft>(() => buildLogDraft(exercise, variantKey));

  const canSave = !!draft.date && logHasValidSet(draft);

  // Switching variant re-prefills the sets for that variant but keeps the
  // entered date + note (matches the prototype's onLogVariant).
  function switchVariant(v: string) {
    setVariantKey(v);
    setDraft((d) => ({ ...buildLogDraft(exercise, v), date: d.date, note: d.note }));
  }

  async function save() {
    if (!canSave) return;
    const sets = parseLogSets(draft);
    if (!sets.length) return;
    await addHistoryEntry(exercise.id, {
      id: "e" + Date.now(),
      date: draft.date,
      variant: variantKey,
      sets,
      note: draft.note,
    });
    router.back();
  }

  return (
    <Screen>
      <ScreenHeader backLabel="Abbrechen" title="Training eintragen" subtitle={exercise.name} />

      <div className="no-scrollbar flex-1 px-[22px] pt-2" style={{ paddingBottom: 110 }}>
        <SessionFields
          variants={exercise.variants}
          variantKey={variantKey}
          onVariantChange={switchVariant}
          draft={draft}
          setDraft={setDraft}
        />
      </div>

      <StickyCta onClick={save} disabled={!canSave}>
        Sichern
      </StickyCta>
    </Screen>
  );
}
