import { NextResponse } from "next/server";

// ─── Aggregate service status, for the header instrument strip ───
//
// Deliberately count-only. `/api/doctor/cases` returns whole cases — patient
// queries, and a `pipeline` block carrying orchestrator and guardian output — and
// the header renders on a public, unauthenticated page. So this route reads the
// same store but emits two numbers and a boolean. There is nothing here a reader
// could not already infer from the product's own promise: Level 2 waits on a human.

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function GET() {
  let reachable = false;
  try {
    const res = await fetch(`${BACKEND_URL}/`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    reachable = res.ok;
  } catch {
    reachable = false;
  }

  // Read the store structurally rather than importing the route module, so this
  // endpoint never pulls a case shape — or a case — into its own scope.
  const store =
    (globalThis as { __doctorCases?: { status: string }[] }).__doctorCases ?? [];
  const waiting = store.filter((c) => c.status === "pending").length;

  return NextResponse.json(
    { reachable, waiting },
    { headers: { "cache-control": "no-store" } }
  );
}
