/* ── The guardian's decision table. ──
 *
 * The most credible thing the system owns. Every other medical assistant asks
 * you to trust its judgement; this one publishes the rules that outrank its
 * judgement. These are product claims of the same standing as `levels.ts` —
 * every entry is a real branch that really runs. Edit the wording only if the
 * guardian's behaviour actually changed.
 *
 * ── On having become a grid. ──
 *
 * This was a three-column table, and a table was the honest shape for it: one
 * row per rule, a level column you could run your eye down, and the whole set
 * legible in one glance. A grid of cards gives that up, so it has to pay for
 * what it took:
 *
 *  - `order` is not decorative. The rules are evaluated in this sequence and the
 *    cards are laid out in it, so reading order is still evaluation order.
 *  - Every card prints its level explicitly — colour, number and lamp — because
 *    that is the one fact from the old level column that cannot be allowed to
 *    become an inference.
 *
 * Cell width is deliberately *not* one of those payments. Sizing cells by level
 * was tried and abandoned: it reads as "these rules matter more", which is false
 * — the guardian applies all eight, and a Level 1 rule firing is exactly as
 * binding as a Level 3 one firing. Width is now visual rhythm and nothing else,
 * and it lives in `RHYTHM` below, keyed by position rather than by severity so
 * it cannot accidentally start meaning something.
 *
 * If a future edit breaks reading order or drops a level from a card, the table
 * was the better design and this should go back to being one.
 */

export interface Rule {
  /** The condition, as the guardian tests it. */
  when: string;
  /** The level it forces. Drives the pill, the colour and the cell width. */
  then: 1 | 2 | 3;
  /** Why, in the patient's terms rather than the implementation's. */
  note: string;
  /** Filename under /public/rules. */
  plate: string;
  /** What the plate shows, for anyone the image cannot reach. */
  alt: string;
}

/* Cell width by position in the grid, carrying rhythm and no meaning. See the
   header note for why it is not keyed to level.

   The pattern has to tile a three-column grid exactly: each pair sums to three,
   so every row fills. Get that wrong — four wide cells in a row, say — and each
   one claims two columns, fails to fit a neighbour, and wraps, leaving a dead
   column beside every one of them. Any edit here must keep consecutive entries
   summing to 3. */
const RHYTHM = [2, 1, 1, 2, 2, 1, 1, 2] as const;

export function span(i: number): string {
  return RHYTHM[i % RHYTHM.length] === 2
    ? "md:col-span-2"
    : "md:col-span-1";
}

/** How fast the pill's lamp breathes. Urgency, in a third channel alongside the
 *  colour and the number — so the pulse is information, not ornament. */
export const PULSE: Record<1 | 2 | 3, string> = {
  3: "1.5s",
  2: "2.6s",
  1: "4.2s",
};

export const RULES: Rule[] = [
  {
    when: "An emergency is detected",
    then: 3,
    note: "Chest pain, breathing trouble, stroke signs, bleeding, overdose, self-harm. When in doubt the system calls it an emergency — a false alarm is cheaper than a missed one.",
    plate: "emergency.jpg",
    alt: "An ambulance at night on an empty street, its beacons lit.",
  },
  {
    when: "The safety review escalates",
    then: 3,
    note: "A hallucinated claim, an unresolvable conflict between sources, or an unsafe recommendation.",
    plate: "escalate.jpg",
    alt: "A crash cart standing alone in a dark hospital corridor.",
  },
  {
    when: "Safety risk is high",
    then: 3,
    note: "Including anything that contradicts a recorded allergy or interacts with a recorded medication.",
    plate: "interaction.jpg",
    alt: "Two intravenous bags on one stand, their lines converging into a single tube.",
  },
  {
    when: "Confidence falls below 30%",
    then: 3,
    note: "A diagnosis nobody is confident in does not go to a patient.",
    plate: "confidence.jpg",
    alt: "A monitor in a dark room showing a trace that falters and breaks up.",
  },
  {
    when: "The answer names a drug or a dose",
    then: 2,
    note: "No prescription reaches a patient without a doctor. There is no exception to this one.",
    plate: "dose.jpg",
    alt: "Blister sheets of tablets on a dark surface, some pockets empty.",
  },
  {
    when: "The answer asks for a test, lab or scan",
    then: 2,
    note: "Ordering investigations is a clinical act.",
    plate: "investigate.jpg",
    alt: "A laboratory centrifuge, lid open, sample tubes in the rotor.",
  },
  {
    when: "The sources needed a second look",
    then: 2,
    note: "Thin evidence gets re-retrieved once, and the case is held regardless of what comes back.",
    plate: "recheck.jpg",
    alt: "A stack of reference volumes under a desk lamp, one lying open.",
  },
  {
    when: "The system is asking you a question",
    then: 1,
    note: "Requests for clarification are not diagnoses, so they are not held.",
    plate: "clarify.jpg",
    alt: "An empty chair beside a clinic window in early morning light.",
  },
];
