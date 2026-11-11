import type { Metadata } from "next";
import { SiteShell } from "../components/site/SiteShell";
import { Sources } from "../components/site/Knowledge";
import { ChildHero, Nots, Steps, type Step } from "../components/site/Modes";

export const metadata: Metadata = {
  title: "Child health: questions about a child, answered from WHO and IMNCI guidance",
  description:
    "Child-health mode answers from WHO and IMNCI documents, shows the page each claim came from, checks for danger signs first, and always says what to watch for.",
};

/* Child-health mode's page. The steps are the backend's child graph in the parent's
   terms (sign check, retrieval, answer, the two rules that are code), and the limits
   are its deliberate omissions. Edit either only if agents-core's child mode changed. */
const STEPS: Step[] = [
  {
    word: "Checked",
    head: "For danger signs, first",
    body: "Before anything is written, your own words are checked for the child's age and for each WHO danger sign: present, absent, or not mentioned.",
  },
  {
    word: "Searched",
    head: "In the guidance",
    body: "The WHO chart booklets and the IMNCI introduction are searched for passages on your question. Every passage keeps its page.",
  },
  {
    word: "Written",
    head: "From those passages",
    body: "The answer cites the passage behind each claim. What the passages do not cover is set apart and labelled as general information.",
  },
  {
    word: "Composed",
    head: "By two fixed rules",
    body: "A danger sign puts “go to hospital now” above the answer, and every answer ends with the signs to watch for. Neither is left to the model.",
  },
];

const NOTS = [
  {
    title: "A triage level",
    body: "There is no Level 1, 2 or 3 here. Nothing is held for a doctor, and the conversation never locks, even under a hospital-now banner.",
  },
  {
    title: "Your own record",
    body: "Your profile describes you, not your child, so it is not used. Nothing your child has is added to it.",
  },
  {
    title: "Medicine doses",
    body: "It gives none, with one exception: oral rehydration solution.",
  },
  {
    title: "Other languages",
    body: "It reads and answers in English.",
  },
];

export default function ChildPage() {
  return (
    <SiteShell>
      <ChildHero />
      <Steps
        field="ink"
        lines={["How an answer", "is put together."]}
        lede="Four steps. The first and the last are not the model's to decide."
        steps={STEPS}
      />
      <Nots
        field="bone"
        lines={["What it leaves", "out, on purpose."]}
        lede="Child-health mode is not triage, and it does not pretend to be."
        items={NOTS}
      />
      <Sources
        only="child"
        field="bone2"
        lines={["The pages", "it answers from."]}
        lede="Three sets of documents. An answer may cite only a passage that was actually retrieved from them."
      />
    </SiteShell>
  );
}
