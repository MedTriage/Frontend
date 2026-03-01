"use client";

import Link from "next/link";
import {
  Shield,
  ArrowRight,
  Activity,
  Brain,
  AlertTriangle,
  Stethoscope,
  Bot,
  UserCheck,
  FileSearch,
  ClipboardList,
  Lock,
  Phone,
  Zap,
  ShieldCheck,
  ArrowDown,
  Workflow,
  HeartPulse,
  Pill,
  Siren,
} from "lucide-react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

/* ─── Data ─── */

const levels = [
  {
    level: 1,
    label: "Direct Response",
    tagline: "Informational Autonomy",
    description:
      "The system answers general health queries directly. No prescriptions, no escalation — just reliable, AI-generated guidance based on current medical literature.",
    examples: [
      "What are the symptoms of seasonal allergies?",
      "How much water should I drink daily?",
      "Is it normal to feel tired after a flu?",
    ],
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    icon: Brain,
    dot: "bg-emerald-400",
  },
  {
    level: 2,
    label: "Doctor Verification",
    tagline: "Supervised Autonomy",
    description:
      "When symptoms suggest a condition requiring treatment, the AI drafts a preliminary assessment and prescription — but it must be verified by a licensed physician before reaching the patient.",
    examples: [
      "I've had a persistent cough and fever for 3 days",
      "I think I need antibiotics for a UTI",
      "My child has an ear infection",
    ],
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    icon: Activity,
    dot: "bg-amber-400",
  },
  {
    level: 3,
    label: "Emergency Redirect",
    tagline: "Zero Autonomy — Safety Lock",
    description:
      "If the system detects life-threatening symptoms, it immediately locks itself and directs the patient to emergency services. No AI-generated advice is given — only redirection to professional care.",
    examples: [
      "I'm having severe chest pain and can't breathe",
      "Someone is having a seizure",
      "Heavy uncontrolled bleeding",
    ],
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    icon: AlertTriangle,
    dot: "bg-red-400",
  },
];

const agents = [
  {
    name: "Triage Classifier",
    description:
      "The gatekeeper. Analyzes incoming patient queries using NLP and symptom severity scoring to classify them into Level 1, 2, or 3. Runs first on every interaction.",
    icon: FileSearch,
    tags: ["NLP", "Classification", "Severity Scoring"],
  },
  {
    name: "Knowledge Agent",
    description:
      "Handles Level 1 queries. Retrieves evidence-based health information from curated medical databases and generates clear, patient-friendly responses.",
    icon: Brain,
    tags: ["RAG", "Medical KB", "Level 1"],
  },
  {
    name: "Prescription Agent",
    description:
      "Activated for Level 2 cases. Generates preliminary treatment plans and prescription drafts based on symptom analysis, patient history, and clinical guidelines.",
    icon: ClipboardList,
    tags: ["Treatment Plans", "Drug Interactions", "Level 2"],
  },
  {
    name: "Verification Router",
    description:
      "Bridges AI and human oversight. Routes Level 2 prescriptions to available physicians, tracks verification status, and relays approved treatments back to the patient.",
    icon: UserCheck,
    tags: ["Human-in-the-Loop", "Doctor Queue", "Approval"],
  },
  {
    name: "Emergency Agent",
    description:
      "The safety net. Triggers on Level 3 classifications to immediately lock the system, suppress AI responses, and display emergency contact information and nearest ER routing.",
    icon: Siren,
    tags: ["Safety Lock", "ER Routing", "Level 3"],
  },
  {
    name: "Orchestrator",
    description:
      "The conductor. Coordinates all agents, manages conversation state, handles escalation/de-escalation between levels, and ensures system coherence across multi-turn interactions.",
    icon: Workflow,
    tags: ["State Management", "Multi-Agent", "Coordination"],
  },
];

const workflow = [
  {
    step: 1,
    title: "Patient Input",
    description: "User describes symptoms or asks a health question through the chat interface.",
    icon: Stethoscope,
  },
  {
    step: 2,
    title: "Triage Classification",
    description: "The Triage Classifier agent analyzes the input and assigns a severity level (1–3).",
    icon: FileSearch,
  },
  {
    step: 3,
    title: "Agent Routing",
    description: "The Orchestrator routes to the appropriate agent based on the classified level.",
    icon: Workflow,
  },
  {
    step: 4,
    title: "Response Generation",
    description: "The assigned agent generates a response — information, prescription draft, or emergency redirect.",
    icon: Bot,
  },
  {
    step: 5,
    title: "Verification (if needed)",
    description: "Level 2 responses are held and sent for doctor verification before delivery.",
    icon: UserCheck,
  },
  {
    step: 6,
    title: "Patient Delivery",
    description: "The verified (or direct) response is delivered to the patient with full transparency on the triage level.",
    icon: ShieldCheck,
  },
];

const stats = [
  { value: "3", label: "Autonomy Levels" },
  { value: "6", label: "Specialized Agents" },
  { value: "<2s", label: "Avg. Triage Time" },
  { value: "100%", label: "L3 Lock Rate" },
];

/* ─── Component ─── */

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ─── Nav ─── */}
      <Navbar />

      {/* ─── Hero ─── */}
      <section className="flex flex-col items-center justify-center px-6 pt-28 pb-20">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card font-mono text-xs text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Graduated Autonomy Architecture
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1]">
            Clinical decisions,{" "}
            <span className="text-accent">graduated</span> with care
          </h1>

          <p className="text-muted text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            A multi-agent AI triage system that adapts its level of autonomy
            to the severity of your condition — from instant guidance to
            physician-verified prescriptions to emergency lockdown.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/chat"
              className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-accent text-background font-medium text-sm transition-all hover:bg-accent/90 hover:gap-3.5"
            >
              Start Consultation
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-muted font-medium text-sm transition-all hover:border-accent/40 hover:text-foreground"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl w-full">
          {stats.map((s) => (
            <div
              key={s.label}
              className="text-center p-4 rounded-xl border border-border/50 bg-card"
            >
              <p className="text-2xl font-semibold text-accent font-mono">
                {s.value}
              </p>
              <p className="text-xs text-muted mt-1 font-mono">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 animate-bounce">
          <ArrowDown className="w-4 h-4 text-muted/40" />
        </div>
      </section>

      {/* ─── Autonomy Levels (detailed) ─── */}
      <section className="px-6 py-20 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono text-xs text-accent uppercase tracking-widest mb-3">
              Core Framework
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Three Levels of Autonomy
            </h2>
            <p className="text-muted text-sm mt-3 max-w-lg mx-auto leading-relaxed">
              Each patient interaction is classified into one of three levels.
              The higher the level, the less autonomy the AI has — and the more
              human oversight is required.
            </p>
          </div>

          <div className="space-y-6">
            {levels.map((l) => (
              <div
                key={l.level}
                className={`p-6 sm:p-8 rounded-2xl border ${l.border} ${l.bg} transition-all hover:scale-[1.005]`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                  <div className="shrink-0">
                    <div
                      className={`w-12 h-12 rounded-xl ${l.bg} border ${l.border} flex items-center justify-center`}
                    >
                      <l.icon className={`w-5 h-5 ${l.color}`} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-xs text-muted/70">
                        Level {l.level}
                      </span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${l.dot}`}
                      />
                      <span className={`font-mono text-xs ${l.color}`}>
                        {l.tagline}
                      </span>
                    </div>
                    <h3
                      className={`text-lg font-semibold ${l.color} mb-2`}
                    >
                      {l.label}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed mb-4">
                      {l.description}
                    </p>
                    <div>
                      <p className="font-mono text-[10px] text-muted/50 uppercase tracking-widest mb-2">
                        Example Queries
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {l.examples.map((ex) => (
                          <span
                            key={ex}
                            className="px-2.5 py-1 rounded-lg bg-background/50 border border-border/50 text-xs text-muted font-mono"
                          >
                            &quot;{ex}&quot;
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Agents ─── */}
      <section className="px-6 py-20 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono text-xs text-accent uppercase tracking-widest mb-3">
              Architecture
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Specialized Agents
            </h2>
            <p className="text-muted text-sm mt-3 max-w-lg mx-auto leading-relaxed">
              Six purpose-built agents work together in a coordinated pipeline.
              Each agent has a specific role in the triage-to-delivery workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {agents.map((a) => (
              <div
                key={a.name}
                className="group p-5 rounded-xl border border-border/50 bg-card hover:border-accent/20 transition-all animate-fade-in"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <a.icon className="w-4 h-4 text-accent" />
                  </div>
                  <h3 className="font-semibold text-sm">{a.name}</h3>
                </div>
                <p className="text-xs text-muted leading-relaxed mb-3">
                  {a.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {a.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-border/30 text-[10px] font-mono text-muted/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Workflow ─── */}
      <section className="px-6 py-20 border-t border-border/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono text-xs text-accent uppercase tracking-widest mb-3">
              Pipeline
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              How It Works
            </h2>
            <p className="text-muted text-sm mt-3 max-w-lg mx-auto leading-relaxed">
              From symptom input to verified response — a six-step pipeline
              that ensures safety at every stage.
            </p>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border/50 hidden sm:block" />

            <div className="space-y-6">
              {workflow.map((w, i) => (
                <div key={w.step} className="flex items-start gap-5">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-xl border border-border/50 bg-card flex items-center justify-center z-10 relative">
                      <w.icon className="w-4 h-4 text-accent" />
                    </div>
                  </div>
                  <div className="pt-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] text-muted/50">
                        Step {w.step}
                      </span>
                      {i === 4 && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-400/10 text-amber-400 border border-amber-400/20">
                          Conditional
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm mb-1">
                      {w.title}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed">
                      {w.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Key Principles ─── */}
      <section className="px-6 py-20 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono text-xs text-accent uppercase tracking-widest mb-3">
              Philosophy
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Design Principles
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: Lock,
                title: "Safety First",
                desc: "The system errs on the side of caution. When in doubt, it escalates — never downplays. Level 3 lockdown is instant and irreversible within a session.",
              },
              {
                icon: Zap,
                title: "Graduated Autonomy",
                desc: "AI autonomy scales inversely with severity. Low-risk queries get instant AI answers; high-risk cases get full human oversight or immediate ER referral.",
              },
              {
                icon: UserCheck,
                title: "Human in the Loop",
                desc: "No prescription leaves the system without a doctor's sign-off. The AI assists and accelerates — but never replaces — clinical judgment.",
              },
              {
                icon: ShieldCheck,
                title: "Transparent Triage",
                desc: "Every response is tagged with its autonomy level. Patients always know whether they're receiving AI guidance, doctor-verified treatment, or an emergency redirect.",
              },
            ].map((p) => (
              <div
                key={p.title}
                className="p-6 rounded-xl border border-border/50 bg-card"
              >
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <p.icon className="w-4 h-4 text-accent" />
                </div>
                <h3 className="font-semibold text-sm mb-2">{p.title}</h3>
                <p className="text-xs text-muted leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-6 py-20 border-t border-border/50">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
            <HeartPulse className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Ready to try it?
          </h2>
          <p className="text-muted text-sm leading-relaxed">
            Start a consultation and see the graduated autonomy system in
            action. The AI will classify your query in real-time and route it
            through the appropriate pipeline.
          </p>
          <Link
            href="/chat"
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-accent text-background font-medium text-sm transition-all hover:bg-accent/90 hover:gap-3.5"
          >
            Open Console
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <Footer />
    </div>
  );
}
