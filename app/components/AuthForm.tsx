"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Navbar } from "./Navbar";

/* The account pages share one shape — a narrow column under the navbar, a label, a
   display heading, a sentence of intent — taken from the original login and sign-up
   pages so every account step reads as the same place. */

export const INPUT =
  "w-full h-11 px-3.5 bg-card border border-border text-[14px] placeholder:text-muted/70 focus:outline-none focus:border-foreground transition-colors";

export function AuthPage({
  label,
  heading,
  intro,
  children,
  wide = false,
}: {
  label: string;
  heading: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className={`w-full ${wide ? "max-w-[560px]" : "max-w-[380px]"} rise`}>
          <p className="label mb-4">{label}</p>
          <h1 className="display text-[1.9rem] mb-2">{heading}</h1>
          {intro && <p className="text-[15px] text-muted leading-relaxed mb-9">{intro}</p>}
          {children}
        </div>
      </main>
    </div>
  );
}

export function Field({
  id,
  label,
  ...input
}: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="label block mb-2">
        {label}
      </label>
      <input id={id} className={INPUT} {...input} />
    </div>
  );
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  invalid = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  invalid?: boolean;
}) {
  const [shown, setShown] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="label block mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={shown ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          aria-invalid={invalid}
          // Not red: a form problem is not a clinical risk. See the sign-up page.
          className={`w-full h-11 pl-3.5 pr-11 bg-card border text-[14px] placeholder:text-muted/70 focus:outline-none transition-colors ${
            invalid ? "border-foreground" : "border-border focus:border-foreground"
          }`}
        />
        <button
          type="button"
          onClick={() => setShown(!shown)}
          aria-label={shown ? "Hide password" : "Show password"}
          className="absolute right-0 top-0 h-11 w-11 grid place-items-center text-muted hover:text-foreground transition-colors"
        >
          {shown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export function SubmitButton({
  busy,
  disabled = false,
  children,
}: {
  busy: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={busy || disabled}
      className="w-full h-11 bg-accent text-on-accent text-sm font-medium hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {busy ? "One moment…" : children}
    </button>
  );
}

/** A problem with what was entered, stated plainly. Achromatic on purpose. */
export function FormError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="text-[13px] text-foreground font-medium leading-relaxed border-l-2 border-foreground pl-3">
      {children}
    </p>
  );
}

/** A neutral outcome: sent, saved, confirmed. */
export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" className="border border-border bg-card px-4 py-3.5 text-[14px] leading-relaxed">
      {children}
    </div>
  );
}

export const TEXT_LINK =
  "text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity";
