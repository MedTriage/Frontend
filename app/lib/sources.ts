/* ── Everything the system reads. ──
 *
 * Every knowledge source behind an answer, in any mode, and what each is allowed to do.
 * These are product claims with the same standing as `levels.ts` and `rules.ts`: each
 * entry is something agents-core really reads (its `CLAUDE.md` and
 * `vendor/medical-mcp/src/constants.ts` are where to check). Add a row when a source is
 * added there, and remove one when it is dropped. A list that flatters the system is
 * worse than no list.
 *
 * `uses` says which modes read the source; the About page filters on it, and the two
 * mode pages show only their own rows.
 *
 * "The model's own memory" is listed on purpose. It is a source in the plain sense that
 * answers draw on it, and leaving it out would make the list look more grounded than the
 * system is. Its row says what the backend does about that.
 */

export type SourceUse = "triage" | "drugs" | "followup" | "child";

export const USES: Record<SourceUse, string> = {
  triage: "Triage",
  drugs: "Drug mode",
  followup: "Follow-up",
  child: "Child health",
};

export interface Source {
  name: string;
  /** What kind of thing it is, in two or three words. */
  kind: string;
  uses: SourceUse[];
  /** What it supplies, in the patient's terms. */
  gives: string;
  /** Who publishes it and how it is read. */
  note: string;
}

export const SOURCES: Source[] = [
  {
    name: "SNOMED CT",
    kind: "Clinical terminology",
    uses: ["triage"],
    gives:
      "The map of related conditions. It confirms that a condition the system proposes exists, shows what tells two candidates apart, and brings in neighbouring conditions nobody proposed.",
    note: "About 370,000 concepts, held on the server. Licensed: where the release is unavailable this source reports nothing and says so.",
  },
  {
    name: "openFDA",
    kind: "Drug labelling",
    uses: ["triage", "drugs"],
    gives: "What a medicine's own label says: what it is for, its warnings, its interactions, its doses.",
    note: "US Food and Drug Administration. Read live, for each question.",
  },
  {
    name: "RxNorm",
    kind: "Drug names",
    uses: ["triage", "drugs"],
    gives: "The standard name of a medicine, so that a brand and its ingredient are known to be the same thing.",
    note: "US National Library of Medicine. Read live.",
  },
  {
    name: "PubMed",
    kind: "Research literature",
    uses: ["triage", "drugs"],
    gives: "Published studies and their abstracts.",
    note: "US National Library of Medicine. Read live; the slowest lookup, at around eleven seconds.",
  },
  {
    name: "Cochrane Library",
    kind: "Systematic reviews",
    uses: ["triage"],
    gives: "Reviews that weigh all the trials on one question together.",
    note: "Searched live.",
  },
  {
    name: "ClinicalTrials.gov",
    kind: "Trial registry",
    uses: ["triage"],
    gives: "Registered clinical studies and where each one stands.",
    note: "US National Library of Medicine. Read live.",
  },
  {
    name: "Google Scholar",
    kind: "Literature search",
    uses: ["triage"],
    gives: "A wider search of the academic literature, for what the other indexes miss.",
    note: "Searched live.",
  },
  {
    name: "WHO Global Health Observatory",
    kind: "Health statistics",
    uses: ["triage"],
    gives: "Health indicators by country, including those for child health.",
    note: "World Health Organization. Read live.",
  },
  {
    name: "American Academy of Pediatrics",
    kind: "Paediatric guidance",
    uses: ["triage"],
    gives: "Paediatric guidelines and policy, the journal Pediatrics, and Bright Futures.",
    note: "Searched live.",
  },
  {
    name: "The model's own memory",
    kind: "Unsourced, by construction",
    uses: ["triage"],
    gives:
      "What the language model recalls without looking anything up. It is asked, because no fixed library covers every case.",
    note: "Never allowed to cite. An answer that rests on it alone is marked as not grounded in evidence, and its confidence is kept out of the reckoning between sources.",
  },
  {
    name: "NICE guidelines",
    kind: "Clinical guidelines",
    uses: ["followup"],
    gives:
      "For each illness under follow-up: its usual course, the days to check in, and the signs that mean come back sooner.",
    note: "NG84 sore throat, NG91 ear infection, NG79 sinusitis, NG120 cough, NG109 urinary infection.",
  },
  {
    name: "WHO IMCI: when to return",
    kind: "Danger signs",
    uses: ["followup", "child"],
    gives:
      "The signs that mean a child should be taken back at once. Added to follow-up for patients under five, and printed under every child-health answer.",
    note: "World Health Organization, Integrated Management of Childhood Illness.",
  },
  {
    name: "WHO IMCI chart booklets",
    kind: "Clinical guidance",
    uses: ["child"],
    gives: "The WHO's own charts for assessing a sick child, and a sick young infant.",
    note: "Chart booklet, 2014; young infant chart booklet, 2019. Every passage keeps its page.",
  },
  {
    name: "IMNCI: an introduction",
    kind: "Clinical guidance",
    uses: ["child"],
    gives: "India's adaptation of the WHO approach, which adds the newborn.",
    note: "National Health Mission, Odisha.",
  },
];
