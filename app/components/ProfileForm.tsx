"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { FormError, INPUT, Notice, SubmitButton } from "./AuthForm";
import { errorMessage } from "@/lib/account";

export interface ProfileEntry {
  name: string;
  detail: string | null;
}

export interface Profile {
  date_of_birth: string | null;
  gender: string | null;
  allergies: ProfileEntry[];
  medications: ProfileEntry[];
  conditions: ProfileEntry[];
}

export const EMPTY_PROFILE: Profile = {
  date_of_birth: null,
  gender: null,
  allergies: [],
  medications: [],
  conditions: [],
};

const GENDERS: [string, string][] = [
  ["female", "Female"],
  ["male", "Male"],
  ["non_binary", "Non-binary"],
  ["other", "Other"],
  ["prefer_not_to_say", "Prefer not to say"],
];

type ListKey = "allergies" | "medications" | "conditions";

const LISTS: { key: ListKey; label: string; add: string; name: string; detail: string }[] = [
  { key: "allergies", label: "Allergies", add: "Add an allergy", name: "e.g. penicillin", detail: "Reaction, if known" },
  { key: "medications", label: "Regular medications", add: "Add a medication", name: "e.g. metformin", detail: "Dose, if known" },
  { key: "conditions", label: "Long-term conditions", add: "Add a condition", name: "e.g. asthma", detail: "Anything worth knowing" },
];

function ListEditor({
  label,
  add,
  namePlaceholder,
  detailPlaceholder,
  items,
  onChange,
}: {
  label: string;
  add: string;
  namePlaceholder: string;
  detailPlaceholder: string;
  items: ProfileEntry[];
  onChange: (items: ProfileEntry[]) => void;
}) {
  const update = (i: number, patch: Partial<ProfileEntry>) =>
    onChange(items.map((item, j) => (j === i ? { ...item, ...patch } : item)));

  return (
    <fieldset>
      <legend className="label mb-2">{label}</legend>
      {items.length === 0 && <p className="text-[13px] text-muted mb-2">None listed.</p>}
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <input
              aria-label={`${label}: name`}
              value={item.name}
              onChange={(e) => update(i, { name: e.target.value })}
              placeholder={namePlaceholder}
              className={`${INPUT} flex-[3]`}
            />
            <input
              aria-label={`${label}: detail`}
              value={item.detail ?? ""}
              onChange={(e) => update(i, { detail: e.target.value })}
              placeholder={detailPlaceholder}
              className={`${INPUT} flex-[2] hidden sm:block`}
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              aria-label={`Remove ${item.name || "entry"}`}
              className="h-11 w-11 shrink-0 grid place-items-center border border-border text-muted hover:text-foreground hover:border-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onChange([...items, { name: "", detail: null }])}
        className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        {add}
      </button>
    </fieldset>
  );
}

function clean(items: ProfileEntry[]): ProfileEntry[] {
  return items
    .map((i) => ({ name: i.name.trim(), detail: i.detail?.trim() || null }))
    .filter((i) => i.name);
}

export function ProfileForm({
  initial,
  submitLabel,
  onSaved,
}: {
  initial: Profile;
  submitLabel: string;
  onSaved?: (profile: Profile) => void;
}) {
  const [profile, setProfile] = useState<Profile>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const set = (patch: Partial<Profile>) => {
    setSaved(false);
    setProfile((p) => ({ ...p, ...patch }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const body: Profile = {
      date_of_birth: profile.date_of_birth || null,
      gender: profile.gender || null,
      allergies: clean(profile.allergies),
      medications: clean(profile.medications),
      conditions: clean(profile.conditions),
    };
    const res = await fetch("/api/me/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);
    setBusy(false);
    const data = res ? await res.json().catch(() => null) : null;
    if (!res?.ok) {
      setError(errorMessage(data, "Couldn't save. Try again."));
      return;
    }
    setProfile(data as Profile);
    setSaved(true);
    onSaved?.(data as Profile);
  };

  return (
    <form onSubmit={submit} className="space-y-7">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="dob" className="label block mb-2">
            Date of birth
          </label>
          <input
            id="dob"
            type="date"
            max={today}
            value={profile.date_of_birth ?? ""}
            onChange={(e) => set({ date_of_birth: e.target.value || null })}
            className={INPUT}
          />
        </div>
        <div>
          <label htmlFor="gender" className="label block mb-2">
            Gender
          </label>
          <select
            id="gender"
            value={profile.gender ?? ""}
            onChange={(e) => set({ gender: e.target.value || null })}
            className={INPUT}
          >
            <option value="">Not set</option>
            {GENDERS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {LISTS.map((list) => (
        <ListEditor
          key={list.key}
          label={list.label}
          add={list.add}
          namePlaceholder={list.name}
          detailPlaceholder={list.detail}
          items={profile[list.key]}
          onChange={(items) => set({ [list.key]: items } as Partial<Profile>)}
        />
      ))}

      {error && <FormError>{error}</FormError>}
      {saved && <Notice>Saved. Every answer from now on takes this into account.</Notice>}
      <SubmitButton busy={busy}>{submitLabel}</SubmitButton>
    </form>
  );
}
