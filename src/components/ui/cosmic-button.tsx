import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import cosmicButtonVariants from "./cosmicButtonVariants"

export interface CosmicButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof cosmicButtonVariants> {
  asChild?: boolean;
}

const CosmicButton = React.forwardRef<HTMLButtonElement, CosmicButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(cosmicButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
CosmicButton.displayName = "CosmicButton";

export { CosmicButton };