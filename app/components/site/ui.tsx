"use client";

import { useRef, type ReactNode } from "react";
import { MARK_BODY, MARK_LIMB } from "../../lib/mark";
import Link from "next/link";
import {
  motion,
  useInView,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useStillness } from "../../lib/useStillness";

export const EASE = [0.2, 0.8, 0.2, 1] as const;

/** The level fields, in level order. Read with `LEVEL_COLOR[level - 1]`. */
export const LEVEL_COLOR = ["var(--go)", "var(--hold)", "var(--stop)"] as const;
export const LEVEL_HEX: string[] = ["#22c77e", "#ffb01f", "#ff4b2b"];

/* ── The mark ──
 *
 * A moon part-way through its phase, cut by hand: a lit body and the thin limb of the
 * dark side. It is the product's claim as a glyph (some of the answer is the AI's, the
 * rest is a doctor's) and it is the same object the home page is built around. One
 * colour, `currentColor`, so it sits on any field. The edges are deliberately a little
 * uneven; a compass-drawn version read as a UI icon rather than a mark. */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={`logo-mark ${className}`}
      fill="currentColor"
      aria-hidden
    >
      <g transform="rotate(-24 16 16)">
        <path d={MARK_BODY} />
        <path d={MARK_LIMB} />
      </g>
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`logo ${className}`}>
      <LogoMark />
      <span className="logo-word">MedTriage</span>
    </span>
  );
}

export function Arrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M2.5 8h10.4M8.6 3.6 13 8l-4.4 4.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Btn({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`btn ${className}`}>
      <span>{children}</span>
      <span className="btn-dot">
        <Arrow />
      </span>
    </Link>
  );
}

/** A label that rolls over to a copy of itself on hover. Goes inside a link or button. */
export function Roll({ children }: { children: string }) {
  return (
    <span className="roll" data-text={children}>
      <span>{children}</span>
    </span>
  );
}

/** A heading that arrives line by line. The lines are given, not measured, so the break
 *  is the writer's; on a narrow screen each line wraps inside itself.
 *
 *  The heading is what is observed, not the moving spans: those start below their own
 *  clipping box, and an IntersectionObserver never reports a fully clipped element. */
export function Lines({
  lines,
  as = "h2",
  className = "h2",
  delay = 0,
}: {
  lines: string[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
}) {
  const Tag = as;
  const ref = useRef<HTMLHeadingElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const still = useStillness();
  return (
    <Tag ref={ref as never} className={className}>
      {lines.map((line, i) => (
        <span className="ln" key={line}>
          <motion.span
            initial={false}
            animate={{ y: seen || still ? "0%" : "108%" }}
            transition={{ duration: 1.05, ease: EASE, delay: delay + i * 0.09 }}
          >
            {line}{" "}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Rise into place once, when scrolled to. */
export function Rise({
  children,
  delay = 0,
  className,
  y = 26,
  now = false,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
  /** Rise on load instead of on scroll. For things that sit at the very foot of the
   *  first screen, inside the margin the scroll trigger ignores. */
  now?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      {...(now ? { animate: { opacity: 1, y: 0 } } : { whileInView: { opacity: 1, y: 0 } })}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <motion.span className="w" style={{ opacity }}>
      {children}{" "}
    </motion.span>
  );
}

/** A sentence that inks in word by word as it is scrolled through. Only opacity moves,
 *  and the words are all there from the start, so it needs no reduced-motion branch. */
export function ScrubWords({
  text,
  progress,
}: {
  text: string;
  progress: MotionValue<number>;
}) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <Word
          key={`${w}-${i}`}
          progress={progress}
          range={[i / words.length, (i + 1) / words.length]}
        >
          {w}
        </Word>
      ))}
    </>
  );
}
