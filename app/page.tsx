import { Zap, ShieldCheck, Gift } from "lucide-react";
import { Hero } from "@/components/hero";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site-config";

const proofIcons = [Zap, ShieldCheck, Gift];

export default function Home() {
  return <div className="hero-atmosphere">
    <SiteHeader />
    <main id="main"><Hero /></main>

    <section aria-label="Why it works" className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-8 sm:pb-20">
      <ul className="grid overflow-hidden rounded-[1.75rem] border border-border bg-surface/60 sm:grid-cols-3">
        {site.proof.map((item, i) => {
          const Icon = proofIcons[i % proofIcons.length];
          return <li key={item.title} className="flex gap-4 border-border p-5 not-last:border-b sm:p-7 sm:not-last:border-b-0 sm:not-last:border-r">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-foreground"><Icon size={18} aria-hidden /></span>
            <div className="min-w-0">
              <h2 className="font-display text-2xl leading-tight">{item.title}</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
            </div>
          </li>;
        })}
      </ul>
    </section>

    <footer className="safe-bottom mx-auto flex max-w-6xl flex-wrap justify-between gap-3 border-t border-border px-4 py-5 text-xs text-muted-foreground sm:px-8">
      <span>{site.footer.left}</span><span>{site.footer.right}</span>
    </footer>
  </div>;
}
