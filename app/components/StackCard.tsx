"use client";

/**
 * The colophon, as one block.
 *
 * Adapted from Aceternity UI's "card demo" — a card whose head is a lit strip of
 * marks with a beam travelling across them, over a radial-masked ground.
 *
 * The demo is a card with five logos and a sentence. That would have been a
 * straight trade of seven facts for an animation, so the seven rows come with
 * it and live inside the same block: the strip is the head of the colophon, not
 * a replacement for it.
 *
 * ── Why the beam kept disappearing. ──
 *
 * Worth writing down, because the fix is not where the bug looks like it is.
 * Upstream's ground is masked with `radial-gradient(50% 50% at 50% 50%, white
 * 0%, transparent 100%)` — and because the first stop sits at 0%, that fades
 * from the dead centre outward, so it is already half transparent a third of the
 * way out. The marks survive it by sitting in the middle. A beam sweeping the
 * full width does not: it spends most of its travel in the part of the ground
 * that has been masked to nothing, and reads as absent rather than as faint.
 *
 * The fix is the mask, not the sweep. It now holds opaque to 45% of the ray
 * before falling off, so the beam is solid across the marks and fades only at
 * the edges. The sweep itself stays 0–100% and runs one way, as upstream does —
 * and the two are load-bearing on each other: the beam's jump back to the start
 * is invisible *because* the mask has already faded it out by the time it gets
 * there. Tighten the mask and the reset becomes a visible flick.
 *
 * ── The other four repairs from upstream. ──
 *
 * 1. `Math.random()` in render. `Sparkles` computed its positions during render,
 *    so server and client produced different markup and React had to warn and
 *    re-patch on hydration. Replaced with a deterministic hash of the index:
 *    identical on both sides, and still looks scattered because it is not
 *    periodic.
 *
 * 2. `animate-move` does not exist here — it is a keyframe from Aceternity's own
 *    Tailwind config and this project has no `tailwind.config` at all.
 *    Reimplemented as `.scan-sweep`.
 *
 * 3. No reduced-motion path anywhere: a pulse loop, a travelling beam and twelve
 *    drifting sparkles, all unconditional. `useStillness()` settles the lot —
 *    the marks stay lit, the beam and sparkles do not render. Nothing is lost,
 *    because none of the three carries meaning.
 *
 * 4. The `animate()` loop was never cancelled, so it outlived the component and
 *    ran on an unmounted subtree for the life of the tab.
 *
 * ── On the marks. ──
 *
 * Inline SVG, as upstream does it, in `StackMarks.tsx` — six single-path marks
 * from Simple Icons plus the OpenAI path the demo already shipped. Every one
 * paints in `currentColor`, so `tint` below is the only place a brand colour is
 * written down, and the row reads as logos rather than as a toolbar.
 *
 * Cerebras and Pinecone are the two exceptions: neither publishes an SVG mark
 * anywhere, so those stay raster in `public/logos` beside the institution marks
 * already there.
 *
 * The order is an argument, not an arrangement. Left of centre is what you
 * touch, the centre is the model, right of centre is what feeds it — so the row
 * runs interface → model → pipeline → evidence, and the circles grow toward the
 * middle so the eye lands on the model first. Reordering it costs that.
 *
 * OpenAI takes the centre because it *is* the model: `gpt-oss-120b` is OpenAI's
 * open-weights model, and Cerebras beside it is the silicon it is served on.
 * Those are two separate claims and the strip makes both, which is the whole
 * reason the centre slot was worth arguing about.
 */

import Image from "next/image";
import { animate, motion } from "motion/react";
import { useEffect } from "react";
import {
  FastApiMark,
  LangChainMark,
  NextjsMark,
  OpenAIMark,
  ReactMark,
  TailwindMark,
  TypeScriptMark,
} from "./StackMarks";
import { COLOPHON } from "../lib/colophon";
import { useStillness } from "../lib/useStillness";

type Mark = {
  name: string;
  /** Circle size. Graduated so the row reads as a strip seen in perspective
   *  rather than as five equal buttons, with the subject in the middle. */
  box: string;
  glyph: string;
  /** An inline SVG mark, painted in `tint` via `currentColor`… */
  Icon?: React.ComponentType<{ className?: string }>;
  tint?: string;
  /** …or a raster mark, for the two brands that publish no SVG anywhere. */
  src?: string;
};

const MARKS: Mark[] = [
  { name: "Tailwind CSS", Icon: TailwindMark, tint: "#06B6D4", box: "h-8 w-8", glyph: "h-4 w-4" },
  { name: "React", Icon: ReactMark, tint: "#61DAFB", box: "h-10 w-10", glyph: "h-5 w-5" },
  { name: "TypeScript", Icon: TypeScriptMark, tint: "#3178C6", box: "h-12 w-12", glyph: "h-6 w-6" },
  { name: "Next.js", Icon: NextjsMark, tint: "var(--foreground)", box: "h-14 w-14", glyph: "h-7 w-7" },
  { name: "OpenAI gpt-oss-120b", Icon: OpenAIMark, tint: "var(--foreground)", box: "h-16 w-16", glyph: "h-8 w-8" },
  { name: "Cerebras", src: "/logos/cerebras.png", box: "h-14 w-14", glyph: "h-7 w-7" },
  { name: "FastAPI", Icon: FastApiMark, tint: "#009688", box: "h-12 w-12", glyph: "h-6 w-6" },
  { name: "LangGraph", Icon: LangChainMark, tint: "#1C3C3C", box: "h-10 w-10", glyph: "h-5 w-5" },
  { name: "Pinecone", src: "/logos/pinecone.png", box: "h-8 w-8", glyph: "h-4 w-4" },
];

/** A stable pseudo-random in [0,1). Deterministic across hydration, which
 *  `Math.random()` is not — see note 1 in the header. */
function hash(i: number, n: number): number {
  const x = Math.sin(i * 127.1 + n * 311.7 + 74.7) * 43758.5453;
  return x - Math.floor(x);
}

function Sparkles() {
  /* Upstream's drift, kept — but every value that was `Math.random()` is now
     `hash(i, n)`. Random in render is what made the original mismatch on
     hydration; the drift itself was never the problem, and taking it away left
     twelve dead dots. Same look, same wander, decided once and identically on
     both sides. */
  return (
    <div aria-hidden className="absolute inset-0">
      {Array.from({ length: 12 }, (_, i) => {
        const top = hash(i, 0) * 100;
        const left = hash(i, 1) * 100;
        return (
          <motion.span
            key={i}
            className="absolute block rounded-full bg-foreground"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: 2,
              height: 2,
            }}
            animate={{
              top: `calc(${hash(i, 2) * 100}% + ${hash(i, 3) * 2 - 1}px)`,
              left: `calc(${hash(i, 4) * 100}% + ${hash(i, 5) * 2 - 1}px)`,
              opacity: hash(i, 6),
              scale: [1, 1.2, 0],
            }}
            transition={{
              duration: hash(i, 7) * 2 + 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        );
      })}
    </div>
  );
}

export function StackCard() {
  const still = useStillness();

  /* The pulse: each mark lifts and swells in turn, so the row reads left to
     right as something being counted through rather than five things sitting
     still. Selector-driven, as upstream does it, because the alternative is
     twelve motion values for a purely decorative loop. */
  useEffect(() => {
    if (still) return;
    const controls = animate(
      MARKS.map((_, i) => [
        `.mark-${i}`,
        { scale: [1, 1.1, 1], y: [0, -4, 0] },
        { duration: 0.8 },
      ]) as Parameters<typeof animate>[0],
      { repeat: Infinity, repeatDelay: 1 }
    );
    return () => controls.stop();
  }, [still]);

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 sm:py-20">
        <div className="rounded-[var(--radius)] border border-border bg-card p-6 sm:p-8">
          {/* ── The strip ──
              The mask holds opaque to 45% before falling off; see the header
              note about why upstream's fades from dead centre. */}
          <div className="relative h-[13rem] overflow-hidden rounded-[var(--radius)] bg-sunk [mask-image:radial-gradient(72%_72%_at_50%_50%,black_45%,transparent_100%)] sm:h-[16rem]">
            {/* Nine circles at ~500px plus gaps overflow a phone, and the strip
                clips. Scaled down rather than wrapped or scrolled: the row is
                one object and breaking it across two lines would destroy the
                arc, which is the only thing its ordering is saying. */}
            <div className="flex h-full items-center justify-center p-6 sm:p-8">
              <div className="flex shrink-0 scale-[0.62] items-center justify-center gap-2 sm:scale-90 sm:gap-3 md:scale-100">
                {MARKS.map((m, i) => (
                  <div
                    key={m.name}
                    title={m.name}
                    /* Upstream's container, unchanged: a near-transparent fill,
                       a white inset glow and a deep drop shadow. The fill does
                       almost nothing on its own — what makes these read as
                       discs is the inset rim above and the shadow below. */
                    className={`mark-${i} relative z-20 flex shrink-0 items-center justify-center rounded-full bg-[rgba(248,248,248,0.01)] shadow-[0px_0px_8px_0px_rgba(248,248,248,0.25)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)] ${m.box}`}
                  >
                    {m.Icon ? (
                      <span style={{ color: m.tint }}>
                        <m.Icon className={m.glyph} />
                      </span>
                    ) : m.src ? (
                      /* Clipped to a circle. The two raster marks are dark
                         squares; left alone they would sit as tiles inside
                         round holders and the row would look assembled from
                         parts. */
                      <span className={`overflow-hidden rounded-full ${m.glyph}`}>
                        <Image
                          src={m.src}
                          alt=""
                          width={72}
                          height={72}
                          className="h-full w-full object-cover"
                        />
                      </span>
                    ) : null}
                    <span className="sr-only">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* The beam. Behind the marks (z-10 against their z-20) so it passes
                *under* them like a reader head under a strip, rather than
                drawing a line across their faces. Not rendered at all under
                reduced motion — a parked beam is a smudge, not a resting
                state. */}
            {!still && (
              <div
                aria-hidden
                className="scan-sweep absolute top-1/2 z-10 h-44 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-cyan-500 to-transparent"
              >
                <div className="absolute -left-8 top-1/2 h-32 w-8 -translate-y-1/2">
                  <Sparkles />
                </div>
              </div>
            )}
          </div>

          {/* ── The list ── */}
          <h2 className="display-sm mt-7 text-[1.35rem] sm:text-[1.5rem]">
            Built with
          </h2>
          <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-muted">
            Named in full, including the parts that are somebody else&apos;s
            work. Every source the pipeline reads is listed here, not just the
            ones worth boasting about.
          </p>

          <dl className="mt-7 border-t border-border">
            {COLOPHON.map((c) => (
              <div
                key={c.what}
                className="grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)] gap-6 border-b border-border py-3"
              >
                <dt className="data text-[12px] text-muted">{c.what}</dt>
                <dd className="data text-[12px]">{c.with}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
