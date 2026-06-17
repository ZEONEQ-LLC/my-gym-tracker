"use client";

import { cn } from "@/lib/cn";

/** White-ish surface card with the standard border + radius. */
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-[17px] border border-line bg-surface", className)}>{children}</div>
  );
}

/** Uppercase section label (12/700 +0.5). */
export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("text-[12px] font-bold uppercase tracking-[0.5px] text-eyebrow", className)}>
      {children}
    </div>
  );
}

/** Eyebrow line (11.5/700 uppercase +1). */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("text-[11.5px] font-bold uppercase tracking-[1px] text-eyebrow", className)}>
      {children}
    </div>
  );
}

/** Accent-soft pill (e.g. the target chip "Ziel · 3 Sätze × 10 Wdh"). */
export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[12.5px] font-semibold text-accent",
        className,
      )}
    >
      {children}
    </span>
  );
}
