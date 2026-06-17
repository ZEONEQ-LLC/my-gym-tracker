// Date helpers — direct ports of the prototype's date logic.
// All dates are local ISO strings 'YYYY-MM-DD'.

export function todayISO(): string {
  const d = new Date();
  return isoOf(d);
}

export function isoOf(d: Date): string {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

export function parseD(iso: string): Date {
  return new Date(iso + "T00:00:00");
}

/** Relative label: Heute / Gestern / vor N Tagen / vor 1 Woche / vor N Wochen. */
export function fmtRel(iso: string): string {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const diff = Math.round((t.getTime() - parseD(iso).getTime()) / 86400000);
  if (diff <= 0) return "Heute";
  if (diff === 1) return "Gestern";
  if (diff < 7) return "vor " + diff + " Tagen";
  if (diff < 14) return "vor 1 Woche";
  return "vor " + Math.floor(diff / 7) + " Wochen";
}

export function fmtDate(iso: string): string {
  return parseD(iso).toLocaleDateString("de-CH", { day: "numeric", month: "long" });
}

export function fmtDay(iso: string): string {
  return String(parseD(iso).getDate());
}

export function fmtMon(iso: string): string {
  return parseD(iso)
    .toLocaleDateString("de-CH", { month: "short" })
    .replace(".", "");
}

export function fmtBarLabel(iso: string): string {
  const d = parseD(iso);
  return d.getDate() + "." + (d.getMonth() + 1);
}

/** Monday-based start of the week containing `iso`, at 00:00 local. */
export function weekStart(iso: string): Date {
  const d = parseD(iso);
  const off = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - off);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function todayMidnight(): Date {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}
