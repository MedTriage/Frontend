import { NextRequest, NextResponse } from "next/server";

// ─── In-memory store for Level-2 doctor review cases ───
// In production this would be backed by a database.

export interface ChatMessage {
  role: "user" | "ai";
  content: string;
  triageLevel?: 1 | 2 | 3;
  timestamp: string;
}

export interface DoctorCase {
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
    ragOutput?: {
      probable_diagnosis: string;
      differentials: string[];
      recommended_actions: string[];
      citations: string[];
      confidence: number;
      sources_retrieved: number;
    } | null;
    criticOutput?: {
      response: string;
      is_supported: boolean;
      issues: string[];
      safety_risk: string;
      decision: string;
      confidence_adjusted: number;
    } | null;
    criticDecision?: string | null;
    guardianOutput?: {
      triage_level: string;
      reasoning: string;
      requires_doctor: boolean;
      ai_lock: boolean;
    } | null;
  };
}

// Global in-memory store (persists for the lifetime of the dev server)
declare global {
  // eslint-disable-next-line no-var
  var __doctorCases: DoctorCase[] | undefined;
}

function getCases(): DoctorCase[] {
  if (!global.__doctorCases) {
    global.__doctorCases = [];
  }
  return global.__doctorCases;
}

// GET — list all cases (optionally filter by ?status=pending)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");

  let cases = getCases();
  if (statusFilter) {
    cases = cases.filter((c) => c.status === statusFilter);
  }

  // Return newest first
  return NextResponse.json(
    cases.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );
}

// POST — submit a new Level-2 case for doctor review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientQuery, aiAssessment, pipeline, chatHistory } = body;

    if (!patientQuery || !aiAssessment) {
      return NextResponse.json(
        { error: "Missing required fields: patientQuery, aiAssessment" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newCase: DoctorCase = {
      id: `case_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      patientQuery,
      aiAssessment,
      chatHistory: Array.isArray(chatHistory) ? chatHistory : [],
      triageLevel: 2,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      pipeline: pipeline || undefined,
    };

    getCases().push(newCase);

    return NextResponse.json(newCase, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
