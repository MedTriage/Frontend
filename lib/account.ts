"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type Role = "patient" | "doctor";

export interface Account {
  id: string;
  email: string;
  name: string;
  role: Role;
  verified: boolean;
}

/** The backend's error as one readable sentence. FastAPI sends either a string or, for
 *  validation failures, a list of {msg} objects. */
export function errorMessage(body: unknown, fallback: string): string {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const msg = String((detail[0] as { msg?: string }).msg ?? "");
    const cleaned = msg.replace(/^Value error,\s*/i, "");
    if (cleaned) return cleaned.charAt(0).toUpperCase() + cleaned.slice(1) + ".";
  }
  return fallback;
}

export async function postJson(url: string, body?: unknown): Promise<{ ok: boolean; status: number; data: unknown }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

export function homeFor(role: Role): string {
  return role === "doctor" ? "/doctor" : "/chat";
}

/** The signed-in account, or null while loading. Signed-out visitors are sent to the
 *  login page and brought back afterwards; the wrong role is sent to its own home.
 *  The backend enforces the same rules — this only keeps people on pages that work. */
export function useAccount(required?: Role): Account | null {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    let cancelled = false;

    // A visitor who has already clicked a link to another page has chosen where to go.
    // Without this, a slow answer from /api/me could land while that navigation was
    // still in flight (this page not yet unmounted, so `cancelled` still false) and
    // queue a redirect to the login page behind it: you arrived at the page you asked
    // for and were then pulled away to log in. Modified clicks and new-tab links do not
    // leave this page, so they do not count.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.origin !== window.location.origin) return;
      if (a.pathname !== window.location.pathname) cancelled = true;
    };
    document.addEventListener("click", onClick);

    fetch("/api/me", { cache: "no-store" })
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 401) {
          const here = window.location.pathname + window.location.search;
          router.replace(`/login?next=${encodeURIComponent(here)}`);
          return;
        }
        const me = (await res.json()) as Account;
        if (required && me.role !== required) {
          router.replace(homeFor(me.role));
          return;
        }
        setAccount(me);
      })
      .catch(() => {
        // The service is down; leave the page in its loading state rather than
        // pretending the visitor is signed out.
      });
    return () => {
      cancelled = true;
      document.removeEventListener("click", onClick);
    };
  }, [required, router]);

  return account;
}
