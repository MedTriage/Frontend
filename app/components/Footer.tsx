"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Github, Linkedin, ArrowRight } from "lucide-react";

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

/**
 * The sphere.
 *
 * Anchored, not raised. The wrapper is pushed 70% of its own height below the
 * footer's bottom edge and clipped there, so what shows is a shallow cap — a
 * horizon the page sits on — rather than a ball floating in the panel. That ratio
 * is the whole difference between the two readings: at 70% the visible arc is
 * about three tenths of the width and the curvature stays gentle; raise it and the
 * sides come into view and it becomes an object.
 *
 * A rosette of six identical flat ellipses at 30° increments, not latitudes and
 * longitudes. That is rig's construction, and the reason is geometric rather than
 * aesthetic: a rosette is symmetric under rotation about its own centre, so
 * spinning it in the plane of the screen stays coherent. Real latitude rings would
 * have to hold horizontal while the longitudes swept, which one `rotate()` cannot
 * do and which needs a projection to fake.
 *
 * Everything turns together — body, glow and wireframe — exactly as rig does it.
 */
function Sphere() {
  const RINGS = [0, 30, 60, 90, 120, 150];

  return (
    <div
      aria-hidden
      className="globe-turn pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[-70%] w-[min(940px,150vw)] aspect-square rounded-full"
      style={{
        // The two shadows are the effect. The outer one is the atmosphere bleeding
        // emerald up into the slab — 100px blur on a 60px spread, so it reaches far
        // past the limb. The inner one is the lit rim: a huge inset spread washes
        // the inside edge pale, which is what gives a flat gradient its sphericity.
        backgroundImage:
          "linear-gradient(126deg, var(--globe-tint) 10%, var(--globe-deep))",
        boxShadow:
          "0 6px 100px 60px var(--globe-halo), inset 0 6px 80px 60px var(--globe-atmo)",
      }}
    >
      {/* `lighten` so the rings only ever brighten what is under them: they read
          across the pale rim and the dark limb without needing two colours. */}
      <svg
        viewBox="0 0 800 800"
        className="absolute inset-0 w-full h-full opacity-60 mix-blend-lighten"
        fill="none"
      >
        {RINGS.map((deg, i) => (
          <ellipse
            key={deg}
            cx={400}
            cy={400}
            rx={372}
            ry={112}
            transform={`rotate(${deg} 400 400)`}
            stroke="var(--globe-line)"
            strokeWidth={1}
            className="globe-ring"
            // Staggered so the rings breathe out of phase; in step they pulse as
            // one object and the sphere flattens into a single blinking shape.
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </svg>
    </div>
  );
}

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
    <footer className="footer-dark relative isolate overflow-hidden bg-footer-bg">
      <Sphere />

      {/* Tall enough that the sphere has room to rise into the gap the content
          leaves — that gap is the device. rig runs min(101svh, 1000px) with the
          links pinned top and the legal row bottom; same rhythm here. */}
      <div className="relative z-10 flex flex-col justify-between min-h-[min(101svh,1000px)] pt-24 pb-8">
        <div className="w-full max-w-[1180px] mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16">
            <div>
              <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
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

              <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-8">
                {COLUMNS.map((col) => (
                  <div key={col.title}>
                    {/* Not `.label` — it sets its own colour from an unlayered
                        rule, so a utility override loses the cascade to it. */}
                    <h4 className="data text-[10px] uppercase tracking-[0.14em] text-muted mb-4">
                      {col.title}
                    </h4>
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

            <div className="lg:justify-self-end lg:text-right w-full lg:max-w-[26rem]">
              <p className="data text-[10px] uppercase tracking-[0.14em] text-muted mb-4">
                Start here
              </p>
              <p className="display-sm text-[1.75rem] sm:text-[2.1rem] text-foreground">
                Describe what you&rsquo;re feeling. Get a level, and the reasoning
                behind it.
              </p>
              <div className="mt-8 flex lg:justify-end">
                <Link
                  href="/chat"
                  className="group data text-[11px] uppercase tracking-[0.08em] font-semibold inline-flex items-center gap-2.5 h-11 px-6 rounded-full bg-accent text-on-accent hover:opacity-90 transition-opacity"
                >
                  Begin a consultation
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Transparent, and sitting over the sphere — which is only legible
            because the slab is dark and the cap is dark at its crown, so light
            text clears both. On the old light footer this row had to be opaque. */}
        <div>
          <div className="max-w-[1180px] mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
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
      </div>
    </footer>
  );
}
