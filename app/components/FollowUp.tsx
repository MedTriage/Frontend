"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";

/* Follow-up: after an answer the patient can manage at home, the system keeps watching.
   These two parts show what to watch for and ask how things are going. What an answer
   leads to is decided by the backend, never here. */

export interface ReturnSign {
  text: string;
  level: "level_2" | "level_3";
}

export interface FollowUp {
  id: string;
  state: "active" | "resolved" | "escalated" | "lapsed" | "stopped";
  complaint: string;
  label: string;
  usual_course: string | null;
  return_signs: ReturnSign[];
  next_checkin_at: string | null;
  checkin_due: boolean;
}

export type CheckInAnswer = {
  overall: "better" | "same" | "worse";
  signs: string[];
  new: string | null;
};

/* Colour carries risk here as everywhere: a sign's bar is the level it raises the case to. */
const SIGN_RULE = { level_2: "bg-t2", level_3: "bg-t3" } as const;

function when(iso: string | null): string {
  if (!iso) return "soon";
  const at = new Date(iso);
  const sameDay = at.toDateString() === new Date().toDateString();
  return sameDay
    ? `today at ${at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : at.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
}

/** What to watch for, and when the system will ask. Shown under the answer while the
 *  episode is being watched. */
export function ComeBackIf({ followup }: { followup: FollowUp }) {
  const urgent = followup.return_signs.filter((s) => s.level === "level_3");
  const doctor = followup.return_signs.filter((s) => s.level === "level_2");

  return (
    <section aria-label="What to watch for" className="border border-border bg-card">
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <p className="label mb-1.5">Come back if</p>
        <p className="text-[13px] text-muted leading-relaxed">
          {followup.usual_course
            ? `${followup.label} ${followup.usual_course}. `
            : ""}
          Don&apos;t wait for the check-in if any of these happen.
        </p>
      </div>

      <ul className="px-4 py-2">
        {[...urgent, ...doctor].map((sign) => (
          <li key={sign.text} className="flex items-start gap-3 py-1.5">
            <span className={`mt-[7px] block w-3 h-[3px] shrink-0 ${SIGN_RULE[sign.level]}`} />
            <span className="text-[14px] leading-snug">{sign.text}</span>
          </li>
        ))}
      </ul>

      <div className="px-4 py-3 border-t border-border flex items-center gap-2 text-muted">
        <CalendarClock className="w-3.5 h-3.5 shrink-0" />
        <p className="data text-[11px]">
          We&apos;ll check in with you {when(followup.next_checkin_at)}
        </p>
      </div>
    </section>
  );
}

const OVERALL: { value: CheckInAnswer["overall"]; label: string }[] = [
  { value: "better", label: "Better" },
  { value: "same", label: "About the same" },
  { value: "worse", label: "Worse" },
];

/** The check-in itself: three questions, answered in under a minute. */
export function CheckInCard({
  followup,
  busy,
  onAnswer,
  onPostpone,
  onStop,
}: {
  followup: FollowUp;
  busy: boolean;
  onAnswer: (answer: CheckInAnswer) => void;
  onPostpone: () => void;
  onStop: () => void;
}) {
  const [overall, setOverall] = useState<CheckInAnswer["overall"] | null>(null);
  const [signs, setSigns] = useState<string[]>([]);
  const [extra, setExtra] = useState("");

  const toggle = (text: string) =>
    setSigns((all) => (all.includes(text) ? all.filter((s) => s !== text) : [...all, text]));

  return (
    <section aria-label="Check-in" className="w-full max-w-[720px] mx-auto border border-foreground bg-card mb-3 rise">
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <p className="label mb-1">Check-in</p>
        <p className="text-[15px] font-medium">How is it going?</p>
      </div>

      <div className="px-4 py-4 space-y-5">
        <div>
          <p className="text-[13px] text-muted mb-2">Overall, compared with when we spoke</p>
          <div className="flex flex-wrap gap-px bg-border border border-border" role="radiogroup">
            {OVERALL.map((o) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={overall === o.value}
                onClick={() => setOverall(o.value)}
                className={`flex-1 min-w-[7rem] h-10 text-[13px] font-medium transition-colors ${
                  overall === o.value ? "bg-accent text-on-accent" : "bg-background text-muted hover:text-foreground"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <fieldset>
          <legend className="text-[13px] text-muted mb-2">Do you have any of these now?</legend>
          <div className="space-y-1">
            {followup.return_signs.map((sign) => (
              <label key={sign.text} className="flex items-start gap-3 py-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={signs.includes(sign.text)}
                  onChange={() => toggle(sign.text)}
                  className="w-3.5 h-3.5 mt-[3px] shrink-0 accent-[var(--foreground)]"
                />
                <span className="text-[14px] leading-snug">{sign.text}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="checkin-new" className="text-[13px] text-muted block mb-2">
            Anything new? (optional)
          </label>
          <textarea
            id="checkin-new"
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            rows={2}
            maxLength={2000}
            placeholder="A new symptom, or anything that has changed"
            className="w-full bg-background border border-border px-3 py-2.5 text-[14px] leading-relaxed placeholder:text-muted/70 focus:outline-none focus:border-foreground transition-colors resize-none"
          />
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!overall || busy}
          onClick={() => overall && onAnswer({ overall, signs, new: extra.trim() || null })}
          className="h-10 px-4 bg-accent text-on-accent text-[13px] font-medium hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? "Sending…" : "Send"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onPostpone}
          className="h-10 px-3.5 text-[13px] text-muted hover:text-foreground transition-colors disabled:opacity-40"
        >
          Ask me tomorrow
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onStop}
          className="h-10 px-3.5 text-[13px] text-muted hover:text-foreground transition-colors disabled:opacity-40 ml-auto"
        >
          Stop check-ins
        </button>
      </div>
    </section>
  );
}
