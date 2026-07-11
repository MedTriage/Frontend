"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Github, Linkedin } from "lucide-react";

const BACKEND_URL = "http://127.0.0.1:8000";
const POLL_INTERVAL = 30_000;

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "/" },
      { label: "How it works", href: "/about" },
      { label: "Consult", href: "/chat" },
      { label: "Review queue", href: "/doctor" },
    ],
  },
  {
    title: "The scale",
    links: [
      { label: "Level 1 — Direct", href: "/about" },
      { label: "Level 2 — Physician-verified", href: "/about" },
      { label: "Level 3 — Locked", href: "/about" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/about" },
      { label: "Terms", href: "/about" },
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
    <footer className="bg-footer-bg border-t border-border">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-[1.6fr_repeat(3,1fr)] gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <span
                className="flex flex-col justify-between w-[18px] h-[15px]"
                aria-hidden
              >
                <span className="h-[3px] w-full bg-t1" />
                <span className="h-[3px] w-[62%] bg-t2" />
                <span className="h-[3px] w-[24%] bg-t3" />
              </span>
              <span className="data text-[13px] font-semibold tracking-[0.16em] uppercase">
                MedTriage
              </span>
            </Link>
            <p className="text-[14px] text-muted leading-relaxed max-w-[38ch]">
              Clinical triage with graduated autonomy. This is a research system
              and it is not a substitute for professional medical advice. In an
              emergency, call your local emergency number.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="label mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[14px] text-muted hover:text-foreground transition-colors"
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

      <div className="border-t border-border">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="data text-[11px] text-muted">
            © {new Date().getFullYear()} MedTriage
          </span>

          <div className="flex items-center gap-6">
            {/* Achromatic on purpose: a service being down is an engineering fact,
                not a clinical one, and the triage palette is not spent on it. The
                square says something, the sentence says what. */}
            <div className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 ${
                  apiStatus === "online"
                    ? "bg-foreground"
                    : apiStatus === "offline"
                      ? "border border-muted"
                      : "bg-muted blink"
                }`}
              />
              <span className="data text-[11px] text-muted">
                {apiStatus === "online"
                  ? "Triage service online"
                  : apiStatus === "offline"
                    ? "Triage service unreachable"
                    : "Checking service"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-foreground transition-colors"
                aria-label="LinkedIn"
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
