"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthPage, Field, FormError, Notice, SubmitButton, TEXT_LINK } from "../components/AuthForm";
import { postJson } from "@/lib/account";

function Verify() {
  const token = useSearchParams().get("token");
  const [state, setState] = useState<"checking" | "verified" | "failed">(token ? "checking" : "failed");
  const [email, setEmail] = useState("");
  const [resent, setResent] = useState(false);
  const [busy, setBusy] = useState(false);
  // A token is single-use; React's development double-mount must not spend it twice.
  const sent = useRef(false);

  useEffect(() => {
    if (!token || sent.current) return;
    sent.current = true;
    postJson("/api/auth/verify", { token })
      .then(({ ok }) => setState(ok ? "verified" : "failed"))
      .catch(() => setState("failed"));
  }, [token]);

  if (state === "checking") return <p className="text-[15px] text-muted">Confirming…</p>;

  if (state === "verified") {
    return (
      <>
        <Notice>Your email is confirmed.</Notice>
        <p className="text-[14px] text-muted mt-6">
          <Link href="/login" className={TEXT_LINK}>
            Log in
          </Link>{" "}
          to set up your profile and start a consultation.
        </p>
      </>
    );
  }

  const resend = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await postJson("/api/auth/verify/resend", { email }).catch(() => null);
    setBusy(false);
    setResent(true);
  };

  return (
    <>
      <FormError>This link is invalid, already used, or has expired.</FormError>
      {resent ? (
        <div className="mt-6">
          <Notice>If that address has an unconfirmed account, a new link is on its way.</Notice>
        </div>
      ) : (
        <form onSubmit={resend} className="space-y-5 mt-6">
          <Field id="email" label="Email" type="email" required autoComplete="email"
                 value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <SubmitButton busy={busy}>Send a new link</SubmitButton>
        </form>
      )}
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthPage label="Confirm email" heading="Confirming your address.">
      <Suspense>
        <Verify />
      </Suspense>
    </AuthPage>
  );
}
