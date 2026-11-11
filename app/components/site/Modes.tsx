"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useInView, useMotionValue, useSpring } from "motion/react";
import { GENERAL_LABEL, OVERRIDE_TEXT, WATCH_FOR } from "../../lib/child";
import { LEVELS } from "../../lib/levels";
import { useStillness } from "../../lib/useStillness";
import { Moon, phaseOf } from "./Moon";
import { Arrow, EASE, LEVEL_HEX, Lines, LogoMark, Rise } from "./ui";

/* The two mode pages, `/drugs` and `/child`. Each is that mode's front door: what it
   is, a field to ask from, how an answer is made, what it will not do, and what it
   reads. Asking hands off to the consultation itself (`/chat?mode=…&q=…`), which is
   where a question is actually sent; nothing on these pages talks to the pipeline. */

/* ════ The field you ask from ════
 *
 * Opens a consultation in this mode with the question already in the composer. It does
 * not send it: the person presses send there, after signing in if they need to.
 */
export function AskField({
  mode,
  placeholder,
  examples,
}: {
  mode: "drugs" | "child";
  placeholder: string;
  examples: string[];
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const input = useRef<HTMLInputElement>(null);

  return (
    <form
      className="ask"
      onSubmit={(e) => {
        e.preventDefault();
        const q = text.trim();
        if (q) router.push(`/chat?mode=${mode}&q=${encodeURIComponent(q)}`);
      }}
    >
      <div className="ask-box">
        <input
          ref={input}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          aria-label="Your question"
        />
        <button className="ask-send" aria-label="Open a consultation with this question" disabled={!text.trim()}>
          <Arrow />
        </button>
      </div>
      <div className="ask-eg">
        {examples.map((q) => (
          <button
            type="button"
            key={q}
            onClick={() => {
              setText(q);
              input.current?.focus();
            }}
          >
            {q}
          </button>
        ))}
      </div>
      <p className="mono-s ask-note">Opens a consultation with this in the box. You send it there.</p>
    </form>
  );
}

/* ════ Drug mode: hero ════
 *
 * The moon again, and here it does one thing: it wanes from full to the half and stops.
 * An answer that names a drug or a dose is Level 2 without exception, so this moon
 * never gets past half. The split under it is read from `LEVELS`.
 */
export function DrugHero() {
  const held = LEVELS[1];
  const target = useMotionValue(1);
  const phase = useSpring(target, { stiffness: 26, damping: 13 });

  useEffect(() => {
    target.set(phaseOf(held.ai));
  }, [target, held.ai]);

  return (
    <section className="hero f-ink" data-field="dark" style={{ paddingBottom: 40 }}>
      <div className="grain" aria-hidden />
      <div className="hero-main">
        <div className="hero-copy">
          <Lines as="h1" className="h1" delay={0.15} lines={["Ask about a medicine.", "A doctor signs it off."]} />
          <Rise delay={0.5}>
            <p className="lede dim">
              Interactions, doses, what a label says. Drug mode looks the medicine up live,
              reads it against what you take and what you are allergic to, and holds anything
              that names a dose for a doctor.
            </p>
          </Rise>
          <Rise delay={0.62}>
            <AskField
              mode="drugs"
              placeholder="Ask about a drug: interactions, dosing, labelling."
              examples={[
                "Can I take ibuprofen with my blood pressure medication?",
                "What does amoxicillin interact with?",
                "How long can I take cetirizine for?",
              ]}
            />
          </Rise>
        </div>

        <motion.div
          className="hero-stage"
          initial={{ opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, ease: EASE, delay: 0.1 }}
        >
          <div className="orbit" aria-hidden>
            <svg viewBox="-100 -100 200 200" fill="none">
              <circle r="99" stroke="#ece9e2" strokeOpacity="0.16" strokeWidth="0.35" strokeDasharray="0.6 3.4" />
              <circle cx="99" cy="0" r="1.6" fill={LEVEL_HEX[1]} />
            </svg>
          </div>
          <div className="hero-moon">
            <Moon phase={phase} color={LEVEL_HEX[1]} glow />
            <p className="hero-read mono">
              <span>
                <b>Level {held.level}</b>
                {held.name}
              </span>
              <span>
                <b>AI</b>
                {held.ai}
              </span>
              <span>
                <b>Doctor</b>
                {held.md}
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ════ Child health: hero ════
 *
 * This mode has no level, so it gets no moon. Its object is the answer itself: the four
 * parts every child-health answer is assembled from, in the order they are printed,
 * with the real fixed wording. The switch shows the one part that is conditional. It is
 * a diagram of the layout, not an answer: no clinical content is invented for it.
 */
function Anatomy() {
  const [sign, setSign] = useState(true);
  return (
    <motion.figure
      className="anat"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, ease: EASE, delay: 0.35 }}
    >
      <figcaption className="anat-bar">
        <span>How every answer is laid out</span>
        <button className="anat-switch" aria-pressed={sign} onClick={() => setSign((v) => !v)}>
          <i aria-hidden />
          A danger sign was described
        </button>
      </figcaption>

      <AnimatePresence initial={false}>
        {sign && (
          <motion.div
            className="anat-banner"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <p>{OVERRIDE_TEXT}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="anat-part">
        <span className="anat-k">From the guidelines</span>
        <p>
          The answer, in plain words. Each claim carries the number of the passage it came from
          <span className="anat-cite">1</span>
          <span className="anat-cite">2</span>
        </p>
        <p className="anat-k">1 WHO chart booklet, with its page / 2 IMNCI, with its page</p>
      </div>
      <div className="anat-part alt">
        <span className="anat-k">{GENERAL_LABEL}</span>
        <p>Anything those passages do not cover is kept apart, under this label.</p>
      </div>
      <div className="anat-part">
        <span className="anat-k">Watch for, on every answer</span>
        <ul>
          {WATCH_FOR.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </div>
    </motion.figure>
  );
}

export function ChildHero() {
  return (
    <section className="ab-hero f-bone" data-field="light">
      <div className="ab-hero-main">
        <div>
          <Lines
            as="h1"
            className="h1 mode-h1"
            delay={0.1}
            lines={["Questions about a child,", "answered from the page."]}
          />
          <Rise delay={0.45}>
            <p className="lede">
              Child-health mode answers from WHO and IMNCI guidance and shows the page each
              claim came from. It looks for danger signs before it writes anything, and every
              answer ends with what to watch for.
            </p>
          </Rise>
          <Rise delay={0.6}>
            <AskField
              mode="child"
              placeholder="Ask about your child's health."
              examples={[
                "My two-year-old has had loose stools since yesterday.",
                "How do I know if my baby is feeding well?",
                "My child has a cough and is breathing fast.",
              ]}
            />
          </Rise>
        </div>
        <Anatomy />
      </div>
    </section>
  );
}

/* ════ How an answer is made ════
 *
 * The steps in order, with one large word for the step that is running. They advance on
 * a timer while the section is on screen and can be picked by hand; under reduced
 * motion they only move when picked.
 */
export interface Step {
  /** One verb, set very large while this step is the active one. */
  word: string;
  head: string;
  body: string;
}

const STEP_MS = 5200;

export function Steps({
  field,
  lines,
  lede,
  steps,
}: {
  field: "ink" | "bone";
  lines: string[];
  lede: string;
  steps: Step[];
}) {
  const still = useStillness();
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { margin: "0px 0px -30% 0px" });
  const [i, setI] = useState(0);

  useEffect(() => {
    if (still || !seen) return;
    const id = window.setTimeout(() => setI((v) => (v + 1) % steps.length), STEP_MS);
    return () => window.clearTimeout(id);
  }, [i, still, seen, steps.length]);

  return (
    <section ref={ref} className={`sec wrap f-${field}`} data-field={field === "ink" ? "dark" : "light"}>
      <div className="sec-head">
        <Lines lines={lines} />
        <Rise delay={0.1}>
          <p className="lede dim">{lede}</p>
        </Rise>
      </div>

      <p className="steps-word" aria-hidden>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={i}
            initial={{ y: "105%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-105%" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            {steps[i].word}
          </motion.span>
        </AnimatePresence>
      </p>

      <div
        className="steps-grid"
        role="group"
        aria-label="The steps, in order"
        style={{ ["--n" as string]: steps.length }}
      >
        {steps.map((s, n) => (
          <button
            key={s.head}
            className="phase"
            aria-pressed={n === i}
            onClick={() => setI(n)}
            style={{ ["--dwell" as string]: `${STEP_MS}ms` }}
          >
            <span className="lv-track">
              <span className="lv-fill" key={`${i}-${seen}`} />
            </span>
            <span className="lv-name">{s.head}</span>
            <span className="phase-body">{s.body}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ════ What it will not do ════ */

export function Nots({
  field,
  lines,
  lede,
  items,
}: {
  field: "ink" | "bone";
  lines: string[];
  lede: string;
  items: { title: string; body: string }[];
}) {
  return (
    <section className={`sec wrap f-${field}`} data-field={field === "ink" ? "dark" : "light"}>
      <div className="cons-grid">
        <div className="cons-head">
          <Lines lines={lines} />
          <Rise delay={0.15}>
            <p className="lede dim">{lede}</p>
          </Rise>
        </div>
        <ul className="cons-list">
          {items.map((p, n) => (
            <Rise key={p.title} delay={n * 0.05}>
              <li>
                <LogoMark />
                <div>
                  <h3 className="h3">{p.title}</h3>
                  <p className="dim">{p.body}</p>
                </div>
              </li>
            </Rise>
          ))}
        </ul>
      </div>
    </section>
  );
}
