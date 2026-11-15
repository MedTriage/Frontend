/*
  Helplines and nearby government hospitals shown beside an answer. The backend chooses
  every card and every number (agents-core `services/helplines.py`, from one table); the
  client only renders them and makes numbers tappable. Signposts, not hand-offs: nothing
  here contacts a service, and no card may suggest a partnership.
*/

export interface Helpline {
  key: string;
  name: string;
  blurb: string;
  call?: string[];
  link?: string;
}

/* A hospital on the Ayushman Bharat PM-JAY empanelled list, found through the patient's pin
   code: its postal area (first three digits), own district first. The list carries no address,
   so each hospital shows its district instead. */
export interface Facility {
  name: string;
  district: string;
  state: string;
  // "Government", "Private (not for profit)", "Private" or "Type not stated".
  type: string;
  phone: string | null;
}

export type FacilitiesBlock =
  | { needs_pin_code: true }
  | {
      items: Facility[];
      // Up to three government hospitals, then up to three private, nearer first in each.
      // `counts` is how many of each the postal area lists; `total` is both together.
      counts: { government: number; private: number };
      total: number;
      area: "postal_area";
      source: string | null;
      updated: string | null;
    };

export interface Signposts {
  helplines: Helpline[];
  facilities: FacilitiesBlock | null;
}

export interface FacilityGroup {
  label: "Government" | "Private";
  items: Facility[];
  total: number;
}

/** The hospitals as two lists, government then private (not-for-profit and "type not
 *  stated" included), each with how many the area lists. An empty list is left out. */
export function facilityGroups(block: Extract<FacilitiesBlock, { items: Facility[] }>): FacilityGroup[] {
  const groups: FacilityGroup[] = [
    { label: "Government", items: block.items.filter((h) => h.type === "Government"), total: block.counts.government },
    { label: "Private", items: block.items.filter((h) => h.type !== "Government"), total: block.counts.private },
  ];
  return groups.filter((g) => g.items.length > 0);
}

/** The `tel:` link for a number shown as written ("1-800-891-4416", "033 2223 5196"). */
export function telHref(number: string): string {
  return `tel:${number.replace(/[^\d+]/g, "")}`;
}
