/* ── The scale. Autonomy falls as risk rises; oversight takes its place. ──
 *
 * One source of truth: the ledger panel in the hero and the level scale further
 * down both render these, and the copy is the product's central claim. Two copies
 * of it would eventually disagree.
 *
 * `ai` and `md` are the split the autonomy field draws — they must always sum to 100. */

export const LEVELS = [
  {
    level: 1,
    name: "Answered directly",
    ai: 100,
    md: 0,
    tone: "t1",
    holds: "The system answers you itself.",
    detail:
      "General health questions and conversation. Nothing is diagnosed, nothing is prescribed, and no one is waiting on it.",
  },
  {
    level: 2,
    name: "Held for a doctor",
    ai: 50,
    md: 50,
    tone: "t2",
    holds: "A clinician signs it off before you read it.",
    detail:
      "Anything that names a condition, recommends a test, or reaches for a drug. The assessment is drafted, held, and released only once a clinician approves it.",
  },
  {
    level: 3,
    name: "Sent straight to care",
    ai: 0,
    md: 100,
    tone: "t3",
    holds: "The AI stops talking.",
    detail:
      "Life-threatening presentations. The model is locked out of the conversation for the rest of the session and you are directed to emergency services.",
  },
] as const;
