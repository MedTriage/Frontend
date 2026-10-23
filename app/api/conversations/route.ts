import { NextRequest } from "next/server";
import { proxy } from "@/lib/backend";

export async function GET(request: NextRequest) {
  return proxy(request, "/conversations");
}
