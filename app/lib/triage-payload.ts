/*
  The one shape both triage routes (/api/triage and the stream's `done` event) hand the
  chat page, built from what the backend returned.
*/

type Data = Record<string, unknown>;

export function clientPayload(data: Data): Data {
  // Child-health mode answers questions from IMNCI/WHO documents and does no triage, so
  // its turns have no level by design. Only the backend's own `mode: "child"` exempts a
  // turn from the fail-safe below. Its patient-facing text is `response`, composed by the
  // backend with any "go to hospital now" banner first, and `child` (sources, signs).
  if (data.mode === "child") {
    return {
      mode: "child",
      conversation_id: data.conversation_id,
      message_id: data.message_id,
      title: data.title,
      response: data.response ?? "",
      child: data.child ?? null,
      triage_level: null,
      followup: null,
    };
  }

  // Triage level comes from the Guardian, which is the only component allowed to
  // assign it — it applies deterministic hard rules (emergency, escalation, safety
  // risk, diagnostic floors) that the LLM cannot downgrade. Never re-derive the level
  // here: a client-side guess could contradict the Guardian and show a patient a
  // response the backend locked.
  const guardian = data.guardian_output as { triage_level?: string } | null | undefined;
  const guardianLevel = guardian?.triage_level;
  const triageLevel = guardianLevel
    ? (parseInt(String(guardianLevel).replace("level_", ""), 10) as 1 | 2 | 3)
    : 2; // Guardian output missing => fail safe to physician review, never level 1.

  return {
    mode: "triage",
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
    // The follow-up episode this answer opened, if any: the "come back if" signs and when
    // the first check-in is due.
    followup: data.followup || null,
  };
}
