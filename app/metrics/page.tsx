import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { MetricsDashboard } from "@/components/metrics-dashboard";
export const metadata: Metadata = { title: "Live metrics", robots: { index: false, follow: false } };
export default function MetricsPage() {
  return <><SiteHeader metrics /><main id="main" className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14"><MetricsDashboard /></main></>;
}
