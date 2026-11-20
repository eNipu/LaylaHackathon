import { Generator } from "@/components/generator";
import { SiteHeader } from "@/components/site-header";
export default function Home() {
  return <><SiteHeader /><main id="main" className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-8 sm:py-20 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
    <section className="min-w-0">
      <p className="eyebrow mb-6 flex items-center gap-2 text-muted-foreground"><span className="size-2 rounded-full bg-lime-600" /> Small idea. Real momentum.</p>
      <h1 className="max-w-lg text-5xl font-semibold leading-[1.03] tracking-[-0.065em] sm:text-6xl">Less planning.<br />More <span className="bg-primary px-1">first users.</span></h1>
      <p className="mt-7 max-w-sm text-lg leading-relaxed text-muted-foreground">Turn that thing you want to build into a practical plan to reach the people who need it.</p>
      <div className="mt-10 border-t border-border pt-5"><p className="eyebrow text-muted-foreground">Built for the first small step</p><p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">One audience. One useful result. One way to get it into someone’s hands.</p></div>
      <p className="mt-8 font-mono text-xs text-muted-foreground">IDEA → VALUE → FIRST USER</p>
    </section>
    <Generator />
  </main><footer className="safe-bottom mx-auto flex max-w-6xl flex-wrap justify-between gap-3 border-t border-border px-5 py-5 text-xs text-muted-foreground sm:px-8"><span>Layla / Build & Launch</span><span>Useful beats unfinished.</span></footer></>;
}
