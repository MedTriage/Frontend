"use client";

import { useEffect, useState, type RefObject } from "react";
import { PhaseMark, type Level } from "./ChatTurn";

/* ── The outline of a consultation ──
 *
 * Added on 2026-11-15 at the owner's request: a small stack of lines at the right edge of
 * the transcript, one line for each message, with the count under it. Hovering (or
 * tapping, or focusing) it opens the list of messages, and choosing one scrolls the
 * transcript to it.
 *
 * It counts the patient's messages and the answers, so the number is the one the full log
 * shows, and it is there from the first message (a first version waited for two of the
 * patient's own and the owner could not find it). An answer is never shown here without
 * its level: its line is the level's colour and its entry is headed by the level, as the
 * backend gave it. A child-health answer has no level and is ink.
 *
 * The page gives every message's wrapper the id `outlineTarget(id)`; this reads those
 * elements to know which message is on screen and to scroll to one.
 */

export interface OutlineItem {
  id: string;
  text: string;
  time: Date;
  /** Who wrote it. An answer carries the level it was given, if it has one. */
  from: "you" | "system";
  level?: Level;
}

export const outlineTarget = (id: string) => `msg-${id}`;

const LINE: Record<Level, string> = { 1: "bg-t1", 2: "bg-t2", 3: "bg-t3" };
const TEXT: Record<Level, string> = { 1: "text-t1", 2: "text-t2", 3: "text-t3" };

export function ChatOutline({
  items,
  scroller,
}: {
  items: OutlineItem[];
  /** The element that scrolls the transcript. */
  scroller: RefObject<HTMLElement | null>;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  // The message on screen is the last one whose top has passed a line a little below the
  // top of the transcript. Read on the next frame, not in the effect itself, and again on
  // every scroll.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () => {
      const line = el.getBoundingClientRect().top + 120;
      let current = items[0]?.id ?? null;
      for (const item of items) {
        const node = document.getElementById(outlineTarget(item.id));
        if (node && node.getBoundingClientRect().top <= line) current = item.id;
      }
      setActive(current);
    };
    const frame = requestAnimationFrame(update);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", update);
    };
  }, [items, scroller]);

  const jump = (id: string) => {
    document.getElementById(outlineTarget(id))?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
    setOpen(false);
  };

  const count = `${items.length} ${items.length === 1 ? "message" : "messages"}`;

  return (
    <div
      className="chat-sans print:hidden absolute right-1 lg:right-5 top-1/2 z-30 -translate-y-1/2"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        aria-expanded={open}
        aria-label={`${count} in this consultation`}
        className="flex flex-col items-end gap-2 rounded-[10px] px-1.5 py-2 hover:bg-sunk transition-colors"
      >
        <span className={`flex flex-col items-end ${items.length > 14 ? "gap-1" : "gap-1.5"}`} aria-hidden>
          {items.map((item) => (
            <span
              key={item.id}
              className={`block h-[2px] rounded-full transition-all duration-300 ${
                item.id === active ? "w-4" : "w-2.5 opacity-45"
              } ${item.level ? LINE[item.level] : "bg-foreground"}`}
            />
          ))}
        </span>
        <span className="data text-[11px] leading-none text-muted tabular-nums" aria-hidden>
          {items.length}
        </span>
      </button>

      {/* The list sits against the lines with padding, not a margin, so the pointer never
          crosses a gap on its way over and closes it. */}
      <div
        className={`absolute right-full top-1/2 -translate-y-1/2 pr-2 transition-[opacity,transform] duration-200 ${
          open ? "opacity-100 translate-x-0" : "pointer-events-none opacity-0 translate-x-1"
        }`}
      >
        <div className="w-[min(320px,calc(100vw-4rem))] overflow-hidden rounded-[16px] border border-border bg-card shadow-[var(--shadow-2)]">
          <p className="data border-b border-border px-3.5 py-2.5 text-[11px] text-muted">{count}</p>
          <ol className="max-h-[min(380px,50vh)] overflow-y-auto p-1.5">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  // Out of the tab order while the list is hidden.
                  tabIndex={open ? 0 : -1}
                  onClick={() => jump(item.id)}
                  aria-current={item.id === active ? "true" : undefined}
                  className={`block w-full rounded-[10px] px-2.5 py-2 text-left transition-colors hover:bg-sunk ${
                    item.id === active ? "bg-sunk" : ""
                  }`}
                >
                  <span className="data flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-muted">
                    {item.from === "you" ? (
                      "You"
                    ) : item.level ? (
                      <span className={`inline-flex items-center gap-1 font-semibold ${TEXT[item.level]}`}>
                        <PhaseMark level={item.level} className="w-2.5 h-2.5" />
                        Level {item.level}
                      </span>
                    ) : (
                      "Answer"
                    )}
                    <span className="ml-auto normal-case tracking-normal">
                      {item.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </span>
                  <span className="mt-1 line-clamp-2 text-[13px] leading-snug">{item.text}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
