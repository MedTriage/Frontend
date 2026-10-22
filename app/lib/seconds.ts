/* ── What happens in between. ──
 *
 * The rest of the About page is static: rules that hold, parts that exist,
 * failures that are always available. This is the one claim on it that is
 * *temporal* — four things that happen in order while you wait — which is the
 * only reason the section moves at all. Motion here is the argument, not
 * atmosphere.
 *
 * The copy is a product claim with the same standing as `levels.ts` and
 * `limits.ts`. Every phase restates something the page has already established
 * — the record, the three parallel sources, reconciliation on the evidence, and
 * the level being set last — in the order a single consultation actually
 * performs them. Edit the wording only if the pipeline's behaviour changed.
 *
 * Deliberately none of these names a component. The Parts section above already
 * introduces the router, the reconciler and the guardian by name; naming them
 * again over a photograph would turn an argument about *your wait* into an
 * architecture diagram. This section is written from the patient's side of the
 * spinner.
 *
 * Behind these runs one continuous shot — a monitor trace that starts as a
 * single signal, separates into three, falls out of agreement, and resolves back
 * into one. That arc is the section's argument in pictures alone: one question
 * in, three sources, disagreement, one answer out. The four phases are named for
 * its four movements and must stay in that order.
 *
 * They are not, however, locked to it. The video loops on its own clock and the
 * phases advance on theirs, so after the first pass the copy and the picture
 * drift apart. That is a deliberate trade: a field that stutters to a halt every
 * six seconds looks broken, and a live monitor that keeps running is worth more
 * than literal correspondence between a sentence and a waveform.
 *
 * `still` is each phase's moment as a frame, for readers who never get the
 * video. They are pulled straight out of `signal.mp4`, so re-cutting the video
 * means re-cutting these — see the ffmpeg line in the section's own comment.
 */

export interface Phase {
  /** The headline. All a collapsed row shows, so it has to stand alone. */
  head: string;
  /** The rest of the phase, revealed when the row opens. */
  body: string;
  /** Filename under /public/motion: the moment of `signal.mp4` this phase
   *  corresponds to, as a single frame. Only ever seen when the video is not
   *  playing — reduced motion, a decode failure, no JavaScript — but in those
   *  cases it is the whole picture, so it still has to be the right moment. */
  still: string;
}

export const PHASES: Phase[] = [
  {
    head: "The question arrives",
    body: "It is read once, in the light of everything you have said before — what you have told the system you have, what you take, and what you are allergic to.",
    still: "signal-1.jpg",
  },
  {
    head: "Three sources, at once",
    body: "Clinical guidelines, a map of related conditions, and live lookups in drug labelling and the literature. They are queried in parallel rather than in turn, which is why the wait is the slowest of the three and not the sum of them.",
    still: "signal-2.jpg",
  },
  {
    head: "They disagree",
    body: "They frequently do. Disagreement is settled on the evidence rather than by majority, every claim is checked back against the source it came from, and a source that came back thin is sent to look again.",
    still: "signal-3.jpg",
  },
  {
    head: "A level is set",
    body: "How far the system was allowed to answer on its own is decided last, by the rules published above — not by the model, and not by anything the model wrote.",
    still: "signal-4.jpg",
  },
];
