import { NextRequest, NextResponse } from "next/server";
import { proxy, readJson } from "@/lib/backend";

const ACTIONS = new Set(["checkin", "postpone", "stop"]);

/** Answer a follow-up check-in, push it later, or stop check-ins. The backend decides
 *  what an answer leads to; this only forwards it. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  const { id, action } = await params;
  if (!ACTIONS.has(action)) {
    return NextResponse.json({ detail: "Not found." }, { status: 404 });
  }
  const body = action === "stop" ? undefined : await readJson(request);
  return proxy(request, `/followups/${encodeURIComponent(id)}/${action}`, { body });
}
