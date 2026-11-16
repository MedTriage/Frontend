/* ── The moon's arithmetic ──
 *
 * Moved out of `components/site/Moon.tsx` on 2026-11-15 so that code which runs on the
 * server (the link-preview image) can pose a moon the same way the pages do. `Moon.tsx`
 * re-exports both functions, so nothing else had to change; its header explains the shape.
 *
 * `phase` runs from 1 (full) through 0 (half) to -1 (new), and the lit area is exactly
 * (1 + phase) / 2 of the disc. Never pose a phase by eye: get it from `phaseOf(ai)`.
 */

export const R = 100;

export function phaseOf(ai: number) {
  return ai / 50 - 1;
}

export function litPath(phase: number) {
  const k = Math.max(-1, Math.min(1, phase));
  const rx = (Math.abs(k) * R).toFixed(2);
  return `M0 ${-R}A${R} ${R} 0 0 1 0 ${R}A${rx} ${R} 0 0 ${k >= 0 ? 1 : 0} 0 ${-R}Z`;
}
