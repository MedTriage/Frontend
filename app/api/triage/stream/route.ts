import { NextRequest } from "next/server";
import { BACKEND_URL, authHeader, readJson, sameOrigin } from "@/lib/backend";
import { clientPayload } from "@/app/lib/triage-payload";

// Streaming keeps bytes moving, which is what stops a platform from killing a request
// that is still working — but the pipeline can still outlast a serverless ceiling, so
// the cap stays.
export const maxDuration = 300;

/*
  Server-sent progress for a triage turn.

  This is a TRANSFORM, not a passthrough. The terminal `done` event is rewritten into
  exactly the shape /api/triage returns, because the triage level must be derived on the
  server: the Guardian is the only component allowed to assign it, and a client-side
  guess could contradict a level the backend locked. Progress events are forwarded
  unchanged — they are already anonymous by construction.
*/
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) {
    return Response.json({ detail: "Cross-site request refused." }, { status: 403 });
  }
  const body = (await readJson(request)) as
    | { conversation_id?: unknown; text?: unknown; mode?: unknown }
    | undefined;

  if (!body?.text || typeof body.text !== "string") {
    return Response.json({ detail: "Missing required field: text" }, { status: 400 });
  }
  // The server issues conversation ids and supplies the history itself; see /api/triage.
  const conversation_id = typeof body.conversation_id === "string" ? body.conversation_id : undefined;
  const mode = body.mode === "child" ? "child" : "triage";

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_URL}/process/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream", ...authHeader(request) },
      body: JSON.stringify({ conversation_id, text: body.text, mode }),
    });
  } catch {
    return Response.json(
      { detail: "The MedTriage service isn't responding. Check that the backend is running." },
      { status: 502 }
    );
  }

  // Refusals (signed out, unverified, locked, busy, over the limit) happen before the
  // stream opens, so they pass through with their real status and the backend's wording.
  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.json().catch(() => ({}));
    return Response.json(detail, { status: upstream.ok ? 502 : upstream.status });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = "";

      const send = (payload: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));

      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE frames are separated by a blank line; a chunk may split one in half.
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";

          for (const frame of frames) {
            const line = frame.split("\n").find((l) => l.startsWith("data: "));
            if (!line) continue;

            let event: Record<string, unknown>;
            try {
              event = JSON.parse(line.slice(6));
            } catch {
              continue;
            }

            if (event.type !== "done") {
              send(event);
              continue;
            }

            // Same shape as /api/triage, including its fail-safe: a missing Guardian
            // level becomes physician review, never level 1 (child mode excepted).
            send({ type: "done", ...clientPayload(event) });
          }
        }
      } catch {
        send({ type: "error", message: "The connection to the triage service dropped." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
