import type { Metadata } from "next";
import { SiteShell } from "../components/site/SiteShell";
import {
  AboutHero,
  Colophon,
  Keeps,
  Limits,
  ModesIndex,
  Premise,
} from "../components/site/About";
import { Atlas } from "../components/site/Atlas";
import { Sources } from "../components/site/Knowledge";

export const metadata: Metadata = {
  title: "About MedTriage: what it is, what it reads, and where it stops",
  description:
    "A medical assistant with three ways to ask. Every source it reads and where each is published, what it keeps about you, what it cannot do, and what it is made of.",
};

/* The general account. The modes are in `SiteShell.tsx` (`MODES`), the sources in
   `app/lib/sources.ts`, where they are published in `origins.ts`, the limits in
   `limits.ts` and the colophon in `colophon.ts`; this page only arranges them. How
   triage works, rule by rule, moved to `/triage` when that mode got its own page. The
   close and the footer come from the shell. */
export default function AboutPage() {
  return (
    <SiteShell>
      <AboutHero />
      <Premise />
      <ModesIndex />
      <Atlas />
      <Sources />
      <Keeps />
      <Limits />
      <Colophon />
    </SiteShell>
  );
}
