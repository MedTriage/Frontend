"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { COMPLAINTS, outcome, type Answer } from "../../lib/followup";
import { SOURCES, USES, type SourceUse } from "../../lib/sources";
import { Arrow, EASE, LEVEL_COLOR, Lines, Rise } from "./ui";

/* ════ Sources ════
 *
 * Every knowledge source, from `app/lib/sources.ts`. On the About page it is the whole
 * list with a filter by mode; a mode page passes `only` and gets just its own rows with
 * no filter. Rows are plain facts, so the one flourish is the hover, which turns a row
 * into the field's opposite.
 */
export function Sources({
  only,
  field = "bone",
  lines = ["Everything", "it reads."],
  lede,
}: {
  only?: SourceUse;
  field?: "bone" | "bone2" | "ink";
  lines?: string[];
  lede?: string;
}) {
  const [use, setUse] = useState<SourceUse | "all">("all");
  const shown = SOURCES.filter((s) =>
    only ? s.uses.includes(only) : use === "all" || s.uses.includes(use)
  );
  const tabs: (SourceUse | "all")[] = ["all", ...(Object.keys(USES) as SourceUse[])];

  return (
    <section
      className={`sec wrap f-${field}`}
      data-field={field === "ink" ? "dark" : "light"}
      id={only ? undefined : "sources"}
    >
      <div className="sec-head">
        <Lines lines={lines} />
        <Rise delay={0.1}>
          <p className="lede">
            {lede ??
              "Eight of these are read live for each question, one is a terminology held on the server, four are published guidance, and one is the model's own memory, which is treated as unsourced."}
          </p>
        </Rise>
      </div>

      {!only && (
        <div className="src-tabs" role="group" aria-label="Show the sources used by">
          {tabs.map((k) => (
            <button key={k} className="src-tab" aria-pressed={k === use} onClick={() => setUse(k)}>
              {k === "all" ? `All ${SOURCES.length}` : USES[k]}
            </button>
          ))}
        </div>
      )}

      <ul className="src-list">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((s) => (
            <motion.li
              layout
              key={s.name}
              className="src"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <div>
                <span className="src-name">{s.name}</span>
                <span className="src-kind">{s.kind}</span>
              </div>
              <p>{s.gives}</p>
              <div>
                <p className="src-note">{s.note}</p>
                <div className="src-uses">
                  {s.uses.map((u) => (
                    <span key={u} className="src-use">
                      {USES[u]}
                    </span>
                  ))}
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}

/* ════ Follow-up ════
 *
 * The feature, and a working model of it. The card on the right is the check-in a
 * patient gets: pick an illness, answer the check-in, and see what the system does
 * next. Schedules and outcomes come from `app/lib/followup.ts`, which mirrors the
 * backend's published-guidance table and its fixed outcome rules, so what the card
 * shows is what the product does. Colour appears only on an outcome that involves a
 * triage level.
 */
const ANSWERS: { key: Answer; label: string }[] = [
  { key: "better", label: "Better" },
  { key: "same", label: "About the same" },
  { key: "worse", label: "Worse" },
  { key: "sign", label: "An urgent sign" },
  { key: "silent", label: "No answer" },
];

const FACTS = [
  {
    head: "The schedule is published guidance",
    body: "Each illness's usual course, its check-in days and its warning signs come from the NICE guideline for it, not from the model.",
  },
  {
    head: "The outcomes are fixed rules",
    body: "What follows Better, Same or Worse is decided by code. The model is not asked.",
  },
  {
    head: "Silence is never recovery",
    body: "No answer means a reminder, then a lapsed episode a doctor can see. It is never counted as getting better.",
  },
  {
    head: "It keeps quiet at night",
    body: "Nothing is sent between 22:00 and 08:00, India time.",
  },
];

export function FollowUp() {
  const [c, setC] = useState(0);
  const [at, setAt] = useState(0);
  const [answer, setAnswer] = useState<Answer | null>(null);

  const plan = COMPLAINTS[c];
  const due = plan.days[at];
  // The rail runs a little past the last check-in, so the last node is not on its end.
  const span = plan.days[plan.days.length - 1] * 1.14;
  const out = answer ? outcome(answer, plan.days, at) : null;
  const tone = out?.level ? LEVEL_COLOR[out.level - 1] : undefined;

  const pick = (n: number) => {
    setC(n);
    setAt(0);
    setAnswer(null);
  };

  return (
    <section className="sec wrap f-ink" data-field="dark" id="followup">
      <div className="fu-grid">
        <div>
          <Lines lines={["It answers.", "Then it checks back."]} />
          <Rise delay={0.15}>
            <p className="lede dim" style={{ marginTop: 26 }}>
              A Level 1 answer, or a Level 2 answer a doctor approved, opens an episode. The
              illness is watched: you are told what to come back for, and asked how it is going
              on set days.
            </p>
          </Rise>
          <dl className="fu-facts">
            {FACTS.map((f, n) => (
              <Rise key={f.head} delay={n * 0.05}>
                <dt>{f.head}</dt>
                <dd className="dim">{f.body}</dd>
              </Rise>
            ))}
          </dl>
        </div>

        <Rise className="fu-card" delay={0.1}>
          <div>
            <p className="term-k">Pick an illness, then answer its check-in</p>
            <div className="fu-picks" role="group" aria-label="Illness">
              {COMPLAINTS.map((k, n) => (
                <button key={k.label} className="fu-pick" aria-pressed={n === c} onClick={() => pick(n)}>
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          <div className="fu-track" aria-hidden style={{ ["--c" as string]: tone ?? "var(--bone)" }}>
            <span className="fu-rail">
              <motion.i
                initial={false}
                animate={{ scaleX: due / span }}
                transition={{ duration: 0.9, ease: EASE }}
              />
            </span>
            <span className="fu-node" data-state="done" style={{ left: 0 }}>
              <i />
              <b>Answer</b>
            </span>
            {plan.days.map((d, n) => (
              <span
                key={`${c}-${d}`}
                className="fu-node"
                data-state={n < at || (n === at && out) ? "done" : n === at ? "due" : "ahead"}
                style={{ left: `${(d / span) * 100}%` }}
              >
                <i />
                <b>Day {d}</b>
              </span>
            ))}
          </div>

          <p className="mono fu-course">
            {plan.guide && plan.course
              ? `${plan.guide}: ${plan.label.toLowerCase()} ${plan.course}.`
              : "No guideline matched, so the general schedule applies."}
          </p>

          <div className="fu-ask" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              {out ? (
                <motion.div
                  key={`${c}-${at}-${answer}`}
                  className="fu-out"
                  data-level={out.level ?? undefined}
                  style={{ ["--c" as string]: tone }}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  {out.level && <span className="mono-s">Level {out.level}</span>}
                  <p className="fu-out-head">{out.head}</p>
                  <p>{out.body}</p>
                  <button
                    className="arrow-link"
                    onClick={() => {
                      if (out.next) setAt(at + 1);
                      else setAt(0);
                      setAnswer(null);
                    }}
                  >
                    {out.next ? `Go to day ${out.next}` : "Start again"} <Arrow />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key={`${c}-${at}-ask`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <p className="fu-q">Day {due}. How is it now?</p>
                  <div className="fu-answers" role="group" aria-label="Your answer">
                    {ANSWERS.map((a) => (
                      <button key={a.key} className="fu-answer" onClick={() => setAnswer(a.key)}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Rise>
      </div>
    </section>
  );
}
