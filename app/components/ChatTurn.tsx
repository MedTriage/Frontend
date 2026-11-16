"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { LEVELS } from "../lib/levels";
import { litPath, phaseOf } from "./site/Moon";
import { LogoMark } from "./site/ui";

/* ── One answer in a consultation ──
 *
 * Quiet on purpose. The first version (2026-11-15) set every answer in a card under a
 * full-width colour strip, and with the helplines and hospitals under it the owner found
 * far too much on the page. An answer is now the logo, one line saying who answered, and
 * the text straight on the page. The level is a small chip in that level's colour with
 * ink type; a reply with no level (child health) gets an ink chip, because colour here
 * means risk and nothing else.
 */

export type Level = 1 | 2 | 3;

const FIELD: Record<Level, string> = {
  1: "bg-tint-green",
  2: "bg-tint-amber",
  3: "bg-tint-red",
};

/** The site's moon at the size of a letter. Its lit share is the AI's share of an answer
 *  at this level, read from `LEVELS` and never posed by eye: full, half, new. At the new
 *  moon nothing is lit, so the rim is drawn, as the large one does. */
export function PhaseMark({
  level,
  className = "",
}: {
  level: Level;
  className?: string;
}) {
  const phase = phaseOf(LEVELS[level - 1].ai);
  return (
    <svg viewBox="-108 -108 216 216" className={className} aria-hidden>
      <g transform="rotate(24)">
        <circle r="100" fill="currentColor" opacity="0.18" />
        <path d={litPath(phase)} fill="currentColor" />
        {phase <= -1 && (
          <circle r="100" fill="none" stroke="currentColor" strokeWidth="14" />
        )}
      </g>
    </svg>
  );
}

/** The logo on an ink disc. `.logo-mark` sizes itself in em, so the disc sets the font size. */
export function Avatar({ size = 32 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="grid place-items-center shrink-0 rounded-full bg-accent text-on-accent"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      <LogoMark />
    </span>
  );
}

/** The chip alone. It once had a note beside it ("Emergency — AI stopped"); the owner
 *  asked for the level only on 2026-11-15. */
export function LevelStamp({
  level,
  explain = false,
}: {
  level: Level;
  /** Make the chip a button that says what the level means. Off where the chip already
   *  sits inside a button (a row of the log). */
  explain?: boolean;
}) {
  const chip = `on-field ${FIELD[level]} data inline-flex items-center gap-1.5 h-6 pl-1.5 pr-2.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.1em] shrink-0`;
  const inside = (
    <>
      <PhaseMark level={level} className="w-3.5 h-3.5" />
      Level {level}
    </>
  );
  if (!explain) return <span className={chip}>{inside}</span>;
  return (
    <LevelExplained level={level} chip={chip}>
      {inside}
    </LevelExplained>
  );
}

/* The note beside the chip was taken off at the owner's request; this puts the meaning one
   tap away instead (2026-11-15). Everything it says is read from `LEVELS`: the level's
   name, the one line of what it holds, and the split between the AI and a doctor. It uses
   `holds`, not `detail`, because `detail` calls every Level 3 life-threatening and a
   Level 3 can also be an escalation that is not an emergency. */
function LevelExplained({ level, chip, children }: { level: Level; chip: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const info = LEVELS[level - 1];

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  return (
    <span ref={root} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`Level ${level}. What this means`}
        className={`${chip} cursor-pointer hover:opacity-85 transition-opacity`}
      >
        {children}
      </button>
      {open && (
        <span
          role="note"
          className="rise print:hidden absolute left-0 top-full z-20 mt-2 block w-[min(300px,calc(100vw-5rem))] rounded-[14px] border border-border bg-card p-3.5 shadow-[var(--shadow-2)]"
        >
          <span className="block text-[14px] font-semibold leading-snug">{info.name}</span>
          <span className="mt-1 block text-[13px] leading-snug text-muted">{info.holds}</span>
          <span className="mt-3.5 block h-1.5 overflow-hidden rounded-full bg-sunk" aria-hidden>
            <span className="block h-full rounded-full bg-foreground" style={{ width: `${info.ai}%` }} />
          </span>
          <span className="data mt-1.5 flex justify-between text-[10px] text-muted">
            <span>AI {info.ai}%</span>
            <span>Doctor {info.md}%</span>
          </span>
        </span>
      )}
    </span>
  );
}

export function PlainStamp({ title, note }: { title: string; note?: string }) {
  return (
    <>
      <span className="bg-accent text-on-accent data inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.1em] shrink-0">
        {title}
      </span>
      {note && (
        <span className="data text-[12px] text-muted truncate">{note}</span>
      )}
    </>
  );
}

/** Copies an answer. The page passes the text with the answer's level and the standing
 *  disclaimer written into it, so what is pasted elsewhere still says what it is. If the
 *  browser refuses the clipboard (an insecure origin), nothing happens and nothing lies. */
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      },
      () => {}
    );
  };
  return (
    <button
      type="button"
      onClick={copy}
      title="Copy this answer"
      aria-label={copied ? "Copied" : "Copy this answer"}
      className="data print:hidden ml-auto shrink-0 inline-flex h-7 items-center gap-1.5 rounded-full px-2 text-[11px] text-muted hover:bg-sunk hover:text-foreground transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied && <span aria-live="polite">Copied</span>}
    </button>
  );
}

export function Turn({
  time,
  stamp,
  copy,
  children,
}: {
  time?: Date;
  /** The text the copy button puts on the clipboard. No button without it. */
  copy?: string;
  /** The line above the text: `LevelStamp`, `PlainStamp`, or a label. */
  stamp?: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="flex gap-3 sm:gap-3.5">
      {/* The mark alone is the signature; the name is kept for screen readers. */}
      <Avatar size={28} />
      <span className="sr-only">MedTriage</span>
      <div className="chat-sans min-w-0 flex-1">
        {(stamp || time) && (
          <header className="flex items-center gap-2.5 min-h-7 mb-2">
            {stamp}
            {copy && <CopyButton text={copy} />}
            {time && (
              <time className={`data text-[11px] text-muted shrink-0 ${copy ? "" : "ml-auto"}`}>
                {time.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            )}
          </header>
        )}
        {children}
      </div>
    </article>
  );
}
