"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  MARK_WORDS,
  dayKey,
  marksByDay,
  monthGrid,
  monthName,
  shortDay,
  strongest,
  weekdayShort,
  type DayMark,
  type EntryKind,
  type FollowUpEpisode,
} from "../../lib/dashboard";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* One mark per kind, told apart by shape as well as colour: filled is fixed, a ring is only
   expected, and a missed check-in is never drawn like an answered one. */
function Mark({ kind }: { kind: EntryKind }) {
  const shape: Record<EntryKind, string> = {
    due: "bg-t3",
    upcoming: "bg-t1",
    expected: "border-[1.5px] border-t1",
    answered: "bg-muted",
    missed: "border-[1.5px] border-t2",
  };
  return <span aria-hidden className={`block w-[7px] h-[7px] rounded-full ${shape[kind]}`} />;
}

export function FollowUpCalendar({
  episodes,
  today,
  error,
  onRetry,
}: {
  episodes: FollowUpEpisode[] | null;
  today: Date;
  error: boolean;
  onRetry: () => void;
}) {
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [picked, setPicked] = useState<string | null>(null);

  const marks = useMemo(() => marksByDay(episodes ?? []), [episodes]);
  const weeks = monthGrid(view.year, view.month);
  const todayKey = dayKey(today);

  const onScreen = new Set<EntryKind>(
    weeks.flat().flatMap(({ date }) => {
      const day = marks.get(dayKey(date));
      return day ? [strongest(day)] : [];
    })
  );

  const move = (delta: number) => {
    const next = new Date(view.year, view.month + delta, 1);
    setView({ year: next.getFullYear(), month: next.getMonth() });
    setPicked(null);
  };

  const pickedMarks: DayMark[] = picked ? (marks.get(picked) ?? []) : [];

  return (
    <section aria-labelledby="calendar-title" className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] text-muted">Today, {shortDay(today)}</p>
          <h2 id="calendar-title" className="text-[18px] font-medium tracking-[-0.01em] mt-0.5">
            {monthName(view.year, view.month)}
          </h2>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Previous month"
            className="w-9 h-9 rounded-full bg-background flex items-center justify-center hover:bg-border/50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Next month"
            className="w-9 h-9 rounded-full bg-background flex items-center justify-center hover:bg-border/50 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 text-center" role="grid" aria-label={`Follow-ups in ${monthName(view.year, view.month)}`}>
        <div role="row" className="contents">
          {WEEKDAYS.map((d) => (
            <span key={d} role="columnheader" className="text-[12px] text-muted pb-1.5">
              {d}
            </span>
          ))}
        </div>
        {weeks.map((week) => (
          <div role="row" className="contents" key={dayKey(week[0].date)}>
            {week.map(({ date, inMonth }) => {
              const key = dayKey(date);
              const day = marks.get(key);
              const kind = day ? strongest(day) : null;
              const isToday = key === todayKey;
              const number = (
                <span
                  className={`tabular-nums w-[30px] h-[30px] rounded-full flex items-center justify-center text-[13px] transition-colors ${
                    isToday
                      ? "bg-t1 text-on-t1 font-semibold"
                      : picked === key
                        ? "bg-tint-green text-foreground font-medium"
                        : inMonth
                          ? "text-foreground"
                          : "text-muted"
                  }`}
                >
                  {date.getDate()}
                </span>
              );
              const dot = <span className="h-[7px] mt-[3px] flex items-center">{kind && <Mark kind={kind} />}</span>;
              return (
                <div role="gridcell" key={key} className="flex justify-center">
                  {day ? (
                    <button
                      type="button"
                      onClick={() => setPicked(picked === key ? null : key)}
                      aria-pressed={picked === key}
                      aria-label={`${weekdayShort(date)}: ${day.map((m) => `${m.label}, ${MARK_WORDS[m.kind]}`).join("; ")}`}
                      className="flex flex-col items-center rounded-xl pb-1 hover:bg-background transition-colors"
                    >
                      {number}
                      {dot}
                    </button>
                  ) : (
                    <span className="flex flex-col items-center pb-1">
                      {number}
                      {dot}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-3 text-[13px] text-muted">
          Couldn&apos;t load your follow-ups.{" "}
          <button type="button" onClick={onRetry} className="underline underline-offset-2 text-foreground">
            Try again
          </button>
        </p>
      )}

      {pickedMarks.length > 0 && (
        <ul className="mt-2.5 pt-2.5 border-t border-border space-y-1">
          {pickedMarks.map((m, i) => (
            <li key={i} className="flex items-center gap-2 text-[13px]">
              <Mark kind={m.kind} />
              <span className="min-w-0">
                {m.label}, {MARK_WORDS[m.kind]}
              </span>
              {m.kind === "due" && (
                <Link href={`/chat?c=${m.conversationId}`} className="ml-auto font-medium text-t1 shrink-0 hover:underline underline-offset-2">
                  Answer
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}

      {pickedMarks.length === 0 && onScreen.size > 0 && (
        <ul className="mt-2.5 pt-2.5 border-t border-border flex flex-wrap gap-x-3.5 gap-y-1">
          {(["due", "upcoming", "expected", "answered", "missed"] as EntryKind[])
            .filter((k) => onScreen.has(k))
            .map((k) => (
              <li key={k} className="flex items-center gap-1.5 text-[12px] text-muted">
                <Mark kind={k} />
                {MARK_WORDS[k].replace("check-in ", "").replace(" check-in", "")}
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}
