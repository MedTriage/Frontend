"use client";

import { motion, useTransform, type MotionValue } from "motion/react";

/* ── The moon ──
 *
 * The site's one object, and a chart. `phase` runs from 1 (full) through 0 (half) to -1
 * (new), and the lit area is exactly (1 + phase) / 2 of the disc, so a phase of 1, 0, -1
 * draws the `ai` share of Levels 1, 2 and 3 in `app/lib/levels.ts`: 100, 50, 0. Use
 * `phaseOf(ai)` to get there; do not eyeball a phase.
 *
 * The lit shape is the right half of the disc plus (or minus) half an ellipse whose
 * horizontal radius is |phase| x R, which is how a terminator on a sphere projects. Its
 * area is half the disc times (1 + phase), hence the exact fraction above.
 *
 * At the new moon nothing is lit, and a black disc on a black field would read as
 * nothing at all. So as the phase approaches -1 a rim comes up in the level's colour:
 * the light is still there, around the thing that has stopped answering.
 */

const R = 100;

export function phaseOf(ai: number) {
  return ai / 50 - 1;
}

export function litPath(phase: number) {
  const k = Math.max(-1, Math.min(1, phase));
  const rx = (Math.abs(k) * R).toFixed(2);
  return `M0 ${-R}A${R} ${R} 0 0 1 0 ${R}A${rx} ${R} 0 0 ${k >= 0 ? 1 : 0} 0 ${-R}Z`;
}

export function Moon({
  phase,
  color,
  dark = "#1a1f1c",
  tilt = 24,
  glow = false,
  grain = true,
  className = "",
}: {
  phase: MotionValue<number>;
  color: MotionValue<string> | string;
  /** The unlit side. One step off the field it sits on, so the whole disc still reads. */
  dark?: string;
  tilt?: number;
  glow?: boolean;
  grain?: boolean;
  className?: string;
}) {
  const d = useTransform(phase, litPath);
  const rim = useTransform(phase, [-1, -0.5], [1, 0]);

  return (
    <div className={`moon ${className}`} aria-hidden>
      {glow && (
        <svg className="moon-glow" viewBox="-130 -130 260 260">
          <g transform={`rotate(${tilt})`}>
            <motion.path d={d} fill={color} />
          </g>
          <motion.circle
            r={R + 2}
            fill="none"
            stroke={color}
            strokeWidth={16}
            style={{ opacity: rim }}
          />
        </svg>
      )}
      <svg viewBox="-130 -130 260 260">
        <circle r={R} fill={dark} />
        <g transform={`rotate(${tilt})`}>
          <motion.path d={d} fill={color} />
        </g>
        <motion.circle
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          style={{ opacity: rim }}
        />
      </svg>
      {grain && <div className="moon-grain" />}
    </div>
  );
}
