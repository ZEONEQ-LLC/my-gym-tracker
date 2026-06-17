// Accent themes — applied at runtime via the CSS custom properties
// `--accent` / `--accent-soft` on the document root.

import { AccentName } from "@/lib/domain/types";

export const ACCENTS: Record<AccentName, { accent: string; soft: string }> = {
  Emerald: { accent: "#117a57", soft: "#e4f1ea" },
  "Slate-Blau": { accent: "#2c5fb8", soft: "#e6ecf7" },
  Terrakotta: { accent: "#b35a33", soft: "#f6e7df" },
  Pflaume: { accent: "#6a4a9c", soft: "#ece5f4" },
};

export const ACCENT_NAMES = Object.keys(ACCENTS) as AccentName[];

export function applyAccent(name: AccentName) {
  if (typeof document === "undefined") return;
  const a = ACCENTS[name] ?? ACCENTS.Emerald;
  const root = document.documentElement;
  root.style.setProperty("--accent", a.accent);
  root.style.setProperty("--accent-soft", a.soft);
}
