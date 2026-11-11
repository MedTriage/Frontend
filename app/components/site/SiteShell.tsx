"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import "../../site.css";
import { useStillness } from "../../lib/useStillness";
import type { Account } from "@/lib/account";
import { ThemeToggle } from "../ThemeToggle";
import { Moon } from "./Moon";
import { Arrow, Btn, EASE, LEVEL_HEX, Lines, Logo, Rise, Roll } from "./ui";

const LINKS = [
  { name: "Overview", href: "/" },
  { name: "How it works", href: "/about" },
  { name: "Consult", href: "/chat" },
  { name: "Drug mode", href: "/drugs" },
  { name: "Child health", href: "/child" },
  { name: "Review queue", href: "/doctor" },
];

/* The three ways to ask, for the header's dropdown. Each has a small moon for a glyph,
   drawn in the same language as the logo: triage is the three phases side by side, drug
   mode is the half it never gets past, child health is a small moon inside a larger
   orbit. */
const MODES = [
  {
    name: "Triage",
    href: "/chat",
    line: "Describe what is wrong. Get an answer, and the level it was released at.",
    glyph: (
      <>
        <circle cx="5" cy="14" r="3.6" fill="currentColor" />
        <circle cx="14" cy="14" r="3.1" stroke="currentColor" strokeWidth="1" />
        <path d="M14 10.4a3.6 3.6 0 0 1 0 7.2Z" fill="currentColor" />
        <circle cx="23" cy="14" r="3.1" stroke="currentColor" strokeWidth="1" />
      </>
    ),
  },
  {
    name: "Drug mode",
    href: "/drugs",
    line: "Ask about a medicine. Anything that names a dose is signed by a doctor.",
    glyph: (
      <>
        <circle cx="14" cy="14" r="9.4" stroke="currentColor" strokeWidth="1.2" />
        <path d="M14 4a10 10 0 0 1 0 20Z" fill="currentColor" />
      </>
    ),
  },
  {
    name: "Child health",
    href: "/child",
    line: "Questions about a child, answered from WHO and IMNCI guidance.",
    glyph: (
      <>
        <circle cx="14" cy="14" r="9.4" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.2 2.6" />
        <circle cx="14" cy="14" r="4" fill="currentColor" />
      </>
    ),
  },
];

/* ── The header ──
 *
 * No bar behind it: the page's fields run to the top edge and the header sits on them. So
 * it has to know what it is over. Every section declares `data-field="dark" | "light"`,
 * and on scroll the header takes the tone of whichever one is under its own midline. It
 * leaves on the way down and returns on the way up.
 *
 * It is also the header of every app page (`Navbar.tsx` renders it with `bare`). There it
 * sits in the flow, takes the page's own theme instead of reading fields, carries the
 * theme toggle, and shows the signed-in account's links.
 */
export function Nav({ bare = false }: { bare?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [tone, setTone] = useState<"dark" | "light">("dark");
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [modes, setModes] = useState(false);
  // undefined while unknown, null when signed out. Only ever used to choose which links
  // to show; the backend decides access.
  const [me, setMe] = useState<Account | null | undefined>(undefined);
  const { scrollYProgress } = useScroll();
  const last = useRef(0);

  useEffect(() => {
    let live = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => live && setMe(j))
      .catch(() => live && setMe(null));
    return () => {
      live = false;
    };
  }, [pathname]);

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setMe(null);
    setOpen(false);
    router.replace("/login");
  };

  useEffect(() => {
    // On an app page the header sits in the page's own theme and stays put.
    if (bare) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const y = window.scrollY;
      setHidden(y > last.current && y > 500);
      last.current = y;
      const under = document
        .elementsFromPoint(window.innerWidth / 2, 36)
        .map((el) => el.closest<HTMLElement>("[data-field]"))
        .find(Boolean);
      if (under) setTone(under.dataset.field === "light" ? "light" : "dark");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname, bare]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const doctor = me?.role === "doctor";
  const account = me
    ? [doctor ? { name: "Review queue", href: "/doctor" } : { name: "Dashboard", href: "/dashboard" }]
    : me === null
      ? [{ name: "Log in", href: "/login" }]
      : [];
  const cta = doctor ? { name: "Review queue", href: "/doctor" } : { name: "Start a consultation", href: "/chat" };

  return (
    <>
      {!bare && <motion.div className="nav-progress" style={{ scaleX: scrollYProgress }} aria-hidden />}
      <header className="nav" data-tone={bare ? undefined : tone} data-hidden={!bare && hidden && !open}>
        <Link href="/" aria-label="MedTriage, overview">
          <Logo />
        </Link>
        <nav className="nav-links" aria-label="Main">
          {LINKS.slice(0, 2).map((l) => (
            <Link key={l.href} href={l.href} aria-current={pathname === l.href ? "page" : undefined}>
              <Roll>{l.name}</Roll>
            </Link>
          ))}

          {/* The modes. Opens on hover for a mouse and on press for touch and keyboard;
              the popover's own top padding bridges the gap to the button, so the pointer
              never leaves the group on the way down. */}
          <div
            className="nav-modes"
            onPointerEnter={(e) => e.pointerType === "mouse" && setModes(true)}
            onPointerLeave={(e) => e.pointerType === "mouse" && setModes(false)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setModes(false);
            }}
            onKeyDown={(e) => e.key === "Escape" && setModes(false)}
          >
            <button
              className="nav-modes-btn"
              aria-expanded={modes}
              aria-controls="modes-panel"
              onClick={(e) =>
                // A mouse has already opened it by hovering, so its click must not close it.
                setModes((v) => ((e.nativeEvent as PointerEvent).pointerType === "mouse" ? true : !v))
              }
            >
              <Roll>Modes</Roll>
              <svg viewBox="0 0 10 10" fill="none" aria-hidden>
                <path d="M2 3.6 5 6.6l3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <AnimatePresence>
              {modes && (
                <motion.div
                  className="modes-pop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.16 } }}
                >
                  <motion.div
                    id="modes-panel"
                    className="modes-panel"
                    initial={{ y: -12, scale: 0.96 }}
                    animate={{ y: 0, scale: 1 }}
                    transition={{ duration: 0.45, ease: EASE }}
                  >
                    {MODES.map((m, i) => (
                      <motion.div
                        key={m.href}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: EASE, delay: 0.06 + i * 0.06 }}
                      >
                        <Link
                          href={m.href}
                          className="mode-row"
                          aria-current={pathname === m.href ? "page" : undefined}
                          onClick={() => setModes(false)}
                        >
                          <span className="mode-glyph">
                            <svg viewBox="0 0 28 28" fill="none" aria-hidden>
                              {m.glyph}
                            </svg>
                          </span>
                          <span>
                            <span className="mode-name">{m.name}</span>
                            <span className="mode-line">{m.line}</span>
                          </span>
                          <span className="mode-go" aria-hidden>
                            <Arrow />
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {account
            .filter((l) => l.href !== cta.href)
            .map((l) => (
              <Link key={l.href} href={l.href} aria-current={pathname === l.href ? "page" : undefined}>
                <Roll>{l.name}</Roll>
              </Link>
            ))}
          {me && (
            <button onClick={signOut}>
              <Roll>Sign out</Roll>
            </button>
          )}
          {bare && <ThemeToggle />}
          <Link href={cta.href} className="nav-cta">
            <Roll>{cta.name}</Roll>
          </Link>
        </nav>
        <span className="nav-small">
          {bare && <ThemeToggle />}
          <button
            className="nav-burger"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-label="Open the menu"
          >
            Menu
          </button>
        </span>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="menu-top">
              <Link href="/" onClick={() => setOpen(false)} aria-label="MedTriage, overview">
                <Logo />
              </Link>
              <button className="mono" onClick={() => setOpen(false)} autoFocus>
                Close
              </button>
            </div>
            <ul className="menu-links">
              {LINKS.map((l, i) => (
                <li key={l.href} className="ln">
                  <motion.span
                    initial={{ y: "108%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.07 }}
                  >
                    <Link href={l.href} onClick={() => setOpen(false)}>
                      {l.name}
                    </Link>
                  </motion.span>
                </li>
              ))}
            </ul>
            <div className="menu-foot">
              {me ? (
                <>
                  {!doctor && (
                    <>
                      <Link href="/dashboard" onClick={() => setOpen(false)}>
                        Dashboard
                      </Link>
                      <Link href="/profile" onClick={() => setOpen(false)}>
                        Profile
                      </Link>
                    </>
                  )}
                  <button onClick={signOut}>Sign out</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Log in
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)}>
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── The close ──
 *
 * The moon again, and this time the reader holds it: moving the pointer across the
 * section runs the phase from full to new, the same sweep the scale section performs on
 * scroll. With no pointer (touch, keyboard) it rests at the half, which is a real level
 * and not a pose.
 */
function Close() {
  const still = useStillness();
  const target = useMotionValue(0);
  const phase = useSpring(target, { stiffness: 70, damping: 20 });
  const color = useTransform(phase, [-1, 0, 1], [LEVEL_HEX[2], LEVEL_HEX[1], LEVEL_HEX[0]]);

  return (
    <section
      className="close f-ink"
      data-field="dark"
      onPointerMove={(e) => {
        if (still || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        target.set(1 - 2 * Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
      }}
      onPointerLeave={() => target.set(0)}
    >
      <Lines as="h2" className="h1" lines={["Ask it something."]} />
      <Rise delay={0.15}>
        <p className="lede dim">
          You get an answer, the level it was released at, and the rule that decided it. If it
          needs a doctor, it says so and waits for one.
        </p>
      </Rise>
      <Rise delay={0.25}>
        <Btn href="/chat">Start a consultation</Btn>
      </Rise>
      <Moon phase={phase} color={color} glow className="close-moon" />
    </section>
  );
}

/** Where the project is from, and its clock. Pinned to the origin rather than read off
 *  the reader's machine: resolving a visitor's place means a geolocation prompt, and a
 *  medical page that asks where you are before it asks what is wrong has it backwards. */
function Clock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-GB", { hour12: false, timeZone: "Asia/Kolkata" })
      );
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return <span aria-label="Current time in Kolkata">Kolkata {time} IST</span>;
}

/** `{reachable, waiting}` from `/api/status` and nothing else; that route is count-only
 *  on purpose, because this footer renders on a public page. */
function Status() {
  const [s, setS] = useState<{ reachable: boolean; waiting: number } | null>(null);
  useEffect(() => {
    let live = true;
    const read = () =>
      fetch("/api/status", { cache: "no-store" })
        .then((r) => r.json())
        .then((j) => live && setS(j))
        .catch(() => live && setS({ reachable: false, waiting: 0 }));
    read();
    const id = window.setInterval(read, 30_000);
    return () => {
      live = false;
      window.clearInterval(id);
    };
  }, []);
  if (!s) return <span>&nbsp;</span>;
  return (
    <span>
      <i className="dot" style={{ ["--c" as string]: s.reachable ? "var(--go)" : "var(--stop)" }} />
      {s.reachable
        ? `Triage service reachable, ${s.waiting} waiting on a doctor`
        : "Triage service unreachable"}
    </span>
  );
}

function Footer() {
  return (
    <footer className="foot f-ink" data-field="dark">
      <div className="foot-top">
        <p className="said">The more it matters, the less the AI decides.</p>
        <div className="foot-col">
          <span className="k">Site</span>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              <Roll>{l.name}</Roll>
            </Link>
          ))}
        </div>
        <div className="foot-col">
          <span className="k">Account</span>
          <Link href="/login">
            <Roll>Log in</Roll>
          </Link>
          <Link href="/signup">
            <Roll>Sign up</Roll>
          </Link>
          <Link href="/dashboard">
            <Roll>Dashboard</Roll>
          </Link>
        </div>
        <div className="foot-col">
          <span className="k">Read</span>
          <Link href="/about#rules">
            <Roll>The eight rules</Roll>
          </Link>
          <Link href="/about#fails">
            <Roll>How it fails</Roll>
          </Link>
          <Link href="/about#limits">
            <Roll>What it cannot do</Roll>
          </Link>
        </div>
      </div>

      <span className="foot-word" aria-hidden>
        {"MedTriage".split("").map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </span>

      <div className="foot-base">
        <Status />
        <Clock />
        <span>Not a diagnosis. In an emergency, call your local emergency number.</span>
      </div>
    </footer>
  );
}

/* ── The shell for `/` and `/about` ──
 *
 * Carries the `.site` scope (its tokens and type), the header, the close and the footer,
 * and runs Lenis. Lenis drives the real scroll position, so `position: sticky`, anchors
 * and Motion's `useScroll` all keep working; it is skipped entirely under reduced motion.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  const still = useStillness();

  useEffect(() => {
    if (still) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.1, anchors: true });
    return () => lenis.destroy();
  }, [still]);

  return (
    // `reducedMotion="user"`: for a reader who asked for less motion, Motion drops every
    // transform and keeps the opacity change, so nothing travels and nothing is left
    // hidden. That is why no component here branches its `initial` on the preference;
    // doing so breaks on hydration, where the server has already rendered the hidden
    // starting state and React will not patch it.
    <MotionConfig reducedMotion="user">
      <div className="site">
        <Nav />
        <main>{children}</main>
        <Close />
        <Footer />
      </div>
    </MotionConfig>
  );
}
