"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { Navbar } from "../../components/Navbar";
import { PrescriptionSheetView } from "../../components/PrescriptionSheet";
import { useAccount } from "@/lib/account";
import type { PrescriptionSheet } from "../../lib/dashboard";

export default function PrescriptionPage() {
  const account = useAccount("patient");
  const { id } = useParams<{ id: string }>();
  const signedIn = account !== null;
  const [sheet, setSheet] = useState<PrescriptionSheet | null>(null);
  const [failed, setFailed] = useState<"missing" | "error" | null>(null);

  useEffect(() => {
    if (!signedIn) return;
    let live = true;
    fetch(`/api/me/prescriptions/${id}`, { cache: "no-store" })
      .then(async (res) => {
        if (!live) return;
        if (res.status === 404) setFailed("missing");
        else if (!res.ok) setFailed("error");
        else setSheet(await res.json());
      })
      .catch(() => {
        if (live) setFailed("error");
      });
    return () => {
      live = false;
    };
  }, [signedIn, id]);

  return (
    <div className="min-h-screen bg-background text-foreground print:bg-white">
      <div className="no-print">
        <Navbar />
      </div>
      <main className="py-6 print:py-0">
        <div className="no-print mx-auto max-w-[210mm] px-4 sm:px-0 mb-4 flex items-center justify-between gap-3">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-[14px] text-muted hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          {sheet && (
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-accent text-on-accent text-[14px] font-medium hover:opacity-85 transition-opacity"
            >
              <Printer className="w-4 h-4" />
              Print or save as PDF
            </button>
          )}
        </div>

        {sheet && <PrescriptionSheetView sheet={sheet} />}
        {!sheet && failed && (
          <p className="mx-auto max-w-[210mm] px-4 sm:px-0 text-[15px] text-muted leading-relaxed">
            {failed === "missing"
              ? "This prescription isn't available. It may not have been issued yet."
              : "Couldn't load this prescription. Try again in a moment."}
          </p>
        )}
        {!sheet && !failed && <p className="mx-auto max-w-[210mm] px-4 sm:px-0 text-[15px] text-muted">Loading…</p>}
      </main>
    </div>
  );
}
