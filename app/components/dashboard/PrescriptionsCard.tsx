"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Pill } from "lucide-react";
import { shortDay, type PrescriptionSummary } from "../../lib/dashboard";

interface RegularMedicine {
  name: string;
  detail: string | null;
}

const when = (rx: PrescriptionSummary) => shortDay(new Date(rx.issued_at ?? rx.created_at));

/* Everything a doctor issued, each opening its printable sheet. A draft only appears here with
   the backend's test switch on, and says what it is. What the patient told us they already
   take stays visibly apart: nobody prescribed those through MedTriage. */
export function PrescriptionsCard({
  prescriptions,
  regular,
  error,
  onRetry,
}: {
  prescriptions: PrescriptionSummary[] | null;
  regular: RegularMedicine[];
  error: boolean;
  onRetry: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const all = prescriptions ?? [];
  const shown = showAll ? all : all.slice(0, 2);

  return (
    <section aria-labelledby="rx-title" className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="rx-title" className="text-[18px] font-medium tracking-[-0.01em]">Prescriptions</h2>
        {all.length > 2 && (
          <button type="button" onClick={() => setShowAll(!showAll)} className="text-[13px] font-medium text-t1 hover:underline underline-offset-2">
            {showAll ? "Show fewer" : `See all ${all.length}`}
          </button>
        )}
      </div>

      {prescriptions === null && !error && <div className="mt-3 h-[66px] rounded-xl bg-background" aria-hidden />}

      {error && (
        <p className="mt-2 text-[13px] text-muted">
          Couldn&apos;t load your prescriptions.{" "}
          <button type="button" onClick={onRetry} className="underline underline-offset-2 text-foreground">
            Try again
          </button>
        </p>
      )}

      {prescriptions !== null && all.length === 0 && !error && (
        <p className="text-[13px] text-muted leading-relaxed mt-1.5">
          Nothing issued yet. When a doctor reviews one of your answers and prescribes, it appears here.
        </p>
      )}

      {shown.length > 0 && (
        <ul className="mt-3 space-y-2">
          {shown.map((rx) => {
            const [first, ...rest] = rx.medications;
            const draft = rx.status === "draft";
            return (
              <li key={rx.id}>
                <Link
                  href={`/prescriptions/${rx.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 hover:border-foreground/30 transition-colors"
                >
                  <span className="w-10 h-10 rounded-full bg-tint-green text-t1 flex items-center justify-center shrink-0">
                    <Pill className="w-[18px] h-[18px]" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium truncate capitalize">
                      {first?.drug ?? rx.diagnosis}
                      {rest.length > 0 && <span className="text-muted font-normal normal-case"> and {rest.length} more</span>}
                    </span>
                    <span className="block text-[13px] text-muted truncate">
                      {first ? first.frequency : ""}
                    </span>
                    {draft ? (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-tint-amber text-t2 text-[11px] font-medium">
                        Test draft, not reviewed by a doctor
                      </span>
                    ) : (
                      <span className="block text-[12px] text-muted truncate">
                        {rx.issued_by_name}, {when(rx)}
                      </span>
                    )}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted shrink-0" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {regular.length > 0 && (
        <p className="mt-3 text-[13px] text-muted leading-relaxed">
          You also told us you take{" "}
          {regular.map((m) => (m.detail ? `${m.name} (${m.detail})` : m.name)).join(", ")}.{" "}
          <Link href="/profile" className="underline underline-offset-2 text-foreground whitespace-nowrap">
            Edit
          </Link>
        </p>
      )}
    </section>
  );
}
