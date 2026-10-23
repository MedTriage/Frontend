import { NextRequest, NextResponse } from "next/server";
import { proxy } from "@/lib/backend";

const ACTIONS = new Set(["accept", "dismiss"]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  const { id, action } = await params;
  if (!ACTIONS.has(action) || !/^\d+$/.test(id)) {
    return NextResponse.json({ detail: "No such suggestion." }, { status: 404 });
  }
  return proxy(request, `/me/suggestions/${id}/${action}`);
}
