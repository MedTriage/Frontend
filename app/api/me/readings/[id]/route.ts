import { NextRequest, NextResponse } from "next/server";
import { proxy } from "@/lib/backend";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ detail: "No such reading." }, { status: 404 });
  }
  return proxy(request, `/me/readings/${id}`);
}
