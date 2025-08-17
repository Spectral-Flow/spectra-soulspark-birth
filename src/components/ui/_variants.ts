import { cva } from 'class-variance-authority';

export const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

export const sheetVariants = cva(
  'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
        right:
          'inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  }
);

export const cosmicButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 spectra-glow',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        cosmic:
          'bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 hover:scale-105',
        ethereal:
          'bg-card/50 backdrop-blur-sm border border-primary/30 text-foreground hover:border-primary/60 hover:bg-card/70 spectra-glow',
        memory:
          'bg-gradient-to-r from-memory-vivid to-memory-fading text-primary-foreground hover:from-memory-fading hover:to-memory-vivid transition-all duration-500',
        stardust:
          'bg-background/20 backdrop-blur-md border border-stardust/30 text-stardust hover:border-stardust/60 hover:bg-stardust/10 transition-all duration-300',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export const badgeVariants = cva('', {
  variants: {
    variant: {
      default: 'bg-muted text-muted-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const toggleVariants = cva('', {
  variants: {
    variant: {
      default: 'bg-transparent',
      outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
    },
    size: {
      default: 'h-10 px-3',
      sm: 'h-9 px-2.5',
      lg: 'h-11 px-5',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export const toastVariants = cva('', {
  variants: {
    variant: {
      default: 'bg-background text-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const navigationMenuTriggerStyle = cva('');

export const alertVariants = cva('');

export const sidebarMenuButtonVariants = cva('');
