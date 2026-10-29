import { NextRequest } from "next/server";
import { proxy } from "@/lib/backend";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxy(request, `/conversations/${encodeURIComponent(id)}`);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxy(request, `/conversations/${encodeURIComponent(id)}`);
}
