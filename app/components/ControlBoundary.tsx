"use client";

import { useStillness } from "../lib/useStillness";

/**
 * What the model controls, and what it cannot reach.
 *
 * Rig proves a claim by drawing the connections that do not exist — cloud severed,
 * telemetry severed. The device suits this product better than it suits theirs,
 * because the whole safety argument is about paths the model has no access to: it
 * drafts an answer and proposes a level, and it can do nothing about what level the
 * answer is released at, or whether it reaches you at all.
 *
 * One inline SVG, as rig builds it. That is not incidental — the first version of
 * this used rotated HTML spans and a CSS strike, and a running animation overrides
 * inline styles on the property it animates, so the keyframe's `scaleX(1)` wiped the
 * rotation and both bars of every cross landed flat on top of each other. In SVG a
 * cross is two diagonal lines and there is no transform to conflict with.
 *
 * The travelling marks are SMIL, so they cost no JavaScript: green ones run the live
 * links, and a red one runs at each barrier and dies on it.
 */

const GREEN = "var(--t1)";
const RED = "var(--t3)";

/** Two diagonal lines, centred on (cx, cy). Rig's exact construction. */
function Cross({ cx, cy, r = 6 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <line x1={cx - r} y1={cy - r} x2={cx + r} y2={cy + r} stroke={RED} strokeWidth={1.8} />
      <line x1={cx + r} y1={cy - r} x2={cx - r} y2={cy + r} stroke={RED} strokeWidth={1.8} />
    </g>
  );
}

/** A mark that runs a path. `fade` kills it partway, for the ones that hit a barrier. */
function Runner({
  path,
  colour,
  dur,
  fade,
}: {
  path: string;
  colour: string;
  dur: string;
  fade?: boolean;
}) {
  return (
    <rect x={-1.6} y={-1.6} width={3.2} height={3.2} fill={colour} pointerEvents="none">
      <animateMotion dur={dur} repeatCount="indefinite" calcMode="linear">
        <mpath href={`#${path}`} />
      </animateMotion>
      <animate
        attributeName="opacity"
        values={fade ? "0.9;0.9;0" : "0;1;1;0"}
        keyTimes={fade ? "0;0.55;1" : "0;0.1;0.8;1"}
        dur={dur}
        repeatCount="indefinite"
      />
    </rect>
  );
}

function Box({
  x,
  y,
  w,
  h,
  title,
  sub,
  subColour,
  stroke,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
  subColour?: string;
  stroke?: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="var(--card)"
        stroke={stroke ?? "var(--border)"}
        strokeWidth={1}
      />
      <text
        x={x + w / 2}
        y={y + (sub ? h / 2 - 6 : h / 2)}
        textAnchor="middle"
        dominantBaseline="central"
        className="data"
        fontSize={8.5}
        fontWeight={500}
        letterSpacing={1}
        fill="var(--foreground)"
      >
        {title}
      </text>
      {sub && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 8}
          textAnchor="middle"
          dominantBaseline="central"
          className="data"
          fontSize={6.4}
          fontWeight={500}
          letterSpacing={0.7}
          fill={subColour ?? "var(--muted)"}
        >
          {sub}
        </text>
      )}
    </g>
  );
}

export function ControlBoundary() {
  const still = useStillness();

  return (
    <div>
      <svg
        viewBox="0 0 560 258"
        className="w-full h-auto"
        role="img"
        aria-label="The model reads your words, weighs evidence and drafts an answer. It cannot set the triage level, and it cannot release the answer to you directly."
      >
        <defs>
          <path id="cb-in" d="M130,128 L196,128" />
          <path id="cb-out" d="M364,128 L430,128" />
          <path id="cb-top" d="M280,40 L280,62" />
          <path id="cb-bottom" d="M280,196 L280,218" />
        </defs>

        {/* ── Severed: the level ── */}
        <Box x={200} y={8} w={160} h={32} title="THE TRIAGE LEVEL" stroke={RED} />
        <line x1={280} y1={40} x2={280} y2={74} stroke={RED} strokeWidth={0.8} strokeDasharray="3 5" opacity={0.5} />
        {!still && <Runner path="cb-top" colour={RED} dur="1.8s" fade />}
        <Cross cx={280} cy={57} />

        {/* ── The boundary ── */}
        <rect x={5} y={74} width={550} height={108} fill="none" stroke="var(--border)" strokeWidth={1} strokeDasharray="4 4" />
        {/* Knockout behind the label, so the dashed rule does not run through it. */}
        <rect x={18} y={67} width={140} height={14} fill="var(--card)" />
        <text x={24} y={75} className="data" fontSize={6.5} fontWeight={500} letterSpacing={1.5} fill="var(--muted)">
          WHAT THE MODEL CONTROLS
        </text>

        <Box x={20} y={103} w={110} h={50} title="YOUR WORDS" sub="SYMPTOMS · HISTORY" />

        <line x1={130} y1={128} x2={196} y2={128} stroke={GREEN} strokeWidth={1} opacity={0.35} />
        {!still && <Runner path="cb-in" colour={GREEN} dur="2.2s" />}

        <Box x={196} y={98} w={168} h={60} title="THE MODEL" sub="✓ READS · WEIGHS · DRAFTS" subColour={GREEN} stroke={GREEN} />

        <line x1={364} y1={128} x2={430} y2={128} stroke={GREEN} strokeWidth={1} opacity={0.35} />
        {!still && <Runner path="cb-out" colour={GREEN} dur="2.2s" />}

        <Box x={430} y={103} w={110} h={50} title="A DRAFT" sub="AND A PROPOSAL" />

        {/* ── Severed: release ── */}
        <line x1={280} y1={182} x2={280} y2={218} stroke={RED} strokeWidth={0.8} strokeDasharray="3 5" opacity={0.5} />
        {!still && <Runner path="cb-bottom" colour={RED} dur="1.8s" fade />}
        <Cross cx={280} cy={200} />
        <Box x={200} y={218} w={160} h={32} title="YOU, DIRECTLY" stroke={RED} />
      </svg>

      {/* Kept out of the SVG: wrapping text inside one means hand-breaking every
          line, and these two want to stay readable at any width. */}
      <div className="mt-8 grid sm:grid-cols-2 gap-x-12 gap-y-5">
        {[
          {
            head: "It cannot set the level",
            body: "The triage level is assigned by deterministic rules the model cannot read and no prompt can argue past. It proposes; it never sets.",
          },
          {
            head: "It cannot release to you",
            body: "At Level 2 and above the draft is withheld. It reaches you when a clinician approves it, and not before.",
          },
        ].map((c) => (
          <div key={c.head} className="flex gap-3">
            <span aria-hidden className="mt-[3px] shrink-0 data text-[13px]" style={{ color: RED }}>
              ✕
            </span>
            <p className="text-[13.5px] text-muted leading-relaxed">
              <span className="text-foreground font-medium">{c.head}.</span>{" "}
              {c.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
