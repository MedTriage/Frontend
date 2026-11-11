import { sheetPoints, type PrescriptionSheet as Sheet } from "../lib/dashboard";

/* The prescription as a sheet of paper, after the design in ../prescription_final/rx/sheets.py
   (its A4 PDFs are the reference). It stays paper in dark mode, because that is what it is.
   The backend decides what a patient may open; a draft only ever arrives with its test switch
   on, and this says so at the top and the bottom of the page. */

function Logo() {
  return (
    <svg className="h-7 w-auto" viewBox="0 0 20 14" role="img" aria-label="MedTriage">
      <rect x="0" y="0" width="20" height="3" fill="var(--rx-sage)" />
      <rect x="0" y="5.5" width="12" height="3" fill="var(--rx-ochre)" />
      <rect x="0" y="11" width="5" height="3" fill="var(--rx-clay)" />
    </svg>
  );
}

function Capsule() {
  return (
    <svg className="h-9 w-9 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g transform="rotate(-45 12 12)">
        <path d="M12 7.5H8a4.5 4.5 0 0 0 0 9h4z" fill="var(--rx-sage)" />
        <rect x="3.5" y="7.5" width="17" height="9" rx="4.5" stroke="var(--rx-ink)" strokeWidth="1.5" />
        <path d="M12 7.5v9" stroke="var(--rx-ink)" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

function Label({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <h2 className="data mb-2 text-[10.5px] font-semibold uppercase tracking-[0.16em]" style={{ color }}>
      {children}
    </h2>
  );
}

function Bullets({ items, marker }: { items: string[]; marker: string }) {
  return (
    <ul className="list-disc space-y-0.5 pl-4">
      {items.map((item, i) => (
        <li key={i} className="pl-1" style={{ "--marker": marker } as React.CSSProperties}>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const fullDate = (iso: string) => new Date(iso).toISOString().slice(0, 10);

export function PrescriptionSheetView({ sheet }: { sheet: Sheet }) {
  const draft = sheet.status === "draft";
  const date = fullDate(sheet.issued_at ?? sheet.created_at);
  const points = sheetPoints(sheet.answer);

  return (
    <article className="rx-sheet mx-auto flex w-full max-w-[210mm] min-h-[297mm] flex-col px-6 py-8 sm:px-[16mm] sm:py-[14mm] shadow-[var(--shadow-2)] print:shadow-none print:max-w-none">
      <header className="flex items-end justify-between gap-4 border-b-2 pb-3" style={{ borderColor: "var(--rx-ink)" }}>
        <div className="flex items-center gap-3 min-w-0">
          <Logo />
          <div className="min-w-0">
            <div className="data text-[24px] font-semibold leading-none tracking-tight" style={{ color: "var(--rx-ink)" }}>
              MedTriage
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--rx-muted)" }}>
              AI-assisted clinical triage · Research study
            </div>
          </div>
        </div>
        <dl className="data grid grid-cols-[auto_auto] gap-x-3 text-right text-[11px] shrink-0">
          <dt style={{ color: "var(--rx-muted)" }}>Date</dt>
          <dd className="font-semibold" style={{ color: "var(--rx-ink)" }}>{date}</dd>
        </dl>
      </header>

      {draft && (
        <p
          role="note"
          className="data mt-5 rounded-md border-2 px-3 py-2 text-center text-[13px] font-semibold uppercase tracking-wider"
          style={{ borderColor: "var(--rx-ochre)", color: "var(--rx-ochre-ink)", background: "#c08a2e14" }}
        >
          Test draft: not reviewed by a doctor. Do not use.
        </p>
      )}

      <section className="mt-6">
        <Label color="var(--rx-sage-ink)">Your message</Label>
        <blockquote
          className="rounded-r-md border-l-4 py-3 pl-4 pr-4 text-[13.5px] italic leading-relaxed whitespace-pre-line"
          style={{ borderColor: "var(--rx-sage)", background: "#3a9d8f0f", color: "var(--rx-ink)" }}
        >
          {sheet.patient_message}
        </blockquote>
      </section>

      {points.length > 0 && (
        <section className="mt-6">
          <Label color="var(--rx-muted)">Response given to you</Label>
          <div className="text-[12.5px] leading-relaxed">
            <Bullets items={points} marker="var(--rx-muted)" />
          </div>
        </section>
      )}

      <section className="mt-6 border-t pt-5" style={{ borderColor: "var(--rx-rule)" }}>
        {sheet.refer_now && (
          <div
            className="data mb-5 rounded-md border-2 px-3 py-2 text-center text-[14px] font-semibold uppercase tracking-wider"
            style={{ borderColor: "var(--rx-clay)", color: "var(--rx-clay-ink)", background: "#c26b5a1a" }}
          >
            Refer: go to hospital now
          </div>
        )}

        <div className="flex items-center gap-3.5">
          <Capsule />
          <div className="min-w-0">
            <div className="data text-[10.5px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--rx-sage-ink)" }}>
              Diagnosis
            </div>
            <div className="data text-[17px] font-semibold" style={{ color: "var(--rx-ink)" }}>
              {sheet.diagnosis}
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] border-t-2 text-left text-[13px]" style={{ borderColor: "var(--rx-ink)" }}>
            <thead>
              <tr className="data border-b text-[10px] uppercase tracking-[0.14em]" style={{ borderColor: "var(--rx-ink)", color: "var(--rx-ink)" }}>
                <th scope="col" className="py-1.5 pr-3 font-semibold">#</th>
                <th scope="col" className="py-1.5 pr-3 font-semibold">Medicine</th>
                <th scope="col" className="py-1.5 pr-3 font-semibold">Dose</th>
                <th scope="col" className="py-1.5 pr-3 font-semibold">Route</th>
                <th scope="col" className="py-1.5 pr-3 font-semibold">Frequency</th>
                <th scope="col" className="py-1.5 font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody>
              {sheet.medications.map((med, i) => (
                <tr
                  key={i}
                  className="border-b align-baseline"
                  style={{ borderColor: i === sheet.medications.length - 1 ? "var(--rx-ink)" : "var(--rx-rule)" }}
                >
                  <td className="data py-2 pr-3 tabular-nums" style={{ color: "var(--rx-sage-ink)" }}>{String(i + 1).padStart(2, "0")}</td>
                  <td className="py-2 pr-3 font-semibold" style={{ color: "var(--rx-ink)" }}>{med.drug}</td>
                  <td className="data py-2 pr-3">{med.dose}</td>
                  <td className="py-2 pr-3">{med.route}</td>
                  <td className="py-2 pr-3">{med.frequency}</td>
                  <td className="py-2">{med.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(sheet.investigations.length > 0 || sheet.advice.length > 0) && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 print:grid-cols-2">
            {sheet.investigations.length > 0 && (
              <div className="rounded-md px-4 py-3" style={{ background: "#3a9d8f14" }}>
                <Label color="var(--rx-sage-ink)">Investigations</Label>
                <div className="text-[13px] leading-snug">
                  <Bullets items={sheet.investigations} marker="var(--rx-sage)" />
                </div>
              </div>
            )}
            {sheet.advice.length > 0 && (
              <div className="rounded-md px-4 py-3" style={{ background: "#c08a2e14" }}>
                <Label color="var(--rx-ochre-ink)">Advice</Label>
                <div className="text-[13px] leading-snug">
                  <Bullets items={sheet.advice} marker="var(--rx-ochre)" />
                </div>
              </div>
            )}
          </div>
        )}

        {sheet.return_precautions.length > 0 && (
          <div className="mt-4 rounded-r-md border-l-4 px-4 py-3" style={{ borderColor: "var(--rx-clay)", background: "#c26b5a14" }}>
            <Label color="var(--rx-clay-ink)">Seek urgent care if</Label>
            <div className="text-[13px] leading-snug" style={{ color: "var(--rx-ink)" }}>
              <Bullets items={sheet.return_precautions} marker="var(--rx-clay)" />
            </div>
          </div>
        )}

        {sheet.assumptions.length > 0 && (
          <p className="mt-4 text-[11px] italic leading-snug" style={{ color: "var(--rx-muted)" }}>
            Assumptions: {sheet.assumptions.join("; ")}
          </p>
        )}
      </section>

      <footer className="data mt-auto pt-6 text-[9.5px] leading-relaxed" style={{ color: "var(--rx-muted)" }}>
        <div className="border-t pt-2" style={{ borderColor: "var(--rx-rule)" }}>
          {draft ? (
            "Test draft, not reviewed by a doctor and not a prescription · MedTriage research study"
          ) : (
            <>
              Issued by {sheet.issued_by_name}
              {sheet.issued_by_registration ? `, Reg. no. ${sheet.issued_by_registration}` : ""}, {date}. Drafted with AI
              assistance and reviewed by this doctor · MedTriage research study
            </>
          )}
        </div>
      </footer>
    </article>
  );
}
