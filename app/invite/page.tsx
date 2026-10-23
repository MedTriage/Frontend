"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthPage } from "../components/AuthForm";
import { SetPasswordForm } from "../components/SetPasswordForm";

function Accept() {
  return (
    <SetPasswordForm
      token={useSearchParams().get("token")}
      endpoint="/api/auth/invite/accept"
      submitLabel="Activate account"
      doneMessage="Your reviewer account is active."
    />
  );
}

export default function InvitePage() {
  return (
    <AuthPage
      label="Reviewer invitation"
      heading="Set your password."
      intro="You've been invited to review cases that MedTriage holds for a doctor. Choose a password of at least 10 characters to activate your account."
    >
      <Suspense>
        <Accept />
      </Suspense>
    </AuthPage>
  );
}
