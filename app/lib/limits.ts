/* ── The honest list. ──
 *
 * The most persuasive page on a medical site is the one that says what it can't
 * do, so these are product claims and not placeholder copy — the same standing as
 * `levels.ts`. Edit the wording only if the system's behaviour actually changed.
 *
 * Each limit is split rather than rewritten: `head` is what a collapsed row shows
 * and `body` is the rest of the original sentence. Reading `head` + `body` back
 * together should give you the limit as it was always written.
 *
 * Each also carries a plate. The plates are one visual family — instruments and
 * print, things a clinic or a library actually contains — because five unrelated
 * photographs would read as stock photography, which is the one thing the design
 * system rules out. None of them is decoration: each is the thing its own limit is
 * about.
 *
 * `grain`, `contrast` and `brightness` are per-plate because the dither is
 * destructive and every photograph fails it differently. They were tuned against
 * the actual assets — a page of handwriting needs nearly twice the contrast of a
 * clock dial before it survives thresholding at all. Don't guess at them; re-tune
 * against the image.
 */

export interface Limit {
  /** The headline. All a collapsed row shows, so it has to stand alone. */
  head: string;
  /** The remainder of the limit, revealed when the row opens. */
  body: string;
  /** Filename under /public/plates. */
  plate: string;
  /** Where this plate's dither settles.
   *
   *  Lower is finer. Four is legible; eight is not, and only the images limit is
   *  set there — that plate is *supposed* to stop being readable, because the
   *  reader failing on it is the argument. Everywhere else illegibility would say
   *  something false, so those settle where the subject still reads. */
  grain: number;
  contrast: number;
  brightness: number;
  /** A one-line caption, set in the label face beneath the plate. */
  caption: string;
  /** What the plate shows, for anyone the canvas cannot reach. */
  alt: string;
  /** Provenance. All five are Creative Commons or public domain; the CC BY ones
   *  carry an attribution requirement that this records but the page does not yet
   *  print. That needs settling before anything ships. */
  credit: string;
}

export const LIMITS: Limit[] = [
  {
    head: "It is not a medical device",
    body: "This is a research system. It is not a diagnosis, and it is not a substitute for seeing a doctor.",
    plate: "microscope.jpg",
    grain: 4,
    contrast: 1.15,
    brightness: 0,
    caption: "Microscope",
    alt: "A laboratory microscope, rendered as ordered dither.",
    credit: "Shixart1985, CC BY 2.0, via Wikimedia Commons",
  },
  {
    head: "It cannot look at images",
    body: "No rashes, no scans, no photographs.",
    plate: "eye.jpg",
    grain: 8,
    contrast: 1.2,
    brightness: 0.02,
    caption: "Human eye",
    alt: "A human eye in close-up, coarsened until it stops being readable.",
    credit: "Liam Welch, CC0, via Wikimedia Commons",
  },
  {
    head: "A Level 2 answer waits on a human",
    body: "A real human being has to look at it, and humans are not instant.",
    plate: "clock.jpg",
    grain: 4,
    contrast: 1.3,
    brightness: 0,
    caption: "Station clock",
    alt: "A lit station clock face in darkness, rendered as ordered dither.",
    credit: "Fitzwilliam2020, CC BY-SA 4.0, via Wikimedia Commons",
  },
  {
    head: "The condition map needs a licence",
    body: "The map of related conditions needs a licensed terminology release. Where that is unavailable, that source reports nothing and says so.",
    plate: "index.jpg",
    grain: 4,
    contrast: 1.45,
    brightness: -0.02,
    caption: "Card catalogue",
    alt: "Rows of labelled card-catalogue drawers, rendered as ordered dither.",
    credit: "Paul Joseph, CC BY 2.0, via Wikimedia Commons",
  },
  {
    head: "The model can still be wrong",
    body: "The rules bound how much damage a wrong answer is allowed to do. They do not make the model right.",
    plate: "proof.jpg",
    grain: 3,
    contrast: 2,
    brightness: -0.2,
    caption: "Corrected proof",
    alt: "A printed proof sheet covered in handwritten ink corrections.",
    credit: "Stéphane Mallarmé, public domain, via Wikimedia Commons",
  },
];
