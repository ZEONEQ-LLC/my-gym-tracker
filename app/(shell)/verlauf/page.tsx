"use client";

import { useMemo } from "react";
import { WeekBars } from "@/components/ui/charts";
import { DateBadge, DeltaChip, StatTile } from "@/components/ui/chips";
import { Card, SectionLabel } from "@/components/ui/primitives";
import { CenteredNote, EmptyState } from "@/components/ui/states";
import { useGymData } from "@/lib/data/hooks";
import { vmProgress, vmRecent } from "@/lib/domain/selectors";

export default function VerlaufPage() {
  const { data, isPending } = useGymData();
  const progress = useMemo(() => (data ? vmProgress(data) : null), [data]);
  const recent = useMemo(() => (data ? vmRecent(data) : []), [data]);

  return (
    <div className="animate-in">
      <header className="pt-3.5 pb-3">
        <h1 className="text-[30px] font-extrabold tracking-[-0.8px] text-ink">Verlauf</h1>
        <div className="mt-0.5 text-[13px] text-ink-2">Dein Fortschritt und deine Konsequenz.</div>
      </header>

      {isPending ? (
        <CenteredNote>Lädt …</CenteredNote>
      ) : !progress?.hasData ? (
        <EmptyState
          title="Noch keine Trainings"
          hint="Sobald du ein Training einträgst, erscheinen hier Statistiken und Fortschritt."
        />
      ) : (
        <>
          <div className="flex gap-2.5">
            <StatTile value={progress.thisWeek} label="Diese Woche" />
            <StatTile value={progress.streak} label="Wochen-Serie 🔥" />
            <StatTile value={progress.total} label="Trainings total" />
          </div>

          <section className="mt-6">
            <div className="mb-2 flex items-baseline justify-between">
              <SectionLabel>Konsequenz</SectionLabel>
              <span className="text-[12px] text-ink-2">Ziel {progress.weekGoal}× / Woche</span>
            </div>
            <Card className="px-4 py-4">
              <WeekBars weeks={progress.weeks} />
            </Card>
          </section>

          {progress.exercises.length ? (
            <section className="mt-6">
              <SectionLabel className="mb-2">Fortschritt</SectionLabel>
              <div className="flex flex-col gap-2.5">
                {progress.exercises.map((ex) => (
                  <Card key={ex.name} className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0">
                      <div className="truncate text-[15px] font-bold text-ink">{ex.name}</div>
                      <div className="text-[12.5px] text-ink-2">
                        Best <span className="font-mono font-semibold text-ink">{ex.best} kg</span> · {ex.sub}
                      </div>
                    </div>
                    <DeltaChip kind={ex.deltaKind} text={ex.deltaText} />
                  </Card>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-6">
            <SectionLabel className="mb-2">Alle Trainings</SectionLabel>
            <div className="flex flex-col gap-2.5">
              {recent.map((r) => (
                <Card key={r.id} className="flex items-center gap-3 px-3 py-2.5">
                  <DateBadge day={r.day} mon={r.mon} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-bold text-ink">{r.exercise}</div>
                    <div className="text-[12.5px] text-ink-2">{r.setText}</div>
                  </div>
                  <span className="font-mono text-[14px] font-bold text-ink">{r.topWeight} kg</span>
                </Card>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
