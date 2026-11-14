"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { NumberField, TextArea, TextField } from "@/components/ui/fields";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";
import { SectionLabel } from "@/components/ui/primitives";
import { Screen, ScreenHeader } from "@/components/ui/screen";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { CenteredNote } from "@/components/ui/states";
import { StickyCta } from "@/components/ui/sticky-cta";
import { useAddHistoryEntry, useGymData } from "@/lib/data/hooks";
import { buildLogDraft, keyFor, logHasValidSet, type LogDraft } from "@/lib/domain/drafts";
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

  const canSave = logHasValidSet(draft);

  // Switching variant re-prefills the sets for that variant but keeps the
  // entered date + note (matches the prototype's onLogVariant).
  function switchVariant(v: string) {
    setVariantKey(v);
    setDraft((d) => ({ ...buildLogDraft(exercise, v), date: d.date, note: d.note }));
  }
  function setSet(i: number, field: "reps" | "weight", value: string) {
    setDraft((d) => {
      const sets = d.sets.slice();
      sets[i] = { ...sets[i], [field]: value };
      return { ...d, sets };
    });
  }
  function addSet() {
    setDraft((d) => {
      const last = d.sets[d.sets.length - 1];
      return { ...d, sets: [...d.sets, { reps: "", weight: last ? last.weight : "" }] };
    });
  }
  function removeSet(i: number) {
    setDraft((d) => {
      if (d.sets.length <= 1) return d;
      const sets = d.sets.slice();
      sets.splice(i, 1);
      return { ...d, sets };
    });
  }

  async function save() {
    if (!canSave) return;
    const sets = draft.sets
      .map((s) => ({
        reps: parseInt(s.reps, 10) || 0,
        weight: parseFloat(String(s.weight).replace(",", ".")) || 0,
      }))
      .filter((s) => s.reps > 0);
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
        {exercise.variants ? (
          <div className="mb-4">
            <SegmentedControl options={exercise.variants} value={variantKey} onChange={switchVariant} />
          </div>
        ) : null}

        <div className="mb-4">
          <SectionLabel className="mb-2">Datum</SectionLabel>
          <TextField
            type="date"
            value={draft.date}
            onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
          />
        </div>

        <SectionLabel className="mb-2">Sätze</SectionLabel>
        <div className="flex flex-col gap-2.5">
          {draft.sets.map((s, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span className="w-5 shrink-0 text-center font-mono text-[14px] font-bold text-ink-2">
                {i + 1}
              </span>
              <label className="flex-1">
                <NumberField
                  placeholder="Wdh"
                  value={s.reps}
                  onChange={(e) => setSet(i, "reps", e.target.value)}
                />
              </label>
              <span className="text-[13px] text-muted">×</span>
              <label className="flex-1">
                <NumberField
                  inputMode="decimal"
                  placeholder="kg"
                  value={s.weight}
                  onChange={(e) => setSet(i, "weight", e.target.value)}
                />
              </label>
              <button
                type="button"
                onClick={() => removeSet(i)}
                disabled={draft.sets.length <= 1}
                className="flex h-[50px] w-[40px] shrink-0 items-center justify-center text-ink-2"
                style={{ opacity: draft.sets.length > 1 ? 1 : 0.25 }}
                aria-label="Satz entfernen"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addSet}
          className="mt-3 flex h-[46px] w-full items-center justify-center gap-2 rounded-[13px] border border-dashed text-[14px] font-bold text-ink-2"
          style={{ borderColor: "#cfccc3" }}
        >
          <PlusIcon size={14} /> Satz hinzufügen
        </button>

        <div className="mt-5">
          <SectionLabel className="mb-2">Notiz</SectionLabel>
          <TextArea
            placeholder="Optionale Notiz …"
            value={draft.note}
            onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
          />
        </div>
      </div>

      <StickyCta onClick={save} disabled={!canSave}>
        Sichern
      </StickyCta>
    </Screen>
  );
}
