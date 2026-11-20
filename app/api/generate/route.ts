import { SeverityNumber } from "@opentelemetry/api-logs";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { posthogLogger, posthogLoggerProvider, posthogSpanProcessor } from "@/instrumentation";
import { DEMO_RESULT, type GenerationChunk } from "@/lib/generation";
import { isSameOrigin } from "@/lib/request";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
    const raw = await request.text();
    if (raw.length > 12000) return Response.json({ error: "Please use a shorter idea." }, { status: 413 });
    let body;
    try { body = JSON.parse(raw); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
    if (typeof body?.prompt !== "string" || !body.prompt.trim() || body.prompt.length > 2000) {
      return Response.json({ error: "Enter an idea between 1 and 2,000 characters." }, { status: 400 });
    }
    posthogLogger?.emit({
      body: "launch_plan_request_accepted",
      severityNumber: SeverityNumber.INFO,
      attributes: { endpoint: "/api/generate" },
    });
    const signal = AbortSignal.any([request.signal, AbortSignal.timeout(20_000)]);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (chunk: GenerationChunk) => controller.enqueue(encoder.encode(JSON.stringify(chunk) + "\n"));
        try {
          if (!process.env.ANTHROPIC_API_KEY) {
            posthogLogger?.emit({
              body: "launch_plan_fallback_served",
              severityNumber: SeverityNumber.WARN,
              attributes: { endpoint: "/api/generate", reason: "provider_unconfigured" },
            });
            send({ type: "fallback", text: DEMO_RESULT });
            return;
          }
          const result = streamText({
            model: anthropic(process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6"),
            messages: [
              {
                role: "system",
                content: "Turn an idea into a practical four-step first-user launch plan. Focus on one audience, immediate value without login, one distribution channel, and measuring unique successful users. Stay under 220 words. Use plain text, not markdown tables.",
                providerOptions: { anthropic: { cacheControl: { type: "ephemeral" } } },
              },
              { role: "user", content: body.prompt.trim() },
            ],
            maxOutputTokens: 600,
            maxRetries: 0,
            abortSignal: signal,
            runtimeContext: {
              sessionId: `process-${process.pid}`,
              traceName: "launch_plan_generation",
            },
            telemetry: {
              functionId: "launch_plan_generation",
              includeRuntimeContext: { sessionId: true, traceName: true },
            },
          });
          let hasText = false;
          let finished = false;
          for await (const part of result.fullStream) {
            if (part.type === "error") throw part.error;
            if (part.type === "abort") throw new Error("Generation interrupted.");
            if (part.type === "text-delta") { hasText = true; send({ type: "text", text: part.text }); }
            if (part.type === "finish") {
              if (part.finishReason !== "stop") throw new Error("Generation incomplete.");
              finished = true;
            }
          }
          if (!hasText || !finished) throw new Error("No complete result.");
          posthogLogger?.emit({
            body: "launch_plan_generated",
            severityNumber: SeverityNumber.INFO,
            attributes: { endpoint: "/api/generate", mode: "live" },
          });
          send({ type: "done", mode: "live" });
        } catch {
          if (!request.signal.aborted) {
            posthogLogger?.emit({
              body: "launch_plan_fallback_served",
              severityNumber: SeverityNumber.WARN,
              attributes: { endpoint: "/api/generate", reason: "generation_failed" },
            });
            send({ type: "fallback", text: DEMO_RESULT });
          }
        } finally {
          await Promise.race([
            Promise.all([
              posthogSpanProcessor?.forceFlush().catch(() => {}),
              posthogLoggerProvider?.forceFlush().catch(() => {}),
            ]),
            new Promise<void>((resolve) => setTimeout(resolve, 2_000)),
          ]);
          controller.close();
        }
      },
    });
    return new Response(stream, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store", "X-Accel-Buffering": "no" } });
  } catch {
    posthogLogger?.emit({
      body: "launch_plan_request_unavailable",
      severityNumber: SeverityNumber.WARN,
      attributes: { endpoint: "/api/generate" },
    });
    return Response.json({ error: "Generation is temporarily unavailable. Please try the example." }, { status: 503 });
  }
}
