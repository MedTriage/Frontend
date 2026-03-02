"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Brain,
  Activity,
  AlertTriangle,
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
  ChevronDown,
} from "lucide-react";
import { Navbar } from "../components/Navbar";

// ----- Model definitions with inline SVG logos -----
interface ModelOption {
  id: string;
  name: string;
  provider: string;
  logo: React.ReactNode;
}

const AnthropicLogo = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M17.304 3.541h-3.48l6.15 16.918h3.48L17.303 3.541zm-10.66 0L.494 20.46h3.48l1.25-3.472h6.419l1.25 3.472h3.48L10.225 3.541H6.644zm.672 10.775L9.55 8.19l2.232 6.126H7.316z"/>
  </svg>
);

const OpenAILogo = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
  </svg>
);

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
  </svg>
);

const MetaLogo = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a4.892 4.892 0 0 0 1.306 2.36c.602.576 1.38.883 2.285.883 1.123 0 2.145-.523 3.088-1.368a22.15 22.15 0 0 0 2.639-3.209l.746-1.065c1.08-1.542 2.063-2.636 2.947-3.285a4.342 4.342 0 0 1 2.55-.907c1.27 0 2.376.676 3.221 1.81.843 1.132 1.348 2.673 1.348 4.429 0 .66-.08 1.29-.23 1.86-.149.57-.378 1.073-.648 1.467a3.02 3.02 0 0 1-.94.88c-.35.208-.74.316-1.17.316-.473 0-.788-.164-1.033-.473-.246-.31-.37-.764-.37-1.327 0-.423.136-1.103.436-2.06l.146-.467c.072-.233.109-.472.109-.716 0-.382-.115-.69-.353-.912a1.238 1.238 0 0 0-.9-.334c-.539 0-1.07.33-1.59 1.016-.521.688-1.03 1.676-1.528 2.967a36.676 36.676 0 0 0-.58 1.669 9.545 9.545 0 0 1-.71 1.74c-.268.49-.574.88-.917 1.14-.344.264-.723.396-1.14.396-.46 0-.833-.142-1.12-.427a2.468 2.468 0 0 1-.598-1.07 5.31 5.31 0 0 1-.177-1.4c0-1.592.385-3.388 1.171-5.303.782-1.907 1.77-3.473 2.964-4.608 1.19-1.134 2.396-1.715 3.598-1.715 1.076 0 2.055.451 2.86 1.2l.127.123.128-.124c1.022-.93 2.132-1.2 2.994-1.2 1.107 0 2.005.406 2.674 1.17.669.763.994 1.79.994 3.03 0 .698-.115 1.362-.342 1.99-.228.627-.56 1.163-.942 1.544-.428.428-.893.626-1.367.626-.394 0-.708-.136-.94-.406-.232-.27-.348-.626-.348-1.07 0-.33.072-.743.231-1.284l.086-.283c.128-.418.193-.765.193-1.034 0-.39-.096-.679-.289-.867a1.022 1.022 0 0 0-.735-.282c-.42 0-.873.274-1.349.807-.479.536-1.002 1.35-1.581 2.447l-.188.365"/>
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

interface Message {
  id: string;
  role: "user" | "ai" | "system" | "error";
  content: string;
  triageLevel?: TriageLevel;
  timestamp: Date;
  status?: "pending" | "verified" | "rejected";
  errorType?: "api_offline" | "api_error" | "timeout" | "empty_response" | "unknown";
}

const TRIAGE_CONFIG = {
  1: {
    label: "Level 1 — Direct Response",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    icon: Brain,
    dot: "bg-emerald-400",
  },
  2: {
    label: "Level 2 — Awaiting Doctor Verification",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    icon: Activity,
    dot: "bg-amber-400",
  },
  3: {
    label: "Level 3 — Emergency Redirect",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    icon: AlertTriangle,
    dot: "bg-red-400",
  },
};

// Simulated response for Level 3 (emergency agent not yet built)
function simulateLevel3Response(): string {
  return "EMERGENCY DETECTED — This system is now locked for your safety.\n\nYour symptoms suggest a potentially life-threatening condition. Please call emergency services (911) immediately or proceed to the nearest emergency room.\n\nDo not wait. Time is critical.";
}

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

function formatRagOutput(rag: RagOutput): string {
  const lines: string[] = [];

  lines.push(`📋 Probable Diagnosis:\n${rag.probable_diagnosis}`);

  if (rag.differentials?.length) {
    lines.push(`\n🔍 Differential Considerations:\n${rag.differentials.map((d) => `  • ${d}`).join("\n")}`);
  }

  if (rag.recommended_actions?.length) {
    lines.push(`\n✅ Recommended Actions:\n${rag.recommended_actions.map((a) => `  • ${a}`).join("\n")}`);
  }

  if (rag.citations?.length) {
    lines.push(`\n📚 Sources:\n${rag.citations.map((c) => `  • ${c}`).join("\n")}`);
  }

  lines.push(`\nConfidence: ${(rag.confidence * 100).toFixed(0)}% · ${rag.sources_retrieved} sources retrieved`);

  lines.push(`\nThis assessment has been sent to a physician for verification. You'll be notified once reviewed.`);

  return lines.join("\n");
}

interface TriageAPIResponse {
  user_input: string;
  intent_type: string;
  intent_confidence: number;
  companion_output: string;
  rag_output: RagOutput | null;
  critic_output: CriticOutput | null;
  critic_decision: string | null;
  critic_response: string | null;
  triage_level: TriageLevel;
}

async function getTriageResponse(
  text: string,
  chatHistory: { role: string; content: string }[] = []
): Promise<{
  content: string;
  level: TriageLevel;
  intentType?: string;
  confidence?: number;
  error?: { type: Message["errorType"]; message: string };
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch("/api/triage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, chat_history: chatHistory }),
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
              "The backend API is currently offline. Please make sure the server is running and try again.",
          },
        };
      }

      if (res.status === 400) {
        return {
          content: "",
          level: 1,
          error: {
            type: "api_error",
            message: `Invalid request: ${detail || "the message could not be processed"}. Please try rephrasing your query.`,
          },
        };
      }

      // Other server errors (500, etc.)
      return {
        content: "",
        level: 1,
        error: {
          type: "api_error",
          message: `Server error (${res.status}): ${detail || "an unexpected error occurred"}. Please try again later.`,
        },
      };
    }

    const data: TriageAPIResponse = await res.json();

    // Validate response has content
    if (!data.companion_output && data.triage_level === 1) {
      return {
        content: "",
        level: 1,
        intentType: data.intent_type,
        confidence: data.intent_confidence,
        error: {
          type: "empty_response",
          message:
            "The API returned an empty response. The triage pipeline may be experiencing issues. Please try again.",
        },
      };
    }

    // Level 1: use actual backend companion response
    if (data.triage_level === 1) {
      return {
        content: data.companion_output,
        level: 1,
        intentType: data.intent_type,
        confidence: data.intent_confidence,
      };
    }

    // Level 2: use critic_response if available, otherwise fall back to RAG output
    if (data.triage_level === 2) {
      const content = data.critic_response
        ? data.critic_response
        : data.critic_output?.response
          ? data.critic_output.response
          : data.rag_output
            ? formatRagOutput(data.rag_output)
            : data.companion_output || "Clinical assessment pending — awaiting pipeline response.";
      return {
        content,
        level: 2,
        intentType: data.intent_type,
        confidence: data.intent_confidence,
      };
    }

    // Level 3: use backend response if available, otherwise simulated
    return {
      content: data.companion_output || simulateLevel3Response(),
      level: 3,
      intentType: data.intent_type,
      confidence: data.intent_confidence,
    };
  } catch (error) {
    console.error("Triage API error:", error);

    // Timeout
    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        content: "",
        level: 1,
        error: {
          type: "timeout",
          message:
            "The request timed out after 15 seconds. The backend may be under heavy load. Please try again.",
        },
      };
    }

    // Network error (fetch failed entirely — e.g. server not running)
    if (error instanceof TypeError && (error.message.includes("fetch") || error.message.includes("network"))) {
      return {
        content: "",
        level: 1,
        error: {
          type: "api_offline",
          message:
            "Could not connect to the triage service. The API appears to be offline. Please check the server and try again.",
        },
      };
    }

    // Unknown error
    return {
      content: "",
      level: 1,
      error: {
        type: "unknown",
        message: `An unexpected error occurred: ${error instanceof Error ? error.message : "unknown error"}. Please try again.`,
      },
    };
  }
}

// Fallback classification when backend is unavailable
// Mirrors the API route logic: chitchat-like → L1, emergency → L3, clinical → L2
const EMERGENCY_KEYWORDS = [
  "chest pain", "can't breathe", "cannot breathe", "stroke",
  "unconscious", "bleeding heavily", "heart attack", "seizure",
  "anaphylaxis", "choking", "overdose", "not breathing", "collapsed",
];
const CHITCHAT_KEYWORDS = [
  "hello", "hi", "hey", "bye", "thanks", "thank you", "good morning",
  "good night", "how are you", "what's up", "goodbye",
];

function fallbackClassify(input: string): { content: string; level: TriageLevel } {
  const lower = input.toLowerCase();

  // Check chitchat first
  const isChitchat = CHITCHAT_KEYWORDS.some((kw) => lower.includes(kw));
  if (isChitchat) {
    return {
      level: 1,
      content:
        "Hello! I'm here to help with your health concerns. Feel free to describe any symptoms or ask a health question, and I'll route it through the appropriate triage level.",
    };
  }

  // Check emergency
  const isEmergency = EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
  if (isEmergency) {
    return { level: 3, content: simulateLevel3Response() };
  }

  // Everything else is clinical → Level 2 (fallback — no RAG data available offline)
  return { level: 2, content: "Clinical query detected. Unable to reach the triage backend for a full RAG assessment. Please ensure the server is running and try again." };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [mode, setMode] = useState<"triage" | "drugs">("triage");
  const [selectedModel, setSelectedModel] = useState<ModelOption>(MODEL_OPTIONS[0]);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);

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

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Build chat_history from previous messages (exclude system/error messages and the current one)
    const chatHistory = messages
      .filter((m) => m.role === "user" || m.role === "ai")
      .map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.content,
      }));

    // Call real backend API
    const response = await getTriageResponse(userMessage.content, chatHistory);

    setIsTyping(false);

    // Show error message in chat if something went wrong
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

    // Show the AI response (may be a fallback if error had content)
    const aiMessage: Message = {
      id: (Date.now() + 2).toString(),
      role: "ai",
      content: response.content,
      triageLevel: response.level,
      timestamp: new Date(),
      status: response.level === 2 ? "pending" : undefined,
    };

    setMessages((prev) => [...prev, aiMessage]);

    if (response.level === 3) {
      setIsLocked(true);
    }

    // Simulate doctor verification for Level 2
    if (response.level === 2) {
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessage.id ? { ...m, status: "verified" } : m
          )
        );
      }, 5000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentTriageLevel = [...messages]
    .reverse()
    .find((m) => m.triageLevel)?.triageLevel;

  // ----- Shared input card JSX (inlined, NOT a component) -----
  const inputCardJsx = (centered?: boolean) => (
    <div className={`w-full ${centered ? "max-w-xl" : "max-w-2xl"} mx-auto`}>
      {isLocked ? (
        <div className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-red-400/5 border border-red-400/20">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="font-mono text-xs text-red-400">
            System locked — Emergency Services have been alerted. Please go to the nearest hospital or emergency room. Do not wait. Time is critical.
          </span>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/50 bg-card transition-all focus-within:border-accent/30 focus-within:ring-1 focus-within:ring-accent/10 relative">
          {/* Textarea */}
          <div className="px-4 pt-4 pb-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={mode === "drugs" ? "Ask about a drug or pharmacology..." : "Type your symptoms, ask about a medication, or paste an image here..."}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted/40 focus:outline-none resize-none font-sans leading-relaxed min-h-20"
              disabled={isTyping}
              rows={3}
            />
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-3 py-2.5 border-t border-border/30">
            <div className="flex items-center gap-2">
              {/* Mode: Clinical Query */}
              <button
                onClick={() => setMode("triage")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === "triage"
                    ? "bg-accent/15 text-accent border border-accent/25"
                    : "text-muted hover:text-foreground hover:bg-border/20 border border-transparent"
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                Clinical Query
              </button>

              {/* Mode: Drug Research */}
              <button
                onClick={() => setMode("drugs")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === "drugs"
                    ? "bg-violet-500/15 text-violet-400 border border-violet-500/25"
                    : "text-muted hover:text-foreground hover:bg-border/20 border border-transparent"
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                Drug Research
              </button>

              {/* Separator */}
              <div className="w-px h-4 bg-border/40 mx-1" />

              {/* Model selector dropdown */}
              <div className="relative" ref={modelMenuRef}>
                <button
                  onClick={() => setModelMenuOpen(!modelMenuOpen)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-muted/70 hover:text-foreground hover:bg-border/20 transition-all"
                >
                  <span className="opacity-80">{selectedModel.logo}</span>
                  {selectedModel.name}
                  <ChevronDown className={`w-3 h-3 transition-transform ${modelMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {modelMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-60 rounded-xl border border-border/50 bg-card shadow-xl overflow-hidden animate-fade-in-up z-50">
                    <div className="px-3 py-2 border-b border-border/30">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted/50">Select model</p>
                    </div>
                    <div className="p-1.5 max-h-64 overflow-y-auto">
                      {MODEL_OPTIONS.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => { setSelectedModel(model); setModelMenuOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                            selectedModel.id === model.id
                              ? "bg-accent/10 text-accent"
                              : "text-muted hover:text-foreground hover:bg-border/20"
                          }`}
                        >
                          <span className={`shrink-0 ${selectedModel.id === model.id ? "text-accent" : "text-muted/60"}`}>
                            {model.logo}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{model.name}</p>
                            <p className="text-[10px] text-muted/50 font-mono">{model.provider}</p>
                          </div>
                          {selectedModel.id === model.id && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent ml-auto shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="p-2 rounded-xl bg-accent text-background disabled:opacity-20 disabled:cursor-not-allowed hover:bg-accent/90 transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <p className="font-mono text-[10px] text-muted/30 text-center mt-3">
        Agentic triage system for clinical decision support
      </p>
    </div>
  );

  // ----- NEW SESSION (no messages yet) -----
  if (!hasMessages) {
    return (
      <div className="h-screen bg-background text-foreground flex flex-col">
        {/* Header */}
        <div className="shrink-0 border-b border-border/30 bg-background">
          <Navbar alwaysVisible />
        </div>

        {/* Centered new-session layout */}
        <main className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-xl space-y-6 animate-fade-in-up">
            {/* Session header */}
            <div className="space-y-4">
              <h1 className="text-xl font-medium text-foreground/80">new session</h1>
              <div className="flex flex-col gap-2 text-xs text-muted/50 font-mono">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>clinical triage · graduated autonomy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Detail your symptoms, upload relevant medical images, or ask a clinical question.</span>
                </div>
              </div>
            </div>

            {/* Starter prompts */}
            <div className="flex flex-wrap gap-2">
              {[
                { text: "What are the standard symptoms of strep throat?", icon: Stethoscope },
                { text: "Analyze this image of a skin rash.", icon: Brain },
                { text: "How does this triage system keep my data safe?", icon: Activity },
              ].map((prompt) => (
                <button
                  key={prompt.text}
                  onClick={() => {
                    setInput(prompt.text);
                    textareaRef.current?.focus();
                  }}
                  className="group inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border/50 bg-card text-xs text-muted hover:text-foreground hover:border-accent/30 transition-all"
                >
                  <prompt.icon className="w-3.5 h-3.5 text-muted/50 group-hover:text-accent transition-colors shrink-0" />
                  <span className="font-mono text-[11px] leading-snug">{prompt.text}</span>
                </button>
              ))}
            </div>

            {/* Input card */}
            {inputCardJsx(true)}
          </div>
        </main>
      </div>
    );
  }

  // ----- ACTIVE CONVERSATION -----
  return (
    <div className="h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border/30 bg-background">
        <Navbar alwaysVisible />
      </div>

      {/* Chat Title */}
      <div className="flex items-center justify-center px-6 py-2.5 border-b border-border/50 shrink-0 bg-background">
        <h2 className="font-mono text-xs text-muted/70 truncate">Untitled Conversation</h2>
      </div>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="animate-fade-in-up">
              {/* System message */}
              {message.role === "system" && (
                <div className="flex justify-center">
                  <div className="px-4 py-3 rounded-xl bg-card border border-border/50 max-w-md text-center">
                    <p className="text-xs text-muted leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              )}

              {/* Error message */}
              {message.role === "error" && (
                <div className="flex justify-center">
                  <div className="px-4 py-3 rounded-xl bg-red-400/5 border border-red-400/20 max-w-md w-full">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        {message.errorType === "api_offline" && (
                          <div className="w-8 h-8 rounded-lg bg-red-400/10 flex items-center justify-center">
                            <WifiOff className="w-4 h-4 text-red-400" />
                          </div>
                        )}
                        {message.errorType === "timeout" && (
                          <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                            <Timer className="w-4 h-4 text-amber-400" />
                          </div>
                        )}
                        {message.errorType === "api_error" && (
                          <div className="w-8 h-8 rounded-lg bg-red-400/10 flex items-center justify-center">
                            <ServerCrash className="w-4 h-4 text-red-400" />
                          </div>
                        )}
                        {message.errorType === "empty_response" && (
                          <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                            <CircleAlert className="w-4 h-4 text-amber-400" />
                          </div>
                        )}
                        {message.errorType === "unknown" && (
                          <div className="w-8 h-8 rounded-lg bg-red-400/10 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-red-400/80 mb-1">
                          {message.errorType === "api_offline"
                            ? "Connection Failed"
                            : message.errorType === "timeout"
                              ? "Request Timed Out"
                              : message.errorType === "empty_response"
                                ? "Empty Response"
                                : message.errorType === "api_error"
                                  ? "Server Error"
                                  : "Error"}
                        </p>
                        <p className="text-xs text-muted leading-relaxed">
                          {message.content}
                        </p>
                        <button
                          onClick={() => {
                            const lastUserMsg = [...messages]
                              .reverse()
                              .find((m) => m.role === "user");
                            if (lastUserMsg) {
                              setInput(lastUserMsg.content);
                              textareaRef.current?.focus();
                            }
                          }}
                          className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-card border border-border/50 font-mono text-[10px] text-muted hover:text-foreground hover:border-accent/30 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Retry
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* User message */}
              {message.role === "user" && (
                <div className="flex justify-end">
                  <div className="max-w-md">
                    <div className="px-4 py-3 rounded-2xl rounded-br-sm bg-accent/10 border border-accent/20">
                      <p className="text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                    <p className="font-mono text-[10px] text-muted/40 mt-1.5 text-right">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* AI message */}
              {message.role === "ai" && message.triageLevel && (
                <div className="flex justify-start">
                  <div className="max-w-lg">
                    {/* Triage badge */}
                    <div
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md mb-2 text-[10px] font-mono ${TRIAGE_CONFIG[message.triageLevel].bg} ${TRIAGE_CONFIG[message.triageLevel].color} ${TRIAGE_CONFIG[message.triageLevel].border} border`}
                    >
                      {(() => {
                        const Icon =
                          TRIAGE_CONFIG[message.triageLevel].icon;
                        return <Icon className="w-3 h-3" />;
                      })()}
                      Level {message.triageLevel}
                    </div>

                    <div
                      className={`px-4 py-3 rounded-2xl rounded-bl-sm border ${
                        message.triageLevel === 3
                          ? "bg-red-400/5 border-red-400/20"
                          : "bg-card border-border/50"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {message.content}
                      </p>

                      {/* Doctor verification status for Level 2 */}
                      {message.triageLevel === 2 && message.status && (
                        <div
                          className={`mt-3 pt-3 border-t ${
                            message.status === "verified"
                              ? "border-emerald-400/20"
                              : message.status === "rejected"
                                ? "border-red-400/20"
                                : "border-border/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 font-mono text-xs">
                            {message.status === "pending" && (
                              <>
                                <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                                <span className="text-amber-400">
                                  Pending doctor verification...
                                </span>
                              </>
                            )}
                            {message.status === "verified" && (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">
                                  Verified by Dr. Patel — Prescription
                                  approved
                                </span>
                              </>
                            )}
                            {message.status === "rejected" && (
                              <>
                                <XCircle className="w-3 h-3 text-red-400" />
                                <span className="text-red-400">
                                  Rejected — Doctor requests follow-up
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <p className="font-mono text-[10px] text-muted/40 mt-1.5">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-card border border-border/50">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted mr-1">Analyzing</span>
                  <span className="typing-dot w-1 h-1 rounded-full bg-accent" />
                  <span className="typing-dot w-1 h-1 rounded-full bg-accent" />
                  <span className="typing-dot w-1 h-1 rounded-full bg-accent" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input — bottom docked */}
      <div className="shrink-0 border-t border-border/50 px-6 py-4 bg-background">
        {inputCardJsx()}
      </div>
    </div>
  );
}
