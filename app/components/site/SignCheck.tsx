"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useAnimate, useInView } from "motion/react";
import {
  AGE_BANDS,
  DANGER_SIGNS,
  countingSigns,
  type AgeBand,
  type DangerSign,
} from "../../lib/child";
import { useStillness } from "../../lib/useStillness";
import { EASE, Lines, Rise } from "./ui";

/* ════ Child health: the sign check ════
 *
 * A working model of the first thing child-health mode does, drawn as the object the
 * signs come from: a chart booklet, bound at the top, open at its page of danger signs.
 * It has two leaves because the rule has two cases. The top leaf is for a baby known to
 * be under two months old and prints all ten signs; the leaf under it is for every other
 * age, and for an age that was not given, and prints six. Changing the age turns the
 * leaf. Choosing what the parent wrote ticks the lines the check would mark, and one
 * described sign brings the stamp down on the page.
 *
 * What is scripted, and says so on the page:
 *
 *  - The parent's messages, and which lines each one marks. In the product that reading
 *    is a model's, and it is not reproduced here.
 *  - The page. It is a drawing with agents-core's wording on it, not a WHO chart.
 *
 * What is real:
 *
 *  - Which lines a leaf prints and whether the stamp lands: both come from
 *    `countingSigns` in `app/lib/child.ts`, mirrored from agents-core and pinned by a
 *    test. A leaf prints exactly the signs that can count at its age.
 *  - Every sign's wording and the four age bands, from the same file.
 *
 * The messages were chosen so that none teaches a parent to wait, and the check below
 * `CASES` keeps it that way: a message is only offered on a leaf that prints every line
 * it marks, so no leaf can show a described sign going unstamped. The one message that
 * leaves the page unstamped is a child said to be drinking and playing as usual, and it
 * is not offered for a baby under two months.
 */

type Leaf = "young" | "any";
type Reading = "present" | "absent";

const ALL = DANGER_SIGNS.map((s) => s.key);

/* The four bands sort onto two leaves. The rule gives the three bands that are not
   "under two months" the same six signs, so they share one. */
const LEAVES: Record<Leaf, { tab: string; signs: DangerSign[] }> = {
  young: { tab: "Up to 2 months", signs: countingSigns(ALL, "under_2_months") },
  any: { tab: "Any other age", signs: countingSigns(ALL, "not_stated") },
};
const leafOf = (band: AgeBand): Leaf => (band === "under_2_months" ? "young" : "any");
const bandLabel = (band: AgeBand) => AGE_BANDS.find((b) => b.key === band)!.label;

interface Case {
  id: string;
  /** The leaves this message is offered on. */
  on: Leaf[];
  says: string;
  /** What the check reads in it. A sign that is not listed was not mentioned. */
  reads: Record<string, Reading>;
  why: string;
}

const CASES: Case[] = [
  {
    id: "feeding",
    on: ["young"],
    says: "She is not feeding well, and she feels hot.",
    reads: { not_feeding_well: "present", fever_or_cold: "present" },
    why: "Two young-infant signs. They count because the baby is known to be under two months old.",
  },
  {
    id: "fit",
    on: ["young", "any"],
    says: "He had a fit this morning.",
    reads: { convulsions: "present" },
    why: "A general danger sign. It counts at any age.",
  },
  {
    id: "breathing",
    on: ["young"],
    says: "He is breathing fast and his chest pulls in.",
    reads: { breathing: "present" },
    why: "A young-infant sign. It counts because the baby is known to be under two months old.",
  },
  {
    id: "sleepy",
    on: ["any"],
    says: "She is very sleepy and hard to wake.",
    reads: { lethargic: "present" },
    why: "A general danger sign. It counts at any age.",
  },
  {
    id: "stools",
    on: ["any"],
    says: "Loose stools since yesterday. He is drinking well and playing as usual.",
    reads: { cannot_drink: "absent" },
    why: "No sign was described, and one was ruled out in the parent's own words. The answer is written from the guidance and still ends with the signs to watch for.",
  },
];

/* A message may only be offered on a leaf that prints every line it marks. That is what
   keeps a described sign from ever being shown without the stamp, so it fails the build
   rather than the page if a case or the sign table is edited out of step. */
for (const c of CASES)
  for (const leaf of c.on)
    for (const key of Object.keys(c.reads))
      if (!LEAVES[leaf].signs.some((s) => s.key === key))
        throw new Error(`SignCheck: "${c.id}" marks "${key}", which the "${leaf}" leaf does not print.`);

/* What the page says about the check beyond the cases. Each is how agents-core behaves:
   the sign check's low bar ("recall first"), `counting_signs`, the unchecked branch of
   `_override`, and the answer's own `urgent` flag. */
const FACTS = [
  {
    head: "It leans toward counting",
    body: "When it is unsure whether your words describe a sign, it counts it. A sign can only add urgency, never remove it.",
  },
  {
    head: "Age changes four of the ten",
    body: "Four signs count only when the child is known to be under two months old. The other six count at any age.",
  },
  {
    head: "If the check cannot run",
    body: "The whole list of signs is printed at the top of the answer instead, for you to check yourself.",
  },
  {
    head: "The answer can raise it too",
    body: "If the written answer is itself marked urgent, the same banner goes above it.",
  },
];

const RINGS = 13;
const STEP = 0.4;
/* A leaf is heavy at both ends of its turn, so it eases in as well as out. */
const TURN = [0.45, 0, 0.2, 1] as const;

/* The top leaf turns up and over the binding, towards the reader, and is gone once it
   is past edge-on (its back is never drawn). */
const FLIP = {
  flat: {
    rotateX: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: TURN, opacity: { duration: 0.2 } },
  },
  over: {
    rotateX: 108,
    opacity: 0,
    transition: { duration: 0.8, ease: TURN, opacity: { duration: 0.25, delay: 0.5 } },
  },
};

/* The stamp comes down faster than it started, the way a hand brings one down. */
const STAMP = {
  up: { opacity: 0, scale: 2.1, rotate: -15 },
  down: (delay: number) => ({
    opacity: 1,
    scale: 1,
    rotate: -6,
    transition: { duration: 0.22, ease: [0.5, 0, 0.9, 0.4] as const, delay },
  }),
  gone: { opacity: 0, transition: { duration: 0.18 } },
};

/** One leaf of the booklet. `reads` is empty on the leaf that is not open. */
function Page({
  leaf,
  age,
  run,
  reads,
  stamped,
  at,
  after,
  onLand,
}: {
  leaf: Leaf;
  age: string;
  /** Changes with every message picked, so its marks are made again. */
  run: string;
  reads: Record<string, Reading>;
  stamped: boolean;
  at: (key: string) => number;
  after: number;
  onLand: () => void;
}) {
  const { tab, signs } = LEAVES[leaf];
  const general = signs.filter((s) => !s.youngInfantOnly);
  const young = signs.filter((s) => s.youngInfantOnly);

  const row = (s: DangerSign) => {
    const r = reads[s.key];
    return (
      <li key={s.key} className="bk-row">
        <span className="bk-box" key={r ? `box:${run}` : "box"} aria-hidden>
          {r === "present" && (
            <motion.i
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.25, ease: EASE, delay: at(s.key) }}
            />
          )}
          {r && (
            <svg viewBox="0 0 16 16">
              <motion.path
                d={r === "present" ? "M3.6 8.4l3 3 5.8-6.8" : "M4 8h8"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, ease: EASE, delay: at(s.key) + 0.1 }}
              />
            </svg>
          )}
        </span>
        {/* A described sign is run over with the marker, a ruled-out one is struck
            through, and neither changes how the line wraps: the page must not move
            under the reader as it is marked. */}
        {r === "present" ? (
          <motion.mark
            key={`mark:${run}`}
            initial={{ backgroundSize: "0% 100%" }}
            animate={{ backgroundSize: "100% 100%" }}
            transition={{ duration: 0.45, ease: EASE, delay: at(s.key) + 0.1 }}
          >
            {s.text}
          </motion.mark>
        ) : (
          <span data-read={r}>{s.text}</span>
        )}
      </li>
    );
  };

  return (
    <>
      <div className="bk-head">
        <span className="bk-title">Danger signs</span>
        <div className="bk-slot">
          <span>Above the answer</span>
          <AnimatePresence>
            {stamped && (
              <motion.b
                key={run}
                className="bk-stamp"
                variants={STAMP}
                custom={after}
                initial="up"
                animate="down"
                exit="gone"
                onAnimationComplete={(d) => d === "down" && onLand()}
              >
                Hospital now
              </motion.b>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="bk-age">
        <span>Child&apos;s age</span>
        <b>{age}</b>
      </p>

      <div>
        <div className="bk-cols">
          <span>Sign</span>
          <span className="bk-key">
            <i data-read="present" />
            described
            <i data-read="absent" />
            ruled out
            <i />
            not mentioned
          </span>
        </div>
        <ul className="bk-rows">{general.map(row)}</ul>
        {young.length > 0 && (
          <>
            <p className="bk-group">Young infants only</p>
            <ul className="bk-rows">{young.map(row)}</ul>
          </>
        )}
      </div>

      {young.length === 0 && (
        <p className="bk-more">
          Four more signs are on the young-infant page. They count when the child is known to
          be under two months old. Fever and fast or difficult breathing are still on the list
          every answer ends with.
        </p>
      )}

      <p className="bk-foot">One described sign is enough for the stamp.</p>
      <span className="bk-tab" aria-hidden>
        {tab}
      </span>
    </>
  );
}

export function SignCheck() {
  const still = useStillness();
  const stage = useRef<HTMLDivElement>(null);
  // Nothing is marked until the booklet is on screen, so the first stamp is seen landing.
  const seen = useInView(stage, { once: true, margin: "0px 0px -30% 0px" });
  const [leaves, animate] = useAnimate<HTMLDivElement>();

  const [band, setBand] = useState<AgeBand>("under_2_months");
  /* The lower leaf keeps the age last written on it while the top one covers it. */
  const [anyBand, setAnyBand] = useState<AgeBand>("2_months_to_5_years");
  const [caseId, setCaseId] = useState("feeding");
  const [turned, setTurned] = useState(false);

  const leaf = leafOf(band);
  const c = CASES.find((k) => k.id === caseId)!;
  const present = Object.keys(c.reads).filter((k) => c.reads[k] === "present");
  const banner = countingSigns(present, band).length > 0;
  const run = `${leaf}:${c.id}`;

  // The marks are made one after another down the page and the stamp waits for the
  // last. After a turn they also wait for the leaf to settle. A reader who asked for
  // reduced motion gets all of it at once.
  const marked = LEAVES[leaf].signs.filter((s) => s.key in c.reads).map((s) => s.key);
  const base = turned ? 0.9 : 0.2;
  const at = (key: string) => (still ? 0 : base + marked.indexOf(key) * STEP);
  const after = still ? 0 : base + marked.length * STEP;

  const setAge = (next: AgeBand) => {
    const to = leafOf(next);
    // A message that is not on the new leaf gives way to that leaf's first one. The fit
    // is on both, so it stays, and the stamp lands again: it counts at any age.
    if (!c.on.includes(to)) setCaseId(CASES.find((k) => k.on.includes(to))!.id);
    if (to === "any") setAnyBand(next);
    setTurned(to !== leaf);
    setBand(next);
  };
  const say = (id: string) => {
    setTurned(false);
    setCaseId(id);
  };
  // The page takes the blow.
  const land = () => {
    if (!still && leaves.current)
      animate(leaves.current, { y: [0, 5, 0] }, { duration: 0.34, ease: "easeOut" });
  };

  const page = (which: Leaf) => {
    const open = seen && which === leaf;
    return (
      <Page
        leaf={which}
        age={bandLabel(which === "young" ? "under_2_months" : anyBand)}
        run={run}
        reads={open ? c.reads : {}}
        stamped={open && banner}
        at={at}
        after={after}
        onLand={land}
      />
    );
  };

  return (
    <section className="sec wrap f-ink" data-field="dark" id="signs">
      <div className="sec-head">
        <Lines lines={["The danger signs", "come first."]} />
        <Rise delay={0.1}>
          <p className="lede dim">
            Before an answer is written, your own words are read for the child&apos;s age and
            for the danger signs that count at that age. Set the age, choose what the parent
            wrote, and watch the page.
          </p>
        </Rise>
      </div>

      <div className="model ctl-first">
        <div className="model-stage" ref={stage}>
          <figure
            className="bk"
            aria-label={`A drawn booklet page of danger signs, open at: ${LEAVES[leaf].tab}. ${
              banner ? "Stamped: hospital now." : "Not stamped."
            }`}
          >
            <div className="bk-leaves" ref={leaves}>
              <div className="bk-leaf any" aria-hidden={leaf !== "any"}>
                {page("any")}
              </div>
              <motion.div
                className="bk-leaf young"
                aria-hidden={leaf !== "young"}
                variants={FLIP}
                initial={false}
                animate={leaf === "young" ? "flat" : "over"}
                style={{ transformPerspective: 2200, transformOrigin: "50% 0%" }}
              >
                {page("young")}
              </motion.div>
              <div className="bk-rings" aria-hidden>
                {Array.from({ length: RINGS }, (_, n) => (
                  <i key={n} />
                ))}
              </div>
            </div>
          </figure>
          <p className="mono-s rx-note">
            Scripted: the messages, and the lines each one marks. The page is a drawing, not a
            WHO chart. The rule that stamps it is the real one.
          </p>
        </div>

        <div className="model-card">
          <div>
            <p className="term-k mono-s">The child&apos;s age</p>
            <div className="pills" role="group" aria-label="The child's age">
              {AGE_BANDS.map((b) => (
                <button
                  key={b.key}
                  className="pill"
                  aria-pressed={b.key === band}
                  onClick={() => setAge(b.key)}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="term-k mono-s">The parent wrote</p>
            <div className="said" role="group" aria-label="The parent's message">
              {CASES.filter((k) => k.on.includes(leaf)).map((k) => (
                <button key={k.id} aria-pressed={k.id === c.id} onClick={() => say(k.id)}>
                  “{k.says}”
                </button>
              ))}
            </div>
          </div>

          <div aria-live="polite">
            <p className="term-k mono-s">What goes above the answer</p>
            <motion.div
              key={run}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE, delay: after }}
            >
              <p className="model-says">{banner ? "The hospital, first." : "Nothing."}</p>
              <p className="read-why">
                {c.why}
                {banner && band === "not_stated" && " No age was given, and that changes nothing here."}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <dl className="model-facts">
        {FACTS.map((f, n) => (
          <Rise key={f.head} delay={n * 0.05}>
            <dt>{f.head}</dt>
            <dd>{f.body}</dd>
          </Rise>
        ))}
      </dl>
    </section>
  );
}
