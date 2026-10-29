"use client";

import { useState } from "react";
import Link from "next/link";
import { FormError, Notice, PasswordField, SubmitButton, TEXT_LINK } from "./AuthForm";
import { errorMessage, postJson } from "@/lib/account";

/** Choose a password with an emailed single-use token: password reset and doctor
 *  invitations are the same form against different endpoints. */
export function SetPasswordForm({
  token,
  endpoint,
  submitLabel,
  doneMessage,
}: {
  token: string | null;
  endpoint: string;
  submitLabel: string;
  doneMessage: string;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!token) return <FormError>This link is incomplete. Open it again from the email.</FormError>;

  if (done) {
    return (
      <>
        <Notice>{doneMessage}</Notice>
        <p className="text-[14px] text-muted mt-6">
          <Link href="/login" className={TEXT_LINK}>
            Log in
          </Link>{" "}
          with your new password.
        </p>
      </>
    );
  }

  const mismatch = confirm.length > 0 && confirm !== password;
  const tooShort = password.length > 0 && password.length < 10;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { ok, data } = await postJson(endpoint, { token, password }).catch(() => ({
      ok: false,
      status: 0,
      data: { detail: "Couldn't reach MedTriage. Check your connection and try again." },
    }));
    setBusy(false);
    if (ok) setDone(true);
    else setError(errorMessage(data, "That didn't work. Try again."));
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <PasswordField id="password" label="New password" value={password} onChange={setPassword}
                     autoComplete="new-password" invalid={tooShort} />
      {tooShort && <p className="text-[12px] text-foreground font-medium -mt-3">At least 10 characters.</p>}
      <PasswordField id="confirm" label="Confirm password" value={confirm} onChange={setConfirm}
                     autoComplete="new-password" invalid={mismatch} />
      {mismatch && <p className="text-[12px] text-foreground font-medium -mt-3">These two don&apos;t match.</p>}
      {error && <FormError>{error}</FormError>}
      <SubmitButton busy={busy} disabled={password.length < 10 || confirm !== password}>
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
