"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useScroll,
  useTransform,
} from "motion/react";
import { COLOPHON } from "../../lib/colophon";
import { LEVELS } from "../../lib/levels";
import { LIMITS } from "../../lib/limits";
import { RULES } from "../../lib/rules";
import { PHASES } from "../../lib/seconds";
import { SOURCES } from "../../lib/sources";
import { useStillness } from "../../lib/useStillness";
import { Moon } from "./Moon";
import { Signal } from "./Signal";
import { Arrow, EASE, LEVEL_COLOR, Lines, Rise, Roll, ScrubWords } from "./ui";

/* ── What the system is made of, named as a patient meets them. ── */
const PARTS = [
  {
    name: "The record",
    does: "Keeps a running note of what you have said you have, what you take, and what you are allergic to, so a later message is read in the light of the earlier ones and a recommendation can be checked against your allergies.",
  },
  {
    name: "The router",
    does: "Decides one thing only: is this clinical or is this conversation. It deliberately does not judge severity, because severity is decided later by something that has read the evidence.",
  },
  {
    name: "Three sources, at once",
    does: "What the model recalls on its own, a map of related conditions, and live lookups in drug labelling and the literature. They are consulted in parallel and they frequently disagree.",
  },
  {
    name: "The reconciler",
    does: "Reads all three, resolves disagreement on the evidence rather than by majority, checks every claim against the source it came from, and flags emergencies. If one source came back thin, it sends that one, and only that one, back to look again.",
  },
  {
    name: "The guardian",
    does: "Applies the eight rules. It is the only component permitted to set your triage level, and it is the last thing that runs.",
  },
];

/* ── How it fails. Every one of these is a real, exercised code path. ── */
const FAILURES = [
  {
    when: "A source can't be reached",
    then: "It is dropped as unusable rather than counted as silence. The remaining sources carry the answer, and the consultation tells you which one was missing.",
  },
  {
    when: "The safety review itself fails",
    then: "The case escalates to a physician. A broken reviewer never results in an unreviewed answer reaching you.",
  },
  {
    when: "The guardian fails",
    then: "The case defaults to physician review. There is no failure mode in which a fault produces a Level 1 answer.",
  },
  {
    when: "The model returns nothing usable",
    then: "You are told so. Raw, un-audited retrieval is never shown to a patient. Not as a fallback, not ever.",
  },
];

/* ════ Hero ════
 *
 * The headline claims the rules outrank the model, and the docket beside it is one case
 * doing exactly that: the model asks to answer directly, two rules fire on what it
 * wrote, the level it wanted is struck out and raised. The strike is the product in one
 * gesture, so it is the only thing here that is timed.
 */
const FIRED = [
  RULES.find((r) => r.when === "The answer asks for a test, lab or scan")!,
  RULES.find((r) => r.when === "The answer names a drug or a dose")!,
];

function Docket() {
  // The sequence is the point of the docket, so it is staged over three seconds. A
  // reader who asked for reduced motion gets it all at once instead: the same content,
  // without the wait.
  const still = useStillness();
  const t = (s: number) => (still ? 0 : s);
  const at = (s: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE, delay: t(s) },
  });
  const held = LEVELS[1];

  return (
    <motion.figure
      className="docket"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, ease: EASE, delay: t(0.35) }}
    >
      <motion.p className="docket-q" {...at(0.7)}>
        “I&apos;ve had a sore throat and a fever for three days.”
      </motion.p>

      <motion.div {...at(1.1)}>
        <p className="term-k">The model proposed</p>
        <span className="term-prop">
          Level 1, {LEVELS[0].name.toLowerCase()}
          <motion.i
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1], delay: t(2.5) }}
          />
        </span>
        <span className="sr-only"> Overruled by the rules below.</span>
      </motion.div>

      <motion.div {...at(1.6)}>
        <p className="term-k">Rules that fired</p>
        {FIRED.map((r) => (
          <div
            key={r.when}
            className="term-rule"
            style={{ ["--c" as string]: LEVEL_COLOR[r.then - 1] }}
          >
            <b>L{r.then}</b>
            <span>{r.when}</span>
          </div>
        ))}
      </motion.div>

      <motion.figcaption
        className="docket-out"
        initial={{ clipPath: "inset(100% 0 0 0)" }}
        animate={{ clipPath: "inset(0% 0 0 0)" }}
        transition={{ duration: 0.8, ease: EASE, delay: t(2.9) }}
      >
        <span>Released at Level {held.level}</span>
        <span className="verdict-name">{held.name}</span>
      </motion.figcaption>
    </motion.figure>
  );
}

export function AboutHero() {
  const jump = [
    { n: RULES.length, what: "rules", href: "#rules" },
    { n: PARTS.length, what: "parts", href: "#parts" },
    { n: SOURCES.length, what: "sources", href: "#sources" },
    { n: FAILURES.length, what: "ways to fail", href: "#fails" },
    { n: LIMITS.length, what: "limits", href: "#limits" },
  ];
  return (
    <section className="ab-hero f-bone" data-field="light">
      <div className="ab-hero-main">
        <div>
          <Lines as="h1" className="h1" delay={0.1} lines={["The rules outrank", "the model."]} />
          <Rise delay={0.45}>
            <p className="lede">
              MedTriage answers health questions and then decides, before you see anything,
              how far it was allowed to answer on its own. This page is about the second half
              of that sentence, because the second half is the part that keeps you safe.
            </p>
          </Rise>
        </div>
        <Docket />
      </div>
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

/* ════ The thesis ════ */

export function Thesis() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  // The docket above ends on Level 2, so the moon settles on the half: full when the
  // model asked to answer alone, half once the rules have had their say.
  const phase = useTransform(scrollYProgress, [0, 1], [1, 0]);
  return (
    <section className="sec wrap f-ink" data-field="dark">
      <div className="statement" ref={ref}>
        <div className="statement-aside">
          <Moon
            phase={phase}
            color="#ffb01f"
            dark="#1d2320"
            grain={false}
            className="w-[min(100%,220px)] -ml-[6%]"
          />
        </div>
        <div>
          <p className="big">
            <ScrubWords
              progress={scrollYProgress}
              text="Every medical AI asks you to trust its judgement. This one publishes the rules that overrule it."
            />
          </p>
        </div>
      </div>
    </section>
  );
}

/* ════ The rule table ════
 *
 * Reading order is evaluation order; the list is `RULES` as written and must stay so.
 * Every row prints its level in words as well as colour, and carries its own plate.
 */
export function RuleTable() {
  return (
    <section className="sec wrap f-ink" data-field="dark" id="rules" style={{ paddingTop: 0 }}>
      <div className="rules-head">
        <Lines lines={[`${RULES.length === 8 ? "Eight" : RULES.length} rules, in the`, "order they run."]} />
        <Rise delay={0.1}>
          <p className="lede dim">
            The guardian applies them from the top, and it is the only part of the system
            allowed to set your level. The model does not get a vote.
          </p>
        </Rise>
      </div>

      <ol className="rules">
        {RULES.map((r, n) => (
          <motion.li
            key={r.when}
            className="rule"
            style={{ ["--c" as string]: LEVEL_COLOR[r.then - 1] }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -6% 0px" }}
            transition={{ duration: 0.7, ease: EASE, delay: (n % 4) * 0.05 }}
          >
            <span className="rule-lv">Level {r.then}</span>
            <span className="rule-when">{r.when}</span>
            <p className="rule-note">{r.note}</p>
            <span className="rule-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/rules/${r.plate}`} alt={r.alt} loading="lazy" />
            </span>
          </motion.li>
        ))}
      </ol>

    </section>
  );
}

/* ════ The parts ════ */

function Part({ name, does, last }: { name: string; does: string; last: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  const on = useInView(ref, { once: true, margin: "0px 0px -42% 0px" });
  return (
    <li ref={ref} className={`part${last ? " last" : ""}`} data-on={on}>
      <h3 className="h3">{name}</h3>
      <p>{does}</p>
    </li>
  );
}

export function Parts() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.58", "end 0.58"] });
  return (
    <section className="sec wrap f-bone" data-field="light" id="parts">
      <div className="parts-grid">
        <div className="parts-head">
          <Lines lines={["Five parts.", "One sets your level."]} />
          <Rise delay={0.15}>
            <p className="lede">
              A question passes through them in this order. The last one is the only one
              whose word is final.
            </p>
          </Rise>
        </div>
        <ol className="parts" ref={ref}>
          <span className="parts-line" aria-hidden>
            <motion.i style={{ scaleY: scrollYProgress }} />
          </span>
          {PARTS.map((p, n) => (
            <Part key={p.name} name={p.name} does={p.does} last={n === PARTS.length - 1} />
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ════ The wait ════
 *
 * The page's one moving picture: three traces that part, disagree and resolve
 * (`Signal.tsx`), driven by the same phase index as the four captions below. The phases
 * advance on a timer while the band is on screen and can be picked by hand.
 */
const PHASE_MS = 6500;

export function Wait() {
  const still = useStillness();
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { margin: "0px 0px -30% 0px" });
  const [i, setI] = useState(0);

  useEffect(() => {
    if (still || !seen) return;
    const id = window.setTimeout(() => setI((v) => (v + 1) % PHASES.length), PHASE_MS);
    return () => window.clearTimeout(id);
  }, [i, still, seen]);

  return (
    <section className="wait-band" data-field="dark" ref={ref}>
      <Signal phase={i} />

      <div>
        <Lines lines={["What happens", "while you wait."]} />
        <Rise delay={0.15}>
          <p className="lede dim">
            Four things, in order. The wait is as long as the slowest source, not the sum of
            all three.
          </p>
        </Rise>
      </div>

      <div className="phases" role="group" aria-label="The four phases">
        {PHASES.map((p, n) => (
          <button
            key={p.head}
            className="phase"
            aria-pressed={n === i}
            onClick={() => setI(n)}
            style={{ ["--dwell" as string]: `${PHASE_MS}ms` }}
          >
            <span className="lv-track">
              <span className="lv-fill" key={`${i}-${seen}`} />
            </span>
            <span className="lv-name">{p.head}</span>
            <span className="phase-body">{p.body}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ════ Failure ════ */

export function Fails() {
  return (
    <section className="sec wrap f-bone" data-field="light" id="fails">
      <div className="fail-head">
        <Lines lines={["Every failure falls", "towards a human."]} />
        <Rise delay={0.1}>
          <p className="lede">
            Software fails. The question worth asking of a medical system is not whether it
            fails, but which way it falls when it does.
          </p>
        </Rise>
      </div>
      <div className="fails">
        {FAILURES.map((f, n) => (
          <Rise key={f.when} delay={(n % 2) * 0.08}>
            <article className="fail">
              <div className="fail-top">
                <h3 className="h3">{f.when}</h3>
                <span className="fail-arrow" aria-hidden>
                  <Arrow />
                </span>
              </div>
              <p>{f.then}</p>
            </article>
          </Rise>
        ))}
      </div>
    </section>
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
