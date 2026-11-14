"use client";

import Link from "next/link";
import type { ListCardVM } from "@/lib/domain/selectors";
import { CheckIcon, PlusIcon } from "@/components/ui/icons";
import { PhotoThumb } from "./photo";

/** Exercise list card. Left region opens detail; right button quick-logs. */
export function ExerciseCard({ card }: { card: ListCardVM }) {
  const { id, name, doneToday } = card;
  return (
    <div
      className="flex items-stretch overflow-hidden rounded-[17px] border bg-surface"
      style={{ borderColor: doneToday ? "var(--accent)" : "#e8e5dd" }}
    >
      <Link href={`/uebung/${id}`} className="flex min-w-0 flex-1 items-center gap-3 p-2.5">
        <PhotoThumb photo={card.photo} size={54} radius={13} doneBadge={doneToday} />
        <div className="min-w-0 flex-1">
          <div className="truncate fs-16 font-bold text-ink">{name}</div>
          <div
            className="truncate fs-13"
            style={{
              color: doneToday ? "var(--accent)" : "var(--color-muted)",
              fontWeight: doneToday ? 700 : 500,
            }}
          >
            {card.lastLine}
          </div>
        </div>
      </Link>
      <Link
        href={`/uebung/${id}/eintragen`}
        className="flex w-[78px] shrink-0 flex-col items-center justify-center gap-1 border-l fs-11 font-bold"
        style={
          doneToday
            ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" }
            : { background: "var(--accent-soft)", color: "var(--accent)", borderColor: "#e8e5dd" }
        }
        aria-label={doneToday ? "Erledigt – weiteren Satz eintragen" : "Training eintragen"}
      >
        {doneToday ? <CheckIcon size={15} /> : <PlusIcon size={15} />}
        {doneToday ? "Erledigt" : "Eintragen"}
      </Link>
    </div>
  );
}
