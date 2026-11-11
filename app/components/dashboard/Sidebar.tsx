"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutGrid, LogOut, MessageSquareText, Plus, UserRound } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { postJson, type Account } from "@/lib/account";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid, active: true },
  { href: "/chat", label: "Consultations", icon: MessageSquareText, active: false },
  { href: "/profile", label: "Profile", icon: UserRound, active: false },
];

/* The desktop rail. Below 1180px it folds away and the shared Navbar's menu takes over. The
   consultation button keeps the reference's "New Appointment" slot: MedTriage has no bookings,
   and starting a consultation is what a patient comes to the product to do. */
export function Sidebar({ account }: { account: Account | null }) {
  const router = useRouter();

  const signOut = async () => {
    await postJson("/api/auth/logout").catch(() => null);
    router.replace("/login");
  };

  return (
    <aside className="hidden min-[1180px]:flex sticky top-[72px] h-[calc(100vh-72px)] flex-col px-4 pt-3 pb-6">
      <nav aria-label="Dashboard" className="space-y-1">
        {LINKS.map(({ href, label, icon: Icon, active }) => (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 h-10 px-3 rounded-xl text-[14px] transition-colors ${
              active
                ? "bg-card border border-border font-medium"
                : "text-muted hover:text-foreground hover:bg-card/60"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-[13px] text-muted truncate">{account?.name ?? ""}</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <ThemeToggle />
            <button
              type="button"
              onClick={signOut}
              aria-label="Sign out"
              className="p-2 rounded-lg border border-border/50 bg-card hover:bg-border/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-muted" />
            </button>
          </div>
        </div>
        <Link
          href="/chat"
          className="flex items-center gap-3 h-14 pl-2.5 pr-4 rounded-2xl bg-accent text-on-accent text-[14px] font-medium leading-tight hover:opacity-85 transition-opacity"
        >
          <span className="w-9 h-9 rounded-full bg-on-accent text-accent flex items-center justify-center shrink-0">
            <Plus className="w-4 h-4" />
          </span>
          Start a consultation
        </Link>
      </div>
    </aside>
  );
}
