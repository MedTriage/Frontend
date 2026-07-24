"use client";

/*
  The stage — a consultation assembling itself as you scroll.

  Five fragments of one case hang as loose material, converge into a single track,
  and a playhead runs its length. The metaphor is a video timeline and it survives
  the move intact, because a triage turn genuinely is one: a record, three sources
  pulled at once, a ruling, in that order and on a clock.

  Nothing here runs on a timer. The hero pins for a little over two viewport
  heights and every beat is scrubbed against scroll position, so the assembly is
  something the reader performs rather than watches. Pinning is a sticky child
  inside a tall parent rather than a scroll library taking over the document —
  same result, and it does not fight React over who owns the layout.

  Beat map (fractions of the pinned scroll):

      0.12 ─ 0.32   clips travel to their slots
      0.16 ─ 0.24   the track rule appears
      0.20 ─ 0.25   the playhead grows from its top
      0.22 ─ 0.84   the playhead sweeps
      0.28 ─ 0.40   splitter rules draw
      0.34 ─ 0.48   headline one flips out
      0.56 ─ 0.72   headline two flips in
      0.86 ─ 1.00   everything leaves, outward from centre
*/

import { useRef, type ReactNode } from "react";
import { Mark } from "./Navbar";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

const DOCK: [number, number] = [0.12, 0.32];
const LINE: [number, number] = [0.16, 0.24];
const HEAD: [number, number] = [0.2, 0.25];
const SWEEP: [number, number] = [0.22, 0.84];
const SPLITTER: [number, number] = [0.28, 0.4];
const FLIP_OUT: [number, number] = [0.34, 0.48];
const FLIP_IN: [number, number] = [0.56, 0.72];
const EXIT: [number, number] = [0.86, 1.0];

const LINES_ONE = ["Medical AI that", "knows when to stop."];
const LINES_TWO = ["Every answer arrives", "with its working."];

/* ── The fragments ────────────────────────────────────────────────────────────

   Full-bleed, and every one carries real content rather than placeholder shapes.
   Grey skeleton bars are a loading-state graphic: at this size they read as
   "unfinished", which is the opposite of what a hero card is for. Density here has
   to come from actual words and figures, because unlike the site this is modelled
   on, the product operates on text and structure rather than on photographs.

   Nothing is attributed to a named source. The passage is genuine clinical
   content, but inventing "WHO 2024 §4.2" underneath it would be fabricating a
   citation on a medical marketing page — the counts are real in shape and the
   provenance stays honestly generic.
   ────────────────────────────────────────────────────────────────────────────── */

const CARD_H = 150;

/* The filename floats over the content instead of sitting in its own strip. A 32px
   header on a 150px card spends a fifth of the surface on chrome; the scrim costs
   nothing and keeps it legible over whatever is beneath. */
function Clip({
  label,
  splitter,
  children,
}: {
  label: string;
  splitter?: MotionValue<string>;
  children: ReactNode;
}) {
  return (
    <div className="deck-card overflow-hidden relative" style={{ height: CARD_H }}>
      {children}
      <div className="absolute inset-x-0 top-0 h-9 bg-gradient-to-b from-card via-card/85 to-transparent" />
      <span className="data absolute top-2.5 left-3 text-[10px] text-muted">{label}</span>
      {/* Ponder's splitter: a rule that draws itself under the filename once the
          clip has taken its place in the order. */}
      {splitter && (
        <motion.span
          className="absolute left-3 right-3 top-[26px] h-px bg-border"
          style={{ scaleX: splitter, originX: 0 }}
        />
      )}
    </div>
  );
}

function Complaint() {
  return (
    <div className="h-full px-3 pt-8 pb-2.5 flex flex-col">
      <p className="data text-[11px] leading-[1.55]">
        “I&apos;ve had a sore throat and a fever for three days.”
      </p>
      {/* Verbatim from a real record (data/conversations/3d1f551e…), including the
          turn number — these are the scribe's own extracted strings, not a
          paraphrase of them. */}
      <div className="mt-auto">
        <div className="flex flex-wrap gap-1 mb-1.5">
          {["sore throat for three days", "fever for three days"].map((t) => (
            <span
              key={t}
              className="data text-[9px] px-1.5 py-[3px] border border-border text-muted"
            >
              {t}
            </span>
          ))}
        </div>
        <span className="data text-[9.5px] text-muted">turn 1 · 2 symptoms</span>
      </div>
    </div>
  );
}

function Guidelines() {
  return (
    <div className="h-full px-3 pt-8 pb-2.5 flex flex-col">
      <p className="data text-[10.5px] leading-[1.6]">
        Group A streptococcal pharyngitis{" "}
        <mark className="bg-accent-muted text-foreground px-[2px]">
          cannot be distinguished from viral pharyngitis
        </mark>{" "}
        on clinical grounds alone.
      </p>
      <div className="mt-auto flex items-baseline justify-between">
        <span className="data text-[9.5px] text-muted">retrieved passage</span>
        <span className="data text-[9.5px] text-muted">4 / 11</span>
      </div>
    </div>
  );
}

const SOURCES = [
  { name: "FDA", result: "3 label matches", ok: true },
  { name: "PubMed", result: "7 abstracts", ok: true },
  { name: "RxNorm", result: "no match", ok: false },
];

function LiveSources() {
  return (
    <div className="h-full px-3 pt-8 pb-2.5 flex flex-col">
      <ul>
        {SOURCES.map((s) => (
          <li
            key={s.name}
            className="flex items-center gap-2 py-[5px] border-b border-border last:border-b-0"
          >
            <span
              className={`w-1.5 h-1.5 shrink-0 ${s.ok ? "bg-node-live" : "border border-muted"}`}
            />
            <span className="data text-[10.5px]">{s.name}</span>
            <span className="data text-[9.5px] text-muted ml-auto">{s.result}</span>
          </li>
        ))}
      </ul>
      <span className="data text-[9.5px] text-muted mt-auto">2 of 3 reported</span>
    </div>
  );
}

/* The differential at clip scale, run to the edges. Names are dropped at this size
   on purpose — an illegible chart is worse than none, and the named version lives
   further down the page where there is room for it. */
function Conditions() {
  const C = 52;
  const R = 41;
  const n = 8;

  return (
    <div className="h-full flex items-center">
      <svg viewBox="0 0 104 104" className="h-[112px] w-[112px] shrink-0 -ml-1">
        <circle cx={C} cy={C} r={R} fill="none" stroke="var(--border)" strokeWidth={1} />
        {Array.from({ length: n }, (_, i) => {
          const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
          const x = C + R * Math.cos(a);
          const y = C + R * Math.sin(a);
          const out = i > 2;
          return (
            <g key={i}>
              <line x1={C} y1={C} x2={x} y2={y} stroke="var(--border)" strokeWidth={0.75} />
              <circle
                cx={x}
                cy={y}
                r={out ? 2.4 : 3.8}
                fill={out ? "var(--node-out)" : "var(--card)"}
                stroke={out ? "var(--node-out)" : "var(--node-live)"}
                strokeWidth={1.4}
              />
              {out && (
                <line
                  x1={x - 3.6}
                  y1={y - 3.6}
                  x2={x + 3.6}
                  y2={y + 3.6}
                  stroke="var(--node-out)"
                  strokeWidth={1}
                />
              )}
            </g>
          );
        })}
        <circle cx={C} cy={C} r={11} fill="none" stroke="var(--node-live)" strokeOpacity={0.4} />
        <circle cx={C} cy={C} r={5.5} fill="var(--node-live)" />
      </svg>

      <div className="min-w-0 pr-3 pt-6">
        <p className="data text-[11px] leading-tight mb-1.5">Strep pharyngitis</p>
        <p className="data text-[9.5px] text-muted leading-tight mb-3">
          5 passed over
        </p>
        <p className="data text-[9.5px] text-muted leading-tight">bel 0.61</p>
        <div className="mt-1 h-[3px] w-full bg-border">
          <span className="block h-full bg-node-live" style={{ width: "61%" }} />
        </div>
      </div>
    </div>
  );
}

/* The turn as it actually streams.

   Built from the real event vocabulary in `/process/stream` — a `stage` event when
   the message has been read, one `source` event per branch as it returns, a
   `fusion` event when they are weighed against each other, then the ruling. Source
   names use the patient-facing vocabulary the rest of the page uses, never the
   branch names, which is the same rule the live consultation follows.

   Timings are in whole seconds and ordered the way the pipeline really behaves:
   the vector index returns almost immediately, the live lookups are the slow ones.
   Deliberately not decimal — precision here would be claiming instrumentation this
   card does not have. */
const STREAM = [
  { t: "0s", name: "reading", detail: "" },
  { t: "2s", name: "guidelines", detail: "11 passages" },
  { t: "4s", name: "conditions", detail: "8 candidates" },
  { t: "14s", name: "live sources", detail: "2 of 3" },
  { t: "17s", name: "fusion", detail: "agreement high" },
  { t: "18s", name: "ruling", detail: "level 2" },
];

function EventStream() {
  return (
    <div className="h-full px-3 pt-8 pb-2.5 flex flex-col">
      <ul className="space-y-[3px]">
        {STREAM.map((e, i) => (
          <li key={e.name} className="flex items-baseline gap-2">
            <span className="data text-[9px] text-muted w-6 shrink-0 text-right">{e.t}</span>
            <span
              className={`data text-[9.5px] shrink-0 ${
                i === STREAM.length - 1 ? "text-t2" : ""
              }`}
            >
              {e.name}
            </span>
            <span className="data text-[9px] text-muted ml-auto truncate">{e.detail}</span>
          </li>
        ))}
      </ul>
      <span className="data text-[9.5px] text-muted mt-auto">
        stream closed<span className="blink">_</span>
      </span>
    </div>
  );
}

function Stamp() {
  return (
    <div className="h-full px-3 pt-8 pb-2.5 flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <span className="block w-6 h-[3px] bg-t2" />
        <span className="data text-[12px] font-semibold text-t2">Level 2</span>
      </div>
      <p className="text-[12.5px] font-medium leading-snug mb-1.5">Held for a doctor</p>
      <p className="text-[10.5px] text-muted leading-snug">
        Names a drug and a dose. Cannot be released on its own.
      </p>
      <div className="mt-auto flex items-baseline justify-between">
        <span className="data text-[9.5px] text-muted">rule floor</span>
        <span className="data text-[9.5px] text-muted">awaiting review</span>
      </div>
    </div>
  );
}

/* ── The track ─────────────────────────────────────────────────────────────── */

/* Two states per clip, and the scattered one is a QUADRANT LAYOUT, not a scatter.

   Ponder pins its cards to the corners with `inset` and `auto` and centres the hero
   object below the buttons; nothing overlaps anything. Read as random placement it
   looks careless to copy, read as corners-and-a-centre it is obvious, and it is the
   whole reason the composition breathes.

   `sx`/`sy` are absolute positions in the stage, chosen so every clip clears the
   headline's measure (roughly 31%-69%) and the button row. `left` is where the clip
   lands in the assembled track, in pipeline order: what was said, what was
   retrieved, what it weighed, how the turn ran, what it was allowed to do.

   Position animates through `left`/`top` rather than a transform — the only way to
   move between two layouts expressed as percentages without measuring the stage in
   JS first, and what Ponder does too. `x`/`y` stay free for the exit. */
const CLIPS = [
  { label: "complaint.txt", node: <Complaint />,
    left: 15, lift: 0, sx: 4, sy: 22, scale: 1 },
  { label: "guidelines.pdf", node: <Guidelines />,
    left: 26.77, lift: 40, sx: 4, sy: 62, scale: 1 },
  { label: "conditions.graph", node: <Conditions />,
    left: 38.54, lift: 0, sx: 44, sy: 62, scale: 1.12 },
  { label: "live_sources", node: <LiveSources />,
    left: 50.31, lift: 40, sx: 66, sy: 70, scale: 1 },
  { label: "stream.log", node: <EventStream />,
    left: 62.08, lift: 0, sx: 19, sy: 74, scale: 1 },
  { label: "triage.stamp", node: <Stamp />,
    left: 73.85, lift: 40, sx: 84, sy: 18, scale: 1 },
];

/* The assembled track spans 15%-85% — Ponder's `.timeline_line { width: 70vw }`,
   centred. Six slots and five gaps fill it exactly. */
const CLIP_WIDTH = 11.17;
const TRACK_TOP = "59%";
/* Offset below TRACK_TOP, in px. A clip is 150px tall and the lifted ones sit 40px
   higher, so the rule clears the lowest by ~44px — the gap Ponder leaves. */
const TRACK_RULE = 194;

function TrackClip({
  p,
  mx,
  my,
  index,
  reduced,
}: {
  p: MotionValue<number>;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  index: number;
  reduced: boolean | null;
}) {
  const clip = CLIPS[index];
  // Exit direction is decided by where the clip LANDS, not where it started, so the
  // track opens outward from its own centre rather than shuffling sideways.
  //
  // Plain pixels, not vw: every stop in one interpolation has to share a unit, and
  // this track mixes a unitless 0 in the middle of the range. A number large enough
  // to clear any viewport is all that is needed — the stage clips the overflow.
  const exitX = clip.left + CLIP_WIDTH / 2 <= 50 ? -1800 : 1800;

  // Docking moves the box itself; the exit rides on top as a transform. Keeping the
  // two on different properties means neither has to know about the other.
  const left = useTransform(p, DOCK, [`${clip.sx}%`, `${clip.left}%`]);
  const top = useTransform(p, DOCK, [`${clip.sy}%`, TRACK_TOP]);
  const lift = useTransform(p, DOCK, [0, -clip.lift]);

  const x = useTransform(p, EXIT, [0, exitX]);
  const y = useTransform(p, EXIT, [0, 40]);
  const scale = useTransform(p, DOCK, [clip.scale, 1]);
  const opacity = useTransform(p, [EXIT[0], EXIT[1] - 0.04], [1, 0]);

  // Everything leaves through a blur, not just a slide. Sliding alone reads as
  // elements being removed; blurring reads as the whole scene pulling out of focus,
  // which is what lets the section below arrive as a fresh page rather than as the
  // next item in a list.
  const blurPx = useTransform(p, [EXIT[0], EXIT[1] - 0.04], [0, 10]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;

  const splitter = useTransform(
    p,
    [SPLITTER[0] + index * 0.012, SPLITTER[1] + index * 0.012],
    ["0%", "100%"],
  );

  // Parallax rides the `translate` property, never `transform`. The scrub already
  // owns transform, and the two would overwrite each other frame by frame; these are
  // separate CSS properties and compose cleanly. Range is deliberately tiny.
  const strength = 1 - index * 0.15;
  const tx = useTransform(mx, (v) => v * 18 * strength);
  const ty = useTransform(my, (v) => v * 10 * strength);
  const translate = useMotionTemplate`${tx}px ${ty}px 0`;

  return (
    <motion.div
      className="absolute"
      style={{
        left,
        top,
        width: `${CLIP_WIDTH}%`,
        marginTop: lift,
        x,
        y,
        scale,
        opacity,
        filter,
        translate: reduced ? undefined : translate,
      }}
    >
      <Clip label={clip.label} splitter={splitter}>
        {clip.node}
      </Clip>
    </motion.div>
  );
}

/* ── The headline flip ─────────────────────────────────────────────────────── */

/* Lines, not characters. Each line pivots on its own X axis through a shared
   1400px perspective, carrying depth and a blur — which is what separates this from
   a cross-fade. Reduced motion collapses it to opacity, since a 75° rotation is
   exactly the kind of movement that setting exists to refuse. */
function FlipLine({
  p,
  text,
  range,
  dir,
  index,
  reduced,
}: {
  p: MotionValue<number>;
  text: string;
  range: [number, number];
  dir: "out" | "in";
  index: number;
  reduced: boolean | null;
}) {
  const span: [number, number] = [range[0] + index * 0.025, range[1] + index * 0.025];

  const rotateX = useTransform(p, span, dir === "out" ? [0, -75] : [75, 0]);
  const z = useTransform(p, span, dir === "out" ? [0, -90] : [90, 0]);
  const yPct = useTransform(p, span, dir === "out" ? [0, -45] : [45, 0]);
  const y = useMotionTemplate`${yPct}%`;
  const opacity = useTransform(p, span, dir === "out" ? [1, 0] : [0, 1]);
  const blurPx = useTransform(p, span, dir === "out" ? [0, 12] : [12, 0]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;

  return (
    <motion.span
      className="block"
      style={
        reduced
          ? { opacity }
          : { rotateX, z, y, opacity, filter, transformPerspective: 1400 }
      }
    >
      {text}
    </motion.span>
  );
}

/* ── The scroll ruler ──────────────────────────────────────────────────────── */

/* Sixty marks tracking whole-page progress, with a hot spot that travels: each
   mark's height and weight fall off with its distance from the active index. It is
   a progress indicator, not decoration, which is why it stays when the hero leaves.

   Written straight to the DOM on change rather than through sixty motion values —
   sixty springs to render sixty 1px lines is not a trade worth making. */
const MARK_COUNT = 60;
const MARK_FALLOFF = 15;

function ScrollRuler() {
  const { scrollYProgress } = useScroll();
  const ref = useRef<HTMLDivElement>(null);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const marks = ref.current?.children;
    if (!marks) return;
    const active = progress * (MARK_COUNT - 1);

    for (let i = 0; i < marks.length; i++) {
      const intensity = Math.max(0, 1 - Math.abs(i - active) / MARK_FALLOFF);
      const mark = marks[i] as HTMLElement;
      mark.style.height = `${5 + intensity * 15}px`;
      mark.style.opacity = `${0.12 + intensity * 0.68}`;
    }
  });

  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-end justify-between w-[30vw] max-w-[420px] h-6 pointer-events-none"
    >
      {Array.from({ length: MARK_COUNT }, (_, i) => (
        <span key={i} className="block w-px bg-foreground" style={{ height: 5, opacity: 0.12 }} />
      ))}
    </div>
  );
}

/* ── The stage ─────────────────────────────────────────────────────────────── */

export function HeroStage({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const outer = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: outer,
    offset: ["start start", "end end"],
  });

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  // Soft and slow. A stiff spring reads as jitter; this one lags the pointer just
  // enough to suggest mass.
  const sx = useSpring(mx, { stiffness: 55, damping: 22, mass: 0.7 });
  const sy = useSpring(my, { stiffness: 55, damping: 22, mass: 0.7 });

  const onMove = (e: React.MouseEvent) => {
    if (reduced) return;
    const box = stage.current?.getBoundingClientRect();
    if (!box) return;
    mx.set(((e.clientX - box.left) / box.width - 0.5) * 2);
    my.set(((e.clientY - box.top) / box.height - 0.5) * 2);
  };

  const p = scrollYProgress;

  const lineOpacity = useTransform(p, LINE, [0, 1]);
  const headScale = useTransform(p, HEAD, [0, 1]);
  const sweepLeft = useTransform(p, SWEEP, [0, 100]);
  const sweep = useMotionTemplate`${sweepLeft}%`;
  const trackOpacity = useTransform(p, [EXIT[0], EXIT[1] - 0.06], [1, 0]);
  const ctaOpacity = useTransform(p, [FLIP_OUT[0], FLIP_OUT[1] - 0.06], [1, 0]);

  // The headline leaves the way Ponder's does — pulled back, lifted slightly, and
  // taken out of focus rather than merely faded. Blurring is what makes it read as
  // the scene ending instead of an element being switched off.
  const titleScale = useTransform(p, EXIT, [1, 0.8]);
  const titleY = useTransform(p, EXIT, [0, -40]);
  const titleOpacity = useTransform(p, [EXIT[0], EXIT[1] - 0.06], [1, 0]);
  const titleBlur = useTransform(p, [EXIT[0], EXIT[1] - 0.04], [0, 6]);
  const titleFilter = useMotionTemplate`blur(${titleBlur}px)`;

  return (
    <div ref={outer} className="relative h-[320vh]">
      <div
        ref={stage}
        onMouseMove={onMove}
        onMouseLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        // Pinned below the header strip rather than under it: the strip is opaque
        // and ruled, so an overlapping stage would be cut in half by it. 3.5rem is
        // the strip's `h-14`.
        className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-hidden"
      >
        {/* ── Headline ── */}
        <motion.div
          className="relative z-20 pt-[13vh] px-5 text-center pointer-events-none"
          style={{
            scale: titleScale,
            y: titleY,
            opacity: titleOpacity,
            filter: titleFilter,
          }}
        >
          {/* The lockup. Sits in the band between the header and the headline,
              which was otherwise dead space, and carries the name once now that
              the nav pill is the mark alone. */}
          <div className="flex items-center justify-center gap-2.5 mb-6 sm:mb-8">
            <Mark />
            <span className="data text-[13px] font-semibold tracking-[0.2em] uppercase">
              MedTriage
            </span>
          </div>

          <div className="relative min-h-[8rem] sm:min-h-[11rem] lg:min-h-[13.5rem]">
            <h1 className="display text-[2.9rem] sm:text-[4.4rem] lg:text-[5.6rem] max-w-[16ch] mx-auto">
              {LINES_ONE.map((text, i) => (
                <FlipLine
                  key={text}
                  p={p}
                  text={text}
                  range={FLIP_OUT}
                  dir="out"
                  index={i}
                  reduced={reduced}
                />
              ))}
            </h1>

            {/* The second headline is stacked over the first rather than replacing
                it — both have to occupy the same space for one to hand over to the
                other mid-flip. */}
            <h1
              className="display text-[2.9rem] sm:text-[4.4rem] lg:text-[5.6rem] max-w-[16ch] mx-auto absolute inset-x-0 top-0"
              aria-hidden
            >
              {LINES_TWO.map((text, i) => (
                <FlipLine
                  key={text}
                  p={p}
                  text={text}
                  range={FLIP_IN}
                  dir="in"
                  index={i}
                  reduced={reduced}
                />
              ))}
            </h1>
          </div>

          <motion.div className="mt-6 sm:mt-8 pointer-events-auto" style={{ opacity: ctaOpacity }}>
            {children}
          </motion.div>
        </motion.div>

        {/* ── The track ──
            Hidden below the large breakpoint: five clips need width to scatter
            into, and a crushed pile reads as a bug rather than as material. */}
        <motion.div
          className="hidden lg:block absolute inset-0 z-0"
          style={{ opacity: trackOpacity }}
          aria-hidden
        >
          {CLIPS.map((clip, i) => (
            <TrackClip key={clip.label} p={p} mx={sx} my={sy} index={i} reduced={reduced} />
          ))}


          {/* The rule the clips assemble ONTO — beneath them, not above. The clips
              float clear of it by roughly the gap Ponder leaves (44px from the
              lowest card), which is what makes the row read as sitting on a
              timeline rather than hanging from a ceiling. */}
          <motion.span
            className="absolute h-px bg-border"
            style={{
              left: "1.5%",
              width: "97%",
              top: TRACK_TOP,
              marginTop: TRACK_RULE,
              opacity: lineOpacity,
            }}
          />

          {/* The playhead. Grows from its top before it travels, and drags a soft
              wash behind it so the swept portion reads as already played. It spans
              the clips as well as the rule — a playhead that stopped at the rule
              would be a tick mark, not a cursor. */}
          <div className="absolute" style={{ left: "1.5%", width: "97%", top: TRACK_TOP }}>
            <motion.span
              className="absolute block"
              style={{
                left: sweep,
                top: -56,
                height: TRACK_RULE + 78,
                width: 1,
                background: "var(--foreground)",
                opacity: 0.75,
                scaleY: headScale,
                transformOrigin: "top",
                boxShadow: "0 0 14px rgba(20,24,27,0.18)",
              }}
            >
              <span
                className="absolute block bg-foreground"
                style={{ left: -3, top: 0, width: 7, height: 10 }}
              />
            </motion.span>

            <motion.span
              className="absolute block"
              style={{
                left: 0,
                top: -56,
                height: TRACK_RULE + 78,
                width: sweep,
                background: "var(--foreground)",
                opacity: 0.035,
              }}
            />
          </div>
        </motion.div>

        {/* Below the breakpoint the case is shown as a short static stack. */}
        <div className="lg:hidden relative z-10 mt-10 px-5 max-w-[380px] mx-auto space-y-3">
          <Clip label="conditions.graph">
            <Conditions />
          </Clip>
          <Clip label="triage.stamp">
            <Stamp />
          </Clip>
        </div>
      </div>

      <ScrollRuler />
    </div>
  );
}
