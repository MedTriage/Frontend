"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, CalendarDays, ChevronRight, HeartPulse, Pencil, Ruler, Scale, Trash2, X } from "lucide-react";
import { errorMessage, postJson } from "@/lib/account";
import {
  ageOn,
  dayKey,
  formatValue,
  latestByKind,
  parseDay,
  shortDay,
  type Reading,
  type ReadingKind,
} from "../../lib/dashboard";
import type { ChartKind } from "./HealthChart";

type Tone = "white" | "green" | "amber" | "red";

const TONE: Record<Tone, string> = {
  white: "bg-card border border-border",
  // The three tones used to be pale washes of the level colours. With the level colours
  // now saturated, a red tile under "Blood pressure" would read as an alarm, and a stat
  // carries no verdict; so every tile is a neutral field and the selected one is ink.
  green: "bg-sunk",
  amber: "bg-sunk",
  red: "bg-sunk",
};

const KIND_LABEL: Record<ReadingKind, string> = {
  weight: "Weight",
  height: "Height",
  blood_pressure: "Blood pressure",
  pulse: "Pulse",
};

const UNIT: Record<ReadingKind, string> = { weight: "kg", height: "cm", blood_pressure: "mmHg", pulse: "bpm" };

// Short enough that a row of the Recent list never truncates its own name.
const SHORT_LABEL: Record<ReadingKind, string> = { weight: "Weight", height: "Height", blood_pressure: "BP", pulse: "Pulse" };

const FIELD =
  "w-full h-9 px-2.5 rounded-lg bg-card border border-border text-[14px] text-foreground focus:outline-none focus:border-foreground transition-colors";

function UpdateForm({
  kind,
  today,
  onSaved,
  onCancel,
}: {
  kind: ReadingKind;
  today: Date;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  const [value2, setValue2] = useState("");
  const [day, setDay] = useState(dayKey(today));
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const pressure = kind === "blood_pressure";

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setProblem(null);
    const res = await postJson("/api/me/readings", {
      kind,
      value: Number(value),
      value2: pressure ? Number(value2) : null,
      measured_on: day,
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) onSaved();
    else setProblem(errorMessage(res?.data ?? null, "Couldn't save that. Try again."));
  };

  return (
    <form onSubmit={save} className="text-foreground w-full">
      <div className={`grid gap-2 ${pressure ? "grid-cols-2" : "grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]"}`}>
        <label className="text-[12px]">
          {pressure ? "Upper (mmHg)" : `${KIND_LABEL[kind]} (${UNIT[kind]})`}
          <input
            className={`${FIELD} mt-1`}
            type="number"
            inputMode="decimal"
            step="any"
            required
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        {pressure && (
          <label className="text-[12px]">
            Lower (mmHg)
            <input
              className={`${FIELD} mt-1`}
              type="number"
              inputMode="numeric"
              step="any"
              required
              value={value2}
              onChange={(e) => setValue2(e.target.value)}
            />
          </label>
        )}
        <label className={`text-[12px] ${pressure ? "col-span-2" : ""}`}>
          Date
          <input className={`${FIELD} mt-1`} type="date" required value={day} onChange={(e) => setDay(e.target.value)} />
        </label>
      </div>
      {problem && <p role="alert" className="text-[12px] font-medium mt-1.5 leading-snug">{problem}</p>}
      <div className="flex items-center gap-2 mt-2">
        <button
          type="submit"
          disabled={busy}
          className="h-8 px-3.5 rounded-full bg-accent text-on-accent text-[13px] font-medium hover:opacity-85 disabled:opacity-50 transition-opacity"
        >
          {busy ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onCancel} className="h-8 px-3 rounded-full text-[13px] hover:underline underline-offset-2">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Tile({
  label,
  icon: Icon,
  tone,
  selected,
  onSelect,
  value,
  unit,
  note,
  action,
  form,
  className = "",
}: {
  label: string;
  icon: typeof Scale;
  tone: Tone;
  selected?: boolean;
  onSelect?: () => void;
  value: string | null;
  unit?: string;
  note?: string;
  action?: React.ReactNode;
  form?: React.ReactNode;
  className?: string;
}) {
  const on = Boolean(selected) && !form;
  const surface = form ? TONE.white : on ? "bg-accent text-on-accent" : TONE[tone];
  const body = (
    <>
      <span
        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 ${
          on ? "bg-on-accent text-accent" : tone === "white" ? "bg-background text-foreground" : "bg-card text-foreground"
        }`}
      >
        <Icon className="w-[17px] h-[17px]" strokeWidth={1.75} />
      </span>
      <span className="min-w-0">
        <span className={`block text-[13px] ${on ? "" : "text-foreground/75"}`}>{label}</span>
        <span className="flex flex-wrap items-baseline gap-x-1 mt-0.5">
          {value === null ? (
            <span className={`text-[15px] ${on ? "" : "text-foreground/60"}`}>Not recorded</span>
          ) : (
            <>
              <span className="text-[20px] sm:text-[23px] font-medium tracking-[-0.01em] leading-tight tabular-nums">{value}</span>
              {unit && <span className={`text-[12px] sm:text-[13px] ${on ? "" : "text-foreground/70"}`}>{unit}</span>}
            </>
          )}
        </span>
      </span>
    </>
  );

  return (
    <div className={`rounded-2xl p-3.5 sm:p-4 min-h-[112px] flex flex-col justify-between gap-2 transition-colors ${surface} ${className}`}>
      {form ?? (
        <>
          {onSelect ? (
            <button
              type="button"
              onClick={onSelect}
              aria-pressed={selected}
              aria-label={`Show ${label.toLowerCase()} on the chart`}
              className="flex items-center gap-2.5 sm:gap-3 text-left rounded-xl"
            >
              {body}
            </button>
          ) : (
            <div className="flex items-center gap-2.5 sm:gap-3">{body}</div>
          )}
          <div className={`flex items-center justify-between gap-2 text-[12px] ${on ? "" : "text-foreground/70"}`}>
            <span className="truncate">{note}</span>
            {action}
          </div>
        </>
      )}
    </div>
  );
}

function RecentReadings({ readings, onChanged, error, onRetry }: {
  readings: Reading[] | null;
  onChanged: () => void;
  error: boolean;
  onRetry: () => void;
}) {
  const [all, setAll] = useState(false);
  const [confirm, setConfirm] = useState<number | null>(null);
  const list = readings ?? [];
  const shown = all ? list : list.slice(0, 3);

  const remove = async (id: number) => {
    const res = await fetch(`/api/me/readings/${id}`, { method: "DELETE" }).catch(() => null);
    setConfirm(null);
    if (res?.ok) onChanged();
  };

  return (
    <section
      aria-label="Recent readings"
      className={`col-span-2 sm:col-span-1 rounded-2xl bg-card border border-border px-4 py-3 ${all ? "sm:col-span-3" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[14px] font-medium">Recent</h3>
        {list.length > 3 && (
          <button
            type="button"
            onClick={() => setAll(!all)}
            className="inline-flex items-center text-[12px] text-muted hover:text-foreground transition-colors"
          >
            {all ? "Fewer" : `All ${list.length}`}
            {all ? <X className="w-3 h-3 ml-0.5" /> : <ChevronRight className="w-3 h-3 ml-0.5" />}
          </button>
        )}
      </div>
      {error ? (
        <p className="text-[12px] text-muted mt-1.5">
          Couldn&apos;t load them.{" "}
          <button type="button" onClick={onRetry} className="underline underline-offset-2 text-foreground">Try again</button>
        </p>
      ) : shown.length === 0 ? (
        <p className="text-[12px] text-muted mt-1.5 leading-relaxed">
          {readings === null ? " " : "Nothing yet. Update a tile to add your first reading."}
        </p>
      ) : (
        <ul className="mt-1">
          {shown.map((r) => (
            <li key={r.id} className="flex items-center gap-2 h-[25px] text-[12px]">
              {confirm === r.id ? (
                <>
                  <span className="min-w-0 truncate flex-1">Delete this reading?</span>
                  <button type="button" onClick={() => remove(r.id)} className="font-medium text-t3 hover:underline underline-offset-2">Delete</button>
                  <button type="button" onClick={() => setConfirm(null)} className="text-muted hover:text-foreground">Keep</button>
                </>
              ) : (
                <>
                  <span className="min-w-0 truncate text-muted flex-1">{SHORT_LABEL[r.kind]}</span>
                  <span className="whitespace-nowrap">
                    <span className="tabular-nums font-medium">{formatValue(r)}</span>{" "}
                    <span className="text-muted">{r.unit}</span>
                  </span>
                  <span className="data text-muted whitespace-nowrap w-[46px] text-right">{shortDay(parseDay(r.measured_on))}</span>
                  <button
                    type="button"
                    onClick={() => setConfirm(r.id)}
                    aria-label={`Delete ${KIND_LABEL[r.kind].toLowerCase()} reading of ${shortDay(parseDay(r.measured_on))}`}
                    className="text-muted hover:text-t3 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function StatTiles({
  readings,
  dateOfBirth,
  kind,
  onKind,
  today,
  onChanged,
  error,
  onRetry,
}: {
  readings: Reading[] | null;
  dateOfBirth: string | null | undefined;
  kind: ChartKind;
  onKind: (kind: ChartKind) => void;
  today: Date;
  onChanged: () => void;
  error: boolean;
  onRetry: () => void;
}) {
  const [editing, setEditing] = useState<ReadingKind | null>(null);
  const latest = latestByKind(readings ?? []);

  const tile = (reading: ReadingKind) => {
    const current = latest[reading];
    const isChartKind = reading !== "height";
    return {
      label: KIND_LABEL[reading],
      value: current ? formatValue(current) : null,
      unit: current ? current.unit : undefined,
      note: current ? shortDay(parseDay(current.measured_on)) : "",
      selected: isChartKind && kind === reading,
      onSelect: isChartKind ? () => onKind(reading as ChartKind) : undefined,
      form: editing === reading ? (
        <UpdateForm
          kind={reading}
          today={today}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onChanged();
          }}
        />
      ) : undefined,
      action: (
        <button
          type="button"
          onClick={() => setEditing(reading)}
          aria-label={`Update ${KIND_LABEL[reading].toLowerCase()}`}
          className="inline-flex items-center gap-1 font-medium hover:underline underline-offset-2 shrink-0"
        >
          <Pencil className="w-3 h-3" />
          Update
        </button>
      ),
    };
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      <Tile icon={Scale} tone="green" {...tile("weight")} />
      <Tile icon={Activity} tone="red" {...tile("blood_pressure")} />
      <Tile icon={HeartPulse} tone="amber" {...tile("pulse")} />
      <Tile icon={Ruler} tone="white" {...tile("height")} />
      <Tile
        icon={CalendarDays}
        tone="green"
        label="Age"
        value={dateOfBirth ? `${ageOn(dateOfBirth, today)}` : null}
        unit={dateOfBirth ? "years" : undefined}
        note="From your profile"
        className="col-span-2 sm:col-span-1"
        action={
          <Link href="/profile" className="inline-flex items-center gap-1 font-medium hover:underline underline-offset-2 shrink-0">
            <Pencil className="w-3 h-3" />
            {dateOfBirth ? "Edit" : "Add"}
          </Link>
        }
      />
      <RecentReadings readings={readings} onChanged={onChanged} error={error} onRetry={onRetry} />
    </div>
  );
}
