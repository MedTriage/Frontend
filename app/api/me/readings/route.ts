import { NextRequest } from "next/server";
import { proxy, readJson } from "@/lib/backend";

export async function GET(request: NextRequest) {
  return proxy(request, "/me/readings");
}

export async function POST(request: NextRequest) {
  return proxy(request, "/me/readings", { body: await readJson(request) });
}
