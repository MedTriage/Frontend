/* ── What the thing is made of. ──
 *
 * Lifted out of `app/about/page.tsx` when the colophon became a component, for
 * the same reason the rule table was: a page file is the wrong home for a list
 * that something else has to read.
 *
 * Keep it honest. A colophon that lists what you wish you had built is worse
 * than no colophon, because it is the one section a reader assumes nobody would
 * bother to lie in.
 */

export interface Entry {
  what: string;
  with: string;
}

export const COLOPHON: Entry[] = [
  { what: "Interface", with: "Next.js, React, TypeScript, Tailwind" },
  { what: "Type", with: "Newsreader, Geist Mono" },
  { what: "Pipeline", with: "FastAPI, LangGraph" },
  { what: "Model", with: "Cerebras gpt-oss-120b" },
  { what: "Child-health guidance", with: "WHO and IMNCI documents, searched with FAISS" },
  { what: "Follow-up schedules", with: "NICE guidelines" },
  { what: "Related conditions", with: "SNOMED CT" },
  { what: "Live lookups", with: "FDA, PubMed, RxNorm, WHO" },
];
