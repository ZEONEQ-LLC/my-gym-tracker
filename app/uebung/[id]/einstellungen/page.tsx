"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { NumberField, TextArea, TextField } from "@/components/ui/fields";
import { CloseIcon, PlusIcon } from "@/components/ui/icons";
import { SectionLabel } from "@/components/ui/primitives";
import { Screen, ScreenHeader } from "@/components/ui/screen";
import { CenteredNote } from "@/components/ui/states";
import { StickyCta } from "@/components/ui/sticky-cta";
import { useGymData, useUpsertExercise } from "@/lib/data/hooks";
import { keyFor, type EditDraft, type ParamDraft } from "@/lib/domain/drafts";
import { DEFAULT_TARGET_REPS, DEFAULT_TARGET_SETS } from "@/lib/domain/types";

export default function EditSettingsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const queryVariant = useSearchParams().get("v");
  const { data, isPending } = useGymData();
  const upsertExercise = useUpsertExercise();

  const exercise = data?.exercises.find((e) => e.id === id);
  const key = exercise ? keyFor(exercise, queryVariant) : "default";
  const [draft, setDraft] = useState<EditDraft | null>(null);

  useEffect(() => {
    if (!exercise) return;
    const settings = (exercise.settings && exercise.settings[key]) || {};
    const rows: ParamDraft[] = Object.keys(settings).map((n) => ({ name: n, value: String(settings[n] ?? "") }));
    setDraft({
      rows,
      note: exercise.note || "",
      targetSets: String(exercise.targetSets || DEFAULT_TARGET_SETS),
      targetReps: String(exercise.targetReps || DEFAULT_TARGET_REPS),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise?.id, key]);

  if (isPending || (exercise && !draft)) {
    return (
      <Screen>
        <ScreenHeader backLabel="Abbrechen" title="Einstellungen" />
        <CenteredNote>Lädt …</CenteredNote>
      </Screen>
    );
  }
  if (!exercise || !draft) {
    return (
      <Screen>
        <ScreenHeader backLabel="Abbrechen" title="Einstellungen" />
        <CenteredNote>Übung nicht gefunden.</CenteredNote>
      </Screen>
    );
  }

  const context = exercise.name + (exercise.variants ? " · " + key : "");

  function setTarget(field: "targetSets" | "targetReps", value: string) {
    setDraft((d) => (d ? { ...d, [field]: value.replace(/[^0-9]/g, "") } : d));
  }
  function setRow(i: number, field: "name" | "value", value: string) {
    setDraft((d) => {
      if (!d) return d;
      const rows = d.rows.slice();
      rows[i] = { ...rows[i], [field]: value };
      return { ...d, rows };
    });
  }
  function removeRow(i: number) {
    setDraft((d) => {
      if (!d) return d;
      const rows = d.rows.slice();
      rows.splice(i, 1);
      return { ...d, rows };
    });
  }
  function addRow() {
    setDraft((d) => (d ? { ...d, rows: [...d.rows, { name: "", value: "" }] } : d));
  }

  async function save() {
    if (!exercise || !draft) return;
    const obj: Record<string, string> = {};
    draft.rows.forEach((r) => {
      const n = (r.name || "").trim();
      if (n) obj[n] = r.value;
    });
    const settings = { ...(exercise.settings || {}), [key]: obj };
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
        <div className="mb-4 text-[13px] text-ink-2">{context}</div>

        <SectionLabel className="mb-2">Zielvorgabe</SectionLabel>
        <div className="mb-5 flex items-center gap-3">
          <label className="flex-1">
            <NumberField value={draft.targetSets} onChange={(e) => setTarget("targetSets", e.target.value)} aria-label="Sätze" />
          </label>
          <span className="text-[13px] text-muted">Sätze ×</span>
          <label className="flex-1">
            <NumberField value={draft.targetReps} onChange={(e) => setTarget("targetReps", e.target.value)} aria-label="Wiederholungen" />
          </label>
          <span className="text-[13px] text-muted">Wdh</span>
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
          className="mt-3 flex h-[46px] w-full items-center justify-center gap-2 rounded-[13px] border border-dashed text-[14px] font-bold text-ink-2"
          style={{ borderColor: "#cfccc3" }}
        >
          <PlusIcon size={14} /> Eigenschaft hinzufügen
        </button>

        <div className="mt-5">
          <SectionLabel className="mb-2">Zu beachten</SectionLabel>
          <TextArea placeholder="Optionale Notiz …" value={draft.note} onChange={(e) => setDraft((d) => (d ? { ...d, note: e.target.value } : d))} />
        </div>
      </div>

      <StickyCta onClick={save}>Sichern</StickyCta>
    </Screen>
  );
}
