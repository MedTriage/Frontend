import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

// Emergency keywords — if the intent is clinical AND these appear, escalate to Level 3
const EMERGENCY_KEYWORDS = [
  "chest pain",
  "can't breathe",
  "cannot breathe",
  "difficulty breathing",
  "stroke",
  "unconscious",
  "bleeding heavily",
  "heart attack",
  "seizure",
  "anaphylaxis",
  "choking",
  "overdose",
  "suicidal",
  "severe bleeding",
  "not breathing",
  "collapsed",
];

/**
 * Classification logic based on the backend's intent_type:
 *   - "chitchat"        → Level 1 (companion responds directly)
 *   - "clinical_query"  → Level 2 (doctor verification required)
 *                          UNLESS emergency keywords detected → Level 3
 */
function classifyLevel(intentType: string, userInput: string): 1 | 2 | 3 {
  const intent = intentType.toLowerCase().trim();

  // Chitchat → Level 1 (direct AI response)
  if (intent === "chitchat" || intent === "chit-chat" || intent === "chit_chat") {
    return 1;
  }

  // Clinical query → check for emergency keywords first
  const lower = userInput.toLowerCase();
  const isEmergency = EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));

  if (isEmergency) return 3;

  // All other clinical queries → Level 2 (doctor verification)
  return 2;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing required field: text" },
        { status: 400 }
      );
    }

    // Call the FastAPI backend
    const backendResponse = await fetch(`${BACKEND_URL}/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error("Backend error:", backendResponse.status, errorText);
      return NextResponse.json(
        { error: "Backend service unavailable", details: errorText },
        { status: 502 }
      );
    }

    const data = await backendResponse.json();

    // Determine triage level from intent_type + user input for emergency detection
    const level = classifyLevel(data.intent_type || "", text);

    return NextResponse.json({
      user_input: data.user_input,
      intent_type: data.intent_type,
      intent_confidence: data.intent_confidence,
      companion_output: data.companion_output,
      rag_output: data.rag_output || null,
      triage_level: level,
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
