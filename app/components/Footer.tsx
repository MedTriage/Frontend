"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Github, Linkedin } from "lucide-react";

const BACKEND_URL = "http://127.0.0.1:8000";
const POLL_INTERVAL = 30_000;

const FOOTER_COLUMNS = [
  {
    title: "Navigate",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Console", href: "/chat" },
    ],
  },
  {
    title: "Triage Levels",
    links: [
      { label: "Level 1 — Direct", href: "/about" },
      { label: "Level 2 — Verified", href: "/about" },
      { label: "Level 3 — Emergency", href: "/about" },
    ],
  },
  {
    title: "Agents",
    links: [
      { label: "Companion", href: "/about" },
      { label: "Intake", href: "/about" },
      { label: "Research", href: "/about" },
      { label: "Prescription", href: "/about" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/about" },
      { label: "Privacy", href: "/about" },
      { label: "Terms", href: "/about" },
      { label: "Feedback", href: "/about" },
    ],
  },
];

export function Footer() {
  const [apiStatus, setApiStatus] = useState<"online" | "offline" | "checking">(
    "checking"
  );

  useEffect(() => {
    let mounted = true;

    const checkApi = async () => {
      try {
        const res = await fetch(BACKEND_URL, {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        });
        if (mounted) setApiStatus(res.ok ? "online" : "offline");
      } catch {
        if (mounted) setApiStatus("offline");
      }
    };

    checkApi();
    const interval = setInterval(checkApi, POLL_INTERVAL);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <footer className="bg-footer-bg border-t border-border/50">
      {/* ── Top section ── */}
      <div className="max-w-6xl mx-auto px-8 pt-14 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          {/* Brand column — spans 2 cols */}
          <div className="col-span-2 space-y-4 pr-6">
            <Link href="/" className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-accent" />
              <span className="font-mono text-sm tracking-wider uppercase text-foreground">
                MedTriage
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              AI&#8209;assisted clinical triage with graduated autonomy. For
              informational purposes only&nbsp;— not a substitute for
              professional medical advice.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className="space-y-4">
              <h4 className="font-mono text-xs font-medium tracking-wider uppercase text-foreground">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-border/40">
        <div className="max-w-6xl mx-auto px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <span className="font-mono text-[11px] text-muted/50">
            © {new Date().getFullYear()} ~/MedTriage. Graduated Autonomy
            Architecture.
          </span>

          {/* Right side — API Badge + Socials */}
          <div className="flex items-center gap-5">
            {/* API Status Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-background/60">
              <span
                className={`w-2 h-2 rounded-full ${
                  apiStatus === "online"
                    ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"
                    : apiStatus === "offline"
                      ? "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"
                      : "bg-amber-400 animate-pulse"
                }`}
              />
              <span className="font-mono text-[11px] text-muted/70">
                {apiStatus === "online"
                  ? "API Online"
                  : apiStatus === "offline"
                    ? "API Offline"
                    : "Checking…"}
              </span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted/40 hover:text-muted transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted/40 hover:text-muted transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
