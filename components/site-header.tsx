import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export function SiteHeader({ metrics = false }: { metrics?: boolean }) {
  return <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 border-b border-border px-5 py-5 sm:px-8">
    <Link href="/" aria-label="Layla home" className="inline-flex min-h-11 items-center gap-2 text-xl font-bold tracking-tight"><span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-lg text-primary">l.</span> layla<span className="text-muted-foreground">/</span></Link>
    <Link href={metrics ? "/" : "/metrics"} className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground">{metrics ? "Try the product" : "Live metrics"}<ArrowUpRight size={16} /></Link>
  </header>;
}
