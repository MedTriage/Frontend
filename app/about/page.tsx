"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { AboutHero } from "../components/AboutHero";
import { CometCard } from "../components/CometCard";
import { LimitScale } from "../components/LimitScale";
import { RuleGrid } from "../components/RuleGrid";
import { SecondsBand } from "../components/SecondsBand";
import { StackCard } from "../components/StackCard";

/* The rule table itself now lives in `app/lib/rules.ts` and is rendered by
   `RuleGrid`. It kept growing a second job — copy, levels, plates and layout
   spans — and a page file is the wrong place for a safety-critical data set
   that other things need to read. */

/* ── What the system is actually made of. Named as a patient meets them. ── */

const PARTS = [
  {
    name: "The record",
    does: "Keeps a running note of what you have said you have, what you take, and what you are allergic to — so a later message is read in the light of the earlier ones, and a recommendation can be checked against your allergies.",
  },
  {
    name: "The router",
    does: "Decides one thing only: is this clinical or is this conversation. It deliberately does not judge severity, because severity is decided later by something that has read the evidence.",
  },
  {
    name: "Three sources, at once",
    does: "Clinical guidelines, a map of related conditions, and live lookups in FDA and PubMed. They are consulted in parallel and they frequently disagree.",
  },
  {
    name: "The reconciler",
    does: "Reads all three, resolves disagreement on the evidence rather than by majority, checks every claim against the source it came from, and flags emergencies. If one source came back thin, it sends that one — and only that one — back to look again.",
  },
  {
    name: "The guardian",
    does: "Applies the rules above. It is the only component permitted to set your triage level, and it is the last thing that runs.",
  },
];

/* ── How it fails. Every one of these is a real, exercised code path. ── */

const FAILURES = [
  {
    when: "A source can't be reached",
    then: "It is dropped as unusable rather than counted as silence. The remaining sources carry the answer, and the consultation tells you which one was missing.",
  },
  {
    when: "The safety review itself fails",
    then: "The case escalates to a physician. A broken reviewer never results in an unreviewed answer reaching you.",
  },
  {
    when: "The guardian fails",
    then: "The case defaults to physician review. There is no failure mode in which a fault produces a Level 1 answer.",
  },
  {
    when: "The model returns nothing usable",
    then: "You are told so. Raw, un-audited retrieval is never shown to a patient — not as a fallback, not ever.",
  },
];


/* ── The hero graphic: the overrule, happening.

   The headline claims the rules outrank the model. Rather than assert that again
   in a diagram, this shows one real case doing it — the model asks to answer
   directly, two rules fire on what it wrote, and the level it wanted is struck
   out and raised. The strike is the whole product in one gesture. Colour is
   carried only by the two triage levels, which is the only thing it is ever
   allowed to mean. ── */

const RULES_FIRED = [
  "The answer asks for a throat swab.",
  "The answer names an antibiotic and a dose.",
];

function Overrule() {
  return (
    <figure className="border border-border bg-card">
      <figcaption className="flex items-baseline justify-between px-5 py-3 border-b border-border">
        <span className="label">One case</span>
        <span className="label">Worked through</span>
      </figcaption>

      {/* What was asked */}
      <div
        className="px-5 py-5 border-b border-border rise"
        style={{ animationDelay: "120ms" }}
      >
        <p className="text-[15px] leading-relaxed">
          “I&apos;ve had a sore throat and a fever for three days.”
        </p>
      </div>

      {/* What the model wanted */}
      <div
        className="px-5 py-5 border-b border-border rise"
        style={{ animationDelay: "420ms" }}
      >
        <p className="label mb-3">The model proposed</p>

        <div className="relative inline-flex items-center gap-3 pr-2">
          <span
            className="block w-8 h-[3px] bg-t1 bar-draw"
            style={{ animationDelay: "480ms" }}
          />
          <span className="data text-[13px] font-semibold text-t1">
            Level 1
          </span>
          <span className="text-[14px] text-muted">Answer directly</span>

          {/* The moment: the level it asked for, taken away. */}
          <span
            className="strike absolute left-0 right-0 top-1/2 h-[1.5px] bg-foreground"
            style={{ animationDelay: "1240ms" }}
            aria-hidden
          />
        </div>
        <p className="sr-only">
          This proposal was overruled by the rules below.
        </p>
      </div>

      {/* What overruled it */}
      <div
        className="px-5 py-5 border-b border-border rise"
        style={{ animationDelay: "760ms" }}
      >
        <p className="label mb-3">Rules that fired</p>
        <ul className="space-y-2">
          {RULES_FIRED.map((r, i) => (
            <li
              key={r}
              className="grid grid-cols-[1rem_minmax(0,1fr)] gap-2 text-[14px] leading-snug rise"
              style={{ animationDelay: `${860 + i * 160}ms` }}
            >
              <span className="data text-muted">→</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* What actually happened */}
      <div
        className="px-5 py-5 rise"
        style={{ animationDelay: "1380ms" }}
      >
        <p className="label mb-3">Released as</p>
        <div className="flex items-center gap-3">
          <span
            className="block w-8 h-[3px] bg-t2 bar-draw"
            style={{ animationDelay: "1440ms" }}
          />
          <span className="data text-[13px] font-semibold text-t2">
            Level 2
          </span>
          <span className="text-[14px]">Held for a doctor</span>
        </div>
        <p className="text-[13px] text-muted leading-relaxed mt-3">
          No prescription reaches a patient without a doctor. The model does not
          get a vote on that.
        </p>
      </div>
    </figure>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <AboutHero />

      {/* ── Thesis. The claim on the left; the claim being kept on the right. ── */}
      <section className="border-b border-border">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-16 sm:py-24 grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-12 lg:gap-16 items-center">
          <div className="rise">
            <p className="label mb-6">What this is</p>
            <h2 className="display text-[2.3rem] sm:text-[3rem] text-balance">
              Every medical AI asks you to trust its judgement. This one
              publishes the rules that overrule it.
            </h2>
            <p className="mt-7 text-base text-muted leading-relaxed max-w-[52ch]">
              MedTriage answers health questions, and then decides — before you
              see anything — how far it was allowed to answer on its own. Most of
              this page is about the second half of that sentence, because the
              second half is the part that keeps you safe.
            </p>
          </div>

          <Overrule />
        </div>
      </section>

      {/* ── The signature: the rule table, as a grid ── */}
      <RuleGrid />

      {/* ── The parts ── */}
      <section className="border-b border-border">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="max-w-[56ch] mb-12">
            <p className="label mb-4">The parts</p>
            <h2 className="display text-[1.9rem] sm:text-[2.4rem]">
              Five things, and only one of them can set your level.
            </h2>
          </div>

          <div className="border-t border-foreground">
            {PARTS.map((part) => (
              <div
                key={part.name}
                className="grid md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] gap-x-10 gap-y-2 py-6 border-b border-border"
              >
                <h3 className="text-[15px] font-semibold">{part.name}</h3>
                <p className="text-[15px] text-muted leading-relaxed max-w-[70ch]">
                  {part.does}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The wait ──
          Placed here on purpose: the reader has just been handed the five parts,
          so the next thing owed to them is those parts running. It is also the
          page's only full-bleed section, which is the break the rhythm needs
          after three ruled tables in a row. ── */}
      <SecondsBand />

      {/* ── Failure ── */}
      <section className="border-b border-border">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="max-w-[56ch] mb-12">
            <p className="label mb-4">When it breaks</p>
            <h2 className="display text-[1.9rem] sm:text-[2.4rem]">
              Every failure falls towards a human.
            </h2>
            <p className="mt-4 text-[15px] text-muted leading-relaxed">
              Software fails. The question worth asking of a medical system is not
              whether it fails, but which way it falls when it does.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-px bg-border border border-border">
            {FAILURES.map((f) => (
              <div key={f.when} className="bg-background p-6 sm:p-7">
                <h3 className="text-[15px] font-semibold mb-2.5">{f.when}</h3>
                <p className="text-[14px] text-muted leading-relaxed">{f.then}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Limits ── */}
      <section className="border-b border-border">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="max-w-[56ch] mb-12">
            <p className="label mb-4">What it can&apos;t do</p>
            <h2 className="display text-[1.9rem] sm:text-[2.4rem]">
              The honest list.
            </h2>
            <p className="mt-4 text-[15px] text-muted leading-relaxed">
              Five of them, one at a time. The second is the one about images, and
              its plate is that limit happening — it coarsens until you cannot read
              it either.
            </p>
          </div>

          <LimitScale />
        </div>
      </section>

      {/* ── Colophon ── */}
      <StackCard />

      {/* ── Close ──

          The one place on the page carrying decoration that admits to being
          decoration: the card tilts and catches light, and it is not showing you
          anything. It earns that by being last. Every claim has been made and
          every limit admitted by this point, so what is left is an invitation,
          and an object you can turn over asks better than another paragraph.

          The picture is a door standing open — the only subject in this family
          that means *begin*, and deliberately the lightest and calmest image on
          a page that opens with an ambulance at night.

          NOTE: this image is stylistically off-family. Everything else in
          /public/rules is bold-lined, high-contrast cel shading; this came back
          loose and pastel and the Runway workspace ran out of credits before it
          could be reshot. It survives here because the tonal shift happens to
          land where the page wants one — six sections after the grid, at the
          quiet end. It is still the wrong hand, and it should be regenerated
          against /public/rules/clarify.jpg as a style reference. ── */}
      <section>
        <div className="mx-auto grid max-w-[1180px] items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
          <div className="max-w-[46ch]">
            <h2 className="display text-[2rem] sm:text-[2.6rem]">
              Ask it something.
            </h2>
            <p className="mt-5 text-[15px] text-muted leading-relaxed">
              You get an answer, the level it was released at, and the rule that
              decided it. If it needs a doctor, it says so and waits for one.
            </p>
            <Link
              href="/chat"
              className="group mt-9 inline-flex items-center gap-2.5 h-11 px-5 bg-accent text-on-accent text-sm font-medium hover:opacity-85 transition-opacity"
            >
              Start a consultation
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Inset rather than bled to the edge, which is how the component is
              meant to be used: the mount is what makes the tilt legible. A
              picture running to the card's own edge gives the eye nothing
              stationary to judge the rotation against, and the whole thing reads
              as a wobbling image instead of a card being turned over.

              It links to the same place as the button rather than being inert —
              once the face says "Start a consultation" it has to go somewhere,
              and a card that invites a click and refuses one is worse than a
              card that never invited it. */}
          <CometCard className="mx-auto w-full max-w-[400px]">
            <Link
              href="/chat"
              aria-label="Start a consultation"
              className="group block rounded-2xl border border-border bg-card p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-sunk">
                <Image
                  src="/close/door.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 90vw, 400px"
                  className="object-cover"
                />
              </div>

              <div className="flex items-center justify-between px-1.5 pb-1 pt-4">
                <span className="text-[14px] font-medium">
                  Start a consultation
                </span>
                <ArrowRight
                  aria-hidden
                  className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5"
                />
              </div>
              {/* "No account needed" and nothing more. The obvious second half
                  of a line like this is a privacy claim, and this product cannot
                  make one: a Level 2 answer is POSTed to the physician queue in
                  `/api/doctor/cases`, so "nothing leaves your browser" would be
                  false. Do not add it back. */}
              <p className="px-1.5 pt-1 text-[12px] leading-relaxed text-muted">
                No account needed.
              </p>
            </Link>
          </CometCard>
        </div>
      </section>

      <Footer />
    </div>
  );
}
