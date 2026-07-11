import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

// Without this, a serverless deploy caps the handler well below the client's 300s
// patience and kills the request mid-pipeline. Ignored by `next dev`/`next start`,
// which have no such limit.
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversation_id, text, chat_history } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing required field: text" },
        { status: 400 }
      );
    }

    // The backend keys the Scribe's persistent medical record on this, and validates
    // it against ^[A-Za-z0-9_-]{1,64}$ because it becomes a filename.
    if (!conversation_id || typeof conversation_id !== "string") {
      return NextResponse.json(
        { error: "Missing required field: conversation_id" },
        { status: 400 }
      );
    }

    // Call the FastAPI backend
    const backendResponse = await fetch(`${BACKEND_URL}/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        conversation_id,
        text,
        chat_history: chat_history || [],
      }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error("Backend error:", backendResponse.status, errorText);
      return NextResponse.json(
        { error: "Backend service unavailable", details: errorText },
        { status: 502 }
      );
    }

    const data = await backendResponse.json();

    // Triage level comes from the Guardian, which is the only component allowed to
    // assign it — it applies deterministic hard rules (emergency, escalation, safety
    // risk, prescription/diagnostic floors) that the LLM cannot downgrade. Never
    // re-derive the level here: a client-side guess could contradict the Guardian and
    // show a patient a response the backend locked.
    const guardianLevel = data.guardian_output?.triage_level;
    const triageLevel = guardianLevel
      ? (parseInt(guardianLevel.replace("level_", ""), 10) as 1 | 2 | 3)
      : 2; // Guardian output missing => fail safe to physician review, never level 1.

    return NextResponse.json({
      title: data.title,
      user_input: data.user_input,
      intent_type: data.intent_type,
      intent_confidence: data.intent_confidence,
      // All three retrieval branches are forwarded, not just the vector one. The
      // point the product is making — that independent sources were consulted and
      // may have disagreed — cannot be shown if only one of them reaches the client.
      rag_output: data.rag_output || null,
      kgrag_output: data.kgrag_output || null,
      mcp_output: data.mcp_output || null,
      orchestrator_output: data.orchestrator_output || null,
      orchestrator_decision: data.orchestrator_decision || null,
      orchestrator_response: data.orchestrator_response || null,
      guardian_output: data.guardian_output || null,
      is_emergency: data.is_emergency ?? false,
      triage_level: triageLevel,
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
