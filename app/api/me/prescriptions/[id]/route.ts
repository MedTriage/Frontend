import { NextRequest } from "next/server";
import { proxy } from "@/lib/backend";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxy(request, `/me/prescriptions/${encodeURIComponent(id)}`);
}
