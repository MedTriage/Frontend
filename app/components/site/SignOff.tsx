"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE, Lines, Rise } from "./ui";

/* ════ Drug mode: the sign-off ════
 *
 * A working model of what happens to a prescription between the system and the patient,
 * with you in the doctor's chair. On a held case the system drafts one; the doctor
 * issues their own version or discards it; and a medicine that conflicts with an allergy
 * the patient stated stops the doctor until they either confirm it or change the draft.
 * That is agents-core's prescriber (`prescriber_node.py`, and the `allergy_conflict`
 * refusal on `PATCH /doctor/cases/{id}`), played out on one sheet.
 *
 * What is scripted, and says so on the page:
 *
 *  - The two medicines. Amoxicillin is there because it is in the backend's penicillin
 *    family (`ALLERGY_CLASSES`), so a recorded penicillin allergy catches it by class,
 *    and paracetamol because it is in none. They are stand-ins for the check, not a
 *    treatment for anything.
 *  - Every dose, frequency and duration is a blank bar. This page gives no doses, and a
 *    drawing of a prescription is not an exception.
 *
 * The sheet is drawn after the real one (`PrescriptionSheet.tsx`): the same four
 * columns, and a footer that says "draft" until a doctor's name and registration number
 * replace it. The footer's two sentences are the real sheet's, without its study line.
 */

type Stage = "draft" | "stopped" | "issued" | "discarded";

const TAG: Record<Stage, string> = {
  draft: "Draft, for the doctor",
  stopped: "Stopped",
  issued: "Issued",
  discarded: "Discarded",
};

const REACHES: Record<Stage, string> = {
  draft: "Nothing. A draft is the doctor's to edit, and it is never sent to you.",
  stopped:
    "Nothing. The doctor cannot issue this until they confirm the conflict or change the draft.",
  issued: "The sheet the doctor issued, with their name and registration number on it.",
  discarded: "No prescription.",
};

/* How agents-core behaves, beyond what the model shows: the prescriber runs after the
   guardian; `ALLERGY_CLASSES` covers three families and any drug named outright, and
   leaves the rest to the doctor; the doctor's name and registration are copied onto
   the row when it is issued. */
const FACTS = [
  {
    head: "Drafted after the level is set",
    body: "The draft is written once the rules have held the case for a doctor, so it cannot move the level.",
  },
  {
    head: "Three families, and anything you named",
    body: "Penicillins, sulfa drugs and anti-inflammatory painkillers are matched as families, and a medicine you listed as an allergy is matched by name. Other families are left to the doctor.",
  },
  {
    head: "The sheet keeps the doctor's name",
    body: "Their name and registration number are copied onto the sheet when it is issued, so it stays true afterwards.",
  },
];

function Bars() {
  // Three blanks, where the real sheet prints a dose, a frequency and a duration.
  return (
    <>
      <i className="rx-bar" style={{ width: "62%" }} />
      <i className="rx-bar" style={{ width: "84%" }} />
      <i className="rx-bar" style={{ width: "48%" }} />
    </>
  );
}

export function SignOff() {
  const [allergy, setAllergy] = useState(true);
  const [stage, setStage] = useState<Stage>("draft");
  const [removed, setRemoved] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const conflict = allergy && !removed;
  const restart = (withAllergy = allergy) => {
    setAllergy(withAllergy);
    setStage("draft");
    setRemoved(false);
    setConfirmed(false);
  };

  return (
    <section className="sec wrap f-ink" data-field="dark" id="sign-off">
      <div className="sec-head">
        <Lines lines={["A draft, a check,", "and a doctor."]} />
        <Rise delay={0.1}>
          <p className="lede dim">
            The system drafts. The doctor decides. Take the doctor&apos;s chair and try to
            issue this one, with and without the allergy on the record.
          </p>
        </Rise>
      </div>

      <div className="model">
        <div className="model-stage">
          <motion.figure
            className="rx"
            data-stage={stage}
            initial={false}
            animate={{
              rotate: stage === "issued" ? 0 : -1.6,
              opacity: stage === "discarded" ? 0.38 : 1,
              x: stage === "stopped" ? [0, -9, 8, -5, 4, 0] : 0,
            }}
            transition={{ duration: 0.6, ease: EASE }}
            aria-label={`A prescription sheet. ${TAG[stage]}.`}
          >
            <div className="rx-paper">
              <div className="rx-head">
                <span className="rx-mark" aria-hidden>
                  Rx
                </span>
                <span className="rx-tag mono-s">{TAG[stage]}</span>
              </div>

              <div>
                <div className="rx-cols mono-s">
                  <span>Medicine</span>
                  <span>Dose</span>
                  <span>Frequency</span>
                  <span>Duration</span>
                </div>
                <AnimatePresence initial={false}>
                  {!removed && (
                    <motion.div
                      key="amoxicillin"
                      className="rx-line"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                    >
                      <div className="rx-row">
                        <span className="rx-name">Amoxicillin</span>
                        <Bars />
                        {allergy && (
                          <span className="rx-flag mono-s" data-ok={confirmed}>
                            {confirmed
                              ? "Penicillin allergy: confirmed by the doctor"
                              : "Conflicts with a stated allergy: penicillin"}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="rx-row">
                  <span className="rx-name">Paracetamol</span>
                  <Bars />
                </div>
              </div>

              <p className="rx-foot mono-s">
                {stage === "issued" ? (
                  <>
                    Issued by <i className="rx-bar inline" style={{ width: 92 }} />, Reg. no.{" "}
                    <i className="rx-bar inline" style={{ width: 54 }} />. Drafted with AI
                    assistance and reviewed by this doctor.
                  </>
                ) : stage === "discarded" ? (
                  "Discarded by the doctor."
                ) : (
                  "Draft, not reviewed by a doctor and not a prescription."
                )}
              </p>
            </div>
          </motion.figure>
          <p className="mono-s rx-note">
            A scripted example. The medicines are stand-ins for the check, and no dose is shown.
          </p>
        </div>

        <div className="model-card">
          <div>
            <p className="term-k mono-s">On the patient&apos;s record</p>
            <button
              className="anat-switch"
              aria-pressed={allergy}
              onClick={() => restart(!allergy)}
            >
              <i aria-hidden />
              An allergy to penicillin
            </button>
          </div>

          <div>
            <p className="term-k mono-s">You are the doctor</p>
            <div className="pills">
              {stage === "draft" && (
                <>
                  <button
                    className="pill"
                    onClick={() => setStage(conflict && !confirmed ? "stopped" : "issued")}
                  >
                    Issue it
                  </button>
                  <button className="pill" onClick={() => setStage("discarded")}>
                    Discard it
                  </button>
                </>
              )}
              {stage === "stopped" && (
                <>
                  <button
                    className="pill"
                    onClick={() => {
                      setConfirmed(true);
                      setStage("issued");
                    }}
                  >
                    Confirm the allergy and issue
                  </button>
                  <button
                    className="pill"
                    onClick={() => {
                      setRemoved(true);
                      setStage("draft");
                    }}
                  >
                    Take the line out
                  </button>
                </>
              )}
              {(stage === "issued" || stage === "discarded") && (
                <button className="pill" onClick={() => restart()}>
                  Start again
                </button>
              )}
            </div>
          </div>

          <div aria-live="polite">
            <p className="term-k mono-s">What reaches the patient</p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={stage}
                className="model-says"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                {REACHES[stage]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <dl className="model-facts" style={{ ["--n" as string]: FACTS.length }}>
        {FACTS.map((f, n) => (
          <Rise key={f.head} delay={n * 0.05}>
            <dt>{f.head}</dt>
            <dd>{f.body}</dd>
          </Rise>
        ))}
      </dl>
    </section>
  );
}
