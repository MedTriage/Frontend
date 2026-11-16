"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LEVELS } from "../../lib/levels";
import { SERVICES } from "../../lib/services";
import { litPath, phaseOf } from "./Moon";
import { Arrow, LEVEL_COLOR, Lines, Rise } from "./ui";

/* ════ Lifelines ════
 *
 * The public services an answer can point to: a night panel of five tiles, the two
 * emergency numbers across the top. Each tile has a small drawing of what the service is
 * (a beacon, a route, a voice, a screen, an area) and the moons of the levels at which an
 * answer may carry it. A drawing's one colour is the level the service first appears at;
 * Tele-MANAS can come with any answer, so its drawing has none.
 *
 * The owner asked for a section on "the integrations". These are not integrations: there is
 * no tie-up with any of these services and nothing is sent to them, so the section calls
 * them lifelines, draws its own pictures instead of using their logos, and says so in its
 * last line. Keep that line. This is the home page's section; the About page's longer
 * account of the same five is `LifelinesDetail` below, and shares the drawings.
 */

type ServiceKey = (typeof SERVICES)[number]["key"];

/* Typed by key, so a service added to the table without a drawing fails the build. */
const GLYPH: Record<ServiceKey, ReactNode> = {
  // A beacon: three rings lit one after another, outward.
  emergency_112: (
    <>
      {[22, 42, 62].map((r, n) => (
        <circle
          key={r}
          className="g-beat"
          cx="80"
          cy="80"
          r={r}
          stroke="var(--acc)"
          style={{ animationDelay: `${n * 0.3}s` }}
        />
      ))}
      <circle cx="80" cy="80" r="5" fill="var(--acc)" stroke="none" />
    </>
  ),
  // A route: dashes running from where you are to care.
  ambulance_108: (
    <>
      <circle cx="26" cy="118" r="5" />
      <path className="g-flow" d="M31 118C78 118 70 46 118 46" stroke="var(--acc)" strokeDasharray="5 9" />
      <circle cx="134" cy="46" r="16" />
      <path d="M134 38v16M126 46h16" />
    </>
  ),
  // A voice.
  tele_manas: (
    <>
      {[18, 40, 66, 92, 56, 80, 38, 60, 22].map((h, n) => (
        <rect
          key={n}
          className="g-bar"
          x={26.5 + n * 13}
          y={80 - h / 2}
          width="3"
          height={h}
          rx="1.5"
          fill="currentColor"
          stroke="none"
          style={{ animationDelay: `${-n * 0.17}s` }}
        />
      ))}
    </>
  ),
  // A doctor on a screen.
  esanjeevani: (
    <>
      <rect x="22" y="36" width="116" height="80" rx="10" />
      <circle cx="80" cy="68" r="12" />
      <path d="M54 116c0-17 12-24 26-24s26 7 26 24" />
      <path d="M80 116v16M58 132h44" />
      <circle className="g-live" cx="124" cy="50" r="4" fill="var(--acc)" stroke="none" />
    </>
  ),
  // An area, and the few places in it.
  facilities: (
    <>
      {Array.from({ length: 25 }, (_, n) => (
        <circle
          key={n}
          cx={32 + 24 * (n % 5)}
          cy={32 + 24 * Math.floor(n / 5)}
          r="1.8"
          fill="currentColor"
          stroke="none"
          opacity="0.45"
        />
      ))}
      {[
        [1, 1],
        [3, 2],
        [2, 4],
      ].map(([c, r], n) => (
        <g key={n} stroke="var(--acc)">
          <circle
            className="g-beat"
            cx={32 + 24 * c}
            cy={32 + 24 * r}
            r="8"
            style={{ animationDelay: `${n * 0.5}s` }}
          />
          <circle cx={32 + 24 * c} cy={32 + 24 * r} r="3" fill="var(--acc)" stroke="none" />
        </g>
      ))}
    </>
  ),
};

/** That level's moon at letter size, lit in the level's colour. The phase is read from
 *  `LEVELS`, never posed; at the new moon nothing is lit, so the rim is drawn. */
function PhaseDot({ level }: { level: number }) {
  const phase = phaseOf(LEVELS[level - 1].ai);
  const colour = LEVEL_COLOR[level - 1];
  return (
    <svg viewBox="-108 -108 216 216" aria-hidden>
      <circle r="100" fill="var(--ink-3)" />
      <g transform="rotate(24)">
        <path d={litPath(phase)} fill={colour} />
      </g>
      {phase <= -1 && <circle r="100" fill="none" stroke={colour} strokeWidth="16" />}
    </svg>
  );
}

const levelsLabel = (levels: readonly number[]) =>
  levels.length === LEVELS.length
    ? "Any level"
    : levels.length === 1
      ? `Level ${levels[0]}`
      : `Levels ${levels.join(" and ")}`;

/* Colour is the level a service first appears at, and nothing else. */
const accent = (levels: readonly number[]) => ({
  ["--acc" as string]:
    levels.length === LEVELS.length ? "currentColor" : LEVEL_COLOR[levels[0] - 1],
});

function Glyph({ k }: { k: ServiceKey }) {
  return (
    <svg
      viewBox="0 0 160 160"
      className="life-g"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      {GLYPH[k]}
    </svg>
  );
}

export function Lifelines() {
  return (
    <section className="sec wrap f-bone2" data-field="light">
      <div className="sec-head">
        <Lines lines={["Lifelines"]} />
        <Rise delay={0.1}>
          <p className="lede">
            As the system is allowed to say less, it points to more. An answer comes with at
            most two public helplines, 112 first in an emergency, and the government
            hospitals in your area.
          </p>
        </Rise>
      </div>

      <div className="life">
        {SERVICES.map((s, n) => (
          <Rise key={s.key} delay={n * 0.06} y={18} className="life-tile">
            <div className="life-in" style={accent(s.levels)}>
              <div className="life-top mono-s">
                <span className="dim">{String(n + 1).padStart(2, "0")}</span>
                <span className="life-lv">
                  {levelsLabel(s.levels)}
                  {s.levels.map((l) => (
                    <PhaseDot key={l} level={l} />
                  ))}
                </span>
              </div>
              <Glyph k={s.key} />
              <h3 className="h3">{s.name}</h3>
              <p>{s.what}</p>
              <p className="mono-s dim">{s.when}</p>
            </div>
          </Rise>
        ))}
      </div>

      <Rise delay={0.1}>
        <p className="life-foot mono-s">
          Public services, not partners. MedTriage shows you the number or the link with your
          answer; it does not call, book or send anything on your behalf.
        </p>
      </Rise>
      <Rise delay={0.15} className="mt-9">
        <Link href="/about#lifelines" className="arrow-link">
          How each one works <Arrow />
        </Link>
      </Rise>
    </section>
  );
}

/* ════ Lifelines, in detail (About) ════
 *
 * The same five at length: what each service does, what the patient is given here, and
 * where to read about the service itself. The three rules above the list are the backend's (`MAX_CARDS`,
 * the order in `cards()`, and the table being the only place a number comes from).
 *
 * The links go to official pages and are labelled by host. They are for reading about a
 * service, not for reaching it in a hurry: the button that dials or opens one comes with the
 * answer, from the backend.
 */

const RULES_OF_THREE = [
  {
    title: "Two at most",
    body: "In an emergency a person needs one number to dial, and a list makes them choose under pressure. An answer never carries more than two helplines.",
  },
  {
    title: "112 first",
    body: "It leads every emergency, whatever else applies, and it is the one number shown when the system itself cannot be reached.",
  },
  {
    title: "Never from a model",
    body: "Every number and link comes from one table, each row checked against an official page. No prompt contains one, so the model cannot write a wrong one.",
  },
];

export function LifelinesDetail() {
  return (
    <section className="sec wrap f-ink" data-field="dark" id="lifelines">
      <div className="sec-head">
        <Lines lines={["The lifelines,", "one by one."]} />
        <Rise delay={0.1}>
          <p className="lede dim">
            MedTriage is not connected to any of these services. It knows when to name one and
            shows you how to reach it, and it stops there: nothing about you is sent, no call
            is placed and no appointment is made.
          </p>
        </Rise>
      </div>

      <ul className="lf-rules">
        {RULES_OF_THREE.map((r, n) => (
          <Rise key={r.title} delay={n * 0.06}>
            <li>
              <h3 className="h3">{r.title}</h3>
              <p className="dim">{r.body}</p>
            </li>
          </Rise>
        ))}
      </ul>

      <div className="lf-list">
        {SERVICES.map((s, n) => (
          <Rise key={s.key} delay={n * 0.04} y={18}>
            <article className="lf-row" style={accent(s.levels)}>
              <Glyph k={s.key} />
              <div className="lf-name">
                <h3 className="h3">{s.name}</h3>
                <p className="dim">{s.what}</p>
                <span className="life-lv mono-s">
                  {levelsLabel(s.levels)}
                  {s.levels.map((l) => (
                    <PhaseDot key={l} level={l} />
                  ))}
                </span>
              </div>
              <dl className="lf-facts">
                <dt className="mono-s">It does</dt>
                <dd>{s.does}</dd>
                <dt className="mono-s">You get</dt>
                <dd>{s.gives}</dd>
                <dt className="mono-s">Read more</dt>
                <dd>
                  <a
                    href={s.site.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="arrow-link"
                  >
                    {s.site.label} <Arrow />
                  </a>
                </dd>
              </dl>
            </article>
          </Rise>
        ))}
      </div>
    </section>
  );
}
