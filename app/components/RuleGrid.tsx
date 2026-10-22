/**
 * The rules, as a grid.
 *
 * This is the page's signature section: the table of conditions that outrank the
 * model's own judgement. It was a three-column table and is now eight cards, and
 * `rules.ts` carries the argument for why that trade is payable — reading order
 * is still evaluation order, cell width is derived from severity and nothing
 * else, and every card prints its level rather than leaving you to infer it from
 * how big the box is.
 *
 * The level pill is the piece doing the most work. It states the level three
 * ways at once — the triage colour, the number, and a lamp whose breathing rate
 * is keyed to severity — because a triage level is the one fact on this page
 * that must survive a reader who is skimming, colour-blind, or both. Under
 * reduced motion the lamp stays lit and simply stops breathing; see the
 * `.level-dot` rules in `globals.css`.
 *
 * No `"use client"` and no hooks: the pulse is a CSS animation and the images are
 * static, so nothing here needs an event handler or state. It still lands in the
 * client bundle today because `app/about/page.tsx` declares `"use client"` at
 * the top and that marks everything it imports — but as inert markup, and it
 * costs nothing the moment that page stops being a client component.
 */

import Image from "next/image";
import { BentoGrid, BentoGridItem } from "./BentoGrid";
import { PULSE, RULES, span, type Rule } from "../lib/rules";

function LevelPill({ level }: { level: Rule["then"] }) {
  const tone = `var(--t${level})`;
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-2.5 py-[3px]"
      style={{
        color: tone,
        borderColor: `color-mix(in srgb, ${tone} 38%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${tone} 9%, transparent)`,
      }}
    >
      {/* `bg-current` so the lamp and its glow both inherit the triage colour
          from the pill — one class, three levels, no per-level CSS. */}
      <span
        aria-hidden
        className="level-dot block h-[6px] w-[6px] rounded-full bg-current"
        style={{ ["--pulse" as string]: PULSE[level] }}
      />
      <span className="data text-[11px] font-semibold uppercase tracking-[0.1em]">
        Level {level}
      </span>
    </span>
  );
}

export function RuleGrid() {
  return (
    /* The hero's "How it works" button has always pointed at #how and there has
       never been a #how to point at. This is where it was always going. */
    <section id="how" className="scroll-mt-20 border-b border-border">
      <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mb-12 max-w-[56ch]">
          <p className="label mb-4">The rules</p>
          <h2 className="display text-[1.9rem] sm:text-[2.4rem]">
            The model proposes a level. These dispose.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            Each rule is evaluated before the language model is asked for an
            opinion, and clamps the result afterwards. The model can argue for a
            lower level all it likes; it cannot have one. Neither can a cleverly
            worded prompt.
          </p>
        </div>

        <BentoGrid>
          {RULES.map((r, i) => (
            <BentoGridItem
              key={r.when}
              className={span(i)}
              icon={<LevelPill level={r.then} />}
              title={r.when}
              description={r.note}
              header={
                /* Fixed height, not an aspect ratio. A wide cell and a narrow
                   one sit in the same row, so an aspect ratio would make the
                   wide card's picture half as tall again as its neighbour's and
                   the row would read as broken. `shrink-0` keeps the copy below
                   from ever squeezing it when a card is stretched to match a
                   taller sibling. */
                <div className="relative h-48 shrink-0 overflow-hidden bg-sunk sm:h-56">
                  <Image
                    src={`/rules/${r.plate}`}
                    alt={r.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (min-width: 1280px) 42vw, 50vw"
                    className="object-cover"
                  />
                </div>
              }
            />
          ))}
        </BentoGrid>

        {/* Outside the grid, not a ninth card. The qualification belongs to the
            whole table rather than to any rule in it, and a card carrying no
            level would be the one thing this section cannot afford to show. */}
        <p className="mt-6 max-w-[62ch] text-[14px] leading-relaxed text-muted">
          Where two rules apply, the stricter one wins. Where none applies, the
          model&apos;s judgement is used — and that only ever happens between
          Level 1 and Level 2, never for an emergency.
        </p>
      </div>
    </section>
  );
}
