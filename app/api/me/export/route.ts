import { NextRequest, NextResponse } from "next/server";
import { proxy } from "@/lib/backend";

/** Everything the account holds, as a file the browser saves rather than displays. */
export async function GET(request: NextRequest) {
  const response = await proxy(request, "/me/export");
  if (!response.ok) return response;
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(await response.json(), null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="medtriage-export-${date}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
