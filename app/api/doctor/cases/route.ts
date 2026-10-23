import { NextRequest } from "next/server";
import { proxy } from "@/lib/backend";

/* The review queue lives in the backend's database. Cases are created there when the
   Guardian returns level_2 — never by a browser — and only a signed-in doctor can list
   them: pending cases, plus the ones that doctor reviewed. */
export async function GET(request: NextRequest) {
  return proxy(request, "/doctor/cases");
}
