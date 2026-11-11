"use client";

import { Plus, Trash2 } from "lucide-react";

/* The doctor's version of the prescription. It starts as the prescriber's draft, and what the
   patient receives is what this says when the doctor approves. */

export interface EditableMedicine {
  drug: string;
  dose: string;
  frequency: string;
  duration: string;
  route: string;
  notes: string;
}

export interface EditablePrescription {
  diagnosis: string;
  medications: EditableMedicine[];
  refer_now: boolean;
  investigations: string[];
  advice: string[];
  return_precautions: string[];
  assumptions: string[];
}

const COLUMNS: { key: keyof EditableMedicine; label: string; width: string }[] = [
  { key: "drug", label: "Medicine", width: "min-w-[150px]" },
  { key: "dose", label: "Dose", width: "min-w-[84px]" },
  { key: "route", label: "Route", width: "min-w-[84px]" },
  { key: "frequency", label: "Frequency", width: "min-w-[140px]" },
  { key: "duration", label: "Duration", width: "min-w-[96px]" },
];

const FIELD =
  "w-full h-9 px-2.5 bg-background border border-border text-[13px] focus:outline-none focus:border-foreground transition-colors";
const BLANK: EditableMedicine = { drug: "", dose: "", frequency: "", duration: "", route: "oral", notes: "" };

const text = (value: unknown) => (typeof value === "string" ? value : value == null ? "" : String(value));
const list = (value: unknown) => (Array.isArray(value) ? value.map(text).filter(Boolean) : []);

/** The draft as editable values, tolerating whatever shape a failed draft came back in. */
export function editableFrom(draft: Record<string, unknown> | null | undefined): EditablePrescription {
  const meds = Array.isArray(draft?.medications) ? (draft.medications as Record<string, unknown>[]) : [];
  return {
    diagnosis: text(draft?.diagnosis),
    medications: meds.map((m) => ({
      drug: text(m?.drug), dose: text(m?.dose), frequency: text(m?.frequency),
      duration: text(m?.duration), route: text(m?.route), notes: text(m?.notes),
    })),
    refer_now: draft?.refer_now === true,
    investigations: list(draft?.investigations),
    advice: list(draft?.advice),
    return_precautions: list(draft?.return_precautions),
    assumptions: list(draft?.assumptions),
  };
}

/** Blank fields stop an issue before it reaches the backend, with the reason beside the button. */
export function missingField(rx: EditablePrescription): string | null {
  if (rx.medications.length === 0) return null;
  if (!rx.diagnosis.trim()) return "Add a diagnosis to issue this prescription.";
  const blank = rx.medications.some((m) => COLUMNS.some((c) => !m[c.key].trim()));
  return blank ? "Fill in every field for each medicine, or delete its row." : null;
}

function LinesField({ label, value, onChange }: { label: string; value: string[]; onChange: (lines: string[]) => void }) {
  return (
    <label className="block">
      <span className="label block mb-1.5">{label}</span>
      <textarea
        rows={Math.max(2, value.length)}
        value={value.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n"))}
        className="w-full bg-background border border-border px-2.5 py-2 text-[13px] leading-relaxed focus:outline-none focus:border-foreground transition-colors resize-y"
      />
    </label>
  );
}

export function PrescriptionEditor({
  value,
  onChange,
  problems,
}: {
  value: EditablePrescription;
  onChange: (next: EditablePrescription) => void;
  problems: string[];
}) {
  const setMedicine = (index: number, key: keyof EditableMedicine, next: string) =>
    onChange({
      ...value,
      medications: value.medications.map((m, i) => (i === index ? { ...m, [key]: next } : m)),
    });

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-3">
        <p className="label">Prescription for the patient</p>
        <p className="text-[12px] text-muted">An AI draft. Nothing reaches the patient until you approve it.</p>
      </div>

      {problems.length > 0 && (
        <ul className="mb-3 space-y-1 border border-border bg-background px-3 py-2.5">
          {problems.map((problem, i) => (
            <li key={i} className="text-[13px] text-t2 leading-snug">{problem}</li>
          ))}
        </ul>
      )}

      <label className="block mb-3">
        <span className="label block mb-1.5">Diagnosis</span>
        <input className={FIELD} value={value.diagnosis} onChange={(e) => onChange({ ...value, diagnosis: e.target.value })} />
      </label>

      {value.medications.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                {COLUMNS.map((c) => (
                  <th key={c.key} scope="col" className={`label font-normal pb-1.5 pr-1.5 ${c.width}`}>{c.label}</th>
                ))}
                <th scope="col" className="sr-only">Delete</th>
              </tr>
            </thead>
            <tbody>
              {value.medications.map((med, i) => (
                <tr key={i}>
                  {COLUMNS.map((c) => (
                    <td key={c.key} className="pb-1.5 pr-1.5">
                      <input
                        aria-label={`${c.label}, row ${i + 1}`}
                        className={FIELD}
                        value={med[c.key]}
                        onChange={(e) => setMedicine(i, c.key, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="pb-1.5 w-9">
                    <button
                      type="button"
                      aria-label={`Delete ${med.drug || `row ${i + 1}`}`}
                      onClick={() => onChange({ ...value, medications: value.medications.filter((_, j) => j !== i) })}
                      className="w-9 h-9 flex items-center justify-center text-muted hover:text-t3 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-[13px] text-muted border border-dashed border-border px-3 py-2.5">
          No medicines. Approving sends the answer without a prescription.
        </p>
      )}

      <button
        type="button"
        onClick={() => onChange({ ...value, medications: [...value.medications, { ...BLANK }] })}
        className="mt-2 inline-flex items-center gap-1.5 h-8 px-2.5 border border-border text-[13px] text-muted hover:text-foreground hover:border-foreground transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add medicine
      </button>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <LinesField label="Investigations, one per line" value={value.investigations} onChange={(investigations) => onChange({ ...value, investigations })} />
        <LinesField label="Advice, one per line" value={value.advice} onChange={(advice) => onChange({ ...value, advice })} />
        <LinesField label="Seek urgent care if, one per line" value={value.return_precautions} onChange={(return_precautions) => onChange({ ...value, return_precautions })} />
        <LinesField label="Assumptions, one per line" value={value.assumptions} onChange={(assumptions) => onChange({ ...value, assumptions })} />
      </div>

      <label className="mt-3 flex items-center gap-2 text-[13px]">
        <input
          type="checkbox"
          checked={value.refer_now}
          onChange={(e) => onChange({ ...value, refer_now: e.target.checked })}
          className="accent-[var(--foreground)]"
        />
        Show &ldquo;Refer: go to hospital now&rdquo; on the prescription
      </label>
    </div>
  );
}

/** What is sent: blank lines from the text boxes dropped, every field trimmed by the backend. */
export function forSending(rx: EditablePrescription): EditablePrescription {
  const clean = (lines: string[]) => lines.map((line) => line.trim()).filter(Boolean);
  return {
    ...rx,
    investigations: clean(rx.investigations),
    advice: clean(rx.advice),
    return_precautions: clean(rx.return_precautions),
    assumptions: clean(rx.assumptions),
  };
}
