"use client";

import { cn } from "@/lib/cn";

/** Sticky bottom primary button with a fade gradient behind it. */
export function StickyCta({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[480px]">
      <div
        className="pointer-events-none h-10"
        style={{ background: "linear-gradient(to top, var(--color-app), transparent)" }}
      />
      <div
        className="pointer-events-auto bg-app px-[22px] pt-1"
        style={{ paddingBottom: "calc(18px + env(safe-area-inset-bottom))" }}
      >
        <button
          type={type}
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "h-[50px] w-full rounded-[14px] text-[15px] font-bold text-white transition-colors",
            disabled ? "bg-[#cfd2cf] text-white/90" : "bg-accent",
          )}
        >
          {children}
        </button>
      </div>
    </div>
  );
}
