"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthPage } from "../components/AuthForm";
import { SetPasswordForm } from "../components/SetPasswordForm";

function Reset() {
  return (
    <SetPasswordForm
      token={useSearchParams().get("token")}
      endpoint="/api/auth/password/reset"
      submitLabel="Set new password"
      doneMessage="Your password is changed, and every device that was signed in has been signed out."
    />
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthPage label="Reset password" heading="Choose a new password." intro="At least 10 characters.">
      <Suspense>
        <Reset />
      </Suspense>
    </AuthPage>
  );
}
