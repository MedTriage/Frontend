import { NextRequest } from "next/server";
import { proxy, readJson } from "@/lib/backend";

type Params = { params: Promise<{ id: string }> };

/** One case: transcript, the AI's answer, and the patient background it was given.
 *  The backend logs every open. */
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxy(request, `/doctor/cases/${encodeURIComponent(id)}`);
}

/** Approve or reject, with notes. A case can be decided once. */
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxy(request, `/doctor/cases/${encodeURIComponent(id)}`, { body: await readJson(request) });
}
