"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthPage, TEXT_LINK } from "../components/AuthForm";
import { EMPTY_PROFILE, ProfileForm, type Profile } from "../components/ProfileForm";
import { useAccount } from "@/lib/account";

export default function OnboardingPage() {
  const router = useRouter();
  const account = useAccount("patient");
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!account) return;
    fetch("/api/me/profile", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : EMPTY_PROFILE))
      .then(setProfile)
      .catch(() => setProfile(EMPTY_PROFILE));
  }, [account]);

  return (
    <AuthPage
      wide
      label="Your profile"
      heading="Before your first question."
      intro="Age, gender, allergies and regular medicines change what is safe to suggest, so every answer takes them into account. Only you can see this, and a doctor reviewing one of your questions."
    >
      {profile ? (
        <>
          <ProfileForm initial={profile} submitLabel="Save and continue" onSaved={() => router.push("/chat")} />
          <p className="text-[14px] text-muted mt-6">
            Every field is optional.{" "}
            <Link href="/chat" className={TEXT_LINK}>
              Skip for now
            </Link>
            ; you can fill it in later from your profile.
          </p>
        </>
      ) : (
        <p className="text-[15px] text-muted">Loading…</p>
      )}
    </AuthPage>
  );
}
