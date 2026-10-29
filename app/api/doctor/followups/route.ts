import { NextRequest } from "next/server";
import { proxy } from "@/lib/backend";

/** Patients who went silent after a case this doctor approved. */
export async function GET(request: NextRequest) {
  return proxy(request, "/doctor/followups");
}
