/*
  The one shape both triage routes hand the chat page. Triage turns keep the rule that a
  missing Guardian level fails safe to 2; child-health turns have no level at all, by
  design, and must not be pushed into one.
*/
import { test } from "node:test";
import assert from "node:assert/strict";
import { clientPayload } from "../app/lib/triage-payload.ts";

const TRIAGE = {
  conversation_id: "c1",
  message_id: 7,
  title: "Sore throat",
  orchestrator_response: "Rest and drink fluids.",
  guardian_output: { triage_level: "level_3" },
  explanation: { outcome: {} },
  followup: null,
};

test("a triage turn takes its level from the Guardian", () => {
  assert.equal(clientPayload(TRIAGE).triage_level, 3);
});

test("a triage turn with no Guardian level fails safe to 2", () => {
  assert.equal(clientPayload({ ...TRIAGE, guardian_output: null }).triage_level, 2);
});

test("a child-health turn has no level and carries its answer and signs", () => {
  const child = { override: null, guidelines: "Give fluids [1].", general: "", possible_causes: [],
                  sources: [], watch_for: ["Your child becomes sicker"], clarification: false };

  const out = clientPayload({ mode: "child", conversation_id: "c2", message_id: 9, title: "Diarrhoea",
                              response: "Give fluids [1].", child, triage_level: null });

  assert.equal(out.mode, "child");
  assert.equal(out.triage_level, null);
  assert.equal(out.response, "Give fluids [1].");
  assert.deepEqual(out.child, child);
  assert.equal(out.followup, null);
});
