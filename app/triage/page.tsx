import type { Metadata } from "next";
import { SiteShell } from "../components/site/SiteShell";
import { FollowUp, Sources } from "../components/site/Knowledge";
import {
  Fails,
  Parts,
  RuleTable,
  Thesis,
  TriageHero,
  Wait,
} from "../components/site/Triage";

export const metadata: Metadata = {
  title: "Triage: describe what is wrong, then the rules decide who answers",
  description:
    "The eight rules that set a triage level, the five parts a question passes through, what happens while you wait, the follow-up after an answer, and how the system fails.",
};

/* Triage's page, the third of the mode pages. The rule table lives in
   `app/lib/rules.ts`, the phases in `seconds.ts`, the knowledge sources in `sources.ts`
   and the follow-up schedule and outcomes in `followup.ts`; this page only arranges
   them. The close and the footer come from the shell. */
export default function TriagePage() {
  return (
    <SiteShell>
      <TriageHero />
      <Thesis />
      <RuleTable />
      <Parts />
      <Wait />
      <Sources
        only="triage"
        field="bone"
        lines={["What it", "answers from."]}
        lede="Eight of these are read live for each question, one is a map of related conditions held on the server, and one is the model's own memory, which is treated as unsourced."
      />
      <FollowUp />
      <Fails />
    </SiteShell>
  );
}
