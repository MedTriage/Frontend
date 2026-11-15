import test from "node:test";
import assert from "node:assert/strict";
import { AGE_BANDS, DANGER_SIGNS, countingSigns } from "../app/lib/child.ts";

// The `/child` page's working model of the danger-sign check mirrors the backend's
// `counting_signs`. These pin the mirror: ten signs, four of them for young infants, and
// a young-infant sign counting only when the child is known to be under two months.

const keys = (band: Parameters<typeof countingSigns>[1], ...present: string[]) =>
  countingSigns(present, band).map((s) => s.key);

test("ten signs: six at any age, four for a young infant", () => {
  assert.equal(DANGER_SIGNS.length, 10);
  assert.equal(DANGER_SIGNS.filter((s) => s.youngInfantOnly).length, 4);
  assert.equal(new Set(DANGER_SIGNS.map((s) => s.key)).size, 10);
});

test("a general sign counts at every age, a stated one or not", () => {
  for (const { key } of AGE_BANDS) {
    assert.deepEqual(keys(key, "convulsions"), ["convulsions"]);
  }
});

test("a young-infant sign counts only under two months", () => {
  assert.deepEqual(keys("under_2_months", "not_feeding_well"), ["not_feeding_well"]);
  assert.deepEqual(keys("2_months_to_5_years", "not_feeding_well"), []);
  assert.deepEqual(keys("over_5_years", "not_feeding_well"), []);
  // Unknown age is not "under two months": the sign is noted and does not count.
  assert.deepEqual(keys("not_stated", "not_feeding_well"), []);
});

test("mixed signs: only the ones that count at this age come back", () => {
  assert.deepEqual(keys("not_stated", "fever_or_cold", "stridor"), ["stridor"]);
  assert.deepEqual(keys("under_2_months", "fever_or_cold", "stridor"), ["stridor", "fever_or_cold"]);
});

test("nothing described, or something that is not a sign, counts for nothing", () => {
  assert.deepEqual(keys("under_2_months"), []);
  assert.deepEqual(keys("under_2_months", "a_cough"), []);
});
