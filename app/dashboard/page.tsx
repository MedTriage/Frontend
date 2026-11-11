"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "../components/Navbar";
import { FollowUpCalendar } from "../components/dashboard/FollowUpCalendar";
import { FollowUpCards } from "../components/dashboard/FollowUpCards";
import { HealthChart, type ChartKind } from "../components/dashboard/HealthChart";
import { PrescriptionsCard } from "../components/dashboard/PrescriptionsCard";
import { Sidebar } from "../components/dashboard/Sidebar";
import { StatTiles } from "../components/dashboard/StatTiles";
import type { Profile } from "../components/ProfileForm";
import { useAccount } from "@/lib/account";
import { finding, type FollowUpEpisode, type PrescriptionSummary, type Reading } from "../lib/dashboard";

/* One block's data. Blocks load and fail on their own, so a slow follow-up list never blanks
   the patient's readings, and an error stays inside the block it belongs to. */
function useBlock<T>(url: string, enabled: boolean) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(url, { cache: "no-store" }).catch(() => null);
    if (res?.ok) {
      setData(await res.json());
      setError(false);
    } else {
      setError(true);
    }
  }, [url]);

  useEffect(() => {
    if (!enabled) return;
    let live = true;
    fetch(url, { cache: "no-store" })
      .then(async (res) => {
        if (!live) return;
        if (!res.ok) throw new Error(String(res.status));
        const body = (await res.json()) as T;
        if (live) setData(body);
      })
      .catch(() => {
        if (live) setError(true);
      });
    return () => {
      live = false;
    };
  }, [enabled, url]);

  return { data, error, load };
}

export default function DashboardPage() {
  const account = useAccount("patient");
  const signedIn = account !== null;
  const readings = useBlock<Reading[]>("/api/me/readings", signedIn);
  const followups = useBlock<FollowUpEpisode[]>("/api/me/followups", signedIn);
  const prescriptions = useBlock<PrescriptionSummary[]>("/api/me/prescriptions", signedIn);
  const profile = useBlock<Profile>("/api/me/profile", signedIn);
  const [kind, setKind] = useState<ChartKind>("weight");
  const [today] = useState(() => new Date());

  const lead = followups.data ? finding(followups.data) : null;

  return (
    <div className="min-h-screen bg-background text-foreground min-[1180px]:grid min-[1180px]:grid-cols-[232px_minmax(0,1fr)]">
      <Sidebar account={account} />
      <div className="min-[1180px]:hidden">
        <Navbar />
      </div>

      {/* Single column up to 1180px, in the owner's order: calendar, prescriptions, stats. */}
      <main className="min-w-0 px-4 sm:px-6 min-[1180px]:px-7 py-6 grid grid-cols-[minmax(0,1fr)] gap-5 min-[1180px]:grid-cols-[minmax(0,1fr)_340px] min-[1180px]:grid-rows-[auto_1fr] items-start">
        <header className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 min-[1180px]:col-start-1">
          <div className="min-w-0">
            <h1 className="text-[26px] font-medium tracking-[-0.02em] leading-tight">Dashboard</h1>
            <p className="text-[15px] text-muted mt-1 min-h-[22px]">{lead?.text ?? ""}</p>
          </div>
          <div className="flex items-center gap-2">
            {lead?.href && (
              <Link
                href={lead.href}
                className="inline-flex items-center h-10 px-4 rounded-full bg-t1 text-on-t1 text-[14px] font-medium hover:opacity-85 transition-opacity"
              >
                {lead.action}
              </Link>
            )}
            <Link
              href="/chat"
              className="min-[1180px]:hidden inline-flex items-center h-10 px-4 rounded-full bg-accent text-on-accent text-[14px] font-medium hover:opacity-85 transition-opacity"
            >
              Start a consultation
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:max-[1179px]:grid-cols-2 min-[1180px]:col-start-2 min-[1180px]:row-start-1 min-[1180px]:row-span-2 items-start">
          <FollowUpCalendar episodes={followups.data} today={today} error={followups.error} onRetry={followups.load} />
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
            <FollowUpCards episodes={followups.error ? [] : followups.data} />
            <PrescriptionsCard
              prescriptions={prescriptions.data}
              regular={profile.data?.medications ?? []}
              error={prescriptions.error}
              onRetry={prescriptions.load}
            />
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 min-[1180px]:col-start-1 min-w-0">
          <HealthChart readings={readings.data} kind={kind} onKind={setKind} today={today} />
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 mb-2.5 px-0.5">
              <h2 className="text-[17px] font-medium tracking-[-0.01em]">Health stats</h2>
              <p className="text-[12px] text-muted">
                The latest of each goes into your consultations, for the agents and the doctor reviewing them.
              </p>
            </div>
            <StatTiles
              readings={readings.data}
              dateOfBirth={profile.data?.date_of_birth}
              kind={kind}
              onKind={setKind}
              today={today}
              onChanged={readings.load}
              error={readings.error}
              onRetry={readings.load}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
