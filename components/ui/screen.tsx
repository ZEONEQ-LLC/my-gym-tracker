"use client";

import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "./icons";
import { cn } from "@/lib/cn";

/** Outer wrapper for a pushed sub-screen: phone-width column, sheet entrance. */
export function Screen({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("animate-sheet mx-auto flex min-h-dvh max-w-[480px] flex-col", className)}>
      {children}
    </div>
  );
}

type ScreenHeaderProps = {
  title?: string;
  subtitle?: string;
  /** Text for the left action; defaults to a back chevron when omitted. */
  backLabel?: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

/** Sticky top bar with a back/cancel action, centered title and optional right slot. */
export function ScreenHeader({ title, subtitle, backLabel, onBack, right }: ScreenHeaderProps) {
  const router = useRouter();
  const back = onBack ?? (() => router.back());
  return (
    <header
      className="sticky top-0 z-10 flex items-center gap-2 bg-app/90 px-[22px] backdrop-blur-md"
      style={{ paddingTop: "calc(8px + env(safe-area-inset-top))", minHeight: 56 }}
    >
      <div className="flex min-w-0 flex-1 items-center">
        <button
          type="button"
          onClick={back}
          className="-ml-1 flex items-center gap-1 py-2 pr-2 text-[15px] font-semibold text-ink"
        >
          {backLabel ? backLabel : <ChevronLeftIcon />}
        </button>
      </div>
      {title ? (
        <div className="flex min-w-0 flex-[2] flex-col items-center text-center leading-tight">
          <span className="truncate text-[15px] font-bold text-ink">{title}</span>
          {subtitle ? <span className="truncate text-[11.5px] text-ink-2">{subtitle}</span> : null}
        </div>
      ) : (
        <div className="flex-[2]" />
      )}
      <div className="flex flex-1 items-center justify-end">{right}</div>
    </header>
  );
}

/** Scrollable body of a pushed screen, padded so content clears the sticky CTA. */
export function ScreenBody({
  children,
  hasCta = false,
  className,
}: {
  children: React.ReactNode;
  hasCta?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("no-scrollbar flex-1 px-[22px] pt-2", className)}
      style={{ paddingBottom: hasCta ? 110 : "calc(24px + env(safe-area-inset-bottom))" }}
    >
      {children}
    </div>
  );
}
