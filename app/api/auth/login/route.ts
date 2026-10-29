import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL, readJson, setSession } from "@/lib/backend";

/* The one route that sees the raw session token. It goes into an httpOnly cookie and
   never into the response body, so no script on any page can read it. */
export async function POST(request: NextRequest) {
  const body = (await readJson(request)) as
    | { email?: string; password?: string; remember?: boolean }
    | undefined;

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body?.email, password: body?.password }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { detail: "The MedTriage service isn't responding. Check that the backend is running." },
      { status: 502 }
    );
  }

  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) return NextResponse.json(data, { status: upstream.status });

  const response = NextResponse.json({ user: data.user });
  setSession(response, data.token, body?.remember !== false);
  return response;
}
