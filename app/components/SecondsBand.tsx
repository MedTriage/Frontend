"use client";

/**
 * What happens in between — the wait, as the thing itself.
 *
 * Everything else on the About page is a standing fact: rules that hold, parts
 * that exist, failures that are always available. A table is the right shape for
 * all of it. This section is the one claim on the page with a *clock* in it —
 * four things that happen in order while you sit looking at a spinner — and a
 * table cannot say "in order, and this part is the slow one". So this one moves,
 * and it is the only section that earns the right to.
 *
 * The field is one continuous shot of a monitor trace: it runs as one signal,
 * separates into three, falls out of agreement, and resolves back into one. That
 * is the pipeline's shape rather than an illustration of it — one question in,
 * three sources queried at once, disagreement, one answer out — which is why the
 * phases cannot be reordered and why the last one is where the section rests.
 *
 * ── Two clocks. ──
 *
 * An earlier build cut the video into four segments and made each phase seek to
 * its own, hold on the last frame, and wait. It was tighter but it looked wrong:
 * a monitor that freezes every few seconds reads as a stalled page, not as an
 * instrument. So the video simply runs and loops on its own clock, the phases
 * advance on theirs, and the two drift apart after the first pass.
 *
 * That drift is the deliberate cost. The band is a living field the section is
 * spoken over, not a slideshow synchronised to the copy — and nothing in the
 * copy claims otherwise, which is what makes it payable. If a future edit ever
 * needs them locked together again, the section is the thing to change: the
 * video is 9.2s and four phases are 24s, so they can only agree by slowing the
 * trace to a third speed or by cutting the dwell to under two and a half seconds
 * — and neither an ECG at 0.38× nor body copy with two seconds to read it is
 * worth the synchronisation.
 *
 * It runs start to finish and loops, and it is never paused by the page. An
 * earlier build stopped it whenever the section left the viewport, to save
 * decoding it offscreen; that was measured in battery and paid for in the thing
 * the section is for, because a trace resumed from wherever it happened to stop
 * is not the arc — it is a fragment. Browsers already throttle offscreen video
 * on their own, and this is nine seconds at 720p, so the saving was small and
 * the cost was the whole idea.
 *
 * The stills in `seconds.ts` are frames cut from the same file, and they are what
 * the section falls back to when the video cannot or should not play — reduced
 * motion, a decode failure, no JavaScript. Re-cutting the video means re-cutting
 * them:
 *
 *     ffmpeg -ss <t> -i public/motion/signal.mp4 -frames:v 1 -q:v 4 out.jpg
 *
 * ── Why this is a row and not a stack. ──
 *
 * `LevelScale` and `LimitScale` are both vertical accordions, and a third would
 * have been the fastest thing to write. But those two are *catalogues* — three
 * levels, five limits, no inherent order — and a stack is right for a catalogue.
 * This is a sequence with a direction, so it is laid out along one: four steps
 * left to right, each with a rail that fills, and the rails behind the current
 * step stay filled so the row reads as distance covered rather than as four
 * independent items. Same dwell mechanism, different instrument, because the
 * content is a different shape.
 *
 * ── It stops. ──
 *
 * The other real departure. Those two loop forever, which is honest for a list
 * with no last item. This one ends: the whole argument is that the wait
 * terminates in a decision, so a band that slid back to "the question arrives"
 * every twenty-four seconds would contradict the section it belongs to.
 * `advance` clamps instead of wrapping, and once the fourth rail is filled
 * nothing further runs. The stillness at the end is the last beat, not the
 * animation having finished.
 *
 * Arriving back at a finished band later is deliberate too: it is not reset on
 * scroll-out. Re-running it is one click, and a section that silently rewound
 * itself behind you would be a second, unasked-for motion.
 */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PHASES } from "../lib/seconds";
import { useStillness } from "../lib/useStillness";

/** Matching the other two scales. Longer than it looks — the middle two phases
 *  run to three lines. */
const DWELL = "6s";

const LAST = PHASES.length - 1;

export function SecondsBand() {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false); // pointer or focus is on the sequence
  const [inView, setInView] = useState(false);
  const [touched, setTouched] = useState(false); // a step has been clicked
  const [videoDead, setVideoDead] = useState(false); // decode or network failed
  const still = useStillness();
  const seq = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  /* Stillness lands the sequence in its *finished* state — every rail filled,
     the answer resolved — for the same reason `globals.css` gives about
     `.strike` and `.edge-draw`: the frame that has to survive reduced motion is
     the last one, because the first one asserts that nothing has happened yet.
     All four bodies are printed at once instead of one at a time, so nobody has
     to click to read the section. A click still takes over from there. */
  const shown = still && !touched ? LAST : active;

  // Same contract as the other two scales: the rail runs only while the section
  // is on screen and nobody is reading it. WCAG 2.2.2 wants a way to stop
  // auto-advancing content; hover and focus are that way, and reduced motion
  // opts out of it entirely.
  const running = inView && !held && !still;

  useEffect(() => {
    const el = seq.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setInView(entries[0].isIntersecting),
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* A nudge, not a controller.

     `autoPlay` on the element does the work in every browser that allows it; this
     only covers the case where the attribute is honoured late or not at all — a
     tab restored from bfcache, a decode that finished after hydration — by asking
     once from the start. It never pauses and never seeks, so the clip always runs
     the full arc and loops. Muted and silent is what makes it autoplay-eligible.

     The rejection is swallowed on purpose: `play()` rejects whenever the browser
     declines, and an unhandled rejection here is a console error on every mount
     for a purely decorative video. If it is genuinely refused, the stills
     underneath are already showing the right frame, so there is nothing to
     recover from. */
  useEffect(() => {
    const el = video.current;
    if (!el || videoDead || still) return;
    el.currentTime = 0;
    void el.play().catch(() => {});
  }, [videoDead, still]);

  /* Clamped, not wrapped. See the header note — this is a sequence with an end,
     and the end is the point. */
  const advance = () => setActive((i) => Math.min(i + 1, LAST));

  const select = (i: number) => {
    setTouched(true);
    setActive(i);
  };

  return (
    <section className="band-dark relative overflow-hidden border-b border-border bg-background text-foreground">
      {/* ── The field ──
          Decorative in the accessibility sense: every claim the footage carries
          is written out in the sequence below, so an empty alt is the honest
          value. The video element carries no caption track for the same reason —
          it is silent and says nothing the copy does not. */}
      <div aria-hidden className="absolute inset-0">
        {/* The still for the current phase sits underneath the video at all
            times. It is the poster before the first frame decodes, the whole
            picture under reduced motion or after a decode failure, and it is
            what a reader with JavaScript off is left with — so it is a plain
            <img> layer rather than something the video swaps in on error. */}
        {PHASES.map((p, i) => (
          <div
            key={p.still}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === shown ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={`/motion/${p.still}`}
              alt=""
              fill
              sizes="100vw"
              priority={i === 0}
              className="object-cover"
            />
          </div>
        ))}

        {/* `playsInline` stops iOS taking it fullscreen; `muted` is what makes
            autoplay permissible at all and the file has no audio track anyway.
            `preload="auto"` because it plays unconditionally, so there is nothing
            to be gained by deferring the fetch — better to have it buffered
            before the reader arrives than to have the arc start with a stall. */}
        {!still && !videoDead && (
          <video
            ref={video}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onError={() => setVideoDead(true)}
          >
            <source src="/motion/signal.mp4" type="video/mp4" />
          </video>
        )}

        {/* Two scrims, top and bottom, rather than one flat veil — the type sits
            at the head and foot of the band and the light runs through its
            middle, so dimming the middle would be paying for contrast nowhere
            needs it. The bottom is the heavier of the two: three of the four
            plates are brightest along their lower edge, which is exactly where
            the step row lands. */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-transparent to-transparent" />
      </div>

      {/* ── The account ── */}
      <div className="relative mx-auto flex max-w-[1180px] flex-col px-5 py-20 sm:px-8 sm:py-24 lg:min-h-[780px]">
        <div className="max-w-[54ch]">
          <p className="label mb-4">What happens in between</p>
          <h2 className="display text-[1.9rem] sm:text-[2.4rem]">
            Between the question and the answer.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            Four things, in this order. The slow one is the literature — on a
            cold question that lookup alone can take eleven seconds, which is
            most of what you are waiting for.
          </p>
        </div>

        <div
          ref={seq}
          className="mt-auto pt-20"
          onMouseEnter={() => setHeld(true)}
          onMouseLeave={() => setHeld(false)}
          onFocusCapture={() => setHeld(true)}
          onBlurCapture={() => setHeld(false)}
        >
          {/* One copy slot, above the row, rather than a paragraph per column:
              at four columns each body would set to seven or eight lines and the
              row would stop reading as a row. The slot is floored so the steps
              below it do not jump as the copy changes length. */}
          <div className="min-h-[9.5rem] max-w-[54ch] sm:min-h-[6.5rem]">
            {still ? (
              /* No sequence to reveal them one at a time, so all four are
                 printed. Numbered, because without the rail filling there is
                 nothing else left saying these happen in an order. */
              <div className="space-y-2.5">
                {PHASES.map((p, i) => (
                  <p
                    key={p.still}
                    className="text-[14px] leading-relaxed text-muted"
                  >
                    <span className="label mr-2.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {p.body}
                  </p>
                ))}
              </div>
            ) : (
              <p
                // Remounting on each change replays `rise`, which is the same
                // arrival gesture the rest of this page uses for new copy.
                key={shown}
                className="rise text-[15px] leading-relaxed text-muted"
              >
                {PHASES[shown].body}
              </p>
            )}
          </div>

          {/* An ordered list, not the tablist the other two scales use. There is
              no panel here to control — the plates are decorative and every word
              is already in the row or the slot above it — so `role="tab"` would
              promise a relationship to a region that does not exist. What this
              actually is, an ordered sequence with one current step, is what
              `<ol>` and `aria-current` already say; and buttons in a list are
              natively keyboard-reachable, so there is no roving tabindex to
              maintain either. */}
          <ol className="mt-10 grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-4 sm:gap-6">
            {PHASES.map((p, i) => {
              const on = i === shown;
              // Filled rails behind the current step are what make this a
              // sequence rather than four buttons: the row shows distance
              // covered, not just which one is lit.
              const filled = still || i < shown || (on && i === LAST);
              const reached = still || i <= shown;

              return (
                <li key={p.still}>
                  <button
                    type="button"
                    onClick={() => select(i)}
                    aria-current={on ? "step" : undefined}
                    className="group block w-full text-left"
                  >
                    <span
                      aria-hidden
                      className="relative block h-[3px] w-full overflow-hidden bg-border"
                    >
                      {filled ? (
                        <span className="block h-full w-full bg-foreground" />
                      ) : on ? (
                        <span
                          // Remounting on each change restarts the animation
                          // from zero; resetting it in place would need a
                          // reflow hack.
                          key={shown}
                          className="dwell-x block h-full w-full bg-foreground"
                          style={{
                            ["--dwell" as string]: DWELL,
                            // Paused rather than unmounted, so the bar freezes
                            // where it is while you read instead of snapping
                            // back to zero.
                            animationPlayState: running ? "running" : "paused",
                          }}
                          onAnimationEnd={advance}
                        />
                      ) : null}
                    </span>

                    <span
                      className={`label mt-3 block transition-colors ${
                        reached ? "text-foreground" : ""
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <span
                      className={`display-sm mt-1.5 block text-[1.05rem] leading-snug transition-colors sm:text-[1.15rem] ${
                        reached
                          ? "text-foreground"
                          : "text-muted group-hover:text-foreground"
                      }`}
                    >
                      {p.head}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
