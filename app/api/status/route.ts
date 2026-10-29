import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend";

// ─── Aggregate service status, for the header instrument strip ───
//
// Deliberately count-only. The header renders on a public, unauthenticated page, so
// this route emits one boolean and one number, and the backend's /status endpoint is
// built the same way. There is nothing here a reader could not already infer from the
// product's own promise: Level 2 waits on a human.

export async function GET() {
  let reachable = false;
  let waiting = 0;
  try {
    const res = await fetch(`${BACKEND_URL}/status`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    reachable = res.ok;
    if (res.ok) waiting = Number((await res.json()).waiting) || 0;
  } catch {
    reachable = false;
  }

  return NextResponse.json(
    { reachable, waiting },
    { headers: { "cache-control": "no-store" } }
  );
}
