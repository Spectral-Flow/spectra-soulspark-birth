import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cosmicButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 spectra-glow",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        cosmic: "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 hover:scale-105",
        ethereal: "bg-card/50 backdrop-blur-sm border border-primary/30 text-foreground hover:border-primary/60 hover:bg-card/70 spectra-glow",
        memory: "bg-gradient-to-r from-memory-vivid to-memory-fading text-primary-foreground hover:from-memory-fading hover:to-memory-vivid transition-all duration-500",
        stardust: "bg-background/20 backdrop-blur-md border border-stardust/30 text-stardust hover:border-stardust/60 hover:bg-stardust/10 transition-all duration-300"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

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

export { CosmicButton, cosmicButtonVariants };