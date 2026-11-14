"use client";

// Form body shared by "Training eintragen" and "Training bearbeiten": variant
// toggle, date, the sets editor and the note. The parent owns the draft state
// and decides what a variant switch does (re-prefill when logging, keep the
// sets when editing).

import { NumberField, TextArea, TextField } from "@/components/ui/fields";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";
import { SectionLabel } from "@/components/ui/primitives";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { LogDraft } from "@/lib/domain/drafts";

type Props = {
  variants: string[] | null;
  variantKey: string;
  onVariantChange: (v: string) => void;
  draft: LogDraft;
  setDraft: React.Dispatch<React.SetStateAction<LogDraft>>;
};

export function SessionFields({ variants, variantKey, onVariantChange, draft, setDraft }: Props) {
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

  return (
    <>
      {variants ? (
        <div className="mb-4">
          <SegmentedControl options={variants} value={variantKey} onChange={onVariantChange} />
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
            <span className="w-5 shrink-0 text-center font-mono fs-14 font-bold text-ink-2">
              {i + 1}
            </span>
            <label className="flex-1">
              <NumberField
                placeholder="Wdh"
                aria-label={`Satz ${i + 1} Wiederholungen`}
                value={s.reps}
                onChange={(e) => setSet(i, "reps", e.target.value)}
              />
            </label>
            <span className="fs-13 text-muted">×</span>
            <label className="flex-1">
              <NumberField
                inputMode="decimal"
                placeholder="kg"
                aria-label={`Satz ${i + 1} Gewicht in kg`}
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
        className="mt-3 flex h-[46px] w-full items-center justify-center gap-2 rounded-[13px] border border-dashed fs-14 font-bold text-ink-2"
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
    </>
  );
}
