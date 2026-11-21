"use client";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";

/** Loads only the DOM animation feature bundle (~15kb) and honors prefers-reduced-motion. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation} strict>
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 420, damping: 32 }}>{children}</MotionConfig>
  </LazyMotion>;
}

/** Shared entrance: fade, rise and de-blur. Use with a staggering parent. */
export const rise = {
  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
} as const;
export const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } } as const;
