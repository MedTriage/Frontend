"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronRight, ExternalLink, MapPin, Phone, X } from "lucide-react";
import {
  facilityGroups,
  telHref,
  type Facility,
  type FacilitiesBlock,
  type Helpline,
  type Signposts as SignpostsData,
} from "../lib/signposts";

/* Indian public services under an answer, as the backend chose them: at most two helplines,
   112 first in an emergency, then government hospitals in the patient's area. One hairline
   list with no fills, so it sits under the answer without competing with it; the hospitals
   open in a popup from their own row (one tap) because six of them under every answer was most
   of the page. Colour carries risk and nothing else, so only 112 takes the level-3 red, on
   its name. The one other colour is the green handset on a call button, which the owner
   asked for on 2026-11-15: it is the usual colour of a call button, not a Level 1 mark.
   No logos, and nothing that says these services work with MedTriage: they are signposts,
   not partners. */

const CALL =
  "data inline-flex items-center gap-2 h-9 px-3.5 rounded-full bg-accent text-on-accent text-[12px] font-medium hover:opacity-85 transition-opacity";

function HelplineRow({ helpline }: { helpline: Helpline }) {
  const emergency = helpline.key === "emergency_112";
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 px-4 py-3">
      <div className="min-w-0 flex-1 basis-[13rem]">
        <p className={`text-[17px] font-semibold leading-tight ${emergency ? "text-t3" : ""}`}>
          {helpline.name}
        </p>
        <p className="text-[13px] text-muted mt-0.5 leading-snug">{helpline.blurb}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {helpline.call?.map((number) => (
          <a key={number} href={telHref(number)} className={`${CALL} ${emergency ? "call-pulse" : ""}`}>
            <Phone className={`call-ring call-green w-3.5 h-3.5 shrink-0 ${emergency ? "call-ring-fast" : ""}`} />
            Call {number}
          </a>
        ))}
        {helpline.link && (
          <a href={helpline.link} target="_blank" rel="noopener noreferrer" className={CALL}>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            Open {helpline.name}
          </a>
        )}
      </div>
    </div>
  );
}

function FacilityRow({ facility, index }: { facility: Facility; index: number }) {
  return (
    <li className="py-2.5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
      <div className="min-w-0 flex-1 basis-[12rem]">
        <p className="text-[14px] leading-snug">{facility.name}</p>
        <p className="text-[12px] text-muted leading-snug mt-0.5">
          {facility.type} · {facility.district}
        </p>
      </div>
      {facility.phone && (
        <a
          href={telHref(facility.phone)}
          className="data inline-flex items-center gap-1.5 text-[12px] underline-offset-2 hover:underline"
        >
          {/* Each row rings a beat after the one above, so the list rings as a wave
              and never all at once. */}
          <Phone className="call-ring text-t1 w-3 h-3 shrink-0" style={{ animationDelay: `${index * 0.22}s` }} />
          {facility.phone}
        </a>
      )}
    </li>
  );
}

function Facilities({ facilities }: { facilities: FacilitiesBlock }) {
  const dialog = useRef<HTMLDialogElement>(null);
  if ("needs_pin_code" in facilities) {
    return (
      <Link href="/profile" className="flex items-center gap-2.5 px-4 py-3 hover:bg-sunk/50 transition-colors">
        <MapPin className="w-3.5 h-3.5 shrink-0 text-muted" />
        <span className="text-[13px]">Add your pin code to your profile to see hospitals in your area.</span>
      </Link>
    );
  }
  const groups = facilityGroups(facilities);
  const title = "Ayushman Bharat hospitals in your area";
  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-sunk/50 transition-colors"
      >
        <MapPin className="w-3.5 h-3.5 shrink-0 text-muted" />
        <span className="text-[14px] min-w-0 flex-1">{title}</span>
        <span className="data text-[11px] text-muted tabular-nums">
          {groups.reduce((n, g) => n + g.items.length, 0)}
        </span>
        <ChevronRight className="w-4 h-4 shrink-0 text-muted" />
      </button>

      {/* A native modal dialog: the browser traps focus, closes it on Escape and gives the
          backdrop. A click that lands on the dialog element itself is a click on the
          backdrop, because the panel inside covers all of it. */}
      <dialog
        ref={dialog}
        aria-label={title}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="chat-sans m-auto w-[min(560px,calc(100vw-2rem))] overflow-hidden rounded-[22px] border border-border bg-card p-0 text-foreground shadow-[var(--shadow-2)] backdrop:bg-black/55"
      >
        <div className="flex max-h-[min(640px,calc(100dvh-4rem))] flex-col">
          <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
            <MapPin className="w-4 h-4 shrink-0 text-muted" />
            <h2 className="min-w-0 flex-1 text-[16px] font-medium leading-snug">{title}</h2>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label="Close"
              className="-mr-1.5 p-1.5 text-muted hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="min-h-0 overflow-y-auto px-5 pb-4 pt-1">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="data text-[11px] text-muted mt-3">
                  {group.label}
                  {group.items.length < group.total ? ` · ${group.items.length} of ${group.total}` : ""}
                </p>
                <ul className="divide-y divide-border">
                  {group.items.map((f, i) => (
                    <FacilityRow key={`${f.name}-${f.district}`} facility={f} index={i} />
                  ))}
                </ul>
              </div>
            ))}
            <p className="text-[11px] text-muted leading-snug mt-3">
              Nearer first: your locality, then your district, then the rest of your postal area.{" "}
              {facilities.source ?? "Ayushman Bharat PM-JAY empanelled hospitals"}
              {facilities.updated ? `, list downloaded ${facilities.updated}` : ""}. Check before you travel.
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}

export function Signposts({ signposts }: { signposts: SignpostsData | null | undefined }) {
  if (!signposts || (!signposts.helplines?.length && !signposts.facilities)) return null;
  return (
    <div className="mt-4 rounded-[16px] border border-border divide-y divide-border overflow-hidden">
      {signposts.helplines.map((h) => (
        <HelplineRow key={h.key} helpline={h} />
      ))}
      {signposts.facilities && <Facilities facilities={signposts.facilities} />}
    </div>
  );
}
