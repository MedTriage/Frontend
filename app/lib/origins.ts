/* ── Where the sources are published. ──
 *
 * Every source in `sources.ts`, placed at the seat of the body that publishes it. The
 * About page draws these on a globe and joins them with one line, in this order.
 *
 * What a point means, exactly: where the publisher sits. Not where its servers are, and
 * not a claim that the body has anything to do with MedTriage; it publishes, the system
 * reads. The page says so in words, because a map invites the stronger reading.
 *
 * The list is checked against `SOURCES` as this file loads, and throws on a name that is
 * not there, so a source renamed in `sources.ts` cannot leave a stale row here. A source
 * that is added there and not placed here simply turns up in UNPLACED, next to the one
 * that belongs there: the model's own memory, which has no publisher and no address.
 * `tests/origins.test.mts` pins that it is the only one.
 *
 * Kept west to east, which is the order the page walks them in.
 * Coordinates are decimal degrees, longitude first (d3's order).
 */

import { SOURCES } from "./sources.ts";

export interface Origin {
  place: string;
  lon: number;
  lat: number;
  publishers: { name: string; sources: string[] }[];
}

export const ORIGINS: Origin[] = [
  {
    place: "Mountain View, California",
    lon: -122.08,
    lat: 37.39,
    publishers: [{ name: "Google", sources: ["Google Scholar"] }],
  },
  {
    place: "Itasca, Illinois",
    lon: -88.01,
    lat: 41.97,
    publishers: [
      { name: "American Academy of Pediatrics", sources: ["American Academy of Pediatrics"] },
    ],
  },
  {
    place: "Bethesda, Maryland",
    lon: -77.1,
    lat: 38.98,
    publishers: [
      {
        name: "US National Library of Medicine",
        sources: ["PubMed", "RxNorm", "ClinicalTrials.gov"],
      },
    ],
  },
  {
    place: "Silver Spring, Maryland",
    lon: -77.03,
    lat: 39.0,
    publishers: [{ name: "US Food and Drug Administration", sources: ["openFDA"] }],
  },
  {
    place: "London",
    lon: -0.13,
    lat: 51.51,
    publishers: [
      { name: "NICE", sources: ["NICE guidelines"] },
      { name: "Cochrane", sources: ["Cochrane Library"] },
      { name: "SNOMED International", sources: ["SNOMED CT"] },
    ],
  },
  {
    place: "Geneva",
    lon: 6.14,
    lat: 46.2,
    publishers: [
      {
        name: "World Health Organization",
        sources: [
          "WHO Global Health Observatory",
          "WHO IMCI chart booklets",
          "WHO IMCI: when to return",
        ],
      },
    ],
  },
  {
    place: "Bhubaneswar, Odisha",
    lon: 85.82,
    lat: 20.3,
    publishers: [{ name: "National Health Mission, Odisha", sources: ["IMNCI: an introduction"] }],
  },
];

const placed = new Set<string>();
for (const o of ORIGINS) {
  for (const p of o.publishers) {
    for (const name of p.sources) {
      if (!SOURCES.some((s) => s.name === name)) {
        throw new Error(`origins.ts places "${name}", which is not in sources.ts`);
      }
      if (placed.has(name)) throw new Error(`origins.ts places "${name}" twice`);
      placed.add(name);
    }
  }
}

/** Sources with no publisher to place. By design, only the model's own memory. */
export const UNPLACED = SOURCES.filter((s) => !placed.has(s.name));

export const PUBLISHERS = ORIGINS.reduce((n, o) => n + o.publishers.length, 0);

/** "51.51° N  0.13° W", the way an atlas index prints it. */
export function coords(lat: number, lon: number) {
  const part = (v: number, pos: string, neg: string) =>
    `${Math.abs(v).toFixed(2)}° ${v >= 0 ? pos : neg}`;
  return `${part(lat, "N", "S")}  ${part(lon, "E", "W")}`;
}
