import { NextRequest, NextResponse } from "next/server";

/* ─── The thin layer between the browser and agents-core ───

   The browser holds an httpOnly session cookie it cannot read; these helpers turn it
   into a Bearer token for the backend. Every access rule — who may read a conversation,
   who may open a case — is enforced by the backend. This layer decides nothing, so a bug
   here can break a page but cannot widen what anyone is allowed to see. */

export const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";
export const SESSION_COOKIE = "mt_session";
// Matches the backend's absolute session cap; the backend's own expiry is what counts.
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export function sessionToken(request: NextRequest): string | undefined {
  return request.cookies.get(SESSION_COOKIE)?.value;
}

/** `remember: false` makes a browser-session cookie that ends when the browser closes. */
export function setSession(response: NextResponse, token: string, remember = true) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // Off on localhost, where there is no HTTPS; on anywhere else.
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    ...(remember ? { maxAge: SESSION_MAX_AGE } : {}),
  });
}

export function clearSession(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

/* SameSite=Lax already keeps the cookie off cross-site POSTs; this closes the rest. A
   request with no Origin header (not a browser) is let through — it cannot carry a
   victim's cookie in the first place. */
export function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

export function authHeader(request: NextRequest): Record<string, string> {
  const token = sessionToken(request);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function readJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

/** Forward to the backend with the caller's session. The backend's status and JSON body
 *  pass through unchanged, so its error messages reach the page as written. */
export async function proxy(
  request: NextRequest,
  path: string,
  init: { method?: string; body?: unknown } = {}
): Promise<NextResponse> {
  const method = init.method ?? request.method;
  if (method !== "GET" && !sameOrigin(request)) {
    return NextResponse.json({ detail: "Cross-site request refused." }, { status: 403 });
  }

  const token = sessionToken(request);
  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_URL}${path}`, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { detail: "The MedTriage service isn't responding. Check that the backend is running." },
      { status: 502 }
    );
  }

  const response =
    upstream.status === 204
      ? new NextResponse(null, { status: 204 })
      : NextResponse.json(await upstream.json().catch(() => ({})), { status: upstream.status });
  // A cookie the backend no longer accepts is dead weight; drop it so pages see a clean
  // signed-out state instead of failing every request.
  if (upstream.status === 401 && token) clearSession(response);
  return response;
}
