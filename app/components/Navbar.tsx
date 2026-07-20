"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  { name: "Overview", link: "/" },
  { name: "How it works", link: "/about" },
  { name: "Consult", link: "/chat" },
  { name: "Review queue", link: "/doctor" },
];

/** The mark: three stacked rules in the triage colours, shortest at the bottom —
 *  the autonomy the system keeps as risk rises. The logo is the thesis. */
function Mark() {
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

export function Navbar({ alwaysVisible }: { alwaysVisible?: boolean } = {}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className={`w-full bg-background border-b border-border ${
        alwaysVisible ? "" : "sticky top-0 z-40"
      }`}
    >
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
        <div className="h-14 flex items-center justify-between gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 group"
            aria-label="MedTriage — overview"
          >
            <Mark />
            <span className="data text-[13px] font-semibold tracking-[0.16em] uppercase">
              MedTriage
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((item) => {
              const active = pathname === item.link;
              return (
                <Link
                  key={item.link}
                  href={item.link}
                  aria-current={active ? "page" : undefined}
                  className={`relative text-[13px] py-4 transition-colors ${
                    active
                      ? "text-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {item.name}
                  {active && (
                    <span className="absolute left-0 right-0 -bottom-px h-px bg-foreground" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center h-8 px-3 text-[13px] text-muted hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="hidden sm:inline-flex items-center h-8 px-3.5 bg-accent text-on-accent text-[13px] font-medium hover:opacity-85 transition-opacity"
            >
              Sign up
            </Link>
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 text-muted hover:text-foreground"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="max-w-[1180px] mx-auto px-5 py-3 flex flex-col">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.link}
                href={item.link}
                onClick={() => setMobileOpen(false)}
                className={`py-2.5 text-sm ${
                  pathname === item.link
                    ? "text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex gap-2 pt-3 mt-2 border-t border-border">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 h-9 inline-flex items-center justify-center border border-border text-[13px] text-muted"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="flex-1 h-9 inline-flex items-center justify-center bg-accent text-on-accent text-[13px] font-medium"
              >
                Sign up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
