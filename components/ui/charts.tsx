"use client";

import type { BarVM, WeekBarVM } from "@/lib/domain/selectors";

/** Progress mini bar chart on the exercise detail (last 6 sessions). */
export function ProgressBars({ bars }: { bars: BarVM[] }) {
  return (
    <div className="flex h-[112px] items-end justify-between gap-2">
      {bars.map((b, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="font-mono text-[11px] font-semibold text-ink-2">{b.weight}</span>
          <div
            className="w-full rounded-t-[6px]"
            style={{ height: b.h, background: b.accent ? "var(--accent)" : "#d7e7df" }}
          />
          <span className="text-[10.5px] text-muted">{b.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Weekly consistency chart on the history tab (last 8 weeks). */
export function WeekBars({ weeks }: { weeks: WeekBarVM[] }) {
  return (
    <div className="flex h-[120px] items-end justify-between gap-1.5">
      {weeks.map((w, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <span
            className="font-mono text-[11px] font-semibold"
            style={{ color: w.empty ? "#c4c8cb" : "#6b7177" }}
          >
            {w.count}
          </span>
          <div
            className="w-full rounded-t-[5px]"
            style={{
              height: w.h,
              background: w.empty ? "#ececea" : w.reached ? "var(--accent)" : "#bfe0d0",
            }}
          />
          <span
            className="text-[10px]"
            style={{ color: w.isCurrent ? "var(--accent)" : "#aab0b5", fontWeight: w.isCurrent ? 700 : 400 }}
          >
            {w.label}
          </span>
        </div>
      ))}
    </div>
  );
}
