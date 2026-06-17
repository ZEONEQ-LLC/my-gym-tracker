"use client";

import { cn } from "@/lib/cn";

const baseField =
  "h-[50px] w-full rounded-[13px] border border-line bg-surface px-3.5 text-[15px] text-ink placeholder:text-muted focus:border-accent";

export function TextField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(baseField, props.className)} />;
}

/** Numeric field (mono digits) for reps/weights/targets. */
export function NumberField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      inputMode="numeric"
      {...props}
      className={cn(baseField, "text-center font-mono font-semibold", props.className)}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-[84px] w-full rounded-[13px] border border-line bg-surface px-3.5 py-3 text-[15px] leading-snug text-ink placeholder:text-muted focus:border-accent",
        props.className,
      )}
    />
  );
}

/** Search field with a leading icon (children = icon). */
export function SearchField({
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) {
  return (
    <div className="flex h-11 items-center gap-2.5 rounded-[13px] border border-line bg-surface px-3.5 text-muted">
      {icon}
      <input
        {...props}
        className="h-full flex-1 bg-transparent text-[15px] text-ink placeholder:text-muted"
      />
    </div>
  );
}
