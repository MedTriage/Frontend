import type { CSSProperties } from "react";

/* ── What a page shows while it waits ──
 *
 * Two things, both drawn in `globals.css`:
 *
 * `Skel` is a bar the shape of what is coming, with a slow band of light crossing it.
 * Bars take a `delay` so the light crosses a group of them as one wave, top to bottom,
 * not all at once.
 *
 * `MoonLoader` is the logo's moon, waxing to full and waning back, in ink. It moves
 * through every phase and rests on none, and it has no level colour, so it cannot be
 * read as a level: a phase that stands still is the AI's share of an answer, and this
 * never stands still.
 *
 * Both stop moving for anyone who has asked for reduced motion.
 */

export function Skel({
  className = "",
  delay = 0,
  style,
}: {
  className?: string;
  /** Seconds before this bar's light starts, to stagger a group. */
  delay?: number;
  style?: CSSProperties;
}) {
  return <span aria-hidden className={`skel block ${className}`} style={{ animationDelay: `${delay}s`, ...style }} />;
}

export function MoonLoader({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-108 -108 216 216" className={className} aria-hidden>
      <g transform="rotate(24)">
        {/* The lit half, then one ellipse that first hides it (the page's colour) and
            then adds the other half (ink), then a faint disc so the dark side reads. */}
        <path d="M0 -100A100 100 0 0 1 0 100Z" fill="currentColor" />
        <ellipse className="moon-wax" rx="100" ry="100" />
        <circle r="100" fill="currentColor" opacity="0.14" />
      </g>
    </svg>
  );
}

/** A consultation that is on its way: a question, then an answer signed by the moon. */
export function TranscriptSkeleton() {
  return (
    <div role="status" aria-label="Loading the consultation" className="rise space-y-8">
      {[0, 1].map((n) => (
        <div key={n} className="space-y-8">
          <div className="flex justify-end pl-10">
            <Skel className="h-[46px] w-[min(58%,320px)] rounded-[22px] rounded-br-[6px]" delay={n * 0.45} />
          </div>
          <div className="flex gap-3 sm:gap-3.5">
            <MoonLoader className="h-7 w-7 shrink-0" />
            <div className="min-w-0 flex-1 pt-0.5">
              <Skel className="h-6 w-[88px] rounded-full" delay={n * 0.45 + 0.08} />
              <div className="mt-4 space-y-3">
                {[97, 100, 91, n === 0 ? 64 : 42].map((w, i) => (
                  <Skel key={i} className="h-[13px]" style={{ width: `${w}%` }} delay={n * 0.45 + 0.16 + i * 0.08} />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
