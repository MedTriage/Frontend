"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Shield, Eye, EyeOff, Check, X } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

/* ─── Password helpers ─── */

interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "One lowercase letter", test: (pw) => /[a-z]/.test(pw) },
  { label: "One number", test: (pw) => /\d/.test(pw) },
  { label: "One special character (!@#$…)", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "bg-border/30" };
  const passed = PASSWORD_RULES.filter((r) => r.test(pw)).length;
  if (passed <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
  if (passed <= 2) return { score: 2, label: "Fair", color: "bg-orange-500" };
  if (passed <= 3) return { score: 3, label: "Good", color: "bg-amber-400" };
  if (passed <= 4) return { score: 4, label: "Strong", color: "bg-emerald-400" };
  return { score: 5, label: "Excellent", color: "bg-emerald-500" };
}

/* ─── Component ─── */

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const strength = useMemo(() => getStrength(password), [password]);
  const rulesStatus = useMemo(
    () => PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(password) })),
    [password]
  );
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted">
              Get started with AI&#8209;assisted clinical triage
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-4"
          >
            {/* Name */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted/60">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Jane Doe"
                className="w-full px-4 py-3 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/10 transition-all font-sans"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted/60">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/10 transition-all font-sans"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted/60">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/10 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/40 hover:text-muted transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Strength meter — visible only when typing */}
              {password.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= strength.score ? strength.color : "bg-border/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`font-mono text-[10px] ${
                      strength.score <= 1
                        ? "text-red-400"
                        : strength.score <= 2
                          ? "text-orange-400"
                          : strength.score <= 3
                            ? "text-amber-400"
                            : "text-emerald-400"
                    }`}
                  >
                    {strength.label}
                  </span>
                </div>
              )}

              {/* Password requirements — always visible */}
              <div className="space-y-1.5 pt-1 px-1">
                <span className="font-mono text-[10px] text-muted/50">
                  Password requirements
                </span>
                {rulesStatus.map((rule) => (
                  <div
                    key={rule.label}
                    className="flex items-center gap-2"
                  >
                    {rule.passed ? (
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    ) : (
                      <X className="w-3 h-3 text-muted/30 shrink-0" />
                    )}
                    <span
                      className={`text-[11px] ${
                        rule.passed ? "text-emerald-400" : "text-muted/40"
                      }`}
                    >
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted/60">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 pr-11 rounded-xl bg-card border text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:ring-1 transition-all font-sans ${
                    passwordsMatch
                      ? "border-emerald-400/40 focus:border-emerald-400/40 focus:ring-emerald-400/10"
                      : passwordsMismatch
                        ? "border-red-400/40 focus:border-red-400/40 focus:ring-red-400/10"
                        : "border-border/50 focus:border-accent/30 focus:ring-accent/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/40 hover:text-muted transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {passwordsMatch && (
                <div className="flex items-center gap-1.5 px-1">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400">
                    Passwords match
                  </span>
                </div>
              )}
              {passwordsMismatch && (
                <div className="flex items-center gap-1.5 px-1">
                  <X className="w-3 h-3 text-red-400" />
                  <span className="text-[11px] text-red-400">
                    Passwords do not match
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 mt-0.5 rounded border-border/50 accent-accent"
              />
              <span className="text-xs text-muted leading-relaxed">
                I agree to the{" "}
                <button type="button" className="text-accent hover:text-accent/80 transition-colors">
                  Terms of Service
                </button>{" "}
                and{" "}
                <button type="button" className="text-accent hover:text-accent/80 transition-colors">
                  Privacy Policy
                </button>
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-accent text-background font-medium text-sm hover:bg-accent/90 transition-colors"
            >
              Create account
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border/50" />
            <span className="font-mono text-[10px] text-muted/40 uppercase tracking-widest">
              or
            </span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-accent hover:text-accent/80 transition-colors font-medium"
            >
              Log in
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
