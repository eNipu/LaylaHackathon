"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getIdentity, trackEvent } from "@/lib/analytics";
let landingTracked = false;
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    // Do not count jury dashboard visits as product traffic.
    if (pathname === "/metrics") return;
    getIdentity();
    if (!landingTracked) { landingTracked = true; trackEvent("landing_view"); }
  }, [pathname]);
  return children;
}
