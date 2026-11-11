import type { Metadata } from "next";
import { SiteShell } from "../components/site/SiteShell";
import {
  AboutHero,
  Colophon,
  Fails,
  Limits,
  Parts,
  RuleTable,
  Thesis,
  Wait,
} from "../components/site/About";
import { FollowUp, Sources } from "../components/site/Knowledge";

export const metadata: Metadata = {
  title: "How MedTriage works: the rules that outrank the model",
  description:
    "The eight rules that set a triage level, the five parts a question passes through, how the system fails, and what it cannot do.",
};

/* How it works. The rule table lives in `app/lib/rules.ts`, the limits in `limits.ts`,
   the phases in `seconds.ts`, the knowledge sources in `sources.ts`, the follow-up
   schedule and outcomes in `followup.ts` and the colophon in `colophon.ts`; this page
   only arranges them. The close and the footer come from the shell. */
export default function AboutPage() {
  return (
    <SiteShell>
      <AboutHero />
      <Thesis />
      <RuleTable />
      <Parts />
      <Wait />
      <Sources />
      <FollowUp />
      <Fails />
      <Limits />
      <Colophon />
    </SiteShell>
  );
}
