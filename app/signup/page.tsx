"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Eye, EyeOff, Check } from "lucide-react";
import { Navbar } from "../components/Navbar";

interface Requirement {
  label: string;
  test: (pw: string) => boolean;
}

const REQUIREMENTS: Requirement[] = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passed = useMemo(
    () => REQUIREMENTS.filter((r) => r.test(password)).length,
    [password]
  );

  const mismatch = confirmPassword.length > 0 && confirmPassword !== password;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-[380px] rise">
          <p className="label mb-4">Create an account</p>
          <h1 className="display text-[1.9rem] mb-2">Start a record.</h1>
          <p className="text-[15px] text-muted leading-relaxed mb-9">
            Your consultations are kept together, so what you tell us today is
            still known the next time you ask.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            <div>
              <label htmlFor="name" className="label block mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                className="w-full h-11 px-3.5 bg-card border border-border text-[14px] placeholder:text-muted/70 focus:outline-none focus:border-foreground transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="label block mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full h-11 px-3.5 bg-card border border-border text-[14px] placeholder:text-muted/70 focus:outline-none focus:border-foreground transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="label block mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-3.5 pr-11 bg-card border border-border text-[14px] placeholder:text-muted/70 focus:outline-none focus:border-foreground transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-0 top-0 h-11 w-11 grid place-items-center text-muted hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {password && (
                <div className="mt-3">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="label">Strength</span>
                    <span className="data text-[11px]">
                      {strengthLabel(passed)}
                    </span>
                  </div>
                  <div className="relative h-[3px] bg-border">
                    <div
                      className="absolute inset-y-0 left-0 bg-foreground transition-[width] duration-200"
                      style={{
                        width: `${(passed / REQUIREMENTS.length) * 100}%`,
                      }}
                    />
                  </div>

                  <ul className="mt-3 space-y-1">
                    {REQUIREMENTS.map((r) => {
                      const ok = r.test(password);
                      return (
                        <li
                          key={r.label}
                          className={`flex items-center gap-2 text-[12px] ${
                            ok ? "text-foreground" : "text-muted"
                          }`}
                        >
                          <Check
                            className={`w-3 h-3 shrink-0 ${ok ? "opacity-100" : "opacity-25"}`}
                          />
                          {r.label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirm" className="label block mb-2">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  aria-invalid={mismatch}
                  // Not red. A password mismatch is not a clinical risk, and the
                  // triage palette is not available for spending on form validation.
                  // The message below states the problem; it needs no colour to do so.
                  className={`w-full h-11 pl-3.5 pr-11 bg-card border text-[14px] placeholder:text-muted/70 focus:outline-none transition-colors ${
                    mismatch
                      ? "border-foreground"
                      : "border-border focus:border-foreground"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  className="absolute right-0 top-0 h-11 w-11 grid place-items-center text-muted hover:text-foreground transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {mismatch && (
                <p className="text-[12px] text-foreground font-medium mt-2">
                  These two don&apos;t match.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-accent text-on-accent text-sm font-medium hover:opacity-85 transition-opacity"
            >
              Create account
            </button>
          </form>

          <p className="text-[13px] text-muted mt-5 leading-relaxed">
            MedTriage is a research system. It is not a diagnosis, and not a
            substitute for seeing a doctor.
          </p>

          <p className="text-[14px] text-muted mt-6 pt-6 border-t border-border">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity"
            >
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
