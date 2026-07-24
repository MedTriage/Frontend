"use client";

import { useEffect, useRef, useState } from "react";
import { useStillness } from "../lib/useStillness";

/**
 * One consultation, replayed.
 *
 * The page asserts three times that three sources are consulted and reconciled; this
 * is the only place it shows a turn happening. Every line here is real vocabulary —
 * the event names come from the progress stream the server already emits, which
 * exists precisely so that component names stay server-side. Nothing in this
 * transcript names a retriever, a store or a node.
 *
 * It is a REPLAY and says so. A terminal that types itself out reads as a live feed,
 * and a fabricated live reading would be the same failure as putting weather in the
 * header. The real turn takes about eighteen seconds; this runs at roughly a fifth of
 * that, keeping the proportions — the live-source step is still the long one.
 */

type Line = {
  glyph: "λ" | ">" | "✓";
  text: string;
  meta?: string;
  /** ms after start */
  at: number;
  /** Marks the ruling, the one line allowed to carry colour. */
  level?: boolean;
};

const LINES: Line[] = [
  { glyph: "λ", text: "sore throat and fever for three days", at: 0 },
  { glyph: ">", text: "reading", meta: "2 symptoms", at: 420 },
  { glyph: ">", text: "guidelines", meta: "11 passages", at: 900 },
  { glyph: ">", text: "conditions", meta: "8 candidates", at: 1320 },
  { glyph: ">", text: "live sources", meta: "2 of 3", at: 2600 },
  { glyph: "✓", text: "fusion", meta: "agreement high", at: 3200 },
  { glyph: "✓", text: "ruling", meta: "level 2", at: 3700, level: true },
];

/** Callouts annotate a line by index. Left column reads the retrieval steps, right
 *  column the decision — which is also the order the transcript makes them in. */
const NOTES = [
  { side: "l", line: 2, title: "Guidelines", body: "Published treatment guidance, searched for this presentation." },
  { side: "l", line: 3, title: "Conditions", body: "What else it could be — walked from a clinical terminology, not guessed." },
  { side: "l", line: 4, title: "Two of three", body: "One source did not answer. The turn degrades; it does not fail." },
  { side: "r", line: 5, title: "Fusion", body: "Computed outside the model, so it can be shown rather than narrated." },
  { side: "r", line: 6, title: "Ruling", body: "Named a condition, so the floor is level 2 — held for a clinician." },
  { side: "r", line: 6, title: "Not the model's call", body: "The level was assigned by rules the model has no access to." },
] as const;

const TOTAL = 4400;

export function TerminalReplay() {
  const still = useStillness();
  const [revealed, setRevealed] = useState(0);
  const [finished, setFinished] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  /** True while the window is on screen, so re-entry replays but scrolling within
   *  the section does not retrigger. */
  const armed = useRef(false);

  // Derived, not stored. Under reduced motion the whole transcript is simply
  // present — there is no state to set, and so no cascading render to cause.
  const shown = still ? LINES.length : revealed;
  const done = still ? true : finished;

  /** Timers from the run in flight. A replay — by button or by scrolling back —
   *  starts a fresh schedule, and the old one has to be cancelled or its later lines
   *  land on top of the new run and finish it early. */
  const timers = useRef<number[]>([]);

  const run = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setRevealed(0);
    setFinished(false);
    LINES.forEach((l, i) => {
      timers.current.push(
        window.setTimeout(() => setRevealed((s) => Math.max(s, i + 1)), l.at)
      );
    });
    timers.current.push(window.setTimeout(() => setFinished(true), TOTAL));
  };

  useEffect(() => {
    const pending = timers;
    return () => pending.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    // The window, not the whole section. `host` also wraps the callouts, the mobile
    // list and the replay button, and a percentage threshold on an element taller
    // than the viewport can never be satisfied — the classic way a scroll trigger
    // silently never fires.
    const el = screen.current;
    if (!el || still) return;

    const io = new IntersectionObserver(
      (entries) => {
        const showing = entries[0].isIntersecting;
        if (showing && !armed.current) {
          armed.current = true;
          run();
        } else if (!showing) {
          // Re-arm only once it has fully left, so the transcript plays again the
          // next time you come to it but never restarts under your eyes.
          armed.current = false;
        }
      },
      { threshold: 0.45 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [still]);

  const note = (side: "l" | "r") =>
    NOTES.filter((n) => n.side === side).map((n) => {
      const on = shown > n.line;
      return (
        <div
          key={n.title}
          className={`transition-opacity duration-500 ${on ? "opacity-100" : "opacity-25"}`}
        >
          <div
            className={`flex items-center gap-2 ${side === "l" ? "flex-row-reverse" : ""}`}
          >
            {/* The leader. A rule out to a terminus, the way a parts diagram points
                at the thing it is naming. */}
            <span aria-hidden className="flex items-center gap-1 shrink-0">
              <span className="block w-8 h-px bg-border" />
              <span
                className={`block w-1 h-1 rounded-full transition-colors ${
                  on ? "bg-foreground" : "bg-border"
                }`}
              />
            </span>
            <p
              className={`label text-foreground ${side === "l" ? "text-right" : ""}`}
            >
              {n.title}
            </p>
          </div>
          <p
            className={`mt-1.5 text-[12px] text-muted leading-relaxed max-w-[26ch] ${
              side === "l" ? "text-right ml-auto" : ""
            }`}
          >
            {n.body}
          </p>
        </div>
      );
    });

  return (
    <div ref={host} className="relative">
      {/* Hairline grid. Rig runs a perspective grid behind theirs; flat is the right
          translation here, because this palette is chart stock and a vanishing point
          would be the only perspective in the entire product. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, var(--border) 0 1px, transparent 1px 72px), repeating-linear-gradient(to bottom, var(--border) 0 1px, transparent 1px 72px)",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, #000 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, #000 40%, transparent 100%)",
        }}
      />

      <div className="relative grid lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)_minmax(0,1fr)] gap-8 xl:gap-10 items-center">
        <div className="hidden lg:flex flex-col gap-9 items-end pt-4">
          {note("l")}
        </div>

        {/* ── The window ── */}
        <div
          ref={screen}
          className="border border-border bg-card shadow-[var(--shadow-2)] overflow-hidden"
        >
          <div className="flex items-center gap-3 h-9 px-3.5 border-b border-border bg-sunk">
            {/* Monochrome, as rig has them. Red/amber/green dots would put three
                triage colours in a decoration. */}
            <span aria-hidden className="flex gap-[6px] shrink-0">
              {[0, 1, 2].map((i) => (
                <span key={i} className="block w-2 h-2 rounded-full bg-border" />
              ))}
            </span>
            <p className="label flex-1 text-center truncate">
              consultation · replay
            </p>
            <span
              aria-hidden
              className={`block w-2 h-2 rounded-full shrink-0 transition-colors ${
                done ? "bg-border" : "bg-muted"
              }`}
            />
          </div>

          <div className="p-5 sm:p-6 min-h-[268px]">
            <pre className="data text-[12.5px] sm:text-[13px] leading-[1.85] whitespace-pre-wrap">
              {LINES.slice(0, shown).map((l, i) => (
                <span key={l.text} className="block">
                  <span
                    className={
                      l.glyph === "λ"
                        ? "text-foreground"
                        : l.glyph === "✓"
                          ? "text-foreground"
                          : "text-muted"
                    }
                  >
                    {l.glyph}
                  </span>{" "}
                  <span className={i === 0 ? "text-foreground" : ""}>{l.text}</span>
                  {l.meta && (
                    <span
                      className={l.level ? "font-semibold" : "text-muted"}
                      style={l.level ? { color: "var(--t2)" } : undefined}
                    >
                      {"  ·  "}
                      {l.meta}
                    </span>
                  )}
                </span>
              ))}
              {!done && shown > 0 && (
                <span className="blink text-muted" aria-hidden>
                  ▊
                </span>
              )}
            </pre>

            {done && (
              <p className="rise mt-4 pt-4 border-t border-border text-[13px] text-muted leading-relaxed">
                Held for a doctor. The assessment was drafted and withheld — it
                reaches you once a clinician approves it.
              </p>
            )}
          </div>
        </div>

        <div className="hidden lg:flex flex-col gap-9 items-start pt-4">
          {note("r")}
        </div>
      </div>

      {/* Below lg the callouts have nowhere to point, so they become an ordinary
          list under the window rather than disappearing. */}
      <div className="lg:hidden mt-8 grid sm:grid-cols-2 gap-6">
        {NOTES.map((n) => (
          <div key={n.title}>
            <p className="label text-foreground mb-1.5">{n.title}</p>
            <p className="text-[12px] text-muted leading-relaxed">{n.body}</p>
          </div>
        ))}
      </div>

      <div className="relative mt-8 flex justify-center">
        <button
          onClick={run}
          className="data text-[11px] uppercase tracking-[0.08em] font-semibold inline-flex items-center h-11 px-6 rounded-full border border-border bg-card text-muted hover:text-foreground hover:border-foreground transition-colors"
        >
          Replay
        </button>
      </div>
    </div>
  );
}
