"use client";

import { useEffect, useRef } from "react";

/**
 * The level field.
 *
 * Rig's panel is a drifting field of block segments, dim until the cursor passes
 * over it and lit in the accent colour inside a radius — colour is something you
 * uncover, not something the panel broadcasts. This is that, tinted by the selected
 * triage level, so sweeping the field at Level 3 turns up red the same way Level 1
 * turns up green.
 *
 * The halo answering identically at every level is the point: the interaction has to
 * stay continuous, or an unlit panel reads as a broken one rather than as a
 * statement. The split between model and clinician is carried by the block meters in
 * the readout, where it can be read as a number instead of inferred from density.
 *
 * Rig's performance discipline, kept and extended: the loop is gated by an
 * IntersectionObserver and never runs offscreen, DPR is capped at 2, and
 * `prefers-reduced-motion` gets a static field with no rAF at all — which rig
 * itself does not do.
 */

const ROW_PITCH = 15; // vertical rhythm
const SEG_H = 9;
const MIN_W = 16;
const MAX_W = 88;
const MIN_GAP = 7;
const MAX_GAP = 46;

/** Deterministic PRNG — the field must look scattered but be identical every mount,
 *  otherwise it would reshuffle on every state change and read as noise. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Seg = { x: number; w: number; jitter: number };
type Row = { y: number; segs: Seg[]; span: number; speed: number };

export function AutonomyField({ tone }: { tone: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const toneRef = useRef(tone);
  const retint = useRef<(() => void) | null>(null);
  /** Cursor position in canvas-local px, and the eased 0..1 halo strength. */
  const mouse = useRef<[number, number] | null>(null);
  const hover = useRef(0);
  const hoverTarget = useRef(0);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let rows: Row[] = [];
    let cssW = 0;
    let cssH = 0;
    let lit = "";
    let dim = "";

    const readTokens = () => {
      const root = getComputedStyle(document.documentElement);
      lit = root.getPropertyValue(`--${toneRef.current}`).trim();
      dim = root.getPropertyValue("--border").trim();
    };

    /** Rebuild the segment layout for the current size. Each row is generated one
     *  span wider than the canvas so it can be drawn twice and wrap seamlessly. */
    const build = () => {
      const rand = mulberry32(0x5eed);
      rows = [];
      const rowCount = Math.ceil(cssH / ROW_PITCH);
      for (let r = 0; r < rowCount; r++) {
        const span = cssW + MAX_W + MAX_GAP;
        const segs: Seg[] = [];
        let x = 0;
        while (x < span) {
          const w = MIN_W + rand() * (MAX_W - MIN_W);
          segs.push({ x, w, jitter: rand() });
          x += w + MIN_GAP + rand() * (MAX_GAP - MIN_GAP);
        }
        rows.push({
          y: r * ROW_PITCH,
          segs,
          span,
          // Alternating direction at varied rates — the parallax is what stops the
          // field reading as one sliding sheet.
          speed: (r % 2 === 0 ? 1 : -1) * (3 + rand() * 7),
        });
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      cssW = rect.width;
      cssH = rect.height;
      const w = Math.round(cssW * dpr);
      const h = Math.round(cssH * dpr);
      if (el.width !== w || el.height !== h) {
        el.width = w;
        el.height = h;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    };

    const smoothstep = (a: number, b: number, x: number) => {
      const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };

    const paint = (t: number) => {
      ctx.clearRect(0, 0, cssW, cssH);

      const mx = mouse.current ? mouse.current[0] : -1e4;
      const my = mouse.current ? mouse.current[1] : -1e4;
      const radius = Math.max(cssW, cssH) * 0.3;
      const strength = hover.current;

      for (const row of rows) {
        const offset = reduced
          ? 0
          : (((t * row.speed) % row.span) + row.span) % row.span;
        const cy = row.y + SEG_H / 2;
        for (const seg of row.segs) {
          for (const pass of [0, -row.span]) {
            const x = seg.x - offset - pass;
            if (x > cssW || x + seg.w < 0) continue;

            let halo = 0;
            if (strength > 0) {
              const dx = x + seg.w / 2 - mx;
              const dy = cy - my;
              const dist = Math.sqrt(dx * dx + dy * dy);
              halo = smoothstep(radius, radius * 0.65, dist) * strength;
            }

            // The per-segment jitter ragged-edges the halo instead of leaving a
            // clean circle — a perfect disc reads as a spotlight effect, whereas a
            // broken edge reads as the field itself responding.
            if (halo > seg.jitter * 0.55) {
              ctx.fillStyle = lit;
              ctx.globalAlpha = 0.3 + halo * 0.65;
            } else {
              ctx.fillStyle = dim;
              ctx.globalAlpha = 0.55;
            }
            ctx.fillRect(x, row.y, seg.w, SEG_H);
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    let raf: number | null = null;
    let visible = true;

    const frame = (now: number) => {
      raf = null;
      if (!visible) return;

      // Ease the halo in and out rather than snapping — a hard cut on mouseleave
      // reads as a glitch, and rig's own smoothstep falloff is the same idea in
      // space rather than in time.
      hover.current += (hoverTarget.current - hover.current) * 0.12;
      if (Math.abs(hoverTarget.current - hover.current) < 0.002)
        hover.current = hoverTarget.current;

      paint(now * 0.001);

      // Under reduced motion there is no drift, so the loop only needs to run while
      // the halo is still settling.
      if (!reduced || hover.current !== hoverTarget.current)
        raf = requestAnimationFrame(frame);
    };

    // Pointer tracking lives on the panel, not the canvas — the readout card sits
    // over the field, and listening on the canvas alone would drop the halo every
    // time the cursor crossed the card.
    const host = el.parentElement?.parentElement ?? el;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mouse.current = [e.clientX - r.left, e.clientY - r.top];
      hoverTarget.current = 1;
      if (raf === null && visible) raf = requestAnimationFrame(frame);
    };
    const onLeave = () => {
      hoverTarget.current = 0;
      if (raf === null && visible) raf = requestAnimationFrame(frame);
    };
    host.addEventListener("mousemove", onMove);
    host.addEventListener("mouseleave", onLeave);

    retint.current = () => {
      readTokens();
      if (reduced) paint(0);
      else if (raf === null && visible) raf = requestAnimationFrame(frame);
    };

    readTokens();
    if (resize()) {
      build();
      if (reduced) paint(0);
      else raf = requestAnimationFrame(frame);
    }

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (visible && raf === null && !reduced)
          raf = requestAnimationFrame(frame);
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(el);

    const ro = new ResizeObserver(() => {
      if (resize()) {
        build();
        paint(performance.now() * 0.001);
      }
    });
    ro.observe(el);

    // Follow the theme as well as the level.
    const mo = new MutationObserver(readTokens);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      retint.current = null;
      host.removeEventListener("mousemove", onMove);
      host.removeEventListener("mouseleave", onLeave);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  // A level change only re-reads the triage token — the segment layout is untouched,
  // so the field keeps its position and simply answers in the new colour. Written
  // here rather than during render because the frame loop is what reads it.
  useEffect(() => {
    toneRef.current = tone;
    retint.current?.();
  }, [tone]);

  return <canvas ref={canvas} className="block w-full h-full" aria-hidden />;
}
