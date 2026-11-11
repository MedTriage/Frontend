import type { Metadata } from "next";
import { SiteShell } from "../components/site/SiteShell";
import { Sources } from "../components/site/Knowledge";
import { DrugHero, Nots, Steps, type Step } from "../components/site/Modes";

export const metadata: Metadata = {
  title: "Drug mode: ask about a medicine, a doctor signs it off",
  description:
    "Ask about interactions, doses and labelling. The medicine is looked up live, read against your record, and anything that names a dose is held for a doctor.",
};

/* Drug mode's page. Every step below is something the pipeline does today, in the
   patient's terms: the record the agents are given, the live FDA, RxNorm and PubMed
   lookups, the guardian's two drug rules (`app/lib/rules.ts` has their wording), and the
   prescriber's draft that only a doctor can issue. Edit a step only if that behaviour
   changed in agents-core. */
const STEPS: Step[] = [
  {
    word: "Read",
    head: "Against your record",
    body: "Your question is read with what you have told the system: the medicines you take, your allergies, your conditions.",
  },
  {
    word: "Looked up",
    head: "In the label itself",
    body: "The medicine's FDA labelling and its standard name in RxNorm are fetched live, along with the literature in PubMed.",
  },
  {
    word: "Ruled on",
    head: "By fixed rules",
    body: "An answer that names a drug or a dose is Level 2, without exception. One that contradicts a recorded allergy or interacts with a recorded medicine is Level 3.",
  },
  {
    word: "Drafted",
    head: "For the doctor",
    body: "On a held case a draft prescription is written for the reviewing doctor. It is theirs to edit, and it is not sent to you.",
  },
  {
    word: "Signed",
    head: "By a person",
    body: "The doctor issues their own version, or discards it. A conflict with an allergy you stated stops them until they confirm it.",
  },
];

const NOTS = [
  {
    title: "Prescribe on its own",
    body: "No prescription reaches a patient without a doctor. An answer the system gives directly never carries one.",
  },
  {
    title: "Hand you a draft",
    body: "What you receive is the sheet a doctor issued, with their name and registration on it.",
  },
  {
    title: "Overlook a stated allergy",
    body: "The allergies in your record are read against every drafted medicine, by class for penicillins, sulfa drugs and anti-inflammatory painkillers. A conflict has to be confirmed by the doctor, explicitly.",
  },
];

export default function DrugsPage() {
  return (
    <SiteShell>
      <DrugHero />
      <Steps
        field="bone"
        lines={["What happens to", "a drug question."]}
        lede="Five things, in order. The last one is a person."
        steps={STEPS}
      />
      <Nots
        field="ink"
        lines={["What it will", "not do."]}
        lede="Three limits that do not depend on what the model writes."
        items={NOTS}
      />
      <Sources
        only="drugs"
        field="bone"
        lines={["What it looks", "the medicine up in."]}
        lede="Three sources, each read live for the question in front of it, never from a stored copy."
      />
    </SiteShell>
  );
}
