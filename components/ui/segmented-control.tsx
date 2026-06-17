"use client";

/** Segmented control for variant toggles (active segment lifts with a shadow). */
export function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1 rounded-[12px] bg-fill p-1">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className="flex-1 rounded-[9px] px-2 py-2 text-[13.5px] font-semibold transition-colors"
            style={{
              background: active ? "#ffffff" : "transparent",
              color: active ? "#1d2024" : "#85807a",
              boxShadow: active ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
