"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExerciseCard } from "@/components/exercise/exercise-card";
import { SearchField } from "@/components/ui/fields";
import { PlusIcon, SearchIcon } from "@/components/ui/icons";
import { SectionLabel } from "@/components/ui/primitives";
import { CenteredNote } from "@/components/ui/states";
import { useGymData } from "@/lib/data/hooks";
import { vmGroups } from "@/lib/domain/selectors";

export default function ExercisesPage() {
  const { data, isPending } = useGymData();
  const [search, setSearch] = useState("");

  const groups = useMemo(() => (data ? vmGroups(data, search) : []), [data, search]);

  const greeting = data?.profile.name ? `Hoi, ${data.profile.name}` : "Hoi!";
  const goal = data?.profile.goal || "Kraftaufbau & Rücken stabilisieren";
  const hasExercises = !!data && data.exercises.length > 0;

  return (
    <div className="animate-in">
      <header className="flex items-end justify-between pt-3.5 pb-2">
        <div>
          <div className="text-[13px] font-semibold tracking-[0.3px] text-accent">{greeting}</div>
          <h1 className="mt-0.5 text-[30px] font-extrabold tracking-[-0.8px] text-ink">Übungen</h1>
        </div>
        <div className="max-w-[150px] pb-1.5 text-right text-[12.5px] leading-tight text-ink-2">{goal}</div>
      </header>

      <div className="pb-3.5 pt-1.5">
        <SearchField
          icon={<SearchIcon />}
          placeholder="Übung suchen"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isPending ? (
        <CenteredNote>Lädt …</CenteredNote>
      ) : !hasExercises ? (
        <div className="pt-2">
          <CenteredNote>
            <div>
              <div className="text-[16px] font-bold text-ink">Noch keine Übungen</div>
              <div className="mt-1 text-[13px] text-ink-2">
                Lege deine erste Übung an – mit oder ohne Maschine.
              </div>
            </div>
          </CenteredNote>
          <NewExerciseButton />
        </div>
      ) : (
        <>
          {groups.map((g) => (
            <section key={g.name} className="mb-5">
              <SectionLabel className="mb-2.5">{g.name.toUpperCase()}</SectionLabel>
              <div className="flex flex-col gap-2.5">
                {g.items.map((card) => (
                  <ExerciseCard key={card.id} card={card} />
                ))}
              </div>
            </section>
          ))}
          {groups.length === 0 ? (
            <CenteredNote>Keine Übung gefunden.</CenteredNote>
          ) : null}
          <NewExerciseButton />
        </>
      )}
    </div>
  );
}

function NewExerciseButton() {
  return (
    <Link
      href="/uebung/neu"
      className="mt-1.5 flex h-[52px] w-full items-center justify-center gap-2 rounded-[16px] border-[1.5px] border-dashed text-[14px] font-bold text-ink-2"
      style={{ borderColor: "#cfccc3" }}
    >
      <PlusIcon size={15} />
      Neue Übung
    </Link>
  );
}
