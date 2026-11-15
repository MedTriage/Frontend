/* ── Child-health mode's fixed text, for the mode page's diagram. ──
 *
 * Copied from agents-core (`app/services/child_health_content.py` and the child signs in
 * `followup_content.py`) so the diagram on `/child` shows the real wording. Display
 * only: in a real answer every one of these arrives from the backend inside `child`,
 * and whether the hospital banner appears is decided there, never here.
 */

export const OVERRIDE_TEXT =
  "Call 112 or go to the nearest hospital or emergency department now. What you describe can be a sign of serious illness in a child.";

export const GENERAL_LABEL = "General information, not from the WHO/IMNCI guidelines:";

export const WATCH_FOR = [
  "Your child is not able to drink or breastfeed",
  "Your child becomes sicker",
  "Your child develops a fever",
  "Your child is breathing fast",
  "Your child has difficulty breathing",
];

/* ── The danger signs, and the one rule about them. ──
 *
 * `DANGER_SIGNS` is agents-core's table of the same name
 * (`app/services/child_health_content.py`), wording and order kept: the six WHO general
 * signs, which count at any age, then the four young-infant signs. `AGE_BANDS` are the
 * four bands its sign check sorts a child into (`child_signs_node.py`).
 *
 * `countingSigns` mirrors `counting_signs` there: a young-infant sign calls for hospital
 * only when the child is known to be under two months. The working model on `/child`
 * (`site/SignCheck.tsx`) runs on it, and `tests/child.test.mts` pins it, so the page
 * cannot quietly show a different rule from the one the backend applies. In a real
 * answer none of this runs in the browser: whether the banner appears arrives decided.
 */
export interface DangerSign {
  key: string;
  text: string;
  youngInfantOnly: boolean;
}

export const DANGER_SIGNS: DangerSign[] = [
  { key: "cannot_drink", text: "Not able to drink or breastfeed", youngInfantOnly: false },
  { key: "vomits_everything", text: "Vomits everything", youngInfantOnly: false },
  {
    key: "convulsions",
    text: "Has had a fit (convulsion), or is having one now",
    youngInfantOnly: false,
  },
  {
    key: "lethargic",
    text: "Unusually sleepy, floppy or hard to wake, or unconscious",
    youngInfantOnly: false,
  },
  { key: "stiff_neck", text: "A stiff neck, with a fever", youngInfantOnly: false },
  { key: "stridor", text: "A harsh noise when breathing in, while calm", youngInfantOnly: false },
  { key: "not_feeding_well", text: "Not feeding well", youngInfantOnly: true },
  { key: "fever_or_cold", text: "A fever, or feels cold to the touch", youngInfantOnly: true },
  {
    key: "breathing",
    text: "Breathing fast or with difficulty, or the chest pulling in",
    youngInfantOnly: true,
  },
  {
    key: "little_movement",
    text: "Moves only when touched or picked up, or not at all",
    youngInfantOnly: true,
  },
];

export type AgeBand = "under_2_months" | "2_months_to_5_years" | "over_5_years" | "not_stated";

export const AGE_BANDS: { key: AgeBand; label: string }[] = [
  { key: "under_2_months", label: "Under 2 months" },
  { key: "2_months_to_5_years", label: "2 months to 5 years" },
  { key: "over_5_years", label: "Over 5 years" },
  { key: "not_stated", label: "Not stated" },
];

/** The described signs that put "go to hospital now" above the answer at this age. */
export function countingSigns(present: string[], band: AgeBand): DangerSign[] {
  return DANGER_SIGNS.filter(
    (s) => present.includes(s.key) && (!s.youngInfantOnly || band === "under_2_months")
  );
}
