"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowUp,
  Clock,
  CheckCircle2,
  XCircle,
  Pill,
  Stethoscope,
  WifiOff,
  RefreshCw,
  ServerCrash,
  Timer,
  CircleAlert,
  ChevronRight,
  ChevronDown,
  Lock,
  Plus,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import {
  getSessions,
  getSession,
  createSession,
  saveSession,
  deleteSession,
  type ChatSession,
  type SerializedMessage,
} from "@/lib/chatStorage";

// ----- Model definitions with inline SVG logos -----
interface ModelOption {
  id: string;
  name: string;
  provider: string;
  logo: React.ReactNode;
}

const AnthropicLogo = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M17.304 3.541h-3.48l6.15 16.918h3.48L17.303 3.541zm-10.66 0L.494 20.46h3.48l1.25-3.472h6.419l1.25 3.472h3.48L10.225 3.541H6.644zm.672 10.775L9.55 8.19l2.232 6.126H7.316z" />
  </svg>
);

const OpenAILogo = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
  </svg>
);

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
  </svg>
);

const MetaLogo = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a4.892 4.892 0 0 0 1.306 2.36c.602.576 1.38.883 2.285.883 1.123 0 2.145-.523 3.088-1.368a22.15 22.15 0 0 0 2.639-3.209l.746-1.065c1.08-1.542 2.063-2.636 2.947-3.285a4.342 4.342 0 0 1 2.55-.907c1.27 0 2.376.676 3.221 1.81.843 1.132 1.348 2.673 1.348 4.429 0 .66-.08 1.29-.23 1.86-.149.57-.378 1.073-.648 1.467a3.02 3.02 0 0 1-.94.88c-.35.208-.74.316-1.17.316-.473 0-.788-.164-1.033-.473-.246-.31-.37-.764-.37-1.327 0-.423.136-1.103.436-2.06l.146-.467c.072-.233.109-.472.109-.716 0-.382-.115-.69-.353-.912a1.238 1.238 0 0 0-.9-.334c-.539 0-1.07.33-1.59 1.016-.521.688-1.03 1.676-1.528 2.967a36.676 36.676 0 0 0-.58 1.669 9.545 9.545 0 0 1-.71 1.74c-.268.49-.574.88-.917 1.14-.344.264-.723.396-1.14.396-.46 0-.833-.142-1.12-.427a2.468 2.468 0 0 1-.598-1.07 5.31 5.31 0 0 1-.177-1.4c0-1.592.385-3.388 1.171-5.303.782-1.907 1.77-3.473 2.964-4.608 1.19-1.134 2.396-1.715 3.598-1.715 1.076 0 2.055.451 2.86 1.2l.127.123.128-.124c1.022-.93 2.132-1.2 2.994-1.2 1.107 0 2.005.406 2.674 1.17.669.763.994 1.79.994 3.03 0 .698-.115 1.362-.342 1.99-.228.627-.56 1.163-.942 1.544-.428.428-.893.626-1.367.626-.394 0-.708-.136-.94-.406-.232-.27-.348-.626-.348-1.07 0-.33.072-.743.231-1.284l.086-.283c.128-.418.193-.765.193-1.034 0-.39-.096-.679-.289-.867a1.022 1.022 0 0 0-.735-.282c-.42 0-.873.274-1.349.807-.479.536-1.002 1.35-1.581 2.447l-.188.365" />
  </svg>
);

const MODEL_OPTIONS: ModelOption[] = [
  { id: "claude-sonnet", name: "Claude Sonnet 4", provider: "Anthropic", logo: <AnthropicLogo /> },
  { id: "claude-opus", name: "Claude Opus 4", provider: "Anthropic", logo: <AnthropicLogo /> },
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", logo: <OpenAILogo /> },
  { id: "o3", name: "o3", provider: "OpenAI", logo: <OpenAILogo /> },
  { id: "gemini-2.5", name: "Gemini 2.5 Pro", provider: "Google", logo: <GoogleLogo /> },
  { id: "llama-4", name: "Llama 4 Maverick", provider: "Meta", logo: <MetaLogo /> },
];

type TriageLevel = 1 | 2 | 3;

interface PipelineMetadata {
  intentType?: string;
  intentConfidence?: number;
  ragOutput?: SourceOutput | null;
  kgragOutput?: SourceOutput | null;
  mcpOutput?: SourceOutput | null;
  orchestratorOutput?: OrchestratorOutput | null;
  orchestratorDecision?: string | null;
  guardianOutput?: GuardianOutput | null;
}

interface Message {
  id: string;
  role: "user" | "ai" | "system" | "error";
  content: string;
  triageLevel?: TriageLevel;
  timestamp: Date;
  status?: "pending" | "verified" | "rejected";
  doctorNotes?: string;
  errorType?: "api_offline" | "api_error" | "timeout" | "empty_response" | "unknown";
  pipeline?: PipelineMetadata;
}

/* Colour is the only chroma in this interface, and it means exactly one thing:
   how far the system is allowed to act on its own. */
const TRIAGE_CONFIG = {
  1: {
    name: "Direct",
    note: "Answered by the system",
    text: "text-t1",
    rule: "bg-t1",
    tint: "bg-t1/8",
  },
  2: {
    name: "Physician-verified",
    note: "Held for a doctor",
    text: "text-t2",
    rule: "bg-t2",
    tint: "bg-t2/8",
  },
  3: {
    name: "Locked",
    note: "Emergency — AI stopped",
    text: "text-t3",
    rule: "bg-t3",
    tint: "bg-t3/8",
  },
} as const;

/* The three sources, named for what they ARE to a patient — never for how they are
   built. "FDA & PubMed" earns trust; "MCP" earns confusion. Nobody outside this
   codebase should ever meet the words RAG, KGRAG, MCP, SNOMED or orchestrator. */
const SOURCES = [
  {
    key: "rag",
    name: "Clinical guidelines",
    about: "WHO and published treatment guidance",
  },
  {
    key: "kgrag",
    name: "Related conditions",
    about: "A map of conditions that present the same way",
  },
  {
    key: "mcp",
    name: "FDA & PubMed",
    about: "Live lookups in drug and research databases",
  },
] as const;

/* The pipeline as it actually runs. The three sources are consulted at the same
   time, not one after another — so the working state draws them as parallel lanes
   rather than a checklist, which would be a lie about the architecture. It also
   explains, honestly, why a cold clinical query takes twenty seconds: one of these
   lanes is a live network call. */
const PIPELINE = [
  { key: "read", label: "Reading your message" },
  {
    key: "consult",
    label: "Checking sources",
    lanes: SOURCES.map((s) => s.name),
  },
  { key: "reconcile", label: "Comparing what they said" },
  { key: "rule", label: "Deciding who answers" },
] as const;

// Simulated response for Level 3 (used only if the backend supplies no text)
function simulateLevel3Response(): string {
  return "EMERGENCY DETECTED — This system is now locked for your safety.\n\nYour symptoms suggest a potentially life-threatening condition. Please call emergency services (911) immediately or proceed to the nearest emergency room.\n\nDo not wait. Time is critical.";
}

/* All three retrieval branches return the same shape, which is what lets them be
   shown side by side. A branch that failed carries `error`; one that was never
   built carries `status`. Both mean "this source did not report", and the patient
   is told so plainly rather than being shown a silent gap. */
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

interface TriageAPIResponse {
  user_input: string;
  intent_type: string;
  title: string;
  intent_confidence: number;
  rag_output: SourceOutput | null;
  kgrag_output: SourceOutput | null;
  mcp_output: SourceOutput | null;
  orchestrator_output: OrchestratorOutput | null;
  orchestrator_decision: string | null;
  orchestrator_response: string | null;
  guardian_output: GuardianOutput | null;
  is_emergency: boolean;
  triage_level: TriageLevel;
}

async function getTriageResponse(
  text: string,
  conversationId: string,
  chatHistory: { role: string; content: string }[] = []
): Promise<{
  content: string;
  level: TriageLevel;
  title?: string;
  intentType?: string;
  confidence?: number;
  pipeline?: PipelineMetadata;
  error?: { type: Message["errorType"]; message: string };
}> {
  try {
    const controller = new AbortController();
    // A cold clinical query fans out to RAG + KGRAG + MCP in parallel, and the MCP
    // branch hits live external sources (PubMed alone can take ~11s) before the
    // orchestrator and guardian each make their own LLM call. A "revise" adds another
    // retrieval round on top of that.
    const timeoutId = setTimeout(() => controller.abort(), 300000);

    const res = await fetch("/api/triage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation_id: conversationId,
        text,
        chat_history: chatHistory,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      const detail = errorBody?.error || errorBody?.details || "";

      if (res.status === 502) {
        return {
          content: "",
          level: 1,
          error: {
            type: "api_offline",
            message:
              "The triage service isn't responding. Start the backend and send this again.",
          },
        };
      }

      if (res.status === 400) {
        return {
          content: "",
          level: 1,
          error: {
            type: "api_error",
            message: `The request was rejected: ${detail || "the message couldn't be processed"}. Try rephrasing it.`,
          },
        };
      }

      return {
        content: "",
        level: 1,
        error: {
          type: "api_error",
          message: `The service returned an error (${res.status}): ${detail || "something unexpected went wrong"}. Try again.`,
        },
      };
    }

    const data: TriageAPIResponse = await res.json();

    // The orchestrator's synthesized response is the ONLY patient-facing text. Raw
    // rag_output is deliberately not counted as content — it has not been through the
    // orchestrator's hallucination and safety audit, so it must never reach a patient.
    const hasContent = !!(
      data.orchestrator_response || data.orchestrator_output?.response
    );
    if (!hasContent) {
      return {
        content: "",
        level: 1,
        intentType: data.intent_type,
        confidence: data.intent_confidence,
        error: {
          type: "empty_response",
          message:
            "The pipeline returned nothing to show. No assessment was produced, so none is being displayed. Try again.",
        },
      };
    }

    const pipelineMeta: PipelineMetadata = {
      intentType: data.intent_type,
      intentConfidence: data.intent_confidence,
      ragOutput: data.rag_output,
      kgragOutput: data.kgrag_output,
      mcpOutput: data.mcp_output,
      orchestratorOutput: data.orchestrator_output,
      orchestratorDecision: data.orchestrator_decision,
      guardianOutput: data.guardian_output,
    };

    // Every level renders the same field: the orchestrator's synthesized response. It
    // is the single audited, patient-facing text — for chitchat, for a clinical
    // assessment, and for an emergency alike. There is deliberately no fallback to
    // rag_output: that text has not passed the safety audit.
    const content =
      data.orchestrator_response ||
      data.orchestrator_output?.response ||
      "Response received but content was empty.";

    if (data.triage_level === 1) {
      return {
        content,
        level: 1,
        title: data.title,
        intentType: data.intent_type,
        confidence: data.intent_confidence,
        pipeline: pipelineMeta,
      };
    }

    if (data.triage_level === 2) {
      return {
        content,
        level: 2,
        title: data.title,
        intentType: data.intent_type,
        confidence: data.intent_confidence,
        pipeline: pipelineMeta,
      };
    }

    // Level 3: the AI is locked. The backend still supplies the emergency text via the
    // orchestrator, so prefer it and only fall back to the canned message.
    return {
      content: data.orchestrator_response || simulateLevel3Response(),
      level: 3,
      title: data.title,
      intentType: data.intent_type,
      confidence: data.intent_confidence,
      pipeline: pipelineMeta,
    };
  } catch (error) {
    console.error("Triage API error:", error);

    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        content: "",
        level: 1,
        error: {
          type: "timeout",
          message:
            "The pipeline took longer than five minutes and the request was dropped. Try again, or simplify the question.",
        },
      };
    }

    if (error instanceof TypeError) {
      return {
        content: "",
        level: 1,
        error: {
          type: "api_offline",
          message:
            "Couldn't reach the triage service. Check that the backend is running and try again.",
        },
      };
    }

    return {
      content: "",
      level: 1,
      error: {
        type: "unknown",
        message: `Something unexpected went wrong: ${error instanceof Error ? error.message : "unknown error"}. Try again.`,
      },
    };
  }
}

/* ── Small parts ── */

/** What a single source came back with, phrased for a patient. A source that broke
 *  or was never reached says so plainly — a silent gap would be worse than an
 *  honest blank. */
function readSource(o?: SourceOutput | null): {
  finding: string;
  meta?: string;
  reported: boolean;
} {
  if (!o) return { finding: "Not consulted", reported: false };
  if (o.error) return { finding: "Couldn’t be reached", reported: false };
  if (o.status === "not_implemented")
    return { finding: "Not available yet", reported: false };

  const dx = (o.probable_diagnosis || "").trim();
  if (!dx || /insufficient/i.test(dx))
    return { finding: "Nothing relevant found", reported: false };

  const bits: string[] = [];
  if (o.sources_retrieved) bits.push(`${o.sources_retrieved} sources`);
  if (typeof o.confidence === "number")
    bits.push(`${(o.confidence * 100).toFixed(0)}% sure`);

  return {
    finding: dx,
    meta: bits.length ? bits.join(" · ") : undefined,
    reported: true,
  };
}

/** Confidence, drawn as a rule — the same unit the whole product is built from. */
function Confidence({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="label">How sure the system is</span>
        <span className="data text-[13px] font-semibold tabular-nums">
          {pct}%
        </span>
      </div>
      <div className="relative h-[6px] bg-border">
        <div
          className="bar-draw absolute inset-y-0 left-0 bg-foreground"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** What the level means for the person reading it — in the second person, because
 *  that is the only question they actually have. */
const LEVEL_CONSEQUENCE: Record<TriageLevel, string> = {
  1: "This was safe to answer directly, so no one is holding it.",
  2: "A doctor has to approve this before you act on it.",
  3: "The system has stopped. Get emergency care now — don’t wait on this.",
};

const ERROR_TITLES: Record<string, string> = {
  api_offline: "Service unreachable",
  timeout: "Request timed out",
  api_error: "Service error",
  empty_response: "Nothing returned",
  unknown: "Unexpected error",
};

function ErrorIcon({ type }: { type?: Message["errorType"] }) {
  const cls = "w-4 h-4";
  if (type === "api_offline") return <WifiOff className={cls} />;
  if (type === "timeout") return <Timer className={cls} />;
  if (type === "api_error") return <ServerCrash className={cls} />;
  if (type === "empty_response") return <CircleAlert className={cls} />;
  return <AlertTriangle className={cls} />;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [conversationTitle, setConversationTitle] = useState<string>("Untitled Conversation");
  const [mode, setMode] = useState<"triage" | "drugs">("triage");
  const [selectedModel, setSelectedModel] = useState<ModelOption>(MODEL_OPTIONS[0]);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [pipelineStage, setPipelineStage] = useState(0);
  const [expandedAudit, setExpandedAudit] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const pipelineTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ─── The index (past consultations) / session persistence ───
  // Switching consultations is a rare action, so it does not get permanent screen.
  // It opens as a full-width ledger instead of a standing rail.
  const [indexOpen, setIndexOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const all = getSessions();
    setSessions(all);
  }, []);

  // Auto-save current session to localStorage whenever messages change
  useEffect(() => {
    if (messages.length === 0) return;

    const serialized: SerializedMessage[] = messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      triageLevel: m.triageLevel,
      timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : (m.timestamp as unknown as string),
      status: m.status,
      doctorNotes: m.doctorNotes,
      errorType: m.errorType,
      pipeline: m.pipeline,
    }));

    const highestTriage = messages.reduce<TriageLevel | undefined>((max, m) => {
      if (!m.triageLevel) return max;
      if (!max) return m.triageLevel;
      return m.triageLevel > max ? m.triageLevel : max;
    }, undefined);

    if (currentSessionId) {
      const session: ChatSession = {
        id: currentSessionId,
        title: conversationTitle,
        messages: serialized,
        createdAt: getSession(currentSessionId)?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        highestTriageLevel: highestTriage,
        isLocked,
        model: selectedModel.id,
      };
      saveSession(session);
      setSessions(getSessions());
    } else {
      const session = createSession(selectedModel.id);
      session.title = conversationTitle;
      session.messages = serialized;
      session.highestTriageLevel = highestTriage;
      session.isLocked = isLocked;
      saveSession(session);
      setCurrentSessionId(session.id);
      setSessions(getSessions());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, conversationTitle, isLocked]);

  // Load a past session — blocked while a response is in-flight
  const loadSession = useCallback(
    (id: string) => {
      if (isTyping) return;
      const session = getSession(id);
      if (!session) return;
      setCurrentSessionId(session.id);
      setConversationTitle(session.title);
      setIsLocked(session.isLocked);
      setMessages(
        session.messages.map((m) => ({
          ...m,
          timestamp: new Date(m.timestamp),
          triageLevel: m.triageLevel as TriageLevel | undefined,
          errorType: m.errorType as Message["errorType"],
          pipeline: m.pipeline as PipelineMetadata | undefined,
        }))
      );
      const model = MODEL_OPTIONS.find((o) => o.id === session.model);
      if (model) setSelectedModel(model);
      setExpandedAudit(null);
      setDeleteConfirm(null);
      setIndexOpen(false);
    },
    [isTyping]
  );

  // Start a brand new session — blocked while a response is in-flight
  const startNewSession = useCallback(() => {
    if (isTyping) return;
    setCurrentSessionId(null);
    setMessages([]);
    setConversationTitle("Untitled Conversation");
    setIsLocked(false);
    setInput("");
    setExpandedAudit(null);
    setDeleteConfirm(null);
    setIndexOpen(false);
  }, [isTyping]);

  // Escape closes the index — it is an overlay, and overlays must be dismissible.
  useEffect(() => {
    if (!indexOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndexOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [indexOpen]);

  const handleDeleteSession = useCallback(
    (id: string) => {
      deleteSession(id);
      setSessions(getSessions());
      if (id === currentSessionId) {
        startNewSession();
      }
      setDeleteConfirm(null);
    },
    [currentSessionId, startNewSession]
  );

  const hasMessages = messages.length > 0;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Close model dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target as Node)) {
        setModelMenuOpen(false);
      }
    }
    if (modelMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [modelMenuOpen]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSend = async () => {
    if (!input.trim() || isLocked) return;

    // The backend keys the Scribe's persistent medical record on this id, so it must
    // exist before the first request — currentSessionId is only set once a session has
    // been persisted, which happens after the first message. Mint it here and reuse it
    // as the session id so the record and the stored session stay in lockstep.
    const conversationId = currentSessionId ?? crypto.randomUUID();
    if (!currentSessionId) setCurrentSessionId(conversationId);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setPipelineStage(0);

    // The request genuinely spends nearly all of its time consulting the three
    // sources — two of them are live network calls. So the indicator moves off
    // "reading" quickly and then honestly *holds* on "consulting" until the
    // response actually lands, rather than marching through invented steps.
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setPipelineStage(1), 600));
    pipelineTimerRef.current = timers[0];

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const chatHistory = messages
      .filter((m) => m.role === "user" || m.role === "ai")
      .map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.content,
      }));

    const response = await getTriageResponse(userMessage.content, conversationId, chatHistory);

    timers.forEach(clearTimeout);

    // The response is in: the sources have reported, so walk out through the two
    // steps that genuinely happen after them.
    setPipelineStage(2); // reconciling
    await new Promise((resolve) => setTimeout(resolve, 500));
    setPipelineStage(3); // ruling
    await new Promise((resolve) => setTimeout(resolve, 400));
    setPipelineStage(4); // done
    setIsTyping(false);

    if (response.title && conversationTitle === "Untitled Conversation") {
      setConversationTitle(response.title);
    }

    if (response.error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "error",
        content: response.error.message,
        errorType: response.error.type,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    const aiMessage: Message = {
      id: (Date.now() + 2).toString(),
      role: "ai",
      content: response.content,
      triageLevel: response.level,
      timestamp: new Date(),
      status: response.level === 2 ? "pending" : undefined,
      pipeline: response.pipeline,
    };

    setMessages((prev) => [...prev, aiMessage]);

    if (response.level === 3) {
      setIsLocked(true);
    }

    // Route Level 2 to the doctor queue for manual verification
    if (response.level === 2) {
      try {
        const fullHistory = [
          ...messages
            .filter((m) => m.role === "user" || m.role === "ai")
            .map((m) => ({
              role: m.role as "user" | "ai",
              content: m.content,
              triageLevel: m.triageLevel,
              timestamp: m.timestamp.toISOString(),
            })),
          {
            role: "user" as const,
            content: userMessage.content,
            timestamp: userMessage.timestamp.toISOString(),
          },
          {
            role: "ai" as const,
            content: response.content,
            triageLevel: response.level,
            timestamp: aiMessage.timestamp.toISOString(),
          },
        ];

        await fetch("/api/doctor/cases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientQuery: userMessage.content,
            aiAssessment: response.content,
            chatHistory: fullHistory,
            pipeline: response.pipeline || undefined,
          }),
        });
      } catch (err) {
        console.error("Failed to submit case to doctor queue:", err);
      }

      // Poll the doctor API so the verification status shows up in the transcript
      const pollInterval = setInterval(async () => {
        try {
          const res = await fetch("/api/doctor/cases");
          if (res.ok) {
            const cases = await res.json();
            const matchedCase = cases.find(
              (c: { patientQuery: string; status: string }) =>
                c.patientQuery === userMessage.content && c.status !== "pending"
            );
            if (matchedCase) {
              clearInterval(pollInterval);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMessage.id
                    ? { ...m, status: matchedCase.status, doctorNotes: matchedCase.doctorNotes || undefined }
                    : m
                )
              );
            }
          }
        } catch {
          // Silently ignore polling errors
        }
      }, 5000);

      setTimeout(() => clearInterval(pollInterval), 600000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const retryLast = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      setInput(lastUserMsg.content);
      textareaRef.current?.focus();
    }
  };

  /* ── Composer ── */

  const composer = (
    <div className="w-full max-w-[720px] mx-auto">
      {isLocked ? (
        <div className="border border-t3 bg-t3/8">
          <div className="flex items-start gap-3 p-4">
            <Lock className="w-4 h-4 text-t3 shrink-0 mt-0.5" />
            <div>
              <p className="data text-[11px] uppercase tracking-[0.14em] text-t3 mb-1.5">
                Session locked
              </p>
              <p className="text-[13px] text-foreground leading-relaxed">
                Emergency services have been alerted. Go to the nearest hospital
                or emergency room now — do not wait for this system.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-border bg-card focus-within:border-foreground transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === "drugs"
                ? "Ask about a drug — interactions, dosing, labelling."
                : "Describe your symptoms, or ask a clinical question."
            }
            className="w-full bg-transparent px-4 pt-4 pb-2 text-[14px] leading-relaxed text-foreground placeholder:text-muted/70 focus:outline-none resize-none min-h-[76px]"
            disabled={isTyping}
            rows={3}
            aria-label="Message"
          />

          <div className="flex items-center justify-between gap-2 px-2.5 py-2 border-t border-border">
            <div className="flex items-center gap-1 min-w-0">
              <button
                onClick={() => setMode("triage")}
                aria-pressed={mode === "triage"}
                className={`inline-flex items-center gap-1.5 h-7 px-2.5 text-[12px] transition-colors ${
                  mode === "triage"
                    ? "bg-accent text-on-accent"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                Triage
              </button>
              <button
                onClick={() => setMode("drugs")}
                aria-pressed={mode === "drugs"}
                className={`inline-flex items-center gap-1.5 h-7 px-2.5 text-[12px] transition-colors ${
                  mode === "drugs"
                    ? "bg-accent text-on-accent"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                Drugs
              </button>

              <span className="w-px h-4 bg-border mx-1.5" />

              <div className="relative min-w-0" ref={modelMenuRef}>
                <button
                  onClick={() => setModelMenuOpen(!modelMenuOpen)}
                  aria-expanded={modelMenuOpen}
                  aria-haspopup="listbox"
                  className="inline-flex items-center gap-1.5 h-7 px-2 data text-[11px] text-muted hover:text-foreground transition-colors max-w-full"
                >
                  <span className="shrink-0">{selectedModel.logo}</span>
                  <span className="truncate">{selectedModel.name}</span>
                  <ChevronDown
                    className={`w-3 h-3 shrink-0 transition-transform ${modelMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {modelMenuOpen && (
                  <div
                    role="listbox"
                    className="absolute bottom-full left-0 mb-2 w-60 border border-border bg-card shadow-lg z-50 rise"
                  >
                    <p className="label px-3 py-2 border-b border-border">
                      Model
                    </p>
                    <div className="p-1 max-h-64 overflow-y-auto">
                      {MODEL_OPTIONS.map((model) => {
                        const active = selectedModel.id === model.id;
                        return (
                          <button
                            key={model.id}
                            role="option"
                            aria-selected={active}
                            onClick={() => {
                              setSelectedModel(model);
                              setModelMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-left transition-colors ${
                              active
                                ? "bg-accent-muted text-foreground"
                                : "text-muted hover:text-foreground hover:bg-accent-muted/60"
                            }`}
                          >
                            <span className="shrink-0">{model.logo}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[12px] font-medium truncate text-foreground">
                                {model.name}
                              </span>
                              <span className="data block text-[10px] text-muted">
                                {model.provider}
                              </span>
                            </span>
                            {active && (
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
              className="shrink-0 w-8 h-8 grid place-items-center bg-accent text-on-accent disabled:opacity-20 disabled:cursor-not-allowed hover:opacity-85 transition-opacity"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <p className="data text-[10px] text-muted mt-3 text-center">
        Research system · not a substitute for professional medical advice
      </p>
    </div>
  );

  /* ── The chart band: who you are, where you are, what you can do ── */

  const chartBand = (
    <div className="shrink-0 border-b border-border bg-background">
      {/* Aligned to the transcript column, not the viewport — the band is the
          chart's title block, so it must sit over the chart. */}
      <div className="max-w-[720px] mx-auto px-5 h-12 flex items-center gap-3">
        {hasMessages ? (
          <>
            <h1 className="text-[13px] font-semibold truncate">
              {conversationTitle}
            </h1>
            {isLocked && (
              <span className="data text-[10px] uppercase tracking-[0.14em] text-t3 inline-flex items-center gap-1 shrink-0">
                <Lock className="w-3 h-3" />
                Locked
              </span>
            )}
          </>
        ) : (
          <span className="label">New consultation</span>
        )}

        <div className="ml-auto flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIndexOpen(true)}
            className="h-7 px-2.5 data text-[11px] text-muted hover:text-foreground transition-colors inline-flex items-center gap-1.5"
          >
            Past consultations
            <span className="data text-[10px] text-muted tabular-nums border border-border px-1">
              {sessions.length}
            </span>
          </button>
          {hasMessages && (
            <button
              onClick={startNewSession}
              disabled={isTyping}
              className="h-7 px-2.5 inline-flex items-center gap-1.5 text-[12px] text-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
          )}
        </div>
      </div>
    </div>
  );

  /* ── The index: past consultations as an admissions log, not a thread list.
        Same ledger language as the autonomy chart on the overview. ── */

  const consultationIndex = indexOpen && (
    <div
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-[2px] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Past consultations"
    >
      <div className="max-w-[880px] mx-auto px-5 py-10">
        <div className="flex items-baseline justify-between pb-3 mb-1 border-b border-foreground">
          <h2 className="display text-[1.6rem]">Past consultations</h2>
          <button
            onClick={() => setIndexOpen(false)}
            className="p-1.5 -mr-1.5 text-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="py-16">
            <p className="text-[15px] text-muted leading-relaxed max-w-[46ch]">
              Nothing here yet. Consultations are recorded once you send your
              first message, and stay on this device.
            </p>
            <button
              onClick={startNewSession}
              className="mt-6 h-10 px-4 inline-flex items-center gap-2 bg-accent text-on-accent text-[13px] font-medium hover:opacity-85 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              Start one
            </button>
          </div>
        ) : (
          <>
            {/* Column heads — this is a log, so it gets a header row */}
            <div className="hidden sm:grid grid-cols-[3.5rem_minmax(0,1fr)_5rem_4rem] gap-4 py-2.5 border-b border-border">
              <span className="label">Level</span>
              <span className="label">Concern</span>
              <span className="label">Turns</span>
              <span className="label text-right">Seen</span>
            </div>

            <ul>
              {sessions.map((session) => {
                const isActive = session.id === currentSessionId;
                const lvl = session.highestTriageLevel;
                const date = new Date(session.updatedAt);
                const confirming = deleteConfirm === session.id;

                return (
                  <li
                    key={session.id}
                    className="group relative border-b border-border"
                  >
                    <button
                      onClick={() => loadSession(session.id)}
                      disabled={isTyping && !isActive}
                      className={`w-full grid grid-cols-[3.5rem_minmax(0,1fr)] sm:grid-cols-[3.5rem_minmax(0,1fr)_5rem_4rem] gap-x-4 gap-y-1 items-baseline text-left py-4 pr-10 transition-colors hover:bg-card ${
                        isTyping && !isActive
                          ? "opacity-40 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {/* The triage rule is the scan key — you read this log by colour */}
                      <span className="flex items-center gap-2">
                        {lvl ? (
                          <>
                            <span
                              className={`block w-5 h-[3px] shrink-0 ${TRIAGE_CONFIG[lvl].rule}`}
                            />
                            <span
                              className={`data text-[11px] font-semibold ${TRIAGE_CONFIG[lvl].text}`}
                            >
                              {lvl}
                            </span>
                          </>
                        ) : (
                          <span className="data text-[11px] text-muted">—</span>
                        )}
                      </span>

                      <span className="min-w-0">
                        <span className="block text-[14px] truncate text-foreground">
                          {session.title}
                        </span>
                        {isActive && (
                          <span className="label mt-1 block">Open now</span>
                        )}
                      </span>

                      <span className="data hidden sm:block text-[12px] text-muted tabular-nums">
                        {session.messages.length}
                      </span>

                      <span className="data hidden sm:block text-[12px] text-muted text-right tabular-nums">
                        {date.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </button>

                    <button
                      onClick={() =>
                        confirming
                          ? handleDeleteSession(session.id)
                          : setDeleteConfirm(session.id)
                      }
                      onBlur={() => setDeleteConfirm(null)}
                      className={`absolute right-0 top-1/2 -translate-y-1/2 h-8 px-2 inline-flex items-center gap-1.5 transition-opacity ${
                        confirming
                          ? "text-t3 opacity-100"
                          : "text-muted opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-foreground"
                      }`}
                    >
                      {confirming && (
                        <span className="data text-[11px]">Delete?</span>
                      )}
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center justify-between pt-4">
              <p className="data text-[11px] text-muted">
                Stored on this device
              </p>
              <button
                onClick={startNewSession}
                disabled={isTyping}
                className="h-9 px-3.5 inline-flex items-center gap-2 border border-border text-[13px] text-foreground hover:border-foreground disabled:opacity-40 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New consultation
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  /* ── Transcript entries ── */

  const renderMessage = (message: Message) => {
    if (message.role === "user") {
      return (
        <div className="flex justify-end">
          <div className="max-w-[80%] border border-border bg-card px-3.5 py-2.5">
            <p className="text-[14px] leading-relaxed whitespace-pre-line">
              {message.content}
            </p>
          </div>
        </div>
      );
    }

    if (message.role === "system") {
      return (
        <p className="text-[13px] text-muted text-center py-2">
          {message.content}
        </p>
      );
    }

    if (message.role === "error") {
      return (
        <div className="border-l-2 border-l-t3 pl-4 py-1">
          <div className="flex items-center gap-2 text-t3 mb-1.5">
            <ErrorIcon type={message.errorType} />
            <span className="data text-[11px] uppercase tracking-[0.14em]">
              {ERROR_TITLES[message.errorType ?? "unknown"]}
            </span>
          </div>
          <p className="text-[14px] text-foreground leading-relaxed">
            {message.content}
          </p>
          <button
            onClick={retryLast}
            className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Put it back in the box
          </button>
        </div>
      );
    }

    if (message.role === "ai" && message.triageLevel) {
      const cfg = TRIAGE_CONFIG[message.triageLevel];
      const p = message.pipeline;
      const open = expandedAudit === message.id;

      return (
        <div className={`border-l-2 pl-4 ${cfg.rule.replace("bg-", "border-l-")}`}>
          {/* The stamp */}
          <div className="flex items-baseline gap-2.5 mb-2">
            <span className={`data text-[11px] font-semibold ${cfg.text}`}>
              Level {message.triageLevel}
            </span>
            <span className="data text-[11px] text-muted">{cfg.note}</span>
            <span className="data text-[10px] text-muted ml-auto shrink-0">
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div
            className={`text-[14px] leading-[1.65] whitespace-pre-line ${
              message.triageLevel === 3 ? "font-medium" : ""
            }`}
          >
            {message.content}
          </div>

          {/* Level 2 — where the case stands with the doctor */}
          {message.triageLevel === 2 && message.status && (
            <div className="mt-3.5 border border-border bg-card px-3 py-2.5">
              <div className="flex items-center gap-2">
                {message.status === "pending" && (
                  <>
                    <Clock className="w-3.5 h-3.5 text-t2 shrink-0" />
                    <span className="data text-[11px] text-t2">
                      Waiting for a doctor to review this
                    </span>
                  </>
                )}
                {message.status === "verified" && (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-t1 shrink-0" />
                    <span className="data text-[11px] text-t1">
                      Approved by a doctor
                    </span>
                  </>
                )}
                {message.status === "rejected" && (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-t3 shrink-0" />
                    <span className="data text-[11px] text-t3">
                      Rejected — the doctor wants a follow-up
                    </span>
                  </>
                )}
              </div>

              {message.doctorNotes && (
                <div className="mt-2.5 pt-2.5 border-t border-border">
                  <p className="label mb-1.5">Doctor&apos;s note</p>
                  <p className="text-[13px] text-foreground leading-relaxed whitespace-pre-line">
                    {message.doctorNotes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Where this answer came from. Sources are named for what they are —
              never for how they are built. */}
          {p && (
            <div className="mt-4">
              <button
                onClick={() => setExpandedAudit(open ? null : message.id)}
                aria-expanded={open}
                className="inline-flex items-center gap-1.5 text-muted hover:text-foreground transition-colors"
              >
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-90" : ""}`}
                />
                <span className="data text-[11px]">
                  {open ? "Hide" : "Why am I seeing this?"}
                </span>
              </button>

              {open && (
                <div className="mt-3 border border-border bg-card rise">
                  {p.orchestratorOutput && (
                    <div className="px-4 pt-4 pb-5 border-b border-border">
                      <Confidence
                        value={p.orchestratorOutput.confidence_adjusted}
                      />
                    </div>
                  )}

                  {/* Every source that was asked, and what each came back with.
                      This is the claim the product actually makes — that more than
                      one authority was consulted — so it is the thing shown first
                      and given the most room.

                      When none of them were asked at all, the table is not rendered:
                      conversational turns skip retrieval by design, and three rows of
                      "Not consulted" would dress up an absence as a finding. */}
                  <div className="px-4 py-4 border-b border-border">
                    {(() => {
                      const rows = SOURCES.map((src) => ({
                        src,
                        raw:
                          src.key === "rag"
                            ? p.ragOutput
                            : src.key === "kgrag"
                              ? p.kgragOutput
                              : p.mcpOutput,
                      }));
                      const anyAsked = rows.some((r) => r.raw != null);

                      if (!anyAsked) {
                        return (
                          <>
                            <p className="label mb-2">What was checked</p>
                            <p className="text-[13px] text-muted leading-relaxed max-w-[52ch]">
                              Nothing needed looking up — this was answered as a
                              conversation, not a clinical query.
                            </p>
                          </>
                        );
                      }

                      return (
                        <>
                          <p className="label mb-3">What was checked</p>
                          <div className="border-t border-border">
                            {rows.map(({ src, raw }) => {
                              const { finding, meta, reported } = readSource(raw);
                              return (
                                <div
                                  key={src.key}
                                  className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-x-5 gap-y-1 py-3 border-b border-border"
                                >
                                  <div className="min-w-0">
                                    <p className="text-[13px] font-medium">
                                      {src.name}
                                    </p>
                                    <p className="text-[12px] text-muted leading-snug mt-0.5">
                                      {src.about}
                                    </p>
                                  </div>
                                  <div className="min-w-0">
                                    <p
                                      className={`text-[13px] leading-snug ${
                                        reported
                                          ? "text-foreground"
                                          : "text-muted italic"
                                      }`}
                                    >
                                      {finding}
                                    </p>
                                    {meta && (
                                      <p className="data text-[11px] text-muted mt-1">
                                        {meta}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}

                    {/* Differentials are the useful thing the condition map gives
                        you, so they are surfaced rather than buried in a blob. */}
                    {(() => {
                      const diffs = [
                        ...(p.kgragOutput?.differentials ?? []),
                        ...(p.ragOutput?.differentials ?? []),
                      ]
                        .filter(Boolean)
                        .slice(0, 6);
                      if (diffs.length === 0) return null;
                      return (
                        <div className="mt-4">
                          <p className="label mb-2">
                            Other things that look like this
                          </p>
                          <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                            {diffs.map((d, i) => (
                              <li
                                key={i}
                                className="text-[13px] text-muted pl-2.5 border-l border-border"
                              >
                                {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Disagreement is the interesting part, so it is never hidden. */}
                  {p.orchestratorOutput &&
                    ((p.orchestratorOutput.conflicts?.length ?? 0) > 0 ||
                      (p.orchestratorOutput.issues?.length ?? 0) > 0) && (
                      <div className="px-4 py-4 border-b border-border">
                        <p className="label mb-2.5">Where they disagreed</p>
                        <ul className="space-y-2">
                          {(p.orchestratorOutput.conflicts ?? []).map((c, i) => (
                            <li
                              key={`c${i}`}
                              className="text-[13px] leading-relaxed"
                            >
                              {c}
                            </li>
                          ))}
                          {(p.orchestratorOutput.issues ?? []).map((issue, i) => (
                            <li
                              key={`i${i}`}
                              className="text-[13px] text-t2 leading-relaxed flex gap-2"
                            >
                              <CircleAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* The ruling. Given the level's colour and the heaviest rule in
                      the panel, because it is the one thing the reader must not
                      miss: what this means for them. */}
                  {p.guardianOutput && (
                    <div className="px-4 py-4">
                      <p className="label mb-2.5">Why it was handled this way</p>
                      <div
                        className={`border-l-2 pl-3.5 ${cfg.rule.replace("bg-", "border-l-")}`}
                      >
                        <p className="text-[14px] leading-relaxed">
                          {p.guardianOutput.reasoning}
                        </p>
                        <p
                          className={`text-[13px] font-medium mt-2 ${cfg.text}`}
                        >
                          {LEVEL_CONSEQUENCE[message.triageLevel]}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                        {p.guardianOutput.requires_doctor && (
                          <span className="data text-[11px] text-muted inline-flex items-center gap-1.5">
                            <Stethoscope className="w-3 h-3" />
                            Reviewed by a doctor
                          </span>
                        )}
                        {p.guardianOutput.ai_lock && (
                          <span className="data text-[11px] text-t3 inline-flex items-center gap-1.5">
                            <Lock className="w-3 h-3" />
                            AI stopped
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  /* ── Working: the pipeline, drawn as it actually runs.
        The three sources are consulted at the same time, so they are drawn as
        parallel lanes moving at their real relative speeds — the vector index and
        the ontology answer locally and quickly; the external lookup is a live call
        and is visibly the one everybody is waiting on. Achromatic on purpose:
        colour in this product means triage level, and nothing else. ── */

  const working = (
    <div className="border-l-2 border-l-border pl-4">
      <p className="label mb-3">Working</p>

      <div className="border-t border-border">
        {PIPELINE.map((step, i) => {
          const done = pipelineStage > i;
          const active = pipelineStage === i;

          return (
            <div
              key={step.key}
              className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-3 items-center py-2.5 border-b border-border"
            >
              <span
                className={`data text-[11px] ${
                  done || active ? "text-foreground" : "text-muted opacity-45"
                }`}
              >
                {step.label}
              </span>

              {/* The lanes only appear while the sources are actually being read */}
              {active && "lanes" in step ? (
                <div className="space-y-1.5">
                  {step.lanes.map((lane, j) => (
                    <div key={lane} className="flex items-center gap-2.5">
                      <span className="data text-[10px] text-muted w-[8.5rem] shrink-0 truncate">
                        {lane}
                      </span>
                      <span className="relative flex-1 h-[2px] bg-border overflow-hidden">
                        <span
                          className="sweep absolute inset-y-0 left-0 w-1/3 bg-foreground"
                          // Each lane moves at roughly its real speed: the first two
                          // are answered locally and fast; the live lookup drags, and
                          // is visibly the one everyone is waiting on.
                          style={{
                            animationDuration: `${[1.1, 1.4, 2.6][j]}s`,
                          }}
                        />
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="relative h-[2px] bg-border overflow-hidden">
                  {done && (
                    <span className="bar-draw absolute inset-0 bg-foreground" />
                  )}
                  {active && (
                    <span className="sweep absolute inset-y-0 left-0 w-1/3 bg-foreground" />
                  )}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {pipelineStage === 1 && (
        <p className="text-[12px] text-muted mt-3 leading-relaxed max-w-[46ch]">
          FDA and PubMed are searched live, so this is the step that usually
          takes the time.
        </p>
      )}
    </div>
  );

  /* ── Empty state ── */

  if (!hasMessages) {
    return (
      <div className="h-screen bg-background text-foreground flex flex-col">
        <Navbar alwaysVisible />
        {chartBand}

        <main className="flex-1 overflow-y-auto flex flex-col justify-center px-5">
          <div className="w-full max-w-[720px] mx-auto py-10 rise">
            <h1 className="display text-[2rem] sm:text-[2.5rem] max-w-[18ch]">
              What&apos;s going on?
            </h1>
            <p className="mt-4 text-[15px] text-muted leading-relaxed max-w-[52ch]">
              Describe your symptoms in your own words. Whatever comes back is
              tagged with how far the system was allowed to act on its own — and
              you can always open the reasoning behind it.
            </p>

            <div className="mt-8 mb-8">
              <p className="label mb-3">Try</p>
              <div className="flex flex-col gap-px bg-border border border-border">
                {[
                  "What are the symptoms of strep throat?",
                  "I've had a sore throat and fever for three days",
                  "Can I take ibuprofen with my blood pressure medication?",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInput(prompt);
                      textareaRef.current?.focus();
                    }}
                    className="group flex items-center justify-between gap-3 bg-background px-3.5 py-3 text-left hover:bg-card transition-colors"
                  >
                    <span className="text-[13px] text-muted group-hover:text-foreground transition-colors">
                      {prompt}
                    </span>
                    <ArrowUp className="w-3.5 h-3.5 text-muted rotate-45 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            {composer}
          </div>
        </main>

        {consultationIndex}
      </div>
    );
  }

  /* ── Active consultation ── */

  return (
    <div className="h-screen bg-background text-foreground flex flex-col">
      <Navbar alwaysVisible />
      {chartBand}

      <main className="flex-1 overflow-y-auto px-5 py-8">
        <div className="max-w-[720px] mx-auto space-y-7">
          {messages.map((message) => (
            <div key={message.id} className="rise">
              {renderMessage(message)}
            </div>
          ))}

          {isTyping && <div className="rise">{working}</div>}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <div className="shrink-0 border-t border-border px-5 py-4 bg-background">
        {composer}
      </div>

      {consultationIndex}
    </div>
  );
}
