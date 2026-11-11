/* ── Follow-up, as the About page shows it. ──
 *
 * A mirror of two things in agents-core, for display only: the schedule in
 * `app/services/followup_content.py` (each complaint's label, usual course and check-in
 * days, taken there from the NICE guideline named here) and the outcome rules in
 * `followup.py`'s `answer_checkin`. Nothing on a real check-in is decided by this file:
 * the backend decides every outcome, and the chat page only renders what it returns.
 * If the backend's schedule or rules change, change this to match, or the page lies.
 */

export interface Complaint {
  label: string;
  /** NICE's wording for how long it usually lasts; null where no guideline matched. */
  course: string | null;
  /** Days after the answer on which a check-in opens. The last is the day by which
   *  NICE says it should have started to improve. */
  days: readonly number[];
  guide: string | null;
}

export const COMPLAINTS: Complaint[] = [
  { label: "Sore throat", course: "usually lasts about 1 week", days: [3, 7], guide: "NICE NG84" },
  { label: "Ear infection", course: "usually lasts about 3 days, sometimes up to 1 week", days: [3, 7], guide: "NICE NG91" },
  { label: "Sinusitis", course: "usually lasts 2 to 3 weeks", days: [7, 21], guide: "NICE NG79" },
  { label: "Cough", course: "usually lasts up to 3 or 4 weeks", days: [21], guide: "NICE NG120" },
  { label: "Urinary infection", course: "should start to improve within 48 hours", days: [2], guide: "NICE NG109" },
  // Anything the complaint classifier cannot place with confidence gets this schedule.
  { label: "Anything else", course: null, days: [3, 7], guide: null },
];

export type Answer = "better" | "same" | "worse" | "sign" | "silent";

export interface Outcome {
  head: string;
  body: string;
  /** The triage level the outcome involves, when it involves one. Drives the colour,
   *  and nothing is coloured that has no level. */
  level: 2 | 3 | null;
  /** The day of the next check-in, when the episode carries on. */
  next: number | null;
}

/** What follows an answer to the check-in at index `at` of `days`. */
export function outcome(answer: Answer, days: readonly number[], at: number): Outcome {
  const last = at >= days.length - 1;
  switch (answer) {
    case "better":
      return {
        head: "Resolved.",
        body: "The episode closes, and the exchange is written into your conversation.",
        level: null,
        next: null,
      };
    case "same":
      return last
        ? {
            head: "A doctor is brought in.",
            body: "This was the last check-in, the day by which it should have started to improve. A case is opened for a doctor.",
            level: 2,
            next: null,
          }
        : {
            head: "Still watched.",
            body: `Nothing changes yet. The next check-in opens on day ${days[at + 1]}.`,
            level: null,
            next: days[at + 1],
          };
    case "worse":
      return {
        head: "Looked at again.",
        body: "Your next message is triaged afresh and cannot come back below Level 2: a doctor sees it, whatever the model makes of it.",
        level: 2,
        next: null,
      };
    case "sign":
      return {
        head: "Go now.",
        body: "An urgent sign means urgent advice at once, and the conversation is locked. A less urgent sign opens a case for a doctor instead.",
        level: 3,
        next: null,
      };
    case "silent":
      return {
        head: "Not taken as good news.",
        body: "A reminder goes out after 24 hours. After another 24 the episode is marked lapsed, and if a doctor approved the original answer, they are told.",
        level: null,
        next: null,
      };
  }
}
