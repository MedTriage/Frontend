"use client";

/**
 * The About opener — the reach of the evidence, drawn.
 *
 * Two columns on one ground: the claim on the left, a globe on the right that is
 * cropped by the section rather than contained by it. The crop is the point — a
 * sphere small enough to sit inside its column reads as an icon, and an icon
 * cannot carry a hero.
 *
 * The readout panel and the globe share one `active` index held here, so the
 * label burning on the sphere and the name written in the panel can never
 * disagree about which source is being read.
 */

import { useState } from "react";
import Link from "next/link";
import { Mark } from "./Navbar";
import { SourceGlobe } from "./SourceGlobe";
import { SITES } from "../lib/sourceSites";

/* The rules carry the mark's own three colours, in the mark's own order — the
   autonomy the system keeps as risk rises. Reading the cards left to right is
   reading the logo top to bottom, which is the only reason they are coloured at
   all. */
const FIGURES = [
  { n: "3", k: "Sources per turn", rule: "bg-t1" },
  { n: String(SITES.length), k: "Guideline bodies", rule: "bg-t2" },
  { n: "3", k: "Triage levels", rule: "bg-t3" },
];

/** The institution's own mark, falling back to its monogram where no usable one
 *  exists. Keyed by source in the parent, so a change of source remounts this and
 *  the failure flag resets itself without an effect. */
function SourceMark({ site }: { site: (typeof SITES)[number] }) {
  const [failed, setFailed] = useState(false);
  const show = site.logo && !failed;

  return (
    <span
      aria-hidden
      className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border border-border bg-background"
    >
      {show ? (
        /* These are 128px favicons of wildly varying aspect. next/image's layout
           machinery buys nothing at this size, and the monogram fallback needs a
           plain onError, which next/image does not surface the same way. */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/logos/${site.logo}`}
          alt=""
          width={22}
          height={22}
          className="h-[22px] w-[22px] object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="data text-[9px] font-semibold tracking-[0.03em] text-muted">
          {site.mono}
        </span>
      )}
    </span>
  );
}

export function AboutHero() {
  const [active, setActive] = useState(0);
  const site = SITES[active];

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-5 sm:px-8 min-[1101px]:min-h-[720px] min-[1101px]:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] max-[1100px]:gap-0">
        {/* ── The claim ── */}
        <div className="relative z-[2] py-20">
          {/* The mark stands where the eyebrow was. The logo is the thesis —
              three rules descending as risk rises — so it says what the line of
              label text was saying, and says it in one glance. */}
          <div className="mb-8 flex items-center gap-3">
            <Mark />
            <span className="data text-[12px] font-semibold uppercase tracking-[0.18em]">
              MedTriage
            </span>
          </div>

          <h1 className="display text-[1.9rem] sm:text-[2.8rem] min-[1101px]:text-[3.4rem]">
            Your answer is assembled from guidance published all over the world.
          </h1>

          <p className="mt-6 max-w-[46ch] text-[16px] leading-relaxed text-muted">
            Every consultation queries clinical guidelines, related-condition
            literature and drug labelling in parallel — then reconciles what they
            say before deciding whether the system may answer you directly.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/chat"
              className="inline-flex h-11 items-center justify-center gap-2.5 border border-accent bg-accent px-5 text-sm font-medium leading-none text-on-accent transition-opacity hover:opacity-85"
            >
              Start a consultation
            </Link>
            <Link
              href="#how"
              className="inline-flex h-11 items-center justify-center gap-2.5 border border-border px-5 text-sm font-medium leading-none text-muted transition-colors hover:border-foreground hover:text-foreground"
            >
              How it works
            </Link>
          </div>

          {/* Ruled cards rather than a hairline grid, so each figure gets its own
              field. The rules above them are the mark's own three colours in the
              mark's own order. */}
          <dl className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {FIGURES.map((f) => (
              <div key={f.k} className="border border-border bg-card p-5">
                <span aria-hidden className={`mb-4 block h-[3px] w-7 ${f.rule}`} />
                <dd className="data text-[2rem] font-semibold leading-none tracking-[-0.02em] text-foreground">
                  {f.n}
                </dd>
                <dt className="label mt-3 block">{f.k}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* ── The globe ── */}
        <div className="relative flex min-h-[420px] flex-col justify-end self-stretch sm:min-h-[560px] min-[1101px]:block min-[1101px]:min-h-[720px]">
          <SourceGlobe
            active={active}
            onActiveChange={setActive}
            className="
              absolute top-1/2 aspect-square -translate-y-1/2
              left-1/2 w-[min(620px,116%)] -translate-x-1/2
              min-[1101px]:left-[-56px] min-[1101px]:right-[-140px] min-[1101px]:w-auto min-[1101px]:translate-x-0
            "
          />

          {/* ── The readout ──
              Deliberately not an aria-live region: it changes every 2.6 seconds,
              forever, and a live region on that cadence turns a screen reader into
              a metronome. The full roster is published once, below. */}
          <div className="relative z-[2] mt-4 w-full max-w-[360px] border border-border bg-card min-[1101px]:absolute min-[1101px]:bottom-16 min-[1101px]:right-0 min-[1101px]:mt-0 min-[1101px]:w-[268px] min-[1101px]:max-w-none">
            <div className="border-b border-border px-3.5 py-2.5">
              <span className="label">Now reading</span>
            </div>

            <div className="flex items-start gap-3 px-3.5 py-3.5">
              <SourceMark key={site.name} site={site} />
              <div className="min-w-0">
                <p className="text-[14px] font-semibold leading-tight">
                  {site.name}
                </p>
                <p className="data mt-1.5 text-[11px] leading-snug text-muted">
                  {site.src}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The full roster, for anyone the canvas cannot reach. */}
      <ul className="sr-only">
        {SITES.map((s) => (
          <li key={s.name}>
            {s.name} — {s.src}
          </li>
        ))}
      </ul>
    </section>
  );
}
