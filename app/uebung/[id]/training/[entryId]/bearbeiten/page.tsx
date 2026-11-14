"use client";

// Edit a logged session: same fields as "Training eintragen", prefilled from
// the entry. Switching the variant only re-files the session; it keeps the
// entered sets (unlike logging, where it re-prefills from that variant).

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { SessionFields } from "@/components/exercise/session-fields";
import { Screen, ScreenHeader } from "@/components/ui/screen";
import { CenteredNote } from "@/components/ui/states";
import { StickyCta } from "@/components/ui/sticky-cta";
import { useGymData, useUpdateHistoryEntry } from "@/lib/data/hooks";
import { buildEntryDraft, keyFor, logHasValidSet, parseLogSets, type LogDraft } from "@/lib/domain/drafts";
import type { Exercise, HistoryEntry } from "@/lib/domain/types";

export default function EditTrainingPage() {
  const { id, entryId } = useParams<{ id: string; entryId: string }>();
  const { data, isPending } = useGymData();
  const exercise = data?.exercises.find((e) => e.id === id);
  const entry = exercise?.history.find((h) => h.id === entryId);

  if (isPending || !exercise || !entry) {
    return (
      <Screen>
        <ScreenHeader backLabel="Abbrechen" title="Training bearbeiten" />
        <CenteredNote>{isPending ? "Lädt …" : "Training nicht gefunden."}</CenteredNote>
      </Screen>
    );
  }

  return <EditTrainingForm key={`${exercise.id}:${entry.id}`} exercise={exercise} entry={entry} />;
}

function EditTrainingForm({ exercise, entry }: { exercise: Exercise; entry: HistoryEntry }) {
  const router = useRouter();
  const updateEntry = useUpdateHistoryEntry();
  const [variantKey, setVariantKey] = useState(() => keyFor(exercise, entry.variant));
  const [draft, setDraft] = useState<LogDraft>(() => buildEntryDraft(entry));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = !saving && !!draft.date && logHasValidSet(draft);

  async function save() {
    if (!canSave) return;
    const sets = parseLogSets(draft);
    if (!sets.length) return;
    setSaving(true);
    setError(null);
    try {
      await updateEntry(exercise.id, {
        ...entry,
        date: draft.date,
        variant: variantKey,
        sets,
        note: draft.note,
      });
      router.back();
    } catch {
      setSaving(false);
      setError("Speichern hat nicht geklappt. Bitte nochmals versuchen.");
    }
  }

  return (
    <Screen>
      <ScreenHeader backLabel="Abbrechen" title="Training bearbeiten" subtitle={exercise.name} />

      <div className="no-scrollbar flex-1 px-[22px] pt-2" style={{ paddingBottom: 110 }}>
        <SessionFields
          variants={exercise.variants}
          variantKey={variantKey}
          onVariantChange={setVariantKey}
          draft={draft}
          setDraft={setDraft}
        />
        {error ? <div className="mt-3 fs-13 text-neg">{error}</div> : null}
      </div>

      <StickyCta onClick={save} disabled={!canSave}>
        {saving ? "Sichert …" : "Sichern"}
      </StickyCta>
    </Screen>
  );
}
