"use client";

import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { Navbar } from "../components/Navbar";

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
  return "⚠️ EMERGENCY DETECTED — This system is now locked for your safety.\n\nYour symptoms suggest a potentially life-threatening condition. Please call emergency services (911) immediately or proceed to the nearest emergency room.\n\nDo not wait. Time is critical.";
}

interface RagOutput {
  probable_diagnosis: string;
  differentials: string[];
  recommended_actions: string[];
  citations: string[];
  confidence: number;
  sources_retrieved: number;
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
  triage_level: TriageLevel;
}

async function getTriageResponse(
  text: string
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
      body: JSON.stringify({ text }),
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

    // Level 2: format RAG output from backend
    if (data.triage_level === 2) {
      const content = data.rag_output
        ? formatRagOutput(data.rag_output)
        : data.companion_output || "Clinical assessment pending — awaiting RAG pipeline response.";
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content:
        "Welcome to MedTriage AI. Describe your symptoms or health concern and the system will determine the appropriate level of autonomy for your case.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [mode, setMode] = useState<"triage" | "drugs">("triage");
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const modeMenuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target as Node)) {
        setModeMenuOpen(false);
      }
    }
    if (modeMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [modeMenuOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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

    // Call real backend API
    const response = await getTriageResponse(userMessage.content);

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

  const currentTriageLevel = [...messages]
    .reverse()
    .find((m) => m.triageLevel)?.triageLevel;

  return (
    <div className="h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border/30 bg-background">
        <Navbar alwaysVisible />
      </div>

      {/* Triage Level Indicator */}
      {currentTriageLevel && (
        <div className="flex justify-center px-6 py-2 border-b border-border/50 shrink-0 bg-background">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${TRIAGE_CONFIG[currentTriageLevel].border} ${TRIAGE_CONFIG[currentTriageLevel].bg} font-mono text-xs ${TRIAGE_CONFIG[currentTriageLevel].color}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${TRIAGE_CONFIG[currentTriageLevel].dot} ${currentTriageLevel === 3 ? "animate-pulse" : ""}`}
            />
            {TRIAGE_CONFIG[currentTriageLevel].label}
          </div>
        </div>
      )}

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
                              inputRef.current?.focus();
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

      {/* Input */}
      <div className="shrink-0 border-t border-border/50 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          {isLocked ? (
            <div className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-red-400/5 border border-red-400/20">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="font-mono text-xs text-red-400">
                System locked — Please contact emergency services immediately
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Mode selector */}
              <div className="relative" ref={modeMenuRef}>
                <button
                  onClick={() => setModeMenuOpen(!modeMenuOpen)}
                  className={`p-3 rounded-xl border transition-all shrink-0 ${
                    mode === "drugs"
                      ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
                      : "bg-card border-border/50 text-muted hover:text-foreground"
                  }`}
                  title="Select mode"
                >
                  {mode === "drugs" ? (
                    <Pill className="w-4 h-4" />
                  ) : (
                    <Stethoscope className="w-4 h-4" />
                  )}
                </button>

                {modeMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-52 rounded-xl border border-border/50 bg-card shadow-lg overflow-hidden animate-fade-in-up z-50">
                    <div className="p-1.5">
                      <button
                        onClick={() => { setMode("triage"); setModeMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                          mode === "triage"
                            ? "bg-accent/10 text-accent"
                            : "text-muted hover:text-foreground hover:bg-border/20"
                        }`}
                      >
                        <Stethoscope className="w-4 h-4 shrink-0" />
                        <div>
                          <p className="text-xs font-medium">Triage</p>
                          <p className="text-[10px] text-muted/60 font-mono">Clinical decision support</p>
                        </div>
                      </button>
                      <button
                        onClick={() => { setMode("drugs"); setModeMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                          mode === "drugs"
                            ? "bg-violet-500/10 text-violet-400"
                            : "text-muted hover:text-foreground hover:bg-border/20"
                        }`}
                      >
                        <Pill className="w-4 h-4 shrink-0" />
                        <div>
                          <p className="text-xs font-medium">Drugs</p>
                          <p className="text-[10px] text-muted/60 font-mono">Pharmacology assistant</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={mode === "drugs" ? "Ask about a drug or pharmacology..." : "Describe your symptoms..."}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/10 transition-all font-sans"
                  disabled={isTyping}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-3 rounded-xl bg-accent text-background disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent/90 transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}

          <p className="font-mono text-[10px] text-muted/30 text-center mt-3">
            AI-assisted triage — not a substitute for professional medical
            advice
          </p>
        </div>
      </div>
    </div>
  );
}
