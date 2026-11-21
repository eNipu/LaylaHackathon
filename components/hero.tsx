"use client";
import { m } from "framer-motion";
import { Generator } from "@/components/generator";
import { rise, stagger } from "@/components/motion-provider";
import { site } from "@/lib/site-config";

const { hero } = site;

export function Hero() {
  return <m.div
    variants={stagger} initial="hidden" animate="show"
    className="mx-auto grid w-full max-w-6xl gap-5 px-4 pb-10 pt-5 sm:gap-8 sm:px-8 sm:pt-12 lg:grid-cols-[1fr_1.02fr] lg:items-center lg:gap-16 lg:pb-20 lg:pt-16"
  >
    <div className="min-w-0">
      <m.p variants={rise} className="eyebrow mb-3 flex items-center gap-2 text-muted-foreground sm:mb-6">
        <span aria-hidden className="h-px w-6 bg-accent" />{hero.eyebrow}
      </m.p>
      <m.h1 variants={rise} className="max-w-xl font-display text-[2.75rem] font-normal leading-[0.95] tracking-[-0.02em] text-balance sm:text-6xl lg:text-[5.25rem]">
        {hero.headline.lead}<br />
        <em className="accent-highlight italic">{hero.headline.highlight}</em>
      </m.h1>
      <m.p variants={rise} className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground text-pretty sm:mt-6 sm:text-lg">
        {hero.subhead}
      </m.p>
    </div>
    <Generator />
  </m.div>;
}
