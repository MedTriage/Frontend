import Link from "next/link";
import { ChevronRight, Pill } from "lucide-react";

export interface PrescriptionRef {
  id: string;
  status: "draft" | "issued";
  message_id: number;
}

/* Under an answer in a consultation. What it opens is decided by the backend; a draft reaches
   this only with its test switch on, and says so before anyone opens it. */
export function PrescriptionLink({ prescription }: { prescription: PrescriptionRef }) {
  const draft = prescription.status === "draft";
  return (
    <Link
      href={`/prescriptions/${prescription.id}`}
      className="mt-3.5 flex items-center gap-2.5 border border-border bg-card px-3 py-2.5 hover:border-foreground/30 transition-colors"
    >
      <Pill className="w-3.5 h-3.5 shrink-0 text-t1" />
      <span className="text-[13px] min-w-0 flex-1">
        {draft ? "Test draft prescription, not reviewed by a doctor" : "A doctor issued a prescription with this answer"}
      </span>
      <ChevronRight className="w-3.5 h-3.5 text-muted shrink-0" />
    </Link>
  );
}
