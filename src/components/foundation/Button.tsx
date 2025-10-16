import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-br text-[var(--button-text-primary)] shadow-lg hover:shadow-xl button-primary',
        secondary:
          'bg-gradient-to-br border border-stroke text-[var(--button-text-secondary)] shadow-sm hover:shadow-md button-secondary',
        ghost:
          'bg-transparent text-text hover:bg-bg-elev/50 hover:text-text',
        danger:
          'bg-gradient-to-br from-[#FF4444] to-[#FF6666] text-[var(--button-text-primary)] hover:from-[#FF5555] hover:to-[#FF7777] active:from-[#FF3333] active:to-[#FF5555] shadow-lg hover:shadow-xl',
        success:
          'bg-gradient-to-br from-[#22C55E] to-[#4ADE80] text-[var(--button-text-primary)] hover:from-[#32D56E] hover:to-[#5AEE90] active:from-[#12B54E] active:to-[#3ACE70] shadow-lg hover:shadow-xl',
        outline:
          'border border-stroke bg-transparent text-text hover:bg-bg-elev hover:border-primary/30',
        default:
          'bg-bg-elev text-text hover:bg-bg border border-stroke',
      },
      size: {
        sm: 'h-9 px-4 text-xs',
        md: 'h-10 px-6 text-sm',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

