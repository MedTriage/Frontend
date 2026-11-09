import { AlertTriangle } from "lucide-react";

/* Child-health mode's answer. There is no triage level: child mode answers questions from
   the WHO and IMNCI guidelines. Colour still carries risk and nothing else, so the only red
   here is the "go to hospital now" banner and the bars beside the signs that call for it.
   Whether the banner shows is decided by the backend (child_health_content.compose), never
   here. */

export interface ChildView {
  override: { reason: "signs" | "urgent" | "unchecked"; signs: string[] } | null;
  guidelines: string;
  general: string;
  possible_causes: string[];
  sources: { n: number; source: string; page: number }[];
  watch_for: string[];
  clarification: boolean;
}

function Banner({ override }: { override: NonNullable<ChildView["override"]> }) {
  const unchecked = override.reason === "unchecked";
  return (
    <div role="alert" className="border border-t3 bg-t3/8 px-4 py-3 mb-3.5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-t3 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-t3 leading-snug">
            {unchecked
              ? "If your child has any of these signs, go to the nearest hospital now:"
              : "Go to the nearest hospital or emergency department now."}
          </p>
          {!unchecked && (
            <p className="text-[13px] text-foreground mt-1 leading-relaxed">
              What you describe can be a sign of serious illness in a child.
            </p>
          )}
          {/* The sign check errs towards flagging, so a listed sign may not be one the
              parent described: it is something to check, not a record of what they said. */}
          {!unchecked && override.signs.length > 0 && (
            <p className="label mt-2.5 mb-1">Signs to check</p>
          )}
          {override.signs.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {override.signs.map((sign) => (
                <li key={sign} className="text-[13px] text-foreground leading-snug">
                  {sign}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChildAnswer({ child, timestamp }: { child: ChildView; timestamp: Date }) {
  const answered = child.guidelines || child.general;

  return (
    <div className="border-l-2 border-l-border pl-4">
      <div className="flex items-baseline gap-2.5 mb-2">
        <span className="data text-[11px] font-semibold">Child health</span>
        <span className="data text-[11px] text-muted">From the WHO and IMNCI guidelines</span>
        <span className="data text-[10px] text-muted ml-auto shrink-0">
          {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {child.override && <Banner override={child.override} />}

      {child.guidelines && (
        <div className="text-[14px] leading-[1.65] whitespace-pre-line">{child.guidelines}</div>
      )}

      {child.general && (
        <div className="mt-3 border border-border bg-card px-3.5 py-3">
          <p className="label mb-1.5">General information, not from the WHO/IMNCI guidelines</p>
          <p className="text-[14px] leading-[1.65] whitespace-pre-line">{child.general}</p>
        </div>
      )}

      {!answered && (
        <p className="text-[14px] text-muted leading-relaxed">
          I couldn&apos;t answer that just now. Please try again in a moment.
        </p>
      )}

      {child.possible_causes.length > 0 && (
        <div className="mt-3.5">
          <p className="label mb-1.5">Possible causes, not a diagnosis</p>
          <p className="text-[13px] text-muted leading-relaxed">{child.possible_causes.join(" · ")}</p>
        </div>
      )}

      {child.sources.length > 0 && (
        <div className="mt-3.5">
          <p className="label mb-1.5">Sources</p>
          <ul className="space-y-0.5">
            {child.sources.map((s) => (
              <li key={s.n} className="data text-[11px] text-muted">
                [{s.n}] {s.source}, page {s.page}
              </li>
            ))}
          </ul>
        </div>
      )}

      <section aria-label="When to go to hospital" className="mt-4 border border-border bg-card">
        <p className="label px-4 pt-3.5 pb-2.5 border-b border-border">
          Go to a hospital straight away if
        </p>
        <ul className="px-4 py-2">
          {child.watch_for.map((sign) => (
            <li key={sign} className="flex items-start gap-3 py-1.5">
              <span className="mt-[7px] block w-3 h-[3px] shrink-0 bg-t3" />
              <span className="text-[14px] leading-snug">{sign}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
