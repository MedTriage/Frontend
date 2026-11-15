import Link from "next/link";
import { ExternalLink, MapPin, Phone } from "lucide-react";
import {
  facilityGroups,
  telHref,
  type Facility,
  type FacilitiesBlock,
  type Helpline,
  type Signposts as SignpostsData,
} from "../lib/signposts";

/* Indian public services under an answer, as the backend chose them: at most two helplines,
   112 first in an emergency, then government hospitals in the patient's area. Colour carries
   risk and nothing else, so only 112 takes the level-3 red. No logos, and nothing that says
   these services work with MedTriage: they are signposts, not partners. */

function HelplineCard({ helpline }: { helpline: Helpline }) {
  const emergency = helpline.key === "emergency_112";
  return (
    <div className={`border bg-card px-3 py-2.5 ${emergency ? "border-t3" : "border-border"}`}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
        <span className={`text-[14px] font-semibold ${emergency ? "text-t3" : ""}`}>{helpline.name}</span>
        {helpline.call?.map((number) => (
          <a
            key={number}
            href={telHref(number)}
            className="data inline-flex items-center gap-1.5 text-[13px] underline underline-offset-2 hover:text-foreground"
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            Call {number}
          </a>
        ))}
        {helpline.link && (
          <a
            href={helpline.link}
            target="_blank"
            rel="noopener noreferrer"
            className="data inline-flex items-center gap-1.5 text-[13px] underline underline-offset-2 hover:text-foreground"
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            Open {helpline.name}
          </a>
        )}
      </div>
      <p className="text-[13px] text-muted mt-1 leading-snug">{helpline.blurb}</p>
    </div>
  );
}

function FacilityRow({ facility }: { facility: Facility }) {
  return (
    <li className="py-2 first:pt-0 last:pb-0">
      <p className="text-[13px] font-medium leading-snug">{facility.name}</p>
      <p className="text-[12px] text-muted leading-snug">
        {facility.type} · {facility.district}
      </p>
      {facility.phone && (
        <a
          href={telHref(facility.phone)}
          className="data inline-flex items-center gap-1.5 text-[12px] underline underline-offset-2 mt-0.5"
        >
          <Phone className="w-3 h-3 shrink-0" />
          {facility.phone}
        </a>
      )}
    </li>
  );
}

function Facilities({ facilities }: { facilities: FacilitiesBlock }) {
  if ("needs_pin_code" in facilities) {
    return (
      <Link
        href="/profile"
        className="flex items-center gap-2.5 border border-border bg-card px-3 py-2.5 hover:border-foreground/30 transition-colors"
      >
        <MapPin className="w-3.5 h-3.5 shrink-0 text-muted" />
        <span className="text-[13px]">Add your pin code to your profile to see hospitals in your area.</span>
      </Link>
    );
  }
  return (
    <div className="border border-border bg-card px-3 py-2.5">
      <p className="label mb-2 inline-flex items-center gap-1.5">
        <MapPin className="w-3 h-3" />
        Ayushman Bharat hospitals in your area
      </p>
      {facilityGroups(facilities).map((group) => (
        <div key={group.label} className="mt-1 first-of-type:mt-0">
          <p className="data text-[11px] text-muted mb-1.5">
            {group.label}
            {group.items.length < group.total ? ` · ${group.items.length} of ${group.total}` : ""}
          </p>
          <ul className="divide-y divide-border mb-2.5">
            {group.items.map((f) => (
              <FacilityRow key={`${f.name}-${f.district}`} facility={f} />
            ))}
          </ul>
        </div>
      ))}
      <p className="text-[11px] text-muted leading-snug">
        Nearer first: your locality, then your district, then the rest of your postal area.{" "}
        {facilities.source ?? "Ayushman Bharat PM-JAY empanelled hospitals"}
        {facilities.updated ? `, list downloaded ${facilities.updated}` : ""}. Check before you travel.
      </p>
    </div>
  );
}

export function Signposts({ signposts }: { signposts: SignpostsData | null | undefined }) {
  if (!signposts || (!signposts.helplines?.length && !signposts.facilities)) return null;
  return (
    <div className="mt-3.5 space-y-2">
      {signposts.helplines.map((h) => (
        <HelplineCard key={h.key} helpline={h} />
      ))}
      {signposts.facilities && <Facilities facilities={signposts.facilities} />}
    </div>
  );
}
