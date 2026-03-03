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
      "When symptoms suggest a condition requiring treatment, the Agents draft a preliminary assessment and prescription — which is then verified by a licensed physician before reaching the patient.",
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
      "If the system detects life-threatening symptoms, it immediately locks itself and directs the patient to emergency services. The Agents notify the local authorities and redirects the patient to professional care.",
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
    name: "Intent Router",
    description:
      "The gatekeeper. Analyzes incoming patient queries and classifies into three categories - clinical reasoning, multimodal image analysis, and conversational engagement. Runs first on every interaction.",
    icon: FileSearch,
    tags: ["Zero Shot Detection", "Classification", "Semantic Routing"],
  },
  {
    name: "Vision Agent",
    description:
      "Handles multimodal image analysis and interpretation, working alonside the RAG Agent to ensure all visual symptoms are cross-referenced with verified medical literature.",
    icon: Brain,
    tags: ["Multimodal Analysis", "Image Interpretation", "Feature Extraction"],
  },
  {
    name: "RAG Agent",
    description:
      "Leverages semantic search across a curated vector database to retrieve verified clinical evidence, ensuring all diagnostic insights and prescription drafts are strictly anchored in established medical science.",
    icon: ClipboardList,
    tags: ["Treatment Plans", "Drug Interactions", "Evidence-Based"],
  },
  {
    name: "The Critique",
    description:
      "Acts as the system's clinical safeguard by cross-examining generated drafts. Any unsupported claims or hallucinations are instantly flagged and quarantined for autonomous re-evaluation and iterative self-correction.",
    icon: UserCheck,
    tags: ["Agentic RAG", "Hallucination Detection", "Approval Gatekeeper"],
  },
  {
    name: "Guardian Agent",
    description:
      "Enforces the Graduated Autonomy protocol. By evaluating the clinical risk of the generated draft, it deterministically routes Level 1 responses to the patient while escalating Level 2 and 3 cases for mandatory human oversight.",
    icon: Siren,
    tags: ["Safety Lock", "Graduated Autonomy Enforcer"],
  },
  {
    name: "The Conversator",
    description:
      "Handles empathetic daily discourse and non-clinical interactions, maintaining a natural dialogue state without triggering complex protocols.",
    icon: Workflow,
    tags: ["Routine Dicourse", "Conversationist", "Patient Engagement"],
  },
];

const workflow = [
  {
    step: 1,
    title: "Patient Input",
    description:
      "User describes symptoms or asks a health question through the chat interface.",
    icon: Stethoscope,
  },
  {
    step: 2,
    title: "Intent Classification",
    description:
      "The Intent Router analyzes the input and assigns it to the specific agent depending on the type of input.",
    icon: FileSearch,
  },
  {
    step: 3,
    title: "Retrieval & Drafting",
    description:
      "The Vision Agent and RAG Agent work together to analyze any images and retrieve relevant medical literature, generating a preliminary response draft.",
    icon: Workflow,
  },
  {
    step: 4,
    title: "Critique & Triage",
    description:
      "The Critique evaluates the draft for accuracy and safety. The Guardian Agent then classifies the response into one of three autonomy levels, determining the delivery pathway.",
    icon: Bot,
  },
  {
    step: 5,
    title: "Verification (if needed)",
    description:
      "Level 2 responses are held and sent for doctor verification before delivery. Triggers an immediate system deadlock on Level 3 cases, routing alerts to medical authorities.",
    icon: UserCheck,
  },
  {
    step: 6,
    title: "Patient Delivery",
    description:
      "The verified (or direct) response is delivered to the patient with full transparency on the triage level. For Level 3 cases, the patient receives an emergency redirect with instructions to seek immediate care.",
    icon: ShieldCheck,
  },
];

const stats = [
  { value: "3", label: "Autonomy Levels" },
  { value: "6", label: "Specialized Agents" },
  { value: "0%", label: "Uncited Claims" },
  { value: "100%", label: "Human in the Loop" },
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
            Clinical decisions, <span className="text-accent">graduated</span>{" "}
            with care
          </h1>

          <p className="text-muted text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            A multi-agent AI triage system that adapts its level of autonomy to
            the severity of your condition — from instant guidance to
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
              The architecture enforces a strict Graduated Autonomy protocol
              across three levels. There is an intentional, inverse relationship
              between medical risk and AI freedom—the higher the stakes, the
              tighter the human oversight.
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
                      <span className={`w-1.5 h-1.5 rounded-full ${l.dot}`} />
                      <span className={`font-mono text-xs ${l.color}`}>
                        {l.tagline}
                      </span>
                    </div>
                    <h3 className={`text-lg font-semibold ${l.color} mb-2`}>
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
              From symptom input to verified response — a six-step pipeline that
              ensures safety at every stage.
            </p>
          </div>

          <div className="relative">
            <div className="space-y-0">
              {workflow.map((w, i) => (
                <div key={w.step} className="workflow-step">
                  <div className="flex items-start gap-5 py-3">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-xl border border-border/50 bg-card flex items-center justify-center z-10 relative workflow-icon-active">
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
                      <h3 className="font-semibold text-sm mb-1">{w.title}</h3>
                      <p className="text-xs text-muted leading-relaxed">
                        {w.description}
                      </p>
                    </div>
                  </div>

                  {/* Animated connector line between steps */}
                  {i < workflow.length - 1 && (
                    <div className="flex items-start gap-5">
                      <div className="shrink-0 flex justify-center w-12">
                        <div className="workflow-connector" />
                      </div>
                    </div>
                  )}
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
                desc: "Agentic autonomy scales inversely with severity. Low-risk queries get instant AI answers; high-risk cases get full human oversight or immediate ER referral.",
              },
              {
                icon: UserCheck,
                title: "Human in the Loop",
                desc: "No prescription leaves the system without a doctor's sign-off. The Agents assist and accelerate — but never replace — clinical judgment.",
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
                <p className="text-xs text-muted leading-relaxed">{p.desc}</p>
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
