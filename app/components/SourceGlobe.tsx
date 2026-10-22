"use client";

/*
  Where the evidence comes from — the About hero's globe.

  A chart, not an object: page stock inside a single hairline, land in accent-muted,
  graticule in border. Nothing is lit and nothing glows, because the palette says
  depth is value rather than colour and this sits on #f4f6f5 where a glow renders
  as nothing at all.

  Colour is spent only where it means something. `--node-live` marks the source
  being read this turn and `--node-finding` marks where the answer is reconciled —
  both already the authorised exception to "colour means risk", quarantined to the
  differential graph, and used here for the same reason: a source under
  consideration must not borrow the meaning of a triage level. No t1/t2/t3 appears
  on this globe at all.

  Two departures from the design file, both deliberate:

  1. The land is fetched from `/geo/land-110m.json` rather than unpkg. A hero that
     renders an empty sphere when a third-party CDN is slow, blocked or down is not
     a hero, and the file is 55KB served from the same origin.
  2. Motion is driven by elapsed time rather than by assuming 60fps. The original
     advances a fixed step per frame, so the globe spins at double speed on a 120Hz
     display and the pulse cycles twice as fast.
*/

import { useEffect, useMemo, useRef, useState } from "react";
import { geoOrthographic, geoPath, geoGraticule10, geoDistance } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import type { Feature, Geometry } from "geojson";
import { useTheme } from "./ThemeProvider";
import { useStillness } from "../lib/useStillness";
import { HUB, SITES, type Site } from "../lib/sourceSites";

/** Degrees per second of idle rotation. The design advances 0.055° a frame at an
 *  assumed 60fps; this is the same speed expressed so it survives a 120Hz screen. */
const SPIN_DEG_PER_SEC = 0.055 * 60;

/** How long each source holds the readout before the next one takes it. */
const DWELL_MS = 2600;

/** Latitude the drag is clamped to, so the globe can never be rolled past its poles. */
const TILT_LIMIT = 72;

/** Pointer travel to rotation, in degrees per pixel. */
const DRAG_GAIN = 0.28;

interface Props {
  /** Index of the source currently being read. Owned by the hero so the readout
   *  panel and the globe can never disagree about what is active. */
  active: number;
  onActiveChange: (i: number) => void;
  className?: string;
}

export function SourceGlobe({ active, onActiveChange, className = "" }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [land, setLand] = useState<Feature<Geometry> | null>(null);

  const { theme } = useTheme();
  const still = useStillness();

  /* These are read inside the frame loop, which must not be torn down and rebuilt
     every time one of them changes — so the loop reads refs instead and a change
     of source or of motion preference costs nothing.
     Mirrored in an effect rather than during render: React forbids writing a ref
     while rendering, and this runs after every render, which is exactly when the
     loop wants the new values. */
  const activeRef = useRef(active);
  const notify = useRef(onActiveChange);
  const stillRef = useRef(still);

  useEffect(() => {
    activeRef.current = active;
    notify.current = onActiveChange;
    stillRef.current = still;
  });

  const graticule = useMemo(() => geoGraticule10(), []);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/geo/land-110m.json", { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((topo: Topology) =>
        setLand(feature(topo, topo.objects.land) as Feature<Geometry>)
      )
      .catch(() => {
        /* The sphere, graticule and network stand without it — a globe with no
           coastline still reads as a globe. Nothing to retry. */
      });
    return () => ac.abort();
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    const canvas = canvasRef.current;
    if (!mount || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const root = document.documentElement;
    const css = (n: string) => getComputedStyle(root).getPropertyValue(n).trim();
    // Read once per setup rather than per draw call. The design's helper runs
    // getComputedStyle for every stroke, which is a full style resolution each
    // time; the effect re-runs on theme change, so the values stay correct.
    const tok = {
      card: css("--card"),
      border: css("--border"),
      muted: css("--muted"),
      accentMuted: css("--accent-muted"),
      foreground: css("--foreground"),
      live: css("--node-live"),
      out: css("--node-out"),
      finding: css("--node-finding"),
    };

    const projection = geoOrthographic().clipAngle(90);
    const path = geoPath(projection, ctx);
    /* A second path renderer whose context is swapped for a Path2D each frame.
       geoPath writes into anything exposing moveTo/lineTo/arc/closePath, and
       Path2D qualifies — so the coastline is projected once and then both filled
       and stroked from the same object rather than re-projected for each pass.
       With ~10,000 coastline points that halves the per-frame projection work. */
    const landPath = geoPath(projection);
    const sphere = { type: "Sphere" } as const;

    let w = 0;
    let h = 0;
    const rot: [number, number] = [10, -12];
    let drag: { x: number; y: number; r: [number, number] } | null = null;
    let raf = 0;
    let last = 0;
    let elapsed = 0;
    let dwell = 0;

    const size = () => {
      const r = mount.getBoundingClientRect();
      if (!r.width || !r.height) return;
      w = r.width;
      h = r.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Inset by 5.5% so the labels that sit beside a node near the limb still
      // have somewhere to go.
      projection.fitExtent(
        [
          [w * 0.055, w * 0.055],
          [w * 0.945, w * 0.945],
        ],
        sphere
      );
    };

    /** Front hemisphere only. The small margin keeps a node from flickering while
     *  it grazes the horizon. */
    const visible = (s: Site) =>
      geoDistance([s.lon, s.lat], [-rot[0], -rot[1]]) < Math.PI / 2 - 0.03;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!w || !h) return;

      const dt = last ? Math.min(now - last, 100) : 0;
      last = now;
      if (!stillRef.current) elapsed += dt;

      if (!drag && !stillRef.current) rot[0] += (SPIN_DEG_PER_SEC * dt) / 1000;
      projection.rotate([-rot[0], -rot[1]]);

      const i = activeRef.current;
      ctx.clearRect(0, 0, w, h);

      // The sphere: page stock inside one hairline.
      ctx.beginPath();
      path(sphere);
      ctx.fillStyle = tok.card;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = tok.border;
      ctx.stroke();

      ctx.save();
      ctx.beginPath();
      path(sphere);
      ctx.clip();

      ctx.beginPath();
      path(graticule);
      ctx.lineWidth = 1;
      ctx.strokeStyle = tok.border;
      ctx.globalAlpha = 0.75;
      ctx.stroke();
      ctx.globalAlpha = 1;

      if (land) {
        const shape = new Path2D();
        landPath.context(shape as unknown as CanvasRenderingContext2D);
        landPath(land);

        /* Graphite land inside a hairline coast — the design file's own
           treatment, and the one that held up. An emerald bloom was tried here
           and went to mint haze on paper; an outline-only version lost the
           landmasses altogether. Filled and ruled is what reads as a chart. */
        ctx.fillStyle = tok.accentMuted;
        ctx.fill(shape);
        ctx.lineWidth = 1;
        ctx.strokeStyle = tok.border;
        ctx.stroke(shape);
      }

      // Arcs, source to reconciliation. Clipped to the sphere so a connection
      // never appears to run across the far side.
      SITES.forEach((s, k) => {
        const on = k === i;
        ctx.beginPath();
        path({
          type: "LineString",
          coordinates: [
            [s.lon, s.lat],
            [HUB.lon, HUB.lat],
          ],
        });
        ctx.lineWidth = on ? 1.6 : 1;
        ctx.strokeStyle = on ? tok.live : tok.out;
        // Held much fainter than the design's 0.4: at eight arcs that read as a
        // network, at thirty-eight it reads as a ball of wool.
        ctx.globalAlpha = on ? 0.95 : 0.14;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      ctx.restore();

      /* Nodes and labels, front hemisphere only.
         Thirty-eight bodies means several share a city — London carries NICE,
         MHRA and Cochrane; Ottawa carries two — so names are placed against a
         running list of what is already on screen and dropped when they would
         collide. The active source is placed first and is never dropped: it is
         the one the panel is naming, and a panel naming something the sphere is
         not labelling is worse than a little crowding. */
      const placed: { x: number; y: number; w: number; h: number }[] = [];
      const order = [i, ...SITES.map((_, k) => k).filter((k) => k !== i)];

      for (const k of order) {
        const s = SITES[k];
        if (!visible(s)) continue;
        const p = projection([s.lon, s.lat]);
        if (!p) continue;
        const on = k === i;

        ctx.beginPath();
        ctx.arc(p[0], p[1], on ? 4 : 2.6, 0, Math.PI * 2);
        ctx.fillStyle = on ? tok.live : tok.muted;
        ctx.globalAlpha = on ? 1 : 0.55;
        ctx.fill();
        ctx.globalAlpha = 1;

        // A ring leaving the active node — the tell that this source is being
        // read right now. Held still under a reduced-motion preference.
        if (on && !stillRef.current) {
          const cycle = ((elapsed / 1000) * 40) % 18;
          ctx.beginPath();
          ctx.arc(p[0], p[1], 4 + cycle, 0, Math.PI * 2);
          ctx.strokeStyle = tok.live;
          ctx.globalAlpha = Math.max(0, 0.5 - cycle / 36);
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        ctx.font = `${on ? "500" : "400"} 11px Iosevka, ui-monospace, monospace`;
        const box = {
          x: p[0] + 9,
          y: p[1] - 8,
          w: ctx.measureText(s.short).width,
          h: 13,
        };
        const clash = placed.some(
          (q) =>
            box.x < q.x + q.w &&
            box.x + box.w > q.x &&
            box.y < q.y + q.h &&
            box.y + box.h > q.y
        );
        if (clash && !on) continue;
        placed.push(box);

        ctx.fillStyle = on ? tok.foreground : tok.muted;
        ctx.globalAlpha = on ? 1 : 0.7;
        ctx.fillText(s.short, p[0] + 9, p[1] + 4);
        ctx.globalAlpha = 1;
      }

      if (visible(HUB)) {
        const p = projection([HUB.lon, HUB.lat]);
        if (p) {
          ctx.beginPath();
          ctx.arc(p[0], p[1], 5, 0, Math.PI * 2);
          ctx.fillStyle = tok.finding;
          ctx.fill();
        }
      }

      if (!stillRef.current) {
        dwell += dt;
        if (dwell >= DWELL_MS) {
          dwell = 0;
          notify.current((activeRef.current + 1) % SITES.length);
        }
      }
    };

    const onDown = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY, r: [rot[0], rot[1]] };
      mount.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      rot[0] = drag.r[0] + (e.clientX - drag.x) * DRAG_GAIN;
      rot[1] = Math.max(
        -TILT_LIMIT,
        Math.min(TILT_LIMIT, drag.r[1] - (e.clientY - drag.y) * DRAG_GAIN)
      );
    };
    const onUp = () => {
      drag = null;
    };

    size();
    raf = requestAnimationFrame(frame);

    const ro = new ResizeObserver(size);
    ro.observe(mount);
    mount.addEventListener("pointerdown", onDown);
    mount.addEventListener("pointermove", onMove);
    mount.addEventListener("pointerup", onUp);
    mount.addEventListener("pointercancel", onUp);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mount.removeEventListener("pointerdown", onDown);
      mount.removeEventListener("pointermove", onMove);
      mount.removeEventListener("pointerup", onUp);
      mount.removeEventListener("pointercancel", onUp);
    };
  }, [land, theme, graticule]);

  return (
    <div
      ref={mountRef}
      className={`aboutGlobe ${className}`}
      // The globe is an illustration of the list beside it; the readout panel
      // carries the same information as text.
      aria-hidden
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
