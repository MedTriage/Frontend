"use client";

import {
  Brain,
  Activity,
  AlertTriangle,
  FileSearch,
  ClipboardList,
  UserCheck,
  Siren,
  Workflow,
  Github,
  ExternalLink,
  Heart,
  Scale,
  Eye,
  BookOpen,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

const techStack = [
  { name: "Next.js 16", category: "Framework" },
  { name: "React 19", category: "UI" },
  { name: "TypeScript", category: "Language" },
  { name: "Tailwind CSS 4", category: "Styling" },
  { name: "Space Grotesk", category: "Display Font" },
  { name: "Space Mono", category: "Mono Font" },
  { name: "Lucide Icons", category: "Iconography" },
];

const agentDetails = [
  {
    name: "Triage Classifier",
    icon: FileSearch,
    role: "Classification & Routing",
    description:
      "Performs the initial analysis on every patient input. Uses natural language processing and symptom severity scoring matrices to classify queries into Level 1 (informational), Level 2 (prescriptive), or Level 3 (emergency). Considers keyword severity, symptom combinations, temporal urgency markers, and patient history context.",
    responsibilities: [
      "Symptom extraction and normalization",
      "Severity scoring against clinical rubrics",
      "Multi-signal classification (keywords, context, history)",
      "Confidence scoring and edge-case escalation",
    ],
  },
  {
    name: "Knowledge Agent",
    icon: Brain,
    role: "Level 1 — Information Delivery",
    description:
      "Handles all Level 1 classified queries. Retrieves evidence-based health information from curated medical knowledge bases using retrieval-augmented generation (RAG). Generates clear, patient-friendly responses grounded in clinical literature while avoiding diagnostic language or treatment recommendations.",
    responsibilities: [
      "Medical knowledge base retrieval (RAG)",
      "Patient-friendly response generation",
      "Citation and source attribution",
      "Boundary enforcement (no prescriptive advice)",
    ],
  },
  {
    name: "Prescription Agent",
    icon: ClipboardList,
    role: "Level 2 — Treatment Drafting",
    description:
      "Activated exclusively for Level 2 cases. Generates preliminary treatment plans and prescription drafts based on symptom analysis, patient-reported history, and clinical guidelines. Performs drug interaction checks and contraindication screening. All outputs are marked as drafts pending physician verification.",
    responsibilities: [
      "Preliminary treatment plan generation",
      "Drug interaction and allergy screening",
      "Dosage calculation based on patient parameters",
      "Draft prescription formatting",
    ],
  },
  {
    name: "Verification Router",
    icon: UserCheck,
    role: "Human-in-the-Loop Bridge",
    description:
      "Bridges the AI pipeline and human oversight layer. When a Level 2 prescription draft is ready, this agent routes it to the next available physician in the verification queue. Tracks review status, handles timeouts, and relays the approved (or rejected) treatment back to the patient with full transparency.",
    responsibilities: [
      "Physician queue management and load balancing",
      "Verification status tracking and notifications",
      "Timeout handling and escalation protocols",
      "Approval/rejection relay to patient interface",
    ],
  },
  {
    name: "Emergency Agent",
    icon: Siren,
    role: "Level 3 — Safety Lock & ER Routing",
    description:
      "The ultimate safety mechanism. When the Triage Classifier outputs a Level 3 classification, this agent immediately takes over. It locks the AI system (preventing further response generation), displays emergency service contact information, and provides nearest ER routing data. The lock is irreversible within the current session.",
    responsibilities: [
      "Immediate system lockdown on L3 trigger",
      "Emergency services information display (911/local)",
      "Nearest ER geolocation and routing",
      "Session lock enforcement (no AI override)",
    ],
  },
  {
    name: "Orchestrator",
    icon: Workflow,
    role: "Pipeline Conductor & State Manager",
    description:
      "The central coordinator that manages the entire multi-agent pipeline. Maintains conversation state across multi-turn interactions, handles level transitions (escalation and de-escalation), coordinates agent handoffs, and ensures system coherence. Also manages error recovery and graceful degradation.",
    responsibilities: [
      "Multi-agent coordination and sequencing",
      "Conversation state management",
      "Level escalation/de-escalation logic",
      "Error recovery and fallback orchestration",
    ],
  },
];

const ethicalPrinciples = [
  {
    icon: Scale,
    title: "Non-Maleficence",
    description:
      "The system is designed to never cause harm. When uncertainty exists, it escalates rather than guesses. Level 3 lockdown ensures no AI-generated advice is given in life-threatening scenarios.",
  },
  {
    icon: Eye,
    title: "Transparency",
    description:
      "Every response is tagged with its triage level. Patients always know whether they're receiving direct AI guidance, a doctor-verified prescription, or an emergency redirect. No hidden automation.",
  },
  {
    icon: UserCheck,
    title: "Human Oversight",
    description:
      "Prescriptive decisions always pass through a licensed physician. The AI accelerates and assists — but the final clinical judgment always rests with a human doctor.",
  },
  {
    icon: Heart,
    title: "Patient Autonomy",
    description:
      "Patients retain full agency. The system provides information and recommendations, but all final health decisions are made by the patient in consultation with their healthcare providers.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Nav */}
      <Navbar />

      {/* Hero */}
      <section className="px-6 pt-24 pb-16">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <p className="font-mono text-xs text-accent uppercase tracking-widest">
            About MedTriage AI
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.1]">
            Building safer clinical AI through{" "}
            <span className="text-accent">graduated autonomy</span>
          </h1>
          <p className="text-muted text-base max-w-2xl mx-auto leading-relaxed">
            MedTriage AI is a research prototype exploring how multi-agent
            systems can provide medical triage while maintaining appropriate
            levels of human oversight proportional to clinical risk.
          </p>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="px-6 py-16 border-t border-border/50">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-border/50 bg-card">
              <p className="font-mono text-[10px] text-red-400 uppercase tracking-widest mb-3">
                The Problem
              </p>
              <h3 className="font-semibold text-base mb-3">
                One-size-fits-all AI
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Most medical AI systems either give full autonomy (risking
                unsafe advice for serious conditions) or require human
                verification for everything (creating bottlenecks for simple
                queries). Neither approach scales safely.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-accent/20 bg-accent/5">
              <p className="font-mono text-[10px] text-accent uppercase tracking-widest mb-3">
                Our Approach
              </p>
              <h3 className="font-semibold text-base mb-3">
                Graduated autonomy
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                AI autonomy is inversely proportional to clinical risk. Simple
                health queries get instant answers. Treatment decisions require
                doctor sign-off. Emergencies lock the AI entirely. The right
                level of oversight for every situation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Agent Breakdown */}
      <section className="px-6 py-16 border-t border-border/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono text-xs text-accent uppercase tracking-widest mb-3">
              Agent Architecture
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Deep Dive: The Six Agents
            </h2>
            <p className="text-muted text-sm mt-3 max-w-lg mx-auto leading-relaxed">
              A detailed look at each specialized agent in the pipeline, its
              role, and its core responsibilities.
            </p>
          </div>

          <div className="space-y-4">
            {agentDetails.map((agent, i) => (
              <details
                key={agent.name}
                className="group rounded-xl border border-border/50 bg-card overflow-hidden"
              >
                <summary className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-border/10 transition-colors list-none">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <agent.icon className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{agent.name}</h3>
                      <span className="font-mono text-[10px] text-muted/60">
                        {agent.role}
                      </span>
                    </div>
                  </div>
                  <span className="text-muted/40 group-open:rotate-180 transition-transform text-xs">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-5 pt-2 border-t border-border/30">
                  <p className="text-sm text-muted leading-relaxed mb-4">
                    {agent.description}
                  </p>
                  <p className="font-mono text-[10px] text-muted/50 uppercase tracking-widest mb-2">
                    Core Responsibilities
                  </p>
                  <ul className="space-y-1.5">
                    {agent.responsibilities.map((r) => (
                      <li
                        key={r}
                        className="flex items-start gap-2 text-xs text-muted"
                      >
                        <span className="w-1 h-1 rounded-full bg-accent mt-1.5 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Ethical Framework */}
      <section className="px-6 py-16 border-t border-border/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono text-xs text-accent uppercase tracking-widest mb-3">
              Ethics
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Ethical Framework
            </h2>
            <p className="text-muted text-sm mt-3 max-w-lg mx-auto leading-relaxed">
              The principles guiding every design decision in the system.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ethicalPrinciples.map((p) => (
              <div
                key={p.title}
                className="p-6 rounded-xl border border-border/50 bg-card"
              >
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <p.icon className="w-4 h-4 text-accent" />
                </div>
                <h3 className="font-semibold text-sm mb-2">{p.title}</h3>
                <p className="text-xs text-muted leading-relaxed">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Level Comparison Table */}
      <section className="px-6 py-16 border-t border-border/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-mono text-xs text-accent uppercase tracking-widest mb-3">
              Comparison
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Level Breakdown
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted/60">
                    Property
                  </th>
                  <th className="text-center py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-emerald-400">
                    Level 1
                  </th>
                  <th className="text-center py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-amber-400">
                    Level 2
                  </th>
                  <th className="text-center py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-red-400">
                    Level 3
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {[
                  ["AI Autonomy", "Full", "Partial", "None"],
                  ["Doctor Required", "No", "Yes", "N/A (ER)"],
                  ["Response Type", "Information", "Prescription", "Redirect"],
                  ["System Lock", "No", "No", "Yes"],
                  ["Avg. Response", "<2s", "~5min*", "Instant"],
                  ["Risk Level", "Low", "Medium", "Critical"],
                ].map(([prop, l1, l2, l3]) => (
                  <tr key={prop} className="border-b border-border/30">
                    <td className="py-2.5 px-4 text-muted">{prop}</td>
                    <td className="py-2.5 px-4 text-center text-foreground/80">
                      {l1}
                    </td>
                    <td className="py-2.5 px-4 text-center text-foreground/80">
                      {l2}
                    </td>
                    <td className="py-2.5 px-4 text-center text-foreground/80">
                      {l3}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="font-mono text-[10px] text-muted/40 mt-2">
              * Level 2 response time depends on physician verification queue
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="px-6 py-16 border-t border-border/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-mono text-xs text-accent uppercase tracking-widest mb-3">
              Built With
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Tech Stack
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((t) => (
              <div
                key={t.name}
                className="px-4 py-2.5 rounded-xl border border-border/50 bg-card"
              >
                <p className="text-sm font-medium">{t.name}</p>
                <p className="font-mono text-[10px] text-muted/60">
                  {t.category}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-6 py-16 border-t border-border/50">
        <div className="max-w-2xl mx-auto">
          <div className="p-6 rounded-xl border border-amber-400/20 bg-amber-400/5">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm text-amber-400 mb-2">
                  Important Disclaimer
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  MedTriage AI is a research prototype and demonstration
                  system. It is <strong>not</strong> a certified medical device
                  and should <strong>not</strong> be used for actual medical
                  decisions. The simulated responses are for illustrative
                  purposes only. Always consult a qualified healthcare
                  professional for medical advice, diagnosis, or treatment. In
                  case of a medical emergency, call your local emergency
                  services immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
