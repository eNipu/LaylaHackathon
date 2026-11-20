"use client";
import { useEffect, useState } from "react";
import { Activity, ArrowUpRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metrics } from "@/lib/event-schema";
function relative(timestamp: string, now: number) {
  const seconds = Math.max(0, Math.floor((now - Date.parse(timestamp)) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState("");
  const [now, setNow] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let fetching = false;
    async function refresh() {
      if (fetching) return;
      fetching = true;
      try {
        const response = await fetch("/api/metrics", { cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]) });
        if (!response.ok) throw new Error("Metrics unavailable");
        const data = await response.json() as Metrics;
        if (!controller.signal.aborted) { setMetrics(data); setNow(Date.now()); setError(""); }
      } catch {
        if (!controller.signal.aborted) setError("Storage is unavailable. Check DATABASE_URL. Any displayed numbers are from the last successful refresh.");
      } finally { fetching = false; }
    }
    void refresh();
    const timer = setInterval(() => { setNow(Date.now()); void refresh(); }, 10_000);
    return () => { controller.abort(); clearInterval(timer); };
  }, [refreshKey]);
  const cards = [
    { label: "Unique visitors", value: metrics?.visitors, note: "Distinct anonymous browser IDs" },
    { label: "Unique active users", value: metrics?.active, note: "Completed the core action", featured: true },
    { label: "Activation rate", value: metrics ? `${metrics.activation}%` : undefined, note: "Active users ÷ unique visitors" },
    { label: "Viral / share referrals", value: metrics?.referrals, note: "Unique visitors arriving via ?ref=" },
  ];
  return <>
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow mb-3 text-muted-foreground">Build & Launch / All-time overview</p><h1 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Proof, not promises.</h1><p className="mt-3 text-sm text-muted-foreground">Real activity. Deduplicated users. A live view of what is working.</p></div><Button variant="outline" onClick={() => setRefreshKey(n => n + 1)}><RefreshCw size={15} /> Refresh</Button></div>
    <div role="status" className="mb-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span className={`size-2 rounded-full ${error ? "bg-amber-600" : metrics ? "bg-lime-600" : "bg-neutral-400"}`} />{error ? "Connection needs attention" : metrics ? "Connected · refreshes every 10 seconds" : "Connecting to event storage…"}{metrics && <span> / Updated {new Date(metrics.updatedAt).toLocaleTimeString()}</span>}</div>
    {error && <p role="alert" className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">{error}</p>}
    <section aria-label="Key metrics" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{cards.map(card => <div key={card.label} className={`min-w-0 rounded-xl border p-5 ${card.featured ? "border-foreground bg-foreground text-background" : "border-border bg-white"}`}><div className="flex items-start justify-between gap-2"><h2 className="text-sm">{card.label}</h2>{card.featured && <span className="rounded bg-primary px-2 py-1 font-mono text-[10px] font-bold text-foreground">2×</span>}</div><p className={`metric-number my-6 text-6xl ${card.featured ? "text-primary" : ""}`}>{card.value ?? "–"}</p><p className={`text-xs ${card.featured ? "text-neutral-300" : "text-muted-foreground"}`}>{card.note}</p></div>)}</section>
    <div className="mt-7 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <section className="min-w-0 rounded-xl border border-border bg-white p-5 sm:p-6"><div className="mb-6 flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">Channel / creative breakdown</h2><ArrowUpRight size={18} className="text-muted-foreground" /></div>
        <div className="grid grid-cols-[minmax(0,1fr)_60px_50px] gap-2 border-b border-border pb-3 text-xs text-muted-foreground"><span>Source / creative</span><span className="text-right">Visitors</span><span className="text-right">Active</span></div>
        {metrics?.channels.length ? metrics.channels.map((channel, index) => <div key={index} className="grid grid-cols-[minmax(0,1fr)_60px_50px] items-center gap-2 border-b border-border py-4 text-sm"><div className="min-w-0 break-anywhere"><p className="font-medium">{channel.source}</p><p className="mt-1 text-xs text-muted-foreground">{channel.creative}</p></div><span className="text-right tabular-nums">{channel.visitors}</span><span className="text-right tabular-nums">{channel.active}</span></div>) : <p className="py-10 text-sm leading-6 text-muted-foreground">{metrics ? "No visitors yet. Launch a tagged link to start measuring." : "Waiting for event storage."}</p>}
        <p className="mt-5 text-xs leading-5 text-muted-foreground">First-touch attribution · utm_source + utm_content · top 50 combinations</p>
      </section>
      <section className="min-w-0 rounded-xl border border-border bg-muted p-5 sm:p-6"><div className="mb-6 flex items-center justify-between gap-3"><h2 className="font-semibold">Live recent usage</h2><Activity size={17} /></div><p className="mb-4 text-xs text-muted-foreground">Last 10 successful completions</p>
        {metrics?.recent.length ? <ul>{metrics.recent.map((item, index) => <li key={`${item.id}-${item.timestamp}-${index}`} className="flex items-center justify-between gap-3 border-b border-border py-3"><div className="min-w-0"><p className="font-mono text-xs">Visitor {item.id}</p><p className="mt-1 text-xs text-muted-foreground">Completed a launch plan</p></div><time dateTime={item.timestamp} className="shrink-0 text-xs text-muted-foreground">{relative(item.timestamp, now)}</time></li>)}</ul> : <p className="py-6 text-sm leading-6 text-muted-foreground">{metrics ? "The first successful result will appear here. Saved demo examples do not count." : "Waiting for event storage."}</p>}
        <p className="mt-6 text-xs text-muted-foreground">{metrics ? `${metrics.shares} unique visitors clicked share.` : "Share activity will appear once connected."}</p>
      </section>
    </div>
    <p className="mt-6 max-w-3xl text-xs leading-6 text-muted-foreground">Measurement note: these are anonymous browser estimates, not verified people. Clearing storage or switching devices creates a new identity. Events are client-reported; bots and deliberate spoofing are not filtered. Demo fallbacks are excluded. No prompts or results are stored in analytics.</p>
  </>;
}
