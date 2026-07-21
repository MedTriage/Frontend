import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

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
  const body = await request.json();
  const { conversation_id, text, chat_history } = body;

  if (!text || typeof text !== "string") {
    return Response.json({ error: "Missing required field: text" }, { status: 400 });
  }
  if (!conversation_id || typeof conversation_id !== "string") {
    return Response.json(
      { error: "Missing required field: conversation_id" },
      { status: 400 }
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_URL}/process/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify({
        conversation_id,
        text,
        chat_history: chat_history || [],
      }),
    });
  } catch {
    return Response.json({ error: "Backend service unavailable" }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return Response.json(
      { error: "Backend service unavailable", details: await upstream.text().catch(() => "") },
      { status: 502 }
    );
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

            const guardian = event.guardian_output as { triage_level?: string } | null;
            const guardianLevel = guardian?.triage_level;
            send({
              type: "done",
              title: event.title,
              intent_type: event.intent_type,
              intent_confidence: event.intent_confidence,
              rag_output: event.rag_output || null,
              kgrag_output: event.kgrag_output || null,
              mcp_output: event.mcp_output || null,
              orchestrator_output: event.orchestrator_output || null,
              orchestrator_decision: event.orchestrator_decision || null,
              orchestrator_response: event.orchestrator_response || null,
              guardian_output: event.guardian_output || null,
              is_emergency: event.is_emergency ?? false,
              // Same rule as /api/triage: a missing Guardian level fails safe to
              // physician review, never to level 1.
              triage_level: guardianLevel
                ? (parseInt(String(guardianLevel).replace("level_", ""), 10) as 1 | 2 | 3)
                : 2,
              explanation: event.explanation || null,
            });
          }
        }
      } catch (error) {
        send({ type: "error", message: String(error) });
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
