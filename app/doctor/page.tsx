"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Stethoscope,
  FileSearch,
  BookOpen,
  Scale,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  ChevronRight,
  RefreshCw,
  ClipboardList,
  CircleAlert,
  AlertTriangle,
  Send,
} from "lucide-react";
import { Navbar } from "../components/Navbar";

// ─── Types ───

interface RagOutput {
  probable_diagnosis: string;
  differentials: string[];
  recommended_actions: string[];
  citations: string[];
  confidence: number;
  sources_retrieved: number;
}

interface CriticOutput {
  response: string;
  is_supported: boolean;
  issues: string[];
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
    ragOutput?: RagOutput | null;
    criticOutput?: CriticOutput | null;
    criticDecision?: string | null;
    guardianOutput?: GuardianOutput | null;
  };
}

type FilterStatus = "all" | "pending" | "verified" | "rejected";

// ─── Component ───

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
        setCases((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
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
  const verifiedCount = cases.filter((c) => c.status === "verified").length;
  const rejectedCount = cases.filter((c) => c.status === "rejected").length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border/30 bg-background">
        <Navbar alwaysVisible />
      </div>

      {/* Main content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-medium text-foreground">
                  Doctor Dashboard
                </h1>
                <p className="font-mono text-xs text-muted/60">
                  Review and verify Level-2 prescriptions
                </p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-xs text-amber-400 uppercase tracking-wider">
                  Pending
                </span>
              </div>
              <p className="text-2xl font-medium text-amber-400">
                {pendingCount}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-xs text-emerald-400 uppercase tracking-wider">
                  Verified
                </span>
              </div>
              <p className="text-2xl font-medium text-emerald-400">
                {verifiedCount}
              </p>
            </div>
            <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="font-mono text-xs text-red-400 uppercase tracking-wider">
                  Rejected
                </span>
              </div>
              <p className="text-2xl font-medium text-red-400">
                {rejectedCount}
              </p>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {(
                [
                  { key: "all", label: "All Cases", count: cases.length },
                  { key: "pending", label: "Pending", count: pendingCount },
                  { key: "verified", label: "Verified", count: verifiedCount },
                  { key: "rejected", label: "Rejected", count: rejectedCount },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    filter === f.key
                      ? "bg-accent/15 text-accent border border-accent/25"
                      : "text-muted hover:text-foreground hover:bg-border/20 border border-transparent"
                  }`}
                >
                  {f.label}
                  <span
                    className={`text-[10px] ${
                      filter === f.key ? "text-accent/60" : "text-muted/40"
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setLoading(true);
                fetchCases();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-muted hover:text-foreground hover:bg-border/20 transition-all"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Cases list */}
          {loading && cases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="w-6 h-6 text-muted/40 animate-spin mb-4" />
              <p className="font-mono text-xs text-muted/50">
                Loading cases...
              </p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <ClipboardList className="w-8 h-8 text-muted/20 mb-4" />
              <p className="font-mono text-sm text-muted/40">
                {filter === "all"
                  ? "No Level-2 cases submitted yet"
                  : `No ${filter} cases`}
              </p>
              <p className="font-mono text-xs text-muted/30 mt-1">
                Level-2 clinical queries from the triage console will appear
                here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCases.map((c) => {
                const isExpanded = expandedCase === c.id;
                const isAuditExpanded = expandedAudit === c.id;

                return (
                  <div
                    key={c.id}
                    className={`rounded-xl border transition-all ${
                      c.status === "pending"
                        ? "border-amber-400/20 bg-card"
                        : c.status === "verified"
                          ? "border-emerald-400/20 bg-card"
                          : "border-red-400/20 bg-card"
                    }`}
                  >
                    {/* Case header */}
                    <button
                      onClick={() =>
                        setExpandedCase(isExpanded ? null : c.id)
                      }
                      className="w-full flex items-center gap-4 p-4 text-left"
                    >
                      {/* Status icon */}
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          c.status === "pending"
                            ? "bg-amber-400/10"
                            : c.status === "verified"
                              ? "bg-emerald-400/10"
                              : "bg-red-400/10"
                        }`}
                      >
                        {c.status === "pending" && (
                          <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                        )}
                        {c.status === "verified" && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        )}
                        {c.status === "rejected" && (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </div>

                      {/* Case info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono ${
                              c.status === "pending"
                                ? "bg-amber-400/10 text-amber-400"
                                : c.status === "verified"
                                  ? "bg-emerald-400/10 text-emerald-400"
                                  : "bg-red-400/10 text-red-400"
                            }`}
                          >
                            <Activity className="w-2.5 h-2.5" />
                            Level 2 — {c.status}
                          </span>
                          <span className="font-mono text-[10px] text-muted/40">
                            {c.id}
                          </span>
                        </div>
                        <p className="text-sm text-foreground truncate">
                          {c.patientQuery}
                        </p>
                        <p className="font-mono text-[10px] text-muted/40 mt-0.5">
                          Submitted{" "}
                          {new Date(c.createdAt).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {/* Expand chevron */}
                      <ChevronRight
                        className={`w-4 h-4 text-muted/40 transition-transform duration-200 shrink-0 ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t border-border/30 animate-fade-in-up">
                        {/* Full conversation history */}
                        {c.chatHistory && c.chatHistory.length > 0 ? (
                          <div className="mt-4 mb-4">
                            <p className="font-mono text-[10px] text-muted/50 uppercase tracking-wider mb-2">
                              Full Conversation ({c.chatHistory.length} messages)
                            </p>
                            <div className="rounded-xl border border-border/30 bg-background/50 p-3 space-y-2 max-h-96 overflow-y-auto">
                              {c.chatHistory.map((msg, idx) => (
                                <div
                                  key={idx}
                                  className={`flex ${
                                    msg.role === "user"
                                      ? "justify-end"
                                      : "justify-start"
                                  }`}
                                >
                                  <div
                                    className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                                      msg.role === "user"
                                        ? "bg-accent/10 border border-accent/20 rounded-br-sm"
                                        : "bg-card border border-border/50 rounded-bl-sm"
                                    }`}
                                  >
                                    {/* Role label */}
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <span
                                        className={`font-mono text-[9px] uppercase tracking-wider ${
                                          msg.role === "user"
                                            ? "text-accent/60"
                                            : "text-muted/50"
                                        }`}
                                      >
                                        {msg.role === "user"
                                          ? "Patient"
                                          : "AI"}
                                      </span>
                                      {msg.triageLevel && (
                                        <span
                                          className={`px-1 py-0.5 rounded text-[9px] font-mono ${
                                            msg.triageLevel === 1
                                              ? "bg-emerald-400/10 text-emerald-400"
                                              : msg.triageLevel === 2
                                                ? "bg-amber-400/10 text-amber-400"
                                                : "bg-red-400/10 text-red-400"
                                          }`}
                                        >
                                          L{msg.triageLevel}
                                        </span>
                                      )}
                                      {msg.timestamp && (
                                        <span className="font-mono text-[9px] text-muted/30 ml-auto">
                                          {new Date(
                                            msg.timestamp
                                          ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      )}
                                    </div>
                                    <p className="whitespace-pre-line">
                                      {msg.content}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          /* Fallback: show just the triggering query + assessment */
                          <>
                            <div className="mt-4 mb-4">
                              <p className="font-mono text-[10px] text-muted/50 uppercase tracking-wider mb-1.5">
                                Patient Query
                              </p>
                              <div className="px-4 py-3 rounded-xl bg-accent/5 border border-accent/10">
                                <p className="text-sm leading-relaxed">
                                  {c.patientQuery}
                                </p>
                              </div>
                            </div>
                            <div className="mb-4">
                              <p className="font-mono text-[10px] text-amber-400/70 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <ClipboardList className="w-3 h-3" />
                                AI-Generated Prescription
                              </p>
                              <div className="px-4 py-3 rounded-xl bg-amber-400/5 border border-amber-400/15">
                                <p className="text-sm leading-relaxed whitespace-pre-line">
                                  {c.aiAssessment}
                                </p>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Pipeline audit trail */}
                        {c.pipeline && (
                          <div className="mb-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedAudit(
                                  isAuditExpanded ? null : c.id
                                );
                              }}
                              className="flex items-center gap-2 w-full text-left group mb-2"
                            >
                              <ChevronRight
                                className={`w-3 h-3 text-muted/50 transition-transform duration-200 ${
                                  isAuditExpanded ? "rotate-90" : ""
                                }`}
                              />
                              <Shield
                                className={`w-3 h-3 ${
                                  c.pipeline.guardianOutput?.ai_lock
                                    ? "text-red-400"
                                    : c.pipeline.guardianOutput
                                          ?.requires_doctor
                                      ? "text-amber-400"
                                      : "text-emerald-400"
                                }`}
                              />
                              <span className="font-mono text-[10px] text-muted/60 group-hover:text-muted transition-colors">
                                Guardian Audit Trail
                              </span>
                              {c.pipeline.criticOutput && (
                                <span className="ml-auto font-mono text-[10px] text-muted/40">
                                  {(
                                    c.pipeline.criticOutput
                                      .confidence_adjusted * 100
                                  ).toFixed(0)}
                                  % confidence
                                </span>
                              )}
                            </button>

                            {isAuditExpanded && (
                              <div className="ml-5 space-y-2.5 animate-fade-in-up">
                                {/* Intent Classification */}
                                <div className="flex items-start gap-2.5">
                                  <div className="w-5 h-5 rounded-md bg-emerald-400/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <FileSearch className="w-3 h-3 text-emerald-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider">
                                      Intent Classification
                                    </p>
                                    <p className="text-xs text-muted/70 mt-0.5">
                                      {c.pipeline.intentType || "unknown"}
                                      {c.pipeline.intentConfidence != null && (
                                        <span className="text-muted/40 ml-1.5">
                                          (
                                          {(
                                            c.pipeline.intentConfidence * 100
                                          ).toFixed(0)}
                                          % confidence)
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>

                                {/* RAG Retrieval */}
                                {c.pipeline.ragOutput && (
                                  <div className="flex items-start gap-2.5">
                                    <div className="w-5 h-5 rounded-md bg-blue-400/10 flex items-center justify-center shrink-0 mt-0.5">
                                      <BookOpen className="w-3 h-3 text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-mono text-[10px] text-blue-400 uppercase tracking-wider">
                                        RAG Retrieval
                                      </p>
                                      <p className="text-xs text-muted/70 mt-0.5">
                                        {
                                          c.pipeline.ragOutput
                                            .probable_diagnosis
                                        }
                                      </p>
                                      <p className="text-[10px] text-muted/40 mt-0.5">
                                        {
                                          c.pipeline.ragOutput
                                            .sources_retrieved
                                        }{" "}
                                        sources ·{" "}
                                        {(
                                          c.pipeline.ragOutput.confidence * 100
                                        ).toFixed(0)}
                                        % confidence
                                      </p>
                                      {c.pipeline.ragOutput.differentials
                                        ?.length > 0 && (
                                        <div className="mt-1.5 flex flex-wrap gap-1">
                                          {c.pipeline.ragOutput.differentials.map(
                                            (d, i) => (
                                              <span
                                                key={i}
                                                className="px-1.5 py-0.5 rounded bg-blue-400/5 text-[10px] text-blue-400/70 font-mono"
                                              >
                                                {d}
                                              </span>
                                            )
                                          )}
                                        </div>
                                      )}
                                      {c.pipeline.ragOutput
                                        .recommended_actions?.length > 0 && (
                                        <div className="mt-2">
                                          <p className="font-mono text-[10px] text-blue-400/50 mb-1">
                                            Recommended Actions:
                                          </p>
                                          {c.pipeline.ragOutput.recommended_actions.map(
                                            (a, i) => (
                                              <p
                                                key={i}
                                                className="text-[10px] text-muted/60 pl-2"
                                              >
                                                • {a}
                                              </p>
                                            )
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Critic Review */}
                                {c.pipeline.criticOutput && (
                                  <div className="flex items-start gap-2.5">
                                    <div className="w-5 h-5 rounded-md bg-violet-400/10 flex items-center justify-center shrink-0 mt-0.5">
                                      <Scale className="w-3 h-3 text-violet-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-mono text-[10px] text-violet-400 uppercase tracking-wider">
                                        Critic Review
                                      </p>
                                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                                        <span
                                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${
                                            c.pipeline.criticOutput
                                              .decision === "approve"
                                              ? "bg-emerald-400/10 text-emerald-400"
                                              : c.pipeline.criticOutput
                                                    .decision === "reject"
                                                ? "bg-red-400/10 text-red-400"
                                                : "bg-amber-400/10 text-amber-400"
                                          }`}
                                        >
                                          {c.pipeline.criticOutput.decision ===
                                          "approve" ? (
                                            <CheckCircle2 className="w-2.5 h-2.5" />
                                          ) : c.pipeline.criticOutput
                                              .decision === "reject" ? (
                                            <XCircle className="w-2.5 h-2.5" />
                                          ) : (
                                            <CircleAlert className="w-2.5 h-2.5" />
                                          )}
                                          {c.pipeline.criticOutput.decision}
                                        </span>
                                        <span
                                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${
                                            c.pipeline.criticOutput
                                              .safety_risk === "low"
                                              ? "bg-emerald-400/10 text-emerald-400"
                                              : c.pipeline.criticOutput
                                                    .safety_risk === "high"
                                                ? "bg-red-400/10 text-red-400"
                                                : "bg-amber-400/10 text-amber-400"
                                          }`}
                                        >
                                          risk:{" "}
                                          {c.pipeline.criticOutput.safety_risk}
                                        </span>
                                      </div>
                                      {c.pipeline.criticOutput.issues
                                        ?.length > 0 && (
                                        <div className="mt-1.5">
                                          {c.pipeline.criticOutput.issues.map(
                                            (issue, i) => (
                                              <p
                                                key={i}
                                                className="text-[10px] text-amber-400/70 flex items-center gap-1"
                                              >
                                                <CircleAlert className="w-2.5 h-2.5 shrink-0" />
                                                {issue}
                                              </p>
                                            )
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Guardian Decision */}
                                {c.pipeline.guardianOutput && (
                                  <div className="flex items-start gap-2.5">
                                    <div
                                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                                        c.pipeline.guardianOutput.ai_lock
                                          ? "bg-red-400/10"
                                          : c.pipeline.guardianOutput
                                                .requires_doctor
                                            ? "bg-amber-400/10"
                                            : "bg-emerald-400/10"
                                      }`}
                                    >
                                      {c.pipeline.guardianOutput.ai_lock ? (
                                        <ShieldAlert className="w-3 h-3 text-red-400" />
                                      ) : c.pipeline.guardianOutput
                                          .requires_doctor ? (
                                        <ShieldCheck className="w-3 h-3 text-amber-400" />
                                      ) : (
                                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={`font-mono text-[10px] uppercase tracking-wider ${
                                          c.pipeline.guardianOutput.ai_lock
                                            ? "text-red-400"
                                            : c.pipeline.guardianOutput
                                                  .requires_doctor
                                              ? "text-amber-400"
                                              : "text-emerald-400"
                                        }`}
                                      >
                                        Guardian Decision
                                      </p>
                                      <p className="text-xs text-muted/70 mt-0.5">
                                        {
                                          c.pipeline.guardianOutput
                                            .reasoning
                                        }
                                      </p>
                                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-400/10 text-[10px] text-amber-400 font-mono">
                                          {c.pipeline.guardianOutput.triage_level.replace(
                                            "_",
                                            " "
                                          )}
                                        </span>
                                        {c.pipeline.guardianOutput
                                          .requires_doctor && (
                                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-400/10 text-[10px] text-amber-400 font-mono">
                                            <Stethoscope className="w-2.5 h-2.5" />
                                            requires physician
                                          </span>
                                        )}
                                        {c.pipeline.guardianOutput
                                          .ai_lock && (
                                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-400/10 text-[10px] text-red-400 font-mono">
                                            <Lock className="w-2.5 h-2.5" />
                                            AI locked
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Doctor notes (existing) */}
                        {c.doctorNotes && c.status !== "pending" && (
                          <div className="mb-4">
                            <p className="font-mono text-[10px] text-muted/50 uppercase tracking-wider mb-1.5">
                              Doctor Notes
                            </p>
                            <div className="px-4 py-3 rounded-xl bg-card border border-border/50">
                              <p className="text-sm leading-relaxed text-muted/80">
                                {c.doctorNotes}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Action area for pending cases */}
                        {c.status === "pending" && (
                          <div className="mt-4 pt-4 border-t border-border/30">
                            {/* Notes input */}
                            <div className="mb-3">
                              <label className="font-mono text-[10px] text-muted/50 uppercase tracking-wider mb-1.5 block">
                                Doctor Notes (optional)
                              </label>
                              <div className="relative">
                                <textarea
                                  value={notesMap[c.id] || ""}
                                  onChange={(e) =>
                                    setNotesMap((prev) => ({
                                      ...prev,
                                      [c.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Add clinical notes, modifications to the prescription, or reason for rejection..."
                                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/30 focus:outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/10 resize-none font-sans leading-relaxed min-h-20"
                                  rows={3}
                                />
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() =>
                                  handleUpdateCase(c.id, "verified")
                                }
                                disabled={updatingCase === c.id}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-400/15 text-emerald-400 border border-emerald-400/25 text-xs font-medium hover:bg-emerald-400/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {updatingCase === c.id
                                  ? "Updating..."
                                  : "Approve Prescription"}
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateCase(c.id, "rejected")
                                }
                                disabled={updatingCase === c.id}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-400/10 text-red-400 border border-red-400/20 text-xs font-medium hover:bg-red-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Status footer for reviewed cases */}
                        {c.status !== "pending" && (
                          <div
                            className={`mt-4 pt-3 border-t flex items-center gap-2 font-mono text-xs ${
                              c.status === "verified"
                                ? "border-emerald-400/20 text-emerald-400"
                                : "border-red-400/20 text-red-400"
                            }`}
                          >
                            {c.status === "verified" ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Prescription approved —{" "}
                                {new Date(c.updatedAt).toLocaleString([], {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                Rejected —{" "}
                                {new Date(c.updatedAt).toLocaleString([], {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
