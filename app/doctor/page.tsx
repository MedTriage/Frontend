"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Check,
  X,
  ChevronRight,
  Clock,
  CircleAlert,
  Stethoscope,
} from "lucide-react";
import { Navbar } from "../components/Navbar";

interface SourceOutput {
  probable_diagnosis?: string | null;
  differentials?: string[];
  recommended_actions?: string[];
  citations?: string[];
  confidence?: number;
  sources_retrieved?: number;
  error?: string;
  status?: string;
}

interface OrchestratorOutput {
  response: string;
  is_supported: boolean;
  issues: string[];
  conflicts?: string[];
  safety_risk: string;
  decision: string;
  confidence_adjusted: number;
}

interface GuardianOutput {
  triage_level: string;
  reasoning: string;
  requires_doctor: boolean;
  ai_lock: boolean;
}

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  triageLevel?: 1 | 2 | 3;
  timestamp: string;
}

interface DoctorCase {
  id: string;
  patientQuery: string;
  aiAssessment: string;
  chatHistory: ChatMessage[];
  triageLevel: 2;
  status: "pending" | "verified" | "rejected";
  createdAt: string;
  updatedAt: string;
  doctorNotes?: string;
  pipeline?: {
    intentType?: string;
    intentConfidence?: number;
    ragOutput?: SourceOutput | null;
    kgragOutput?: SourceOutput | null;
    mcpOutput?: SourceOutput | null;
    orchestratorOutput?: OrchestratorOutput | null;
    orchestratorDecision?: string | null;
    guardianOutput?: GuardianOutput | null;
  };
}

type FilterStatus = "all" | "pending" | "verified" | "rejected";

/* Status keeps colour because status here IS clinical: a pending case is a held
   Level 2, which is why it is amber — the same amber the patient is looking at
   while they wait. Approved releases it; rejected flags it. */
const STATUS = {
  pending: { label: "Waiting on you", text: "text-t2", rule: "bg-t2" },
  verified: { label: "Approved", text: "text-t1", rule: "bg-t1" },
  rejected: { label: "Rejected", text: "text-t3", rule: "bg-t3" },
} as const;

const SOURCES = [
  { key: "rag", name: "Clinical guidelines" },
  { key: "kgrag", name: "Related conditions" },
  { key: "mcp", name: "FDA & PubMed" },
] as const;

function readSource(o?: SourceOutput | null): { finding: string; reported: boolean } {
  if (!o) return { finding: "Not consulted", reported: false };
  if (o.error) return { finding: "Couldn’t be reached", reported: false };
  if (o.status === "not_implemented")
    return { finding: "Not available", reported: false };
  const dx = (o.probable_diagnosis || "").trim();
  if (!dx || /insufficient/i.test(dx))
    return { finding: "Nothing relevant found", reported: false };
  return { finding: dx, reported: true };
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function DoctorDashboard() {
  const [cases, setCases] = useState<DoctorCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [expandedAudit, setExpandedAudit] = useState<string | null>(null);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [updatingCase, setUpdatingCase] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    try {
      const res = await fetch("/api/doctor/cases");
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      }
    } catch (err) {
      console.error("Failed to fetch cases:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
    // Poll every 10 seconds for new cases
    const interval = setInterval(fetchCases, 10000);
    return () => clearInterval(interval);
  }, [fetchCases]);

  const handleUpdateCase = async (
    caseId: string,
    status: "verified" | "rejected"
  ) => {
    setUpdatingCase(caseId);
    try {
      const res = await fetch(`/api/doctor/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          doctorNotes: notesMap[caseId] || undefined,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      }
    } catch (err) {
      console.error("Failed to update case:", err);
    } finally {
      setUpdatingCase(null);
    }
  };

  const filteredCases =
    filter === "all" ? cases : cases.filter((c) => c.status === filter);

  const pendingCount = cases.filter((c) => c.status === "pending").length;

  const FILTERS: { key: FilterStatus; label: string; count: number }[] = [
    { key: "all", label: "All", count: cases.length },
    { key: "pending", label: "Waiting", count: pendingCount },
    {
      key: "verified",
      label: "Approved",
      count: cases.filter((c) => c.status === "verified").length,
    },
    {
      key: "rejected",
      label: "Rejected",
      count: cases.filter((c) => c.status === "rejected").length,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-[1000px] mx-auto px-5 sm:px-8 py-12">
          {/* ── The one number that matters ── */}
          <div className="flex flex-wrap items-end justify-between gap-6 pb-6 border-b border-foreground">
            <div>
              <p className="label mb-4">Review queue</p>
              <h1 className="display text-[2.2rem] sm:text-[2.8rem]">
                {pendingCount === 0
                  ? "Nothing waiting."
                  : `${pendingCount} ${pendingCount === 1 ? "case needs" : "cases need"} you.`}
              </h1>
            </div>
            <p className="data text-[11px] text-muted">
              Refreshes every 10s
            </p>
          </div>

          {/* ── Filters ── */}
          <div className="flex flex-wrap gap-px bg-border border border-border mt-8 mb-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                className={`flex-1 min-w-[7rem] px-4 py-2.5 flex items-baseline justify-between gap-3 transition-colors ${
                  filter === f.key
                    ? "bg-accent text-on-accent"
                    : "bg-background text-muted hover:text-foreground"
                }`}
              >
                <span className="text-[13px] font-medium">{f.label}</span>
                <span className="data text-[11px] tabular-nums">{f.count}</span>
              </button>
            ))}
          </div>

          {/* ── The worklist ── */}
          {loading ? (
            <div className="py-16">
              <p className="label mb-3">Loading the queue</p>
              <div className="relative h-[2px] bg-border overflow-hidden max-w-xs">
                <span className="sweep absolute inset-y-0 left-0 w-1/3 bg-foreground" />
              </div>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="py-16 max-w-[52ch]">
              <p className="text-[15px] text-muted leading-relaxed">
                {filter === "all"
                  ? "No cases yet. A case lands here the moment the guardian holds an answer for a doctor — that is, any time the system reaches for a drug, a test, or a diagnosis."
                  : `Nothing under “${FILTERS.find((f) => f.key === filter)?.label}”.`}
              </p>
            </div>
          ) : (
            <div className="border-t border-border">
              {filteredCases.map((c) => {
                const st = STATUS[c.status];
                const open = expandedCase === c.id;
                const p = c.pipeline;
                const busy = updatingCase === c.id;
                const conf = p?.orchestratorOutput?.confidence_adjusted;

                return (
                  <div key={c.id} className="border-b border-border">
                    {/* Row */}
                    <button
                      onClick={() => setExpandedCase(open ? null : c.id)}
                      aria-expanded={open}
                      className="w-full text-left py-4 grid grid-cols-[1.25rem_minmax(0,1fr)_auto] sm:grid-cols-[1.25rem_minmax(0,1fr)_6rem_7rem_3rem] gap-x-4 gap-y-1 items-center hover:bg-card transition-colors"
                    >
                      <span className={`block w-[3px] h-8 ${st.rule}`} />

                      <span className="min-w-0">
                        <span className="block text-[15px] truncate">
                          {c.patientQuery}
                        </span>
                        <span className={`data text-[11px] ${st.text} sm:hidden`}>
                          {st.label}
                        </span>
                      </span>

                      <span className="data hidden sm:block text-[12px] text-muted tabular-nums">
                        {typeof conf === "number"
                          ? `${(conf * 100).toFixed(0)}%`
                          : "—"}
                      </span>

                      <span
                        className={`data hidden sm:block text-[12px] ${st.text}`}
                      >
                        {st.label}
                      </span>

                      <span className="data hidden sm:flex items-center justify-end gap-2 text-[11px] text-muted">
                        {timeAgo(c.createdAt)}
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-90" : ""}`}
                        />
                      </span>
                    </button>

                    {/* Case sheet */}
                    {open && (
                      <div className="pb-8 rise">
                        <div className="border border-border bg-card">
                          {/* What the patient asked */}
                          <div className="px-5 py-4 border-b border-border">
                            <p className="label mb-2">The patient asked</p>
                            <p className="text-[15px] leading-relaxed">
                              {c.patientQuery}
                            </p>
                          </div>

                          {/* What is being held */}
                          <div className="px-5 py-4 border-b border-border">
                            <p className="label mb-2">
                              Held for your approval
                            </p>
                            <p className="text-[15px] leading-relaxed whitespace-pre-line">
                              {c.aiAssessment}
                            </p>
                          </div>

                          {/* The evidence — same three sources the patient sees */}
                          {p && (
                            <div className="px-5 py-4 border-b border-border">
                              <button
                                onClick={() =>
                                  setExpandedAudit(
                                    expandedAudit === c.id ? null : c.id
                                  )
                                }
                                aria-expanded={expandedAudit === c.id}
                                className="inline-flex items-center gap-1.5 text-muted hover:text-foreground transition-colors"
                              >
                                <ChevronRight
                                  className={`w-3.5 h-3.5 transition-transform ${expandedAudit === c.id ? "rotate-90" : ""}`}
                                />
                                <span className="data text-[11px]">
                                  {expandedAudit === c.id
                                    ? "Hide the evidence"
                                    : "Show the evidence"}
                                </span>
                              </button>

                              {expandedAudit === c.id && (
                                <div className="mt-4 rise">
                                  <div className="border-t border-border">
                                    {SOURCES.map((src) => {
                                      const raw =
                                        src.key === "rag"
                                          ? p.ragOutput
                                          : src.key === "kgrag"
                                            ? p.kgragOutput
                                            : p.mcpOutput;
                                      const { finding, reported } =
                                        readSource(raw);
                                      return (
                                        <div
                                          key={src.key}
                                          className="grid sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] gap-x-5 gap-y-1 py-2.5 border-b border-border"
                                        >
                                          <p className="text-[13px] font-medium">
                                            {src.name}
                                          </p>
                                          <p
                                            className={`text-[13px] ${reported ? "" : "text-muted italic"}`}
                                          >
                                            {finding}
                                          </p>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {p.ragOutput?.differentials &&
                                    p.ragOutput.differentials.length > 0 && (
                                      <div className="mt-4">
                                        <p className="label mb-2">
                                          Differentials
                                        </p>
                                        <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                                          {p.ragOutput.differentials.map(
                                            (d, i) => (
                                              <li
                                                key={i}
                                                className="text-[13px] text-muted pl-2.5 border-l border-border"
                                              >
                                                {d}
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      </div>
                                    )}

                                  {p.orchestratorOutput?.issues &&
                                    p.orchestratorOutput.issues.length > 0 && (
                                      <div className="mt-4">
                                        <p className="label mb-2">
                                          Flagged in review
                                        </p>
                                        <ul className="space-y-1.5">
                                          {p.orchestratorOutput.issues.map(
                                            (issue, i) => (
                                              <li
                                                key={i}
                                                className="text-[13px] text-t2 flex gap-2"
                                              >
                                                <CircleAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                <span>{issue}</span>
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      </div>
                                    )}

                                  {p.guardianOutput && (
                                    <div className="mt-4">
                                      <p className="label mb-2">
                                        Why it was held
                                      </p>
                                      <p className="text-[14px] leading-relaxed border-l-2 border-l-t2 pl-3.5">
                                        {p.guardianOutput.reasoning}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Transcript */}
                          {c.chatHistory?.length > 0 && (
                            <div className="px-5 py-4 border-b border-border">
                              <p className="label mb-3">Conversation</p>
                              <div className="space-y-3">
                                {c.chatHistory.map((m, i) => (
                                  <div
                                    key={i}
                                    className={`text-[14px] leading-relaxed ${
                                      m.role === "user"
                                        ? "pl-3.5 border-l-2 border-l-border"
                                        : "pl-3.5 border-l-2 border-l-t2"
                                    }`}
                                  >
                                    <p className="label mb-1">
                                      {m.role === "user" ? "Patient" : "System"}
                                    </p>
                                    <p className="whitespace-pre-line">
                                      {m.content}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Decide */}
                          {c.status === "pending" ? (
                            <div className="px-5 py-4">
                              <label
                                htmlFor={`notes-${c.id}`}
                                className="label block mb-2"
                              >
                                Note to the patient — optional
                              </label>
                              <textarea
                                id={`notes-${c.id}`}
                                value={notesMap[c.id] || ""}
                                onChange={(e) =>
                                  setNotesMap((prev) => ({
                                    ...prev,
                                    [c.id]: e.target.value,
                                  }))
                                }
                                rows={3}
                                placeholder="Anything the patient should know alongside your decision."
                                className="w-full bg-background border border-border px-3 py-2.5 text-[14px] leading-relaxed placeholder:text-muted/70 focus:outline-none focus:border-foreground transition-colors resize-none"
                              />

                              <div className="flex flex-wrap gap-2 mt-3">
                                <button
                                  onClick={() =>
                                    handleUpdateCase(c.id, "verified")
                                  }
                                  disabled={busy}
                                  className="h-10 px-4 inline-flex items-center gap-2 bg-accent text-on-accent text-[13px] font-medium hover:opacity-85 disabled:opacity-40 transition-opacity"
                                >
                                  <Check className="w-4 h-4" />
                                  {busy ? "Sending…" : "Approve and send"}
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateCase(c.id, "rejected")
                                  }
                                  disabled={busy}
                                  className="h-10 px-4 inline-flex items-center gap-2 border border-border text-t3 text-[13px] font-medium hover:border-t3 disabled:opacity-40 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                  Reject
                                </button>
                              </div>

                              <p className="text-[13px] text-muted mt-3 leading-relaxed max-w-[56ch]">
                                The patient is waiting on this and cannot see the
                                assessment until you decide.
                              </p>
                            </div>
                          ) : (
                            <div className="px-5 py-4">
                              <div
                                className={`inline-flex items-center gap-2 ${st.text}`}
                              >
                                {c.status === "verified" ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <X className="w-4 h-4" />
                                )}
                                <span className="data text-[12px]">
                                  {st.label} · {timeAgo(c.updatedAt)} ago
                                </span>
                              </div>

                              {c.doctorNotes && (
                                <div className="mt-3 pt-3 border-t border-border">
                                  <p className="label mb-1.5">
                                    Your note to the patient
                                  </p>
                                  <p className="text-[14px] leading-relaxed whitespace-pre-line">
                                    {c.doctorNotes}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* A queue is a promise to somebody. Say so. */}
          {!loading && pendingCount > 0 && (
            <p className="flex items-center gap-2 mt-8 text-[13px] text-muted">
              <Clock className="w-3.5 h-3.5" />
              {pendingCount === 1 ? "One patient is" : `${pendingCount} patients are`}{" "}
              waiting on a decision.
            </p>
          )}
          {!loading && cases.length > 0 && pendingCount === 0 && (
            <p className="flex items-center gap-2 mt-8 text-[13px] text-muted">
              <Stethoscope className="w-3.5 h-3.5" />
              Queue clear. Nobody is waiting.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
