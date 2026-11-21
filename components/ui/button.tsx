import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-[background-color,border-color,color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-ring disabled:pointer-events-none disabled:opacity-45",
  { variants: { variant: {
    default: "bg-foreground text-background hover:bg-neutral-800",
    outline: "border border-border bg-surface/70 backdrop-blur hover:border-foreground/25 hover:bg-surface",
    accent: "bg-foreground text-background shadow-[0_10px_30px_-12px_var(--accent-glow),inset_0_1px_0_rgb(255_255_255/0.12)] hover:shadow-[0_14px_40px_-10px_var(--accent-glow),inset_0_1px_0_rgb(255_255_255/0.12)]",
    chip: "min-h-9 rounded-full border border-dashed border-foreground/20 bg-accent-soft px-3.5 text-xs text-foreground hover:border-foreground/40",
  } }, defaultVariants: { variant: "default" } },
);
function Button({ className, variant, asChild = false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, className }))} {...props} />;
}
export { Button, buttonVariants };
