"use client";

import { useEffect, useRef } from "react";
import { useStillness } from "../../lib/useStillness";

/* ── The signal ──
 *
 * The wait, drawn. Three traces that are one line while the question arrives, part into
 * three when the sources are read, fall out of step when they disagree, and close back
 * into a single calmer line once a level is set. It replaces a looping video that ran
 * on its own clock; this one is driven by the phase, so the picture and the sentence
 * beside it are always the same moment.
 *
 * The traces are bone, not the level colours: they are sources, and a source is not a
 * verdict. Each state below is {how far apart, how much they differ, how tall}.
 *
 * Drawn into three SVG paths from one requestAnimationFrame loop, with no React state
 * per frame. Under reduced motion the loop does not run: each phase is drawn once, as a
 * still of that moment.
 */
const STATES = [
  { spread: 0, differ: 0, height: 1 },
  { spread: 1, differ: 0, height: 0.8 },
  { spread: 1, differ: 1, height: 0.9 },
  { spread: 0, differ: 0, height: 0.5 },
];

const W = 1600;
const H = 900;
// How each trace departs from the others once they differ: pace, offset, height.
const PACE = [0.22, -0.16, 0.34];
const SHIFT = [0.0, 0.37, 0.71];
const TALL = [0.25, -0.3, 0.1];

// Sampled every 4 units: the spike is narrow, and a coarser step draws it as a tent.
const STEP = 4;

const bump = (f: number, at: number, width: number) => Math.exp(-(((f - at) / width) ** 2));

/** One heartbeat-like period on 0..1: a small lead-in, a spike, its rebound, a tail. */
function beat(u: number) {
  const f = u - Math.floor(u);
  return bump(f, 0.5, 0.04) - 0.34 * bump(f, 0.575, 0.035) + 0.14 * bump(f, 0.3, 0.07) + 0.1 * bump(f, 0.76, 0.09);
}

export function Signal({ phase }: { phase: number }) {
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const still = useStillness();
  const target = useRef(STATES[0]);
  const now = useRef({ ...STATES[0] });

  useEffect(() => {
    target.current = STATES[phase] ?? STATES[0];
  }, [phase]);

  // Still readers get one frame per phase; everyone else gets one continuous loop.
  const frame = still ? phase : 0;

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const draw = (time: number) => {
      const t = still ? 0 : (time - start) / 1000;
      const s = now.current;
      const to = target.current;
      const k = still ? 1 : 0.045;
      s.spread += (to.spread - s.spread) * k;
      s.differ += (to.differ - s.differ) * k;
      s.height += (to.height - s.height) * k;

      for (let i = 0; i < 3; i++) {
        const base = H * 0.56 + (i - 1) * s.spread * 125;
        const amp = 105 * s.height * (1 + s.differ * TALL[i]);
        let d = "";
        for (let x = -STEP; x <= W + STEP; x += STEP) {
          const u = (x / 540) * (1 + s.differ * PACE[i]) - t * 0.2 + s.differ * SHIFT[i];
          const y = base - amp * beat(u) + s.differ * 10 * Math.sin(u * 9 + i * 2.1);
          d += `${x === -STEP ? "M" : "L"}${x} ${y.toFixed(1)}`;
        }
        paths.current[i]?.setAttribute("d", d);
      }
      if (!still) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [still, frame]);

  return (
    <svg className="signal" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          ref={(el) => {
            paths.current[i] = el;
          }}
        />
      ))}
    </svg>
  );
}
