import { NextRequest, NextResponse } from "next/server";
import type { DoctorCase } from "../route";

function getCases(): DoctorCase[] {
  if (!global.__doctorCases) {
    global.__doctorCases = [];
  }
  return global.__doctorCases;
}

// PATCH — update a case (verify / reject / add notes)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, doctorNotes } = body;

    const cases = getCases();
    const caseIndex = cases.findIndex((c) => c.id === id);

    if (caseIndex === -1) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    if (status && !["pending", "verified", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: pending, verified, rejected" },
        { status: 400 }
      );
    }

    const updated = {
      ...cases[caseIndex],
      ...(status && { status }),
      ...(doctorNotes !== undefined && { doctorNotes }),
      updatedAt: new Date().toISOString(),
    };

    cases[caseIndex] = updated;

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
