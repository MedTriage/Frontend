"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion, useMotionValue, useSpring } from "motion/react";
import "../site.css";
import { Moon } from "./site/Moon";
import { Navbar } from "./Navbar";

/* The account pages share one shape: a night panel that holds the moon, and beside it a
   narrow column with a heading, a sentence of intent and the form. Every account step
   (log in, sign up, reset, invitation, verification) is the same place.

   The moon is the public site's, in bone rather than a level colour: here it measures
   the form, not a risk. `progress` is how much of the form is filled in, 0 to 1, and
   the moon waxes with it; a page that has nothing to fill leaves it at the half. */

export const INPUT =
  "w-full h-12 px-4 rounded-[14px] bg-sunk border border-transparent text-[15px] placeholder:text-muted/60 focus:outline-none focus:border-foreground focus:bg-card transition-colors";

export function AuthPage({
  label,
  heading,
  intro,
  children,
  wide = false,
  progress = 0.5,
}: {
  label: string;
  heading: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
  progress?: number;
}) {
  const target = useMotionValue(progress * 2 - 1);
  const phase = useSpring(target, { stiffness: 60, damping: 16 });
  useEffect(() => {
    target.set(Math.max(0, Math.min(1, progress)) * 2 - 1);
  }, [progress, target]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="flex-1 lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <aside className="hidden lg:flex sticky top-[72px] h-[calc(100vh-72px-20px)] ml-5 mb-5 rounded-[28px] flex-col justify-between p-10 xl:p-12 bg-[#0b0d0c] text-[#ece9e2] overflow-hidden">
          <motion.div
            className="self-center my-auto w-[min(74%,400px)]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <Moon phase={phase} color="#ece9e2" dark="#1a1f1c" />
          </motion.div>
          <p className="display text-[clamp(1.6rem,2.4vw,2.3rem)] leading-[1.05] max-w-[15ch]">
            The more it matters, the less the AI decides.
          </p>
        </aside>

        <main className="flex items-center justify-center px-6 sm:px-10 py-12">
          <div className={`w-full ${wide ? "max-w-[580px]" : "max-w-[400px]"} rise`}>
            <p className="label mb-5">{label}</p>
            <h1 className="display text-[clamp(2.3rem,4vw,3.1rem)] mb-4">{heading}</h1>
            {intro && <p className="text-[16px] text-muted leading-relaxed mb-9">{intro}</p>}
            {children}
          </div>
        </main>
      </div>
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
          className={`${INPUT} pr-12 ${invalid ? "!border-foreground" : ""}`}
        />
        <button
          type="button"
          onClick={() => setShown(!shown)}
          aria-label={shown ? "Hide password" : "Show password"}
          className="absolute right-0 top-0 h-12 w-12 grid place-items-center text-muted hover:text-foreground transition-colors"
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
      className="group w-full h-[52px] pl-6 pr-2 rounded-full bg-accent text-on-accent font-mono text-[13.5px] flex items-center justify-between active:scale-[0.985] transition-[transform,opacity] disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <span>{busy ? "One moment…" : children}</span>
      <span className="w-9 h-9 rounded-full bg-on-accent text-accent grid place-items-center transition-transform duration-500 group-hover:translate-x-0 group-enabled:group-hover:rotate-[-45deg]">
        <svg viewBox="0 0 16 16" fill="none" className="w-[15px] h-[15px]" aria-hidden>
          <path d="M2.5 8h10.4M8.6 3.6 13 8l-4.4 4.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
  );
}

/** A problem with what was entered, stated plainly. Achromatic on purpose. */
export function FormError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="text-[14px] text-foreground font-medium leading-relaxed rounded-[14px] bg-sunk px-4 py-3">
      {children}
    </p>
  );
}

/** A neutral outcome: sent, saved, confirmed. */
export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" className="rounded-[14px] bg-card px-4 py-3.5 text-[15px] leading-relaxed">
      {children}
    </div>
  );
}

export const TEXT_LINK =
  "text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity";
