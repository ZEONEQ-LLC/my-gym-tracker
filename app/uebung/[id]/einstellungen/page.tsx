"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { NumberField, TextArea, TextField } from "@/components/ui/fields";
import { CloseIcon, PlusIcon } from "@/components/ui/icons";
import { SectionLabel } from "@/components/ui/primitives";
import { Screen, ScreenHeader } from "@/components/ui/screen";
import { CenteredNote } from "@/components/ui/states";
import { StickyCta } from "@/components/ui/sticky-cta";
import { useGymData, useUpsertExercise } from "@/lib/data/hooks";
import { buildEditDraft, keyFor, type EditDraft } from "@/lib/domain/drafts";
import { DEFAULT_TARGET_REPS, DEFAULT_TARGET_SETS, type Exercise } from "@/lib/domain/types";

export default function EditSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const queryVariant = useSearchParams().get("v");
  const { data, isPending } = useGymData();
  const exercise = data?.exercises.find((e) => e.id === id);

  if (isPending || !exercise) {
    return (
      <Screen>
        <ScreenHeader backLabel="Abbrechen" title="Einstellungen" />
        <CenteredNote>{isPending ? "Lädt …" : "Übung nicht gefunden."}</CenteredNote>
      </Screen>
    );
  }

  const variantKey = keyFor(exercise, queryVariant);
  // Keyed so the draft re-initialises if exercise or variant changes.
  return <EditForm key={`${exercise.id}:${variantKey}`} exercise={exercise} variantKey={variantKey} />;
}

function EditForm({ exercise, variantKey }: { exercise: Exercise; variantKey: string }) {
  const router = useRouter();
  const upsertExercise = useUpsertExercise();
  const [draft, setDraft] = useState<EditDraft>(() => buildEditDraft(exercise, variantKey));

  const context = exercise.name + (exercise.variants ? " · " + variantKey : "");

  function setTarget(field: "targetSets" | "targetReps", value: string) {
    setDraft((d) => ({ ...d, [field]: value.replace(/[^0-9]/g, "") }));
  }
  function setRow(i: number, field: "name" | "value", value: string) {
    setDraft((d) => {
      const rows = d.rows.slice();
      rows[i] = { ...rows[i], [field]: value };
      return { ...d, rows };
    });
  }
  function removeRow(i: number) {
    setDraft((d) => {
      const rows = d.rows.slice();
      rows.splice(i, 1);
      return { ...d, rows };
    });
  }
  function addRow() {
    setDraft((d) => ({ ...d, rows: [...d.rows, { name: "", value: "" }] }));
  }

  async function save() {
    const obj: Record<string, string> = {};
    draft.rows.forEach((r) => {
      const n = (r.name || "").trim();
      if (n) obj[n] = r.value;
    });
    const settings = { ...(exercise.settings || {}), [variantKey]: obj };
    await upsertExercise({
      ...exercise,
      settings,
      note: draft.note,
      targetSets: Math.max(1, parseInt(draft.targetSets, 10) || DEFAULT_TARGET_SETS),
      targetReps: Math.max(1, parseInt(draft.targetReps, 10) || DEFAULT_TARGET_REPS),
    });
    router.back();
  }

  return (
    <Screen>
      <ScreenHeader backLabel="Abbrechen" title="Einstellungen" />

      <div className="no-scrollbar flex-1 px-[22px] pt-2" style={{ paddingBottom: 110 }}>
        <div className="mb-4 fs-13 text-ink-2">{context}</div>

        <SectionLabel className="mb-2">Zielvorgabe</SectionLabel>
        <div className="mb-5 flex items-center gap-3">
          <label className="flex-1">
            <NumberField value={draft.targetSets} onChange={(e) => setTarget("targetSets", e.target.value)} aria-label="Sätze" />
          </label>
          <span className="fs-13 text-muted">Sätze ×</span>
          <label className="flex-1">
            <NumberField value={draft.targetReps} onChange={(e) => setTarget("targetReps", e.target.value)} aria-label="Wiederholungen" />
          </label>
          <span className="fs-13 text-muted">Wdh</span>
        </div>

        <SectionLabel className="mb-2">Einstellungen</SectionLabel>
        <div className="flex flex-col gap-2.5">
          {draft.rows.map((r, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <label className="flex-1">
                <TextField placeholder="Eigenschaft" value={r.name} onChange={(e) => setRow(i, "name", e.target.value)} />
              </label>
              <label className="flex-1">
                <TextField placeholder="Wert" value={r.value} onChange={(e) => setRow(i, "value", e.target.value)} />
              </label>
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="flex h-[50px] w-[36px] shrink-0 items-center justify-center text-ink-2"
                aria-label="Eigenschaft entfernen"
              >
                <CloseIcon />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          className="mt-3 flex h-[46px] w-full items-center justify-center gap-2 rounded-[13px] border border-dashed fs-14 font-bold text-ink-2"
          style={{ borderColor: "#cfccc3" }}
        >
          <PlusIcon size={14} /> Eigenschaft hinzufügen
        </button>

        <div className="mt-5">
          <SectionLabel className="mb-2">Zu beachten</SectionLabel>
          <TextArea placeholder="Optionale Notiz …" value={draft.note} onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))} />
        </div>
      </div>

      <StickyCta onClick={save}>Sichern</StickyCta>
    </Screen>
  );
}
