"use client";

import { useEffect, useRef, useState } from "react";
import { AutonomyField } from "./AutonomyField";
import { LEVELS } from "../lib/levels";
import { useStillness } from "../lib/useStillness";


/** Rig dwells 6s per step. Matching it: long enough to read the copy, short enough
 *  that the panel does not feel stuck. */
const DWELL = "6s";


/**
 * The scale, as a scale.
 *
 * Three static columns said the levels exist. This says they are one axis you move
 * along — which is the actual argument, because you only understand Level 2 by what
 * it gives up against Level 1 and holds back against Level 3. Selecting a level
 * redraws the field beside it, and the field is the autonomy split, not an
 * illustration of it.
 *
 * Tablist semantics rather than buttons: the three are mutually exclusive views of
 * one region, which is what a tablist is for. Arrow keys move between them.
 */
export function LevelScale() {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false); // pointer or focus is on the scale
  const [inView, setInView] = useState(false);
  const still = useStillness();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const list = useRef<HTMLDivElement>(null);
  const current = LEVELS[active];

  // The rail only runs while the scale is on screen and nobody is reading it. An
  // auto-advancing panel that keeps moving under the cursor is the classic version
  // of this pattern that everyone hates, and WCAG 2.2.2 wants a way to stop it —
  // hover and focus are that way, and reduced motion opts out entirely.
  const running = inView && !held && !still;

  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setInView(entries[0].isIntersecting),
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const advance = () => setActive((i) => (i + 1) % LEVELS.length);

  const onKey = (e: React.KeyboardEvent) => {
    const delta =
      e.key === "ArrowDown" || e.key === "ArrowRight"
        ? 1
        : e.key === "ArrowUp" || e.key === "ArrowLeft"
          ? -1
          : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (active + delta + LEVELS.length) % LEVELS.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="mt-14 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-10 lg:gap-14 items-stretch">
      {/* ── The scale ── */}
      <div
        ref={list}
        role="tablist"
        aria-label="Triage levels"
        onKeyDown={onKey}
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
        onFocusCapture={() => setHeld(true)}
        onBlurCapture={() => setHeld(false)}
      >
        {LEVELS.map((l, i) => {
          const on = i === active;
          return (
            <button
              key={l.level}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              id={`level-tab-${l.level}`}
              aria-selected={on}
              aria-controls="level-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              className={`group relative w-full text-left border-t border-border py-6 pl-6 pr-2 transition-colors ${
                i === LEVELS.length - 1 ? "border-b" : ""
              } ${on ? "" : "hover:bg-sunk/60"}`}
            >
              {/* Rig's dwell rail. The track is always there; the fill runs only on
                  the active step and advancing is driven by its own animationend, so
                  the timer and the thing showing the timer can never disagree — no
                  interval to drift out of step with the bar. The fill is the triage
                  colour, the only colour in the row, and it is carrying risk. */}
              <span
                aria-hidden
                className="absolute left-0 top-0 bottom-0 w-[3px] bg-border overflow-hidden"
              >
                {on && (
                  <span
                    // Remounting on each change restarts the animation from zero;
                    // resetting it in place would need a reflow hack.
                    key={active}
                    // The class tracks `still` only, never `running` — toggling the
                    // animation class off would restart it from zero on every hover.
                    // Under reduced motion it must be absent rather than paused: the
                    // global reduced-motion rule forces every animation to 0.01ms, so
                    // a present-but-paused `dwell` would fire animationEnd instantly
                    // and spin the scale.
                    className={`block w-full h-full ${still ? "" : "dwell"}`}
                    style={{
                      backgroundColor: `var(--${l.tone})`,
                      ["--dwell" as string]: DWELL,
                      // Paused rather than unmounted, so the bar freezes where it is
                      // while you read instead of snapping back to zero.
                      animationPlayState: running ? "running" : "paused",
                      transform: still ? "scaleY(1)" : undefined,
                    }}
                    onAnimationEnd={advance}
                  />
                )}
              </span>

              <span className="label block mb-2">Level {l.level}</span>
              <span
                className={`display-sm block text-[1.35rem] sm:text-[1.6rem] transition-colors ${
                  on ? "text-foreground" : "text-muted group-hover:text-foreground"
                }`}
              >
                {l.name}
              </span>

              {/* Only the selected level carries its body copy. Collapsing the
                  other two is what makes this a scale rather than three columns
                  competing for the same attention. */}
              <span
                className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                  on ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <span className="overflow-hidden">
                  <span className="block text-[14px] font-medium mb-2">
                    {l.holds}
                  </span>
                  <span className="block text-[14px] text-muted leading-relaxed max-w-[46ch]">
                    {l.detail}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ── The field ── */}
      <div
        role="tabpanel"
        id="level-panel"
        aria-labelledby={`level-tab-${current.level}`}
        className="relative min-h-[380px] lg:min-h-0 rounded-[var(--radius)] border border-border bg-sunk overflow-hidden"
      >
        <div className="absolute inset-0 p-3">
          <AutonomyField tone={current.tone} />
        </div>

        {/* The readout, centred in the field the way rig centres theirs. Every number
            here is the same number the field is drawing — the card annotates the
            picture, it does not add a second claim. `pointer-events-none` so the card
            never interrupts the halo: the cursor keeps addressing the panel while it
            passes over the text. */}
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
          <div className="w-full max-w-[300px] border border-border bg-card p-5 shadow-[var(--shadow-2)]">
          <p className="label mb-3">Who decides</p>

          <Row
            name="model"
            pct={current.ai}
            colour={`var(--${current.tone})`}
          />
          <Row name="clinician" pct={100 - current.ai} colour="var(--muted)" />

          <p className="mt-4 pt-3 border-t border-border text-[12px] text-muted leading-relaxed">
            {current.holds}
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const CELLS = 14;

/** A block meter, not a bar. Rig draws these as runs of filled glyphs, and the
 *  discreteness is doing real work here: the figure is a share of a decision, and a
 *  continuous bar would imply a precision the number does not have. Cells fill in
 *  sequence with a stagger, so the row reads left to right as it settles. */
function Row({
  name,
  pct,
  colour,
}: {
  name: string;
  pct: number;
  colour: string;
}) {
  const filled = Math.round((pct / 100) * CELLS);
  return (
    <div className="flex items-center gap-3 mb-2 last:mb-0">
      <span className="data text-[11px] text-muted w-[58px] shrink-0">{name}</span>
      <span className="flex flex-1 gap-[2px]" aria-hidden>
        {Array.from({ length: CELLS }, (_, i) => (
          <span
            key={i}
            className="flex-1 h-[9px] transition-colors duration-200"
            style={{
              backgroundColor: i < filled ? colour : "var(--accent-muted)",
              transitionDelay: `${i * 26}ms`,
            }}
          />
        ))}
      </span>
      <span className="data text-[11px] w-[34px] text-right shrink-0">{pct}%</span>
    </div>
  );
}
