/* ── Child-health mode's fixed text, for the mode page's diagram. ──
 *
 * Copied from agents-core (`app/services/child_health_content.py` and the child signs in
 * `followup_content.py`) so the diagram on `/child` shows the real wording. Display
 * only: in a real answer every one of these arrives from the backend inside `child`,
 * and whether the hospital banner appears is decided there, never here.
 */

export const OVERRIDE_TEXT =
  "Go to the nearest hospital or emergency department now. What you describe can be a sign of serious illness in a child.";

export const GENERAL_LABEL = "General information, not from the WHO/IMNCI guidelines:";

export const WATCH_FOR = [
  "Your child is not able to drink or breastfeed",
  "Your child becomes sicker",
  "Your child develops a fever",
  "Your child is breathing fast",
  "Your child has difficulty breathing",
];
