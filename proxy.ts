import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/backend";

/* ─── Signed-out visitors go to the login page before an app page is sent ───

   `useAccount` already does this in the browser, but only after the page has loaded and
   `/api/me` has answered, so a signed-out visitor saw the chat page for a moment first
   (owner's report, 2026-11-15). This does the same redirect on the server, to the same
   address (`/login?next=…`), for a request that carries no session cookie at all.

   It is not an access rule and decides nothing about a session: a cookie that is present
   is let through unread, good or not, and the backend alone says whether it is valid.
   `useAccount` stays, for the expired cookie and for the wrong role. Nothing is leaked by
   a page that does get through: every page here is a shell, and its data comes from
   `/api/*`, which the backend guards.

   The matcher is every page that calls `useAccount`. A new signed-in page belongs in it;
   left out, it still works, with the old flash. The pages opened from emailed links
   (`/verify-email`, `/reset-password`, `/invite`) are for signed-out people and must stay
   out. */
export function proxy(request: NextRequest) {
  if (request.cookies.get(SESSION_COOKIE)?.value) return NextResponse.next();
  const { pathname, search } = request.nextUrl;
  const login = new URL("/login", request.url);
  login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    "/chat/:path*",
    "/dashboard/:path*",
    "/doctor/:path*",
    "/onboarding/:path*",
    "/prescriptions/:path*",
    "/profile/:path*",
  ],
};
