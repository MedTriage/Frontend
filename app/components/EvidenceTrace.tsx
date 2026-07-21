"use client";

/*
  The scope — every condition the system weighed, settling as the evidence lands.

  Radius carries the meaning. A candidate holds the outer ring while it is genuinely
  undecided, and travels inward when the fusion resolves it: to the middle ring if
  evidence supported it, to the centre if it became the answer. Nothing that was passed
  over moves. So the distance a node covers IS the belief that accrued to it, and the
  animation is the explanation rather than an effect laid over one.

  The timing is honest. Candidates arrive when the ontology walk lands — really
  undecided at that moment, which is what the blink says — and resolve when the fusion
  runs. The stagger is easing of a known result; the system does not decide them one at
  a time and this does not pretend it does.

  Set in the mono face throughout. The palette calls mono "anything a clinician would
  read off a printout", and a differential being narrowed is exactly that. It also
  gives predictable character widths, which is what lets every label be truncated to
  the space actually left beside it instead of running off the frame.

  Colour is the one authorised exception to "colour means risk", quarantined here:
  --node-live for a live candidate, --node-out once passed over, --node-finding for the
  patient's own words. Deliberately not --t1 — a live candidate must not borrow the
  meaning of "safe". Status also changes radius, fill and strike, so the scope survives
  being read with no colour at all.
*/

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";

export type SourceStatus = "reported" | "no_findings" | "unavailable" | "pending";

type NodeStatus = "finding" | "settled" | "considered" | "considering" | "ruled_out";

interface GraphNode {
  id: number;
  label: string;
  status: NodeStatus;
}

export interface Differential {
  findings: GraphNode[];
  candidates: GraphNode[];
  edges: { from: number; to: number }[];
  links?: { from: number; to: number; via?: string }[];
  hidden: number;
  ruled_out: number;
}

export interface Explanation {
  sources: { status: SourceStatus }[];
  sources_reported: number;
  agreement: { band: string; value: number };
  certainty: { band: string; value: number };
  outcome: {
    triage_level: 1 | 2 | 3;
    requires_doctor: boolean;
    reason: string;
  };
  differential?: Differential | null;
}

const W = 660;
const H = 330;
const CX = W / 2;
const CY = H / 2;

const R_OUT = 118;
const R_MID = 66;

const MONO = "var(--font-plex-mono), ui-monospace, monospace";
// Plex Mono advance width at 10px. Labels are truncated to the space actually left
// between the node and the frame, which is what stops the overflow.
const CH = 6.02;
const MAX_NODES = 10;

function radiusFor(status: NodeStatus) {
  if (status === "settled") return 0;
  if (status === "considered") return R_MID;
  return R_OUT;
}

function fit(label: string, available: number) {
  const max = Math.max(4, Math.min(26, Math.floor(available / CH)));
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

function Scope({ graph, settling }: { graph: Differential; settling: boolean }) {
  const reduced = useReducedMotion();

  // Stable order first, so a node keeps its identity across the turn.
  const ordered = [...graph.candidates].sort((a, b) => a.id - b.id).slice(0, MAX_NODES);

  const spread = (i: number, n: number) => -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(n, 1);

  // Each ring is distributed around its OWN circle. Sharing one angle assignment across
  // rings looked broken: whichever nodes happened to survive clustered into whatever
  // arc they started in, leaving the rest of the dial empty. Nodes therefore travel
  // along an arc as well as inward, which also reads better than a straight collapse.
  const startAngle = new Map(ordered.map((n, i) => [n.id, spread(i, ordered.length)]));

  const groupOf = (s: NodeStatus) => (s === "settled" ? 0 : s === "considered" ? 1 : 2);
  const grouped: GraphNode[][] = [[], [], []];
  ordered.forEach((n) => grouped[groupOf(settling ? "considering" : n.status)].push(n));

  const placed = ordered.map((node) => {
    const group = grouped[groupOf(settling ? "considering" : node.status)];
    const index = group.indexOf(node);
    const angle = settling
      ? startAngle.get(node.id)!
      : spread(index, group.length);
    const r = settling ? R_OUT : radiusFor(node.status);
    const from = startAngle.get(node.id)!;

    return {
      node,
      angle,
      x: CX + r * Math.cos(angle),
      y: CY + r * Math.sin(angle),
      // Where the node STARTS. The settled scope is a fresh mount — the live one lives
      // in the typing indicator and is destroyed when the answer arrives — so the
      // settle must animate from the outer ring on mount. A transition between renders
      // would have nothing to transition from.
      fromX: CX + R_OUT * Math.cos(from),
      fromY: CY + R_OUT * Math.sin(from),
    };
  });

  const byId = new Map(placed.map((p) => [p.node.id, p]));
  const settled = placed.find((p) => p.node.status === "settled");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img"
      aria-label={`${graph.candidates.length} conditions weighed; ${graph.ruled_out} passed over.${settled ? ` Settled on ${settled.node.label}.` : ""}`}
    >
      <circle cx={CX} cy={CY} r={R_OUT} fill="none" stroke="var(--border)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <circle cx={CX} cy={CY} r={R_MID} fill="none" stroke="var(--border)" strokeWidth={1} strokeDasharray="2 4" vectorEffect="non-scaling-stroke" />

      {settling && !reduced && (
        // SVG's own rotate takes the centre as arguments, so there is no transform-box
        // or transform-origin to get wrong — which is what left the arm frozen upright.
        // CSS rotation on an SVG child resolves its origin against a reference box that
        // depends on transform-box, and neither default lands on the scope's centre.
        <g>
          <line
            x1={CX} y1={CY} x2={CX} y2={CY - R_OUT}
            stroke="var(--node-live)" strokeWidth={1} strokeOpacity={0.3}
            vectorEffect="non-scaling-stroke"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${CX} ${CY}`}
              to={`360 ${CX} ${CY}`}
              dur="3.6s"
              repeatCount="indefinite"
            />
          </line>
        </g>
      )}

      {(graph.links ?? []).map((l) => {
        const a = byId.get(l.from);
        const b = byId.get(l.to);
        if (!a || !b) return null;
        return (
          <path
            key={`l${l.from}-${l.to}`}
            d={`M ${a.x} ${a.y} Q ${CX} ${CY} ${b.x} ${b.y}`}
            fill="none" stroke="var(--node-live)" strokeWidth={1} strokeOpacity={0.3}
            vectorEffect="non-scaling-stroke"
          >
            <title>{l.via}</title>
          </path>
        );
      })}

      {placed.map(({ node, angle, x, y, fromX, fromY }, i) => {
        const out = node.status === "ruled_out";
        const won = node.status === "settled";
        const live = node.status === "considering";

        const cos = Math.cos(angle);
        const vertical = Math.abs(cos) < 0.34;
        const anchor = won || vertical ? "middle" : cos > 0 ? "start" : "end";
        const pad = won ? 0 : vertical ? 0 : cos > 0 ? 11 : -11;

        const available = won
          ? W * 0.5
          : vertical
            ? Math.min(x, W - x) * 1.7
            : cos > 0
              ? W - 10 - (x + pad)
              : x + pad - 10;

        const dy = won ? 27 : vertical ? (Math.sin(angle) > 0 ? 20 : -14) : 3.4;

        return (
          <motion.g
            key={node.id}
            className={live ? "blink" : undefined}
            style={{ animationDelay: `${(i % 4) * 240}ms` }}
            initial={
              reduced
                ? false
                : { x: fromX - CX, y: fromY - CY, opacity: 0, scale: 0.7 }
            }
            animate={{ x: x - CX, y: y - CY, opacity: out ? 0.75 : 1, scale: 1 }}
            transition={{
              // Spring, not an ease: the node is settling under evidence, and a slight
              // overshoot reads as arriving somewhere rather than being placed there.
              type: "spring",
              stiffness: won ? 150 : 110,
              damping: won ? 16 : 20,
              delay: reduced ? 0 : 0.06 * i,
            }}
          >
            {won && (
              <circle cx={CX} cy={CY} r={16} fill="none" stroke="var(--node-live)" strokeWidth={1} strokeOpacity={0.4} />
            )}
            <circle
              cx={CX} cy={CY}
              r={won ? 8 : out ? 3.5 : 5}
              fill={out ? "var(--node-out)" : node.status === "considered" ? "var(--card)" : "var(--node-live)"}
              stroke={out ? "var(--node-out)" : "var(--node-live)"}
              strokeWidth={node.status === "considered" ? 1.5 : 1}
              vectorEffect="non-scaling-stroke"
            />
            <text
              x={CX + pad} y={CY + dy}
              textAnchor={anchor}
              fontFamily={MONO}
              fontSize={won ? 11.5 : 10}
              fontWeight={won ? 600 : 400}
              letterSpacing={won ? "0.02em" : "0.01em"}
              fill={out ? "var(--node-out)" : "var(--foreground)"}
              style={out ? { textDecoration: "line-through" } : undefined}
            >
              {fit(node.label, available)}
              <title>{node.label}</title>
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}

export function EvidenceTrace({
  explanation,
  live = false,
}: {
  explanation: Explanation;
  live?: boolean;
}) {
  const { agreement, certainty, outcome, differential } = explanation;
  const settling = !!differential?.candidates?.some((c) => c.status === "considering");
  // Opens on arrival, holds long enough for the settle to play out, then folds itself
  // away. Collapsing immediately would hide the one moment worth watching; staying open
  // would bury the answer under the working.
  const [open, setOpen] = useState(true);
  const collapsed = useRef(false);

  useEffect(() => {
    if (live || settling || collapsed.current) return;
    const t = setTimeout(() => {
      collapsed.current = true; // only ever auto-collapses once, never fights the user
      setOpen(false);
    }, 2800);
    return () => clearTimeout(t);
  }, [live, settling]);

  if (!differential || differential.candidates.length === 0) return null;

  const expanded = live || settling || open;

  const notDrawn =
    differential.hidden + Math.max(0, differential.candidates.length - MAX_NODES);
  const from = differential.findings.map((f) => f.label).join(", ");

  const rule =
    outcome.triage_level === 3
      ? "border-l-t3"
      : outcome.triage_level === 2
        ? "border-l-t2"
        : "border-l-t1";

  return (
    <figure className="mt-3 border border-border bg-card rise">
      <figcaption
        className={`flex items-center justify-between gap-3 px-4 pt-3.5 pb-2.5 ${expanded ? "border-b border-border" : ""}`}
      >
        {live ? (
          // No collapse control while the turn is still running: the narrowing is the
          // wait, and there is nothing yet to collapse it in favour of.
          <>
            <span className="label">
              {settling ? "Weighing the possibilities" : "Narrowing it down"}
            </span>
            <span className="data text-[10px] text-muted tabular-nums">
              {settling
                ? `${differential.candidates.length} in play`
                : `${differential.ruled_out} passed over`}
            </span>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <span className="label flex items-center gap-1.5">
              <ChevronDown
                className={`h-3 w-3 transition-transform ${open ? "" : "-rotate-90"}`}
              />
              What was considered
            </span>
            <span className="data text-[10px] text-muted tabular-nums">
              {differential.ruled_out} passed over
            </span>
          </button>
        )}
      </figcaption>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="scope"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            {from && (
              <p className="label px-4 pt-2.5" style={{ color: "var(--node-finding)" }}>
                from {from}
              </p>
            )}

            <div className="px-2 pb-1">
              <Scope graph={differential} settling={settling} />
            </div>

            {notDrawn > 0 && (
              <div className="border-t border-border px-4 py-2">
                <span className="label">{notDrawn} more examined and passed over</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!live && !settling && (
        <>
          <div className="flex items-baseline justify-between gap-3 border-t border-border px-4 py-2">
            <span className="label">Agreement {agreement.band}</span>
            <span className="label">Certainty {certainty.band}</span>
          </div>
          <div className={`border-t border-border border-l-2 ${rule} px-4 py-3`}>
            <p className="text-[13px] leading-relaxed text-foreground">{outcome.reason}</p>
          </div>
        </>
      )}
    </figure>
  );
}
