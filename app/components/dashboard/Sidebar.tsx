"use client";

import { useEffect, useId, useState } from "react";
import { Skel } from "../Skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { ChevronDown, LayoutGrid, LogOut, MessageSquareText, Plus, UserRound } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { postJson, type Account } from "@/lib/account";

const ROW = "flex items-center gap-3 h-10 px-3 rounded-xl text-[14px] transition-colors";
const QUIET = "text-muted hover:text-foreground hover:bg-card/60";
const EASE = [0.22, 1, 0.36, 1] as const;

/* How many past consultations the dropdown lists. The sidebar is a way back to the last few,
   not the log: levels, dates and deleting stay in the full log on the chat page. */
const RECENT = 6;

/* What the dropdown needs of a consultation as `/api/conversations` lists it. */
interface Recent {
  id: string;
  title: string | null;
  checkin_due: boolean;
}

/* The "Consultations" row is a dropdown (owner's request, 2026-11-15): it opens the most
   recent consultations by title, in the server's order, the same list the chat page's rail
   shows. Each opens through `/chat?c=<id>`, the link the "your question was reviewed" email
   already uses. Like every block on this page it loads and fails on its own. */
function Consultations() {
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<Recent[] | null>(null);
  const [failed, setFailed] = useState(false);
  const reduced = useReducedMotion();
  const listId = useId();

  useEffect(() => {
    let live = true;
    fetch("/api/conversations", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((all: Recent[]) => live && setRecent(all))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  const shown = recent?.slice(0, RECENT) ?? [];
  // Counted over every consultation, so one waiting below the fold still shows on the row.
  const waiting = recent?.some((c) => c.checkin_due) ?? false;
  // A timed sequence drops its delays for reduced motion rather than changing `initial`.
  const step = (i: number) => (reduced ? 0 : 0.08 + i * 0.035);

  return (
    <MotionConfig reducedMotion="user">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={listId}
        className={`${ROW} w-full text-left ${open ? "text-foreground" : QUIET}`}
      >
        <MessageSquareText className="w-4 h-4 shrink-0" strokeWidth={1.75} />
        <span className="min-w-0 flex-1 truncate">Consultations</span>
        {waiting && !open && (
          <>
            <span className="block w-1.5 h-1.5 shrink-0 rounded-full bg-foreground" aria-hidden />
            <span className="sr-only">Check-in waiting</span>
          </>
        )}
        <motion.span
          aria-hidden
          className="shrink-0 grid place-items-center"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.75} />
        </motion.span>
      </button>

      {/* Height is animated on a wrapper with no padding of its own, so the list does not
          jump by its padding as it closes. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={listId}
            key="recent"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.34, ease: EASE }}
            className="overflow-hidden"
          >
            {/* The rule hangs from the middle of the row's icon, so the titles read as
                belonging to it. */}
            <ul className="ml-5 mt-1 mb-1 pl-2 border-l border-border space-y-0.5">
              {recent === null && !failed && (
                <li className="px-2.5 py-2 space-y-3" role="status" aria-label="Loading consultations">
                  {[78, 56, 68].map((w, i) => (
                    <Skel key={w} className="h-[11px]" style={{ width: `${w}%` }} delay={i * 0.1} />
                  ))}
                </li>
              )}
              {failed && (
                <li className="px-2.5 py-1.5 text-[13px] text-muted/70">Couldn’t load consultations</li>
              )}
              {recent?.length === 0 && (
                <li className="px-2.5 py-1.5 text-[13px] text-muted/70">No consultations yet</li>
              )}
              {shown.map((c, i) => (
                <motion.li
                  key={c.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.28, ease: EASE, delay: step(i) }}
                >
                  <Link
                    href={`/chat?c=${encodeURIComponent(c.id)}`}
                    className={`flex items-center gap-2 h-8 px-2.5 rounded-lg text-[13px] transition-colors ${QUIET}`}
                  >
                    <span className="min-w-0 flex-1 truncate">{c.title || "Untitled Conversation"}</span>
                    {c.checkin_due && (
                      <>
                        <span className="block w-1.5 h-1.5 shrink-0 rounded-full bg-foreground" aria-hidden />
                        <span className="sr-only">Check-in waiting</span>
                      </>
                    )}
                  </Link>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.28, delay: step(shown.length) }}
              >
                <Link
                  href="/chat"
                  className="data flex items-center h-8 px-2.5 rounded-lg text-[11px] uppercase tracking-[0.1em] text-muted hover:text-foreground transition-colors"
                >
                  {recent && recent.length > RECENT ? `All ${recent.length} consultations` : "Open consultations"}
                </Link>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

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
      {/* The nav takes the spare height and scrolls, so an open dropdown on a short screen
          never pushes the consultation button off the page. */}
      <nav aria-label="Dashboard" className="flex-1 min-h-0 overflow-y-auto space-y-1">
        <Link
          href="/dashboard"
          aria-current="page"
          className={`${ROW} bg-card border border-border font-medium`}
        >
          <LayoutGrid className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          Dashboard
        </Link>
        <Consultations />
        <Link href="/profile" className={`${ROW} ${QUIET}`}>
          <UserRound className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          Profile
        </Link>
      </nav>

      <div className="shrink-0 pt-3 space-y-3">
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
