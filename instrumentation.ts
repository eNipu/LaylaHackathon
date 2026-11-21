import { OpenTelemetry } from "@ai-sdk/otel";
import { PostHogSpanProcessor } from "@posthog/ai/otel";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { registerTelemetry } from "ai";

const token = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const missingPostHogVariable = !token ? "NEXT_PUBLIC_POSTHOG_KEY" : !host ? "NEXT_PUBLIC_POSTHOG_HOST" : undefined;

const resource = resourceFromAttributes({ "service.name": "layla-launch" });

export const posthogSpanProcessor = token && host
  ? new PostHogSpanProcessor({ projectToken: token, host, privacyMode: false })
  : undefined;

export const posthogLoggerProvider = token && host
  ? new LoggerProvider({
    resource,
    processors: [
      new BatchLogRecordProcessor({
        exporter: new OTLPLogExporter({
          url: new URL("/i/v1/logs", host).toString(),
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }),
      }),
    ],
  })
  : undefined;

// This dedicated logger prevents existing application logs from being exported implicitly.
export const posthogLogger = posthogLoggerProvider?.getLogger("layla-launch-posthog");

if (posthogSpanProcessor) {
  const sdk = new NodeSDK({
    resource,
    spanProcessors: [posthogSpanProcessor],
  });
  sdk.start();
  registerTelemetry(new OpenTelemetry({
    enrichSpan: ({ runtimeContext }) => ({
      "$ai_session_id": typeof runtimeContext?.sessionId === "string" ? runtimeContext.sessionId : undefined,
      "$ai_trace_name": typeof runtimeContext?.traceName === "string" ? runtimeContext.traceName : undefined,
    }),
  }));
} else if (process.env.NODE_ENV !== "production") {
  console.warn(`${missingPostHogVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingPostHogVariable} is configured`);
}

export function register() {}
