"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Info,
  Users,
  MessageSquare,
  Gauge,
  AlertTriangle,
  Lock,
  Database,
  ShieldCheck,
  Stethoscope,
  FileText,
  Plus,
  type LucideIcon,
} from "lucide-react";

/**
 * A short marquee of pixel chevrons, clipped to a small window. The `.cta-march`
 * animation slides the row right by exactly one chevron-and-gap on a loop, so a
 * fresh arrow keeps arriving from the left — the "dynamic sliding arrows" the
 * original button animates in its pixel sprite. `crispEdges` keeps the 2px
 * blocks hard-edged instead of anti-aliased, which is what sells the pixel look.
 */
function PixelArrows({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block h-[10px] w-[14px] overflow-hidden ${className}`}
    >
      <span className="cta-march flex w-max items-center gap-[3px]">
        {Array.from({ length: 4 }).map((_, i) => (
          // Connected 2px-thick chevron ">": each row steps one pixel toward the
          // tip, so the diagonal stays joined instead of breaking into dots.
          <svg
            key={i}
            width="8"
            height="10"
            viewBox="0 0 4 5"
            fill="currentColor"
            shapeRendering="crispEdges"
            className="shrink-0"
          >
            <rect x="0" y="0" width="2" height="1" />
            <rect x="1" y="1" width="2" height="1" />
            <rect x="2" y="2" width="2" height="1" />
            <rect x="1" y="3" width="2" height="1" />
            <rect x="0" y="4" width="2" height="1" />
          </svg>
        ))}
      </span>
    </span>
  );
}

/**
 * The closing FAQ, ported from Armory's "Common inquiries" section: a fixed
 * header/CTA column on the left, a tabbed accordion on the right. Armory's tabs
 * were Overview/Security/Protocols/Licensing for an agent platform; here they
 * carve the questions a triage user actually arrives with — what it is, whether
 * it is safe, what it keeps, and whether any of it is advice.
 *
 * The CTA that used to close the page is folded into the left column rather than
 * dropped, so the route to a consultation survives the layout change.
 */

type Item = { icon: LucideIcon; q: string; a: string };
type Tab = { id: string; label: string; items: Item[] };

const TABS: Tab[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      {
        icon: Info,
        q: "What is MedTriage?",
        a: "A research triage system that reads what you describe, weighs several clinical sources at once, and returns a graded assessment with the reasoning attached. It is not a diagnosis and not a substitute for a clinician.",
      },
      {
        icon: Users,
        q: "Who is it for?",
        a: "Anyone trying to make sense of a symptom before deciding whether — and how urgently — to seek care. It is built to hand off to a human, not to replace one.",
      },
      {
        icon: MessageSquare,
        q: "How is it different from a chatbot?",
        a: "A chatbot just answers. MedTriage assigns every answer a triage level under rules the model cannot argue past, surfaces where its sources disagreed, and locks anything it is not permitted to decide.",
      },
    ],
  },
  {
    id: "safety",
    label: "Safety",
    items: [
      {
        icon: Gauge,
        q: "What do the three levels mean?",
        a: "Level 1 is safe to read directly, Level 2 is held for a physician to verify, and Level 3 is an emergency the system locks and escalates. The level is decided by rules before the model writes a word.",
      },
      {
        icon: AlertTriangle,
        q: "Can it handle an emergency?",
        a: "It is built to recognise one and escalate — not to manage it. If you think you are in danger, call your local emergency number now. Do not wait on the system.",
      },
      {
        icon: Lock,
        q: "Can a better prompt lower my level?",
        a: "No. Emergencies, escalations and prescription thresholds are floored by deterministic rules, and the model's output is clamped by them. Phrasing cannot talk its way to a lower level.",
      },
    ],
  },
  {
    id: "privacy",
    label: "Privacy",
    items: [
      {
        icon: Database,
        q: "What happens to what I describe?",
        a: "A per-conversation record is kept so the system can reason across your turns. This is a research build — treat it as one, and do not enter anything you would not want stored.",
      },
      {
        icon: ShieldCheck,
        q: "Is anything decided about me automatically?",
        a: "Nothing unreviewed reaches you. Raw retrieval never renders; only the audited, reconciled response is shown, and every one carries its level and its reasoning.",
      },
    ],
  },
  {
    id: "clinical",
    label: "Clinical",
    items: [
      {
        icon: Stethoscope,
        q: "Is this medical advice?",
        a: "No. It is decision support and a research demonstration. Every response says so, and anything clinical is either physician-verified or escalated to a human.",
      },
      {
        icon: FileText,
        q: "Can I see where an answer came from?",
        a: "Yes. Each assessment carries the sources it was built from, so you — or a clinician — can check the reasoning rather than take it on trust.",
      },
    ],
  },
];

export function FaqPanel() {
  const [tab, setTab] = useState(0);
  // One row open at a time; the first of each tab starts open, as Armory's does.
  const [open, setOpen] = useState(0);
  const items = TABS[tab].items;

  return (
    <div className="grid lg:grid-cols-[0.82fr_1.18fr] gap-12 lg:gap-0">
      {/* Left — header pinned top, intro + CTA pushed to the foot of the column
          so it lands level with the last accordion row on wide screens. */}
      <div className="flex flex-col justify-between lg:pr-16">
        <div>
          <p className="label mb-5">FAQ</p>
          <h2 className="display text-[2.6rem] sm:text-[3.4rem] max-w-[11ch]">
            Common questions
          </h2>
        </div>
        {/* Fixed top margin, not lg:mt-0 — justify-between distributes only the
            slack below the accordion, which on a two-item tab is almost none, so
            without a floor the intro rides up against the heading. */}
        <div className="mt-14">
          <p className="text-[15px] text-muted leading-relaxed max-w-[34ch] mb-6">
            Everything about how the triage works, what it can and can&rsquo;t
            do, and where a human steps in. Still unsure?
          </p>
          {/* Armory's FAQ button: an outline that fills on hover while the icon
              boxes up on the left and the label slides across to meet it. At rest
              the arrows sit to the right of the label with no box; on hover the
              fill lands, the right slot collapses to nothing, and a filled square
              opens on the left — so the whole cluster reads as sliding leftward.
              The colour pair is on-accent box / accent glyph, which inverts
              correctly in both themes (near-black button in light, near-white in
              dark). */}
          <Link
            href="/chat"
            className="group relative inline-flex h-11 items-center overflow-hidden rounded-[10px] border border-foreground/25 shadow-[var(--shadow-1)] transition-[background-color,border-color] duration-300 hover:border-accent hover:bg-accent"
          >
            {/* Left box — collapsed at rest, opens on hover. */}
            <span className="ml-[5px] flex h-[34px] w-0 shrink-0 items-center justify-center overflow-hidden rounded-[5px] bg-on-accent text-accent opacity-0 transition-all duration-300 ease-out group-hover:w-[34px] group-hover:opacity-100">
              <PixelArrows />
            </span>
            <span className="whitespace-nowrap pl-4 pr-3 text-[14px] font-medium text-foreground transition-[color,padding] duration-300 group-hover:pl-2.5 group-hover:text-on-accent">
              Start a consultation
            </span>
            {/* Right slot — visible at rest, collapses on hover. */}
            <span className="mr-3.5 flex w-[14px] shrink-0 items-center justify-center overflow-hidden text-muted opacity-100 transition-all duration-300 group-hover:mr-0 group-hover:w-0 group-hover:opacity-0">
              <PixelArrows />
            </span>
          </Link>
        </div>
      </div>

      {/* Right — tabbed accordion. */}
      <div className="lg:border-l lg:border-border lg:pl-16">
        <div className="flex rounded-lg border border-border overflow-hidden mb-2">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(i);
                setOpen(0);
              }}
              className={`flex-1 py-3 data text-[11px] uppercase tracking-[0.12em] transition-colors [&:not(:first-child)]:border-l border-border ${
                i === tab
                  ? "bg-accent text-on-accent"
                  : "text-muted hover:bg-sunk hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div>
          {items.map((item, i) => {
            const isOpen = i === open;
            const Icon = item.icon;
            return (
              <div key={item.q} className="border-b border-border">
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="group w-full flex items-center gap-4 py-5 text-left"
                >
                  <Icon className="w-[18px] h-[18px] text-muted shrink-0" />
                  <span className="flex-1 text-[15px] sm:text-[16px] text-foreground">
                    {item.q}
                  </span>
                  <span className="grid place-items-center w-7 h-7 rounded-full border border-border text-muted shrink-0 group-hover:text-foreground transition-colors">
                    <Plus
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    />
                  </span>
                </button>
                {/* 0fr→1fr grid rows animate height without measuring it. */}
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pl-[34px] pr-8 pb-5 text-[14px] text-muted leading-relaxed max-w-[62ch]">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
