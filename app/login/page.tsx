"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthPage, Field, FormError, PasswordField, SubmitButton, TEXT_LINK } from "../components/AuthForm";
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
    <AuthPage
      label="Log in"
      heading="Welcome back."
      intro="Your consultations and the reasoning behind them are waiting where you left them."
      // The moon waxes as the form fills: new with nothing typed, full when both are in.
      progress={(email ? 0.5 : 0) + (password ? 0.5 : 0)}
    >
      <form onSubmit={submit} className="space-y-5">
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
        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 accent-[var(--foreground)]"
            />
            <span className="text-[14px] text-muted">Keep me logged in</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-[14px] text-muted hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {error && <FormError>{error}</FormError>}

        <SubmitButton busy={busy} disabled={!email || !password}>
          Log in
        </SubmitButton>
      </form>

      <p className="text-[15px] text-muted mt-9">
        No account yet?{" "}
        <Link href="/signup" className={TEXT_LINK}>
          Create one
        </Link>
      </p>
    </AuthPage>
  );
}

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary to prerender.
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
