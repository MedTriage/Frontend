"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

/* ── The scale. Autonomy falls as risk rises; oversight takes its place. ── */

const LEVELS = [
  {
    level: 1,
    name: "Direct",
    ai: 100,
    md: 0,
    tone: "t1",
    holds: "The system answers you itself.",
    detail:
      "General health questions and conversation. Nothing is diagnosed, nothing is prescribed, and no one is waiting on it.",
    asks: [
      "What are the symptoms of seasonal allergies?",
      "Is it normal to feel tired after flu?",
    ],
  },
  {
    level: 2,
    name: "Physician-verified",
    ai: 50,
    md: 50,
    tone: "t2",
    holds: "A doctor signs it off before you read it.",
    detail:
      "Anything that names a condition, recommends a test, or reaches for a drug. The assessment is drafted, held, and released only once a clinician approves it.",
    asks: [
      "I've had a cough and fever for three days",
      "My child has an ear infection",
    ],
  },
  {
    level: 3,
    name: "Locked",
    ai: 0,
    md: 100,
    tone: "t3",
    holds: "The AI stops talking and sends you to care.",
    detail:
      "Life-threatening presentations. The model is locked out of the conversation for the rest of the session and you are directed to emergency services.",
    asks: ["Severe chest pain, can't breathe", "Someone is having a seizure"],
  },
] as const;

/* ── The pipeline. Three sources are consulted at once, then reconciled. ── */

/* Named exactly as a patient meets them in the consultation — the product has one
   vocabulary, and it is the patient's, not the codebase's. */
const RETRIEVERS = [
  {
    name: "Clinical guidelines",
    detail:
      "Semantic search across WHO and published treatment guidance held in a vector index.",
  },
  {
    name: "Related conditions",
    detail:
      "The SNOMED CT clinical terminology, walked to surface the specific disorders worth ruling out.",
  },
  {
    name: "FDA & PubMed",
    detail:
      "Live lookups against the FDA drug database, PubMed, RxNorm and WHO statistics.",
  },
] as const;

const PRINCIPLES = [
  {
    title: "Colour means risk",
    body: "Nothing in this interface is coloured for decoration. If you see green, amber or red, it is telling you the triage level of what you are reading — and nothing else does.",
  },
  {
    title: "The rules outrank the model",
    body: "Emergencies, escalations and prescriptions are floored by deterministic rules the language model cannot argue its way past. A better prompt cannot lower your triage level.",
  },
  {
    title: "Disagreement is surfaced, not averaged",
    body: "When the three sources conflict, the orchestrator resolves it on evidence and records that it did. Unresolved clinical conflict escalates to a human rather than being smoothed over.",
  },
  {
    title: "Nothing unreviewed reaches you",
    body: "Raw retrieval never renders. Only the audited, reconciled response is shown, and every one of them carries its level and its reasoning.",
  },
];

/* ── Bar: the unit the ledger is built from ── */

function Bar({
  value,
  tone,
  delay,
}: {
  value: number;
  tone: string;
  delay: number;
}) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="relative h-[6px] flex-1 bg-border/60 min-w-0">
        {value > 0 && (
          <div
            className="bar-draw absolute inset-y-0 left-0"
            style={{
              width: `${value}%`,
              backgroundColor: `var(--${tone})`,
              animationDelay: `${delay}ms`,
            }}
          />
        )}
      </div>
      <span className="data text-[11px] tabular-nums w-9 text-right shrink-0 text-muted">
        {value}%
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* ── Hero: the ledger is the argument ── */}
      <section className="border-b border-border">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-16 sm:py-24 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-14 lg:gap-20 items-center">
          <div className="rise">
            <p className="label mb-6">Graduated autonomy</p>
            <h1 className="display text-[2.6rem] sm:text-[3.4rem] lg:text-[3.9rem] text-balance">
              The system gives up control as your risk goes up.
            </h1>
            <p className="mt-7 text-[15px] sm:text-base text-muted leading-relaxed max-w-[46ch]">
              Ask something low-risk and you get an answer straight back.
              Describe something clinical and a physician signs it off before you
              ever see it. Describe an emergency and the AI locks itself out of
              the conversation and sends you to care.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/chat"
                className="group inline-flex items-center gap-2.5 h-11 px-5 bg-accent text-on-accent text-sm font-medium hover:opacity-85 transition-opacity"
              >
                Start a consultation
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center h-11 px-5 border border-border text-sm text-muted hover:text-foreground hover:border-foreground transition-colors"
              >
                How it works
              </Link>
            </div>
          </div>

          {/* The signature */}
          <figure className="min-w-0">
            <figcaption className="flex items-baseline justify-between pb-3 border-b border-foreground">
              <span className="label">Who is in control</span>
              <span className="label">By triage level</span>
            </figcaption>

            {LEVELS.map((l, i) => (
              <div
                key={l.level}
                className="py-6 border-b border-border last:border-b-0"
              >
                <div className="flex items-baseline gap-3 mb-4">
                  <span
                    className="data text-[11px] font-semibold"
                    style={{ color: `var(--${l.tone})` }}
                  >
                    L{l.level}
                  </span>
                  <span className="text-sm font-semibold">{l.name}</span>
                  <span className="ml-auto text-[13px] text-muted text-right">
                    {l.holds}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3">
                    <span className="label">AI</span>
                    <Bar value={l.ai} tone={l.tone} delay={i * 110} />
                  </div>
                  <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3">
                    <span className="label">Physician</span>
                    <Bar value={l.md} tone={l.tone} delay={i * 110 + 55} />
                  </div>
                </div>
              </div>
            ))}
          </figure>
        </div>
      </section>

      {/* ── The levels, in full ── */}
      <section className="border-b border-border">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="max-w-[52ch] mb-12">
            <p className="label mb-4">The scale</p>
            <h2 className="display text-[1.9rem] sm:text-[2.4rem]">
              Three levels, and the price of each.
            </h2>
            <p className="mt-4 text-[15px] text-muted leading-relaxed">
              Higher stakes buy tighter oversight. That trade is the whole
              design: the more the answer could hurt you, the less the model is
              allowed to decide on its own.
            </p>
          </div>

          <div className="border-t border-foreground">
            {LEVELS.map((l) => (
              <div
                key={l.level}
                className="grid md:grid-cols-[7rem_minmax(0,1fr)_minmax(0,20rem)] gap-5 md:gap-10 py-8 border-b border-border"
              >
                <div className="flex md:block items-center gap-3">
                  <span
                    className="block w-8 h-[3px] mb-3"
                    style={{ backgroundColor: `var(--${l.tone})` }}
                  />
                  <span className="data text-[11px] tracking-[0.14em] uppercase text-muted">
                    Level {l.level}
                  </span>
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-semibold mb-2">{l.name}</h3>
                  <p className="text-[15px] text-muted leading-relaxed">
                    {l.detail}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="label mb-3">Sounds like</p>
                  <ul className="space-y-2">
                    {l.asks.map((a) => (
                      <li
                        key={a}
                        className="data text-[12px] text-muted leading-relaxed pl-3 border-l border-border"
                      >
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pipeline: honest about what is parallel and what is sequential ── */}
      <section className="border-b border-border">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="max-w-[52ch] mb-12">
            <p className="label mb-4">The pipeline</p>
            <h2 className="display text-[1.9rem] sm:text-[2.4rem]">
              Three sources, consulted at once, then reconciled.
            </h2>
            <p className="mt-4 text-[15px] text-muted leading-relaxed">
              Every clinical question is put to three independent retrievers in
              parallel. They frequently disagree. Resolving that disagreement —
              on the evidence, not by majority — is the job of the orchestrator.
            </p>
          </div>

          <ol className="border-t border-foreground">
            <li className="grid md:grid-cols-[10rem_minmax(0,1fr)] gap-2 md:gap-10 py-6 border-b border-border">
              <span className="label pt-1">Record</span>
              <div>
                <h3 className="text-sm font-semibold mb-1.5">Scribe</h3>
                <p className="text-[14px] text-muted leading-relaxed max-w-[62ch]">
                  Keeps a running medical record for the conversation — what you
                  have said you have, what you take, what you are allergic to —
                  so later turns are read in the light of earlier ones.
                </p>
              </div>
            </li>

            <li className="grid md:grid-cols-[10rem_minmax(0,1fr)] gap-2 md:gap-10 py-6 border-b border-border">
              <span className="label pt-1">Route</span>
              <div>
                <h3 className="text-sm font-semibold mb-1.5">Intent router</h3>
                <p className="text-[14px] text-muted leading-relaxed max-w-[62ch]">
                  Decides only one thing: is this clinical or not. It does not
                  judge severity — that is deliberately somebody else&apos;s job.
                </p>
              </div>
            </li>

            {/* The fan-out. Drawn as parallel because it is parallel. */}
            <li className="grid md:grid-cols-[10rem_minmax(0,1fr)] gap-2 md:gap-10 py-6 border-b border-border">
              <span className="label pt-1">Retrieve · in parallel</span>
              <div className="grid sm:grid-cols-3 gap-px bg-border border border-border">
                {RETRIEVERS.map((r) => (
                  <div key={r.name} className="bg-background p-4">
                    <h3 className="text-sm font-semibold mb-1.5">{r.name}</h3>
                    <p className="text-[13px] text-muted leading-relaxed">
                      {r.detail}
                    </p>
                  </div>
                ))}
              </div>
            </li>

            <li className="grid md:grid-cols-[10rem_minmax(0,1fr)] gap-2 md:gap-10 py-6 border-b border-border">
              <span className="label pt-1">Reconcile</span>
              <div>
                <h3 className="text-sm font-semibold mb-1.5">Orchestrator</h3>
                <p className="text-[14px] text-muted leading-relaxed max-w-[62ch]">
                  Reads all three, resolves conflicts on evidence, checks every
                  claim against its source, and flags emergencies. If a source
                  came back thin, it sends that one — and only that one — back to
                  look again.
                </p>
              </div>
            </li>

            <li className="grid md:grid-cols-[10rem_minmax(0,1fr)] gap-2 md:gap-10 py-6 border-b border-border">
              <span className="label pt-1">Rule</span>
              <div>
                <h3 className="text-sm font-semibold mb-1.5">Guardian</h3>
                <p className="text-[14px] text-muted leading-relaxed max-w-[62ch]">
                  Assigns the triage level, and is the only component permitted
                  to. Emergencies, escalations, low confidence and any mention of
                  a drug or a test hit hard floors that the model cannot talk its
                  way underneath.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* ── Principles ── */}
      <section className="border-b border-border">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <p className="label mb-4">What we hold to</p>
          <h2 className="display text-[1.9rem] sm:text-[2.4rem] mb-12 max-w-[20ch]">
            Constraints, not promises.
          </h2>

          <div className="grid sm:grid-cols-2 gap-px bg-border border border-border">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="bg-background p-6 sm:p-8">
                <h3 className="text-[15px] font-semibold mb-2.5">{p.title}</h3>
                <p className="text-[14px] text-muted leading-relaxed">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Close ── */}
      <section>
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20 sm:py-28 text-center">
          <h2 className="display text-[2rem] sm:text-[2.8rem] max-w-[18ch] mx-auto">
            Describe what&apos;s wrong. We&apos;ll show our working.
          </h2>
          <p className="mt-5 text-[15px] text-muted max-w-[52ch] mx-auto leading-relaxed">
            Every answer arrives tagged with its level, and you can open the
            reasoning behind it — what was retrieved, what disagreed, and why the
            guardian ruled the way it did.
          </p>
          <Link
            href="/chat"
            className="group mt-9 inline-flex items-center gap-2.5 h-11 px-5 bg-accent text-on-accent text-sm font-medium hover:opacity-85 transition-opacity"
          >
            Start a consultation
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
