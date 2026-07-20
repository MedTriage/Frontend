"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Navbar } from "../components/Navbar";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-[380px] rise">
          <p className="label mb-4">Log in</p>
          <h1 className="display text-[1.9rem] mb-2">Welcome back.</h1>
          <p className="text-[15px] text-muted leading-relaxed mb-9">
            Your consultations and the reasoning behind them are waiting where
            you left them.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
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
                  autoComplete="current-password"
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
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 accent-[var(--foreground)]"
                />
                <span className="text-[13px] text-muted">Keep me logged in</span>
              </label>
              <button
                type="button"
                className="text-[13px] text-muted hover:text-foreground underline underline-offset-4 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-accent text-on-accent text-sm font-medium hover:opacity-85 transition-opacity"
            >
              Log in
            </button>
          </form>

          <p className="text-[14px] text-muted mt-8 pt-6 border-t border-border">
            No account yet?{" "}
            <Link
              href="/signup"
              className="text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity"
            >
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
