"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  { name: "Overview", link: "/" },
  { name: "How it works", link: "/about" },
  { name: "Consult", link: "/chat" },
  { name: "Review queue", link: "/doctor" },
];

/** The mark: three stacked rules in the triage colours, shortest at the bottom —
 *  the autonomy the system keeps as risk rises. The logo is the thesis. */
export function Mark() {
  return (
    <span
      className="flex flex-col justify-between w-[18px] h-[15px] shrink-0"
      aria-hidden
    >
      <span className="h-[3px] w-full bg-t1" />
      <span className="h-[3px] w-[62%] bg-t2" />
      <span className="h-[3px] w-[24%] bg-t3" />
    </span>
  );
}

/** Where the project is from, not where the reader is.
 *
 *  Hardcoded on purpose. Resolving the visitor's position would mean either a
 *  geolocation prompt or a third-party IP lookup, and a medical page that asks for
 *  your location before it asks for your symptoms spends trust it has not earned
 *  yet. This is an origin, the way Pil's header is pinned to their Milan office.
 *
 *  `zone` and `zoneLabel` travel with the city and must stay consistent with it:
 *  the clock beside the name claims to be that city's time, so it is pinned rather
 *  than read off the reader's machine. The label is spelled out rather than derived
 *  from Intl, which returns "GMT+5:30" for this zone on most engines. */
const ORIGIN = {
  city: "Kolkata",
  country: "IN",
  zone: "Asia/Kolkata",
  zoneLabel: "IST",
};

/**
 * The instrument cluster.
 *
 * Pil put a Milan clock and the local weather in their header, and the reason it
 * works has nothing to do with weather: a readout that changes while you watch makes
 * the page read as equipment that is running rather than a document that was
 * published. Weather itself does not survive the move — this pipeline does not
 * ingest it, and a live readout the system never reads would be decoration dressed
 * as instrumentation, on the one product whose whole argument is that the two are
 * different. A place and its clock are simply true.
 */
function Instrument() {
  const [time, setTime] = useState<string | null>(null);

  // Client-only. The value changes every second, so anything rendered on the server
  // is already stale by the time it hydrates.
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-GB", {
          hour12: false,
          timeZone: ORIGIN.zone,
        })
      );
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    // Not `.label`. That class is declared outside any cascade layer while Tailwind's
    // utilities live inside `@layer utilities`, and unlayered rules beat layered ones
    // — so `.label`'s `color: var(--muted)` and `font-size: 10px` silently won over
    // every utility set against them. `.data` only sets the family and tabular
    // figures, so size, weight and colour are actually ours to set here.
    //
    // 600 is deliberate, not a guess: Iosevka is self-hosted at 400/500/600 only, and
    // asking for 700 would get a synthesised bold, which smears a monospace.
    <div className="hidden md:flex items-center gap-5 data text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground">
      <span>
        {ORIGIN.city} <span className="text-muted">·</span> {ORIGIN.country}
      </span>

      {/* An invisible placeholder holds the column width so a value that changes
          every second never nudges what sits beside it. */}
      <span
        className="inline-grid"
        aria-label={`Current time in ${ORIGIN.city}`}
      >
        <span className="invisible col-start-1 row-start-1 select-none" aria-hidden>
          00:00:00
        </span>
        <span className="data col-start-1 row-start-1">{time ?? ""}</span>
      </span>

      <span>{ORIGIN.zoneLabel}</span>
    </div>
  );
}

/**
 * The header: one ruled strip, everywhere.
 *
 * The links live behind a menu rather than across the bar. It keeps the strip
 * quiet enough to sit above the landing page's pinned composition, and gives
 * every other page the same compact, navigable header. The mark stands alone on
 * the left — each page sets its own wordmark in its lockup, so carrying one here
 * too would read as a repeat.
 */
export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);

  const close = () => {
    setShown(false);
    window.setTimeout(() => setOpen(false), 320);
  };

  const openMenu = () => {
    setOpen(true);
    // Mount at translate-x-full, then flip on the next frame so the transition has
    // two states to move between. Setting both at once would just render it open.
    window.requestAnimationFrame(() => setShown(true));
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full h-14 bg-background border-b border-border">
        <div className="h-full px-5 sm:px-8 flex items-center justify-between gap-6">
          <Link
            href="/"
            className="flex items-center shrink-0"
            aria-label="MedTriage — overview"
          >
            <Mark />
          </Link>

          <div className="flex items-center gap-5 sm:gap-6">
            <Instrument />
            <ThemeToggle />
            <button
              onClick={openMenu}
              className="inline-flex items-center gap-2 data text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground hover:opacity-70 transition-opacity"
              aria-label="Open navigation menu"
              aria-expanded={open}
            >
              <Menu className="w-4 h-4" />
              <span className="hidden sm:inline">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div
          // Same stock as the page, not an inverted panel. An ink flood would put
          // the one full-bleed dark surface in the product behind a menu, which is
          // the least important thing in it — and it reads as a mode change rather
          // than as a layer. The shadow and the left rule do the separating instead.
          className={`fixed inset-0 z-60 bg-background text-foreground border-l border-border shadow-[var(--shadow-2)] transition-transform duration-[320ms] ease-[cubic-bezier(.22,.9,.26,1)] ${
            shown ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <div className="h-14 px-5 sm:px-8 flex items-center justify-end border-b border-border">
            <button
              onClick={close}
              className="inline-flex items-center gap-2 data text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground hover:opacity-70 transition-opacity"
              aria-label="Close navigation menu"
            >
              <span className="hidden sm:inline">Close</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="px-5 sm:px-8 pt-[7vh]">
            <ul className="flex flex-col gap-3 sm:gap-4">
              {NAV_LINKS.map((item) => {
                const active = pathname === item.link;
                return (
                  <li key={item.link}>
                    <Link
                      href={item.link}
                      onClick={close}
                      aria-current={active ? "page" : undefined}
                      className={`display text-[2.4rem] sm:text-[3.6rem] lg:text-[4.4rem] inline-block transition-opacity hover:opacity-60 ${
                        active
                          ? "underline decoration-2 underline-offset-[0.18em]"
                          : ""
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Account actions sit below a rule, at body scale. They are errands,
                not destinations — setting them in the same display type as the
                sections above would claim they matter equally. */}
            <div className="mt-[7vh] pt-7 border-t border-border">
              <p className="label mb-4">Account</p>
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href="/login"
                  onClick={close}
                  className="inline-flex items-center h-11 px-6 rounded-full border border-border bg-card text-[14px] text-muted hover:text-foreground hover:border-foreground transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={close}
                  className="inline-flex items-center h-11 px-6 rounded-full bg-accent text-on-accent text-[14px] font-medium hover:opacity-85 transition-opacity"
                >
                  Sign up
                </Link>
                <Link
                  href="/profile"
                  onClick={close}
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-full border border-border bg-card text-[14px] text-muted hover:text-foreground hover:border-foreground transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
