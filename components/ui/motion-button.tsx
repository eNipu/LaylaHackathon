"use client";
import * as React from "react";
import { m, type HTMLMotionProps } from "framer-motion";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Button with tactile hover-lift and press feedback. */
export function MotionButton({ className, variant, ...props }: HTMLMotionProps<"button"> & VariantProps<typeof buttonVariants>) {
  return <m.button
    data-slot="button"
    whileHover={props.disabled ? undefined : { y: -1 }}
    whileTap={props.disabled ? undefined : { scale: 0.98 }}
    className={cn(buttonVariants({ variant }), className)}
    {...props}
  />;
}
