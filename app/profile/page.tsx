"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, LogOut } from "lucide-react";
import { AuthPage, FormError, Notice, PasswordField } from "../components/AuthForm";
import { EMPTY_PROFILE, ProfileForm, type Profile } from "../components/ProfileForm";
import { errorMessage, postJson, useAccount } from "@/lib/account";

interface Suggestion {
  id: number;
  kind: "condition" | "medication" | "allergy";
  text: string;
  first_mentioned_at: string;
}

const KIND_LABEL: Record<Suggestion["kind"], string> = {
  allergy: "Allergy",
  medication: "Medication",
  condition: "Condition",
};

async function fetchProfileAndSuggestions(): Promise<[Profile, Suggestion[]]> {
  return Promise.all([
    fetch("/api/me/profile", { cache: "no-store" }).then((r) => (r.ok ? r.json() : EMPTY_PROFILE)),
    fetch("/api/me/suggestions", { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])),
  ]).catch((): [Profile, Suggestion[]] => [EMPTY_PROFILE, []]);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="label mb-5">{title}</h2>
      {children}
    </section>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const account = useAccount("patient");
  const [profile, setProfile] = useState<Profile | null>(null);
  // Bumped when a suggestion changes the profile, so the form re-reads it.
  const [version, setVersion] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [resent, setResent] = useState(false);
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const show = ([p, s]: [Profile, Suggestion[]]) => {
    setProfile(p);
    setSuggestions(s);
    setVersion((v) => v + 1);
  };

  useEffect(() => {
    if (!account) return;
    let cancelled = false;
    fetchProfileAndSuggestions().then((loaded) => {
      if (!cancelled) show(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [account]);

  const decide = async (id: number, action: "accept" | "dismiss") => {
    await postJson(`/api/me/suggestions/${id}/${action}`).catch(() => null);
    if (action === "accept") show(await fetchProfileAndSuggestions());
    else setSuggestions((all) => all.filter((s) => s.id !== id));
  };

  const signOut = async () => {
    await postJson("/api/auth/logout").catch(() => null);
    router.replace("/login");
  };

  const deleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleting(true);
    setDeleteError(null);
    const res = await fetch("/api/me", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    if (res?.status === 204) {
      router.replace("/");
      return;
    }
    setDeleting(false);
    setDeleteError(errorMessage(res ? await res.json().catch(() => null) : null, "Couldn't delete the account. Try again."));
  };

  if (!account || !profile) {
    return (
      <AuthPage wide label="Your profile" heading="Your profile.">
        <p className="text-[15px] text-muted">Loading…</p>
      </AuthPage>
    );
  }

  return (
    <AuthPage
      wide
      label="Your profile"
      heading={account.name}
      intro={
        <>
          {account.email}. What you state here is taken into account in every answer. Only you
          can see it, and a doctor reviewing one of your questions.
        </>
      }
    >
      {!account.verified && (
        <div className="mb-8">
          <Notice>
            Confirm your email address to start a consultation.{" "}
            {resent ? (
              "A new link is on its way."
            ) : (
              <button
                type="button"
                onClick={async () => {
                  await postJson("/api/auth/verify/resend", { email: account.email }).catch(() => null);
                  setResent(true);
                }}
                className="underline underline-offset-4 hover:opacity-70"
              >
                Send the link again
              </button>
            )}
          </Notice>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mb-10">
          <h2 className="label mb-2">From your conversations</h2>
          <p className="text-[13px] text-muted leading-relaxed mb-4">
            You mentioned these in a chat. Nothing is added to your profile unless you say so.
          </p>
          <ul className="border-t border-border">
            {suggestions.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-border">
                <div className="min-w-0">
                  <p className="text-[14px]">{s.text}</p>
                  <p className="data text-[11px] text-muted mt-0.5">
                    {KIND_LABEL[s.kind]} · mentioned {new Date(s.first_mentioned_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => decide(s.id, "accept")}
                    className="h-9 px-3.5 bg-accent text-on-accent text-[13px] font-medium hover:opacity-85 transition-opacity"
                  >
                    Add to profile
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(s.id, "dismiss")}
                    className="h-9 px-3.5 border border-border text-[13px] text-muted hover:text-foreground hover:border-foreground transition-colors"
                  >
                    Not right
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ProfileForm key={version} initial={profile} submitLabel="Save profile" />

      <Section title="Your data">
        <div className="flex flex-wrap gap-2.5">
          <a
            href="/api/me/export"
            className="inline-flex items-center gap-2 h-10 px-4 border border-border text-[13px] text-muted hover:text-foreground hover:border-foreground transition-colors"
          >
            <Download className="w-4 h-4" />
            Download a copy
          </a>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 h-10 px-4 border border-border text-[13px] text-muted hover:text-foreground hover:border-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </Section>

      <Section title="Delete account">
        <p className="text-[14px] text-muted leading-relaxed mb-5">
          Deletes your account and everything stored with it: your profile, your conversations and
          your records. It can&apos;t be undone.
        </p>
        <form onSubmit={deleteAccount} className="space-y-4 max-w-[380px]">
          <PasswordField id="delete-password" label="Your password" value={password}
                         onChange={setPassword} autoComplete="current-password" />
          {deleteError && <FormError>{deleteError}</FormError>}
          <button
            type="submit"
            disabled={!password || deleting}
            className="w-full h-11 border border-foreground text-[14px] font-medium hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {deleting ? "Deleting…" : "Delete my account"}
          </button>
        </form>
      </Section>
    </AuthPage>
  );
}
