"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { FormError } from "../components/AuthForm";
import { errorMessage, homeFor, postJson, type Account } from "@/lib/account";

/** Only same-site paths, so a crafted ?next= cannot send someone off-site after login. */
function safeNext(next: string | null): string | null {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

async function profileIsEmpty(): Promise<boolean> {
  const res = await fetch("/api/me/profile", { cache: "no-store" });
  if (!res.ok) return false;
  const p = await res.json();
  return !p.date_of_birth && !p.gender && !p.allergies?.length && !p.medications?.length && !p.conditions?.length;
}

function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { ok, data } = await postJson("/api/auth/login", { email, password, remember }).catch(() => ({
      ok: false,
      status: 0,
      data: { detail: "Couldn't reach MedTriage. Check your connection and try again." },
    }));
    if (!ok) {
      setBusy(false);
      setError(errorMessage(data, "That didn't work. Try again."));
      return;
    }
    const user = (data as { user: Account }).user;
    // A first visit goes to onboarding: the profile is what lets every later answer
    // take age, gender and allergies into account.
    if (user.role === "patient" && !next && (await profileIsEmpty())) {
      router.replace("/onboarding");
      return;
    }
    router.replace(next ?? homeFor(user.role));
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="email" className="label block mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
            required
            autoComplete="current-password"
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
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-3.5 h-3.5 accent-[var(--foreground)]"
          />
          <span className="text-[13px] text-muted">Keep me logged in</span>
        </label>
        <Link
          href="/forgot-password"
          className="text-[13px] text-muted hover:text-foreground underline underline-offset-4 transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      {error && <FormError>{error}</FormError>}

      <button
        type="submit"
        disabled={busy}
        className="w-full h-11 bg-accent text-on-accent text-sm font-medium hover:opacity-85 transition-opacity disabled:opacity-40"
      >
        {busy ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
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

          {/* useSearchParams needs a Suspense boundary to prerender. */}
          <Suspense>
            <LoginForm />
          </Suspense>

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
