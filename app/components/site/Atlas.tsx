"use client";

import { useEffect, useRef, useState } from "react";
import {
  geoDistance,
  geoGraticule10,
  geoInterpolate,
  geoOrthographic,
  geoPath,
  type GeoPermissibleObjects,
} from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import { animate, useMotionValue, useSpring } from "motion/react";
import { ORIGINS, PUBLISHERS, UNPLACED, coords } from "../../lib/origins";
import { SOURCES } from "../../lib/sources";
import { useStillness } from "../../lib/useStillness";
import { EASE, Lines, Rise } from "./ui";

/* ════ Where it reads from ════
 *
 * The About page's one object. The home page looks at the moon; this looks back at the
 * Earth from it, and marks where each source in `sources.ts` is published
 * (`app/lib/origins.ts`). The list beside the globe is the content: walking down it
 * turns the globe to each place in turn, west to east, and draws the stretch of line
 * that arrives there from the place before. The line is the list's own order laid on the
 * sphere, one route through all seven places; nothing is claimed to travel along it. The
 * canvas only illustrates the list, so it is hidden from assistive technology and
 * nothing is lost if it fails to draw.
 *
 * Two things the drawing is careful about:
 *
 *  - A point is where a publisher sits. It is not where a server is and not an
 *    endorsement, and the lede says so, because a map with lines on it invites both
 *    readings.
 *  - It is bone on ink and nothing else. Colour on this site means a triage level, and
 *    a place has none.
 *
 * The last row has no place. The model's own memory is a source like the others and has
 * no publisher, so the globe turns to open water and no stretch of the line lights.
 */

const AT = ORIGINS.map((o): [number, number] => [o.lon, o.lat]);
const STEPS = 64;

/* The route, as great-circle stretches: LEGS[n] arrives at place n from place n - 1, so
   the first place has none. Bethesda to Silver Spring is eight kilometres and draws as
   nothing at this scale, which is the truth of it. */
const LEGS = AT.map((to, n) => {
  if (n === 0) return null;
  const along = geoInterpolate(AT[n - 1], to);
  return Array.from({ length: STEPS + 1 }, (_, k) => along(k / STEPS));
});
/* Each place is seen from a little south of overhead, so it sits just above the middle
   of the disc with more of the world under it. The longest stretch (Geneva to
   Bhubaneswar) is 67 degrees, so the place a stretch came from is always still in view. */
const VIEWS = AT.map(([lon, lat]): [number, number] => [lon, lat - 10]);
/** The view for the row with no address: the middle of the Pacific. */
const NOWHERE: [number, number] = [-150, -12];
const GRATICULE = geoGraticule10();

const BONE = "236, 233, 226";

function paint(
  canvas: HTMLCanvasElement,
  land: GeoPermissibleObjects | null,
  lam: number,
  phi: number,
  t: number,
  active: number
) {
  const size = canvas.clientWidth;
  const ctx = canvas.getContext("2d");
  if (!size || !ctx) return;
  // Capped at 2: a 3x canvas costs more than twice as much to fill and shows no more.
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const px = Math.round(size * dpr);
  if (canvas.width !== px) canvas.width = canvas.height = px;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);

  const c = size / 2;
  const r = size * 0.43;
  const projection = geoOrthographic().translate([c, c]).scale(r).clipAngle(90).rotate([-lam, -phi]);
  const path = geoPath(projection, ctx);
  const centre: [number, number] = [lam, phi];

  // The air: a thin glow outside the limb, which is why the sphere stops short of the
  // canvas edge.
  const air = ctx.createRadialGradient(c, c, r * 0.97, c, c, r * 1.16);
  air.addColorStop(0, `rgba(${BONE}, 0.17)`);
  air.addColorStop(1, `rgba(${BONE}, 0)`);
  ctx.fillStyle = air;
  ctx.beginPath();
  ctx.arc(c, c, r * 1.16, 0, 2 * Math.PI);
  ctx.fill();

  const sea = ctx.createRadialGradient(c + r * 0.35, c - r * 0.42, 0, c, c, r * 1.15);
  sea.addColorStop(0, "#1b211e");
  sea.addColorStop(1, "#0c0f0e");
  ctx.beginPath();
  path({ type: "Sphere" });
  ctx.fillStyle = sea;
  ctx.fill();

  ctx.beginPath();
  path(GRATICULE);
  ctx.strokeStyle = `rgba(${BONE}, 0.07)`;
  ctx.lineWidth = 0.6;
  ctx.stroke();

  if (land) {
    ctx.beginPath();
    path(land);
    ctx.fillStyle = "#272e2a";
    ctx.fill();
    ctx.strokeStyle = `rgba(${BONE}, 0.3)`;
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }

  ctx.beginPath();
  path({ type: "Sphere" });
  ctx.strokeStyle = `rgba(${BONE}, 0.36)`;
  ctx.lineWidth = 1;
  ctx.stroke();

  // The whole route is always there, faintly. The stretches already walked are a step
  // brighter, and the one arriving at the active place is drawn as far as `t` has got.
  LEGS.forEach((leg, n) => {
    if (!leg) return;
    const on = n === active;
    const reach = on ? Math.max(1, Math.round(t * STEPS)) : STEPS;
    ctx.beginPath();
    path({ type: "LineString", coordinates: leg.slice(0, reach + 1) });
    ctx.strokeStyle = `rgba(${BONE}, ${on ? 0.95 : n < active ? 0.4 : 0.14})`;
    ctx.lineWidth = on ? 1.6 : n < active ? 1 : 0.8;
    ctx.stroke();
  });

  const dot = (at: [number, number], radius: number, alpha: number, glow: boolean) => {
    // Behind the limb. `geoPath` clips lines for us; points we place by hand.
    if (geoDistance(at, centre) > Math.PI / 2 - 0.03) return null;
    const p = projection(at);
    if (!p) return null;
    ctx.save();
    if (glow) {
      ctx.shadowColor = `rgb(${BONE})`;
      ctx.shadowBlur = 22;
    }
    ctx.beginPath();
    ctx.arc(p[0], p[1], radius, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(${BONE}, ${alpha})`;
    ctx.fill();
    ctx.restore();
    return p;
  };

  AT.forEach((at, n) => {
    const on = n === active;
    dot(at, on ? 5 : 2.6, on ? 1 : 0.55, on);
  });
  // The head of the stretch being drawn, until it lands on its place.
  const leg = LEGS[active];
  if (leg && t < 1) dot(leg[Math.round(t * STEPS)], 2.4, 1, true);
}

export function Atlas() {
  const still = useStillness();
  const [active, setActive] = useState(0);
  const [land, setLand] = useState<GeoPermissibleObjects | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const list = useRef<HTMLOListElement>(null);

  const lam = useSpring(VIEWS[0][0], { stiffness: 34, damping: 15 });
  const phi = useSpring(VIEWS[0][1], { stiffness: 34, damping: 15 });
  const t = useMotionValue(1);

  // The coastlines are the file the old globe used, served from this origin. Without
  // them the sphere still draws, with its grid, its points and its lines.
  useEffect(() => {
    let live = true;
    fetch("/geo/land-110m.json")
      .then((res) => res.json())
      .then((topo: Topology) => {
        if (live) setLand(feature(topo, topo.objects.land) as GeoPermissibleObjects);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  // The row crossing a band of the viewport is the active one. On a phone the globe is
  // pinned to the top half, so the band sits lower, under it.
  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 900px)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.n));
        }
      },
      { rootMargin: narrow ? "-62% 0px -28% 0px" : "-46% 0px -46% 0px" }
    );
    list.current?.querySelectorAll("[data-n]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const [cx, cy] = VIEWS[active] ?? NOWHERE;
    // Turn the short way round.
    let to = cx;
    const from = lam.get();
    while (to - from > 180) to -= 360;
    while (to - from < -180) to += 360;
    if (still) {
      lam.jump(to);
      phi.jump(cy);
      t.set(1);
      return;
    }
    lam.set(to);
    phi.set(cy);
    t.set(0);
    const run = animate(t, 1, { duration: 1.3, ease: EASE, delay: 0.3 });
    return () => run.stop();
  }, [active, still, lam, phi, t]);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let raf = 0;
    const ask = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        paint(el, land, lam.get(), phi.get(), t.get(), active);
      });
    };
    const offs = [lam.on("change", ask), phi.on("change", ask), t.on("change", ask)];
    const ro = new ResizeObserver(ask);
    ro.observe(el);
    ask();
    return () => {
      offs.forEach((off) => off());
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [land, active, lam, phi, t]);

  const at = ORIGINS[active];
  const hover = (n: number) => (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") setActive(n);
  };

  return (
    <section className="sec wrap f-ink" data-field="dark" id="places">
      <div className="sec-head">
        <Lines lines={["Where it", "reads from."]} />
        <Rise delay={0.1}>
          <p className="lede dim">
            {SOURCES.length} sources, published by {PUBLISHERS} bodies in {ORIGINS.length} places,
            and one with no address at all. A point is where a publisher sits, not where a
            server does. The line joins them west to east, in the order of this list.
          </p>
        </Rise>
      </div>

      <div className="atlas">
        <div className="atlas-stage">
          <canvas ref={canvas} aria-hidden />
          <p className="mono atlas-read" aria-hidden>
            {at ? at.place : "No address"}
          </p>
        </div>

        <ol className="places" ref={list}>
          {ORIGINS.map((o, n) => (
            <li
              key={o.place}
              className="place"
              data-n={n}
              data-on={n === active}
              onPointerEnter={hover(n)}
            >
              <div className="place-top">
                <h3 className="place-name">{o.place}</h3>
                <span className="mono place-at">{coords(o.lat, o.lon)}</span>
              </div>
              <dl className="place-pubs">
                {o.publishers.map((p) => (
                  <div key={p.name}>
                    <dt>{p.name}</dt>
                    <dd>
                      {/* A body listed under its own name (the AAP) is described by what
                          it supplies instead of being named twice. */}
                      {p.sources
                        .map((name) =>
                          name === p.name ? SOURCES.find((s) => s.name === name)!.kind : name
                        )
                        .join(", ")}
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
          <li
            className="place"
            data-n={ORIGINS.length}
            data-on={active === ORIGINS.length}
            onPointerEnter={hover(ORIGINS.length)}
          >
            <div className="place-top">
              <h3 className="place-name">Nowhere</h3>
              <span className="mono place-at">no address</span>
            </div>
            <dl className="place-pubs">
              {UNPLACED.map((s) => (
                <div key={s.name}>
                  <dt>{s.kind}</dt>
                  <dd>{s.name}</dd>
                </div>
              ))}
            </dl>
            <p className="place-note dim">
              It is asked, because no library covers every case. It is never allowed to cite
              itself, and an answer that rests on it alone is marked as not grounded in
              evidence.
            </p>
          </li>
        </ol>
      </div>
    </section>
  );
}
