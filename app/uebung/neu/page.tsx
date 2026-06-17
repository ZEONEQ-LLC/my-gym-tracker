"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PhotoUpload } from "@/components/exercise/photo";
import { NumberField, TextArea, TextField } from "@/components/ui/fields";
import { CloseIcon, PlusIcon } from "@/components/ui/icons";
import { SectionLabel } from "@/components/ui/primitives";
import { Screen, ScreenHeader } from "@/components/ui/screen";
import { StickyCta } from "@/components/ui/sticky-cta";
import { useGymData, useUpsertExercise } from "@/lib/data/hooks";
import { newExerciseDraft, slugify } from "@/lib/domain/drafts";
import { groupOrder } from "@/lib/domain/selectors";
import { DEFAULT_TARGET_REPS, DEFAULT_TARGET_SETS, Exercise } from "@/lib/domain/types";

export default function NewExercisePage() {
  const router = useRouter();
  const { data } = useGymData();
  const upsertExercise = useUpsertExercise();

  const groups = useMemo(() => groupOrder(data?.exercises ?? []), [data]);
  const [draft, setDraft] = useState(() => newExerciseDraft(""));

  // default-select the first group only once groups are known
  const selectedGroup = draft.customGroup.trim() ? null : draft.group || groups[0] || "";

  const canSave = draft.name.trim().length > 0;

  function patch(p: Partial<typeof draft>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  async function save() {
    const name = draft.name.trim();
    if (!name) return;
    const group = draft.customGroup.trim() || draft.group || groups[0] || "Weitere";
    const variants = draft.useVariants
      ? draft.variantRows.map((v) => v.name.trim()).filter(Boolean)
      : [];
    const paramObj: Record<string, string> = {};
    draft.paramRows.forEach((r) => {
      const n = r.name.trim();
      if (n) paramObj[n] = r.value || "";
    });
    const settings: Record<string, Record<string, string>> = {};
    if (variants.length) variants.forEach((v) => (settings[v] = { ...paramObj }));
    else settings.default = paramObj;

    let id = slugify(name);
    if ((data?.exercises ?? []).some((e) => e.id === id)) {
      id = id + "-" + Date.now().toString(36).slice(-4);
    }

    const exercise: Exercise = {
      id,
      name,
      group,
      photo: draft.photo || null,
      variants: variants.length ? variants : null,
      targetSets: Math.max(1, parseInt(draft.targetSets, 10) || DEFAULT_TARGET_SETS),
      targetReps: Math.max(1, parseInt(draft.targetReps, 10) || DEFAULT_TARGET_REPS),
      settings,
      note: draft.note || "",
      history: [],
    };
    await upsertExercise(exercise);
    router.replace(`/uebung/${id}`);
  }

  return (
    <Screen>
      <ScreenHeader backLabel="Abbrechen" title="Neue Übung" />

      <div className="no-scrollbar flex-1 px-[22px] pt-2" style={{ paddingBottom: 110 }}>
        <SectionLabel className="mb-2">Name</SectionLabel>
        <TextField placeholder="z. B. Beinpresse" value={draft.name} onChange={(e) => patch({ name: e.target.value })} />

        <div className="mt-5">
          <SectionLabel className="mb-2">Foto</SectionLabel>
          <div className="flex items-center gap-3.5">
            <PhotoUpload
              photo={draft.photo}
              size={76}
              radius={17}
              onChange={(url) => patch({ photo: url })}
              onRemove={() => patch({ photo: null })}
            />
            <div className="text-[12.5px] leading-snug text-ink-2">
              {draft.photo ? "Tippe auf ✕ zum Entfernen." : "Optional – Maschine fotografieren oder hochladen."}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <SectionLabel className="mb-2">Kategorie</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {groups.map((g) => {
              const on = g === selectedGroup;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => patch({ group: g, customGroup: "" })}
                  className="rounded-full border px-3 py-1.5 text-[13px] font-semibold"
                  style={{
                    background: on ? "var(--accent-soft)" : "#fff",
                    borderColor: on ? "var(--accent)" : "#e6e4df",
                    color: on ? "var(--accent)" : "#55595e",
                  }}
                >
                  {g}
                </button>
              );
            })}
          </div>
          <TextField
            className="mt-2.5"
            placeholder="Eigene Kategorie …"
            value={draft.customGroup}
            onChange={(e) => patch({ customGroup: e.target.value })}
          />
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <SectionLabel>Varianten</SectionLabel>
            <Toggle on={draft.useVariants} onChange={(on) => patch({ useVariants: on })} />
          </div>
          {draft.useVariants ? (
            <div className="mt-2.5 flex flex-col gap-2.5">
              {draft.variantRows.map((v, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <TextField
                    placeholder={`Variante ${i + 1}`}
                    value={v.name}
                    onChange={(e) => {
                      const variantRows = draft.variantRows.slice();
                      variantRows[i] = { name: e.target.value };
                      patch({ variantRows });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (draft.variantRows.length <= 1) return;
                      const variantRows = draft.variantRows.slice();
                      variantRows.splice(i, 1);
                      patch({ variantRows });
                    }}
                    className="flex h-[50px] w-[36px] shrink-0 items-center justify-center text-ink-2"
                    aria-label="Variante entfernen"
                  >
                    <CloseIcon />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => patch({ variantRows: [...draft.variantRows, { name: "" }] })}
                className="flex h-[44px] w-full items-center justify-center gap-2 rounded-[13px] border border-dashed text-[13.5px] font-bold text-ink-2"
                style={{ borderColor: "#cfccc3" }}
              >
                <PlusIcon size={13} /> Variante hinzufügen
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-5">
          <SectionLabel className="mb-2">Zielvorgabe</SectionLabel>
          <div className="flex items-center gap-3">
            <label className="flex-1">
              <NumberField value={draft.targetSets} onChange={(e) => patch({ targetSets: e.target.value.replace(/[^0-9]/g, "") })} aria-label="Sätze" />
            </label>
            <span className="text-[13px] text-muted">Sätze ×</span>
            <label className="flex-1">
              <NumberField value={draft.targetReps} onChange={(e) => patch({ targetReps: e.target.value.replace(/[^0-9]/g, "") })} aria-label="Wiederholungen" />
            </label>
            <span className="text-[13px] text-muted">Wdh</span>
          </div>
        </div>

        <div className="mt-5">
          <SectionLabel className="mb-2">Einstellungs-Eigenschaften</SectionLabel>
          <div className="flex flex-col gap-2.5">
            {draft.paramRows.map((r, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <TextField
                  placeholder="Eigenschaft"
                  value={r.name}
                  onChange={(e) => {
                    const paramRows = draft.paramRows.slice();
                    paramRows[i] = { ...paramRows[i], name: e.target.value };
                    patch({ paramRows });
                  }}
                />
                <TextField
                  placeholder="Wert"
                  value={r.value}
                  onChange={(e) => {
                    const paramRows = draft.paramRows.slice();
                    paramRows[i] = { ...paramRows[i], value: e.target.value };
                    patch({ paramRows });
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const paramRows = draft.paramRows.slice();
                    paramRows.splice(i, 1);
                    patch({ paramRows: paramRows.length ? paramRows : [{ name: "", value: "" }] });
                  }}
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
            onClick={() => patch({ paramRows: [...draft.paramRows, { name: "", value: "" }] })}
            className="mt-3 flex h-[44px] w-full items-center justify-center gap-2 rounded-[13px] border border-dashed text-[13.5px] font-bold text-ink-2"
            style={{ borderColor: "#cfccc3" }}
          >
            <PlusIcon size={13} /> Eigenschaft hinzufügen
          </button>
        </div>

        <div className="mt-5">
          <SectionLabel className="mb-2">Zu beachten</SectionLabel>
          <TextArea placeholder="Optionale Notiz …" value={draft.note} onChange={(e) => patch({ note: e.target.value })} />
        </div>
      </div>

      <StickyCta onClick={save} disabled={!canSave}>
        Übung erstellen
      </StickyCta>
    </Screen>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="relative h-[26px] w-[46px] rounded-full transition-colors"
      style={{ background: on ? "var(--accent)" : "#d2cfc7" }}
    >
      <span
        className="absolute top-[3px] h-5 w-5 rounded-full bg-white transition-all"
        style={{ left: on ? 23 : 3 }}
      />
    </button>
  );
}
