/*
  The patient dashboard's arithmetic, kept free of React so it can be tested directly. Tests
  import this file, so it uses no `@/` alias and no extensionless imports.
*/

export type ReadingKind = "weight" | "height" | "pulse" | "blood_pressure";

export interface Reading {
  id: number;
  kind: ReadingKind;
  value: number;
  value2: number | null;
  unit: string;
  measured_on: string;
  created_at: string;
}

export type EntryKind = "answered" | "due" | "upcoming" | "expected" | "missed";

export interface CalendarEntry {
  kind: EntryKind;
  at: string;
  overall?: string;
}

export interface FollowUpEpisode {
  id: string;
  conversation_id: string;
  state: "active" | "resolved" | "escalated" | "lapsed" | "stopped";
  complaint: string;
  label: string;
  usual_course: string | null;
  next_checkin_at: string | null;
  checkin_due: boolean;
  opened_at: string;
  entries: CalendarEntry[];
}

export interface PrescribedMedicine {
  drug: string;
  dose: string;
  frequency: string;
  duration: string;
  route: string;
  notes?: string | null;
}

export interface PrescriptionSummary {
  id: string;
  status: "draft" | "issued";
  message_id: number;
  conversation_id: string;
  diagnosis: string | null;
  medications: PrescribedMedicine[];
  refer_now: boolean;
  issued_by_name: string | null;
  issued_by_registration: string | null;
  issued_at: string | null;
  created_at: string;
}

export interface PrescriptionSheet extends PrescriptionSummary {
  patient_message: string;
  answer: string | null;
  investigations: string[];
  advice: string[];
  return_precautions: string[];
  assumptions: string[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LONG_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
  "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const LONG_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_MS = 86400000;

const pad = (n: number) => String(n).padStart(2, "0");

/** The patient's local calendar day. A check-in at 01:00 on the 12th in Kolkata is on the 12th,
 *  though it is still the 11th by UTC. */
export function dayKey(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** A date-only string as local midnight. `new Date("2026-11-03")` would read it as UTC and show
 *  the 2nd to anyone west of Greenwich. */
export function parseDay(day: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export const shortDay = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;
export const weekdayShort = (d: Date) => `${DAYS[d.getDay()]} ${shortDay(d)}`;
export const longDay = (d: Date) => `${LONG_DAYS[d.getDay()]} ${d.getDate()} ${LONG_MONTHS[d.getMonth()]}`;
export const monthName = (year: number, month: number) => `${LONG_MONTHS[month]} ${year}`;

/* ── the calendar ─────────────────────────────────────────────────────────────── */

export interface CalendarDay {
  date: Date;
  inMonth: boolean;
}

/** Whole weeks, Monday first, as many as the month touches. */
export function monthGrid(year: number, month: number): CalendarDay[][] {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - ((first.getDay() + 6) % 7));
  const weeks: CalendarDay[][] = [];
  for (let cursor = start; ; ) {
    const week: CalendarDay[] = [];
    for (let i = 0; i < 7; i += 1) {
      week.push({ date: new Date(cursor), inMonth: cursor.getMonth() === month });
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
    }
    weeks.push(week);
    if (cursor.getMonth() !== month) break;
  }
  return weeks;
}

export interface DayMark {
  kind: EntryKind;
  label: string;
  conversationId: string;
  at: string;
}

export function marksByDay(episodes: FollowUpEpisode[]): Map<string, DayMark[]> {
  const marks = new Map<string, DayMark[]>();
  for (const episode of episodes) {
    for (const entry of episode.entries) {
      const key = dayKey(entry.at);
      const mark = { kind: entry.kind, label: episode.label, conversationId: episode.conversation_id, at: entry.at };
      marks.set(key, [...(marks.get(key) ?? []), mark]);
    }
  }
  return marks;
}

const MARK_ORDER: EntryKind[] = ["due", "upcoming", "expected", "missed", "answered"];

/** A day holds one mark in the grid, so it shows the one that asks the most of the patient. */
export function strongest(marks: DayMark[]): EntryKind {
  return MARK_ORDER.find((kind) => marks.some((m) => m.kind === kind)) ?? "answered";
}

export const MARK_WORDS: Record<EntryKind, string> = {
  due: "check-in waiting",
  upcoming: "next check-in",
  expected: "expected check-in",
  answered: "check-in answered",
  missed: "check-in not answered",
};

/* ── the sentence the page leads with ─────────────────────────────────────────── */

export interface Finding {
  text: string;
  href?: string;
  action?: string;
}

function soonestUpcoming(episode: FollowUpEpisode): CalendarEntry | undefined {
  return episode.entries.find((e) => e.kind === "upcoming");
}

export function finding(episodes: FollowUpEpisode[]): Finding {
  const waiting = episodes.filter((e) => e.state === "active" && e.checkin_due);
  if (waiting.length > 0) {
    const [first] = waiting;
    return {
      text: waiting.length === 1
        ? `Your ${first.label.toLowerCase().replace(/^your /, "")} check-in is waiting`
        : `${waiting.length} check-ins are waiting`,
      href: `/chat?c=${first.conversation_id}`,
      action: "Answer check-in",
    };
  }
  const next = episodes
    .filter((e) => e.state === "active")
    .flatMap((e) => {
      const entry = soonestUpcoming(e);
      return entry ? [{ episode: e, at: new Date(entry.at) }] : [];
    })
    .sort((a, b) => a.at.getTime() - b.at.getTime())[0];
  if (next) return { text: `Next check-in: ${next.episode.label.toLowerCase()}, ${longDay(next.at)}` };
  return { text: "No check-ins coming up" };
}

/* ── follow-up cards ──────────────────────────────────────────────────────────── */

/** One line on where a follow-up stands. "Lapsed" is said plainly as no answer: silence is
 *  never presented as getting better. */
export function episodeLine(episode: FollowUpEpisode): string {
  if (episode.state === "resolved") return "You said it got better";
  if (episode.state === "lapsed") return "No answer to the last check-in";
  if (episode.state === "stopped") return "You stopped this follow-up";
  if (episode.state === "escalated") return "Passed on for more care";
  if (episode.checkin_due) return "Check-in waiting for you";
  const next = soonestUpcoming(episode);
  return next ? `Next check-in ${weekdayShort(new Date(next.at))}` : "Waiting for your next message";
}

/** The rail has room for two: anything still being watched first, then the most recent. */
export function visibleEpisodes(episodes: FollowUpEpisode[], cap = 2): FollowUpEpisode[] {
  const active = episodes.filter((e) => e.state === "active");
  const closed = episodes.filter((e) => e.state !== "active");
  return [...active, ...closed].slice(0, cap);
}

/* ── the stats ────────────────────────────────────────────────────────────────── */

export function ageOn(dateOfBirth: string, today: Date): number {
  const born = parseDay(dateOfBirth);
  const hadBirthday = today.getMonth() > born.getMonth()
    || (today.getMonth() === born.getMonth() && today.getDate() >= born.getDate());
  return today.getFullYear() - born.getFullYear() - (hadBirthday ? 0 : 1);
}

export function formatValue(reading: Pick<Reading, "value" | "value2">): string {
  return reading.value2 === null ? `${reading.value}` : `${reading.value}/${reading.value2}`;
}

/** The backend sends newest first, so the first of each kind is the latest. */
export function latestByKind(readings: Reading[]): Partial<Record<ReadingKind, Reading>> {
  const latest: Partial<Record<ReadingKind, Reading>> = {};
  for (const reading of readings) latest[reading.kind] ??= reading;
  return latest;
}

/** The value before the latest, with its date. No arrow and no colour: a falling weight is good
 *  news for one patient and a warning for another, and nothing here knows which. */
export function previousLine(readings: Reading[], kind: ReadingKind): string | null {
  const previous = readings.filter((r) => r.kind === kind)[1];
  if (!previous) return null;
  return `Was ${formatValue(previous)} ${previous.unit} on ${shortDay(parseDay(previous.measured_on))}`;
}

/* ── the chart ────────────────────────────────────────────────────────────────── */

export interface SeriesPoint {
  at: number;
  value: number;
  value2: number | null;
  day: string;
}

/** Oldest first. `days` of null means everything. */
export function seriesFor(readings: Reading[], kind: ReadingKind, days: number | null, today: Date): SeriesPoint[] {
  const from = days === null ? -Infinity : today.getTime() - days * DAY_MS;
  return readings
    .filter((r) => r.kind === kind && parseDay(r.measured_on).getTime() >= from)
    .map((r) => ({ at: parseDay(r.measured_on).getTime(), value: r.value, value2: r.value2, day: r.measured_on }))
    .reverse();
}

const clean = (n: number) => Number(n.toFixed(6));

/** Round, even y ticks with the top one above the highest value, so a line never touches the
 *  plot's edge. Weight doesn't start at zero: a line chart shows change, and on a zero-based
 *  scale a 2 kg change in 72 kg is a flat line. */
export function niceTicks(min: number, max: number, target = 4): number[] {
  const low = min === max ? min - 1 : min;
  const high = min === max ? max + 1 : max;
  const raw = (high - low) / (target - 1);
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / magnitude;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * magnitude;
  const bottom = Math.floor(low / step) * step;
  let top = Math.ceil(high / step) * step;
  if (clean(top) <= high) top += step;
  const ticks: number[] = [];
  for (let t = bottom; t <= top + step / 1000; t += step) ticks.push(clean(t));
  return ticks;
}

const X_STEPS = [1, 2, 7, 14, 30, 60, 90, 180, 365, 730];

/** X ticks on one step from the first reading, so the spacing never lies about time. */
export function timeTicks(start: number, end: number, most = 5): { at: number; label: string }[] {
  const label = (at: number, wide: boolean) => {
    const d = new Date(at);
    return wide ? `${MONTHS[d.getMonth()]} ${d.getFullYear()}` : shortDay(d);
  };
  if (start >= end) return [{ at: start, label: label(start, false) }];
  const span = (end - start) / DAY_MS;
  const step = X_STEPS.find((s) => span / s <= most - 1) ?? 1460;
  const ticks = [];
  for (let at = start; at <= end; at += step * DAY_MS) ticks.push({ at, label: label(at, step >= 60) });
  return ticks;
}

/* ── the prescription sheet ───────────────────────────────────────────────────── */

const ABBREVIATIONS = new Set(["e.g.", "i.e.", "etc.", "vs.", "approx.", "dr.", "mr.", "mrs.", "ms.", "no."]);

/** An answer as points, one per sentence and one per semicolon clause. Ported from the sheet
 *  in ../prescription_final/rx/sheets.py. The wording is kept, apart from capitalising each
 *  point and ending it with a full stop. */
export function sheetPoints(text: string | null | undefined): string[] {
  const flat = (text ?? "").split(/\s+/).join(" ").trim();
  if (!flat) return [];
  const sentences: string[] = [];
  let start = 0;
  for (const match of flat.matchAll(/[.!?](?=\s+[A-Z0-9"'(])/g)) {
    const end = match.index + 1;
    // The whole word only: "symptoms." must not be mistaken for "ms.".
    const lastWord = flat.slice(0, end).split(" ").at(-1)!.toLowerCase().replace(/^["'(]+/, "");
    if (ABBREVIATIONS.has(lastWord)) continue;
    sentences.push(flat.slice(start, end));
    start = end;
  }
  sentences.push(flat.slice(start));
  const points: string[] = [];
  for (const sentence of sentences) {
    for (const piece of sentence.trim().split(/;\s+/)) {
      const clause = piece.trim().replace(/;$/, "").trim();
      if (!clause) continue;
      const ended = /[.!?]$/.test(clause) ? clause : `${clause}.`;
      points.push(ended[0].toUpperCase() + ended.slice(1));
    }
  }
  return points;
}
