"use client";

import { useEffect } from "react";
import { useGymData } from "@/lib/data/hooks";
import { applyAccent } from "@/lib/theme/accents";

/** Applies the persisted accent theme to the document root whenever it changes. */
export function AccentSync() {
  const { data } = useGymData();
  const accent = data?.profile.accent ?? "Emerald";
  useEffect(() => {
    applyAccent(accent);
  }, [accent]);
  return null;
}
