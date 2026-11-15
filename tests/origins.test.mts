import test from "node:test";
import assert from "node:assert/strict";
import { ORIGINS, PUBLISHERS, UNPLACED, coords } from "../app/lib/origins.ts";
import { SOURCES } from "../app/lib/sources.ts";

// The About page's globe says where each source is published. These pin that the map
// and the source list are the same list, so the page's counts cannot drift from it.

test("every source is placed once, except the model's own memory", () => {
  const placed = ORIGINS.flatMap((o) => o.publishers.flatMap((p) => p.sources));
  assert.equal(new Set(placed).size, placed.length);
  assert.deepEqual(
    UNPLACED.map((s) => s.name),
    ["The model's own memory"]
  );
  assert.equal(placed.length + UNPLACED.length, SOURCES.length);
});

test("the places run west to east, which is the order the page walks them", () => {
  const lons = ORIGINS.map((o) => o.lon);
  assert.deepEqual(lons, [...lons].sort((a, b) => a - b));
});

test("the counts the page prints", () => {
  assert.equal(ORIGINS.length, 7);
  assert.equal(PUBLISHERS, 9);
});

test("coordinates print with their hemisphere", () => {
  assert.equal(coords(51.51, -0.13), "51.51° N  0.13° W");
  assert.equal(coords(-35.28, 149.13), "35.28° S  149.13° E");
});
