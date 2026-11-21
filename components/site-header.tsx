import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site-config";

export function SiteHeader({ metrics = false }: { metrics?: boolean }) {
  return <header className="safe-top sticky top-0 z-40 px-3 sm:px-6">
    <div className="mx-auto mt-1 flex w-full max-w-6xl items-center justify-between gap-3 rounded-full border border-border/80 bg-background/70 py-1 pl-2 pr-1.5 shadow-[0_8px_30px_-18px_rgb(10_10_11/0.35)] backdrop-blur-xl backdrop-saturate-150">
      <Link href="/" aria-label={`${site.brand.name} home`} className="inline-flex min-h-11 items-center gap-2 pl-1 text-lg font-semibold tracking-tight">
        <span className="flex size-8 items-center justify-center rounded-full bg-foreground font-display text-lg italic text-accent">{site.brand.mark}</span>
        {site.brand.name}
      </Link>
      <div className="flex items-center gap-1.5">
        <span className="hidden items-center gap-2 rounded-full border border-border bg-surface/80 px-2.5 py-1 text-xs font-medium text-muted-foreground min-[340px]:inline-flex">
          <span aria-hidden className="status-dot size-1.5 rounded-full bg-emerald-500" />{site.status}
        </span>
        <Link href={metrics ? "/" : "/metrics"} className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2.5 text-sm text-muted-foreground sm:px-3 transition-colors hover:bg-muted hover:text-foreground">
          {metrics ? "Try the product" : "Live metrics"}<ArrowUpRight size={15} aria-hidden />
        </Link>
      </div>
    </div>
  </header>;
}
