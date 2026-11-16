import { NextRequest, NextResponse } from "next/server";
import { clearSession, proxy, readJson, sessionToken } from "@/lib/backend";

/* A request with no session cookie is answered here, as the backend would answer it: 401.
   This is not an access rule of our own. Nobody without a token can be an account, and
   asking the backend only made the answer depend on it being up: while it was down a
   signed-out visitor got a 502, which no page reads as "signed out", so "Start a
   consultation" opened the chat page instead of the login page. A request that does carry
   a cookie still goes to the backend, which alone decides whether it is good. */
export async function GET(request: NextRequest) {
  if (!sessionToken(request)) {
    return NextResponse.json({ detail: "Not signed in." }, { status: 401 });
  }
  return proxy(request, "/me");
}

/** Delete the account. Needs the password, and ends the session on success. */
export async function DELETE(request: NextRequest) {
  const response = await proxy(request, "/me", { body: await readJson(request) });
  if (response.status === 204) clearSession(response);
  return response;
}
