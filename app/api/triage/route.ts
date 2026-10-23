import { NextRequest, NextResponse } from "next/server";
import { proxy, readJson } from "@/lib/backend";

// Without this, a serverless deploy caps the handler well below the client's 300s
// patience and kills the request mid-pipeline. Ignored by `next dev`/`next start`,
// which have no such limit.
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const body = (await readJson(request)) as { conversation_id?: unknown; text?: unknown } | undefined;

  if (!body?.text || typeof body.text !== "string") {
    return NextResponse.json({ detail: "Missing required field: text" }, { status: 400 });
  }
  // The server issues conversation ids. A first turn sends none; later turns send back
  // the id the server returned. The history the model sees is the server's own — the
  // client no longer sends one.
  const conversation_id = typeof body.conversation_id === "string" ? body.conversation_id : undefined;

  const upstream = await proxy(request, "/process", { body: { text: body.text, conversation_id } });
  // Refusals (signed out, unverified, locked, busy, over the limit) pass through with
  // their status and the backend's own wording.
  if (!upstream.ok) return upstream;

  const data = await upstream.json();

  // Triage level comes from the Guardian, which is the only component allowed to
  // assign it — it applies deterministic hard rules (emergency, escalation, safety
  // risk, diagnostic floors) that the LLM cannot downgrade. Never re-derive the level
  // here: a client-side guess could contradict the Guardian and show a patient a
  // response the backend locked.
  const guardianLevel = data.guardian_output?.triage_level;
  const triageLevel = guardianLevel
    ? (parseInt(guardianLevel.replace("level_", ""), 10) as 1 | 2 | 3)
    : 2; // Guardian output missing => fail safe to physician review, never level 1.

  return NextResponse.json({
    conversation_id: data.conversation_id,
    message_id: data.message_id,
    title: data.title,
    user_input: data.user_input,
    intent_type: data.intent_type,
    intent_confidence: data.intent_confidence,
    // All three evidence branches are forwarded, not just one. The point the product is
    // making — that independent sources were consulted and may have disagreed — cannot
    // be shown if only one of them reaches the client.
    parametric_output: data.parametric_output || null,
    kgrag_output: data.kgrag_output || null,
    mcp_output: data.mcp_output || null,
    orchestrator_output: data.orchestrator_output || null,
    orchestrator_decision: data.orchestrator_decision || null,
    orchestrator_response: data.orchestrator_response || null,
    guardian_output: data.guardian_output || null,
    is_emergency: data.is_emergency ?? false,
    triage_level: triageLevel,
    // The patient-facing explanation. Already sanitised server-side by explain.py — it
    // carries counts, bands and an outcome sentence, never a diagnosis, a source name,
    // or a raw belief value. Forwarded as-is; do not enrich it here from the branch
    // outputs above, which are doctor-facing only.
    explanation: data.explanation || null,
  });
}
