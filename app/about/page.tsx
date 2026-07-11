"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

/* ── The signature: the guardian's actual decision table.

   This is the most credible thing the system owns. Every other medical assistant
   asks you to trust its judgement; this one publishes the rules that outrank its
   judgement. It is a table because it genuinely is one — a rule table, evaluated in
   order, before any model gets a say. ── */

const RULES = [
  {
    when: "An emergency is detected",
    then: 3,
    note: "Chest pain, breathing trouble, stroke signs, bleeding, overdose, self-harm. When in doubt the system calls it an emergency — a false alarm is cheaper than a missed one.",
  },
  {
    when: "The safety review escalates",
    then: 3,
    note: "A hallucinated claim, an unresolvable conflict between sources, or an unsafe recommendation.",
  },
  {
    when: "Safety risk is high",
    then: 3,
    note: "Including anything that contradicts a recorded allergy or interacts with a recorded medication.",
  },
  {
    when: "Confidence falls below 30%",
    then: 3,
    note: "A diagnosis nobody is confident in does not go to a patient.",
  },
  {
    when: "The answer names a drug or a dose",
    then: 2,
    note: "No prescription reaches a patient without a doctor. There is no exception to this one.",
  },
  {
    when: "The answer asks for a test, lab or scan",
    then: 2,
    note: "Ordering investigations is a clinical act.",
  },
  {
    when: "The sources needed a second look",
    then: 2,
    note: "Thin evidence gets re-retrieved once, and the case is held regardless of what comes back.",
  },
  {
    when: "The system is asking you a question",
    then: 1,
    note: "Requests for clarification are not diagnoses, so they are not held.",
  },
] as const;

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

/* ── Honest limits. The most persuasive page on a medical site is the one that
      tells you what it can't do. ── */

const LIMITS = [
  "This is a research system. It is not a medical device, it is not a diagnosis, and it is not a substitute for seeing a doctor.",
  "It cannot look at images — no rashes, no scans, no photographs.",
  "A Level 2 answer waits on a real human being, and humans are not instant.",
  "The map of related conditions needs a licensed terminology release. Where that is unavailable, that source reports nothing and says so.",
  "The model can still be wrong. The rules bound how much damage a wrong answer is allowed to do; they do not make the model right.",
];

const COLOPHON = [
  { what: "Interface", with: "Next.js, React, TypeScript, Tailwind" },
  { what: "Type", with: "Archivo, IBM Plex Mono" },
  { what: "Pipeline", with: "FastAPI, LangGraph" },
  { what: "Model", with: "Cerebras gpt-oss-120b" },
  { what: "Guidelines", with: "Pinecone vector search over WHO documents" },
  { what: "Related conditions", with: "SNOMED CT" },
  { what: "Live lookups", with: "FDA, PubMed, RxNorm, WHO" },
];

const TONE: Record<number, { text: string; rule: string }> = {
  1: { text: "text-t1", rule: "bg-t1" },
  2: { text: "text-t2", rule: "bg-t2" },
  3: { text: "text-t3", rule: "bg-t3" },
};

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

      {/* ── Thesis. The claim on the left; the claim being kept on the right. ── */}
      <section className="border-b border-border">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-16 sm:py-24 grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-12 lg:gap-16 items-center">
          <div className="rise">
            <p className="label mb-6">What this is</p>
            <h1 className="display text-[2.3rem] sm:text-[3rem] text-balance">
              Every medical AI asks you to trust its judgement. This one
              publishes the rules that overrule it.
            </h1>
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

      {/* ── The signature: the rule table ── */}
      <section className="border-b border-border">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="max-w-[56ch] mb-12">
            <p className="label mb-4">The rules</p>
            <h2 className="display text-[1.9rem] sm:text-[2.4rem]">
              The model proposes a level. These dispose.
            </h2>
            <p className="mt-4 text-[15px] text-muted leading-relaxed">
              Each rule is evaluated before the language model is asked for an
              opinion, and clamps the result afterwards. The model can argue for a
              lower level all it likes; it cannot have one. Neither can a cleverly
              worded prompt.
            </p>
          </div>

          <div className="border-t border-foreground">
            <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_5rem_minmax(0,1.4fr)] gap-6 py-2.5 border-b border-border">
              <span className="label">Condition</span>
              <span className="label">Level</span>
              <span className="label">Why</span>
            </div>

            {RULES.map((r) => {
              const tone = TONE[r.then];
              return (
                <div
                  key={r.when}
                  className="grid sm:grid-cols-[minmax(0,1fr)_5rem_minmax(0,1.4fr)] gap-x-6 gap-y-2 py-5 border-b border-border"
                >
                  <p className="text-[15px] font-medium">{r.when}</p>

                  <div className="flex items-center gap-2 sm:block">
                    <span className={`block w-6 h-[3px] ${tone.rule}`} />
                    <span
                      className={`data text-[12px] font-semibold sm:mt-1.5 sm:block ${tone.text}`}
                    >
                      {r.then === 1 ? "1" : r.then === 2 ? "2 min" : "3"}
                    </span>
                  </div>

                  <p className="text-[14px] text-muted leading-relaxed">
                    {r.note}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-[14px] text-muted leading-relaxed max-w-[62ch]">
            Where two rules apply, the stricter one wins. Where none applies, the
            model&apos;s judgement is used — and that only ever happens between
            Level 1 and Level 2, never for an emergency.
          </p>
        </div>
      </section>

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
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-10 lg:gap-20">
            <div>
              <p className="label mb-4">What it can&apos;t do</p>
              <h2 className="display text-[1.9rem] sm:text-[2.4rem]">
                The honest list.
              </h2>
            </div>

            <ul className="border-t border-foreground">
              {LIMITS.map((l) => (
                <li
                  key={l}
                  className="py-4 border-b border-border text-[15px] leading-relaxed"
                >
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Colophon ── */}
      <section className="border-b border-border">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <p className="label mb-8">Built with</p>
          <dl className="border-t border-border">
            {COLOPHON.map((c) => (
              <div
                key={c.what}
                className="grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)] gap-6 py-3 border-b border-border"
              >
                <dt className="data text-[12px] text-muted">{c.what}</dt>
                <dd className="data text-[12px]">{c.with}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Close ── */}
      <section>
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="max-w-[46ch]">
            <h2 className="display text-[2rem] sm:text-[2.6rem]">
              Read the rules. Then try it.
            </h2>
            <p className="mt-5 text-[15px] text-muted leading-relaxed">
              Every answer you get will tell you which of those rules decided how
              it reached you.
            </p>
            <Link
              href="/chat"
              className="group mt-9 inline-flex items-center gap-2.5 h-11 px-5 bg-accent text-on-accent text-sm font-medium hover:opacity-85 transition-opacity"
            >
              Start a consultation
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
