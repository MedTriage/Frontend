/*
  The patient dashboard's arithmetic: the calendar's weeks and marks, the sentence the page
  leads with, the chart's scales, and how an answer is split into the sheet's bullet points.
  Pure functions, so they are tested without a browser.
*/
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ageOn,
  dayKey,
  episodeLine,
  finding,
  formatValue,
  latestByKind,
  marksByDay,
  monthGrid,
  niceTicks,
  parseDay,
  previousLine,
  seriesFor,
  sheetPoints,
  strongest,
  timeTicks,
  visibleEpisodes,
  type FollowUpEpisode,
  type Reading,
} from "../app/lib/dashboard.ts";

function episode(over: Partial<FollowUpEpisode> = {}): FollowUpEpisode {
  return {
    id: "e1",
    conversation_id: "c1",
    state: "active",
    complaint: "sore_throat",
    label: "Sore throat",
    usual_course: "usually lasts about 1 week",
    next_checkin_at: null,
    checkin_due: false,
    opened_at: "2026-11-01T10:00:00+05:30",
    entries: [],
    ...over,
  };
}

function reading(over: Partial<Reading> = {}): Reading {
  return {
    id: 1,
    kind: "weight",
    value: 72,
    value2: null,
    unit: "kg",
    measured_on: "2026-11-03",
    created_at: "2026-11-03T10:00:00+05:30",
    ...over,
  };
}

/* ── the calendar ─────────────────────────────────────────────────────────────── */

test("a month's grid is whole weeks starting on Monday", () => {
  const weeks = monthGrid(2026, 10); // November 2026 starts on a Sunday
  assert.ok(weeks.every((w) => w.length === 7));
  assert.equal(weeks[0][0].date.getDay(), 1);
  assert.equal(dayKey(weeks[0][6].date), "2026-11-01");
  assert.equal(weeks[0][6].inMonth, true);
  assert.equal(weeks[0][5].inMonth, false);
});

test("a month's grid covers every day of the month and stops at the week holding its last", () => {
  const days = monthGrid(2026, 10).flat().filter((d) => d.inMonth);
  assert.equal(days.length, 30);
  const last = monthGrid(2026, 10).at(-1)!;
  assert.equal(dayKey(last[0].date), "2026-11-30");
});

test("a date-only string stays on its own day in any time zone", () => {
  assert.equal(dayKey(parseDay("2026-11-03")), "2026-11-03");
});

test("marks land on the patient's local day and name the illness", () => {
  const at = new Date(2026, 10, 12, 9, 0).toISOString();
  const marks = marksByDay([episode({ entries: [{ kind: "upcoming", at }] })]);
  assert.deepEqual(marks.get("2026-11-12")?.map((m) => [m.kind, m.label]), [["upcoming", "Sore throat"]]);
});

test("a day with several marks shows the one that needs the patient most", () => {
  const mark = (kind: "due" | "upcoming" | "expected" | "missed" | "answered") =>
    ({ kind, label: "x", conversationId: "c", at: "" });
  assert.equal(strongest([mark("answered"), mark("due"), mark("expected")]), "due");
  assert.equal(strongest([mark("answered"), mark("expected")]), "expected");
  assert.equal(strongest([mark("answered"), mark("missed")]), "missed");
});

/* ── the sentence the page leads with ─────────────────────────────────────────── */

test("a waiting check-in leads the page and links to its conversation", () => {
  const found = finding([episode({ checkin_due: true })]);
  assert.equal(found.text, "Your sore throat check-in is waiting");
  assert.equal(found.href, "/chat?c=c1");
  assert.equal(found.action, "Answer check-in");
});

test("several waiting check-ins are counted", () => {
  const found = finding([episode({ checkin_due: true }), episode({ id: "e2", checkin_due: true, conversation_id: "c2" })]);
  assert.equal(found.text, "2 check-ins are waiting");
});

test("otherwise the soonest upcoming check-in leads", () => {
  const soon = new Date(2026, 10, 12, 10).toISOString();
  const later = new Date(2026, 10, 20, 10).toISOString();
  const found = finding([
    episode({ id: "a", label: "Cough", entries: [{ kind: "upcoming", at: later }] }),
    episode({ id: "b", label: "Sore throat", entries: [{ kind: "upcoming", at: soon }] }),
  ]);
  assert.equal(found.text, "Next check-in: sore throat, Thursday 12 November");
  assert.equal(found.href, undefined);
});

test("a patient with nothing coming up is told so", () => {
  assert.equal(finding([]).text, "No check-ins coming up");
  assert.equal(finding([episode({ state: "resolved" })]).text, "No check-ins coming up");
});

/* ── follow-up cards ──────────────────────────────────────────────────────────── */

test("each state reads as what it means, and silence is never recovery", () => {
  assert.equal(episodeLine(episode({ checkin_due: true })), "Check-in waiting for you");
  assert.equal(episodeLine(episode({ state: "resolved" })), "You said it got better");
  assert.equal(episodeLine(episode({ state: "lapsed" })), "No answer to the last check-in");
  assert.equal(episodeLine(episode({ state: "stopped" })), "You stopped this follow-up");
  assert.equal(episodeLine(episode({ state: "escalated" })), "Passed on for more care");
});

test("an upcoming check-in names its day", () => {
  const at = new Date(2026, 10, 12, 10).toISOString();
  assert.equal(episodeLine(episode({ entries: [{ kind: "upcoming", at }] })), "Next check-in Thu 12 Nov");
});

test("active follow-ups come first and the list is capped", () => {
  const list = visibleEpisodes([
    episode({ id: "closed1", state: "resolved" }),
    episode({ id: "active" }),
    episode({ id: "closed2", state: "lapsed" }),
    episode({ id: "closed3", state: "stopped" }),
  ]);
  assert.deepEqual(list.map((e) => e.id), ["active", "closed1"]);
});

/* ── the stats ────────────────────────────────────────────────────────────────── */

test("age comes from the date of birth, turning on the birthday itself", () => {
  assert.equal(ageOn("1998-11-09", new Date(2026, 10, 8)), 27);
  assert.equal(ageOn("1998-11-09", new Date(2026, 10, 9)), 28);
});

test("blood pressure shows both numbers and a whole kilo shows no decimal", () => {
  assert.equal(formatValue(reading({ kind: "blood_pressure", value: 120, value2: 80 })), "120/80");
  assert.equal(formatValue(reading({ value: 72 })), "72");
  assert.equal(formatValue(reading({ value: 72.5 })), "72.5");
});

test("the latest of each kind is the first the backend sends", () => {
  const latest = latestByKind([reading({ id: 2, value: 72 }), reading({ id: 1, value: 70 }), reading({ id: 3, kind: "pulse", value: 64, unit: "bpm" })]);
  assert.equal(latest.weight?.value, 72);
  assert.equal(latest.pulse?.value, 64);
  assert.equal(latest.height, undefined);
});

test("the earlier value names its date, with no verdict on the change", () => {
  const list = [reading({ id: 2, value: 72 }), reading({ id: 1, value: 70.5, measured_on: "2026-10-20" })];
  assert.equal(previousLine(list, "weight"), "Was 70.5 kg on 20 Oct");
  assert.equal(previousLine([reading()], "weight"), null);
});

/* ── the chart ────────────────────────────────────────────────────────────────── */

test("a series runs oldest first and keeps only its kind and range", () => {
  const today = new Date(2026, 10, 9);
  const list = [
    reading({ id: 3, value: 72, measured_on: "2026-11-03" }),
    reading({ id: 2, value: 71, measured_on: "2026-10-01" }),
    reading({ id: 1, value: 69, measured_on: "2025-01-01" }),
    reading({ id: 4, kind: "pulse", value: 64, measured_on: "2026-11-03" }),
  ];
  assert.deepEqual(seriesFor(list, "weight", 90, today).map((p) => p.value), [71, 72]);
  assert.deepEqual(seriesFor(list, "weight", null, today).map((p) => p.value), [69, 71, 72]);
});

test("y ticks are round, even, and run above the highest value", () => {
  const ticks = niceTicks(70.5, 74);
  const steps = ticks.slice(1).map((t, i) => Number((t - ticks[i]).toFixed(6)));
  assert.ok(new Set(steps).size === 1);
  assert.ok(ticks[0] <= 70.5);
  assert.ok(ticks.at(-1)! > 74);
  assert.ok(ticks.length >= 3 && ticks.length <= 7);
});

test("a single value still gets a scale around it", () => {
  const ticks = niceTicks(72, 72);
  assert.ok(ticks[0] < 72 && ticks.at(-1)! > 72);
});

test("x ticks share one step and stay inside the range", () => {
  const start = new Date(2026, 0, 1).getTime();
  const end = new Date(2026, 10, 1).getTime();
  const ticks = timeTicks(start, end);
  const gaps = ticks.slice(1).map((t, i) => Math.round((t.at - ticks[i].at) / 86400000));
  assert.ok(new Set(gaps).size === 1);
  assert.ok(ticks.length >= 2 && ticks.length <= 6);
  assert.ok(ticks.every((t) => t.at >= start && t.at <= end));
});

test("a single day gets one x tick", () => {
  const at = new Date(2026, 10, 3).getTime();
  assert.deepEqual(timeTicks(at, at), [{ at, label: "3 Nov" }]);
});

/* ── the prescription sheet ───────────────────────────────────────────────────── */

test("an answer splits into one point per sentence with its wording kept", () => {
  assert.deepEqual(sheetPoints("Rest well. Drink fluids and take care."), ["Rest well.", "Drink fluids and take care."]);
});

test("semicolon clauses become their own points", () => {
  assert.deepEqual(sheetPoints("rest well; drink fluids"), ["Rest well.", "Drink fluids."]);
});

test("an abbreviation does not end a point, but a word ending the same way does", () => {
  assert.deepEqual(sheetPoints("Take fluids, e.g. Water or juice."), ["Take fluids, e.g. Water or juice."]);
  assert.deepEqual(sheetPoints("Watch your symptoms. Rest."), ["Watch your symptoms.", "Rest."]);
});

test("nothing to split gives no points", () => {
  assert.deepEqual(sheetPoints(""), []);
  assert.deepEqual(sheetPoints(null), []);
});
