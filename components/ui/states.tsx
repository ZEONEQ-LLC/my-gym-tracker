"use client";

export function CenteredNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-6 text-center text-[14px] text-ink-2">
      {children}
    </div>
  );
}

/** Empty-state block (icon-free, used on list/history when there is no data). */
export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mt-8 rounded-[17px] border border-dashed bg-surface px-6 py-10 text-center" style={{ borderColor: "#cfccc3" }}>
      <div className="text-[15px] font-bold text-ink">{title}</div>
      {hint ? <div className="mt-1 text-[13px] leading-snug text-ink-2">{hint}</div> : null}
    </div>
  );
}
