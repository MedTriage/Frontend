"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthPage, Field, Notice, SubmitButton, TEXT_LINK } from "../components/AuthForm";
import { postJson } from "@/lib/account";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await postJson("/api/auth/password/forgot", { email }).catch(() => null);
    setBusy(false);
    // The same answer whether or not the address has an account, so this page cannot be
    // used to find out who does.
    setSent(true);
  };

  return (
    <AuthPage
      label="Forgot password"
      heading="Reset your password."
      intro="Enter the address you signed up with, and we'll email you a link to choose a new password."
    >
      {sent ? (
        <Notice>
          If <span className="font-medium">{email}</span> has an account, a reset link is on its
          way. It expires in an hour.
        </Notice>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <Field id="email" label="Email" type="email" required autoComplete="email"
                 value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <SubmitButton busy={busy}>Send reset link</SubmitButton>
        </form>
      )}
      <p className="text-[14px] text-muted mt-8 pt-6 border-t border-border">
        Remembered it?{" "}
        <Link href="/login" className={TEXT_LINK}>
          Log in
        </Link>
      </p>
    </AuthPage>
  );
}
