import posthog from "posthog-js";
import { connectPostHog } from "@/lib/analytics";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (!key) {
  if (process.env.NODE_ENV === "development") {
    throw new Error("NEXT_PUBLIC_POSTHOG_KEY variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_KEY is configured");
  }
} else if (!host) {
  if (process.env.NODE_ENV === "development") {
    throw new Error("NEXT_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_HOST is configured");
  }
} else {
  posthog.init(key, {
    api_host: host,
    capture_exceptions: true,
    defaults: "2025-05-24",
    debug: process.env.NODE_ENV === "development",
  });
  connectPostHog(posthog);
}
