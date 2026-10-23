import { NextRequest } from "next/server";
import { clearSession, proxy, readJson } from "@/lib/backend";

export async function GET(request: NextRequest) {
  return proxy(request, "/me");
}

/** Delete the account. Needs the password, and ends the session on success. */
export async function DELETE(request: NextRequest) {
  const response = await proxy(request, "/me", { body: await readJson(request) });
  if (response.status === 204) clearSession(response);
  return response;
}
