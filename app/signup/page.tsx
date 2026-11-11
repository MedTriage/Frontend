"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { AuthPage, Field, FormError, Notice, PasswordField, SubmitButton, TEXT_LINK } from "../components/AuthForm";
import { errorMessage, postJson } from "@/lib/account";

interface Requirement {
  label: string;
  test: (pw: string) => boolean;
}

const REQUIREMENTS: Requirement[] = [
  // The only rule the server enforces; the rest describe strength, not validity.
  { label: "At least 10 characters", test: (pw) => pw.length >= 10 },
  { label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "One lowercase letter", test: (pw) => /[a-z]/.test(pw) },
  { label: "One number", test: (pw) => /\d/.test(pw) },
  { label: "One special character", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

/* Deliberately achromatic. Colour in this product means clinical risk and nothing
   else — a weak password is not a medical emergency, and dressing it in the same
   red would cheapen the one signal that has to stay meaningful. Strength is shown
   by how far the rule fills, and by saying it plainly. */
function strengthLabel(passed: number): string {
  if (passed <= 1) return "Weak";
  if (passed <= 2) return "Fair";
  if (passed <= 3) return "Good";
  if (passed <= 4) return "Strong";
  return "Excellent";
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  const passed = useMemo(
    () => REQUIREMENTS.filter((r) => r.test(password)).length,
    [password]
  );

  const mismatch = confirmPassword.length > 0 && confirmPassword !== password;
  const ready = name.trim() && email.trim() && password.length >= 10 && confirmPassword === password && consent;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError(null);
    const { ok, data } = await postJson("/api/auth/signup", { name, email, password, consent }).catch(() => ({
      ok: false,
      status: 0,
      data: { detail: "Couldn't reach MedTriage. Check your connection and try again." },
    }));
    setBusy(false);
    if (!ok) {
      setError(errorMessage(data, "That didn't work. Try again."));
      return;
    }
    setSentTo(email);
  };

  const resend = async () => {
    await postJson("/api/auth/verify/resend", { email: sentTo }).catch(() => null);
    setResent(true);
  };

  if (sentTo) {
    return (
      <AuthPage
        label="Create an account"
        heading="Check your email."
        progress={1}
        intro={
          <>
            We sent a link to <span className="text-foreground">{sentTo}</span>. Open it to confirm
            the address, then log in. The link expires in 24 hours.
          </>
        }
      >
        {resent ? (
          <Notice>Sent again. Give it a minute, and check your spam folder.</Notice>
        ) : (
          <button
            type="button"
            onClick={resend}
            className="text-[15px] text-muted hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Didn&apos;t get it? Send it again
          </button>
        )}
        <p className="text-[15px] text-muted mt-9">
          Confirmed already?{" "}
          <Link href="/login" className={TEXT_LINK}>
            Log in
          </Link>
        </p>
      </AuthPage>
    );
  }

  // Five things to complete; the moon on the left waxes by a fifth for each.
  const done = [name.trim(), email.trim(), password.length >= 10, password && confirmPassword === password, consent].filter(Boolean).length;

  return (
    <AuthPage
      label="Create an account"
      heading="Start a record."
      intro="Your consultations are kept together, so what you tell us today is still known the next time you ask."
      progress={done / 5}
    >
      <form onSubmit={submit} className="space-y-5">
        <Field
          id="name"
          label="Name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
        />
        <Field
          id="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <div>
          <PasswordField
            id="password"
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
          />
          {password && (
            <div className="mt-3 rounded-[14px] bg-card px-4 py-3.5">
              <div className="flex items-baseline justify-between mb-2.5">
                <span className="label">Strength</span>
                <span className="data text-[12px]">{strengthLabel(passed)}</span>
              </div>
              <div className="relative h-[5px] rounded-full bg-border overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-foreground transition-[width] duration-300"
                  style={{ width: `${(passed / REQUIREMENTS.length) * 100}%` }}
                />
              </div>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
                {REQUIREMENTS.map((r) => {
                  const ok = r.test(password);
                  return (
                    <li
                      key={r.label}
                      className={`flex items-center gap-2 text-[13px] ${ok ? "text-foreground" : "text-muted"}`}
                    >
                      <Check className={`w-3 h-3 shrink-0 ${ok ? "opacity-100" : "opacity-25"}`} />
                      {r.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div>
          {/* The mismatch is not red. It is not a clinical risk, and the triage palette is
              not available for spending on form validation; the sentence states it. */}
          <PasswordField
            id="confirm"
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            invalid={mismatch}
          />
          {mismatch && (
            <p className="text-[13px] text-foreground font-medium mt-2">These two don&apos;t match.</p>
          )}
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="w-4 h-4 mt-[3px] shrink-0 accent-[var(--foreground)]"
          />
          <span className="text-[14px] text-muted leading-relaxed">
            I understand MedTriage is a research demo, not medical advice. My messages are
            stored and sent to an AI model provider (OpenRouter) to produce answers, and a
            doctor reviewing one of my questions will see my profile.
          </span>
        </label>

        {error && <FormError>{error}</FormError>}

        <SubmitButton busy={busy} disabled={!ready}>
          Create account
        </SubmitButton>
      </form>

      <p className="text-[15px] text-muted mt-9">
        Already have an account?{" "}
        <Link href="/login" className={TEXT_LINK}>
          Log in
        </Link>
      </p>
    </AuthPage>
  );
}
