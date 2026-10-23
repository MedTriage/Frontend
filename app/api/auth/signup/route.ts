import { NextRequest } from "next/server";
import { proxy, readJson } from "@/lib/backend";

export async function POST(request: NextRequest) {
  return proxy(request, "/auth/signup", { body: await readJson(request) });
}
