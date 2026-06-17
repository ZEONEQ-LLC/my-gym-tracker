"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PhotoUpload } from "@/components/exercise/photo";
import { ProgressBars } from "@/components/ui/charts";
import { PlusIcon } from "@/components/ui/icons";
import { Card, Eyebrow, Pill, SectionLabel } from "@/components/ui/primitives";
import { Screen, ScreenHeader } from "@/components/ui/screen";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { CenteredNote } from "@/components/ui/states";
import { StickyCta } from "@/components/ui/sticky-cta";
import { useGymData, useUpsertExercise } from "@/lib/data/hooks";
import { keyFor } from "@/lib/domain/drafts";
import { vmDetail } from "@/lib/domain/selectors";

export default function ExerciseDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data, isPending } = useGymData();
  const upsertExercise = useUpsertExercise();

  const exercise = data?.exercises.find((e) => e.id === id);
  const [variant, setVariant] = useState<string | null>(null);

  const activeVariant = exercise?.variants ? variant ?? exercise.variants[0] : null;
  const key = exercise ? keyFor(exercise, activeVariant) : "default";
  const vm = useMemo(() => (exercise ? vmDetail(exercise, key) : null), [exercise, key]);

  if (isPending) {
    return (
      <Screen>
        <ScreenHeader />
        <CenteredNote>Lädt …</CenteredNote>
      </Screen>
    );
  }
  if (!exercise || !vm) {
    return (
      <Screen>
        <ScreenHeader />
        <CenteredNote>Übung nicht gefunden.</CenteredNote>
      </Screen>
    );
  }

  const editHref = `/uebung/${id}/einstellungen${vm.hasVariants ? `?v=${encodeURIComponent(key)}` : ""}`;
  const logHref = `/uebung/${id}/eintragen${vm.hasVariants ? `?v=${encodeURIComponent(key)}` : ""}`;

  return (
    <Screen>
      <ScreenHeader
        right={
          <Link href={editHref} className="text-[15px] font-semibold text-accent">
            Bearbeiten
          </Link>
        }
      />

      <div className="no-scrollbar flex-1 px-[22px] pt-1" style={{ paddingBottom: 110 }}>
        {/* header row */}
        <div className="flex items-center gap-3.5">
          <PhotoUpload
            photo={vm.photo}
            size={76}
            radius={17}
            onChange={(url) => upsertExercise({ ...exercise, photo: url })}
            onRemove={() => upsertExercise({ ...exercise, photo: null })}
          />
          <div className="min-w-0 flex-1">
            <Eyebrow>{vm.group}</Eyebrow>
            <h1 className="mt-1 text-[24px] font-extrabold leading-tight tracking-[-0.5px] text-ink">
              {vm.name}
            </h1>
          </div>
        </div>

        <div className="mt-3">
          <Pill>Ziel · {vm.targetText}</Pill>
        </div>

        {vm.hasVariants ? (
          <div className="mt-4">
            <SegmentedControl
              options={vm.variants.map((v) => v.name)}
              value={key}
              onChange={setVariant}
            />
          </div>
        ) : null}

        {/* settings */}
        <div className="mt-5">
          <SectionLabel className="mb-2">Einstellungen</SectionLabel>
          <Card className="px-4 py-1">
            {vm.hasParams ? (
              vm.paramRows.map((row, i) => (
                <div
                  key={row.name}
                  className="flex items-center justify-between py-2.5"
                  style={i > 0 ? { borderTop: "1px solid #f0eee9" } : undefined}
                >
                  <span className="text-[14px] text-ink-2">{row.name}</span>
                  <span
                    className="font-mono text-[14px] font-semibold"
                    style={{ color: row.filled ? "#1d2024" : "#bdc0bf" }}
                  >
                    {row.display}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-3 text-[13.5px] text-ink-2">Keine Einstellungen hinterlegt.</div>
            )}
          </Card>
        </div>

        {/* note */}
        {vm.hasNote ? (
          <div className="mt-5">
            <SectionLabel className="mb-2">Zu beachten</SectionLabel>
            <div className="rounded-[15px] bg-fill-2 px-4 py-3 text-[14px] leading-snug text-ink">
              {vm.note}
            </div>
          </div>
        ) : null}

        {/* progress chart */}
        {vm.hasBars ? (
          <div className="mt-6">
            <div className="mb-2 flex items-baseline justify-between">
              <SectionLabel>Fortschritt</SectionLabel>
              <span className="text-[12.5px] text-ink-2">
                Best <span className="font-mono font-bold text-ink">{vm.best} kg</span>
              </span>
            </div>
            <Card className="px-4 py-4">
              <ProgressBars bars={vm.bars} />
            </Card>
          </div>
        ) : null}

        {/* history */}
        <div className="mt-6">
          <SectionLabel className="mb-2">Verlauf</SectionLabel>
          {vm.hasHistory ? (
            <div className="flex flex-col gap-2.5">
              {vm.history.map((h) => (
                <Card key={h.id} className="px-4 py-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[14px] font-bold text-ink">{h.date}</span>
                    <span className="text-[12px] text-muted">{h.rel}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {h.sets.map((s, i) => (
                      <span
                        key={i}
                        className="rounded-[7px] bg-fill-2 px-2 py-1 font-mono text-[12.5px] font-semibold text-ink"
                      >
                        {s.label}
                      </span>
                    ))}
                  </div>
                  {h.hasNote ? (
                    <div className="mt-2 text-[13px] leading-snug text-ink-2">{h.note}</div>
                  ) : null}
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-[15px] border border-dashed bg-surface px-4 py-6 text-center text-[13.5px] text-ink-2" style={{ borderColor: "#cfccc3" }}>
              Noch nicht trainiert.
            </div>
          )}
        </div>
      </div>

      <StickyCta onClick={() => router.push(logHref)}>
        <span className="inline-flex items-center gap-2">
          <PlusIcon size={15} /> Training eintragen
        </span>
      </StickyCta>
    </Screen>
  );
}
