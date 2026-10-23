import { NextRequest } from "next/server";
import { proxy, readJson } from "@/lib/backend";

export async function GET(request: NextRequest) {
  return proxy(request, "/me/profile");
}

export async function PUT(request: NextRequest) {
  return proxy(request, "/me/profile", { body: await readJson(request) });
}
