import { NextRequest } from "next/server";
import { proxy, readJson } from "@/lib/backend";

export async function POST(request: NextRequest) {
  return proxy(request, "/auth/password/forgot", { body: await readJson(request) });
}
