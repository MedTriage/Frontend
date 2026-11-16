/* ── The public services an answer can point to ──
 *
 * For the home page's section (`Lifelines` in `components/site/Home.tsx`). A display mirror of
 * agents-core, like `sources.ts`: the names and descriptions are `SERVICES` in
 * `app/services/helplines_content.py`, word for word, because each was checked against an
 * official page there; `levels` is which answers get the card, from `helplines.py` (the
 * hospitals come with any level 2 or 3). Change this when that changes.
 *
 * `does` is what the service itself does, for the About page (the owner asked for this in
 * place of when each is shown). It says no more than an official page does: 112 and 108 from
 * the NHM ambulance guidelines and NHM's ambulance page ("predominantly an emergency response
 * system ... critical care, trauma and accident victims"), eSanjeevani from PIB, 13 May 2021
 * ("National Telemedicine Service", "free of cost", "in the confines of their homes"),
 * Tele-MANAS from the backend's checked wording. Two things could not be read from an
 * official page on 2026-11-15 and should be confirmed before a demo: that a Tele-MANAS call
 * is answered by a trained counsellor (its site's certificate chain is broken), and the
 * PM-JAY sentence (its site is a script shell). 112 is not said to reach the police or the
 * fire service, because the page the backend checked does not say so.
 *
 * `gives` is what MedTriage puts beside an answer: what `components/Signposts.tsx` draws.
 *
 * No number to dial is printed beyond the two names that are themselves numbers. A number
 * or a link a patient acts on arrives with the answer, from the backend's checked table,
 * never from client copy.
 *
 * `site` is where to read about the service, for the About page only (owner's request,
 * 2026-11-15). Each address was requested on that day and is labelled by its host, so a
 * link never passes for something it is not:
 * - 112's own site, 112.gov.in, serves a self-signed certificate, which a browser stops
 *   with a warning. It links to the National Health Mission guidelines the backend checked
 *   its wording against instead. Change it when that site is fixed.
 * - 108 is run state by state and has no site of its own; the National Health Mission's
 *   ambulance page is the national account of it.
 * - Tele-MANAS and eSanjeevani are the backend's own `source` and `link`.
 * - The hospitals link is PM-JAY's own hospital finder.
 *
 * These are signposts, not partners: no tie-up exists with any of them, so the section that
 * draws this must not use a logo or the words "integration" or "partner", and says so.
 */

export const SERVICES = [
  {
    key: "emergency_112",
    name: "112",
    what: "India’s national emergency number, including ambulances. Free, 24×7.",
    when: "First, on every emergency.",
    does:
      "The single emergency number for the whole country: one call to ask for emergency help, an ambulance included, at any hour and at no cost.",
    gives:
      "A button that dials it from your phone, and a line above the answer telling you to call now or go to the nearest emergency department.",
    site: {
      href: "https://nhm.gov.in/New-Update-2025-26/NAS-Guidline/NAS-guidline-June-2026.pdf",
      label: "nhm.gov.in, ambulance guidelines (PDF)",
    },
    levels: [3],
  },
  {
    key: "ambulance_108",
    name: "108",
    what: "Emergency ambulance. Free, 24×7, in most states.",
    when: "Beside 112 in an emergency.",
    does:
      "An emergency ambulance service, built for critical care, trauma and accident victims. A call sends an ambulance that takes the patient to hospital. It runs in most states, free and at any hour.",
    gives: "A button that dials it from your phone.",
    site: {
      href: "https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=1217&lid=189",
      label: "nhm.gov.in, ambulance services",
    },
    levels: [3],
  },
  {
    key: "tele_manas",
    name: "Tele-MANAS",
    what: "Government of India mental health helpline. Free, 24×7, in 20 Indian languages.",
    when: "Whenever a message describes distress, at any level.",
    does:
      "The Government of India’s mental health helpline. You call and talk to a trained counsellor about how you are feeling, in any of 20 Indian languages, free and at any hour.",
    gives:
      "Buttons that dial its numbers. In an emergency, the line above the answer names it as well.",
    site: { href: "https://telemanas.mohfw.gov.in/", label: "telemanas.mohfw.gov.in" },
    levels: [1, 2, 3],
  },
  {
    key: "esanjeevani",
    name: "eSanjeevani",
    what: "Free online consultation with a government doctor.",
    when: "While an answer waits for a doctor, and when a locked one is not an emergency.",
    does:
      "The health ministry’s national telemedicine service. You consult a government doctor online, from home, without paying.",
    gives:
      "A link that opens eSanjeevani in a new tab. MedTriage does not book the consultation or pass anything about you to it.",
    site: { href: "https://esanjeevani.mohfw.gov.in/", label: "esanjeevani.mohfw.gov.in" },
    levels: [2, 3],
  },
  {
    key: "facilities",
    name: "Ayushman Bharat hospitals",
    what: "PM-JAY hospitals in your postal area, your own district first.",
    when: "On held and locked answers, once your profile has a pin code.",
    does:
      "Ayushman Bharat PM-JAY is the government’s health insurance scheme. People it covers are treated without paying at hospitals that have joined it. Being on this list means a hospital has joined the scheme, not that your own treatment is covered.",
    gives:
      "A list, nearer first: your locality, your district, then the rest of your postal area. Each line is a hospital’s name, type and district, with a phone number where the list has one. It never says nearest or open: check before you travel.",
    site: { href: "https://hospitals.pmjay.gov.in/", label: "hospitals.pmjay.gov.in" },
    levels: [2, 3],
  },
] as const;
