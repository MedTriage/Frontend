import Link from "next/link";
import { CalendarClock, ChevronRight, HeartHandshake } from "lucide-react";
import { episodeLine, visibleEpisodes, type FollowUpEpisode } from "../../lib/dashboard";

/* What is being watched, in the slot the reference gives to doctors' appointments. Each card
   opens its conversation, which is where a check-in is answered. */
export function FollowUpCards({ episodes }: { episodes: FollowUpEpisode[] | null }) {
  if (episodes === null) {
    return <div className="h-[84px] rounded-2xl bg-card border border-border" aria-hidden />;
  }
  if (episodes.length === 0) {
    return (
      <section aria-label="Follow-ups" className="bg-card border border-border rounded-2xl px-5 py-4">
        <h2 className="text-[15px] font-medium">Follow-ups</h2>
        <p className="text-[13px] text-muted leading-relaxed mt-1">
          When an answer can be managed at home, we&apos;ll check in on how it&apos;s going and the dates appear here.
        </p>
      </section>
    );
  }
  return (
    <section aria-label="Follow-ups" className="space-y-3">
      {visibleEpisodes(episodes).map((episode) => {
        const waiting = episode.state === "active" && episode.checkin_due;
        const active = episode.state === "active";
        return (
          <Link
            key={episode.id}
            href={`/chat?c=${episode.conversation_id}`}
            className="flex items-center gap-3.5 bg-card border border-border rounded-2xl px-4 py-3.5 hover:border-foreground/30 transition-colors"
          >
            <span
              className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                waiting ? "bg-tint-red on-field" : active ? "bg-tint-green on-field" : "bg-background text-muted"
              }`}
            >
              {active ? <CalendarClock className="w-[18px] h-[18px]" strokeWidth={1.75} /> : <HeartHandshake className="w-[18px] h-[18px]" strokeWidth={1.75} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium truncate">{episode.label}</span>
              <span className={`block text-[13px] mt-0.5 ${waiting ? "text-t3 font-medium" : "text-muted"}`}>
                {episodeLine(episode)}
              </span>
            </span>
            <ChevronRight className="w-4 h-4 text-muted shrink-0" />
          </Link>
        );
      })}
    </section>
  );
}
