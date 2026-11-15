"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useScroll, useTransform } from "motion/react";
import { COLOPHON } from "../../lib/colophon";
import { LEVELS } from "../../lib/levels";
import { LIMITS } from "../../lib/limits";
import { ORIGINS } from "../../lib/origins";
import { SOURCES, type SourceUse } from "../../lib/sources";
import { Nots } from "./Modes";
import { Moon, phaseOf } from "./Moon";
import { MODES } from "./SiteShell";
import { Arrow, EASE, LEVEL_HEX, Lines, Rise, Roll, ScrubWords } from "./ui";

/* The About page, `/about`: the general account. What the product is, the three ways to
   ask it something, what it reads and where that is published (`Atlas.tsx`), what it
   keeps, what it cannot do and what it is made of. How triage itself works (the rules,
   the parts, the wait, the failures) is on triage's own page, `Triage.tsx`; this page
   only says things that hold in every mode. */

/* ════ Hero ════
 *
 * The home page shows one moon changing. This shows the whole scale at once: the three
 * phases on one orbit, read left to right as the risk rises, each posed from its level's
 * `ai` share like every other moon on the site. They are still, and correct from the
 * first paint; only their arrival is animated.
 *
 * The orbit is a circle far larger than the section, so what crosses it is a shallow
 * arc. It is drawn in a 1200 x 420 box that stretches with the section, and SKY gives
 * the same three points on it as percentages of that box, so the moons stay on the line
 * at any width. (Circle centre 600, 1420; radius 1260.)
 */
const SKY = [
  { x: 18, y: 52.37 },
  { x: 50, y: 38.1 },
  { x: 82, y: 52.37 },
];

function Body({ n }: { n: number }) {
  const l = LEVELS[n];
  const phase = useMotionValue(phaseOf(l.ai));
  return (
    <motion.li
      className="abt-body"
      style={{ left: `${SKY[n].x}%`, top: `${SKY[n].y}%` }}
      initial={{ opacity: 0, y: 46, scale: 0.84 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.5, ease: EASE, delay: 0.3 + n * 0.18 }}
    >
      <Moon phase={phase} color={LEVEL_HEX[n]} glow />
      <p className="abt-body-read">
        <span className="mono-s">Level {l.level}</span>
        <span className="abt-body-name">{l.name}</span>
        <span className="mono-s">
          AI {l.ai} / Doctor {l.md}
        </span>
      </p>
    </motion.li>
  );
}

export function AboutHero() {
  const jump = [
    { n: MODES.length, what: "modes", href: "#modes" },
    { n: SOURCES.length, what: "sources", href: "#sources" },
    { n: ORIGINS.length, what: "places", href: "#places" },
    { n: LIMITS.length, what: "limits", href: "#limits" },
  ];
  return (
    <section className="abt-hero f-ink" data-field="dark">
      <div className="grain" aria-hidden />
      <div className="abt-hero-copy">
        <Lines
          as="h1"
          className="h1"
          delay={0.1}
          lines={["What it is, what it reads,", "and where it stops."]}
        />
        <Rise delay={0.45}>
          <p className="lede dim">
            MedTriage is a medical assistant with three ways to ask and one habit: it gives up
            its own say as the risk rises. This page is the general account. Each mode has a
            page of its own.
          </p>
        </Rise>
      </div>

      <ol className="abt-sky" aria-label="The three levels">
        <svg className="abt-arc" viewBox="0 0 1200 420" preserveAspectRatio="none" aria-hidden>
          <path d="M-100 372.3A1260 1260 0 0 1 1300 372.3" />
        </svg>
        {LEVELS.map((l, n) => (
          <Body key={l.level} n={n} />
        ))}
      </ol>

      <Rise delay={0.7} now className="ab-hero-foot mono">
        {jump.map((j) => (
          <a key={j.href} href={j.href} className="arrow-link">
            <Roll>{`${j.n} ${j.what}`}</Roll>
            <Arrow />
          </a>
        ))}
      </Rise>
    </section>
  );
}

/* ════ The premise ════
 *
 * One sentence that is true of every mode, which is why it is worded as it is: a doctor
 * signs in triage and drug mode, a hospital comes first on a child's danger sign and at
 * Level 3, and the model is locked out at Level 3. The moon beside it wanes the whole
 * way, full to new, as the sentence is read.
 */
export function Premise() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const phase = useTransform(scrollYProgress, [0, 1], [1, -1]);
  return (
    <section className="sec wrap f-bone" data-field="light">
      <div className="statement" ref={ref}>
        <div className="statement-aside">
          <Moon
            phase={phase}
            color="#0b0d0c"
            dark="#c9c4b8"
            grain={false}
            className="w-[min(100%,220px)] -ml-[6%]"
          />
        </div>
        <div>
          <p className="big">
            <ScrubWords
              progress={scrollYProgress}
              text="A language model writes the answers. Fixed rules decide the rest: who has to sign one, when a hospital comes first, and when the model should stop talking."
            />
          </p>
          <div className="statement-foot">
            <Rise>
              <p>
                MedTriage began as a triage system, and that is still its centre. Every
                clinical answer is sorted onto one of three levels, and the level decides who
                has the last word: the system, a doctor, or emergency care.
              </p>
            </Rise>
            <Rise delay={0.1}>
              <p>
                Two more modes sit beside it. Drug mode is triage with the medicine looked up
                live. Child-health mode is a different thing: it answers from WHO and IMNCI
                pages, and it carries no level at all.
              </p>
            </Rise>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════ The three modes ════
 *
 * The header's dropdown, at full size: the same three entries and the same glyphs
 * (`MODES` in `SiteShell.tsx`), each opening its own page. The two facts under each are
 * the ones that tell the modes apart, and the source count is read from `sources.ts`.
 */
const MODE_FACTS: Record<string, { use: SourceUse; level: string }> = {
  "/triage": { use: "triage", level: "Three levels" },
  "/drugs": { use: "drugs", level: "Held for a doctor" },
  "/child": { use: "child", level: "No level" },
};

export function ModesIndex() {
  return (
    <section className="sec wrap f-bone2" data-field="light" id="modes">
      <div className="sec-head">
        <Lines lines={["Three ways", "to ask."]} />
        <Rise delay={0.1}>
          <p className="lede">
            Each has its own page: what it does with a question, what it reads, and what it
            leaves out on purpose.
          </p>
        </Rise>
      </div>
      <div className="mode-cards">
        {MODES.map((m, n) => {
          const fact = MODE_FACTS[m.href];
          const count = SOURCES.filter((s) => s.uses.includes(fact.use)).length;
          return (
            <Rise key={m.href} delay={n * 0.08}>
              <Link href={m.href} className="mode-card">
                <span className="mode-card-top">
                  <svg className="mode-card-glyph" viewBox="0 0 28 28" fill="none" aria-hidden>
                    {m.glyph}
                  </svg>
                  <span className="mode-card-go" aria-hidden>
                    <Arrow />
                  </span>
                </span>
                <span className="mode-card-body">
                  <span className="h3">{m.name}</span>
                  <span className="mode-card-line">{m.line}</span>
                </span>
                <span className="mode-card-facts mono-s">
                  <span>{fact.level}</span>
                  <span>{count} sources</span>
                </span>
              </Link>
            </Rise>
          );
        })}
      </div>
    </section>
  );
}

/* ════ What it keeps ════
 *
 * Each line is how the product behaves today (the accounts design, and child mode's own
 * rules), stated plainly. Nothing here is a promise about the future or a legal claim.
 */
const KEEPS = [
  {
    title: "It is kept on the server",
    body: "Your consultations, your profile and any prescription live in the service's own database. Nothing clinical is stored in your browser.",
  },
  {
    title: "Your profile is what you said",
    body: "What you state about yourself is your profile. Anything the system picks up from a conversation is shown to you as a suggestion, and joins the profile only if you accept it.",
  },
  {
    title: "A doctor sees what the system saw",
    body: "A doctor's list shows the question and the patient. Opening a case shows your background exactly as the system read it, and each opening is recorded.",
  },
  {
    title: "A child's questions stay apart",
    body: "Your profile describes you, not your child. Child-health mode does not read it, and nothing your child has is added to it.",
  },
];

export function Keeps() {
  return (
    <Nots
      field="bone2"
      lines={["What it keeps,", "and who sees it."]}
      lede="A health question is not small talk. This is where yours goes."
      items={KEEPS}
    />
  );
}

/* ════ Limits ════ */

export function Limits() {
  const [open, setOpen] = useState(0);
  const l = LIMITS[open];
  return (
    <section className="sec wrap f-ink" data-field="dark" id="limits">
      <div className="limits-grid">
        <div>
          <Lines lines={["The honest list."]} />
          <Rise delay={0.15}>
            <p className="lede dim" style={{ marginTop: 26 }}>
              Five things it cannot do, one at a time.
            </p>
          </Rise>
          <figure className="limits-fig">
            <div className="limits-frame">
              <AnimatePresence initial={false}>
                <motion.img
                  key={l.plate}
                  src={`/plates/${l.plate}`}
                  alt={l.alt.replace(", rendered as ordered dither", "")}
                  initial={{ clipPath: "inset(0 0 100% 0)", scale: 1.15 }}
                  animate={{ clipPath: "inset(0 0 0% 0)", scale: 1 }}
                  exit={{ opacity: 0.999 }}
                  transition={{ duration: 0.8, ease: EASE }}
                />
              </AnimatePresence>
            </div>
            <figcaption className="mono-s">
              <span>{l.caption}</span>
              <span>{l.credit}</span>
            </figcaption>
          </figure>
        </div>

        <ul className="limits">
          {LIMITS.map((it, n) => {
            const on = n === open;
            return (
              <li key={it.head} className="limit" data-open={on}>
                <button aria-expanded={on} onClick={() => setOpen(n)}>
                  <span>{it.head}</span>
                  <span className="faq-x" aria-hidden />
                </button>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      className="limit-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                    >
                      <p>{it.body}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ════ Colophon ════ */

export function Colophon() {
  return (
    <section className="sec wrap f-bone" data-field="light">
      <div className="colo-grid">
        <Lines lines={["What it is", "made of."]} />
        <dl className="colo">
          {COLOPHON.map((e, n) => (
            <motion.div
              key={e.what}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE, delay: n * 0.04 }}
            >
              <dt>{e.what}</dt>
              <dd>{e.with}</dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}
