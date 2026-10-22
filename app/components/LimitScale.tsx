"use client";

/**
 * The honest list, as a scale.
 *
 * Five sentences stacked in a `<ul>` said the limits exist and asked to be
 * skimmed. This makes you take them one at a time: the selected limit carries its
 * body copy and a plate, the other four collapse to a headline, and the rail on
 * the left spends six seconds on each before moving on. Same instrument as
 * `LevelScale` on the home page, for the same reason — a list invites skimming,
 * and this is the list least worth skimming.
 *
 * Each plate is dithered down to a coarse grid. On the images limit it keeps going
 * until the picture stops being readable, which is the argument rather than an
 * effect: the reader fails on that plate exactly where the system does. The other
 * four settle where their subject still reads, because illegibility there would
 * say something false.
 *
 * Colour never enters. The dither runs between two of the page's own tokens, and
 * the dwell rail is ink rather than a hue — unlike `LevelScale`'s, which is
 * allowed its triage colour because a triage colour is what it is showing. A limit
 * has no level, so it gets no colour.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { DitherShader } from "./DitherShader";
import { subscribeTheme } from "./ThemeProvider";
import { LIMITS } from "../lib/limits";
import { useStillness } from "../lib/useStillness";

/** Matching `LevelScale`: long enough to read the copy, short enough that the
 *  panel does not feel stuck. */
const DWELL = "6s";

/* The coarsening ladder, walked once when the section arrives.
 *
 * Discrete rather than a continuous sweep, and the first reason is the honest
 * one: dithering *is* a quantising process, so a stepped coarsening is true to the
 * medium. The second is that each step is a full re-dither — an O(pixels) pass in
 * plain 2D canvas — so five renders is a gesture and sixty a frame budget.
 *
 * It runs once, on arrival, rather than restarting on every plate change. Both
 * because a plate that re-dithers itself every six seconds competes with the rail
 * for the same attention, and because the ladder is clamped per plate anyway
 * (`grain` in limits.ts), so after it has run each plate simply appears at its own
 * settled coarseness. */
const LADDER = [2, 3, 4, 6, 8];
const STEP_MS = 190;

/**
 * One CSS custom property, read live off `:root` and kept current across a theme
 * change.
 *
 * Subscribed rather than sampled in an effect, for the reason `useStillness` gives
 * about the same problem: state set from a DOM reading inside an effect is a
 * cascading render, and the lint rules say so. The snapshot returns a string, so
 * React's `Object.is` check settles on value and the store does not thrash. Empty
 * on the server, which is also correct — the plate simply does not draw until
 * there is a real colour to draw it in.
 */
function useToken(name: string) {
  return useSyncExternalStore(
    subscribeTheme,
    () =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
    () => ""
  );
}

/** Rough relative luminance of a `#rgb` / `#rrggbb` token. Only ever used to ask
 *  which of two colours is the darker one, so approximate is plenty. */
function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.slice(0, 6);
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return 0;
  return (
    0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)
  );
}

export function LimitScale() {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false); // pointer or focus is on the scale
  const [inView, setInView] = useState(false);
  const [step, setStep] = useState(0);
  const still = useStillness();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const list = useRef<HTMLDivElement>(null);
  const current = LIMITS[active];

  // Same contract as LevelScale: the rail only runs while the scale is on screen
  // and nobody is reading it. An auto-advancing panel that keeps moving under the
  // cursor is the version of this pattern everyone hates, and WCAG 2.2.2 wants a
  // way to stop it — hover and focus are that way, and reduced motion opts out.
  const running = inView && !held && !still;

  /* The two ends of the duotone, read from the live tokens rather than written
     down here, so the plates follow a theme change instead of drifting out of it.

     Dark luminance always maps to whichever token is darker, which is what keeps
     these reading as photographs *printed* rather than as negatives: what is dark
     in the picture stays dark on the page, in both themes. Pinning it to a named
     token instead would be correct in one theme and inverted in the other. */
  const fg = useToken("--foreground");
  const bg = useToken("--background");
  const [ink, paper] =
    luminance(fg) < luminance(bg) ? [fg, bg] : [bg, fg];

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

  /* The plates sit a long way down the page, so the ladder is tied to arrival
     rather than to load — started on mount it would have finished, unwatched,
     before anyone reached the section. */
  useEffect(() => {
    if (still || !inView || step >= LADDER.length - 1) return;
    const t = setTimeout(() => setStep((s) => s + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [still, inView, step]);

  /* Stillness lands every plate in its *finished* state, not its opening one —
     the same reasoning `globals.css` gives for `.strike` and `.edge-draw`. A
     readable eye parked beside "it cannot look at images" would assert the
     opposite of the sentence it sits next to, so the frame that has to survive
     reduced motion is the last one. */
  const gridSize = still
    ? current.grain
    : Math.min(LADDER[step], current.grain);

  const advance = () => setActive((i) => (i + 1) % LIMITS.length);

  const onKey = (e: React.KeyboardEvent) => {
    const delta =
      e.key === "ArrowDown" || e.key === "ArrowRight"
        ? 1
        : e.key === "ArrowUp" || e.key === "ArrowLeft"
          ? -1
          : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (active + delta + LIMITS.length) % LIMITS.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14">
      {/* ── The plate ── */}
      <div
        role="tabpanel"
        id="limit-panel"
        aria-labelledby={`limit-tab-${active}`}
      >
        <figure>
          {/* Hidden from the accessibility tree deliberately: the vendored
              component labels its canvas "Dithered image", which is worse than
              nothing. The real description follows, and the caption below is
              visible to everyone. */}
          <div
            aria-hidden
            className="relative aspect-[5/4] w-full overflow-hidden border border-border bg-background"
          >
            {ink && paper && (
              <DitherShader
                src={`/plates/${current.plate}`}
                gridSize={gridSize}
                ditherMode="bayer"
                colorMode="duotone"
                primaryColor={ink}
                secondaryColor={paper}
                brightness={current.brightness}
                contrast={current.contrast}
                objectFit="cover"
                animated={false}
              />
            )}
          </div>
          <p className="sr-only">{current.alt}</p>
          <figcaption className="label mt-3">{current.caption}</figcaption>
        </figure>
      </div>

      {/* ── The scale ── */}
      <div
        ref={list}
        role="tablist"
        aria-label="What the system cannot do"
        onKeyDown={onKey}
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
        onFocusCapture={() => setHeld(true)}
        onBlurCapture={() => setHeld(false)}
      >
        {LIMITS.map((l, i) => {
          const on = i === active;
          return (
            <button
              key={l.head}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              id={`limit-tab-${i}`}
              aria-selected={on}
              aria-controls="limit-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              className={`group relative w-full border-t border-border py-5 pl-6 pr-2 text-left transition-colors ${
                i === LIMITS.length - 1 ? "border-b" : ""
              } ${on ? "" : "hover:bg-sunk/60"}`}
            >
              {/* The dwell rail, lifted from LevelScale: the track is always
                  there, the fill runs only on the active step, and advancing is
                  driven by the fill's own animationend — so the timer and the
                  thing displaying the timer can never disagree. No interval to
                  drift out of step with the bar. */}
              <span
                aria-hidden
                className="absolute bottom-0 left-0 top-0 w-[3px] overflow-hidden bg-border"
              >
                {on && (
                  <span
                    // Remounting on each change restarts the animation from zero;
                    // resetting it in place would need a reflow hack.
                    key={active}
                    // The class tracks `still` only, never `running` — toggling
                    // the animation class off would restart it from zero on every
                    // hover. Under reduced motion it must be absent rather than
                    // paused: the global reduced-motion rule forces every
                    // animation to 0.01ms, so a present-but-paused `dwell` would
                    // fire animationEnd instantly and spin the scale.
                    className={`block h-full w-full bg-foreground ${
                      still ? "" : "dwell"
                    }`}
                    style={{
                      ["--dwell" as string]: DWELL,
                      // Paused rather than unmounted, so the bar freezes where it
                      // is while you read instead of snapping back to zero.
                      animationPlayState: running ? "running" : "paused",
                      transform: still ? "scaleY(1)" : undefined,
                    }}
                    onAnimationEnd={advance}
                  />
                )}
              </span>

              <span
                className={`display-sm block text-[1.1rem] transition-colors sm:text-[1.25rem] ${
                  on
                    ? "text-foreground"
                    : "text-muted group-hover:text-foreground"
                }`}
              >
                {l.head}
              </span>

              {/* Only the selected limit carries its body. Collapsing the other
                  four is what makes this a scale rather than five sentences
                  competing for the same attention. */}
              <span
                className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                  on
                    ? "mt-2.5 grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <span className="overflow-hidden">
                  <span className="block max-w-[52ch] text-[14px] leading-relaxed text-muted">
                    {l.body}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
