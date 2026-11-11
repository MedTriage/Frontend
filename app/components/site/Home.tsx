"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { LEVELS } from "../../lib/levels";
import { RULES } from "../../lib/rules";
import { useStillness } from "../../lib/useStillness";
import { Moon, phaseOf } from "./Moon";
import {
  Arrow,
  Btn,
  EASE,
  LEVEL_COLOR,
  LEVEL_HEX,
  Lines,
  LogoMark,
  Rise,
  ScrubWords,
} from "./ui";

/* ════ Hero ════
 *
 * Night, one moon, a small headline. The moon steps through the three levels on its own
 * and the three tabs along the floor let the reader hold one. Every number on screen is
 * read from `LEVELS`; the moon's phase is computed from `ai`, not posed.
 */
const DWELL = 4600;

export function Hero() {
  const still = useStillness();
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);

  const target = useMotionValue(phaseOf(LEVELS[0].ai));
  const phase = useSpring(target, { stiffness: 46, damping: 15 });
  const color = useTransform(phase, [-1, 0, 1], [LEVEL_HEX[2], LEVEL_HEX[1], LEVEL_HEX[0]]);
  const ai = useTransform(phase, (k) => Math.round(Math.max(0, Math.min(1, (1 + k) / 2)) * 100));
  const md = useTransform(ai, (v) => 100 - v);

  // The moon leans a little toward the pointer. It is the only thing in the hero that
  // answers the mouse, so it reads as the object being alive rather than the page.
  const mx = useSpring(useMotionValue(0), { stiffness: 40, damping: 14 });
  const my = useSpring(useMotionValue(0), { stiffness: 40, damping: 14 });

  useEffect(() => {
    target.set(phaseOf(LEVELS[i].ai));
  }, [i, target]);

  useEffect(() => {
    if (still || held) return;
    const id = window.setTimeout(() => setI((v) => (v + 1) % LEVELS.length), DWELL);
    return () => window.clearTimeout(id);
  }, [i, still, held]);

  return (
    <section
      className="hero f-ink"
      data-field="dark"
      onPointerMove={(e) => {
        if (still || e.pointerType !== "mouse") return;
        mx.set((e.clientX / window.innerWidth - 0.5) * 30);
        my.set((e.clientY / window.innerHeight - 0.5) * 22);
      }}
    >
      <div className="grain" aria-hidden />

      <div className="hero-main">
        <div className="hero-copy">
          <Lines
            as="h1"
            className="h1"
            delay={0.15}
            lines={["The more it matters,", "the less the AI decides."]}
          />
          <Rise delay={0.5}>
            <p className="lede dim">
              MedTriage answers health questions, then gives up its own say as the risk rises.
              A doctor signs off anything clinical. In an emergency the AI stops talking.
            </p>
          </Rise>
          <Rise delay={0.62} className="hero-actions">
            <Btn href="/chat">Start a consultation</Btn>
            <Link href="/about" className="arrow-link">
              How it works <Arrow />
            </Link>
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
              <motion.circle cx="99" cy="0" r="1.6" fill={color} />
            </svg>
          </div>
          <motion.div className="hero-moon" style={{ x: mx, y: my }}>
            <Moon phase={phase} color={color} glow />
            <p className="hero-read mono" aria-hidden>
              <span>
                <b>AI</b>
                <motion.span>{ai}</motion.span>
              </span>
              <span>
                <b>Doctor</b>
                <motion.span>{md}</motion.span>
              </span>
            </p>
          </motion.div>
        </motion.div>
      </div>

      <div
        className="levels-bar"
        role="group"
        aria-label="The three levels"
        onPointerEnter={() => setHeld(true)}
        onPointerLeave={() => setHeld(false)}
      >
        {LEVELS.map((l, n) => (
          <button
            key={l.level}
            className="lv"
            aria-pressed={n === i}
            onClick={() => setI(n)}
            onFocus={() => setI(n)}
            style={{ ["--c" as string]: LEVEL_COLOR[n], ["--dwell" as string]: `${DWELL}ms` }}
          >
            <span className="lv-track">
              {/* Keyed so the rail restarts whenever this level becomes the active one. */}
              <span className="lv-fill" key={`${i}-${held}`} />
            </span>
            <span className="mono-s">Level {l.level}</span>
            <span className="lv-name">{l.name}</span>
            <span className="mono-s split">
              AI {l.ai} / Doctor {l.md}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ════ The statement ════ */

export function Statement() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const phase = useTransform(scrollYProgress, [0, 1], [1, 0]);

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
              text="It answers your health question. Then, before you read a word, it decides how far it was allowed to answer alone."
            />
          </p>
          <div className="statement-foot">
            <Rise>
              <p>
                Most of what makes a medical assistant safe happens after it has an answer.
                MedTriage reads three clinical sources at once, reconciles them, and then hands
                the result to a set of rules the language model cannot argue with.
              </p>
            </Rise>
            <Rise delay={0.1}>
              <p>
                Those rules sort every reply onto one of three levels. The level decides who
                was allowed to release it: the system, a doctor, or nobody but emergency care.
              </p>
            </Rise>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════ The scale ════
 *
 * Pinned for three screens' worth of scroll. The whole field takes the level's colour and
 * the moon wanes from full to new. Scroll progress is mapped through plateaus, so the
 * section rests on the three real splits (100/0, 50/50, 0/100) and only passes through
 * the values between them; nothing in the product is ever "73% AI".
 */
const STOPS = [0, 0.24, 0.38, 0.62, 0.76, 1];

export function Scale() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [i, setI] = useState(0);

  const phase = useTransform(scrollYProgress, STOPS, [1, 1, 0, 0, -1, -1]);
  const bg = useTransform(scrollYProgress, STOPS, [
    LEVEL_HEX[0],
    LEVEL_HEX[0],
    LEVEL_HEX[1],
    LEVEL_HEX[1],
    LEVEL_HEX[2],
    LEVEL_HEX[2],
  ]);
  const ai = useTransform(phase, (k) => Math.round(((1 + k) / 2) * 100));
  const md = useTransform(ai, (v) => 100 - v);
  const aiScale = useTransform(phase, (k) => (1 + k) / 2);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setI(p < 0.31 ? 0 : p < 0.69 ? 1 : 2);
  });

  const l = LEVELS[i];

  return (
    <section className="scale" ref={ref} data-field="light" id="levels">
      <motion.div className="scale-pin" style={{ backgroundColor: bg }}>
        <div className="scale-head">
          <h2 className="h3">Three levels. The level decides who answers.</h2>
          <span className="mono">Level {l.level} of 3</span>
        </div>

        <div className="scale-body">
          <div className="scale-text" aria-live="polite">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={l.level}
                className="scale-panel"
                initial={{ opacity: 0, y: 44 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -44 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <p className="scale-name">{l.name}</p>
                <p className="scale-holds">{l.holds}</p>
                <p className="scale-detail">{l.detail}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <Moon
            phase={phase}
            color="#ece9e2"
            dark="#0b0d0c"
            tilt={-22}
            className="scale-moon"
          />
        </div>

        <div className="scale-foot" aria-hidden>
          <span className="scale-num">
            <small>AI</small>
            <motion.span>{ai}</motion.span>
          </span>
          <span className="scale-split">
            <motion.i style={{ scaleX: aiScale }} />
          </span>
          <span className="scale-num">
            <motion.span>{md}</motion.span>
            <small>Doctor</small>
          </span>
        </div>
      </motion.div>
    </section>
  );
}

/* ════ The demo ════
 *
 * Scripted, and it says so. Each case carries a WRITTEN level: this page never derives
 * one, because the Guardian on the backend is the only thing allowed to. What it does
 * read live is the wording: rule text comes from `RULES` and the outcome from `LEVELS`,
 * so the replay cannot drift from the published table.
 */
const rule = (when: string) => {
  const r = RULES.find((x) => x.when === when);
  if (!r) throw new Error(`Demo case names a rule that is not in RULES: ${when}`);
  return r;
};

const CASES = [
  {
    q: "I keep getting headaches in the afternoon.",
    proposed: 1 as const,
    level: 1 as const,
    rules: [rule("The system is asking you a question")],
  },
  {
    q: "I've had a sore throat and a fever for three days.",
    proposed: 1 as const,
    level: 2 as const,
    rules: [
      rule("The answer asks for a test, lab or scan"),
      rule("The answer names a drug or a dose"),
    ],
  },
  {
    q: "Crushing chest pain, spreading down my left arm.",
    proposed: null,
    level: 3 as const,
    rules: [rule("An emergency is detected")],
  },
];

// The three evidence branches, in the patient's terms. The first is the model's own
// recall, which `app/lib/sources.ts` lists as unsourced; it is not a guideline library.
const SOURCES = ["The model's own recall", "Map of related conditions", "Live lookups, FDA and PubMed"];

// When each beat of the replay lands, in ms after the question finishes typing.
const BEATS = [300, 1500, 2500, 3400, 4300];

function Terminal({ n, onReplay }: { n: number; onReplay: () => void }) {
  const c = CASES[n];
  const still = useStillness();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -25% 0px" });
  const [typedN, setTyped] = useState(0);
  const [beatN, setBeat] = useState(0);

  // The component is remounted for every case and every replay (it is keyed by both), so
  // the counters always start from zero and this effect only ever has to run forward.
  useEffect(() => {
    if (!seen || still) return;
    const timers: number[] = [];
    const type = window.setInterval(() => {
      setTyped((t) => {
        if (t >= c.q.length) {
          window.clearInterval(type);
          BEATS.forEach((ms, k) => timers.push(window.setTimeout(() => setBeat(k + 1), ms)));
          return t;
        }
        return t + 1;
      });
    }, 26);
    return () => {
      window.clearInterval(type);
      timers.forEach(window.clearTimeout);
    };
  }, [c, seen, still]);

  // Under reduced motion nothing is timed: the replay is shown finished.
  const typed = still ? c.q.length : typedN;
  const beat = still ? BEATS.length : beatN;

  const out = LEVELS[c.level - 1];
  const overruled = c.proposed !== null && c.proposed !== c.level;
  const fade = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: EASE },
  };

  return (
    <div className="term" ref={ref} style={{ ["--c" as string]: LEVEL_COLOR[c.level - 1] }}>
      <div className="term-bar">
        <span>A scripted replay, not a live session</span>
        <button onClick={onReplay}>
          <svg viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v2.6h-2.6"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Replay
        </button>
      </div>

      <div className="term-body" aria-live="polite">
        <p className="term-q">
          {c.q.slice(0, typed)}
          {typed < c.q.length && <span className="caret" aria-hidden />}
        </p>

        {beat >= 1 && (
          <motion.div {...fade}>
            <p className="term-k">Three sources, read at once</p>
            {SOURCES.map((s, k) => (
              <motion.div
                key={s}
                className="term-row"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: k * 0.18 }}
              >
                <span>{s}</span>
                <span className={beat >= 2 ? "ok" : "wait"}>{beat >= 2 ? "read" : "reading"}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {beat >= 3 && (
          <motion.div {...fade}>
            <p className="term-k">The model proposes</p>
            {c.proposed === null ? (
              <span>Not asked. The emergency rule runs first.</span>
            ) : (
              <span className="term-prop">
                Level {c.proposed}, {LEVELS[c.proposed - 1].name.toLowerCase()}
                {overruled && beat >= 5 && (
                  <motion.i
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
                  />
                )}
              </span>
            )}
            {overruled && beat >= 5 && <span className="sr-only"> Overruled.</span>}
          </motion.div>
        )}

        {beat >= 4 && (
          <motion.div {...fade}>
            <p className="term-k">Rules that fired</p>
            {c.rules.map((r, k) => (
              <motion.div
                key={r.when}
                className="term-rule"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: k * 0.22, duration: 0.45, ease: EASE }}
              >
                <b>L{r.then}</b>
                <span>{r.when}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {beat >= 5 && (
          <motion.div
            className="verdict"
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div>
              <span>Released at Level {out.level}</span>
              <div className="verdict-name">{out.name}</div>
              <p>{out.holds}</p>
            </div>
            <span className="verdict-split">
              AI {out.ai} / Doctor {out.md}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function Demo() {
  const [n, setN] = useState(1);
  const [run, setRun] = useState(0);

  return (
    <section className="sec wrap f-ink" data-field="dark">
      <div className="demo-grid">
        <div className="demo-copy">
          <Lines lines={["Watch a question", "decide itself."]} />
          <Rise delay={0.15}>
            <p className="lede dim">
              Pick a question. The model says how it would like to answer, the rules read what
              it wrote, and the level it wanted may not be the level it gets.
            </p>
          </Rise>
          <div className="cases" role="group" aria-label="Example questions">
            {CASES.map((c, k) => (
              <button
                key={c.q}
                className="case"
                aria-pressed={k === n}
                style={{ ["--c" as string]: LEVEL_COLOR[c.level - 1] }}
                onClick={() => {
                  setN(k);
                  setRun((r) => r + 1);
                }}
              >
                <span className="case-q">{c.q}</span>
                <span className="mono-s">Level {c.level}</span>
              </button>
            ))}
          </div>
        </div>
        <Terminal key={`${n}-${run}`} n={n} onReplay={() => setRun((r) => r + 1)} />
      </div>
    </section>
  );
}

/* ════ What every answer carries ════ */

// The worked example the product's own differential view uses: one sore throat, the
// conditions weighed, and the ones dropped. An example, labelled as one.
const DIFFERENTIAL = [
  { name: "Streptococcal pharyngitis", state: "settled on" },
  { name: "Viral pharyngitis", state: "considered" },
  { name: "Infectious mononucleosis", state: "considered" },
  { name: "Peritonsillar abscess", state: "ruled out" },
  { name: "Acute epiglottitis", state: "ruled out" },
  { name: "Diphtheria", state: "ruled out" },
];

function Ledger() {
  return (
    <div className="ledger">
      {LEVELS.map((l, n) => (
        <div
          className="ledger-row"
          key={l.level}
          style={{ ["--c" as string]: LEVEL_COLOR[n] }}
        >
          <span>{l.name}</span>
          <span className="ledger-bar">
            <motion.i
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: l.ai / 100 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: EASE, delay: 0.15 + n * 0.12 }}
            />
          </span>
          <span>
            AI {l.ai} / Dr {l.md}
          </span>
        </div>
      ))}
    </div>
  );
}

const CARRIED = [
  {
    title: "Every condition it ruled out",
    body: "The assessment walks a clinical terminology to find the disorders worth ruling out, weighs each against the evidence, and shows you the ones it dropped. A differential you can see is the difference between explaining a decision and asserting one.",
    vis: (
      <ul className="diff" aria-label="Example: one sore throat">
        {DIFFERENTIAL.map((d) => (
          <li key={d.name} className={d.state === "ruled out" ? "out" : undefined}>
            <span>{d.name}</span>
            <span>{d.state}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "The rules that bound it",
    body: "Before the model is asked for an opinion, and again after, a table of fixed rules decides how far it was allowed to answer. Naming a drug, ordering a test, or missing an emergency each carry a floor no prompt can talk its way underneath.",
    vis: (
      <ul className="diff" aria-label="The rules, and the level each one forces">
        {RULES.slice(3, 8).map((r) => (
          <li key={r.when}>
            <span>{r.when}</span>
            <span className="lvl" style={{ ["--c" as string]: LEVEL_COLOR[r.then - 1] }}>
              Level {r.then}
            </span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "Who was in control",
    body: "Each reply arrives stamped with how much of it the system was permitted to decide and how much waited on a human. Autonomy is not a setting here; it is an outcome of your risk.",
    vis: <Ledger />,
  },
];

export function Carries() {
  return (
    <section className="sec wrap f-bone" data-field="light">
      <div className="carry-head">
        <Lines lines={["What every", "answer carries"]} />
        <Rise delay={0.1}>
          <p className="lede">
            Three things come with each reply: the working, the rules that bound it, and who
            was allowed to decide.
          </p>
        </Rise>
      </div>
      <div className="carry">
        {CARRIED.map((c, n) => (
          <Rise key={c.title} delay={n * 0.06}>
            <article className="carry-row">
              <div>
                <h3 className="h3">{c.title}</h3>
                <p>{c.body}</p>
              </div>
              <div className="carry-vis">{c.vis}</div>
            </article>
          </Rise>
        ))}
      </div>
    </section>
  );
}

/* ════ Constraints ════ */

const PRINCIPLES = [
  {
    title: "The rules outrank the model",
    body: "Emergencies, escalations and prescriptions are floored by rules the language model cannot argue past. A better prompt cannot lower your triage level.",
  },
  {
    title: "Disagreement is surfaced, not averaged",
    body: "Three sources are consulted at once and they frequently conflict. That conflict is resolved on evidence and recorded, or escalated to a human. It is never smoothed over.",
  },
  {
    title: "Nothing unreviewed reaches you",
    body: "Raw retrieval never renders. Only the audited, reconciled response is shown, and every one carries its level and its reasoning.",
  },
  {
    title: "Colour means risk where it counts",
    body: "Inside a consultation the triage scale is the only thing coloured: green, amber and red tell you how far the system was allowed to answer, and nothing else borrows them.",
  },
];

export function Constraints() {
  return (
    <section className="sec wrap f-ink" data-field="dark">
      <div className="cons-grid">
        <div className="cons-head">
          <Lines lines={["Constraints,", "not promises."]} />
          <Rise delay={0.15}>
            <p className="lede dim">
              Four things the system is not permitted to do, whatever it decides.
            </p>
          </Rise>
          <Rise delay={0.25} className="mt-9">
            <Link href="/about#rules" className="arrow-link">
              Read the eight rules <Arrow />
            </Link>
          </Rise>
        </div>
        <ul className="cons-list">
          {PRINCIPLES.map((p, n) => (
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

      {/* The eight rules as a moving strip: every plate with the rule it stands for and
          the level that rule forces, in evaluation order. It is the same table the About
          page sets out in full, and each card goes there. The second copy exists only
          so the loop has no seam; it is hidden from assistive tech and from the tab
          order. */}
      <div className="plates" aria-label="The eight rules">
        <div className="plates-track">
          {[0, 1].map((copy) =>
            RULES.map((r) => (
              <Link
                key={`${copy}-${r.when}`}
                href="/about#rules"
                className="plate-card"
                aria-hidden={copy === 1 || undefined}
                tabIndex={copy === 1 ? -1 : undefined}
              >
                <span className="plate-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/rules/${r.plate}`} alt={r.alt} loading="lazy" />
                </span>
                <span className="lvl mono-s" style={{ ["--c" as string]: LEVEL_COLOR[r.then - 1] }}>
                  Level {r.then}
                </span>
                <span className="plate-when">{r.when}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

/* ════ Questions ════ */

const FAQ = [
  {
    id: "overview",
    label: "Overview",
    items: [
      {
        q: "What is MedTriage?",
        a: "A triage system that reads what you describe, weighs several clinical sources at once, and returns a graded assessment with the reasoning attached. It is not a diagnosis and not a substitute for a clinician.",
      },
      {
        q: "Who is it for?",
        a: "Anyone trying to make sense of a symptom before deciding whether, and how urgently, to seek care. It is built to hand off to a human, not to replace one.",
      },
      {
        q: "How is it different from a chatbot?",
        a: "A chatbot just answers. MedTriage assigns every answer a triage level under rules the model cannot argue past, surfaces where its sources disagreed, and locks anything it is not permitted to decide.",
      },
    ],
  },
  {
    id: "safety",
    label: "Safety",
    items: [
      {
        q: "What do the three levels mean?",
        a: "Level 1 is safe to read directly, Level 2 is held for a physician to verify, and Level 3 is an emergency the system locks and escalates.",
      },
      {
        q: "Can it handle an emergency?",
        a: "It is built to recognise one and escalate, not to manage it. If you think you are in danger, call your local emergency number now. Do not wait on the system.",
      },
      {
        q: "Can a better prompt lower my level?",
        a: "No. Emergencies, escalations and prescription thresholds are floored by fixed rules, and the model's output is clamped by them. Phrasing cannot talk its way to a lower level.",
      },
    ],
  },
  {
    id: "privacy",
    label: "Privacy",
    items: [
      {
        q: "What happens to what I describe?",
        a: "A record of each conversation is kept so the system can reason across your turns, and a Level 2 answer is shown to the doctor who reviews it. Do not enter anything you would not want stored.",
      },
      {
        q: "Is anything decided about me automatically?",
        a: "Nothing unreviewed reaches you. Raw retrieval never renders; only the audited, reconciled response is shown, and every one carries its level and its reasoning.",
      },
    ],
  },
  {
    id: "clinical",
    label: "Clinical",
    items: [
      {
        q: "Is this medical advice?",
        a: "No. It is decision support. Every response says so, and anything clinical is either verified by a physician or escalated to a human.",
      },
      {
        q: "Can I see where an answer came from?",
        a: "Yes. Each assessment carries the sources it was built from, so you or a clinician can check the reasoning rather than take it on trust.",
      },
    ],
  },
];

export function Faq() {
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState<number | null>(0);
  const items = FAQ[tab].items;

  return (
    <section className="sec wrap f-bone" data-field="light">
      <div className="faq-grid">
        <div>
          <Lines lines={["Questions people", "arrive with"]} />
          <div className="faq-tabs" role="tablist" aria-label="Topics">
            {FAQ.map((t, n) => (
              <button
                key={t.id}
                role="tab"
                className="faq-tab"
                aria-selected={n === tab}
                onClick={() => {
                  setTab(n);
                  setOpen(0);
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="faq-list" role="tabpanel">
          {items.map((it, n) => {
            const on = open === n;
            return (
              <motion.div
                key={it.q}
                className="faq-item"
                data-open={on}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: n * 0.06 }}
              >
                <button
                  className="faq-q"
                  aria-expanded={on}
                  onClick={() => setOpen(on ? null : n)}
                >
                  <span>{it.q}</span>
                  <span className="faq-x" aria-hidden />
                </button>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      className="faq-a"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                    >
                      <p>{it.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
