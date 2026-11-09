import { NextRequest, NextResponse } from "next/server";
import { proxy, readJson } from "@/lib/backend";
import { clientPayload } from "@/app/lib/triage-payload";

// Without this, a serverless deploy caps the handler well below the client's 300s
// patience and kills the request mid-pipeline. Ignored by `next dev`/`next start`,
// which have no such limit.
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const body = (await readJson(request)) as
    | { conversation_id?: unknown; text?: unknown; mode?: unknown }
    | undefined;

  if (!body?.text || typeof body.text !== "string") {
    return NextResponse.json({ detail: "Missing required field: text" }, { status: 400 });
  }
  // The server issues conversation ids. A first turn sends none; later turns send back
  // the id the server returned. The history the model sees is the server's own — the
  // client no longer sends one.
  const conversation_id = typeof body.conversation_id === "string" ? body.conversation_id : undefined;
  // Only read by the backend for a new conversation; an existing one keeps its own mode.
  const mode = body.mode === "child" ? "child" : "triage";

  const upstream = await proxy(request, "/process", { body: { text: body.text, conversation_id, mode } });
  // Refusals (signed out, unverified, locked, busy, over the limit) pass through with
  // their status and the backend's own wording.
  if (!upstream.ok) return upstream;

  return NextResponse.json(clientPayload(await upstream.json()));
}
