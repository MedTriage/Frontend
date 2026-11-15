/*
  Helplines and facilities as the backend sends them. The backend chooses every number;
  the client only makes it tappable.
*/
import { test } from "node:test";
import assert from "node:assert/strict";
import { facilityGroups, telHref } from "../app/lib/signposts.ts";

test("a number is dialled as its digits, whatever spacing it is shown with", () => {
  assert.equal(telHref("1-800-891-4416"), "tel:18008914416");
  assert.equal(telHref("033 2223 5196"), "tel:03322235196");
  assert.equal(telHref("112"), "tel:112");
});

test("a leading plus is kept", () => {
  assert.equal(telHref("+91 80 2699 5000"), "tel:+918026995000");
});

const hospital = (name: string, type: string) => ({ name, type, district: "KOLKATA", state: "WEST BENGAL", phone: null });

test("hospitals come as a government list then a private one, each with its own count", () => {
  const block = {
    items: [hospital("Railway Hospital", "Government"), hospital("Mission Hospital", "Private (not for profit)"),
            hospital("City Clinic", "Private")],
    counts: { government: 5, private: 16 }, total: 21, area: "postal_area" as const, source: null, updated: null,
  };
  assert.deepEqual(
    facilityGroups(block).map((g) => [g.label, g.items.map((h) => h.name), g.total]),
    [["Government", ["Railway Hospital"], 5], ["Private", ["Mission Hospital", "City Clinic"], 16]],
  );
});

test("a list with no hospitals is left out", () => {
  const block = { items: [hospital("Railway Hospital", "Government")], counts: { government: 1, private: 0 },
                  total: 1, area: "postal_area" as const, source: null, updated: null };
  assert.deepEqual(facilityGroups(block).map((g) => g.label), ["Government"]);
});
