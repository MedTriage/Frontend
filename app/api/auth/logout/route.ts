import { NextRequest, NextResponse } from "next/server";
import { clearSession, proxy } from "@/lib/backend";

export async function POST(request: NextRequest) {
  // Revoke server-side, then drop the cookie whatever the backend said: a sign-out the
  // browser does not honour is worse than one the server already forgot.
  await proxy(request, "/auth/logout");
  const response = new NextResponse(null, { status: 204 });
  clearSession(response);
  return response;
}
