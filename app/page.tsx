"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HeroStage } from "./components/HeroStage";
import { HeroScope } from "./components/HeroScope";
import { LevelScale } from "./components/LevelScale";
import { TerminalReplay } from "./components/TerminalReplay";
import { ControlBoundary } from "./components/ControlBoundary";
import { FaqPanel } from "./components/FaqPanel";
import { LEVELS } from "./lib/levels";


const PRINCIPLES = [
  {
    title: "The rules outrank the model",
    body: "Emergencies, escalations and prescriptions are floored by rules the language model cannot argue past. A better prompt cannot lower your triage level.",
  },
  {
    title: "Disagreement is surfaced, not averaged",
    body: "Three sources are consulted at once and they frequently conflict. That conflict is resolved on evidence and recorded — or escalated to a human, never smoothed over.",
  },
  {
    title: "Nothing unreviewed reaches you",
    body: "Raw retrieval never renders. Only the audited, reconciled response is shown, and every one carries its level and its reasoning.",
  },
  {
    // Narrowed from "colour is never decoration anywhere" once the diagram above
    // started using green and red as plain affirm/deny marks. The claim that still
    // holds — and the one that matters — is about the assessment itself.
    title: "Colour means risk where it counts",
    body: "Inside a consultation the triage scale is the only thing coloured: green, amber and red tell you how far the system was allowed to answer, and nothing else borrows them.",
  },
];

/* ── The visuals that sit in the capability rows ── */

function LedgerPanel() {
  return (
    <div className="w-full max-w-[440px] mx-auto">
      <div className="flex items-baseline justify-between border-b border-foreground pb-2.5 mb-1">
        <span className="label">Who is in control</span>
        <span className="label">By level</span>
      </div>

      {LEVELS.map((l, i) => (
        <div key={l.level} className="py-4 border-b border-border last:border-b-0">
          <div className="flex items-baseline gap-2.5 mb-3">
            <span
              className="data text-[11px] font-semibold"
              style={{ color: `var(--${l.tone})` }}
            >
              L{l.level}
            </span>
            <span className="text-[13px] font-medium">{l.name}</span>
          </div>

          {(["AI", "Physician"] as const).map((who, j) => {
            const value = who === "AI" ? l.ai : l.md;
            return (
              <div
                key={who}
                className="grid grid-cols-[4.25rem_minmax(0,1fr)_2.25rem] items-center gap-2.5 mb-1.5 last:mb-0"
              >
                <span className="label">{who}</span>
                <div className="relative h-[6px] bg-border/60">
                  {value > 0 && (
                    <div
                      className="bar-draw absolute inset-y-0 left-0"
                      style={{
                        width: `${value}%`,
                        backgroundColor: `var(--${l.tone})`,
                        animationDelay: `${i * 120 + j * 60}ms`,
                      }}
                    />
                  )}
                </div>
                <span className="data text-[11px] text-muted text-right">
                  {value}%
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const RULES_FIRED = [
  "The answer asks for a throat swab.",
  "The answer names an antibiotic and a dose.",
];

/* The overrule: the model asks to answer directly, two rules fire on what it wrote,
   and the level it wanted is struck out and raised. One gesture, and it is the whole
   product. */
function OverrulePanel() {
  return (
    <div className="w-full max-w-[420px] mx-auto">
      <p className="label mb-3">The model proposed</p>

      <div className="relative inline-flex items-center gap-3 pr-2 mb-8">
        <span className="block w-7 h-[3px] bg-t1" />
        <span className="data text-[13px] font-semibold text-t1">Level 1</span>
        <span className="text-[14px] text-muted">Answer directly</span>
        <span
          className="strike absolute left-0 right-0 top-1/2 h-[1.5px] bg-foreground"
          style={{ animationDelay: "700ms" }}
          aria-hidden
        />
      </div>
      <p className="sr-only">This proposal was overruled by the rules below.</p>

      <p className="label mb-3">Rules that fired</p>
      <ul className="space-y-2 mb-8">
        {RULES_FIRED.map((r) => (
          <li
            key={r}
            className="grid grid-cols-[1rem_minmax(0,1fr)] gap-2 text-[13.5px] leading-snug"
          >
            <span className="data text-muted">→</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>

      <p className="label mb-3">Released as</p>
      <div className="flex items-center gap-3">
        <span className="block w-7 h-[3px] bg-t2" />
        <span className="data text-[13px] font-semibold text-t2">Level 2</span>
        <span className="text-[14px]">Held for a doctor</span>
      </div>
    </div>
  );
}

const CAPABILITIES = [
  {
    n: "01",
    title: "Every condition it ruled out",
    body: "The assessment walks a clinical terminology to find the disorders worth ruling out, weighs each against the evidence, and shows you the ones it dropped. A differential you can see is the difference between explaining a decision and asserting one.",
    visual: <HeroScope />,
  },
  {
    n: "02",
    title: "Rules the model cannot argue past",
    body: "Before the model is asked for an opinion — and again after — a table of deterministic rules decides how far it was allowed to answer. Naming a drug, ordering a test, or missing an emergency each carry a floor no prompt can talk its way underneath.",
    visual: <OverrulePanel />,
  },
  {
    n: "03",
    title: "Who was in control, on every answer",
    body: "Each reply arrives stamped with how much of it the system was permitted to decide and how much waited on a human. Autonomy is not a setting here; it is an outcome of your risk.",
    visual: <LedgerPanel />,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* ══ Hero — pinned; the assembly is scrubbed against scroll ════════ */}
      <section className="relative">
        <HeroStage>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <Link
              href="/chat"
              className="group inline-flex items-center gap-2.5 h-12 px-6 rounded-full bg-accent text-on-accent text-[14px] font-medium hover:opacity-85 transition-opacity"
            >
              Start a consultation
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center h-12 px-6 rounded-full border border-border bg-card text-[14px] text-muted hover:text-foreground hover:border-foreground transition-colors"
            >
              How it works
            </Link>
          </div>
        </HeroStage>
      </section>

      {/* ══ Capabilities ══════════════════════════════════════════════════

          Near-flush to the viewport edge. Ponder's `.wrapper_general` carries only
          `2rem` of side padding, and that is most of why its rows feel architectural
          rather than like a centred document — a 1400px column on a 1920px screen
          leaves 260px of margin and reads as timid.

          Inside each row the number is a COLUMN beside the heading (`.number_text
          { width:25% }`), not a badge stacked above it, and the body copy is pushed
          to the floor of the row by `.content_box { justify-content:space-between;
          height:100% }`. That vertical gap between heading and body is doing real
          work: it is what makes the row feel composed instead of packed. ══ */}
      <section className="px-5 sm:px-8 pb-6">
        <div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-12 sm:pb-16">
            <h2 className="display text-[3rem] sm:text-[4.6rem] lg:text-[5.5rem] max-w-[14ch]">
              What it shows you
            </h2>
            <p className="text-[15px] text-muted leading-relaxed max-w-[34ch] lg:text-right lg:pb-3">
              Three things every answer carries — the working, the rules that bound
              it, and who was allowed to decide.
            </p>
          </div>

          <div className="space-y-5">
            {CAPABILITIES.map((c) => (
              <article
                key={c.n}
                className="flex flex-col lg:flex-row gap-1 rounded-xl border border-border bg-card p-1"
              >
                {/* The row's height comes from the panel opposite, not from here.
                    Ponder pins its body copy to the floor with `justify-content:
                    space-between`, which works when the facing asset is a fixed
                    21.5em screenshot; against a live SVG that sizes itself from the
                    column width it just opens a void. So the text block keeps its
                    own rhythm and is centred against whatever the panel turns out
                    to be. */}
                <div className="lg:w-[62%] p-6 sm:p-9 lg:p-11 flex items-center">
                  <div className="flex items-start gap-4 sm:gap-8 w-full">
                    {/* Dashed, like Ponder's `.number_tag`. A solid rule would read
                        as a control; a dashed one reads as an annotation. */}
                    <div className="shrink-0 sm:w-[20%]">
                      <span className="data inline-flex items-center justify-center rounded border border-dashed border-border px-3.5 py-2 text-[13px] text-muted">
                        {c.n}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col gap-7">
                      <h3 className="display text-[2rem] sm:text-[2.8rem] max-w-[17ch]">
                        {c.title}
                      </h3>
                      <p className="text-[14.5px] text-muted leading-relaxed max-w-[42ch]">
                        {c.body}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ponder gives the asset only 30%. These panels hold live SVG with
                    real labels rather than a screenshot, so they get 38% — below
                    that the differential's condition names stop being readable. */}
                <div className="lg:w-[38%] rounded-lg bg-sunk flex items-center justify-center p-5 sm:p-7">
                  {/* Capped, or a 720x430 viewBox at `w-full` sets the row height and
                      everything beside it has to live with the result. */}
                  <div className="w-full max-w-[500px]">{c.visual}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══ The three levels ══════════════════════════════════════════════ */}
      <section className="px-4 sm:px-6 py-20 sm:py-28">
        <div className="max-w-[1180px] mx-auto border-x border-border px-6 sm:px-12 py-4">
          <p className="label mb-6">From answer to escalation</p>
          <h2 className="display text-[2.4rem] sm:text-[3.4rem] max-w-[16ch]">
            The model proposes.
            <br />
            The rules dispose.
          </h2>
          <p className="mt-6 text-[15px] sm:text-base text-muted leading-relaxed max-w-[54ch]">
            Every reply lands on one of three levels, and the level decides who was
            allowed to release it. Higher stakes buy tighter oversight — that trade
            is the whole design.
          </p>

          <LevelScale />
        </div>
      </section>

      {/* ══ One turn ══════════════════════════════════════════════════════
          Sits after the levels on purpose: the transcript ends on a ruling, and
          "level 2" only means something once the scale above has taught it. ══ */}
      <section className="px-4 sm:px-6 py-20 sm:py-28 overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-14 sm:mb-16">
            <p className="label mb-6">One consultation, replayed</p>
            <h2 className="display text-[2.4rem] sm:text-[3.4rem] max-w-[18ch] mx-auto">
              Watch one turn decide itself.
            </h2>
            <p className="mt-6 text-[15px] sm:text-base text-muted leading-relaxed max-w-[52ch] mx-auto">
              A recording of a real consultation, not a live session. Three sources
              are read at once, reconciled, and the result is released at whatever
              level the rules allow — here, not to you.
            </p>
          </div>

          <TerminalReplay />
        </div>
      </section>

      {/* ══ Constraints ═══════════════════════════════════════════════════ */}
      <section className="px-4 sm:px-6 pb-20 sm:pb-28">
        <div className="max-w-[1400px] mx-auto rounded-2xl border border-border bg-card p-6 sm:p-12 lg:p-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-16">
            <h2 className="display text-[2.4rem] sm:text-[3.4rem] max-w-[13ch]">
              Constraints, not promises.
            </h2>
            <p className="text-[15px] text-muted leading-relaxed max-w-[38ch] lg:text-right lg:pb-2">
              Four things the system is not permitted to do, whatever it decides.
            </p>
          </div>

          {/* The two constraints that are severed connections rather than
              behaviours get drawn; the other two stay as text below, because a
              diagram that forces every claim into the same shape starts lying. */}
          <div className="max-w-[860px] mx-auto mb-16 sm:mb-20">
            <ControlBoundary />
          </div>

          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="border-t border-foreground pt-5">
                <h3 className="display-sm text-[1.15rem] mb-2.5">{p.title}</h3>
                <p className="text-[14.5px] text-muted leading-relaxed max-w-[48ch]">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Close ═════════════════════════════════════════════════════════ */}
      <section className="px-4 sm:px-6 pb-24 sm:pb-32">
        <div className="max-w-[1400px] mx-auto">
          <FaqPanel />
        </div>
      </section>

      <Footer />
    </div>
  );
}
