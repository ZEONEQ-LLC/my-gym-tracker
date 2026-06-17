"use client";

import type { ProgressExerciseVM } from "@/lib/domain/selectors";
import { Card } from "./primitives";

const DELTA_STYLE: Record<ProgressExerciseVM["deltaKind"], { color: string; bg: string }> = {
  up: { color: "#117a57", bg: "#e4f1ea" },
  down: { color: "#b0473b", bg: "#f7e9e6" },
  new: { color: "#8a8f95", bg: "#f0eee9" },
  hold: { color: "#8a8f95", bg: "#f0eee9" },
};

export function DeltaChip({ kind, text }: { kind: ProgressExerciseVM["deltaKind"]; text: string }) {
  const s = DELTA_STYLE[kind];
  return (
    <span
      className="inline-flex items-center rounded-[8px] px-2 py-1 text-[12px] font-bold"
      style={{ color: s.color, background: s.bg }}
    >
      {text}
    </span>
  );
}

/** Stat tile used on the history tab (big mono number + label). */
export function StatTile({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <Card className="flex flex-1 flex-col gap-1 px-3.5 py-3.5">
      <span className="font-mono text-[27px] font-extrabold leading-none text-ink">{value}</span>
      <span className="text-[12px] font-medium leading-tight text-ink-2">{label}</span>
    </Card>
  );
}

/** Date badge (day number + month) used in the "Alle Trainings" list. */
export function DateBadge({ day, mon }: { day: string; mon: string }) {
  return (
    <div className="flex h-[46px] w-[46px] flex-col items-center justify-center rounded-[12px] bg-fill-2">
      <span className="font-mono text-[17px] font-bold leading-none text-ink">{day}</span>
      <span className="text-[10px] font-semibold uppercase text-muted">{mon}</span>
    </div>
  );
}
