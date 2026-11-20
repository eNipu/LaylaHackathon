"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { connectPostHog, getIdentity, trackEvent } from "@/lib/analytics";
let landingTracked = false;
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    // Do not count jury dashboard visits as product traffic.
    if (pathname === "/metrics") return;
    getIdentity();
    if (!landingTracked) { landingTracked = true; trackEvent("landing_view"); }
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      void import("posthog-js").then(({ default: posthog }) => {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
          autocapture: false, capture_pageview: false, capture_pageleave: false,
          disable_session_recording: true, person_profiles: "identified_only",
          loaded: connectPostHog,
        });
      }).catch(() => {});
    }
  }, [pathname]);
  return children;
}
