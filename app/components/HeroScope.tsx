"use client";

/*
  The hero: a differential being narrowed, on a loop.

  This is the same object the consultation draws when it is working — candidates
  hold the outer dial while they are genuinely undecided and travel inward as the
  evidence resolves them, so radius is belief and the motion is the explanation
  rather than an effect laid over one. What it is NOT is a live consultation: the
  case below is a worked example, and the caption says so in as many words. A
  marketing page that implied it was running a real patient's differential would be
  lying about the one thing this product sells.

  Coherence with /about is deliberate — that page works through the guardian
  overruling the model on this same sore-throat case. The homepage shows what was
  considered; the about page shows what happened to it.
*/

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/* ── The worked case ───────────────────────────────────────────────────────── */

const COMPLAINT = "sore throat and fever, three days";

/* Ten candidates beneath the finding, and what the fusion made of each. Ordered as
   the ontology walk returns them, not by outcome — the dial is not a ranking. */
const CANDIDATES = [
  { label: "Streptococcal pharyngitis", outcome: "settled" },
  { label: "Acute tonsillitis", outcome: "considered" },
  { label: "Infectious mononucleosis", outcome: "considered" },
  { label: "Viral pharyngitis", outcome: "considered" },
  { label: "Peritonsillar abscess", outcome: "out" },
  { label: "Acute epiglottitis", outcome: "out" },
  { label: "Herpangina", outcome: "out" },
  { label: "Diphtheria", outcome: "out" },
  { label: "Reflux laryngitis", outcome: "out" },
  { label: "Oral candidiasis", outcome: "out" },
] as const;

type Outcome = (typeof CANDIDATES)[number]["outcome"];

/* Pairs sharing a defining attribute in the terminology — the same finding site or
   the same causative agent. These are the edges the ontology actually carries, which
   is why there are four of them and not forty. */
const LINKS: [number, number][] = [
  [0, 1],
  [1, 4],
  [2, 3],
  [0, 3],
];

/* ── Geometry ──────────────────────────────────────────────────────────────── */

const W = 720;
const H = 430;
const CX = W / 2;
const CY = H / 2;

const R_OUT = 152;
const R_MID = 84;

const MONO = "var(--font-iosevka), ui-monospace, monospace";
const CH = 5.5; // Iosevka advance at 11px (0.5em) — labels cut to the room left

const WEIGH_MS = 2600;
const HOLD_MS = 5200;

function fit(label: string, available: number) {
  const max = Math.max(4, Math.min(28, Math.floor(available / CH)));
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

function radiusFor(outcome: Outcome) {
  if (outcome === "settled") return 0;
  if (outcome === "considered") return R_MID;
  return R_OUT;
}

/* The dial. Sixty ticks with every fifth struck long — the graduation of an
   instrument, and the one piece of pure ornament on the page. It earns its place by
   making the outer circle read as a scale that the nodes are positioned ON, rather
   than a container they happen to sit in. */
function Dial() {
  return (
    <g stroke="var(--border)" strokeWidth={1} vectorEffect="non-scaling-stroke">
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i * 2 * Math.PI) / 60;
        const long = i % 5 === 0;
        const r1 = R_OUT + 6;
        const r2 = R_OUT + (long ? 15 : 10);
        return (
          <line
            key={i}
            x1={CX + r1 * Math.cos(a)}
            y1={CY + r1 * Math.sin(a)}
            x2={CX + r2 * Math.cos(a)}
            y2={CY + r2 * Math.sin(a)}
            strokeOpacity={long ? 0.9 : 0.45}
          />
        );
      })}
    </g>
  );
}

export function HeroScope() {
  const reduced = useReducedMotion();
  // Reduced motion gets the resolved dial and no loop: the settled state is the one
  // that carries the information, so stillness costs the reader nothing.
  const [weighing, setWeighing] = useState(!reduced);

  useEffect(() => {
    if (reduced) return;
    let timer: ReturnType<typeof setTimeout>;

    const settle = () => {
      setWeighing(false);
      timer = setTimeout(weigh, HOLD_MS);
    };
    const weigh = () => {
      setWeighing(true);
      timer = setTimeout(settle, WEIGH_MS);
    };

    timer = setTimeout(settle, WEIGH_MS);
    return () => clearTimeout(timer);
  }, [reduced]);

  const spread = (i: number, n: number) =>
    -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(n, 1);

  // While weighing, every candidate holds its own slot on the dial. Once resolved,
  // each ring is redistributed around its OWN circle — sharing one angle assignment
  // across rings leaves whichever nodes survive clustered in the arc they started
  // in, with the rest of the dial empty.
  const startAngle = CANDIDATES.map((_, i) => spread(i, CANDIDATES.length));

  const ringOf = (o: Outcome) => (o === "settled" ? 0 : o === "considered" ? 1 : 2);
  const rings: number[][] = [[], [], []];
  CANDIDATES.forEach((c, i) => rings[ringOf(c.outcome)].push(i));

  const placed = CANDIDATES.map((candidate, i) => {
    const ring = rings[ringOf(candidate.outcome)];
    const angle = weighing
      ? startAngle[i]
      : spread(ring.indexOf(i), ring.length);
    const r = weighing ? R_OUT : radiusFor(candidate.outcome);

    return {
      i,
      candidate,
      angle,
      x: CX + r * Math.cos(angle),
      y: CY + r * Math.sin(angle),
    };
  });

  const settledLabel = CANDIDATES.find((c) => c.outcome === "settled")!.label;
  const ruledOut = CANDIDATES.filter((c) => c.outcome === "out").length;

  return (
    <figure className="min-w-0">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-foreground pb-2.5">
        <span className="label">Illustrative consultation</span>
        <span className="data text-[11px] text-muted">“{COMPLAINT}”</span>
      </figcaption>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`A worked example. Ten conditions were weighed against a complaint of ${COMPLAINT}; ${ruledOut} were passed over and the assessment settled on ${settledLabel}.`}
      >
        <Dial />

        <circle
          cx={CX}
          cy={CY}
          r={R_OUT}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx={CX}
          cy={CY}
          r={R_MID}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1}
          strokeDasharray="2 4"
          vectorEffect="non-scaling-stroke"
        />

        {weighing && !reduced && (
          // SVG's own rotate takes the centre as arguments, so there is no
          // transform-box or transform-origin to resolve against the wrong
          // reference box — which is exactly what leaves a CSS-rotated arm frozen.
          <line
            x1={CX}
            y1={CY}
            x2={CX}
            y2={CY - R_OUT}
            stroke="var(--node-live)"
            strokeWidth={1}
            strokeOpacity={0.32}
            vectorEffect="non-scaling-stroke"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${CX} ${CY}`}
              to={`360 ${CX} ${CY}`}
              dur="3.4s"
              repeatCount="indefinite"
            />
          </line>
        )}

        {/* Shared-attribute links, drawn only while the candidates are still in play.
            Once the fusion resolves, what relates them stops being the point. */}
        {LINKS.map(([a, b]) => {
          const from = placed[a];
          const to = placed[b];
          return (
            <motion.path
              key={`${a}-${b}`}
              d={`M ${from.x} ${from.y} Q ${CX} ${CY} ${to.x} ${to.y}`}
              fill="none"
              stroke="var(--node-live)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              animate={{ strokeOpacity: weighing ? 0.28 : 0 }}
              transition={{ duration: 0.5 }}
            />
          );
        })}

        {placed.map(({ i, candidate, angle, x, y }) => {
          const out = !weighing && candidate.outcome === "out";
          const won = !weighing && candidate.outcome === "settled";

          const cos = Math.cos(angle);
          const vertical = Math.abs(cos) < 0.34;
          const anchor = won || vertical ? "middle" : cos > 0 ? "start" : "end";
          const pad = won ? 0 : vertical ? 0 : cos > 0 ? 13 : -13;

          const available = won
            ? W * 0.5
            : vertical
              ? Math.min(x, W - x) * 1.7
              : cos > 0
                ? W - 12 - (x + pad)
                : x + pad - 12;

          const dy = won ? 32 : vertical ? (Math.sin(angle) > 0 ? 22 : -15) : 3.8;

          return (
            <motion.g
              key={candidate.label}
              className={weighing ? "blink" : undefined}
              style={{ animationDelay: `${(i % 4) * 240}ms` }}
              animate={{ x: x - CX, y: y - CY }}
              transition={{
                // A spring, not an ease. The node is settling under evidence, and a
                // slight overshoot reads as arriving somewhere rather than being put
                // there.
                type: "spring",
                stiffness: won ? 150 : 110,
                damping: won ? 16 : 20,
                delay: reduced ? 0 : 0.05 * i,
              }}
            >
              {won && (
                <circle
                  cx={CX}
                  cy={CY}
                  r={19}
                  fill="none"
                  stroke="var(--node-live)"
                  strokeWidth={1}
                  strokeOpacity={0.4}
                />
              )}
              <circle
                cx={CX}
                cy={CY}
                r={won ? 9 : out ? 3.5 : 5.5}
                fill={
                  out
                    ? "var(--node-out)"
                    : !weighing && candidate.outcome === "considered"
                      ? "var(--card)"
                      : "var(--node-live)"
                }
                stroke={out ? "var(--node-out)" : "var(--node-live)"}
                strokeWidth={
                  !weighing && candidate.outcome === "considered" ? 1.5 : 1
                }
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={CX + pad}
                y={CY + dy}
                textAnchor={anchor}
                fontFamily={MONO}
                fontSize={won ? 12.5 : 11}
                fontWeight={won ? 600 : 400}
                letterSpacing={won ? "0.01em" : "0.005em"}
                fill={out ? "var(--node-out)" : "var(--foreground)"}
                style={out ? { textDecoration: "line-through" } : undefined}
              >
                {fit(candidate.label, available)}
              </text>
            </motion.g>
          );
        })}
      </svg>

      <div className="flex items-baseline justify-between gap-4 border-t border-border pt-2.5">
        <span className="label">
          {weighing ? "Weighing 10 conditions" : `Settled · ${ruledOut} passed over`}
        </span>
        <span className="label">Ontology · guidelines · live sources</span>
      </div>
    </figure>
  );
}
