// Pure view-model selectors — direct ports of the prototype's vm* methods.
// Framework- and storage-agnostic: given GymData (+ params) they return plain
// objects ready for rendering. Accent fills use the CSS variable `--accent` so
// the active theme applies automatically.

import { fmtBarLabel, fmtDate, fmtDay, fmtMon, fmtRel, isoOf, parseD, todayISO, weekStart } from "./date";
import { Exercise, GymData, HistoryEntry, SetEntry } from "./types";

const ACCENT = "var(--accent, #117a57)";

// ---------- small helpers ----------

export function topW(sets: SetEntry[]): number {
  return sets.length ? Math.max(...sets.map((s) => Number(s.weight) || 0)) : 0;
}

export function repsText(sets: SetEntry[]): string {
  const n = sets.length;
  const reps = sets.map((s) => s.reps).join("·");
  return (n === 1 ? "1 Satz" : n + " Sätze") + " · " + reps + " Wdh";
}

/** Stable category order: the two base groups first, then any custom groups. */
export function groupOrder(exercises: Exercise[]): string[] {
  const order = ["Beine & Rumpf", "Oberkörper"];
  exercises.forEach((d) => {
    if (d.group && !order.includes(d.group)) order.push(d.group);
  });
  return order;
}

// ---------- exercise list (Übungen) ----------

export type ListCardVM = {
  id: string;
  name: string;
  doneToday: boolean;
  photo: string | null;
  hasVariants: boolean;
  variantCount: number;
  hasLast: boolean;
  lastTop: number;
  /** Subtitle text already resolved for the current state. */
  lastLine: string;
};

export type ListGroupVM = { name: string; items: ListCardVM[] };

export function vmGroups(data: GymData, search: string): ListGroupVM[] {
  const q = search.trim().toLowerCase();
  const today = todayISO();
  const res: ListGroupVM[] = [];
  for (const g of groupOrder(data.exercises)) {
    const items: ListCardVM[] = data.exercises
      .filter((d) => d.group === g && (!q || d.name.toLowerCase().includes(q)))
      .map((d) => {
        const hist = (d.history || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
        const last = hist[0] || null;
        const doneToday = (d.history || []).some((e) => e.date === today);
        const lastTop = last ? topW(last.sets) : 0;
        return {
          id: d.id,
          name: d.name,
          doneToday,
          photo: d.photo || null,
          hasVariants: !!d.variants,
          variantCount: d.variants ? d.variants.length : 0,
          hasLast: !!last,
          lastTop,
          lastLine: doneToday
            ? "Heute erledigt"
            : last
              ? "Zuletzt " + lastTop + " kg · " + fmtRel(last.date)
              : d.variants
                ? d.variants.length + " Varianten"
                : "Noch nicht trainiert",
        };
      });
    if (items.length) res.push({ name: g, items });
  }
  return res;
}

/** Done-today flag for a single exercise (derived, never stored). */
export function isDoneToday(ex: Exercise): boolean {
  const today = todayISO();
  return (ex.history || []).some((e) => e.date === today);
}

// ---------- exercise detail (Übungsdetail) ----------

export type ParamRowVM = { name: string; display: string; filled: boolean };
export type HistoryRowVM = {
  id: string;
  date: string;
  rel: string;
  note: string;
  hasNote: boolean;
  sets: { label: string }[];
};
export type BarVM = { h: number; weight: number; label: string; accent: boolean };
export type VariantTabVM = { name: string; active: boolean };

export type DetailVM = {
  group: string;
  name: string;
  photo: string | null;
  hasVariants: boolean;
  variants: VariantTabVM[];
  paramRows: ParamRowVM[];
  hasParams: boolean;
  note: string;
  hasNote: boolean;
  history: HistoryRowVM[];
  hasHistory: boolean;
  bars: BarVM[];
  hasBars: boolean;
  best: number;
  targetText: string;
};

export function vmDetail(ex: Exercise, key: string): DetailVM {
  const settings = (ex.settings && ex.settings[key]) || {};
  const paramRows: ParamRowVM[] = Object.keys(settings).map((name) => {
    const v = settings[name];
    const filled = !!(v !== undefined && v !== null && String(v).trim() && String(v).trim() !== "—");
    const display = v === undefined || v === null || String(v).trim() === "" ? "—" : String(v);
    return { name, display, filled };
  });

  const hist = (ex.history || []).filter((e) => (ex.variants ? e.variant === key : true));

  const newest = hist.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  const history: HistoryRowVM[] = newest.map((e) => ({
    id: e.id,
    date: fmtDate(e.date),
    rel: fmtRel(e.date),
    note: e.note || "",
    hasNote: !!(e.note && e.note.trim()),
    sets: e.sets.map((s) => ({ label: s.reps + " × " + s.weight + " kg" })),
  }));

  const chron = hist.slice().sort((a, b) => (a.date < b.date ? -1 : 1)).slice(-6);
  const maxW = Math.max(1, ...chron.map((e) => topW(e.sets)));
  const bars: BarVM[] = chron.map((e, i) => {
    const w = topW(e.sets);
    return {
      h: Math.round(26 + (w / maxW) * 74),
      weight: w,
      label: fmtBarLabel(e.date),
      accent: i === chron.length - 1,
    };
  });

  const best = hist.length ? Math.max(...hist.map((e) => topW(e.sets))) : 0;
  const variants: VariantTabVM[] = ex.variants
    ? ex.variants.map((v) => ({ name: v, active: v === key }))
    : [];

  return {
    group: ex.group,
    name: ex.name,
    photo: ex.photo || null,
    hasVariants: !!ex.variants,
    variants,
    paramRows,
    hasParams: paramRows.length > 0,
    note: ex.note || "",
    hasNote: !!(ex.note && ex.note.trim()),
    history,
    hasHistory: history.length > 0,
    bars,
    hasBars: bars.length > 1,
    best,
    targetText: (ex.targetSets || 3) + " Sätze × " + (ex.targetReps || 10) + " Wdh",
  };
}

// ---------- recent / all trainings (Verlauf) ----------

export type RecentVM = {
  id: string;
  exercise: string;
  day: string;
  mon: string;
  setText: string;
  topWeight: number;
};

export function vmRecent(data: GymData, limit?: number): RecentVM[] {
  const all: { exercise: string; e: HistoryEntry }[] = [];
  for (const d of data.exercises)
    for (const e of d.history || []) all.push({ exercise: d.name, e });
  all.sort((a, b) => (a.e.date < b.e.date ? 1 : -1));
  const sliced = limit == null ? all : all.slice(0, limit);
  return sliced.map((x, i) => ({
    id: x.e.id + "_" + i,
    exercise: x.exercise,
    day: fmtDay(x.e.date),
    mon: fmtMon(x.e.date),
    setText: repsText(x.e.sets),
    topWeight: topW(x.e.sets),
  }));
}

// ---------- progress / consistency (Verlauf) ----------

export type WeekBarVM = {
  count: number;
  h: number;
  reached: boolean;
  empty: boolean;
  label: string;
  isCurrent: boolean;
};

export type ProgressExerciseVM = {
  name: string;
  best: number;
  delta: number;
  sessions: number;
  sub: string;
  deltaText: string;
  deltaKind: "new" | "up" | "down" | "hold";
};

export type ProgressVM = {
  hasData: boolean;
  thisWeek: number;
  streak: number;
  total: number;
  weekGoal: number;
  weeks: WeekBarVM[];
  exercises: ProgressExerciseVM[];
};

export function vmProgress(data: GymData): ProgressVM {
  const exs = data.exercises;
  const entries: { d: Exercise; e: HistoryEntry }[] = [];
  exs.forEach((d) => (d.history || []).forEach((e) => entries.push({ d, e })));
  const noData = entries.length === 0;

  const daySet = new Set(entries.map((x) => x.e.date));
  const total = daySet.size;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const curWeek = weekStart(isoOf(today));

  const daysByWeek: Record<string, Set<string>> = {};
  daySet.forEach((iso) => {
    const k = isoOf(weekStart(iso));
    (daysByWeek[k] = daysByWeek[k] || new Set()).add(iso);
  });
  const weekCount = (dt: Date) => {
    const k = isoOf(dt);
    return daysByWeek[k] ? daysByWeek[k].size : 0;
  };

  const weekGoal = 2;
  const thisWeek = weekCount(curWeek);

  const tmp: { dt: Date; c: number; isCur: boolean }[] = [];
  let maxC = weekGoal;
  for (let i = 7; i >= 0; i--) {
    const dt = new Date(curWeek);
    dt.setDate(dt.getDate() - i * 7);
    const c = weekCount(dt);
    maxC = Math.max(maxC, c);
    tmp.push({ dt, c, isCur: i === 0 });
  }
  const weeks: WeekBarVM[] = tmp.map((t) => {
    const reached = t.c >= weekGoal;
    return {
      count: t.c,
      h: t.c === 0 ? 4 : Math.round(16 + (t.c / maxC) * 84),
      reached,
      empty: t.c === 0,
      label: t.dt.getDate() + "." + (t.dt.getMonth() + 1),
      isCurrent: t.isCur,
    };
  });

  const activeWeeks = new Set(Object.keys(daysByWeek).filter((k) => daysByWeek[k].size > 0));
  let streak = 0;
  const probe = new Date(curWeek);
  if (!activeWeeks.has(isoOf(probe))) probe.setDate(probe.getDate() - 7);
  while (activeWeeks.has(isoOf(probe))) {
    streak++;
    probe.setDate(probe.getDate() - 7);
  }

  const progEx: ProgressExerciseVM[] = exs
    .map((d): ProgressExerciseVM | null => {
      const hist = (d.history || []).slice().sort((a, b) => (a.date < b.date ? -1 : 1));
      if (!hist.length) return null;
      const firstTop = topW(hist[0].sets);
      const lastTop = topW(hist[hist.length - 1].sets);
      const best = Math.max(...hist.map((e) => topW(e.sets)));
      const delta = lastTop - firstTop;
      let deltaText: string;
      let deltaKind: ProgressExerciseVM["deltaKind"];
      if (hist.length === 1) {
        deltaText = "Neu";
        deltaKind = "new";
      } else if (delta > 0) {
        deltaText = "↑ +" + delta + " kg";
        deltaKind = "up";
      } else if (delta < 0) {
        deltaText = "↓ " + Math.abs(delta) + " kg";
        deltaKind = "down";
      } else {
        deltaText = "gehalten";
        deltaKind = "hold";
      }
      return {
        name: d.name,
        best,
        delta,
        sessions: hist.length,
        sub: hist.length + (hist.length === 1 ? " Training" : " Trainings"),
        deltaText,
        deltaKind,
      };
    })
    .filter((x): x is ProgressExerciseVM => x !== null);
  progEx.sort((a, b) => b.delta - a.delta || b.sessions - a.sessions);

  return {
    hasData: !noData,
    thisWeek,
    streak,
    total,
    weekGoal,
    weeks,
    exercises: progEx.slice(0, 6),
  };
}

export { ACCENT };
