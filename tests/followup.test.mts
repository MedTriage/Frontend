import test from "node:test";
import assert from "node:assert/strict";
import { COMPLAINTS, outcome } from "../app/lib/followup.ts";

// The About page's follow-up demo mirrors the backend's check-in rules. These pin the
// mirror, so an edit to the page's copy cannot quietly change what it claims happens.

test("better resolves, with no level", () => {
  const o = outcome("better", [3, 7], 0);
  assert.equal(o.level, null);
  assert.equal(o.next, null);
});

test("same carries on until the last check-in, then reaches a doctor", () => {
  assert.deepEqual([outcome("same", [3, 7], 0).next, outcome("same", [3, 7], 0).level], [7, null]);
  assert.deepEqual([outcome("same", [3, 7], 1).next, outcome("same", [3, 7], 1).level], [null, 2]);
  // A one-check-in schedule has no "carry on".
  assert.equal(outcome("same", [21], 0).level, 2);
});

test("worse is floored at level 2 and an urgent sign is level 3", () => {
  assert.equal(outcome("worse", [3, 7], 0).level, 2);
  assert.equal(outcome("sign", [3, 7], 0).level, 3);
});

test("silence never resolves and never carries a level", () => {
  const o = outcome("silent", [3, 7], 0);
  assert.equal(o.level, null);
  assert.notEqual(o.head, outcome("better", [3, 7], 0).head);
});

test("every schedule has check-in days in rising order", () => {
  for (const c of COMPLAINTS) {
    assert.ok(c.days.length > 0, c.label);
    assert.deepEqual([...c.days].sort((a, b) => a - b), [...c.days], c.label);
  }
});
